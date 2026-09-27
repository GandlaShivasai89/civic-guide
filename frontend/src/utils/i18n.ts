export type Language = 'en' | 'te' | 'hi';

export interface Translations {
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  popularSearches: string;
  disclaimer: string;
  officialSource: string;
  lastVerified: string;
  verifiedBadge: string;
  needsVerificationBadge: string;
  viewDetails: string;
  checklist: string;
  askAi: string;
  allCategories: string;
  allStates: string;
  filterBy: string;
  department: string;
  applicationMode: string;
  processingTime: string;
  fees: string;
  eligibility: string;
  documentsRequired: string;
  stepsProcedure: string;
  faqs: string;
  officialSources: string;
  myApplications: string;
  reminders: string;
  adminPortal: string;
  login: string;
  logout: string;
  getGuidance: string;
  guidanceTitle: string;
  close: string;
  save: string;
  ready: string;
  notReady: string;
  uploaded: string;
  progressReady: string;
  status: string;
  referenceNumber: string;
  appliedOn: string;
  nextAction: string;
  addApplication: string;
  newReminder: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  en: {
    tagline: 'CivicGuide AI – Government Process Assistant',
    heroTitle: 'Government Services, Explained Simply.',
    heroSubtitle: 'Clear step-by-step guidance, required documents checklists, official fee schedules, and verified government sources for ordinary citizens.',
    searchPlaceholder: 'What government service do you need? (e.g. passport, driving licence, income certificate...)',
    popularSearches: 'Popular searches:',
    disclaimer: 'CivicGuide AI is an independent information assistant and is not a government agency. Always verify critical procedures, fees, and requirements on the official government website before applying.',
    officialSource: 'Official Government Portal',
    lastVerified: 'Last Verified',
    verifiedBadge: 'Verified Official Information',
    needsVerificationBadge: 'Needs Re-verification',
    viewDetails: 'View Process & Steps',
    checklist: 'Document Checklist',
    askAi: 'Ask CivicGuide AI',
    allCategories: 'All Categories',
    allStates: 'All States / Pan-India',
    filterBy: 'Filter Services',
    department: 'Department',
    applicationMode: 'Mode',
    processingTime: 'Processing Time',
    fees: 'Official Fees',
    eligibility: 'Who is Eligible',
    documentsRequired: 'Required Documents Checklist',
    stepsProcedure: 'Step-by-Step Procedure',
    faqs: 'Frequently Asked Questions',
    officialSources: 'Official Sources & Citations',
    myApplications: 'My Applications',
    reminders: 'Reminders',
    adminPortal: 'Admin Console',
    login: 'Sign In / Register',
    logout: 'Sign Out',
    getGuidance: 'Personalized Checklist Wizard',
    guidanceTitle: 'Personalized Government Guidance',
    close: 'Close',
    save: 'Save',
    ready: 'Ready',
    notReady: 'Not Ready',
    uploaded: 'Uploaded / Scanned',
    progressReady: 'documents ready',
    status: 'Status',
    referenceNumber: 'Reference / Application ID',
    appliedOn: 'Applied Date',
    nextAction: 'Next Action',
    addApplication: 'Track Application',
    newReminder: 'Add Reminder'
  },
  te: {
    tagline: 'సివిక్‌గైడ్ AI – ప్రభుత్వ సేవల సహాయకుడు',
    heroTitle: 'ప్రభుత్వ సేవలు, సరళమైన వివరణ.',
    heroSubtitle: 'సాధారణ పౌరుల కోసం అధికారిక మార్గదర్శకాలు, అవసరమైన పత్రాల చెక్‌లిస్ట్, ఖచ్చితమైన ఫీజుల వివరాలు మరియు ధ్రువీకరించబడిన ప్రభుత్వ వనరులు.',
    searchPlaceholder: 'మీకు ఏ ప్రభుత్వ సేవ కావాలో వెతకండి (ఉదా: పాస్‌పోర్ట్, డ్రైవింగ్ లైసెన్స్, ఆదాయ ధ్రువీకరణ...)?',
    popularSearches: 'ప్రజాదరణ పొందిన శోధనలు:',
    disclaimer: 'సివిక్‌గైడ్ AI ఒక స్వతంత్ర సమాచార సహాయకుడు మాత్రమే, ఇది ప్రభుత్వ శాఖ కాదు. దరఖాస్తు చేసుకునే ముందు అధికారిక పోర్టల్‌లో నిబంధనలు సరిచూసుకోండి.',
    officialSource: 'అధికారిక ప్రభుత్వ పోర్టల్',
    lastVerified: 'చివరిగా ధ్రువీకరించిన తేదీ',
    verifiedBadge: 'అధికారికంగా ధ్రువీకరించబడింది',
    needsVerificationBadge: 'సమీక్ష అవసరం',
    viewDetails: 'విధానం & దశలు చూడండి',
    checklist: 'పత్రాల చెక్‌లిస్ట్',
    askAi: 'సివిక్‌గైడ్ AI ని అడగండి',
    allCategories: 'అన్ని విభాగాలు',
    allStates: 'తెలంగాణ / జాతీయ సేవలు',
    filterBy: 'వడపోత (Filters)',
    department: 'శాఖ / విభాగం',
    applicationMode: 'దరఖాస్తు విధానం',
    processingTime: 'పట్టే సమయం',
    fees: 'అధికారిక ఫీజు',
    eligibility: 'ఎవరు అర్హులు',
    documentsRequired: 'అవసరమైన పత్రాల చెక్‌లిస్ట్',
    stepsProcedure: 'దశలవారీ దరఖాస్తు విధానం',
    faqs: 'తరచుగా అడిగే ప్రశ్నలు (FAQs)',
    officialSources: 'అధికారిక ఆధారాలు & లింకులు',
    myApplications: 'నా దరఖాస్తులు',
    reminders: 'రిమైండర్లు',
    adminPortal: 'అడ్మిన్ పోర్టల్',
    login: 'లాగిన్ / రిజిస్టర్',
    logout: 'లాగౌట్',
    getGuidance: 'వ్యక్తిగతీకరించిన గైడెన్స్ విజార్డ్',
    guidanceTitle: 'వ్యక్తిగత సహాయ సూచిక',
    close: 'మూసివేయి',
    save: 'భద్రపరుచు',
    ready: 'సిద్ధంగా ఉంది',
    notReady: 'సిద్ధం కాలేదు',
    uploaded: 'అప్‌లోడ్ చేసాను',
    progressReady: 'పత్రాలు సిద్ధమయ్యాయి',
    status: 'స్థితి (Status)',
    referenceNumber: 'దరఖాస్తు నంబర్ / టోకెన్',
    appliedOn: 'దరఖాస్తు చేసిన తేదీ',
    nextAction: 'తదుపరి చర్య',
    addApplication: 'దరఖాస్తును ట్రాక్ చేయండి',
    newReminder: 'రిమైండర్ జోడించండి'
  },
  hi: {
    tagline: 'सिविकगाइड AI – सरकारी प्रक्रिया सहायक',
    heroTitle: 'सरकारी सेवाएं, आसान भाषा में।',
    heroSubtitle: 'नागरिकों के लिए आधिकारिक दिशा-निर्देश, आवश्यक दस्तावेजों की चेकलिस्ट, सरकारी शुल्क और आधिकारिक स्रोतों की सटीक जानकारी।',
    searchPlaceholder: 'आपको किस सरकारी सेवा की जानकारी चाहिए? (उदा. पासपोर्ट, ड्राइविंग लाइसेंस, आय प्रमाण पत्र...)?',
    popularSearches: 'प्रमुख खोजें:',
    disclaimer: 'सिविकगाइड AI एक स्वतंत्र सूचना सहायक है और यह कोई सरकारी एजेंसी नहीं है। किसी भी आवेदन से पूर्व आधिकारिक सरकारी पोर्टल पर नियमों की पुष्टि अवश्य करें।',
    officialSource: 'आधिकारिक सरकारी पोर्टल',
    lastVerified: 'अंतिम सत्यापन',
    verifiedBadge: 'सत्यापित आधिकारिक सूचना',
    needsVerificationBadge: 'पुनर्सत्यापन आवश्यक',
    viewDetails: 'प्रक्रिया एवं चरण देखें',
    checklist: 'दस्तावेज चेकलिस्ट',
    askAi: 'सिविकगाइड AI से पूछें',
    allCategories: 'सभी श्रेणियां',
    allStates: 'सभी राज्य / अखिल भारतीय',
    filterBy: 'फ़िल्टर करें',
    department: 'विभाग',
    applicationMode: 'आवेदन माध्यम',
    processingTime: 'प्रसंस्करण समय',
    fees: 'सरकारी शुल्क',
    eligibility: 'कौन पात्र है',
    documentsRequired: 'आवश्यक दस्तावेज चेकलिस्ट',
    stepsProcedure: 'चरण-दर-चरण आवेदन प्रक्रिया',
    faqs: 'अक्सर पूछे जाने वाले प्रश्न',
    officialSources: 'आधिकारिक स्रोत एवं साक्ष्य',
    myApplications: 'मेरे आवेदन',
    reminders: 'अनुस्मारक (Reminders)',
    adminPortal: 'एडमिन पोर्टल',
    login: 'लॉग इन / पंजीकरण',
    logout: 'लॉग आउट',
    getGuidance: 'व्यक्तिगत मार्गदर्शन विज़ार्ड',
    guidanceTitle: 'व्यक्तिगत नागरिक मार्गदर्शन',
    close: 'बंद करें',
    save: 'सुरक्षित करें',
    ready: 'तैयार है',
    notReady: 'तैयार नहीं',
    uploaded: 'अपलोड / स्कैन किया',
    progressReady: 'दस्तावेज तैयार',
    status: 'स्थिति',
    referenceNumber: 'आवेदन संख्या / संदर्भ आईडी',
    appliedOn: 'आवेदन तिथि',
    nextAction: 'अगली कार्रवाई',
    addApplication: 'आवेदन ट्रैक करें',
    newReminder: 'रिमाइंडर जोड़ें'
  }
};
