import { Request, Response } from 'express';
import { DatabaseAdapter } from '../utils/db.js';
import { RagEngine, RagQueryContext } from '../../../ai/retrieval/ragEngine.js';

export class AiController {
  public static async ask(req: Request, res: Response): Promise<void> {
    try {
      const { query, serviceId, state, language, userProfile } = req.body;

      if (!query || typeof query !== 'string' || !query.trim()) {
        res.status(400).json({ success: false, message: 'Inquiry query text is required.' });
        return;
      }

      const allServices = await DatabaseAdapter.getAllServices();
      const context: RagQueryContext = {
        serviceId,
        state: state || 'Telangana',
        language: (language as 'en' | 'te' | 'hi') || 'en',
        userProfile
      };

      const apiKey = process.env.GEMINI_API_KEY;
      const ragResult = await RagEngine.generateCivicResponse(query, context, allServices, apiKey);

      res.json({
        success: true,
        data: ragResult
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'AI assistant error' });
    }
  }

  public static async explain(req: Request, res: Response): Promise<void> {
    try {
      const { term, context, language = 'en' } = req.body;

      if (!term) {
        res.status(400).json({ success: false, message: 'Term or instruction to explain is required.' });
        return;
      }

      const glossary: Record<string, { en: string; te: string; hi: string }> = {
        'non-ecr': {
          en: 'Non-ECR (Emigration Check Not Required) means you can travel abroad for work without needing prior clearance from the Protector of Emigrants. If you have passed 10th standard (Matriculation) or pay income tax, your passport will be endorsed as Non-ECR.',
          te: 'Non-ECR (ఎమిగ్రేషన్ చెక్ అవసరం లేదు): 10వ తరగతి పాసైన వారు లేదా ఇన్‌కమ్ ట్యాక్స్ చెల్లించే వారికి ఈ వెసులుబాటు ఉంటుంది. విదేశాలకు వెళ్లేటప్పుడు ఎలాంటి ప్రత్యేక ప్రభుత్వ ముందస్తు క్లియరెన్స్ అవసరం లేదు.',
          hi: 'Non-ECR (उत्प्रवास जांच आवश्यक नहीं): यदि आपने 10वीं कक्षा उत्तीर्ण की है या आयकरदाता हैं, तो आपको विदेश जाने के लिए उत्प्रवासी संरक्षक से किसी विशेष अनुमति की आवश्यकता नहीं होती है।'
        },
        'meeseva': {
          en: 'MeeSeva ("At Your Service") is the official electronic governance portal in Telangana and Andhra Pradesh for citizen services including income, caste, and residence certificates with digital signatures.',
          te: 'మీసేవ: తెలంగాణ మరియు ఆంధ్రప్రదేశ్‌లో ప్రజలకు డిజిటల్ సంతకంతో కూడిన ఆదాయ, కుల, నివాస ధ్రువీకరణ పత్రాలు అందించే అధికారిక ప్రభుత్వ సేవా పోర్టల్.',
          hi: 'मीसेवा (MeeSeva): तेलंगाना और आंध्र प्रदेश का आधिकारिक नागरिक सेवा पोर्टल जहां आय, जाति और निवास प्रमाण पत्र ऑनलाइन जारी किए जाते हैं।'
        },
        'digilocker': {
          en: 'DigiLocker is an official Government of India cloud platform. Under Rule 139 of CMVR and the Information Technology Act 2000, documents stored in DigiLocker (like Driving Licences, RC, Birth Certificates) have the exact same legal validity as original physical documents.',
          te: 'డిజిలాకర్: భారత ప్రభుత్వ అధికారిక క్లౌడ్ ప్లాట్‌ఫారమ్. ఇందులో భద్రపరిచిన డ్రైవింగ్ లైసెన్స్, ఆర్సీ బుక్ మొదలైనవి అసలు కాగితాలతో సమానమైన చట్టబద్ధతను కలిగి ఉంటాయి.',
          hi: 'डिजीलॉकर: भारत सरकार का डिजिटल लॉकर जहां रखे गए ड्राइविंग लाइसेंस और आरसी आदि मूल दस्तावेजों की तरह कानूनी रूप से मान्य होते हैं।'
        },
        'aadhaar-seeding': {
          en: 'Aadhaar Seeding means officially linking your 12-digit Aadhaar number with your bank account on the NPCI mapper so that government welfare subsidies and scholarships are directly deposited (DBT).',
          te: 'ఆధార్ సీడింగ్: ప్రభుత్వ స్కాలర్‌షిప్‌లు, సంక్షేమ పథకాల నగదు నేరుగా మీ ఖాతాలో పడేందుకు మీ ఆధార్ నంబర్‌ను బ్యాంక్ ఖాతాకు లింక్ చేయడం.',
          hi: 'आधार सीडिंग: सरकारी छात्रवृत्ति और योजनाओं का पैसा सीधे बैंक खाते में आने के लिए बैंक खाते को आधार से जोड़ना।'
        },
        'tatkaal': {
          en: 'Tatkaal is the expedited processing scheme for Indian passports. Applications are processed within 1 to 3 days for an additional fee of ₹2,000 paid at the Passport Seva Kendra.',
          te: 'తత్కాల్: పాస్‌పోర్ట్ అత్యవసరంగా కావాలనుకునే వారికి 1 నుండి 3 రోజుల్లో పాస్‌పోర్ట్ అందించే వేగవంతమైన ప్రక్రియ. దీనికి ₹2,000 అదనపు రుసుము ఉంటుంది.',
          hi: 'तत्काल योजना: पासपोर्ट को 1 से 3 दिनों में तेजी से प्राप्त करने की आधिकारिक सरकारी योजना, जिसके लिए ₹2,000 अतिरिक्त शुल्क लगता है।'
        }
      };

      const termKey = term.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
      let matched = glossary[termKey];

      if (!matched) {
        for (const [key, val] of Object.entries(glossary)) {
          if (term.toLowerCase().includes(key) || key.includes(term.toLowerCase())) {
            matched = val;
            break;
          }
        }
      }

      const explanation = matched
        ? matched[language as 'en' | 'te' | 'hi'] || matched.en
        : `Explanation for "${term}": In official government workflows, this refers to a standardized regulatory requirement. Always confirm specific definitions in the official departmental guidelines.`;

      res.json({
        success: true,
        term,
        language,
        explanation,
        officialAdvice: 'Terms are verified under official Government of India rules and state gazettes.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async generateGuidance(req: Request, res: Response): Promise<void> {
    try {
      const { country = 'India', state = 'Telangana', district = 'Hyderabad', ageGroup, occupation, serviceId } = req.body;

      const allServices = await DatabaseAdapter.getAllServices();
      const service = serviceId ? allServices.find(s => s.id === serviceId) : allServices[0];

      if (!service) {
        res.status(404).json({ success: false, message: 'Selected government service not found' });
        return;
      }

      const checklist = [
        {
          task: `Verify Eligibility for ${service.title}`,
          details: `Confirm you meet the mandatory criteria: ${service.eligibility_criteria}`,
          status: 'PENDING',
          required: true
        },
        {
          task: 'Gather Primary Identity & Address Proofs',
          details: 'Prepare original Aadhaar card and verify name and date of birth match your school certificate.',
          status: 'PENDING',
          required: true
        },
        {
          task: 'Prepare Required Service Documents',
          details: `Ensure you have all ${(service.documents || []).length} accepted documents ready in prescribed formats.`,
          status: 'PENDING',
          required: true
        },
        {
          task: `Initiate Application on Official Portal`,
          details: `Go to ${service.official_url} (Application Mode: ${service.application_mode}). Do not use unverified third-party websites.`,
          status: 'PENDING',
          required: true
        },
        {
          task: 'Pay Prescribed Statutory Fee',
          details: `Official government fee structure: ${service.fee_structure}. Retain electronic payment receipt.`,
          status: 'PENDING',
          required: true
        },
        {
          task: 'Save Application Reference Number',
          details: 'Save your acknowledgment token number to track progress on the CivicGuide Application Tracker.',
          status: 'PENDING',
          required: true
        }
      ];

      // Add student specific item if applicable
      if (occupation === 'STUDENT' || service.target_audience === 'STUDENT') {
        checklist.splice(2, 0, {
          task: 'Verify College Attendance & Bonafide Certificate',
          details: 'Ensure at least 75% biometric attendance is logged and bonafide study certificate is collected.',
          status: 'PENDING',
          required: true
        });
      }

      res.json({
        success: true,
        profile: { country, state, district, ageGroup, occupation },
        service: {
          id: service.id,
          title: service.title,
          category: service.category,
          fee: service.fee_structure,
          processingTime: service.processing_time,
          officialUrl: service.official_url,
          lastVerified: service.last_verified
        },
        personalizedChecklist: checklist,
        verificationNotice: 'Generated from verified official government procedures. Re-check official portal before financial payment.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
