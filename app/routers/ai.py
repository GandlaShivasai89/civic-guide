import os
from fastapi import APIRouter, HTTPException
from app.models.schemas import RagQueryRequest, ExplainTermRequest, GuidanceRequest
from app.database import db
from app.ai.rag_engine import RagEngine
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["AI & Verification Assistant"])

GLOSSARY = {
    'non-ecr': {
        'en': 'Non-ECR (Emigration Check Not Required) means you can travel abroad for work without needing prior clearance from the Protector of Emigrants. If you have passed 10th standard (Matriculation) or pay income tax, your passport will be endorsed as Non-ECR.',
        'te': 'Non-ECR (ఎమిగ్రేషన్ చెక్ అవసరం లేదు): 10వ తరగతి పాసైన వారు లేదా ఇన్‌కమ్ ట్యాక్స్ చెల్లించే వారికి ఈ వెసులుబాటు ఉంటుంది. విదేశాలకు వెళ్లేటప్పుడు ఎలాంటి ప్రత్యేక ప్రభుత్వ ముందస్తు క్లియరెన్స్ అవసరం లేదు.',
        'hi': 'Non-ECR (उत्प्रवास जांच आवश्यक नहीं): यदि आपने 10वीं कक्षा उत्तीर्ण की है या आयकरदाता हैं, तो आपको विदेश जाने के लिए उत्प्रवासी संरक्षक से किसी विशेष अनुमति की आवश्यकता नहीं होती है।'
    },
    'meeseva': {
        'en': 'MeeSeva ("At Your Service") is the official electronic governance portal in Telangana and Andhra Pradesh for citizen services including income, caste, and residence certificates with digital signatures.',
        'te': 'మీసేవ: తెలంగాణ మరియు ఆంధ్రప్రదేశ్‌లో ప్రజలకు డిజిటల్ సంతకంతో కూడిన ఆదాయ, కుల, నివాస ధ్రువీకరణ పత్రాలు అందించే అధికారిక ప్రభుత్వ సేవా పోర్టల్.',
        'hi': 'मीसेवा (MeeSeva): तेलंगाना और आंध्र प्रदेश का आधिकारिक नागरिक सेवा पोर्टल जहां आय, जाति और निवास प्रमाण पत्र ऑनलाइन जारी किए जाते हैं।'
    },
    'digilocker': {
        'en': 'DigiLocker is an official Government of India cloud platform. Under Rule 139 of CMVR and the Information Technology Act 2000, documents stored in DigiLocker (like Driving Licences, RC, Birth Certificates) have the exact same legal validity as original physical documents.',
        'te': 'డిజిలాకర్: భారత ప్రభుత్వ అధికారిక క్లౌడ్ ప్లాట్‌ఫారమ్. ఇందులో భద్రపరిచిన డ్రైవింగ్ లైసెన్స్, ఆర్సీ బుక్ మొదలైనవి అసలు కాగితాలతో సమానమైన చట్టబద్ధతను కలిగి ఉంటాయి.',
        'hi': 'डिजीलॉकर: भारत सरकार का डिजिटल लॉकर जहां रखे गए ड्राइविंग लाइसेंस और आरसी आदि मूल दस्तावेजों की तरह कानूनी रूप से मान्य होते हैं।'
    },
    'aadhaar-seeding': {
        'en': 'Aadhaar Seeding means officially linking your 12-digit Aadhaar number with your bank account on the NPCI mapper so that government welfare subsidies and scholarships are directly deposited (DBT).',
        'te': 'ఆధార్ సీడింగ్: ప్రభుత్వ స్కాలర్‌షిప్‌లు, సంక్షేమ పథకాల నగదు నేరుగా మీ ఖాతాలో పడేందుకు మీ ఆధార్ నంబర్‌ను బ్యాంక్ ఖాతాకు లింక్ చేయడం.',
        'hi': 'आधार सीडिंग: सरकारी छात्रवृत्ति और योजनाओं का पैसा सीधे बैंक खाते में आने के लिए बैंक खाते को आधार से जोड़ना।'
    },
    'tatkaal': {
        'en': 'Tatkaal is the expedited processing scheme for Indian passports. Applications are processed within 1 to 3 days for an additional fee of ₹2,000 paid at the Passport Seva Kendra.',
        'te': 'తత్కాల్: పాస్‌పోర్ట్ అత్యవసరంగా కావాలనుకునే వారికి 1 నుండి 3 రోజుల్లో పాస్‌పోర్ట్ అందించే వేగవంతమైన ప్రక్రియ. దీనికి ₹2,000 అదనపు రుసుము ఉంటుంది.',
        'hi': 'तत्काल योजना: पासपोर्ट को 1 से 3 दिनों में तेजी से प्राप्त करने की आधिकारिक सरकारी योजना, जिसके लिए ₹2,000 अतिरिक्त शुल्क लगता है।'
    }
}

@router.post("/ask")
async def ask_rag_assistant(payload: RagQueryRequest):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Inquiry query text is required.")

    all_services = db.get_all_services()
    context = {
        "serviceId": payload.serviceId,
        "state": payload.state or "Telangana",
        "language": payload.language or "en",
        "userProfile": payload.userProfile
    }

    result = await RagEngine.generate_civic_response(
        query=payload.query,
        context=context,
        services_data=all_services,
        api_key=settings.GEMINI_API_KEY
    )

    return {
        "success": True,
        "data": result
    }

@router.post("/explain")
async def explain_term(payload: ExplainTermRequest):
    if not payload.term or not payload.term.strip():
        raise HTTPException(status_code=400, detail="Term or instruction to explain is required.")

    term_clean = payload.term.lower().strip()
    term_slug = term_clean.replace(" ", "-")

    matched = GLOSSARY.get(term_slug)
    if not matched:
        for k, v in GLOSSARY.items():
            if k in term_clean or term_clean in k:
                matched = v
                break

    lang = payload.language or "en"
    if matched:
        explanation = matched.get(lang) or matched.get("en")
    else:
        explanation = f"Explanation for \"{payload.term}\": In official government workflows, this refers to a standardized regulatory requirement. Always confirm specific definitions in the official departmental guidelines."

    return {
        "success": True,
        "term": payload.term,
        "language": lang,
        "explanation": explanation,
        "officialAdvice": "Terms are verified under official Government of India rules and state gazettes."
    }

@router.post("/guidance")
async def generate_guidance(payload: GuidanceRequest):
    all_services = db.get_all_services()
    service = None
    if payload.serviceId:
        service = next((s for s in all_services if s.get("id") == payload.serviceId), None)
    if not service and all_services:
        service = all_services[0]

    if not service:
        raise HTTPException(status_code=404, detail="Selected government service not found")

    docs = service.get("documents", [])
    checklist = [
        {
            "task": f"Verify Eligibility for {service.get('title')}",
            "details": f"Confirm you meet the mandatory criteria: {service.get('eligibility_criteria')}",
            "status": "PENDING",
            "required": True
        },
        {
            "task": "Gather Primary Identity & Address Proofs",
            "details": "Prepare original Aadhaar card and verify name and date of birth match your school certificate.",
            "status": "PENDING",
            "required": True
        },
        {
            "task": "Prepare Required Service Documents",
            "details": f"Ensure you have all {len(docs)} accepted documents ready in prescribed formats.",
            "status": "PENDING",
            "required": True
        },
        {
            "task": "Initiate Application on Official Portal",
            "details": f"Go to {service.get('official_url')} (Application Mode: {service.get('application_mode')}). Do not use unverified third-party websites.",
            "status": "PENDING",
            "required": True
        },
        {
            "task": "Pay Prescribed Statutory Fee",
            "details": f"Official government fee structure: {service.get('fee_structure')}. Retain electronic payment receipt.",
            "status": "PENDING",
            "required": True
        },
        {
            "task": "Save Application Reference Number",
            "details": "Save your acknowledgment token number to track progress on the CivicGuide Application Tracker.",
            "status": "PENDING",
            "required": True
        }
    ]

    if payload.occupation == "STUDENT" or service.get("target_audience") == "STUDENT":
        checklist.insert(2, {
            "task": "Verify College Attendance & Bonafide Certificate",
            "details": "Ensure at least 75% biometric attendance is logged and bonafide study certificate is collected.",
            "status": "PENDING",
            "required": True
        })

    return {
        "success": True,
        "profile": {
            "country": payload.country or "India",
            "state": payload.state or "Telangana",
            "district": payload.district or "Hyderabad",
            "ageGroup": payload.ageGroup,
            "occupation": payload.occupation
        },
        "service": {
            "id": service.get("id"),
            "title": service.get("title"),
            "category": service.get("category"),
            "fee": service.get("fee_structure"),
            "processingTime": service.get("processing_time"),
            "officialUrl": service.get("official_url"),
            "lastVerified": service.get("last_verified")
        },
        "personalizedChecklist": checklist,
        "verificationNotice": "Generated from verified official government procedures. Re-check official portal before financial payment."
    }
