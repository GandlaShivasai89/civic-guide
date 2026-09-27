// CivicGuide AI - Complete Multilingual Dictionary (English, Telugu, Hindi)
// Provides full UI translation and service catalog translation across all 3 languages.

export const DICTIONARY = {
  en: {
    // Branding & Header
    tagline: 'CivicGuide AI – Government Process Assistant',
    brandTitle: 'CivicGuide',
    brandSub: 'Government Process Assistant',
    officialNotice: 'OFFICIAL NOTICE: CivicGuide AI is an independent citizen information assistant. Always verify critical procedures and fees on official government websites (.gov.in / .nic.in).',
    disclaimer: 'CivicGuide AI is an independent citizen information assistant. Always verify critical procedures and fees on official government websites (.gov.in / .nic.in).',

    // Navigation Tabs
    navServices: 'Services',
    navChat: 'Ask Civic AI',
    navApplications: 'My Applications',
    navReminders: 'Reminders',
    navAdmin: 'Admin Console',
    btnWizard: 'Personalized Checklist',
    btnLogin: 'Sign In',
    btnLogout: 'Sign Out',
    welcomeUser: 'Welcome',

    // Login Gateway Screen ("First I want login and next")
    loginGatewayTitle: 'CivicGuide AI Citizen Portal',
    loginGatewaySubtitle: 'Secure, transparent citizen navigation for Indian public services, document checklists, and statutory fee schedules.',
    tabSignIn: 'Sign In to Portal',
    tabRegister: 'New Citizen Registration',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    fullNameLabel: 'Full Name',
    stateLabel: 'State / Territory',
    districtLabel: 'District / City',
    btnSignInAction: 'Access Citizen Portal',
    btnRegisterAction: 'Create Citizen Account',
    quickDemoTitle: 'Quick Instant Access (No typing needed):',
    demoCitizenBtn: '👤 1-Click Demo Citizen (Shiva Sai)',
    demoAdminBtn: '🛡️ 1-Click Demo Administrator',
    continueGuestBtn: '🚀 Continue as Guest Citizen',
    guestNotice: 'You can explore all services, check official fees, and chat with AI in guest mode.',
    trustBadge1: '🏛️ Verified .gov.in Portals',
    trustBadge2: '₹0 Zero Brokerage',
    trustBadge3: '⚖️ Gazette Rule Grounded',
    trustBadge4: '🌐 3 Official Languages',

    // Hero Section
    nationalInitiative: 'National Citizen Information Initiative',
    heroTitle: 'Government Services, Explained Simply.',
    heroSubtitle: 'Clear step-by-step guidance, required documents checklists, official fee schedules, and verified government sources for ordinary citizens.',
    searchPlaceholder: 'What government service do you need? (e.g. passport, driving licence, income certificate...)',
    popularSearches: 'Popular searches:',

    // Metric Cards
    metricPortalsVal: '12+',
    metricPortalsLbl: 'Official Portals',
    metricRagVal: '100%',
    metricRagLbl: 'Grounded RAG',
    metricToutsVal: 'Zero',
    metricToutsLbl: 'Touts Guarantee',
    metricLangVal: '3',
    metricLangLbl: 'Languages (EN/TE/HI)',

    // Categories
    catAll: 'All Categories',
    catIdentity: 'Identity & Citizenship',
    catTransport: 'Transport & Driving',
    catRevenue: 'Revenue & Certificates',
    catCivil: 'Civil Registration',
    catBusiness: 'Business & Taxation',
    catEducation: 'Education & Scholarships',

    // Filters
    filterJurisdiction: 'JURISDICTION:',
    filterMode: 'MODE:',
    allStates: 'All States / Pan-India',
    allModes: 'All Modes',
    modeOnline: 'Online Portal',
    modeOffline: 'Offline Office',
    modeHybrid: 'Hybrid (Online + Physical)',
    serviceCountSuffix: 'verified public services available',

    // Service Card
    lblDept: 'Department:',
    lblProcessing: 'Processing Time:',
    lblFees: 'Statutory Fee:',
    lblMode: 'Mode:',
    btnViewDetails: 'View Process & Steps',
    btnSave: 'Bookmark',
    btnSaved: 'Bookmarked',
    badgeOfficial: 'Verified Official',
    badgeReview: 'Needs Review',
    freeFee: 'FREE (₹0)',

    // Service Detail Modal
    tabOverview: 'Overview',
    tabChecklist: 'Document Checklist',
    tabSteps: 'Step-by-Step Procedure',
    tabSources: 'Official Sources & Fees',
    lblEligibility: 'Who is Eligible:',
    lblGovFee: 'Statutory Government Fee (No Broker Markup):',
    lblDeptAuthority: 'Department Authority:',
    lblHelpline: 'Official Helpline:',
    btnVisitPortal: 'Visit Verified Official Portal',
    btnClose: 'Close',
    docsChecklistTitle: 'Interactive Document Readiness Checklist',
    checklistSubtitle: 'Mark each document as ready before beginning your application to avoid delays or rejection.',
    statusReady: 'Ready',
    statusNotReady: 'Not Ready',
    statusUploaded: 'Uploaded / Scanned',
    timelineStepsTitle: 'Official Standard Operating Procedure',
    timelineSubtitle: 'Follow these sequential steps on the official government website or at the designated department office.',
    sourcesTitle: 'Official Citations & Verified Government Deep Links',
    sourcesSubtitle: 'CivicGuide AI links exclusively to authentic .gov.in and state portals with gazette-backed accuracy.',

    // AI Chat Drawer
    chatTitle: 'CivicGuide AI Assistant',
    chatSubtitle: 'Grounded Citizen Intelligence • Zero Hallucination',
    chatWelcome: 'Namaste! I am CivicGuide AI, your official government process assistant. Ask me anything about required documents, statutory fees, eligibility criteria, or procedures for public services in India.',
    chatPlaceholder: 'Ask a government service question (e.g. passport documents, DL fee)...',
    chatSendBtn: 'Send',
    chatQuick1: 'What documents are required for passport?',
    chatQuick2: 'How much is driving licence fee?',
    chatQuick3: 'Explain Non-ECR vs ECR passport',
    chatQuick4: 'What is MeeSeva Income Certificate?',

    // Personalized Wizard Modal
    wizardTitle: 'Personalized Citizen Guidance Wizard',
    wizardSubtitle: 'Tell us a bit about yourself to receive a customized checklist tailored to your age, state, and occupation.',
    wizStateLbl: 'State of Residence:',
    wizAgeLbl: 'Your Age Group:',
    wizAgeAdult: 'Adult (18 - 59 years)',
    wizAgeMinor: 'Minor (Below 18 years)',
    wizAgeSenior: 'Senior Citizen (60+ years)',
    wizOccLbl: 'Occupation Category:',
    wizOccCitizen: 'General Citizen',
    wizOccStudent: 'Student',
    wizOccBusiness: 'Business Owner / Entrepreneur',
    wizOccGovt: 'Government Employee',
    wizServiceLbl: 'Target Government Service:',
    btnGenerateGuidance: 'Generate My Custom Checklist',
    wizardResultTitle: 'Your Tailored Document Checklist & Next Steps',

    // Applications Tracker
    appsTitle: 'My Government Applications',
    appsSubtitle: 'Track your reference tokens, submission dates, and next statutory steps in one place.',
    btnNewApp: '+ Track New Application',
    colService: 'Service',
    colRefNum: 'Reference / Token Number',
    colStatus: 'Status',
    colDate: 'Applied Date',
    colNextStep: 'Next Action',
    colActions: 'Actions',
    emptyApps: 'No applications tracked yet. Click "+ Track New Application" above to begin monitoring your submissions.',
    modalNewAppTitle: 'Track a Government Application',
    lblSelectService: 'Select Government Service:',
    lblRefNumber: 'Application Reference / ACK Number:',
    lblInitialStatus: 'Current Status:',
    statusSubmitted: 'SUBMITTED',
    statusUnderReview: 'UNDER REVIEW',
    statusApproved: 'APPROVED / ISSUED',
    statusActionRequired: 'ACTION REQUIRED',
    btnSaveApp: 'Save Application',

    // Reminders
    remindersTitle: 'Government Expiry & Renewal Reminders',
    remindersSubtitle: 'Never miss a passport renewal, driving licence revalidation, or scholarship deadline.',
    btnNewReminder: '+ Add Reminder',
    emptyReminders: 'No active reminders. Add one to track passport renewals or certificate expiry dates.',
    modalNewReminderTitle: 'Add a Government Renewal Reminder',
    lblReminderTitle: 'Reminder Title (e.g. Passport Expiry):',
    lblDueDate: 'Due / Expiry Date:',
    lblNotes: 'Important Notes / Document Requirements:',
    btnSaveReminder: 'Save Reminder',

    // Admin Console
    adminTitle: 'Administrative Verification & Telemetry',
    adminSubtitle: 'Monitor official source status, audit trail records, and government gazette accuracy.',
    statTotalServices: 'Total Services',
    statVerified: 'Verified Sources',
    statPending: 'Pending Review',
    statAudits: 'Total Audits Conducted',
    recentAuditsTitle: 'Recent Official Source Verifications',

    // Footer
    footerDesc: 'An authoritative, open citizen platform designed to demystify complex government documentation, statutory fee structures, and application procedures across Indian public departments.',
    footerPortalsTitle: 'Official Working Portals',
    footerAssuranceTitle: 'Assurance & Standards',
    assurance1: 'Zero Broker Policy',
    assurance2: '100% Official Source Citation',
    assurance3: 'Official Gazette Verification',
    assurance4: 'Multi-language Support (EN, TE, HI)',
    footerCopyright: '© 2026 CivicGuide AI. Government Information Assistant. Built for Indian Citizens.',
    footerCompliance: 'Strict Compliance: No legal advice • Non-government entity'
  },

  te: {
    // Branding & Header
    tagline: 'సివిక్‌గైడ్ AI – ప్రభుత్వ సేవల సహాయకుడు',
    brandTitle: 'సివిక్‌గైడ్',
    brandSub: 'ప్రభుత్వ సేవల సహాయకుడు',
    officialNotice: 'అధికారిక గమనిక: సివిక్‌గైడ్ AI ఒక స్వతంత్ర పౌర సమాచార సహాయక వేదిక. దరఖాస్తుకు ముందు అధికారిక ప్రభుత్వ వెబ్‌సైట్లలో (.gov.in / .nic.in) వివరాలు సరిచూసుకోండి.',
    disclaimer: 'సివిక్‌గైడ్ AI ఒక స్వతంత్ర పౌర సమాచార సహాయక వేదిక. దరఖాస్తుకు ముందు అధికారిక ప్రభుత్వ వెబ్‌సైట్లలో (.gov.in / .nic.in) వివరాలు సరిచూసుకోండి.',

    // Navigation Tabs
    navServices: 'ప్రభుత్వ సేవలు',
    navChat: 'సివిక్ AI ని అడగండి',
    navApplications: 'నా దరఖాస్తులు',
    navReminders: 'రిమైండర్లు',
    navAdmin: 'అడ్మిన్ కన్సోల్',
    btnWizard: 'వ్యక్తిగత చెక్‌లిస్ట్',
    btnLogin: 'లాగిన్ చేయండి',
    btnLogout: 'లాగౌట్',
    welcomeUser: 'స్వాగతం',

    // Login Gateway Screen
    loginGatewayTitle: 'సివిక్‌గైడ్ AI పౌర పోర్టల్',
    loginGatewaySubtitle: 'భారతీయ ప్రభుత్వ సేవలు, అవసరమైన పత్రాల చెక్‌లిస్ట్ మరియు అధికారిక ఫీజుల వివరాల కోసం సురక్షితమైన వేదిక.',
    tabSignIn: 'పోర్టల్‌లోకి లాగిన్ అవ్వండి',
    tabRegister: 'కొత్త పౌరుడి నమోదు (రిజిస్ట్రేషన్)',
    emailLabel: 'ఈమెయిల్ చిరునామా',
    passwordLabel: 'పాస్‌వర్డ్',
    fullNameLabel: 'పూర్తి పేరు',
    stateLabel: 'రాష్ట్రం / ప్రాంతం',
    districtLabel: 'జిల్లా / నగరం',
    btnSignInAction: 'పౌర పోర్టల్‌లోకి ప్రవేశించండి',
    btnRegisterAction: 'కొత్త ఖాతా సృష్టించండి',
    quickDemoTitle: 'తక్షణ ఉచిత ప్రవేశం (టైప్ చేయాల్సిన అవసరం లేదు):',
    demoCitizenBtn: '👤 1-క్లిక్ పౌరుడి డెమో లాగిన్ (శివ సాయి)',
    demoAdminBtn: '🛡️ 1-క్లిక్ అడ్మినిస్ట్రేటర్ డెమో',
    continueGuestBtn: '🚀 గెస్ట్ (అతిథి)గా కొనసాగండి',
    guestNotice: 'గెస్ట్ మోడ్‌లో మీరు అన్ని సేవలను చూడవచ్చు, ఫీజులు తెలుసుకోవచ్చు మరియు AI తో మాట్లాడవచ్చు.',
    trustBadge1: '🏛️ ధ్రువీకరించబడిన .gov.in పోర్టల్స్',
    trustBadge2: '₹0 దళారులు లేని సున్నా ఖర్చు',
    trustBadge3: '⚖️ గెజిట్ నిబంధనల ఆధారితం',
    trustBadge4: '🌐 3 అధికారిక భాషలు',

    // Hero Section
    nationalInitiative: 'జాతీయ పౌర సమాచార వేదిక',
    heroTitle: 'ప్రభుత్వ సేవలు, సులభమైన వివరణ.',
    heroSubtitle: 'సాధారణ పౌరుల కోసం దశలవారీ మార్గదర్శకాలు, అవసరమైన పత్రాల చెక్‌లిస్ట్, ఖచ్చితమైన అధికారిక ఫీజులు మరియు ధ్రువీకరించబడిన ప్రభుత్వ వనరులు.',
    searchPlaceholder: 'మీకు ఏ ప్రభుత్వ సేవ కావాలో వెతకండి (ఉదా: పాస్‌పోర్ట్, డ్రైవింగ్ లైసెన్స్, ఆదాయ సర్టిఫికేట్...)?',
    popularSearches: 'ప్రజాదరణ పొందిన సేవలు:',

    // Metric Cards
    metricPortalsVal: '12+',
    metricPortalsLbl: 'అధికారిక పోర్టల్స్',
    metricRagVal: '100%',
    metricRagLbl: 'ధ్రువీకృత సమాధానాలు',
    metricToutsVal: 'సున్నా',
    metricToutsLbl: 'దళారులు లేని విధానం',
    metricLangVal: '3',
    metricLangLbl: 'అధికారిక భాషలు (EN/TE/HI)',

    // Categories
    catAll: 'అన్ని విభాగాలు',
    catIdentity: 'గుర్తింపు & పౌరసత్వం',
    catTransport: 'రవాణా & డ్రైవింగ్',
    catRevenue: 'రెవెన్యూ & సర్టిఫికేట్లు',
    catCivil: 'పౌర నమోదు (జనన/మరణ)',
    catBusiness: 'వ్యాపారం & పన్నులు',
    catEducation: 'విద్య & ఉపకార వేతనాలు',

    // Filters
    filterJurisdiction: 'రాష్ట్రం:',
    filterMode: 'విధానం:',
    allStates: 'అన్ని రాష్ట్రాలు / జాతీయం',
    allModes: 'అన్ని విధానాలు',
    modeOnline: 'ఆన్‌లైన్ పోర్టల్',
    modeOffline: 'ఆఫ్‌లైన్ కార్యాలయం',
    modeHybrid: 'హైబ్రిడ్ (ఆన్‌లైన్ + ఆఫీస్)',
    serviceCountSuffix: 'ప్రభుత్వ సేవలు అందుబాటులో ఉన్నాయి',

    // Service Card
    lblDept: 'శాఖ / విభాగం:',
    lblProcessing: 'పట్టే సమయం:',
    lblFees: 'అధికారిక ఫీజు:',
    lblMode: 'విధానం:',
    btnViewDetails: 'విధానం & దశలు చూడండి',
    btnSave: 'బుక్‌మార్క్',
    btnSaved: 'భద్రపరిచారు',
    badgeOfficial: 'అధికారికంగా ధ్రువీకరించబడింది',
    badgeReview: 'సమీక్ష అవసరం',
    freeFee: 'ఉచితం (₹0)',

    // Service Detail Modal
    tabOverview: 'అవలోకనం (Overview)',
    tabChecklist: 'పత్రాల చెక్‌లిస్ట్',
    tabSteps: 'దశలవారీ దరఖాస్తు విధానం',
    tabSources: 'అధికారిక ఆధారాలు & ఫీజులు',
    lblEligibility: 'ఎవరు అర్హులు:',
    lblGovFee: 'చట్టబద్ధమైన ప్రభుత్వ ఫీజు (దళారీ ఖర్చు లేదు):',
    lblDeptAuthority: 'అధికారిక శాఖ:',
    lblHelpline: 'హెల్ప్‌లైన్ నంబర్:',
    btnVisitPortal: 'ధ్రువీకరించిన ప్రభుత్వ పోర్టల్‌ను సందర్శించండి',
    btnClose: 'మూసివేయి',
    docsChecklistTitle: 'అవసరమైన పత్రాల సంసిద్ధత చెక్‌లిస్ట్',
    checklistSubtitle: 'దరఖాస్తు తిరస్కరణకు గురికాకుండా ఉండటానికి దరఖాస్తు ప్రారంభించే ముందే ఈ పత్రాలను సిద్ధం చేసుకోండి.',
    statusReady: 'సిద్ధంగా ఉంది',
    statusNotReady: 'సిద్ధం కాలేదు',
    statusUploaded: 'అప్‌లోడ్ చేసాను',
    timelineStepsTitle: 'అధికారిక దశలవారీ విధానం',
    timelineSubtitle: 'అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లో లేదా నియమిత కార్యాలయంలో ఈ కింది క్రమంలో దరఖాస్తు చేయండి.',
    sourcesTitle: 'అధికారిక ఆధారాలు & ప్రభుత్వ లింకులు',
    sourcesSubtitle: 'సివిక్‌గైడ్ AI కేవలం ప్రామాణికమైన .gov.in పోర్టల్స్ మరియు ప్రభుత్వ గెజిట్ ఆదేశాలను మాత్రమే అందిస్తుంది.',

    // AI Chat Drawer
    chatTitle: 'సివిక్‌గైడ్ AI సహాయకుడు',
    chatSubtitle: 'ధ్రువీకరించబడిన ప్రభుత్వ సమాచార మార్గదర్శి • ఖచ్చితమైన సమాధానాలు',
    chatWelcome: 'నమస్కారం! నేను సివిక్‌గైడ్ AI ని. భారతీయ ప్రభుత్వ సేవల దరఖాస్తు విధానం, అవసరమైన పత్రాలు, ప్రభుత్వ ఫీజులు లేదా అర్హతల గురించి నన్ను ఏదైనా అడగండి.',
    chatPlaceholder: 'ప్రభుత్వ సేవల గురించి ఏదైనా అడగండి (ఉదా: పాస్‌పోర్ట్ పత్రాలు, DL ఫీజు)...',
    chatSendBtn: 'పంపండి',
    chatQuick1: 'పాస్‌పోర్ట్ కోసం ఏ డాక్యుమెంట్లు కావాలి?',
    chatQuick2: 'డ్రైవింగ్ లైసెన్స్ ఫీజు ఎంత?',
    chatQuick3: 'నాన్-ECR మరియు ECR పాస్‌పోర్ట్ అంటే ఏమిటి?',
    chatQuick4: 'మీసేవ ఆదాయ సర్టిఫికేట్ ఎలా పొందాలి?',

    // Personalized Wizard Modal
    wizardTitle: 'వ్యక్తిగత పౌర మార్గదర్శక విజార్డ్',
    wizardSubtitle: 'మీ వయస్సు, రాష్ట్రం మరియు వృత్తికి అనుగుణంగా సరైన పత్రాల చెక్‌లిస్ట్‌ను సులభంగా పొందండి.',
    wizStateLbl: 'నివాస రాష్ట్రం:',
    wizAgeLbl: 'మీ వయస్సు విభాగం:',
    wizAgeAdult: 'వయోజనులు (18 - 59 సం.)',
    wizAgeMinor: 'మైనర్ (18 ఏళ్ల లోపు)',
    wizAgeSenior: 'సీనియర్ సిటిజన్ (60+ సం.)',
    wizOccLbl: 'వృత్తి విభాగం:',
    wizOccCitizen: 'సాధారణ పౌరుడు',
    wizOccStudent: 'విద్యార్థి',
    wizOccBusiness: 'వ్యాపారవేత్త / సంస్థ',
    wizOccGovt: 'ప్రభుత్వ ఉద్యోగి',
    wizServiceLbl: 'కావలసిన ప్రభుత్వ సేవ:',
    btnGenerateGuidance: 'నా చెక్‌లిస్ట్‌ను రూపొందించండి',
    wizardResultTitle: 'మీ కోసం ప్రత్యేకంగా సిద్ధం చేసిన చెక్‌లిస్ట్ & తదుపరి చర్యలు',

    // Applications Tracker
    appsTitle: 'నా ప్రభుత్వ దరఖాస్తులు',
    appsSubtitle: 'మీ దరఖాస్తు నంబర్లు, సమర్పించిన తేదీలు మరియు ప్రస్తుత స్థితిని ఒకే చోట ట్రాక్ చేయండి.',
    btnNewApp: '+ కొత్త దరఖాస్తును ట్రాక్ చేయండి',
    colService: 'సేవ',
    colRefNum: 'దరఖాస్తు / టోకెన్ నంబర్',
    colStatus: 'స్థితి',
    colDate: 'దరఖాస్తు తేదీ',
    colNextStep: 'తదుపరి చర్య',
    colActions: 'చర్యలు',
    emptyApps: 'ఇంకా ఎలాంటి దరఖాస్తులు జోడించలేదు. మీ దరఖాస్తును ట్రాక్ చేయడానికి పైన ఉన్న బటన్ క్లిక్ చేయండి.',
    modalNewAppTitle: 'ప్రభుత్వ దరఖాస్తును జోడించండి',
    lblSelectService: 'ప్రభుత్వ సేవను ఎంచుకోండి:',
    lblRefNumber: 'దరఖాస్తు రిఫరెన్స్ / అక్నాలెడ్జ్మెంట్ నంబర్:',
    lblInitialStatus: 'ప్రస్తుత స్థితి:',
    statusSubmitted: 'సమర్పించబడింది (SUBMITTED)',
    statusUnderReview: 'పరిశీలనలో ఉంది (UNDER REVIEW)',
    statusApproved: 'మంజూరు చేయబడింది (APPROVED)',
    statusActionRequired: 'చర్య అవసరం (ACTION REQUIRED)',
    btnSaveApp: 'దరఖాస్తును భద్రపరుచు',

    // Reminders
    remindersTitle: 'ప్రభుత్వ గడువులు & రెన్యూవల్ రిమైండర్లు',
    remindersSubtitle: 'పాస్‌పోర్ట్ గడువు, డ్రైవింగ్ లైసెన్స్ పునరుద్ధరణ లేదా స్కాలర్‌షిప్ చివరి తేదీలను ఎప్పటికీ మర్చిపోకండి.',
    btnNewReminder: '+ రిమైండర్ జోడించండి',
    emptyReminders: 'ప్రస్తుతం ఎలాంటి రిమైండర్లు లేవు. ముఖ్యమైన తేదీలను గుర్తుంచుకోవడానికి రిమైండర్ జోడించండి.',
    modalNewReminderTitle: 'కొత్త ప్రభుత్వ రిమైండర్ జోడించండి',
    lblReminderTitle: 'రిమైండర్ పేరు (ఉదా: పాస్‌పోర్ట్ రెన్యూవల్):',
    lblDueDate: 'చివరి తేదీ / గడువు తేదీ:',
    lblNotes: 'ముఖ్యమైన గమనికలు:',
    btnSaveReminder: 'రిమైండర్ సేవ్ చేయండి',

    // Admin Console
    adminTitle: 'అధికారిక అడ్మిన్ ధ్రువీకరణ & గణాంకాలు',
    adminSubtitle: 'ప్రభుత్వ పోర్టల్ లింకులు, సమాచార ఖచ్చితత్వం మరియు ఆడిట్ వివరాలను పర్యవేక్షించండి.',
    statTotalServices: 'మొత్తం సేవలు',
    statVerified: 'ధ్రువీకరించబడిన వనరులు',
    statPending: 'సమీక్షలో ఉన్నవి',
    statAudits: 'పూర్తయిన ఆడిట్లు',
    recentAuditsTitle: 'ఇటీవలి అధికారిక పోర్టల్ ధ్రువీకరణలు',

    // Footer
    footerDesc: 'భారతీయ పౌరుల కోసం ప్రభుత్వ పత్రాలు, చట్టబద్ధమైన ఫీజులు మరియు దరఖాస్తు ప్రక్రియలను సరళంగా అందించే ప్రామాణిక సమాచార వేదిక.',
    footerPortalsTitle: 'అధికారిక ప్రభుత్వ పోర్టల్స్',
    footerAssuranceTitle: 'మా హామీ & ప్రమాణాలు',
    assurance1: 'సున్నా దళారీ విధానం',
    assurance2: '100% అధికారిక ఆధారాల ఉల్లేఖన',
    assurance3: 'ప్రభుత్వ గెజిట్ ఆధారిత ధ్రువీకరణ',
    assurance4: '3 అధికారిక భాషల మద్దతు (ఇంగ్లీష్, తెలుగు, హిందీ)',
    footerCopyright: '© 2026 సివిక్‌గైడ్ AI. భారతీయ పౌరుల కోసం అభివృద్ధి చేయబడింది.',
    footerCompliance: 'కఠిన నిబంధనలు: న్యాయ సలహా కాదు • ఇది స్వతంత్ర పౌర వేదిక'
  },

  hi: {
    // Branding & Header
    tagline: 'सिविकगाइड AI – सरकारी प्रक्रिया सहायक',
    brandTitle: 'सिविकगाइड',
    brandSub: 'सरकारी प्रक्रिया सहायक',
    officialNotice: 'आधिकारिक सूचना: सिविकगाइड AI एक स्वतंत्र नागरिक सूचना सहायक है। आवेदन से पूर्व आधिकारिक सरकारी वेबसाइट (.gov.in / .nic.in) पर नियमों की पुष्टि अवश्य करें।',
    disclaimer: 'सिविकगाइड AI एक स्वतंत्र नागरिक सूचना सहायक है। आवेदन से पूर्व आधिकारिक सरकारी वेबसाइट (.gov.in / .nic.in) पर नियमों की पुष्टि अवश्य करें।',

    // Navigation Tabs
    navServices: 'सरकारी सेवाएं',
    navChat: 'सिविक AI से पूछें',
    navApplications: 'मेरे आवेदन',
    navReminders: 'अनुस्मारक (Reminders)',
    navAdmin: 'एडमिन कंसोल',
    btnWizard: 'व्यक्तिगत चेकलिस्ट',
    btnLogin: 'लॉग इन करें',
    btnLogout: 'लॉग आउट',
    welcomeUser: 'स्वागत है',

    // Login Gateway Screen
    loginGatewayTitle: 'सिविकगाइड AI नागरिक पोर्टल',
    loginGatewaySubtitle: 'भारतीय सार्वजनिक सेवाओं, दस्तावेज चेकलिस्ट और आधिकारिक शुल्क की सटीक जानकारी के लिए सुरक्षित नागरिक मंच।',
    tabSignIn: 'पोर्टल में लॉग इन करें',
    tabRegister: 'नया नागरिक पंजीकरण',
    emailLabel: 'ईमेल पता',
    passwordLabel: 'पासवर्ड',
    fullNameLabel: 'पूरा नाम',
    stateLabel: 'राज्य / केंद्र शासित प्रदेश',
    districtLabel: 'जिला / शहर',
    btnSignInAction: 'नागरिक पोर्टल में प्रवेश करें',
    btnRegisterAction: 'नया खाता बनाएं',
    quickDemoTitle: 'तत्काल निःशुल्क प्रवेश (टाइप करने की आवश्यकता नहीं):',
    demoCitizenBtn: '👤 1-क्लिक नागरिक डेमो लॉग इन (शिव साई)',
    demoAdminBtn: '🛡️ 1-क्लिक व्यवस्थापक (एडमिन) डेमो',
    continueGuestBtn: '🚀 अतिथि (Guest) के रूप में आगे बढ़ें',
    guestNotice: 'अतिथि मोड में आप सभी सेवाएं देख सकते हैं, आधिकारिक शुल्क जान सकते हैं और AI से परामर्श कर सकते हैं।',
    trustBadge1: '🏛️ सत्यापित .gov.in पोर्टल',
    trustBadge2: '₹0 शून्य दलाली शुल्क',
    trustBadge3: '⚖️ राजपत्र नियमों पर आधारित',
    trustBadge4: '🌐 3 आधिकारिक भाषाएं',

    // Hero Section
    nationalInitiative: 'राष्ट्रीय नागरिक सूचना पहल',
    heroTitle: 'सरकारी सेवाएं, आसान भाषा में।',
    heroSubtitle: 'नागरिकों के लिए चरण-दर-चरण प्रक्रिया, आवश्यक दस्तावेज चेकलिस्ट, सटीक सरकारी शुल्क और सत्यापित आधिकारिक स्रोतों की जानकारी।',
    searchPlaceholder: 'आपको किस सरकारी सेवा की जानकारी चाहिए? (उदा. पासपोर्ट, ड्राइविंग लाइसेंस, आय प्रमाण पत्र...)?',
    popularSearches: 'प्रमुख खोजें:',

    // Metric Cards
    metricPortalsVal: '12+',
    metricPortalsLbl: 'आधिकारिक पोर्टल',
    metricRagVal: '100%',
    metricRagLbl: 'सटीक सरकारी RAG',
    metricToutsVal: 'शून्य',
    metricToutsLbl: 'दलाल-मुक्त गारंटी',
    metricLangVal: '3',
    metricLangLbl: 'आधिकारिक भाषाएँ (EN/TE/HI)',

    // Categories
    catAll: 'सभी श्रेणियां',
    catIdentity: 'पहचान एवं नागरिकता',
    catTransport: 'परिवहन एवं ड्राइविंग',
    catRevenue: 'राजस्व एवं प्रमाण पत्र',
    catCivil: 'नागरिक पंजीकरण (जन्म/मृत्यु)',
    catBusiness: 'व्यापार एवं कराधान',
    catEducation: 'शिक्षा एवं छात्रवृत्ति',

    // Filters
    filterJurisdiction: 'अधिकार क्षेत्र:',
    filterMode: 'आवेदन माध्यम:',
    allStates: 'सभी राज्य / अखिल भारतीय',
    allModes: 'सभी माध्यम',
    modeOnline: 'ऑनलाइन पोर्टल',
    modeOffline: 'ऑफ़लाइन कार्यालय',
    modeHybrid: 'हाइब्रिड (ऑनलाइन + कार्यालय)',
    serviceCountSuffix: 'सत्यापित सरकारी सेवाएं उपलब्ध हैं',

    // Service Card
    lblDept: 'विभाग:',
    lblProcessing: 'प्रसंस्करण समय:',
    lblFees: 'सरकारी शुल्क:',
    lblMode: 'माध्यम:',
    btnViewDetails: 'प्रक्रिया एवं चरण देखें',
    btnSave: 'बुकमार्क',
    btnSaved: 'सुरक्षित किया',
    badgeOfficial: 'सत्यापित आधिकारिक',
    badgeReview: 'समीक्षा आवश्यक',
    freeFee: 'निःशुल्क (₹0)',

    // Service Detail Modal
    tabOverview: 'अवलोकन (Overview)',
    tabChecklist: 'दस्तावेज चेकलिस्ट',
    tabSteps: 'चरण-दर-चरण प्रक्रिया',
    tabSources: 'आधिकारिक स्रोत एवं शुल्क',
    lblEligibility: 'कौन पात्र है:',
    lblGovFee: 'वैधानिक सरकारी शुल्क (कोई दलाली नहीं):',
    lblDeptAuthority: 'आधिकारिक विभाग:',
    lblHelpline: 'हेल्पलाइन नंबर:',
    btnVisitPortal: 'सत्यापित आधिकारिक पोर्टल पर जाएं',
    btnClose: 'बंद करें',
    docsChecklistTitle: 'आवश्यक दस्तावेजों की तैयारी चेकलिस्ट',
    checklistSubtitle: 'आवेदन में देरी या अस्वीकृति से बचने के लिए आवेदन शुरू करने से पहले इन दस्तावेजों को तैयार रखें।',
    statusReady: 'तैयार है',
    statusNotReady: 'तैयार नहीं',
    statusUploaded: 'अपलोड / स्कैन किया',
    timelineStepsTitle: 'मानक आधिकारिक आवेदन प्रक्रिया',
    timelineSubtitle: 'आधिकारिक सरकारी पोर्टल पर या निर्धारित सरकारी कार्यालय में इस क्रम में आवेदन करें।',
    sourcesTitle: 'आधिकारिक स्रोत एवं सत्यापित वेब लिंक',
    sourcesSubtitle: 'सिविकगाइड AI केवल प्रामाणिक .gov.in पोर्टल्स और राजपत्र आदेशों की जानकारी प्रदान करता है।',

    // AI Chat Drawer
    chatTitle: 'सिविकगाइड AI सहायक',
    chatSubtitle: 'सत्यापित सरकारी सूचना • शत-प्रतिशत सटीक',
    chatWelcome: 'नमस्ते! मैं सिविकगाइड AI हूँ, आपका आधिकारिक सरकारी प्रक्रिया सहायक। भारत में किसी भी सरकारी सेवा की प्रक्रिया, आवश्यक दस्तावेज, सरकारी शुल्क या पात्रता के बारे में मुझसे पूछें।',
    chatPlaceholder: 'सरकारी सेवा के बारे में पूछें (उदा. पासपोर्ट दस्तावेज, ड्राइविंग लाइसेंस शुल्क)...',
    chatSendBtn: 'भेजें',
    chatQuick1: 'पासपोर्ट के लिए कौन से दस्तावेज चाहिए?',
    chatQuick2: 'ड्राइविंग लाइसेंस का आधिकारिक शुल्क कितना है?',
    chatQuick3: 'नॉन-ECR और ECR पासपोर्ट में क्या अंतर है?',
    chatQuick4: 'मीसेवा आय प्रमाण पत्र कैसे प्राप्त करें?',

    // Personalized Wizard Modal
    wizardTitle: 'व्यक्तिगत नागरिक मार्गदर्शन विज़ार्ड',
    wizardSubtitle: 'अपनी आयु, राज्य और व्यवसाय के अनुसार आवश्यक दस्तावेजों की व्यक्तिगत चेकलिस्ट प्राप्त करें।',
    wizStateLbl: 'निवास का राज्य:',
    wizAgeLbl: 'आपकी आयु वर्ग:',
    wizAgeAdult: 'वयस्क (18 - 59 वर्ष)',
    wizAgeMinor: 'नाबालिग (18 वर्ष से कम)',
    wizAgeSenior: 'वरिष्ठ नागरिक (60+ वर्ष)',
    wizOccLbl: 'व्यवसाय श्रेणी:',
    wizOccCitizen: 'सामान्य नागरिक',
    wizOccStudent: 'विद्यार्थी',
    wizOccBusiness: 'व्यवसायी / उद्यमी',
    wizOccGovt: 'सरकारी कर्मचारी',
    wizServiceLbl: 'आवश्यक सरकारी सेवा:',
    btnGenerateGuidance: 'मेरी चेकलिस्ट तैयार करें',
    wizardResultTitle: 'आपके लिए तैयार विशेष चेकलिस्ट एवं आगामी चरण',

    // Applications Tracker
    appsTitle: 'मेरे सरकारी आवेदन',
    appsSubtitle: 'अपने आवेदन संदर्भ नंबर, जमा करने की तिथि और वर्तमान स्थिति को एक स्थान पर ट्रैक करें।',
    btnNewApp: '+ नया आवेदन ट्रैक करें',
    colService: 'सेवा',
    colRefNum: 'आवेदन / संदर्भ संख्या',
    colStatus: 'स्थिति',
    colDate: 'आवेदन तिथि',
    colNextStep: 'अगली कार्रवाई',
    colActions: 'कार्रवाई',
    emptyApps: 'अभी तक कोई आवेदन ट्रैक नहीं किया गया है। अपनी प्रगति जांचने के लिए ऊपर दिए गए बटन पर क्लिक करें।',
    modalNewAppTitle: 'सरकारी आवेदन को ट्रैक करें',
    lblSelectService: 'सरकारी सेवा चुनें:',
    lblRefNumber: 'आवेदन संख्या / संदर्भ आईडी:',
    lblInitialStatus: 'वर्तमान स्थिति:',
    statusSubmitted: 'जमा किया गया (SUBMITTED)',
    statusUnderReview: 'समीक्षाधीन (UNDER REVIEW)',
    statusApproved: 'स्वीकृत / जारी (APPROVED)',
    statusActionRequired: 'कार्रवाई आवश्यक (ACTION REQUIRED)',
    btnSaveApp: 'आवेदन सुरक्षित करें',

    // Reminders
    remindersTitle: 'सरकारी समय सीमा एवं नवीनीकरण अनुस्मारक',
    remindersSubtitle: 'पासपोर्ट नवीनीकरण, ड्राइविंग लाइसेंस वैधता या छात्रवृत्ति की अंतिम तिथि कभी न भूलें।',
    btnNewReminder: '+ नया रिमाइंडर जोड़ें',
    emptyReminders: 'कोई सक्रिय रिमाइंडर नहीं है। महत्वपूर्ण तिथियां याद रखने के लिए रिमाइंडर जोड़ें।',
    modalNewReminderTitle: 'नया सरकारी रिमाइंडर जोड़ें',
    lblReminderTitle: 'रिमाइंडर का नाम (उदा. पासपोर्ट नवीनीकरण):',
    lblDueDate: 'अंतिम तिथि / देय तिथि:',
    lblNotes: 'आवश्यक विवरण:',
    btnSaveReminder: 'रिमाइंडर सुरक्षित करें',

    // Admin Console
    adminTitle: 'प्रशासनिक सत्यापन एवं टेलीमेट्री',
    adminSubtitle: 'आधिकारिक पोर्टल लिंक, सटीकता और सत्यापन इतिहास की निगरानी करें।',
    statTotalServices: 'कुल सेवाएं',
    statVerified: 'सत्यापित स्रोत',
    statPending: 'समीक्षाधीन',
    statAudits: 'कुल ऑडिट संपन्न',
    recentAuditsTitle: 'हाल के आधिकारिक स्रोत सत्यापन',

    // Footer
    footerDesc: 'भारतीय नागरिकों के लिए सरकारी दस्तावेज, वैधानिक शुल्क और आवेदन प्रक्रियाओं को सरल और सुगम बनाने वाला प्रामाणिक मंच।',
    footerPortalsTitle: 'आधिकारिक सरकारी पोर्टल',
    footerAssuranceTitle: 'हमारा आश्वासन एवं मानक',
    assurance1: 'शून्य दलाली नीति',
    assurance2: '100% आधिकारिक स्रोत उद्धरण',
    assurance3: 'सरकारी राजपत्र द्वारा सत्यापन',
    assurance4: '3 आधिकारिक भाषाओं में समर्थन (अंग्रेजी, तेलुगु, हिंदी)',
    footerCopyright: '© 2026 सिविकगाइड AI. भारतीय नागरिकों के लिए निर्मित।',
    footerCompliance: 'सख्त अनुपालन: कानूनी सलाह नहीं • यह एक स्वतंत्र नागरिक मंच है'
  }
};

// Specialized translations for each of the 12 government services in Telugu and Hindi
export const SERVICE_TRANSLATIONS = {
  'srv-passport': {
    te: {
      title: 'కొత్త పాస్‌పోర్ట్ దరఖాస్తు (సాధారణ / తత్కాల్)',
      category: 'గుర్తింపు & పౌరసత్వం',
      department: 'విదేశీ వ్యవహారాల మంత్రిత్వ శాఖ (MEA, పాస్‌పోర్ట్ సేవా)',
      short_summary: 'కొత్త 10 సంవత్సరాల భారతీయ పాస్‌పోర్ట్ కోసం దరఖాస్తు చేసుకోండి లేదా PSK వద్ద అపాయింట్‌మెంట్ తీసుకోండి.',
      fees: 'సాధారణ కోటా (36 పేజీలు): ₹1,500; సాధారణ కోటా (60 పేజీలు): ₹2,000; తత్కాల్ కోటా (36 పేజీలు): ₹3,500; మైనర్లు (<18 సం.): ₹1,000.',
      processing_time: 'సాధారణం: 15-30 పనిదినాలు; తత్కాల్: 1-3 పనిదినాలు.'
    },
    hi: {
      title: 'नया पासपोर्ट आवेदन (सामान्य / तत्काल)',
      category: 'पहचान एवं नागरिकता',
      department: 'विदेश मंत्रालय (MEA, पासपोर्ट सेवा प्रभाग)',
      short_summary: 'नए 10-वर्षीय भारतीय पासपोर्ट के लिए आवेदन करें या पासपोर्ट सेवा केंद्र (PSK) पर स्लॉट बुक करें।',
      fees: 'सामान्य कोटा (36 पृष्ठ): ₹1,500; सामान्य कोटा (60 पृष्ठ): ₹2,000; तत्काल कोटा (36 पृष्ठ): ₹3,500; नाबालिग (<18 वर्ष): ₹1,000।',
      processing_time: 'सामान्य: 15-30 कार्य दिवस; तत्काल: 1-3 कार्य दिवस।'
    }
  },
  'srv-driving-licence': {
    te: {
      title: "లెర్నర్స్ & పర్మనెంట్ డ్రైవింగ్ లైసెన్స్ (LLR & DL)",
      category: 'రవాణా & డ్రైవింగ్',
      department: 'రహదారి రవాణా మరియు రహదారుల మంత్రిత్వ శాఖ (సారథి పరివాహన్)',
      short_summary: 'లెర్నర్ లైసెన్స్ కోసం ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోండి మరియు మీ RTO వద్ద డ్రైవింగ్ పరీక్ష స్లాట్ బుక్ చేయండి.',
      fees: 'లెర్నర్ లైసెన్స్: ₹200; పర్మనెంట్ డ్రైవింగ్ లైసెన్స్: ₹700 (స్మార్ట్ కార్డ్ ఫీజుతో సహా).',
      processing_time: 'లెర్నర్ లైసెన్స్: అదే రోజు (ఆన్‌లైన్ పరీక్ష); పర్మనెంట్ DL: RTO పరీక్ష పాసైన 7-15 రోజుల్లో.'
    },
    hi: {
      title: 'लर्नर एवं स्थायी ड्राइविंग लाइसेंस (LLR / DL)',
      category: 'परिवहन एवं ड्राइविंग',
      department: 'सड़क परिवहन एवं राजमार्ग मंत्रालय (सारथी परिवहन पोर्टल)',
      short_summary: 'ऑनलाइन लर्नर लाइसेंस के लिए आवेदन करें और अपने आरटीओ में स्थायी ड्राइविंग टेस्ट स्लॉट बुक करें।',
      fees: 'लर्नर लाइसेंस: ₹200; स्थायी ड्राइविंग लाइसेंस: ₹700 (स्मार्ट कार्ड शुल्क सहित)।',
      processing_time: 'लर्नर लाइसेंस: उसी दिन (ऑनलाइन टेस्ट); स्थायी डीएल: आरटीओ टेस्ट पास करने के 7-15 दिन बाद।'
    }
  },
  'srv-income-cert': {
    te: {
      title: 'ఆదాయ ధ్రువీకరణ పత్రం (మీసేవ / ప్రజావాణి)',
      category: 'రెవెన్యూ & సర్టిఫికేట్లు',
      department: 'రెవెన్యూ శాఖ, తెలంగాణ ప్రభుత్వం (మీసేవ)',
      short_summary: 'ఫీజు రీయింబర్స్‌మెంట్ మరియు సంక్షేమ పథకాల కోసం తహశీల్దార్ ద్వారా వార్షిక ఆదాయ పత్రం పొందండి.',
      fees: 'మీసేవ సేవా రుసుము: ₹45 (ప్రభుత్వ ఫీజు: ఉచితం, యూజర్ ఛార్జ్: ₹45).',
      processing_time: '7 నుండి 15 పనిదినాలు.'
    },
    hi: {
      title: 'आय प्रमाण पत्र जारी करना (मीसेवा / राजस्व पोर्टल)',
      category: 'राजस्व एवं प्रमाण पत्र',
      department: 'राजस्व विभाग, तेलंगाना सरकार (मीसेवा)',
      short_summary: 'छात्रवृत्ति और कल्याणकारी योजनाओं के लिए तहसीलदार द्वारा प्रमाणित वार्षिक पारिवारिक आय प्रमाण पत्र प्राप्त करें।',
      fees: 'मीसेवा सेवा शुल्क: ₹45 (सरकारी शुल्क: शून्य, उपयोगकर्ता सुविधा शुल्क: ₹45)।',
      processing_time: '7 से 15 कार्य दिवस।'
    }
  },
  'srv-birth-cert': {
    te: {
      title: 'జనన నమోదు & డిజిటల్ జనన ధ్రువీకరణ పత్రం',
      category: 'పౌర నమోదు (జనన/మరణ)',
      department: 'మున్సిపల్ అడ్మినిస్ట్రేషన్ & అర్బన్ డెవలప్‌మెంట్ (GHMC/CRS)',
      short_summary: 'ఆసుపత్రి లేదా మున్సిపల్ పరిధిలో జరిగిన జననాలకు డిజిటల్ జనన ధ్రువీకరణ పత్రం డౌన్‌లోడ్ చేయండి.',
      fees: '21 రోజుల్లోపు ఉచితం; ఆలస్య నమోదు: ₹2 నుండి ₹5; మీసేవ ప్రింట్ కాపీ: ₹35.',
      processing_time: 'డిజిటల్ ఆసుపత్రి రికార్డులకు తక్షణం; మీసేవ కౌంటర్ ద్వారా 3-7 రోజులు.'
    },
    hi: {
      title: 'जन्म पंजीकरण एवं डिजिटल जन्म प्रमाण पत्र',
      category: 'नागरिक पंजीकरण (जन्म/मृत्यु)',
      department: 'नगर प्रशासन एवं शहरी विकास विभाग (GHMC/CRS)',
      short_summary: 'नगरपालिका या ग्राम पंचायत में हुए जन्म का डिजिटल रूप से सत्यापित जन्म प्रमाण पत्र डाउनलोड करें।',
      fees: '21 दिनों के भीतर निःशुल्क; विलंबित पंजीकरण: ₹2 से ₹5; मीसेवा प्रमाणित प्रति: ₹35।',
      processing_time: 'अस्पताल रिकॉर्ड हेतु तत्काल डाउनलोड; मीसेवा काउंटर से 3-7 कार्य दिवस।'
    }
  },
  'srv-caste-cert': {
    te: {
      title: 'కుల & నివాస ధ్రువీకరణ పత్రం (SC/ST/BC)',
      category: 'రెవెన్యూ & సర్టిఫికేట్లు',
      department: 'రెవెన్యూ శాఖ, తెలంగాణ ప్రభుత్వం (మీసేవ)',
      short_summary: 'విద్య మరియు ఉద్యోగ రిజర్వేషన్ల కోసం తహశీల్దార్ నుండి అధికారిక కుల ధ్రువీకరణ పత్రం పొందండి.',
      fees: 'మీసేవ దరఖాస్తు రుసుము: ₹45.',
      processing_time: '15 నుండి 30 పనిదినాలు (రెవెన్యూ ఇన్‌స్పెక్టర్ విచారణ తర్వాత).'
    },
    hi: {
      title: 'जाति एवं एकीकृत समुदाय प्रमाण पत्र (SC/ST/BC)',
      category: 'राजस्व एवं प्रमाण पत्र',
      department: 'राजस्व विभाग, तेलंगाना सरकार (मीसेवा)',
      short_summary: 'शिक्षा एवं रोजगार में आरक्षण लाभ हेतु अधिकृत तहसीलदार द्वारा जाति एवं समुदाय प्रमाण पत्र प्राप्त करें।',
      fees: 'मीसेवा आवेदन शुल्क: ₹45।',
      processing_time: '15 से 30 कार्य दिवस (राजस्व निरीक्षक की स्थानीय जांच के उपरांत)।'
    }
  },
  'srv-pan-card': {
    te: {
      title: 'తక్షణ ఇ-పాన్ & ఫిజికల్ పాన్ కార్డ్ (ఫారం 49A)',
      category: 'వ్యాపారం & పన్నులు',
      department: 'ఆదాయపు పన్ను శాఖ (కేంద్ర ప్రత్యక్ష పన్నుల బోర్డు - CBDT)',
      short_summary: 'ఆధార్ OTP ద్వారా 10 నిమిషాల్లో ఉచిత ఇ-పాన్ పొందండి లేదా పోస్ట్ ద్వారా ప్లాస్టిక్ కార్డు ఆర్డర్ చేయండి.',
      fees: 'డిజిటల్ ఇ-పాన్: పూర్తిగా ఉచితం (₹0); ఫిజికల్ కార్డు హోమ్ డెలివరీ: ₹107.',
      processing_time: 'ఇ-పాన్: 10 నిమిషాలు (PDF); ఫిజికల్ కార్డ్: స్పీడ్ పోస్ట్ ద్వారా 7-15 రోజులు.'
    },
    hi: {
      title: 'तत्काल डिजिटल ई-पैन एवं भौतिक पैन कार्ड (फॉर्म 49A)',
      category: 'व्यापार एवं कराधान',
      department: 'आयकर विभाग (केंद्रीय प्रत्यक्ष कर बोर्ड - CBDT)',
      short_summary: 'आधार ओटीपी द्वारा 10 मिनट में निःशुल्क ई-पैन प्राप्त करें या स्पीड पोस्ट द्वारा लेमिनेटेड कार्ड मंगवाएं।',
      fees: 'डिजिटल ई-पैन: पूर्णतः निःशुल्क (₹0); भौतिक कार्ड डाक वितरण: ₹107।',
      processing_time: 'ई-पैन: 10 मिनट में डाउनलोड; भौतिक कार्ड: 7-15 दिनों में डाक द्वारा।'
    }
  },
  'srv-aadhaar-update': {
    te: {
      title: 'ఆధార్ ఆన్‌లైన్ చిరునామా సవరణ & డాక్యుమెంట్ రెన్యూవల్',
      category: 'గుర్తింపు & పౌరసత్వం',
      department: 'భారత విశిష్ట గుర్తింపు ప్రాధికార సంస్థ (UIDAI)',
      short_summary: 'myAadhaar పోర్టల్‌లో ఆన్‌లైన్‌లో మీ చిరునామాను అప్‌డేట్ చేయండి లేదా 10 ఏళ్ల డాక్యుమెంట్ ధ్రువీకరణ పూర్తి చేయండి.',
      fees: 'ఆన్‌లైన్ డాక్యుమెంట్ అప్‌లోడ్: ఉచితం; ఆన్‌లైన్ అడ్రస్ అప్‌డేట్: ₹50; కేంద్రంలో బయోమెట్రిక్: ₹100.',
      processing_time: '5 నుండి 15 పనిదినాలు.'
    },
    hi: {
      title: 'आधार ऑनलाइन पता संशोधन एवं दस्तावेज पुनर्सत्यापन',
      category: 'पहचान एवं नागरिकता',
      department: 'भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI)',
      short_summary: 'myAadhaar पोर्टल पर घर बैठे अपना पता अपडेट करें अथवा 10-वर्षीय दस्तावेज का पुनः सत्यापन करें।',
      fees: 'दस्तावेज पुनर्सत्यापन: निःशुल्क; ऑनलाइन पता संशोधन: ₹50; आधार केंद्र पर बायोमेट्रिक: ₹100।',
      processing_time: '5 से 15 कार्य दिवस।'
    }
  },
  'srv-voter-id': {
    te: {
      title: 'కొత్త ఓటరు నమోదు (ఫారం 6) & డిజిటల్ ఓటర్ ఐడీ (e-EPIC)',
      category: 'గుర్తింపు & పౌరసత్వం',
      department: 'భారత ఎన్నికల సంఘం (ECI - Voters Portal)',
      short_summary: '18 ఏళ్లు నిండిన వారు కొత్త ఓటరుగా నమోదు చేసుకుని డిజిటల్ ఓటర్ కార్డు డౌన్‌లోడ్ చేసుకోండి.',
      fees: 'పూర్తిగా ఉచితం (₹0) - రాజ్యాంగబద్ధమైన హక్కు.',
      processing_time: '15 నుండి 30 రోజులు (BLO ఫీల్డ్ వెరిఫికేషన్ తర్వాత).'
    },
    hi: {
      title: 'नया मतदाता पंजीकरण (फॉर्म 6) एवं डिजिटल वोटर आईडी (e-EPIC)',
      category: 'पहचान एवं नागरिकता',
      department: 'भारत निर्वाचन आयोग (ECI - राष्ट्रीय मतदाता सेवा पोर्टल)',
      short_summary: '18 वर्ष की आयु पूर्ण करने वाले नागरिक नए मतदाता के रूप में पंजीकरण कर डिजिटल वोटर कार्ड डाउनलोड करें।',
      fees: 'पूर्णतः निःशुल्क (₹0) - संवैधानिक नागरिक अधिकार।',
      processing_time: '15 से 30 दिन (बीएलओ द्वारा भौतिक सत्यापन उपरांत)।'
    }
  },
  'srv-scholarship-epass': {
    te: {
      title: 'పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ & ఫీజు రీయింబర్స్‌మెంట్ (ePASS)',
      category: 'విద్య & ఉపకార వేతనాలు',
      department: 'వెనుకబడిన తరగతులు, SC & ST సంక్షేమ శాఖ (ePASS తెలంగాణ)',
      short_summary: 'ఇంటర్, డిగ్రీ, ఇంజనీరింగ్ విద్యార్థుల పూర్తి ట్యూషన్ ఫీజు రీయింబర్స్‌మెంట్ మరియు మెయింటెనెన్స్ కోసం దరఖాస్తు చేయండి.',
      fees: 'పూర్తిగా ఉచితం (₹0).',
      processing_time: 'సంస్థాగత ధ్రువీకరణ మరియు బయోమెట్రిక్ తర్వాత విద్యా సంవత్సరంలో మంజూరు చేయబడుతుంది.'
    },
    hi: {
      title: 'पोस्ट-मैट्रिक छात्रवृत्ति एवं शुल्क प्रतिपूर्ति (ePASS)',
      category: 'शिक्षा एवं छात्रवृत्ति',
      department: 'पिछड़ा वर्ग, अनुसूचित जाति एवं जनजाति कल्याण विभाग (ePASS)',
      short_summary: 'इंटरमीडिएट, डिग्री, इंजीनियरिंग एवं मेडिकल छात्रों के लिए 100% ट्यूशन फीस प्रतिपूर्ति और छात्रावास भत्ता।',
      fees: 'पूर्णतः निःशुल्क (₹0)।',
      processing_time: 'कॉलेज सत्यापन एवं बायोमेट्रिक प्रमाणीकरण के उपरांत शैक्षणिक सत्र के दौरान।'
    }
  },
  'srv-residence-cert': {
    te: {
      title: 'నివాస ధ్రువీకరణ పత్రం (Residence / Nativity Certificate)',
      category: 'రెవెన్యూ & సర్టిఫికేట్లు',
      department: 'రెవెన్యూ శాఖ, తెలంగాణ ప్రభుత్వం (మీసేవ)',
      short_summary: 'విద్యా కోటా మరియు స్థానిక రిజర్వేషన్ల కోసం స్థానిక తహశీల్దార్ ద్వారా నివాస ధ్రువీకరణ పత్రం పొందండి.',
      fees: 'మీసేవ సేవా రుసుము: ₹45.',
      processing_time: '7 నుండి 15 పనిదినాలు.'
    },
    hi: {
      title: 'निवास एवं मूल निवास प्रमाण पत्र (Domicile / Nativity)',
      category: 'राजस्व एवं प्रमाण पत्र',
      department: 'राजस्व विभाग, तेलंगाना सरकार (मीसेवा)',
      short_summary: 'शैक्षणिक संस्थानों में स्थानीय आरक्षण एवं सरकारी नौकरियों के लिए तहसीलदार द्वारा निवास प्रमाण पत्र लें।',
      fees: 'मीसेवा सेवा शुल्क: ₹45।',
      processing_time: '7 से 15 कार्य दिवस।'
    }
  },
  'srv-udyam-msme': {
    te: {
      title: 'ఉద్యమ్ MSME వ్యాపార నమోదు (Udyam Registration)',
      category: 'వ్యాపారం & పన్నులు',
      department: 'సూక్ష్మ, చిన్న మరియు మధ్య తరహా పరిశ్రమల మంత్రిత్వ శాఖ (MSME)',
      short_summary: 'జీరో డాక్యుమెంట్ అప్‌లోడ్‌తో ఉచితంగా లైఫ్‌టైమ్ డిజిటల్ బిజినెస్ సర్టిఫికేట్ పొందండి.',
      fees: '100% ఉచితం (₹0). ఎలాంటి రుసుములు చెల్లించవద్దు.',
      processing_time: 'తక్షణ రసీదు; 3-5 రోజుల్లో QR కోడ్‌తో కూడిన సర్టిఫికేట్ జారీ.'
    },
    hi: {
      title: 'उद्यम MSME व्यवसाय पंजीकरण (Udyam Registration)',
      category: 'व्यापार एवं कराधान',
      department: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय (MSME)',
      short_summary: 'बिना किसी दस्तावेज अपलोड के अपने व्यवसाय का निःशुल्क आजीवन डिजिटल पंजीकरण प्रमाण पत्र प्राप्त करें।',
      fees: '100% निःशुल्क (₹0)। किसी भी बिचौलिए को कोई शुल्क न दें।',
      processing_time: 'तत्काल पावती; सीबीडीटी/जीएसटीएन सत्यापन उपरांत 3-5 दिनों में प्रमाण पत्र।'
    }
  },
  'srv-death-cert': {
    te: {
      title: 'మరణ నమోదు & ధ్రువీకరణ పత్రం (Death Certificate)',
      category: 'పౌర నమోదు (జనన/మరణ)',
      department: 'మున్సిపల్ అడ్మినిస్ట్రేషన్ (GHMC/CRS)',
      short_summary: 'బీమా క్లెయిమ్‌లు, బ్యాంక్ అకౌంట్ సెటిల్‌మెంట్ మరియు ఆస్తి బదిలీ కోసం అధికారిక మరణ ధ్రువీకరణ పత్రం తీసుకోండి.',
      fees: '21 రోజుల్లోపు ఉచితం; ఆలస్య నమోదు: ₹2 నుండి ₹5; మీసేవ సర్టిఫైడ్ కాపీ: ₹35.',
      processing_time: 'ఆసుపత్రి డిజిటల్ రికార్డులకు తక్షణం; తాజా దరఖాస్తులకు 3-7 రోజులు.'
    },
    hi: {
      title: 'मृत्यु पंजीकरण एवं मृत्यु प्रमाण पत्र (Death Certificate)',
      category: 'नागरिक पंजीकरण (जन्म/मृत्यु)',
      department: 'नगर प्रशासन एवं शहरी विकास (GHMC/CRS)',
      short_summary: 'बीमा दावों, बैंक खातों के निपटान और संपत्ति उत्तराधिकार हेतु नगरपालिका से मृत्यु प्रमाण पत्र प्राप्त करें।',
      fees: '21 दिनों के भीतर निःशुल्क; विलंबित पंजीकरण: ₹2 से ₹5; मीसेवा प्रमाणित प्रति: ₹35।',
      processing_time: 'अस्पताल रिकॉर्ड हेतु तत्काल; नए आवेदनों के लिए 3 से 7 कार्य दिवस।'
    }
  }
};

// Helper function to return localized service data
export function getLocalizedService(service, lang) {
  if (!service) return service;
  if (lang === 'en' || !SERVICE_TRANSLATIONS[service.id] || !SERVICE_TRANSLATIONS[service.id][lang]) {
    return service;
  }
  const trans = SERVICE_TRANSLATIONS[service.id][lang];
  return {
    ...service,
    title: trans.title || service.title,
    category: trans.category || service.category,
    short_summary: trans.short_summary || service.short_summary,
    fee_structure: trans.fees || service.fee_structure,
    processing_time: trans.processing_time || service.processing_time
  };
}
