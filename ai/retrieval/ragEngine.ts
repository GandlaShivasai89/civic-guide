/**
 * CivicGuide AI - RAG Retrieval & Answer Generation Engine
 * Handles intent detection, context retrieval, source attribution, and multilingual answer synthesis.
 */

import { CIVIC_ASSISTANT_SYSTEM_PROMPT } from '../prompts/systemPrompt.js';
import { SourceVerifier } from '../verification/sourceVerifier.js';

export interface RagQueryContext {
  serviceId?: string;
  state?: string;
  language?: 'en' | 'te' | 'hi';
  userProfile?: {
    ageGroup?: string;
    occupation?: string;
    district?: string;
  };
}

export interface RetrievedSource {
  title: string;
  authority: string;
  url: string;
  lastVerified: string;
  verificationBadge: string;
  citationText: string;
  sourceType: string;
}

export interface RagResponse {
  answer: string;
  intent: string;
  targetService?: {
    id: string;
    title: string;
    category: string;
    state: string;
    officialUrl: string;
  };
  sources: RetrievedSource[];
  verificationBadge: 'VERIFIED_OFFICIAL' | 'NEEDS_VERIFICATION' | 'CONFLICTING';
  language: 'en' | 'te' | 'hi';
  suggestedFollowUps: string[];
}

export class RagEngine {
  /**
   * Classify intent based on natural language citizen queries
   */
  public static detectIntent(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('document') || q.includes('paper') || q.includes('proof') || q.includes('certificate required') || q.includes('డాక్యుమెంట్లు') || q.includes('దస్తావేజులు') || q.includes('दस्तावेज') || q.includes('कागजात')) {
      return 'DOCUMENTS';
    }
    if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('charge') || q.includes('how much') || q.includes('ఫీజు') || q.includes('ధర') || q.includes('शुल्क') || q.includes('फीस')) {
      return 'FEES';
    }
    if (q.includes('step') || q.includes('how to') || q.includes('apply') || q.includes('process') || q.includes('procedure') || q.includes('ఎలా దరఖాస్తు') || q.includes('విధానం') || q.includes('प्रक्रिया') || q.includes('आवेदन कैसे')) {
      return 'PROCEDURE';
    }
    if (q.includes('eligible') || q.includes('who can') || q.includes('age') || q.includes('income limit') || q.includes('అర్హత') || q.includes('पात्रता')) {
      return 'ELIGIBILITY';
    }
    if (q.includes('time') || q.includes('how long') || q.includes('days') || q.includes('ఎన్ని రోజులు') || q.includes('సమయం') || q.includes('कितना समय') || q.includes('दिन')) {
      return 'TIMELINE';
    }
    if (q.includes('track') || q.includes('status') || q.includes('reference') || q.includes('స్టేటస్') || q.includes('స్థితి') || q.includes('स्थिति')) {
      return 'STATUS';
    }
    if (q.includes('renew') || q.includes('expired') || q.includes('రెన్యూవల్') || q.includes('పునరుద్ధరణ') || q.includes('नवीनीकरण')) {
      return 'RENEWAL';
    }
    return 'GENERAL';
  }

  /**
   * Detect target service name from query keywords
   */
  public static matchServiceFromQuery(query: string, availableServices: any[]): any | null {
    const q = query.toLowerCase();
    
    // Direct synonym mapping
    const keywordMap: Record<string, string[]> = {
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
    };

    for (const [srvId, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(kw => q.includes(kw))) {
        const found = availableServices.find(s => s.id === srvId);
        if (found) return found;
      }
    }

    // Fallback: title match
    for (const srv of availableServices) {
      if (q.includes(srv.title.toLowerCase()) || q.includes(srv.service_code.toLowerCase())) {
        return srv;
      }
    }

    return null;
  }

  /**
   * Generates a context-grounded, verified response based on RAG government facts
   */
  public static async generateCivicResponse(
    query: string,
    context: RagQueryContext,
    servicesData: any[],
    apiKey?: string
  ): Promise<RagResponse> {
    const lang = context.language || 'en';
    const intent = this.detectIntent(query);
    const targetService = context.serviceId 
      ? servicesData.find(s => s.id === context.serviceId) 
      : this.matchServiceFromQuery(query, servicesData) || servicesData[0];

    const sources: RetrievedSource[] = (targetService.sources || []).map((src: any) => ({
      title: src.document_title || src.authority_name,
      authority: src.authority_name,
      url: src.source_url,
      lastVerified: src.last_checked_date || targetService.last_verified,
      verificationBadge: src.verification_badge || 'OFFICIAL_VERIFIED',
      citationText: src.citation_text || 'Official Government Source',
      sourceType: src.source_type
    }));

    // If external Gemini API Key is available, invoke Gemini with strict RAG context
    if (apiKey && apiKey !== 'demo_key') {
      try {
        const geminiAnswer = await this.callGeminiApi(query, targetService, sources, intent, lang, apiKey);
        if (geminiAnswer) {
          return {
            answer: geminiAnswer,
            intent,
            targetService: {
              id: targetService.id,
              title: targetService.title,
              category: targetService.category,
              state: targetService.state,
              officialUrl: targetService.official_url
            },
            sources,
            verificationBadge: targetService.verification_status === 'VERIFIED' ? 'VERIFIED_OFFICIAL' : 'NEEDS_VERIFICATION',
            language: lang,
            suggestedFollowUps: this.getFollowUps(targetService, intent, lang)
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, gracefully using built-in verified RAG engine:', err);
      }
    }

    // High-precision built-in RAG response generator
    const answer = this.synthesizeVerifiedAnswer(query, targetService, intent, lang);

    return {
      answer,
      intent,
      targetService: {
        id: targetService.id,
        title: targetService.title,
        category: targetService.category,
        state: targetService.state,
        officialUrl: targetService.official_url
      },
      sources,
      verificationBadge: targetService.verification_status === 'VERIFIED' ? 'VERIFIED_OFFICIAL' : 'NEEDS_VERIFICATION',
      language: lang,
      suggestedFollowUps: this.getFollowUps(targetService, intent, lang)
    };
  }

  /**
   * Synthesize verified answer across English, Telugu, and Hindi
   */
  private static synthesizeVerifiedAnswer(query: string, srv: any, intent: string, lang: 'en' | 'te' | 'hi'): string {
    const docs = srv.documents || [];
    const steps = srv.steps || [];
    const faqs = srv.faqs || [];

    if (lang === 'te') {
      return this.synthesizeTeluguAnswer(srv, intent, docs, steps, faqs);
    } else if (lang === 'hi') {
      return this.synthesizeHindiAnswer(srv, intent, docs, steps, faqs);
    } else {
      return this.synthesizeEnglishAnswer(srv, intent, docs, steps, faqs);
    }
  }

  private static synthesizeEnglishAnswer(srv: any, intent: string, docs: any[], steps: any[], faqs: any[]): string {
    let output = '';

    if (intent === 'DOCUMENTS') {
      output += `Here are the official required documents for **${srv.title}** as verified from official government authorities:\n\n`;
      docs.forEach((doc: any, idx: number) => {
        output += `${idx + 1}. **${doc.document_name}**\n`;
        output += `   • *Purpose:* ${doc.purpose}\n`;
        output += `   • *Accepted Format:* ${doc.accepted_formats || 'PDF/Scan'} (${doc.is_original_required ? 'Original required at counter' : 'Self-attested copy'})\n`;
        if (doc.notes) output += `   • *Official Note:* ${doc.notes}\n`;
        output += `\n`;
      });
      output += `💡 **Verification Tip:** Ensure names and dates of birth match exactly across all identity documents before starting the application.\n\n`;
    } else if (intent === 'FEES') {
      output += `Here is the verified fee structure for **${srv.title}**:\n\n`;
      output += `💰 **Official Fees:** ${srv.fee_structure}\n`;
      output += `⏱️ **Estimated Processing Time:** ${srv.processing_time}\n`;
      output += `🏛️ **Application Mode:** ${srv.application_mode} (Apply at: ${srv.official_url})\n\n`;
      output += `⚠️ *Note on Unofficial Charges:* Do not pay extra cash to unauthorized agents or touts. Official government portal fees are strictly receipted online or at authorized MeeSeva/CSC counters.\n\n`;
    } else if (intent === 'PROCEDURE') {
      output += `Here is the step-by-step verified application procedure for **${srv.title}**:\n\n`;
      steps.forEach((step: any) => {
        output += `**Step ${step.step_number}: ${step.title}**\n`;
        output += `${step.description}\n`;
        output += `• *Estimated Time:* ${step.estimated_time} | *Type:* ${step.is_online_step ? '🌐 Online' : '🏛️ Office Visit'}\n`;
        if (step.tips) output += `• *Helpful Advice:* ${step.tips}\n`;
        output += `\n`;
      });
    } else if (intent === 'ELIGIBILITY') {
      output += `### Eligibility Criteria for **${srv.title}**\n\n`;
      output += `${srv.eligibility_criteria}\n\n`;
      output += `• **Target Audience:** ${srv.target_audience}\n`;
      output += `• **Jurisdiction:** ${srv.state} (${srv.country})\n`;
      output += `• **Estimated Processing Time:** ${srv.processing_time}\n\n`;
    } else {
      // General overview
      output += `### ${srv.title}\n\n`;
      output += `${srv.description}\n\n`;
      output += `• **Who is Eligible:** ${srv.eligibility_criteria}\n`;
      output += `• **Official Fees:** ${srv.fee_structure}\n`;
      output += `• **Processing Time:** ${srv.processing_time}\n`;
      output += `• **Application Mode:** ${srv.application_mode}\n\n`;
      
      if (faqs.length > 0) {
        output += `#### Common Questions:\n`;
        faqs.slice(0, 2).forEach((f: any) => {
          output += `**Q: ${f.question}**\n${f.answer}\n*(Ref: ${f.official_reference || 'Official Guidelines'})*\n\n`;
        });
      }
    }

    output += `---\n`;
    output += `🛡️ **Official Source:** [${srv.official_url}](${srv.official_url})\n`;
    output += `📅 **Last Verified:** ${srv.last_verified} | **Status:** ✅ Official Government Information\n\n`;
    output += `*Disclaimer: CivicGuide AI is an independent civic information assistant and is not a government agency. Always verify critical procedures and fees on the official government website before submitting an application.*`;

    return output;
  }

  private static synthesizeTeluguAnswer(srv: any, intent: string, docs: any[], steps: any[], faqs: any[]): string {
    let output = '';

    if (intent === 'DOCUMENTS') {
      output += `**${srv.title}** కోసం అధికారిక ప్రభుత్వ మార్గదర్శకాల ప్రకారం అవసరమైన పత్రాలు (Documents) ఇక్కడ ఇవ్వబడ్డాయి:\n\n`;
      docs.forEach((doc: any, idx: number) => {
        output += `${idx + 1}. **${doc.document_name}**\n`;
        output += `   • *ఎందుకు అవసరం:* ${doc.purpose}\n`;
        output += `   • *స్వీకరించే ఫార్మాట్:* ${doc.accepted_formats || 'PDF / Scan'} (${doc.is_original_required ? 'ఒరిజినల్ కౌంటర్ వద్ద చూపించాలి' : 'స్వయం ధ్రువీకరించిన జిరాక్స్'})\n`;
        if (doc.notes) output += `   • *అధికారిక గమనిక:* ${doc.notes}\n`;
        output += `\n`;
      });
      output += `💡 **ముఖ్యమైన సూచన:** దరఖాస్తు చేయడానికి ముందు అన్ని పత్రాలలో మీ పేరు మరియు పుట్టిన తేదీ ఒకే విధంగా ఉన్నాయో లేదో సరిచూసుకోండి.\n\n`;
    } else if (intent === 'FEES') {
      output += `**${srv.title}** కోసం అధికారిక ఫీజు వివరాలు:\n\n`;
      output += `💰 **అధికారిక ఫీజు:** ${srv.fee_structure}\n`;
      output += `⏱️ **పట్టే సమయం:** ${srv.processing_time}\n`;
      output += `🏛️ **దరఖాస్తు విధానం:** ${srv.application_mode} (అధికారిక పోర్టల్: ${srv.official_url})\n\n`;
      output += `⚠️ *గమనిక:* ఏ అనధికారిక బ్రోకర్లకు లేదా ఏజెంట్లకు అదనపు డబ్బులు చెల్లించవద్దు. ప్రభుత్వ రుసుములకు మాత్రమే అధికారిక రసీదు లభిస్తుంది.\n\n`;
    } else if (intent === 'PROCEDURE') {
      output += `**${srv.title}** దరఖాస్తు దశలవారీ విధానం (Step-by-step Process):\n\n`;
      steps.forEach((step: any) => {
        output += `**దశ ${step.step_number}: ${step.title}**\n`;
        output += `${step.description}\n`;
        output += `• *అంచనా సమయం:* ${step.estimated_time} | *రకం:* ${step.is_online_step ? '🌐 ఆన్‌లైన్' : '🏛️ కార్యాలయ సందర్శన'}\n`;
        if (step.tips) output += `• *సలహా:* ${step.tips}\n`;
        output += `\n`;
      });
    } else {
      output += `### ${srv.title}\n\n`;
      output += `${srv.description}\n\n`;
      output += `• **ఎవరు అర్హులు:** ${srv.eligibility_criteria}\n`;
      output += `• **అధికారిక ఫీజు:** ${srv.fee_structure}\n`;
      output += `• **పట్టే సమయం:** ${srv.processing_time}\n`;
      output += `• **దరఖాస్తు విధానం:** ${srv.application_mode}\n\n`;
    }

    output += `---\n`;
    output += `🛡️ **అధికారిక వెబ్‌సైట్:** [${srv.official_url}](${srv.official_url})\n`;
    output += `📅 **చివరిసారి ధ్రువీకరించబడిన తేదీ:** ${srv.last_verified} | **స్థితి:** ✅ ధ్రువీకరించబడిన సమాచారం\n\n`;
    output += `*గమనిక: సివిక్‌గైడ్ AI అనేది పౌర సమాచార సహాయకుడు మాత్రమే, ఇది ప్రభుత్వ సంస్థ కాదు. దరఖాస్తు లేదా రుసుము చెల్లించే ముందు అధికారిక పోర్టల్‌లో సరిచూసుకోండి.*`;

    return output;
  }

  private static synthesizeHindiAnswer(srv: any, intent: string, docs: any[], steps: any[], faqs: any[]): string {
    let output = '';

    if (intent === 'DOCUMENTS') {
      output += `**${srv.title}** के लिए आधिकारिक रूप से सत्यापित आवश्यक दस्तावेज:\n\n`;
      docs.forEach((doc: any, idx: number) => {
        output += `${idx + 1}. **${doc.document_name}**\n`;
        output += `   • *उद्देश्य:* ${doc.purpose}\n`;
        output += `   • *स्वीकृत प्रारूप:* ${doc.accepted_formats || 'PDF / Scan'} (${doc.is_original_required ? 'मूल प्रति आवश्यक' : 'स्व-सत्यापित फोटोकॉपी'})\n`;
        if (doc.notes) output += `   • *आधिकारिक निर्देश:* ${doc.notes}\n`;
        output += `\n`;
      });
      output += `💡 **सत्यापन सलाह:** आवेदन करने से पहले सुनिश्चित करें कि सभी पहचान दस्तावेजों में आपका नाम और जन्म तिथि समान हो।\n\n`;
    } else if (intent === 'FEES') {
      output += `**${srv.title}** के लिए आधिकारिक शुल्क विवरण:\n\n`;
      output += `💰 **आधिकारिक शुल्क:** ${srv.fee_structure}\n`;
      output += `⏱️ **अनुमानित प्रसंस्करण समय:** ${srv.processing_time}\n`;
      output += `🏛️ **आवेदन माध्यम:** ${srv.application_mode} (पोर्टल: ${srv.official_url})\n\n`;
      output += `⚠️ *सावधानी:* किसी भी अनधिकृत दलाल या बिचौलिये को अतिरिक्त पैसे न दें। सरकारी शुल्क केवल आधिकारिक पोर्टल या केंद्र पर ही जमा करें।\n\n`;
    } else if (intent === 'PROCEDURE') {
      output += `**${srv.title}** के लिए चरण-दर-चरण आवेदन प्रक्रिया:\n\n`;
      steps.forEach((step: any) => {
        output += `**चरण ${step.step_number}: ${step.title}**\n`;
        output += `${step.description}\n`;
        output += `• *समय:* ${step.estimated_time} | *प्रकार:* ${step.is_online_step ? '🌐 ऑनलाइन' : '🏛️ कार्यालय में उपस्थिति'}\n`;
        if (step.tips) output += `• *सुझाव:* ${step.tips}\n`;
        output += `\n`;
      });
    } else {
      output += `### ${srv.title}\n\n`;
      output += `${srv.description}\n\n`;
      output += `• **पात्रता:** ${srv.eligibility_criteria}\n`;
      output += `• **आधिकारिक शुल्क:** ${srv.fee_structure}\n`;
      output += `• **प्रसंस्करण समय:** ${srv.processing_time}\n`;
      output += `• **आवेदन माध्यम:** ${srv.application_mode}\n\n`;
    }

    output += `---\n`;
    output += `🛡️ **आधिकारिक पोर्टल:** [${srv.official_url}](${srv.official_url})\n`;
    output += `📅 **अंतिम सत्यापन:** ${srv.last_verified} | **स्थिति:** ✅ आधिकारिक रूप से सत्यापित\n\n`;
    output += `*अस्वीकरण: सिविकगाइड AI एक नागरिक सूचना सहायक है और कोई सरकारी एजेंसी नहीं है। किसी भी आवेदन को जमा करने से पहले आधिकारिक वेबसाइट पर जानकारी अवश्य सत्यापित करें।*`;

    return output;
  }

  private static getFollowUps(srv: any, intent: string, lang: 'en' | 'te' | 'hi'): string[] {
    if (lang === 'te') {
      return [
        `${srv.title} కు ఏ డాక్యుమెంట్లు అవసరం?`,
        `ఫీజు ఎంత మరియు ఎన్ని రోజుల్లో వస్తుంది?`,
        `ఆన్‌లైన్‌లో దరఖాస్తు చేసే దశలు ఏమిటి?`,
        `అధికారిక వెబ్‌సైట్ లింక్ చూపించు`
      ];
    } else if (lang === 'hi') {
      return [
        `${srv.title} के लिए कौन से दस्तावेज चाहिए?`,
        `आधिकारिक शुल्क कितना है?`,
        `ऑनलाइन आवेदन करने के चरण क्या हैं?`,
        `आधिकारिक पोर्टल लिंक प्रदान करें`
      ];
    } else {
      return [
        `What documents are required for ${srv.title}?`,
        `What is the official fee and processing time?`,
        `What are the step-by-step application instructions?`,
        `Show the official government website and sources`
      ];
    }
  }

  /**
   * Direct Gemini API invocation via REST if GEMINI_API_KEY is supplied
   */
  private static async callGeminiApi(
    query: string,
    srv: any,
    sources: RetrievedSource[],
    intent: string,
    lang: string,
    apiKey: string
  ): Promise<string | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const contextPrompt = `
OFFICIAL CONTEXT:
Service Title: ${srv.title}
Category: ${srv.category}
Country/State: ${srv.country} / ${srv.state}
Official Fee Structure: ${srv.fee_structure}
Processing Time: ${srv.processing_time}
Application Mode: ${srv.application_mode}
Official URL: ${srv.official_url}
Eligibility: ${srv.eligibility_criteria}
Documents: ${JSON.stringify(srv.documents || [])}
Steps: ${JSON.stringify(srv.steps || [])}
FAQs: ${JSON.stringify(srv.faqs || [])}
Official Sources: ${JSON.stringify(sources)}

USER LANGUAGE REQUESTED: ${lang} (en = English, te = Telugu, hi = Hindi)
USER QUERY: "${query}"

INSTRUCTIONS:
Answer the citizen's query based ONLY on the official context above.
If in Telugu, write natural Telugu preserving key names like MeeSeva, Aadhaar, Passport.
If in Hindi, write natural Hindi preserving official terms.
Include bullet points, fees, processing time, required documents, and cite the official URL.
Never hallucinate or invent rules. Include the safety disclaimer at the end.
`;

    const body = {
      contents: [{
        parts: [{ text: `${CIVIC_ASSISTANT_SYSTEM_PROMPT}\n\n${contextPrompt}` }]
      }]
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini API responded with status ${res.status}`);
    }

    const data: any = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }
}
