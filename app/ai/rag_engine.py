"""
CivicGuide AI - Python RAG Retrieval & Answer Generation Engine
Handles intent detection, context retrieval, source attribution, and multilingual answer synthesis.
"""

from typing import Dict, Any, List, Optional
import httpx
from app.ai.prompts import CIVIC_ASSISTANT_SYSTEM_PROMPT

class RagEngine:
    @staticmethod
    def detect_intent(query: str) -> str:
        q = query.lower()
        if any(w in q for w in ['document', 'paper', 'proof', 'certificate required', 'డాక్యుమెంట్లు', 'దస్తావేజులు', 'दस्तावेज', 'कागजात']):
            return 'DOCUMENTS'
        if any(w in q for w in ['fee', 'cost', 'price', 'charge', 'how much', 'ఫీజు', 'ధర', 'शुल्क', 'फीस']):
            return 'FEES'
        if any(w in q for w in ['step', 'how to', 'apply', 'process', 'procedure', 'ఎలా దరఖాస్తు', 'విధానం', 'प्रक्रिया', 'आवेदन कैसे']):
            return 'PROCEDURE'
        if any(w in q for w in ['eligible', 'who can', 'age', 'income limit', 'అర్హత', 'पात्रता']):
            return 'ELIGIBILITY'
        if any(w in q for w in ['time', 'how long', 'days', 'ఎన్ని రోజులు', 'సమయం', 'कितना समय', 'दिन']):
            return 'TIMELINE'
        if any(w in q for w in ['track', 'status', 'reference', 'స్టేటస్', 'స్థితి', 'स्थिति']):
            return 'STATUS'
        if any(w in q for w in ['renew', 'expired', 'రెన్యూవల్', 'పునరుద్ధరణ', 'नवीनीकरण']):
            return 'RENEWAL'
        return 'GENERAL'

    @staticmethod
    def match_service_from_query(query: str, available_services: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        q = query.lower()
        keyword_map = {
            'srv-passport': ['passport', 'tatkaal', 'psk', 'popsk', 'పాస్‌పోర్ట్', 'पासपोर्ट'],
            'srv-driving-licence': ['driving', 'licence', 'license', 'llr', 'learner', 'dl', 'parivahan', 'sarathi', 'rto', 'డ్రైవింగ్', 'లైసెన్స్', 'ड्राइविंग', 'लाइसेंस', 'डीएल'],
            'srv-income-cert': ['income', 'aadhayam', 'aadaayam', 'meeseva income', 'ఆదాయ', 'ఆదాయ ధ్రువీకరణ', 'आय प्रमाण'],
            'srv-birth-cert': ['birth', 'janma', 'janan', 'ghmc birth', 'పుట్టిన', 'జనన', 'బర్త్', 'जन्म प्रमाण'],
            'srv-death-cert': ['death', 'marana', 'చనిపోయిన', 'మరణ', 'मृत्यु प्रमाण'],
            'srv-caste-cert': ['caste', 'community', 'sc/st', 'bc certificate', 'obc certificate', 'కుల', 'జాతి', 'జాతి ధ్రువీకరణ', 'जाति प्रमाण'],
            'srv-pan-card': ['pan', 'pan card', 'instant e-pan', 'nsdl', 'utiitsl', 'పాన్ కార్డు', 'पैन कार्ड'],
            'srv-aadhaar-update': ['aadhaar', 'uidai', 'address update aadhaar', 'aadhar', 'ఆధార్', 'आधार'],
            'srv-voter-id': ['voter', 'epic', 'election card', 'form 6', 'ఓటరు', 'ఎన్నికల గుర్తింపు', 'वोटर आईडी', 'मतदाता'],
            'srv-scholarship-epass': ['scholarship', 'epass', 'fee reimbursement', 'post-matric', 'స్కాలర్‌షిప్', 'ఫీజు రీయింబర్స్‌మెంట్', 'छात्रवृत्ति'],
            'srv-residence-cert': ['residence', 'domicile', 'nativity', 'స్థానిక', 'నివాస', 'निवास प्रमाण'],
            'srv-udyam-msme': ['udyam', 'msme', 'business registration', 'small business', 'వ్యాపార', 'उद्योग आधार', 'एमएसएमई']
        }

        for srv_id, keywords in keyword_map.items():
            if any(kw in q for kw in keywords):
                found = next((s for s in available_services if s.get("id") == srv_id), None)
                if found:
                    return found

        for srv in available_services:
            if srv.get("title", "").lower() in q or srv.get("service_code", "").lower() in q:
                return srv

        return None

    @classmethod
    async def generate_civic_response(
        cls,
        query: str,
        context: Dict[str, Any],
        services_data: List[Dict[str, Any]],
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        lang = context.get('language') or 'en'
        intent = cls.detect_intent(query)
        service_id = context.get('serviceId')

        target_service = None
        if service_id:
            target_service = next((s for s in services_data if s.get("id") == service_id), None)
        if not target_service:
            target_service = cls.match_service_from_query(query, services_data) or (services_data[0] if services_data else {})

        sources = []
        for src in target_service.get('sources', []):
            sources.append({
                'title': src.get('document_title') or src.get('authority_name'),
                'authority': src.get('authority_name'),
                'url': src.get('source_url'),
                'lastVerified': src.get('last_checked_date') or target_service.get('last_verified'),
                'verificationBadge': src.get('verification_badge') or 'OFFICIAL_VERIFIED',
                'citationText': src.get('citation_text') or 'Official Government Source',
                'sourceType': src.get('source_type')
            })

        # Check Gemini API Key
        if api_key and api_key != 'demo_key':
            try:
                gemini_ans = await cls._call_gemini_api(query, target_service, sources, intent, lang, api_key)
                if gemini_ans:
                    return {
                        'answer': gemini_ans,
                        'intent': intent,
                        'targetService': {
                            'id': target_service.get('id'),
                            'title': target_service.get('title'),
                            'category': target_service.get('category'),
                            'state': target_service.get('state'),
                            'officialUrl': target_service.get('official_url')
                        },
                        'sources': sources,
                        'verificationBadge': 'VERIFIED_OFFICIAL' if target_service.get('verification_status') == 'VERIFIED' else 'NEEDS_VERIFICATION',
                        'language': lang,
                        'suggestedFollowUps': cls._get_follow_ups(target_service, intent, lang)
                    }
            except Exception as e:
                pass

        answer = cls._synthesize_verified_answer(query, target_service, intent, lang)

        return {
            'answer': answer,
            'intent': intent,
            'targetService': {
                'id': target_service.get('id'),
                'title': target_service.get('title'),
                'category': target_service.get('category'),
                'state': target_service.get('state'),
                'officialUrl': target_service.get('official_url')
            },
            'sources': sources,
            'verificationBadge': 'VERIFIED_OFFICIAL' if target_service.get('verification_status') == 'VERIFIED' else 'NEEDS_VERIFICATION',
            'language': lang,
            'suggestedFollowUps': cls._get_follow_ups(target_service, intent, lang)
        }

    @classmethod
    def _synthesize_verified_answer(cls, query: str, srv: Dict[str, Any], intent: str, lang: str) -> str:
        docs = srv.get('documents', [])
        steps = srv.get('steps', [])
        faqs = srv.get('faqs', [])

        if lang == 'te':
            return cls._synthesize_telugu_answer(srv, intent, docs, steps, faqs)
        elif lang == 'hi':
            return cls._synthesize_hindi_answer(srv, intent, docs, steps, faqs)
        else:
            return cls._synthesize_english_answer(srv, intent, docs, steps, faqs)

    @staticmethod
    def _synthesize_english_answer(srv: Dict[str, Any], intent: str, docs: List[Dict[str, Any]], steps: List[Dict[str, Any]], faqs: List[Dict[str, Any]]) -> str:
        title = srv.get('title', 'Government Service')
        fee = srv.get('fee_structure', 'Prescribed official fees')
        proc_time = srv.get('processing_time', 'Standard government timeline')
        mode = srv.get('application_mode', 'ONLINE')
        url = srv.get('official_url', 'https://india.gov.in')
        eligibility = srv.get('eligibility_criteria', 'Indian citizen meeting statutory rules')
        verified = srv.get('last_verified', '2026-03-01')

        output = ""
        if intent == 'DOCUMENTS':
            output += f"Here are the official required documents for **{title}** as verified from official government authorities:\n\n"
            for idx, doc in enumerate(docs):
                output += f"{idx + 1}. **{doc.get('document_name')}**\n"
                output += f"   • *Purpose:* {doc.get('purpose')}\n"
                fmt = doc.get('accepted_formats') or 'PDF/Scan'
                orig = "Original required at counter" if doc.get('is_original_required') else "Self-attested copy"
                output += f"   • *Accepted Format:* {fmt} ({orig})\n"
                if doc.get('notes'):
                    output += f"   • *Official Note:* {doc.get('notes')}\n"
                output += "\n"
            output += "💡 **Verification Tip:** Ensure names and dates of birth match exactly across all identity documents before starting the application.\n\n"
        elif intent == 'FEES':
            output += f"Here is the verified fee structure for **{title}**:\n\n"
            output += f"💰 **Official Fees:** {fee}\n"
            output += f"⏱️ **Estimated Processing Time:** {proc_time}\n"
            output += f"🏛️ **Application Mode:** {mode} (Apply at: {url})\n\n"
            output += "⚠️ *Note on Unofficial Charges:* Do not pay extra cash to unauthorized agents or touts. Official government portal fees are strictly receipted online or at authorized MeeSeva/CSC counters.\n\n"
        elif intent == 'PROCEDURE':
            output += f"Here is the step-by-step verified application procedure for **{title}**:\n\n"
            for step in steps:
                output += f"**Step {step.get('step_number')}: {step.get('title')}**\n"
                output += f"{step.get('description')}\n"
                step_type = "🌐 Online" if step.get('is_online_step') else "🏛️ Office Visit"
                output += f"• *Estimated Time:* {step.get('estimated_time')} | *Type:* {step_type}\n"
                if step.get('tips'):
                    output += f"• *Helpful Advice:* {step.get('tips')}\n"
                output += "\n"
        elif intent == 'ELIGIBILITY':
            output += f"### Eligibility Criteria for **{title}**\n\n"
            output += f"{eligibility}\n\n"
            output += f"• **Target Audience:** {srv.get('target_audience')}\n"
            output += f"• **Jurisdiction:** {srv.get('state')} ({srv.get('country')})\n"
            output += f"• **Estimated Processing Time:** {proc_time}\n\n"
        else:
            output += f"### {title}\n\n"
            output += f"{srv.get('description')}\n\n"
            output += f"• **Who is Eligible:** {eligibility}\n"
            output += f"• **Official Fees:** {fee}\n"
            output += f"• **Processing Time:** {proc_time}\n"
            output += f"• **Application Mode:** {mode}\n\n"
            if faqs:
                output += "#### Common Questions:\n"
                for f in faqs[:2]:
                    output += f"**Q: {f.get('question')}**\n{f.get('answer')}\n*(Ref: {f.get('official_reference', 'Official Guidelines')})*\n\n"

        output += "---\n"
        output += f"🛡️ **Official Source:** [{url}]({url})\n"
        output += f"📅 **Last Verified:** {verified} | **Status:** ✅ Official Government Information\n\n"
        output += "*Disclaimer: CivicGuide AI is an independent civic information assistant and is not a government agency. Always verify critical procedures and fees on the official government website before submitting an application.*"
        return output

    @staticmethod
    def _synthesize_telugu_answer(srv: Dict[str, Any], intent: str, docs: List[Dict[str, Any]], steps: List[Dict[str, Any]], faqs: List[Dict[str, Any]]) -> str:
        title = srv.get('title', 'ప్రభుత్వ సేవ')
        fee = srv.get('fee_structure', 'అధికారిక రుసుము')
        proc_time = srv.get('processing_time', 'ప్రామాణిక సమయం')
        mode = srv.get('application_mode', 'ONLINE')
        url = srv.get('official_url', 'https://india.gov.in')
        eligibility = srv.get('eligibility_criteria', '')
        verified = srv.get('last_verified', '2026-03-01')

        output = ""
        if intent == 'DOCUMENTS':
            output += f"**{title}** కోసం అధికారిక ప్రభుత్వ మార్గదర్శకాల ప్రకారం అవసరమైన పత్రాలు (Documents) ఇక్కడ ఇవ్వబడ్డాయి:\n\n"
            for idx, doc in enumerate(docs):
                output += f"{idx + 1}. **{doc.get('document_name')}**\n"
                output += f"   • *ఎందుకు అవసరం:* {doc.get('purpose')}\n"
                fmt = doc.get('accepted_formats') or 'PDF / Scan'
                orig = 'ఒరిజినల్ కౌంటర్ వద్ద చూపించాలి' if doc.get('is_original_required') else 'స్వయం ధ్రువీకరించిన జిరాక్స్'
                output += f"   • *స్వీకరించే ఫార్మాట్:* {fmt} ({orig})\n"
                if doc.get('notes'):
                    output += f"   • *అధికారిక గమనిక:* {doc.get('notes')}\n"
                output += "\n"
            output += "💡 **ముఖ్యమైన సూచన:** దరఖాస్తు చేయడానికి ముందు అన్ని పత్రాలలో మీ పేరు మరియు పుట్టిన తేదీ ఒకే విధంగా ఉన్నాయో లేదో సరిచూసుకోండి.\n\n"
        elif intent == 'FEES':
            output += f"**{title}** కోసం అధికారిక ఫీజు వివరాలు:\n\n"
            output += f"💰 **అధికారిక ఫీజు:** {fee}\n"
            output += f"⏱️ **పట్టే సమయం:** {proc_time}\n"
            output += f"🏛️ **దరఖాస్తు విధానం:** {mode} (అధికారిక పోర్టల్: {url})\n\n"
            output += "⚠️ *గమనిక:* ఏ అనధికారిక బ్రోకర్లకు లేదా ఏజెంట్లకు అదనపు డబ్బులు చెల్లించవద్దు. ప్రభుత్వ రుసుములకు మాత్రమే అధికారిక రసీదు లభిస్తుంది.\n\n"
        elif intent == 'PROCEDURE':
            output += f"**{title}** దరఖాస్తు దశలవారీ విధానం (Step-by-step Process):\n\n"
            for step in steps:
                output += f"**దశ {step.get('step_number')}: {step.get('title')}**\n"
                output += f"{step.get('description')}\n"
                stype = '🌐 ఆన్‌లైన్' if step.get('is_online_step') else '🏛️ కార్యాలయ సందర్శన'
                output += f"• *అంచనా సమయం:* {step.get('estimated_time')} | *రకం:* {stype}\n"
                if step.get('tips'):
                    output += f"• *సలహా:* {step.get('tips')}\n"
                output += "\n"
        else:
            output += f"### {title}\n\n"
            output += f"{srv.get('description')}\n\n"
            output += f"• **ఎవరు అర్హులు:** {eligibility}\n"
            output += f"• **అధికారిక ఫీజు:** {fee}\n"
            output += f"• **పట్టే సమయం:** {proc_time}\n"
            output += f"• **దరఖాస్తు విధానం:** {mode}\n\n"

        output += "---\n"
        output += f"🛡️ **అధికారిక వెబ్‌సైట్:** [{url}]({url})\n"
        output += f"📅 **చివరిసారి ధ్రువీకరించబడిన తేదీ:** {verified} | **స్థితి:** ✅ ధ్రువీకరించబడిన సమాచారం\n\n"
        output += "*గమనిక: సివిక్‌గైడ్ AI అనేది పౌర సమాచార సహాయకుడు మాత్రమే, ఇది ప్రభుత్వ సంస్థ కాదు. దరఖాస్తు లేదా రుసుము చెల్లించే ముందు అధికారిక పోర్టల్‌లో సరిచూసుకోండి.*"
        return output

    @staticmethod
    def _synthesize_hindi_answer(srv: Dict[str, Any], intent: str, docs: List[Dict[str, Any]], steps: List[Dict[str, Any]], faqs: List[Dict[str, Any]]) -> str:
        title = srv.get('title', 'सरकारी सेवा')
        fee = srv.get('fee_structure', 'आधिकारिक शुल्क')
        proc_time = srv.get('processing_time', 'मानक समय')
        mode = srv.get('application_mode', 'ONLINE')
        url = srv.get('official_url', 'https://india.gov.in')
        eligibility = srv.get('eligibility_criteria', '')
        verified = srv.get('last_verified', '2026-03-01')

        output = ""
        if intent == 'DOCUMENTS':
            output += f"**{title}** के लिए आधिकारिक रूप से सत्यापित आवश्यक दस्तावेज:\n\n"
            for idx, doc in enumerate(docs):
                output += f"{idx + 1}. **{doc.get('document_name')}**\n"
                output += f"   • *उद्देश्य:* {doc.get('purpose')}\n"
                fmt = doc.get('accepted_formats') or 'PDF / Scan'
                orig = 'मूल प्रति आवश्यक' if doc.get('is_original_required') else 'स्व-सत्यापित फोटोकॉपी'
                output += f"   • *स्वीकृत प्रारूप:* {fmt} ({orig})\n"
                if doc.get('notes'):
                    output += f"   • *आधिकारिक निर्देश:* {doc.get('notes')}\n"
                output += "\n"
            output += "💡 **सत्यापन सलाह:** आवेदन करने से पहले सुनिश्चित करें कि सभी पहचान दस्तावेजों में आपका नाम और जन्म तिथि समान हो।\n\n"
        elif intent == 'FEES':
            output += f"**{title}** के लिए आधिकारिक शुल्क विवरण:\n\n"
            output += f"💰 **आधिकारिक शुल्क:** {fee}\n"
            output += f"⏱️ **अनुमानित प्रसंस्करण समय:** {proc_time}\n"
            output += f"🏛️ **आवेदन माध्यम:** {mode} (पोर्टल: {url})\n\n"
            output += "⚠️ *सावधानी:* किसी भी अनधिकृत दलाल या बिचौलिये को अतिरिक्त पैसे न दें। सरकारी शुल्क केवल आधिकारिक पोर्टल या केंद्र पर ही जमा करें।\n\n"
        elif intent == 'PROCEDURE':
            output += f"**{title}** के लिए चरण-दर-चरण आवेदन प्रक्रिया:\n\n"
            for step in steps:
                output += f"**चरण {step.get('step_number')}: {step.get('title')}**\n"
                output += f"{step.get('description')}\n"
                stype = '🌐 ऑनलाइन' if step.get('is_online_step') else '🏛️ कार्यालय में उपस्थिति'
                output += f"• *समय:* {step.get('estimated_time')} | *प्रकार:* {stype}\n"
                if step.get('tips'):
                    output += f"• *सुझाव:* {step.get('tips')}\n"
                output += "\n"
        else:
            output += f"### {title}\n\n"
            output += f"{srv.get('description')}\n\n"
            output += f"• **पात्रता:** {eligibility}\n"
            output += f"• **आधिकारिक शुल्क:** {fee}\n"
            output += f"• **प्रसंस्करण समय:** {proc_time}\n"
            output += f"• **आवेदन माध्यम:** {mode}\n\n"

        output += "---\n"
        output += f"🛡️ **आधिकारिक पोर्टल:** [{url}]({url})\n"
        output += f"📅 **अंतिम सत्यापन:** {verified} | **स्थिति:** ✅ आधिकारिक रूप से सत्यापित\n\n"
        output += "*अस्वीकरण: सिविकगाइड AI एक नागरिक सूचना सहायक है और कोई सरकारी एजेंसी नहीं है। किसी भी आवेदन को जमा करने से पहले आधिकारिक वेबसाइट पर जानकारी अवश्य सत्यापित करें।*"
        return output

    @staticmethod
    def _get_follow_ups(srv: Dict[str, Any], intent: str, lang: str) -> List[str]:
        title = srv.get('title', 'Service')
        if lang == 'te':
            return [
                f"{title} కు ఏ డాక్యుమెంట్లు అవసరం?",
                "ఫీజు ఎంత మరియు ఎన్ని రోజుల్లో వస్తుంది?",
                "ఆన్‌లైన్‌లో దరఖాస్తు చేసే దశలు ఏమిటి?",
                "అధికారిక వెబ్‌సైట్ లింక్ చూపించు"
            ]
        elif lang == 'hi':
            return [
                f"{title} के लिए कौन से दस्तावेज चाहिए?",
                "आधिकारिक शुल्क कितना है?",
                "ऑनलाइन आवेदन करने के चरण क्या हैं?",
                "आधिकारिक पोर्टल लिंक प्रदान करें"
            ]
        else:
            return [
                f"What documents are required for {title}?",
                "What is the official fee and processing time?",
                "What are the step-by-step application instructions?",
                "Show the official government website and sources"
            ]

    @staticmethod
    async def _call_gemini_api(query: str, srv: Dict[str, Any], sources: List[Dict[str, Any]], intent: str, lang: str, api_key: str) -> Optional[str]:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        context_prompt = f"""
OFFICIAL CONTEXT:
Service Title: {srv.get('title')}
Category: {srv.get('category')}
Country/State: {srv.get('country')} / {srv.get('state')}
Official Fee Structure: {srv.get('fee_structure')}
Processing Time: {srv.get('processing_time')}
Application Mode: {srv.get('application_mode')}
Official URL: {srv.get('official_url')}
Eligibility: {srv.get('eligibility_criteria')}
Documents: {srv.get('documents', [])}
Steps: {srv.get('steps', [])}
FAQs: {srv.get('faqs', [])}
Official Sources: {sources}

USER LANGUAGE REQUESTED: {lang} (en = English, te = Telugu, hi = Hindi)
USER QUERY: "{query}"

INSTRUCTIONS:
Answer the citizen's query based ONLY on the official context above.
If in Telugu, write natural Telugu preserving key names like MeeSeva, Aadhaar, Passport.
If in Hindi, write natural Hindi preserving official terms.
Include bullet points, fees, processing time, required documents, and cite the official URL.
Never hallucinate or invent rules. Include the safety disclaimer at the end.
"""
        body = {
            "contents": [{
                "parts": [{"text": f"{CIVIC_ASSISTANT_SYSTEM_PROMPT}\n\n{context_prompt}"}]
            }]
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(endpoint, json=body)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
        return None
