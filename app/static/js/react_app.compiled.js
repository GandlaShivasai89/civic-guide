import { DICTIONARY, getLocalizedService } from './i18n.js';
const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;

// API Helper
async function api(path, options = {}) {
  const token = localStorage.getItem('civic_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? {
      'Authorization': `Bearer ${token}`
    } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(`/api${path}`, {
    ...options,
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.detail || 'Request failed');
  }
  return data;
}
export function CivicApp() {
  const [lang, setLang] = useState(() => localStorage.getItem('civic_lang') || 'en');
  const [activeTab, setActiveTab] = useState('services');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('civic_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // Login & Register Form State ("First I want login and next")
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authState, setAuthState] = useState('Telangana');
  const [authDistrict, setAuthDistrict] = useState('Hyderabad');

  // Catalog State
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [savedIds, setSavedIds] = useState(new Set());

  // Modals & Drawers State
  const [selectedService, setSelectedService] = useState(null);
  const [modalTab, setModalTab] = useState('overview');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [isNewReminderOpen, setIsNewReminderOpen] = useState(false);

  // New Application Form State
  const [newAppServiceId, setNewAppServiceId] = useState('');
  const [newAppRef, setNewAppRef] = useState('');
  const [newAppStatus, setNewAppStatus] = useState('SUBMITTED');

  // New Reminder Form State
  const [newRemTitle, setNewRemTitle] = useState('');
  const [newRemDate, setNewRemDate] = useState('');
  const [newRemNotes, setNewRemNotes] = useState('');

  // Guidance Wizard State
  const [wizState, setWizState] = useState('Telangana');
  const [wizAge, setWizAge] = useState('ADULT_18_59');
  const [wizOcc, setWizOcc] = useState('CITIZEN');
  const [wizService, setWizService] = useState('srv-passport');
  const [wizResult, setWizResult] = useState(null);
  const [isWizLoading, setIsWizLoading] = useState(false);

  // Data lists
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [toast, setToast] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Translation helper
  const t = key => {
    const dict = DICTIONARY[lang] || DICTIONARY.en;
    return dict[key] || DICTIONARY.en[key] || key;
  };
  const showToast = (message, type = 'info') => {
    setToast({
      message,
      type
    });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync default chat welcome message when language changes
  useEffect(() => {
    setChatMessages([{
      role: 'assistant',
      text: t('chatWelcome')
    }]);
  }, [lang]);

  // Initial Load of catalog
  useEffect(() => {
    api('/services/categories').then(res => setCategories(res.data || [])).catch(console.error);
    api('/services').then(res => setServices(res.data || [])).catch(err => showToast(err.message, 'error'));
    if (currentUser && !currentUser.is_guest) {
      api('/applications/saved').then(res => setSavedIds(new Set((res.data || []).map(s => s.id)))).catch(console.error);
    }
  }, [currentUser]);

  // Load section-specific data
  useEffect(() => {
    if (!currentUser || currentUser.is_guest) return;
    if (activeTab === 'applications') {
      api('/applications').then(res => setApplications(res.data || [])).catch(console.error);
    } else if (activeTab === 'reminders') {
      api('/reminders').then(res => setReminders(res.data || [])).catch(console.error);
    } else if (activeTab === 'admin' && currentUser?.role === 'admin') {
      api('/admin/stats').then(res => setAdminStats(res.data)).catch(console.error);
    }
  }, [activeTab, currentUser]);

  // Localized list of services for the active language
  const localizedServices = useMemo(() => {
    return services.map(s => getLocalizedService(s, lang));
  }, [services, lang]);

  // Filter services
  const filteredServices = useMemo(() => {
    let list = [...localizedServices];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.short_summary && s.short_summary.toLowerCase().includes(q) || s.description && s.description.toLowerCase().includes(q) || s.service_code && s.service_code.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'ALL') {
      list = list.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()) || s.orig_category && s.orig_category === selectedCategory);
    }
    if (selectedState !== 'ALL') {
      list = list.filter(s => s.state === 'All-India' || s.state === selectedState);
    }
    if (selectedMode !== 'ALL') {
      list = list.filter(s => s.application_mode === selectedMode);
    }
    return list;
  }, [localizedServices, searchQuery, selectedCategory, selectedState, selectedMode]);

  // Toggle bookmark
  const handleToggleSave = async serviceId => {
    if (!currentUser || currentUser.is_guest) {
      showToast('Bookmarks saved for session', 'info');
      const newSaved = new Set(savedIds);
      if (newSaved.has(serviceId)) newSaved.delete(serviceId);else newSaved.add(serviceId);
      setSavedIds(newSaved);
      return;
    }
    try {
      const res = await api('/applications/saved/toggle', {
        method: 'POST',
        body: JSON.stringify({
          serviceId
        })
      });
      const newSaved = new Set(savedIds);
      if (res.isSaved) {
        newSaved.add(serviceId);
        showToast('Service saved to bookmarks', 'success');
      } else {
        newSaved.delete(serviceId);
        showToast('Removed from bookmarks');
      }
      setSavedIds(newSaved);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Open Service Modal
  const openServiceModal = async serviceId => {
    try {
      const res = await api(`/services/${serviceId}`);
      const localized = getLocalizedService(res.data, lang);
      setSelectedService(localized);
      setModalTab('overview');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Chat send
  const handleSendMessage = async (customQuery = null, serviceId = null) => {
    const q = customQuery || chatInput.trim();
    if (!q) return;
    const newMessages = [...chatMessages, {
      role: 'user',
      text: q
    }];
    setChatMessages(newMessages);
    if (!customQuery) setChatInput('');
    setIsChatLoading(true);
    try {
      const res = await api('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({
          query: q,
          serviceId: serviceId || selectedService?.id,
          state: 'Telangana',
          language: lang
        })
      });
      setChatMessages([...newMessages, {
        role: 'assistant',
        text: res.data.answer,
        sources: res.data.sources || []
      }]);
    } catch (err) {
      setChatMessages([...newMessages, {
        role: 'assistant',
        text: 'Error retrieving verified government records: ' + err.message
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Auth Submit (Login / Register)
  const handleAuthSubmit = async e => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const res = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: authEmail,
            password: authPassword
          })
        });
        localStorage.setItem('civic_auth_token', res.data.token);
        localStorage.setItem('civic_user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        showToast(`Welcome back, ${res.data.user.full_name}!`, 'success');
      } else {
        const res = await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
            full_name: authName,
            state: authState,
            district: authDistrict,
            preferred_language: lang
          })
        });
        localStorage.setItem('civic_auth_token', res.data.token);
        localStorage.setItem('civic_user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        showToast('Registration successful! Welcome to CivicGuide.', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // 1-Click Quick Demo Login
  const handleQuickLogin = async (email, password) => {
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        })
      });
      localStorage.setItem('civic_auth_token', res.data.token);
      localStorage.setItem('civic_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      showToast(`Logged in as ${res.data.user.full_name}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Continue as Guest Citizen
  const handleContinueAsGuest = () => {
    const guestUser = {
      id: 'usr-guest',
      email: 'guest@civicguide.in',
      full_name: lang === 'te' ? 'అతిథి పౌరుడు (Guest)' : lang === 'hi' ? 'अतिथि नागरिक (Guest)' : 'Guest Citizen',
      role: 'citizen',
      is_guest: true
    };
    localStorage.setItem('civic_user', JSON.stringify(guestUser));
    setCurrentUser(guestUser);
    showToast(lang === 'te' ? 'గెస్ట్ మోడ్‌లో ప్రవేశించారు' : lang === 'hi' ? 'अतिथि मोड में प्रवेश किया' : 'Entered in Guest Citizen Mode', 'info');
  };

  // Auth logout ("when i open website first i want login and next")
  const handleLogout = () => {
    localStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_user');
    setCurrentUser(null);
    setSavedIds(new Set());
    setActiveTab('services');
    showToast(lang === 'te' ? 'లాగౌట్ విజయవంతమైంది' : lang === 'hi' ? 'सफलतापूर्वक लॉग आउट किया गया' : 'Signed out successfully');
  };

  // Wizard guidance generator
  const handleGenerateGuidance = async () => {
    setIsWizLoading(true);
    try {
      const res = await api('/ai/guidance', {
        method: 'POST',
        body: JSON.stringify({
          country: 'India',
          state: wizState,
          ageGroup: wizAge,
          occupation: wizOcc,
          serviceId: wizService
        })
      });
      setWizResult(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsWizLoading(false);
    }
  };

  // Add application
  const handleCreateApplication = async e => {
    e.preventDefault();
    try {
      const res = await api('/applications', {
        method: 'POST',
        body: JSON.stringify({
          service_id: newAppServiceId,
          application_reference_number: newAppRef,
          status: newAppStatus
        })
      });
      setApplications([res.data, ...applications]);
      setIsNewAppOpen(false);
      setNewAppRef('');
      showToast('Application tracked successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add reminder
  const handleCreateReminder = async e => {
    e.preventDefault();
    try {
      const res = await api('/reminders', {
        method: 'POST',
        body: JSON.stringify({
          title: newRemTitle,
          reminder_date: newRemDate,
          notes: newRemNotes
        })
      });
      setReminders([res.data, ...reminders]);
      setIsNewReminderOpen(false);
      setNewRemTitle('');
      setNewRemDate('');
      setNewRemNotes('');
      showToast('Reminder added successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Popular search tags localized
  const popularTags = useMemo(() => {
    if (lang === 'te') {
      return ['పాస్‌పోర్ట్', 'డ్రైవింగ్ లైసెన్స్', 'ఆదాయ ధ్రువీకరణ', 'జనన ధ్రువీకరణ', 'కుల ధ్రువీకరణ', 'ఓటర్ ఐడీ', 'ఆధార్', 'స్కాలర్‌షిప్'];
    } else if (lang === 'hi') {
      return ['पासपोर्ट', 'ड्राइविंग लाइसेंस', 'आय प्रमाण पत्र', 'जन्म प्रमाण पत्र', 'जाति प्रमाण पत्र', 'वोटर आईडी', 'आधार', 'छात्रवृत्ति'];
    } else {
      return ['Passport', 'Driving Licence', 'Income Certificate', 'Birth Certificate', 'Caste Certificate', 'Voter ID', 'Aadhaar', 'Scholarship'];
    }
  }, [lang]);

  // =========================================================================
  // VIEW 1: LOGIN GATEWAY SCREEN ("when i open website first i want login and next")
  // =========================================================================
  if (!currentUser) {
    return /*#__PURE__*/React.createElement("div", {
      className: "login-gateway-container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "top-notice-bar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "container notice-inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "notice-left"
    }, /*#__PURE__*/React.createElement("span", {
      className: "live-indicator"
    }), /*#__PURE__*/React.createElement("span", {
      className: "notice-badge"
    }, "CIVIC NOTICE:"), /*#__PURE__*/React.createElement("span", {
      className: "notice-text"
    }, t('officialNotice'))), /*#__PURE__*/React.createElement("div", {
      className: "lang-dropdown-wrapper"
    }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("select", {
      value: lang,
      onChange: e => {
        const newLang = e.target.value;
        setLang(newLang);
        localStorage.setItem('civic_lang', newLang);
      },
      className: "lang-dropdown",
      "aria-label": "Select Language"
    }, /*#__PURE__*/React.createElement("option", {
      value: "en"
    }, "English (EN)"), /*#__PURE__*/React.createElement("option", {
      value: "te"
    }, "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41 (Telugu)"), /*#__PURE__*/React.createElement("option", {
      value: "hi"
    }, "\u0939\u093F\u0902\u0926\u0940 (Hindi)"))))), /*#__PURE__*/React.createElement("div", {
      className: "login-hero-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "login-brand-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "brand-emblem-large"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "36",
      height: "36",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    }))), /*#__PURE__*/React.createElement("h1", {
      className: "login-title"
    }, t('loginGatewayTitle')), /*#__PURE__*/React.createElement("p", {
      className: "login-sub"
    }, t('loginGatewaySubtitle'))), /*#__PURE__*/React.createElement("div", {
      className: "login-trust-badges"
    }, /*#__PURE__*/React.createElement("span", {
      className: "trust-pill"
    }, t('trustBadge1')), /*#__PURE__*/React.createElement("span", {
      className: "trust-pill"
    }, t('trustBadge2')), /*#__PURE__*/React.createElement("span", {
      className: "trust-pill"
    }, t('trustBadge3')), /*#__PURE__*/React.createElement("span", {
      className: "trust-pill"
    }, t('trustBadge4'))), /*#__PURE__*/React.createElement("div", {
      className: "login-card-box"
    }, /*#__PURE__*/React.createElement("div", {
      className: "login-tabs"
    }, /*#__PURE__*/React.createElement("button", {
      className: `login-tab-btn ${authMode === 'login' ? 'active' : ''}`,
      onClick: () => setAuthMode('login')
    }, t('tabSignIn')), /*#__PURE__*/React.createElement("button", {
      className: `login-tab-btn ${authMode === 'register' ? 'active' : ''}`,
      onClick: () => setAuthMode('register')
    }, t('tabRegister'))), /*#__PURE__*/React.createElement("form", {
      onSubmit: handleAuthSubmit,
      className: "login-form"
    }, authMode === 'register' && /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", null, t('fullNameLabel')), /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Shiva Sai",
      value: authName,
      onChange: e => setAuthName(e.target.value),
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", null, t('emailLabel')), /*#__PURE__*/React.createElement("input", {
      type: "email",
      className: "form-control",
      placeholder: "citizen@example.com",
      value: authEmail,
      onChange: e => setAuthEmail(e.target.value),
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", null, t('passwordLabel')), /*#__PURE__*/React.createElement("input", {
      type: "password",
      className: "form-control",
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      value: authPassword,
      onChange: e => setAuthPassword(e.target.value),
      required: true
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "btn-primary",
      style: {
        width: '100%',
        padding: '12px',
        fontSize: '15px'
      }
    }, authMode === 'login' ? t('btnSignInAction') : t('btnRegisterAction'))), /*#__PURE__*/React.createElement("div", {
      className: "quick-access-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "divider-text"
    }, /*#__PURE__*/React.createElement("span", null, t('quickDemoTitle'))), /*#__PURE__*/React.createElement("div", {
      className: "quick-buttons-stack"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-quick-demo citizen",
      onClick: () => handleQuickLogin('citizen@example.com', 'Password@123')
    }, t('demoCitizenBtn')), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-quick-demo admin",
      onClick: () => handleQuickLogin('admin@civicguide.gov.in', 'Password@123')
    }, t('demoAdminBtn')), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-quick-guest",
      onClick: handleContinueAsGuest
    }, t('continueGuestBtn'))), /*#__PURE__*/React.createElement("p", {
      className: "guest-note"
    }, t('guestNotice'))))), toast && /*#__PURE__*/React.createElement("div", {
      className: "toast-container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "toast"
    }, /*#__PURE__*/React.createElement("span", null, toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'), /*#__PURE__*/React.createElement("span", null, toast.message))));
  }

  // =========================================================================
  // VIEW 2: MAIN CIVIC PORTAL (Rendered after Login - "next")
  // =========================================================================
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "top-notice-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container notice-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "notice-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "live-indicator"
  }), /*#__PURE__*/React.createElement("span", {
    className: "notice-badge"
  }, "OFFICIAL NOTICE:"), /*#__PURE__*/React.createElement("span", {
    className: "notice-text"
  }, t('disclaimer'))), /*#__PURE__*/React.createElement("div", {
    className: "lang-dropdown-wrapper"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("select", {
    value: lang,
    onChange: e => {
      const newLang = e.target.value;
      setLang(newLang);
      localStorage.setItem('civic_lang', newLang);
    },
    className: "lang-dropdown",
    "aria-label": "Select Language"
  }, /*#__PURE__*/React.createElement("option", {
    value: "en"
  }, "English (EN)"), /*#__PURE__*/React.createElement("option", {
    value: "te"
  }, "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41 (Telugu)"), /*#__PURE__*/React.createElement("option", {
    value: "hi"
  }, "\u0939\u093F\u0902\u0926\u0940 (Hindi)"))))), /*#__PURE__*/React.createElement("header", {
    className: "main-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container header-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-group",
    onClick: () => setActiveTab('services')
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-emblem"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-title"
  }, t('brandTitle')), /*#__PURE__*/React.createElement("span", {
    className: "ai-pill"
  }, "AI")), /*#__PURE__*/React.createElement("p", {
    className: "brand-sub"
  }, t('brandSub')))), /*#__PURE__*/React.createElement("nav", {
    className: "nav-links"
  }, /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeTab === 'services' ? 'active' : ''}`,
    onClick: () => setActiveTab('services')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFDB\uFE0F"), " ", t('navServices')), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${isAiOpen ? 'active' : ''}`,
    onClick: () => setIsAiOpen(true)
  }, /*#__PURE__*/React.createElement("span", null, "\u2728"), " ", t('navChat')), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeTab === 'applications' ? 'active' : ''}`,
    onClick: () => setActiveTab('applications')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCB"), " ", t('navApplications')), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeTab === 'reminders' ? 'active' : ''}`,
    onClick: () => setActiveTab('reminders')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD14"), " ", t('navReminders')), currentUser?.role === 'admin' && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeTab === 'admin' ? 'active' : ''}`,
    onClick: () => setActiveTab('admin'),
    style: {
      color: '#7c3aed'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEE1\uFE0F"), " ", t('navAdmin'))), /*#__PURE__*/React.createElement("div", {
    className: "header-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-gold",
    onClick: () => setIsWizardOpen(true)
  }, /*#__PURE__*/React.createElement("span", null, "\u2728"), " ", t('btnWizard')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: '#0f2744',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '13px'
    }
  }, currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      fontWeight: '700'
    }
  }, currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Citizen'), /*#__PURE__*/React.createElement("button", {
    onClick: handleLogout,
    className: "btn-secondary",
    style: {
      padding: '6px 10px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    title: "Sign Out"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEAA"), " ", t('btnLogout')))))), activeTab === 'services' && /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    className: "hero-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-decor-orb-1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-decor-orb-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      position: 'relative',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-tag"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDDEE\uD83C\uDDF3"), " ", t('nationalInitiative')), /*#__PURE__*/React.createElement("h1", {
    className: "hero-title"
  }, t('heroTitle')), /*#__PURE__*/React.createElement("p", {
    className: "hero-subtitle"
  }, t('heroSubtitle')), /*#__PURE__*/React.createElement("div", {
    className: "search-box-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "search-box"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "search-icon",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  })), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "search-input",
    placeholder: t('searchPlaceholder'),
    value: searchQuery,
    onChange: e => setSearchQuery(e.target.value)
  }), searchQuery && /*#__PURE__*/React.createElement("button", {
    onClick: () => setSearchQuery(''),
    style: {
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      cursor: 'pointer',
      padding: '4px 8px',
      fontSize: '16px'
    }
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    className: "quick-tags"
  }, /*#__PURE__*/React.createElement("span", null, t('popularSearches')), popularTags.map(tag => /*#__PURE__*/React.createElement("button", {
    key: tag,
    className: "tag-chip",
    onClick: () => setSearchQuery(tag)
  }, tag))), /*#__PURE__*/React.createElement("div", {
    className: "hero-metrics-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      marginBottom: '2px'
    }
  }, "\uD83C\uDFDB\uFE0F"), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, t('metricPortalsVal')), /*#__PURE__*/React.createElement("div", {
    className: "metric-label"
  }, t('metricPortalsLbl'))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      marginBottom: '2px'
    }
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, t('metricRagVal')), /*#__PURE__*/React.createElement("div", {
    className: "metric-label"
  }, t('metricRagLbl'))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      marginBottom: '2px'
    }
  }, "\uD83D\uDEE1\uFE0F"), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, t('metricToutsVal')), /*#__PURE__*/React.createElement("div", {
    className: "metric-label"
  }, t('metricToutsLbl'))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      marginBottom: '2px'
    }
  }, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, t('metricLangVal')), /*#__PURE__*/React.createElement("div", {
    className: "metric-label"
  }, t('metricLangLbl')))), /*#__PURE__*/React.createElement("div", {
    className: "category-badges-shelf"
  }, /*#__PURE__*/React.createElement("button", {
    className: `cat-pill-btn ${selectedCategory === 'ALL' ? 'active' : ''}`,
    onClick: () => setSelectedCategory('ALL')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF1F"), " ", t('catAll')), /*#__PURE__*/React.createElement("button", {
    className: `cat-pill-btn ${selectedCategory === 'Identity' ? 'active' : ''}`,
    onClick: () => setSelectedCategory('Identity')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEC2"), " ", t('catIdentity')), /*#__PURE__*/React.createElement("button", {
    className: `cat-pill-btn ${selectedCategory === 'Transport' ? 'active' : ''}`,
    onClick: () => setSelectedCategory('Transport')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDE97"), " ", t('catTransport')), /*#__PURE__*/React.createElement("button", {
    className: `cat-pill-btn ${selectedCategory === 'Revenue' ? 'active' : ''}`,
    onClick: () => setSelectedCategory('Revenue')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCDC"), " ", t('catRevenue')), /*#__PURE__*/React.createElement("button", {
    className: `cat-pill-btn ${selectedCategory === 'Civil' ? 'active' : ''}`,
    onClick: () => setSelectedCategory('Civil')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC76"), " ", t('catCivil')), /*#__PURE__*/React.createElement("button", {
    className: `cat-pill-btn ${selectedCategory === 'Business' ? 'active' : ''}`,
    onClick: () => setSelectedCategory('Business')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCBC"), " ", t('catBusiness')), /*#__PURE__*/React.createElement("button", {
    className: `cat-pill-btn ${selectedCategory === 'Education' ? 'active' : ''}`,
    onClick: () => setSelectedCategory('Education')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF93"), " ", t('catEducation'))))), /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "filter-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "filter-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#475569'
    }
  }, t('filterJurisdiction')), /*#__PURE__*/React.createElement("select", {
    value: selectedState,
    onChange: e => setSelectedState(e.target.value),
    className: "filter-select"
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, t('allStates')), /*#__PURE__*/React.createElement("option", {
    value: "Telangana"
  }, "Telangana"), /*#__PURE__*/React.createElement("option", {
    value: "Andhra Pradesh"
  }, "Andhra Pradesh"), /*#__PURE__*/React.createElement("option", {
    value: "Maharashtra"
  }, "Maharashtra"), /*#__PURE__*/React.createElement("option", {
    value: "Karnataka"
  }, "Karnataka"), /*#__PURE__*/React.createElement("option", {
    value: "Delhi"
  }, "Delhi")), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#475569',
      marginLeft: '8px'
    }
  }, t('filterMode')), /*#__PURE__*/React.createElement("select", {
    value: selectedMode,
    onChange: e => setSelectedMode(e.target.value),
    className: "filter-select"
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, t('allModes')), /*#__PURE__*/React.createElement("option", {
    value: "ONLINE"
  }, t('modeOnline')), /*#__PURE__*/React.createElement("option", {
    value: "OFFLINE"
  }, t('modeOffline')), /*#__PURE__*/React.createElement("option", {
    value: "HYBRID"
  }, t('modeHybrid')))), /*#__PURE__*/React.createElement("div", {
    className: "results-counter"
  }, filteredServices.length, " ", t('serviceCountSuffix'))), /*#__PURE__*/React.createElement("div", {
    className: "services-grid"
  }, filteredServices.map(srv => {
    const isSaved = savedIds.has(srv.id);
    return /*#__PURE__*/React.createElement("div", {
      key: srv.id,
      className: "service-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "service-card-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "service-card-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "service-badge-category"
    }, srv.category), /*#__PURE__*/React.createElement("span", {
      className: "service-badge-verified"
    }, /*#__PURE__*/React.createElement("span", null, "\u2713"), " ", t('badgeOfficial'))), /*#__PURE__*/React.createElement("button", {
      className: `btn-bookmark ${isSaved ? 'active' : ''}`,
      onClick: () => handleToggleSave(srv.id),
      title: isSaved ? t('btnSaved') : t('btnSave')
    }, isSaved ? '★' : '☆')), /*#__PURE__*/React.createElement("h3", {
      className: "service-card-title"
    }, srv.title), /*#__PURE__*/React.createElement("p", {
      className: "service-card-desc"
    }, srv.short_summary || srv.description), /*#__PURE__*/React.createElement("div", {
      className: "service-card-details"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "detail-label"
    }, t('lblProcessing')), /*#__PURE__*/React.createElement("span", {
      className: "detail-value"
    }, srv.processing_time || '7-15 Days')), /*#__PURE__*/React.createElement("div", {
      className: "detail-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "detail-label"
    }, t('lblFees')), /*#__PURE__*/React.createElement("span", {
      className: "detail-value",
      style: {
        color: '#0f766e',
        fontWeight: '700'
      }
    }, srv.fee_structure ? srv.fee_structure.split(';')[0] : t('freeFee')))), /*#__PURE__*/React.createElement("div", {
      className: "service-card-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-primary",
      style: {
        width: '100%'
      },
      onClick: () => openServiceModal(srv.id)
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCC4"), " ", t('btnViewDetails'))));
  })))), activeTab === 'applications' && /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: '36px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#0f172a'
    }
  }, t('appsTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#64748b',
      fontSize: '14px'
    }
  }, t('appsSubtitle'))), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => setIsNewAppOpen(true)
  }, t('btnNewApp'))), applications.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '48px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '48px',
      marginBottom: '16px'
    }
  }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '8px'
    }
  }, t('emptyApps'))) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: '14px'
    }
  }, /*#__PURE__*/React.createElement("thead", {
    style: {
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      fontWeight: '700',
      color: '#475569'
    }
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '14px 18px'
    }
  }, t('colService')), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '14px 18px'
    }
  }, t('colRefNum')), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '14px 18px'
    }
  }, t('colStatus')), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '14px 18px'
    }
  }, t('colDate')), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '14px 18px'
    }
  }, t('colActions')))), /*#__PURE__*/React.createElement("tbody", null, applications.map(app => /*#__PURE__*/React.createElement("tr", {
    key: app.id,
    style: {
      borderBottom: '1px solid #f1f5f9'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 18px',
      fontWeight: '600'
    }
  }, app.service_title || app.service_id), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 18px',
      fontFamily: 'monospace',
      color: '#0f2744',
      fontWeight: '700'
    }
  }, app.application_reference_number), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '700',
      background: app.status === 'APPROVED' ? '#dcfce7' : app.status === 'UNDER_REVIEW' ? '#fef3c7' : '#eff6ff',
      color: app.status === 'APPROVED' ? '#166534' : app.status === 'UNDER_REVIEW' ? '#92400e' : '#1e40af'
    }
  }, app.status)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 18px',
      color: '#64748b'
    }
  }, app.created_at ? app.created_at.split('T')[0] : '2026-09-27'), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 18px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      try {
        await api(`/applications/${app.id}`, {
          method: 'DELETE'
        });
        setApplications(applications.filter(a => a.id !== app.id));
        showToast('Application record removed');
      } catch (e) {
        showToast(e.message, 'error');
      }
    },
    style: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontWeight: '600'
    }
  }, "\u2715 Delete")))))))), activeTab === 'reminders' && /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: '36px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#0f172a'
    }
  }, t('remindersTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#64748b',
      fontSize: '14px'
    }
  }, t('remindersSubtitle'))), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => setIsNewReminderOpen(true)
  }, t('btnNewReminder'))), reminders.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '48px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '48px',
      marginBottom: '16px'
    }
  }, "\uD83D\uDD14"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '8px'
    }
  }, t('emptyReminders'))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '16px'
    }
  }, reminders.map(rem => /*#__PURE__*/React.createElement("div", {
    key: rem.id,
    style: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#0f2744'
    }
  }, rem.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#ef4444',
      fontWeight: '700',
      background: '#fef2f2',
      padding: '3px 8px',
      borderRadius: '6px'
    }
  }, "\uD83D\uDCC5 ", rem.reminder_date)), rem.notes && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '12px'
    }
  }, rem.notes), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      try {
        await api(`/reminders/${rem.id}`, {
          method: 'DELETE'
        });
        setReminders(reminders.filter(r => r.id !== rem.id));
        showToast('Reminder dismissed');
      } catch (e) {
        showToast(e.message, 'error');
      }
    },
    style: {
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600'
    }
  }, "\u2713 Dismiss"))))), activeTab === 'admin' && currentUser?.role === 'admin' && /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: '36px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#0f172a'
    }
  }, t('adminTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#64748b',
      fontSize: '14px'
    }
  }, t('adminSubtitle'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#0f2744'
    }
  }, adminStats?.totalServices || 12), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase'
    }
  }, t('statTotalServices'))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#10b981'
    }
  }, adminStats?.verifiedServices || 12), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase'
    }
  }, t('statVerified'))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#f59e0b'
    }
  }, adminStats?.pendingReview || 0), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase'
    }
  }, t('statPending'))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#7c3aed'
    }
  }, adminStats?.totalAuditRecords || 24), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase'
    }
  }, t('statAudits'))))), selectedService && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: () => setSelectedService(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "service-badge-category"
  }, selectedService.category), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '20px',
      fontWeight: '800',
      color: '#0f172a',
      marginTop: '6px'
    }
  }, selectedService.title)), /*#__PURE__*/React.createElement("button", {
    className: "modal-close-btn",
    onClick: () => setSelectedService(null)
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'overview' ? 'active' : ''}`,
    onClick: () => setModalTab('overview')
  }, t('tabOverview')), /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'checklist' ? 'active' : ''}`,
    onClick: () => setModalTab('checklist')
  }, t('tabChecklist')), /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'steps' ? 'active' : ''}`,
    onClick: () => setModalTab('steps')
  }, t('tabSteps')), /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'sources' ? 'active' : ''}`,
    onClick: () => setModalTab('sources')
  }, t('tabSources'))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, modalTab === 'overview' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      lineHeight: 1.7,
      color: '#334155',
      marginBottom: '20px'
    }
  }, selectedService.description), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: '700',
      color: '#0f2744',
      marginBottom: '6px'
    }
  }, t('lblEligibility')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#475569'
    }
  }, selectedService.eligibility_criteria || 'Indian Citizens meeting age and residential jurisdiction requirements.')), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '12px',
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: '700',
      color: '#1e40af',
      marginBottom: '6px'
    }
  }, t('lblGovFee')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#0f2744'
    }
  }, selectedService.fee_structure))), modalTab === 'checklist' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '700',
      marginBottom: '4px'
    }
  }, t('docsChecklistTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '16px'
    }
  }, t('checklistSubtitle')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, (selectedService.required_documents || [{
    document_name: 'Proof of Identity (Aadhaar / Voter ID / PAN)',
    mandatory: true
  }, {
    document_name: 'Proof of Address (Electricity bill / Passport / Bank Passbook)',
    mandatory: true
  }, {
    document_name: 'Proof of Date of Birth (Birth Certificate / SSC Certificate)',
    mandatory: true
  }, {
    document_name: 'Recent Passport Size Color Photographs (35mm x 45mm)',
    mandatory: true
  }]).map((doc, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#0f172a'
    }
  }, doc.document_name), doc.mandatory && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      color: '#ef4444',
      fontWeight: '700'
    }
  }, "* MANDATORY")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#10b981',
      background: '#ecfdf5',
      padding: '4px 8px',
      borderRadius: '6px'
    }
  }, "\u2713 ", t('statusReady')))))), modalTab === 'steps' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '700',
      marginBottom: '4px'
    }
  }, t('timelineStepsTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '16px'
    }
  }, t('timelineSubtitle')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, (selectedService.application_steps || [{
    step_number: 1,
    title: 'Portal Registration & Online Form Filling',
    description: 'Visit verified government portal, register using email/mobile and fill application details.'
  }, {
    step_number: 2,
    title: 'Document Upload & Scrutiny',
    description: 'Attach scanned clear copies of mandatory identity, address, and date of birth proofs.'
  }, {
    step_number: 3,
    title: 'Statutory Fee Payment & Appointment Slot',
    description: 'Pay the exact statutory government fee via SBI ePay/UPI and schedule verification slot.'
  }, {
    step_number: 4,
    title: 'In-Person Biometric Verification & Delivery',
    description: 'Attend appointment at center. Certificate or document dispatched via India Speed Post.'
  }]).map((step, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: '#0f2744',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '12px',
      flexShrink: 0
    }
  }, step.step_number || idx + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#0f172a'
    }
  }, step.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginTop: '2px'
    }
  }, step.description)))))), modalTab === 'sources' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '700',
      marginBottom: '4px'
    }
  }, t('sourcesTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '16px'
    }
  }, t('sourcesSubtitle')), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      marginBottom: '4px'
    }
  }, "Official Portal Link"), /*#__PURE__*/React.createElement("a", {
    href: selectedService.official_url,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#2563eb',
      textDecoration: 'none',
      wordBreak: 'break-all'
    }
  }, selectedService.official_url, " \u2197")), /*#__PURE__*/React.createElement("a", {
    href: selectedService.official_url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "btn-primary",
    style: {
      display: 'inline-flex',
      width: '100%',
      justifyContent: 'center',
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF10"), " ", t('btnVisitPortal')))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: () => setSelectedService(null)
  }, t('btnClose'))))), isWizardOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: () => setIsWizardOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '18px',
      fontWeight: '800',
      color: '#0f172a'
    }
  }, t('wizardTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12px',
      color: '#64748b'
    }
  }, t('wizardSubtitle'))), /*#__PURE__*/React.createElement("button", {
    className: "modal-close-btn",
    onClick: () => setIsWizardOpen(false)
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('wizStateLbl')), /*#__PURE__*/React.createElement("select", {
    value: wizState,
    onChange: e => setWizState(e.target.value),
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "Telangana"
  }, "Telangana"), /*#__PURE__*/React.createElement("option", {
    value: "Andhra Pradesh"
  }, "Andhra Pradesh"), /*#__PURE__*/React.createElement("option", {
    value: "Maharashtra"
  }, "Maharashtra"), /*#__PURE__*/React.createElement("option", {
    value: "Karnataka"
  }, "Karnataka"), /*#__PURE__*/React.createElement("option", {
    value: "Delhi"
  }, "Delhi"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('wizAgeLbl')), /*#__PURE__*/React.createElement("select", {
    value: wizAge,
    onChange: e => setWizAge(e.target.value),
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "ADULT_18_59"
  }, t('wizAgeAdult')), /*#__PURE__*/React.createElement("option", {
    value: "MINOR_UNDER_18"
  }, t('wizAgeMinor')), /*#__PURE__*/React.createElement("option", {
    value: "SENIOR_60_PLUS"
  }, t('wizAgeSenior')))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('wizOccLbl')), /*#__PURE__*/React.createElement("select", {
    value: wizOcc,
    onChange: e => setWizOcc(e.target.value),
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "CITIZEN"
  }, t('wizOccCitizen')), /*#__PURE__*/React.createElement("option", {
    value: "STUDENT"
  }, t('wizOccStudent')), /*#__PURE__*/React.createElement("option", {
    value: "BUSINESS"
  }, t('wizOccBusiness')), /*#__PURE__*/React.createElement("option", {
    value: "GOVERNMENT"
  }, t('wizOccGovt')))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('wizServiceLbl')), /*#__PURE__*/React.createElement("select", {
    value: wizService,
    onChange: e => setWizService(e.target.value),
    className: "form-control"
  }, services.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.title)))), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    style: {
      width: '100%'
    },
    onClick: handleGenerateGuidance,
    disabled: isWizLoading
  }, isWizLoading ? 'Analyzing Government Gazette Rules...' : t('btnGenerateGuidance')), wizResult && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '24px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#0f2744',
      marginBottom: '8px'
    }
  }, t('wizardResultTitle')), /*#__PURE__*/React.createElement("ul", {
    style: {
      paddingLeft: '20px',
      fontSize: '13px',
      lineHeight: 1.7,
      color: '#334155'
    }
  }, (wizResult.personalizedChecklist || []).map((item, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, item))))))), isNewAppOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: () => setIsNewAppOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '18px',
      fontWeight: '800',
      color: '#0f172a'
    }
  }, t('modalNewAppTitle')), /*#__PURE__*/React.createElement("button", {
    className: "modal-close-btn",
    onClick: () => setIsNewAppOpen(false)
  }, "\u2715")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleCreateApplication,
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('lblSelectService')), /*#__PURE__*/React.createElement("select", {
    value: newAppServiceId,
    onChange: e => setNewAppServiceId(e.target.value),
    className: "form-control",
    required: true
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "-- Choose Government Service --"), services.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.title)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('lblRefNumber')), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    placeholder: "e.g. ARN-2026-981245",
    value: newAppRef,
    onChange: e => setNewAppRef(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('lblInitialStatus')), /*#__PURE__*/React.createElement("select", {
    value: newAppStatus,
    onChange: e => setNewAppStatus(e.target.value),
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "SUBMITTED"
  }, t('statusSubmitted')), /*#__PURE__*/React.createElement("option", {
    value: "UNDER_REVIEW"
  }, t('statusUnderReview')), /*#__PURE__*/React.createElement("option", {
    value: "APPROVED"
  }, t('statusApproved')), /*#__PURE__*/React.createElement("option", {
    value: "ACTION_REQUIRED"
  }, t('statusActionRequired')))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-primary",
    style: {
      width: '100%'
    }
  }, t('btnSaveApp'))))), isNewReminderOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: () => setIsNewReminderOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '18px',
      fontWeight: '800',
      color: '#0f172a'
    }
  }, t('modalNewReminderTitle')), /*#__PURE__*/React.createElement("button", {
    className: "modal-close-btn",
    onClick: () => setIsNewReminderOpen(false)
  }, "\u2715")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleCreateReminder,
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('lblReminderTitle')), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    placeholder: "e.g. Renew Driving Licence",
    value: newRemTitle,
    onChange: e => setNewRemTitle(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('lblDueDate')), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-control",
    value: newRemDate,
    onChange: e => setNewRemDate(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", null, t('lblNotes')), /*#__PURE__*/React.createElement("textarea", {
    className: "form-control",
    rows: "3",
    placeholder: "Documents needed or reference notes...",
    value: newRemNotes,
    onChange: e => setNewRemNotes(e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-primary",
    style: {
      width: '100%'
    }
  }, t('btnSaveReminder'))))), isAiOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: () => setIsAiOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '460px',
      background: '#ffffff',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#0f2744',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '16px',
      fontWeight: '800'
    }
  }, "\u2728 ", t('chatTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '11px',
      color: '#94a3b8'
    }
  }, t('chatSubtitle'))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsAiOpen(false),
    style: {
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '18px',
      cursor: 'pointer'
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      gap: '6px',
      overflowX: 'auto'
    }
  }, [t('chatQuick1'), t('chatQuick2'), t('chatQuick3'), t('chatQuick4')].map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => handleSendMessage(p),
    style: {
      whiteSpace: 'nowrap',
      fontSize: '11px',
      fontWeight: '600',
      background: '#fff',
      border: '1px solid #cbd5e1',
      borderRadius: '999px',
      padding: '4px 10px',
      cursor: 'pointer'
    }
  }, p))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, chatMessages.map((msg, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '85%',
      background: msg.role === 'user' ? '#0f2744' : '#f1f5f9',
      color: msg.role === 'user' ? '#ffffff' : '#0f172a',
      padding: '12px 16px',
      borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
      fontSize: '13px',
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      whiteSpace: 'pre-line'
    }
  }, msg.text), msg.sources && msg.sources.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '8px',
      paddingTop: '8px',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      fontSize: '11px',
      color: '#475569'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: '700'
    }
  }, "Sources: "), msg.sources.map((s, idx) => /*#__PURE__*/React.createElement("span", {
    key: idx,
    style: {
      marginRight: '6px'
    }
  }, "\u2022 ", s.authority || s.title))))), isChatLoading && /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: 'flex-start',
      background: '#f1f5f9',
      padding: '10px 14px',
      borderRadius: '12px',
      fontSize: '12px',
      color: '#64748b'
    }
  }, "Searching verified government records...")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    placeholder: t('chatPlaceholder'),
    value: chatInput,
    onChange: e => setChatInput(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') handleSendMessage();
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => handleSendMessage(),
    disabled: isChatLoading || !chatInput.trim()
  }, t('chatSendBtn'))))), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement("span", null, toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'), /*#__PURE__*/React.createElement("span", null, toast.message))), /*#__PURE__*/React.createElement("footer", {
    className: "site-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container footer-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-brand"
  }, /*#__PURE__*/React.createElement("h4", null, "\uD83C\uDFDB\uFE0F ", t('brandTitle'), " AI"), /*#__PURE__*/React.createElement("p", {
    style: {
      lineHeight: 1.6,
      maxWidth: '440px'
    }
  }, t('footerDesc'))), /*#__PURE__*/React.createElement("div", {
    className: "footer-links"
  }, /*#__PURE__*/React.createElement("h5", null, t('footerPortalsTitle')), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://www.passportindia.gov.in",
    target: "_blank",
    rel: "noopener"
  }, "Passport Seva (.gov.in)")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://sarathi.parivahan.gov.in",
    target: "_blank",
    rel: "noopener"
  }, "Parivahan Sarathi (.gov.in)")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://myaadhaar.uidai.gov.in",
    target: "_blank",
    rel: "noopener"
  }, "UIDAI Aadhaar (.gov.in)")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://voters.eci.gov.in",
    target: "_blank",
    rel: "noopener"
  }, "Election Commission (.gov.in)")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://meeseva.telangana.gov.in",
    target: "_blank",
    rel: "noopener"
  }, "MeeSeva Telangana")))), /*#__PURE__*/React.createElement("div", {
    className: "footer-links"
  }, /*#__PURE__*/React.createElement("h5", null, t('footerAssuranceTitle')), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, t('assurance1')), /*#__PURE__*/React.createElement("li", null, t('assurance2')), /*#__PURE__*/React.createElement("li", null, t('assurance3')), /*#__PURE__*/React.createElement("li", null, t('assurance4'))))), /*#__PURE__*/React.createElement("div", {
    className: "container footer-bottom"
  }, /*#__PURE__*/React.createElement("div", null, t('footerCopyright')), /*#__PURE__*/React.createElement("div", null, t('footerCompliance')))));
}