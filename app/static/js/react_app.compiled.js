import { DICTIONARY, getLocalizedTitle, getLocalizedDescription, getLocalizedCategory } from './i18n.js';
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
  const [isAuthOpen, setIsAuthOpen] = useState(() => !localStorage.getItem('civic_auth_token'));
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // Data lists
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [toast, setToast] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([{
    role: 'assistant',
    text: 'Namaste! I am CivicGuide AI, your official government process assistant. Ask me anything about required documents, statutory fees, eligibility, or application procedures for Indian public services.'
  }]);
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

  // Initial Load
  useEffect(() => {
    api('/services/categories').then(res => setCategories(res.data || [])).catch(console.error);
    api('/services').then(res => setServices(res.data || [])).catch(err => showToast(err.message, 'error'));
    if (currentUser) {
      api('/applications/saved').then(res => setSavedIds(new Set((res.data || []).map(s => s.id)))).catch(console.error);
    }
  }, [currentUser]);

  // Load section-specific data
  useEffect(() => {
    if (activeTab === 'applications') {
      api('/applications').then(res => setApplications(res.data || [])).catch(console.error);
    } else if (activeTab === 'reminders') {
      api('/reminders').then(res => setReminders(res.data || [])).catch(console.error);
    } else if (activeTab === 'admin' && currentUser?.role === 'admin') {
      api('/admin/stats').then(res => setAdminStats(res.data)).catch(console.error);
    }
  }, [activeTab]);

  // Filter services
  const filteredServices = useMemo(() => {
    let list = [...services];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.description && s.description.toLowerCase().includes(q) || s.service_code && s.service_code.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'ALL') {
      list = list.filter(s => s.category === selectedCategory);
    }
    if (selectedState !== 'ALL') {
      list = list.filter(s => s.state === 'All-India' || s.state === selectedState);
    }
    if (selectedMode !== 'ALL') {
      list = list.filter(s => s.application_mode === selectedMode);
    }
    return list;
  }, [services, searchQuery, selectedCategory, selectedState, selectedMode]);

  // Toggle bookmark
  const handleToggleSave = async serviceId => {
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
      setSelectedService(res.data);
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
        text: 'Sorry, I encountered an issue retrieving verified government records: ' + err.message
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async e => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const f = e.target;
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: f.loginEmail.value.trim(),
          password: f.loginPassword.value
        })
      });
      localStorage.setItem('civic_auth_token', res.data.token);
      localStorage.setItem('civic_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.full_name}!`, 'success');
      setIsAuthOpen(false);
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async e => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const f = e.target;
    try {
      const res = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: f.regName.value.trim(),
          email: f.regEmail.value.trim(),
          state: f.regState.value,
          password: f.regPassword.value
        })
      });
      localStorage.setItem('civic_auth_token', res.data.token);
      localStorage.setItem('civic_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      showToast(`Account created! Welcome, ${res.data.user.full_name}!`, 'success');
      setIsAuthOpen(false);
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth logout
  const handleLogout = () => {
    localStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_user');
    setCurrentUser(null);
    setSavedIds(new Set());
    setAuthMode('login');
    setAuthError('');
    setIsAuthOpen(true);
    showToast('Signed out successfully');
  };
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
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsLangModalOpen(true),
    style: {
      background: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#0f2744',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    title: "Click to Switch Language / \u0C2D\u0C3E\u0C37 \u0C2E\u0C3E\u0C30\u0C4D\u0C1A\u0C02\u0C21\u0C3F / \u092D\u093E\u0937\u093E \u092C\u0926\u0932\u0947\u0902"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("span", null, lang === 'en' ? 'English (EN)' : lang === 'te' ? 'తెలుగు (TE)' : 'हिंदी (HI)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      color: '#2563eb'
    }
  }, "\u21C4 Change"))))), /*#__PURE__*/React.createElement("header", {
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
  }, "CivicGuide"), /*#__PURE__*/React.createElement("span", {
    className: "ai-pill"
  }, "AI")), /*#__PURE__*/React.createElement("p", {
    className: "brand-sub"
  }, "Government Process Assistant"))), /*#__PURE__*/React.createElement("nav", {
    className: "nav-links"
  }, /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeTab === 'services' ? 'active' : ''}`,
    onClick: () => setActiveTab('services')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFDB\uFE0F"), " ", t('servicesNav')), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${isAiOpen ? 'active' : ''}`,
    onClick: () => setIsAiOpen(true)
  }, /*#__PURE__*/React.createElement("span", null, "\u2728"), " ", t('askAi')), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeTab === 'applications' ? 'active' : ''}`,
    onClick: () => setActiveTab('applications')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCB"), " ", t('myApplications')), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeTab === 'reminders' ? 'active' : ''}`,
    onClick: () => setActiveTab('reminders')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD14"), " ", t('reminders')), currentUser?.role === 'admin' && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeTab === 'admin' ? 'active' : ''}`,
    onClick: () => setActiveTab('admin'),
    style: {
      color: '#7c3aed'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEE1\uFE0F"), " ", t('adminPortal'))), /*#__PURE__*/React.createElement("div", {
    className: "header-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: () => setIsLangModalOpen(true),
    style: {
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    title: "Click to Switch Language (English / \u0C24\u0C46\u0C32\u0C41\u0C17\u0C41 / \u0939\u093F\u0902\u0926\u0940)"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("span", null, lang === 'en' ? 'EN' : lang === 'te' ? 'తెలుగు' : 'हिंदी')), /*#__PURE__*/React.createElement("button", {
    className: "btn-gold",
    onClick: () => setIsWizardOpen(true)
  }, /*#__PURE__*/React.createElement("span", null, "\u2728"), " ", t('getGuidance')), currentUser ? /*#__PURE__*/React.createElement("div", {
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
  }, currentUser.full_name.charAt(0)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      fontWeight: '700'
    }
  }, currentUser.full_name.split(' ')[0]), /*#__PURE__*/React.createElement("button", {
    onClick: handleLogout,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#ef4444',
      fontSize: '14px',
      padding: '4px'
    },
    title: "Logout"
  }, "\uD83D\uDEAA")) : /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => setIsAuthOpen(true)
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC64"), " ", t('login'))))), activeTab === 'services' && /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
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
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDDEE\uD83C\uDDF3"), " National Citizen Information Initiative"), /*#__PURE__*/React.createElement("h1", {
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
  }, /*#__PURE__*/React.createElement("span", null, t('popularSearches')), ['Passport', 'Driving Licence', 'Income Certificate', 'Birth Certificate', 'Caste Certificate', 'Voter ID', 'Aadhaar', 'Scholarship'].map(tag => /*#__PURE__*/React.createElement("button", {
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
  }, "12+"), /*#__PURE__*/React.createElement("div", {
    className: "metric-label"
  }, t('statPortals'))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      marginBottom: '2px'
    }
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, "100%"), /*#__PURE__*/React.createElement("div", {
    className: "metric-label"
  }, t('statRag'))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      marginBottom: '2px'
    }
  }, "\uD83D\uDEE1\uFE0F"), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, "Zero"), /*#__PURE__*/React.createElement("div", {
    className: "metric-label"
  }, t('statBroker'))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card interactive-metric",
    onClick: () => setIsLangModalOpen(true),
    style: {
      cursor: 'pointer',
      background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 0.95))',
      border: '1.5px solid #60a5fa',
      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
      position: 'relative'
    },
    title: "Click to Switch Language / \u0C2D\u0C3E\u0C37 \u0C2E\u0C3E\u0C30\u0C4D\u0C1A\u0C02\u0C21\u0C3F / \u092D\u093E\u0937\u093E \u092C\u0926\u0932\u0947\u0902"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      marginBottom: '2px'
    }
  }, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("div", {
    className: "metric-value",
    style: {
      color: '#1e40af'
    }
  }, "3"), /*#__PURE__*/React.createElement("div", {
    className: "metric-label",
    style: {
      color: '#1e3a8a',
      fontWeight: '800'
    }
  }, t('statLang'), " ", /*#__PURE__*/React.createElement("span", null, "\u21C4")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: '#2563eb',
      fontWeight: '700',
      marginTop: '4px',
      background: '#dbeafe',
      padding: '2px 8px',
      borderRadius: '999px',
      display: 'inline-block'
    }
  }, lang === 'en' ? '🇬🇧 English' : lang === 'te' ? '🇮🇳 తెలుగు' : '🇮🇳 हिंदी'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '10px',
      color: '#64748b',
      marginTop: '2px'
    }
  }, t('statLangSub')))), /*#__PURE__*/React.createElement("div", {
    className: "category-badges-shelf"
  }, /*#__PURE__*/React.createElement("button", {
    className: `cat-pill-btn ${selectedCategory === 'ALL' ? 'active' : ''}`,
    onClick: () => setSelectedCategory('ALL')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF1F"), " ", t('allCategories')), categories.map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat,
    className: `cat-pill-btn ${selectedCategory === cat ? 'active' : ''}`,
    onClick: () => setSelectedCategory(cat)
  }, /*#__PURE__*/React.createElement("span", null, cat.includes('Identity') ? '🛂' : cat.includes('Transport') ? '🚗' : cat.includes('Revenue') ? '📜' : cat.includes('Civil') ? '👶' : cat.includes('Education') ? '🎓' : '🏢'), getLocalizedCategory(cat, lang)))))), /*#__PURE__*/React.createElement("div", {
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
  }, "JURISDICTION:"), /*#__PURE__*/React.createElement("select", {
    value: selectedState,
    onChange: e => setSelectedState(e.target.value),
    className: "filter-select"
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, "All States / Pan-India"), /*#__PURE__*/React.createElement("option", {
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
  }, "MODE:"), /*#__PURE__*/React.createElement("select", {
    value: selectedMode,
    onChange: e => setSelectedMode(e.target.value),
    className: "filter-select"
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, "All Modes"), /*#__PURE__*/React.createElement("option", {
    value: "ONLINE"
  }, "Online Portal"), /*#__PURE__*/React.createElement("option", {
    value: "OFFLINE"
  }, "Offline Office"), /*#__PURE__*/React.createElement("option", {
    value: "HYBRID"
  }, "Hybrid"))), /*#__PURE__*/React.createElement("div", {
    className: "results-counter"
  }, filteredServices.length, " services found")), /*#__PURE__*/React.createElement("div", {
    className: "services-grid"
  }, filteredServices.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1/-1',
      textAlign: 'center',
      padding: '60px 20px',
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '32px',
      marginBottom: '8px'
    }
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '4px'
    }
  }, "No matching government services found"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b'
    }
  }, "Try adjusting your search query or jurisdiction filters.")) : filteredServices.map(s => {
    const isSaved = savedIds.has(s.id);
    const isVerified = s.verification_status === 'VERIFIED';
    const feeSnippet = s.fee_structure ? s.fee_structure.split(';')[0] : 'Check Portal';
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      className: "service-card"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "card-header-meta"
    }, /*#__PURE__*/React.createElement("div", {
      className: "meta-badges"
    }, /*#__PURE__*/React.createElement("span", {
      className: "badge-dept"
    }, s.department?.code || 'GOVT'), /*#__PURE__*/React.createElement("span", {
      className: "badge-state"
    }, s.state), /*#__PURE__*/React.createElement("span", {
      className: "badge-mode"
    }, s.application_mode)), /*#__PURE__*/React.createElement("button", {
      className: `bookmark-btn ${isSaved ? 'saved' : ''}`,
      onClick: () => handleToggleSave(s.id),
      title: isSaved ? 'Remove bookmark' : 'Bookmark service'
    }, "\u2605")), /*#__PURE__*/React.createElement("h3", {
      className: "service-title",
      onClick: () => openServiceModal(s.id)
    }, getLocalizedTitle(s, lang)), /*#__PURE__*/React.createElement("p", {
      className: "service-desc"
    }, getLocalizedDescription(s, lang)), /*#__PURE__*/React.createElement("div", {
      className: `verification-pill ${isVerified ? 'verified' : 'unverified'}`
    }, /*#__PURE__*/React.createElement("span", null, isVerified ? '🛡️ ' + t('verifiedBadge') : '⚠️ ' + t('needsVerificationBadge')), /*#__PURE__*/React.createElement("span", {
      className: "last-verified-date"
    }, t('lastVerified'), ": ", s.last_verified)), /*#__PURE__*/React.createElement("div", {
      className: "card-facts"
    }, /*#__PURE__*/React.createElement("div", {
      className: "fact-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "fact-label"
    }, t('fees')), /*#__PURE__*/React.createElement("span", {
      className: "fact-value",
      title: s.fee_structure
    }, "\uD83D\uDCB0 ", feeSnippet)), /*#__PURE__*/React.createElement("div", {
      className: "fact-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "fact-label"
    }, t('processingTime')), /*#__PURE__*/React.createElement("span", {
      className: "fact-value"
    }, "\u23F1\uFE0F ", s.processing_time)))), /*#__PURE__*/React.createElement("div", {
      className: "card-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-primary",
      onClick: () => openServiceModal(s.id)
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCB"), " ", t('viewDetails')), /*#__PURE__*/React.createElement("button", {
      className: "btn-gold",
      onClick: () => {
        setIsAiOpen(true);
        handleSendMessage(`Explain required documents and process for ${s.title}`, s.id);
      },
      title: "Ask AI"
    }, "\u2728"), /*#__PURE__*/React.createElement("a", {
      href: s.official_url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "btn-secondary",
      title: "Open Verified Official Government Portal"
    }, "\uD83D\uDD17")));
  })))), activeTab === 'applications' && /*#__PURE__*/React.createElement("main", {
    className: "container",
    style: {
      padding: '40px 20px'
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
      color: '#0f2744'
    }
  }, "My Tracked Applications"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b'
    }
  }, "Monitor documents readiness, application tokens, and stage progression.")), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => setIsNewAppOpen(true)
  }, "+ Track New Application")), applications.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '60px 20px',
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '32px',
      marginBottom: '12px'
    }
  }, "\uD83D\uDCC1"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '6px'
    }
  }, "No tracked applications yet"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '20px'
    }
  }, "Add an ongoing government application or open any service to track your documentation readiness."), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => setIsNewAppOpen(true)
  }, "+ Track New Application")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, applications.map(app => {
    const docs = app.documents || [];
    const readyCount = docs.filter(d => d.status === 'READY' || d.status === 'UPLOADED').length;
    const progressPct = docs.length ? Math.round(readyCount / docs.length * 100) : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: app.id,
      style: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("h4", {
      style: {
        fontSize: '17px',
        fontWeight: '800',
        color: '#0f2744'
      }
    }, app.service_title), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '10px',
        fontWeight: '700',
        padding: '2px 8px',
        borderRadius: '999px',
        background: '#eff6ff',
        color: '#1e40af'
      }
    }, app.status)), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '2px'
      }
    }, "Ref / Token: ", /*#__PURE__*/React.createElement("strong", null, app.application_reference_number || 'N/A'), " \u2022 Applied on: ", app.applied_on || 'Pending')), /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
        if (confirm('Delete this tracked application?')) {
          await api(`/applications/${app.id}`, {
            method: 'DELETE'
          });
          setApplications(applications.filter(a => a.id !== app.id));
          showToast('Application deleted');
        }
      },
      style: {
        background: 'none',
        border: 'none',
        color: '#ef4444',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600'
      }
    }, "Delete")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        fontWeight: '700',
        color: '#475569',
        marginBottom: '4px'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Document Readiness: ", readyCount, "/", docs.length, " documents ready"), /*#__PURE__*/React.createElement("span", null, progressPct, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: '8px',
        background: '#f1f5f9',
        borderRadius: '999px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${progressPct}%`,
        height: '100%',
        background: progressPct === 100 ? '#10b981' : progressPct > 50 ? '#3b82f6' : '#f59e0b',
        transition: 'width 0.4s ease'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#f8fafc',
        borderRadius: '10px',
        padding: '12px',
        border: '1px solid #f1f5f9'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        color: '#64748b',
        display: 'block',
        marginBottom: '8px'
      }
    }, "Checklist Items"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }
    }, docs.map(d => /*#__PURE__*/React.createElement("div", {
      key: d.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '12px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#0f172a',
        fontWeight: '500'
      }
    }, d.document_name), /*#__PURE__*/React.createElement("select", {
      value: d.status,
      onChange: async e => {
        const newStat = e.target.value;
        await api(`/applications/documents/${d.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: newStat
          })
        });
        setApplications(applications.map(a => {
          if (a.id === app.id) {
            return {
              ...a,
              documents: a.documents.map(item => item.id === d.id ? {
                ...item,
                status: newStat
              } : item)
            };
          }
          return a;
        }));
        showToast('Document status updated', 'success');
      },
      style: {
        fontSize: '11px',
        fontWeight: '600',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #cbd5e1'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "NOT_READY"
    }, "Not Ready"), /*#__PURE__*/React.createElement("option", {
      value: "READY"
    }, "Ready (Original)"), /*#__PURE__*/React.createElement("option", {
      value: "UPLOADED"
    }, "Uploaded / Scanned")))))));
  }))), activeTab === 'reminders' && /*#__PURE__*/React.createElement("main", {
    className: "container",
    style: {
      padding: '40px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '700px',
      margin: '0 auto',
      background: '#fff',
      padding: '28px',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '20px',
      fontWeight: '800',
      color: '#0f2744',
      marginBottom: '8px'
    }
  }, "\uD83D\uDD14 Civic Expiry & Renewal Reminders"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '24px'
    }
  }, "Set reminders for passport expiry, driving licence renewal, tax filing deadlines, or scholarship submission dates."), /*#__PURE__*/React.createElement("form", {
    onSubmit: async e => {
      e.preventDefault();
      const f = e.target;
      const title = f.remTitle.value;
      const date = f.remDate.value;
      const notes = f.remNotes.value;
      try {
        const res = await api('/reminders', {
          method: 'POST',
          body: JSON.stringify({
            title,
            reminder_date: date,
            notes
          })
        });
        setReminders([...reminders, res.data]);
        showToast('Reminder added', 'success');
        f.reset();
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '24px',
      paddingBottom: '24px',
      borderBottom: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("input", {
    name: "remTitle",
    className: "form-control",
    placeholder: "Reminder Title (e.g., Renew Driving Licence)",
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "remDate",
    className: "form-control",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "remNotes",
    className: "form-control",
    placeholder: "Notes (optional)"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-primary",
    style: {
      alignSelf: 'flex-start'
    }
  }, "+ Add Reminder")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, reminders.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: r.is_completed,
    onChange: async e => {
      const val = e.target.checked;
      await api(`/reminders/${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_completed: val
        })
      });
      setReminders(reminders.map(item => item.id === r.id ? {
        ...item,
        is_completed: val
      } : item));
    },
    style: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: r.is_completed ? '#94a3b8' : '#0f172a',
      textDecoration: r.is_completed ? 'line-through' : 'none'
    }
  }, r.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      display: 'block'
    }
  }, "\uD83D\uDCC5 Due: ", r.reminder_date, " \u2022 ", r.service_title || 'Civic Procedure'))), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      await api(`/reminders/${r.id}`, {
        method: 'DELETE'
      });
      setReminders(reminders.filter(item => item.id !== r.id));
      showToast('Reminder deleted');
    },
    style: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: '600'
    }
  }, "\u2715")))))), activeTab === 'admin' && currentUser?.role === 'admin' && /*#__PURE__*/React.createElement("main", {
    className: "container",
    style: {
      padding: '40px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#0f2744'
    }
  }, "Government Information Admin Console"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b'
    }
  }, "Manage official services, audit sources, and certify accuracy against government gazettes.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase'
    }
  }, "Total Services"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#0f172a',
      marginTop: '4px'
    }
  }, adminStats?.totalServices || services.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f0fdf4',
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid #a7f3d0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#065f46',
      textTransform: 'uppercase'
    }
  }, "Verified Official"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#059669',
      marginTop: '4px'
    }
  }, adminStats?.verifiedServices || 12)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbeb',
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid #fde68a'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#92400e',
      textTransform: 'uppercase'
    }
  }, "Pending Review"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#d97706',
      marginTop: '4px'
    }
  }, adminStats?.pendingReview || 0)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase'
    }
  }, "Audit Records"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#475569',
      marginTop: '4px'
    }
  }, adminStats?.totalAuditRecords || 2))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontWeight: '700',
      color: '#0f2744'
    }
  }, "Cataloged Services & Verification Audits")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "civic-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Service Title"), /*#__PURE__*/React.createElement("th", null, "Category"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Last Checked"), /*#__PURE__*/React.createElement("th", null, "Action"))), /*#__PURE__*/React.createElement("tbody", null, services.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, s.title)), /*#__PURE__*/React.createElement("td", null, s.category), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `verification-pill ${s.verification_status === 'VERIFIED' ? 'verified' : 'unverified'}`,
    style: {
      margin: 0,
      display: 'inline-flex'
    }
  }, s.verification_status)), /*#__PURE__*/React.createElement("td", null, s.last_verified), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    style: {
      padding: '4px 8px',
      fontSize: '11px'
    },
    onClick: async () => {
      const findings = prompt('Enter administrative verification finding:');
      if (!findings) return;
      await api(`/admin/services/${s.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          status: 'VERIFIED',
          findings: findings,
          source_url: s.official_url
        })
      });
      showToast('Verification record logged');
      api('/services').then(res => setServices(res.data || []));
    }
  }, "Verify Source \u2197"))))))))), selectedService && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: e => {
      if (e.target.className === 'modal-backdrop') setSelectedService(null);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "modal-title"
  }, getLocalizedTitle(selectedService, lang)), /*#__PURE__*/React.createElement("button", {
    className: "close-btn",
    onClick: () => setSelectedService(null)
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'overview' ? 'active' : ''}`,
    onClick: () => setModalTab('overview')
  }, "Overview"), /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'documents' ? 'active' : ''}`,
    onClick: () => setModalTab('documents')
  }, "Required Documents (", selectedService.documents?.length || 0, ")"), /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'steps' ? 'active' : ''}`,
    onClick: () => setModalTab('steps')
  }, "Step-by-Step Procedure (", selectedService.steps?.length || 0, ")"), /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'sources' ? 'active' : ''}`,
    onClick: () => setModalTab('sources')
  }, "Official Sources (", selectedService.sources?.length || 0, ")"), /*#__PURE__*/React.createElement("button", {
    className: `modal-tab-btn ${modalTab === 'faqs' ? 'active' : ''}`,
    onClick: () => setModalTab('faqs')
  }, "FAQs (", selectedService.faqs?.length || 0, ")")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, modalTab === 'overview' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontWeight: '700',
      color: '#0f2744',
      marginBottom: '8px'
    }
  }, "Official Summary"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#475569',
      lineHeight: '1.6'
    }
  }, getLocalizedDescription(selectedService, lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '20px',
      background: '#f8fafc',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      fontWeight: '700',
      color: '#64748b'
    }
  }, "Statutory Fees"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#0f172a',
      marginTop: '2px'
    }
  }, selectedService.fee_structure)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      fontWeight: '700',
      color: '#64748b'
    }
  }, "Processing Timeline"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#0f172a',
      marginTop: '2px'
    }
  }, selectedService.processing_time)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      fontWeight: '700',
      color: '#64748b'
    }
  }, "Who is Eligible"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#334155',
      marginTop: '2px'
    }
  }, selectedService.eligibility_criteria)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      fontWeight: '700',
      color: '#64748b'
    }
  }, "Application Mode & State"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#334155',
      marginTop: '2px'
    }
  }, selectedService.application_mode, " \u2022 ", selectedService.state))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#1e40af',
      textTransform: 'uppercase'
    }
  }, "Official Verified Government Portal"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#1e3a8a'
    }
  }, selectedService.official_url)), /*#__PURE__*/React.createElement("a", {
    href: selectedService.official_url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "btn-primary",
    style: {
      background: '#1e40af',
      borderColor: '#1d4ed8'
    }
  }, "Visit Official Portal \u2197"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: async () => {
      await api('/applications', {
        method: 'POST',
        body: JSON.stringify({
          service_id: selectedService.id,
          service_title: selectedService.title
        })
      });
      showToast(`Added ${selectedService.title} to tracker!`, 'success');
      setSelectedService(null);
      setActiveTab('applications');
    }
  }, "\u2795 Track This Application"), /*#__PURE__*/React.createElement("button", {
    className: "btn-gold",
    onClick: () => {
      setIsAiOpen(true);
      handleSendMessage(`Explain documents and steps for ${selectedService.title}`, selectedService.id);
    }
  }, "\u2728 Ask AI Assistant"))), modalTab === 'documents' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '16px'
    }
  }, "Prepare these verified mandatory documents before initiating your application. Click to mark readiness:"), (selectedService.documents || []).map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    className: "doc-item-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "doc-check-box",
    onClick: e => e.currentTarget.classList.toggle('ready')
  }, "\u2713"), /*#__PURE__*/React.createElement("div", {
    className: "doc-info-col"
  }, /*#__PURE__*/React.createElement("h4", null, i + 1, ". ", d.document_name), /*#__PURE__*/React.createElement("p", null, d.purpose), /*#__PURE__*/React.createElement("div", {
    className: "doc-meta-tags"
  }, /*#__PURE__*/React.createElement("span", {
    className: "doc-badge"
  }, "Format: ", d.accepted_formats || 'PDF/Scan'), /*#__PURE__*/React.createElement("span", {
    className: "doc-badge"
  }, d.is_original_required ? '⚠️ Original Required' : 'Self-attested Copy'), d.notes && /*#__PURE__*/React.createElement("span", {
    className: "doc-badge",
    style: {
      background: '#fef3c7',
      color: '#92400e'
    }
  }, d.notes)))))), modalTab === 'steps' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '16px'
    }
  }, "Follow these sequential stages on the authorized government portal:"), (selectedService.steps || []).map(step => /*#__PURE__*/React.createElement("div", {
    key: step.id,
    className: "step-item-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step-number-bubble"
  }, step.step_number), /*#__PURE__*/React.createElement("div", {
    className: "step-content"
  }, /*#__PURE__*/React.createElement("h4", null, step.title), /*#__PURE__*/React.createElement("p", null, step.description), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginTop: '6px',
      fontSize: '11px',
      color: '#64748b'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u23F1\uFE0F Est. Time: ", step.estimated_time || '1 day'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, step.is_online_step ? '🌐 Online Submission' : '🏛️ Physical Counter Visit')), step.tips && /*#__PURE__*/React.createElement("div", {
    className: "step-tip"
  }, "\uD83D\uDCA1 ", /*#__PURE__*/React.createElement("strong", null, "Citizen Tip:"), " ", step.tips))))), modalTab === 'sources' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '16px'
    }
  }, "Every procedure on CivicGuide AI is grounded directly in gazetted government portals and statutory rules:"), (selectedService.sources || []).map(src => /*#__PURE__*/React.createElement("div", {
    key: src.id,
    style: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#0f2744'
    }
  }, src.authority_name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      fontWeight: '700',
      background: '#ecfdf5',
      color: '#065f46',
      padding: '2px 8px',
      borderRadius: '999px'
    }
  }, src.verification_badge || 'OFFICIAL_VERIFIED')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12px',
      color: '#475569',
      marginBottom: '8px'
    }
  }, src.citation_text), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: '#64748b',
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: src.source_url,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: '#2563eb',
      fontWeight: '600',
      textDecoration: 'none'
    }
  }, "Verify at: ", src.source_url, " \u2197"), /*#__PURE__*/React.createElement("span", null, "Checked: ", src.last_checked_date))))), modalTab === 'faqs' && /*#__PURE__*/React.createElement("div", null, (selectedService.faqs || []).map(f => /*#__PURE__*/React.createElement("div", {
    key: f.id,
    style: {
      marginBottom: '16px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '14px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '6px'
    }
  }, "Q: ", f.question), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#475569',
      lineHeight: '1.5'
    }
  }, f.answer), f.official_reference && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      color: '#64748b',
      display: 'block',
      marginTop: '6px'
    }
  }, "Ref: ", f.official_reference))))))), /*#__PURE__*/React.createElement("div", {
    className: `chat-drawer ${isAiOpen ? 'open' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px'
    }
  }, "\u2728"), /*#__PURE__*/React.createElement("h3", {
    className: "modal-title",
    style: {
      fontSize: '16px'
    }
  }, "CivicGuide AI Assistant")), /*#__PURE__*/React.createElement("button", {
    className: "close-btn",
    onClick: () => setIsAiOpen(false)
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "chat-prompt-chips"
  }, ['What documents are needed for passport?', 'How much is driving licence fee?', 'Explain Non-ECR vs ECR', 'What is MeeSeva?'].map(prompt => /*#__PURE__*/React.createElement("button", {
    key: prompt,
    className: "prompt-chip-btn",
    onClick: () => handleSendMessage(prompt)
  }, prompt))), /*#__PURE__*/React.createElement("div", {
    className: "chat-messages"
  }, chatMessages.map((m, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: `msg-bubble ${m.role === 'user' ? 'user' : 'assistant'}`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      whiteSpace: 'pre-wrap'
    }
  }, m.text), m.sources && m.sources.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '10px',
      paddingTop: '8px',
      borderTop: '1px solid #cbd5e1',
      fontSize: '11px'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Verified Sources:"), m.sources.map((src, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginTop: '2px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: src.url,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: '#0284c7',
      textDecoration: 'none'
    }
  }, "\u2022 ", src.title, " (", src.lastVerified, ")")))))), isChatLoading && /*#__PURE__*/React.createElement("div", {
    className: "msg-bubble assistant",
    style: {
      color: '#64748b'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Analyzing verified government gazettes and rules..."))), /*#__PURE__*/React.createElement("div", {
    className: "chat-input-area"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    placeholder: "Ask a government service question...",
    value: chatInput,
    onChange: e => setChatInput(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') handleSendMessage();
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => handleSendMessage(),
    style: {
      padding: '10px 18px'
    }
  }, "Send"))), isWizardOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: e => {
      if (e.target.className === 'modal-backdrop') setIsWizardOpen(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "modal-title"
  }, "\u2728 Personalized Checklist Wizard"), /*#__PURE__*/React.createElement("button", {
    className: "close-btn",
    onClick: () => setIsWizardOpen(false)
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: async e => {
      e.preventDefault();
      const f = e.target;
      const serviceId = f.wizService.value;
      const stateVal = f.wizState.value;
      const ageGroup = f.wizAge.value;
      const occupation = f.wizOcc.value;
      try {
        const res = await api('/ai/guidance', {
          method: 'POST',
          body: JSON.stringify({
            serviceId,
            state: stateVal,
            ageGroup,
            occupation
          })
        });
        alert(`Personalized checklist generated with ${res.personalizedChecklist.length} steps!`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Select Government Service"), /*#__PURE__*/React.createElement("select", {
    name: "wizService",
    className: "form-control",
    required: true
  }, services.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.title)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Your State / UT"), /*#__PURE__*/React.createElement("select", {
    name: "wizState",
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
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Age Category"), /*#__PURE__*/React.createElement("select", {
    name: "wizAge",
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "ADULT_18_59"
  }, "Adult (18 - 59 yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "MINOR_UNDER_18"
  }, "Minor (Under 18 yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "SENIOR_60_PLUS"
  }, "Senior Citizen (60+ yrs)"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Occupation / Group"), /*#__PURE__*/React.createElement("select", {
    name: "wizOcc",
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "CITIZEN"
  }, "Salaried / General Citizen"), /*#__PURE__*/React.createElement("option", {
    value: "STUDENT"
  }, "Student"), /*#__PURE__*/React.createElement("option", {
    value: "BUSINESS"
  }, "Business / MSME Owner"), /*#__PURE__*/React.createElement("option", {
    value: "FARMER"
  }, "Farmer / Agriculture")))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-primary",
    style: {
      width: '100%',
      padding: '12px',
      marginTop: '8px'
    }
  }, "Generate Tailored Checklist"))))), isAuthOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: e => {
      if (e.target.className === 'modal-backdrop' && currentUser) setIsAuthOpen(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog",
    style: {
      maxWidth: '440px',
      padding: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #071527, #0f2744)',
      color: '#ffffff',
      padding: '24px 24px 18px 24px',
      position: 'relative'
    }
  }, currentUser && /*#__PURE__*/React.createElement("button", {
    className: "close-btn",
    onClick: () => setIsAuthOpen(false),
    style: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      color: '#94a3b8'
    },
    title: "Close"
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '42px',
      height: '42px',
      borderRadius: '10px',
      background: 'rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      border: '1px solid rgba(255,255,255,0.15)'
    }
  }, "\uD83C\uDFDB\uFE0F"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '18px',
      fontWeight: '800',
      margin: 0,
      color: '#ffffff'
    }
  }, "CivicGuide AI"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12px',
      color: '#94a3b8',
      margin: '2px 0 0 0'
    }
  }, "Official Citizen Portal Access"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '3px',
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setAuthMode('login');
      setAuthError('');
    },
    style: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      background: authMode === 'login' ? '#ffffff' : 'transparent',
      color: authMode === 'login' ? '#0f2744' : '#cbd5e1',
      fontWeight: '700',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  }, "\uD83D\uDD11 Sign In"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setAuthMode('register');
      setAuthError('');
    },
    style: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      background: authMode === 'register' ? '#ffffff' : 'transparent',
      color: authMode === 'register' ? '#0f2744' : '#cbd5e1',
      fontWeight: '700',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  }, "\uD83D\uDCDD Create Account"))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body",
    style: {
      padding: '24px'
    }
  }, authError && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#b91c1c',
      padding: '10px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("span", null, authError)), authMode === 'login' ?
  /*#__PURE__*/
  /* SIGN IN FORM */
  React.createElement("form", {
    onSubmit: handleLoginSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    style: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#334155'
    }
  }, "Email Address"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "loginEmail",
    className: "form-control",
    placeholder: "citizen@example.com",
    required: true,
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    style: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#334155'
    }
  }, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    name: "loginPassword",
    className: "form-control",
    placeholder: "Enter your password",
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-primary",
    disabled: authLoading,
    style: {
      width: '100%',
      padding: '12px',
      fontSize: '14px',
      fontWeight: '700'
    }
  }, authLoading ? 'Signing In...' : 'Sign In to Portal →'), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: '16px',
      fontSize: '13px',
      color: '#64748b'
    }
  }, "Don't have an account?", ' ', /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setAuthMode('register');
      setAuthError('');
    },
    style: {
      background: 'none',
      border: 'none',
      color: '#2563eb',
      fontWeight: '700',
      cursor: 'pointer',
      padding: 0
    }
  }, "Create one now"))) :
  /*#__PURE__*/
  /* REGISTRATION FORM */
  React.createElement("form", {
    onSubmit: handleRegisterSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    style: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#334155'
    }
  }, "Full Legal Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "regName",
    className: "form-control",
    placeholder: "e.g., Shiva Sai",
    required: true,
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    style: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#334155'
    }
  }, "Email Address"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "regEmail",
    className: "form-control",
    placeholder: "name@example.com",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    style: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#334155'
    }
  }, "State / Jurisdiction"), /*#__PURE__*/React.createElement("select", {
    name: "regState",
    className: "form-control",
    defaultValue: "Telangana"
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
  }, "Delhi"), /*#__PURE__*/React.createElement("option", {
    value: "All-India"
  }, "All-India / Other"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    style: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#334155'
    }
  }, "Password (min 6 characters)"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    name: "regPassword",
    className: "form-control",
    placeholder: "Create secure password",
    minLength: 6,
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-primary",
    disabled: authLoading,
    style: {
      width: '100%',
      padding: '12px',
      fontSize: '14px',
      fontWeight: '700'
    }
  }, authLoading ? 'Registering Account...' : 'Create Citizen Account →'), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: '16px',
      fontSize: '13px',
      color: '#64748b'
    }
  }, "Already have an account?", ' ', /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setAuthMode('login');
      setAuthError('');
    },
    style: {
      background: 'none',
      border: 'none',
      color: '#2563eb',
      fontWeight: '700',
      cursor: 'pointer',
      padding: 0
    }
  }, "Sign in")))))), isNewAppOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: e => {
      if (e.target.className === 'modal-backdrop') setIsNewAppOpen(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog",
    style: {
      maxWidth: '520px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "modal-title"
  }, "+ Track New Application"), /*#__PURE__*/React.createElement("button", {
    className: "close-btn",
    onClick: () => setIsNewAppOpen(false)
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: async e => {
      e.preventDefault();
      const f = e.target;
      const serviceId = f.appService.value;
      const srv = services.find(s => s.id === serviceId);
      try {
        const res = await api('/applications', {
          method: 'POST',
          body: JSON.stringify({
            service_id: serviceId,
            service_title: srv ? srv.title : 'Government Service',
            application_reference_number: f.appRef.value,
            applied_on: f.appDate.value,
            status: f.appStatus.value
          })
        });
        setApplications([res.data, ...applications]);
        showToast('Application added to tracker', 'success');
        setIsNewAppOpen(false);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Select Service"), /*#__PURE__*/React.createElement("select", {
    name: "appService",
    className: "form-control",
    required: true
  }, services.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.title)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Application / Token Reference Number"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "appRef",
    className: "form-control",
    placeholder: "e.g., TS2690847294",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Date Applied"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "appDate",
    className: "form-control"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Current Stage"), /*#__PURE__*/React.createElement("select", {
    name: "appStatus",
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "DRAFT"
  }, "Draft Preparation"), /*#__PURE__*/React.createElement("option", {
    value: "SUBMITTED"
  }, "Submitted Online"), /*#__PURE__*/React.createElement("option", {
    value: "UNDER_SCRUTINY"
  }, "Under Scrutiny / Review"), /*#__PURE__*/React.createElement("option", {
    value: "FIELD_VERIFICATION"
  }, "Police / Field Verification"), /*#__PURE__*/React.createElement("option", {
    value: "APPROVED"
  }, "Approved / Issued"))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-primary",
    style: {
      width: '100%',
      padding: '12px'
    }
  }, "Add to Tracker"))))), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement("span", null, toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'), /*#__PURE__*/React.createElement("span", null, toast.message))), isLangModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: e => {
      if (e.target.className === 'modal-backdrop') setIsLangModalOpen(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog",
    style: {
      maxWidth: '520px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "modal-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF10"), " ", t('selectLanguageTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px'
    }
  }, t('selectLanguageSub'))), /*#__PURE__*/React.createElement("button", {
    className: "close-btn",
    onClick: () => setIsLangModalOpen(false)
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      padding: '20px'
    }
  }, [{
    code: 'en',
    flag: '🇬🇧',
    native: 'English',
    roman: 'English (EN)',
    desc: 'Official Pan-India Guidelines, Gazette Citations, and Forms in English.'
  }, {
    code: 'te',
    flag: '🇮🇳',
    native: 'తెలుగు',
    roman: 'Telugu (TE)',
    desc: 'తెలంగాణ మరియు ఆంధ్రప్రదేశ్ ప్రభుత్వ సేవల సమాచారం, మీసేవ, పోర్టల్ లింకులు మరియు పత్రాల చెక్‌లిస్ట్.'
  }, {
    code: 'hi',
    flag: '🇮🇳',
    native: 'हिन्दी',
    roman: 'Hindi (HI)',
    desc: 'अखिल भारतीय एवं राज्य स्तरीय सरकारी सेवाओं, आवश्यक दस्तावेजों की चेकलिस्ट तथा आधिकारिक पोर्टल लिंक्स।'
  }].map(opt => {
    const isSelected = lang === opt.code;
    return /*#__PURE__*/React.createElement("div", {
      key: opt.code,
      onClick: () => {
        setLang(opt.code);
        localStorage.setItem('civic_lang', opt.code);
        setIsLangModalOpen(false);
        const toasts = {
          en: 'Language set to English',
          te: 'భాష తెలుగుకి మార్చబడింది (Language set to Telugu)',
          hi: 'भाषा हिंदी में बदली गई (Language set to Hindi)'
        };
        showToast(toasts[opt.code] || 'Language updated', 'success');
      },
      style: {
        padding: '16px 18px',
        borderRadius: '14px',
        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
        background: isSelected ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isSelected ? '0 6px 16px rgba(37, 99, 235, 0.16)' : '0 1px 3px rgba(0,0,0,0.03)'
      },
      onMouseEnter: e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#93c5fd';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
        }
      },
      onMouseLeave: e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
        }
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '32px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
      }
    }, opt.flag), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '20px',
        fontWeight: '800',
        color: isSelected ? '#1e40af' : '#0f172a'
      }
    }, opt.native), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        color: isSelected ? '#2563eb' : '#64748b',
        fontWeight: '700'
      }
    }, "(", opt.roman, ")")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '12px',
        color: isSelected ? '#1e3a8a' : '#64748b',
        marginTop: '3px',
        lineHeight: 1.4
      }
    }, opt.desc))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: '12px',
        flexShrink: 0
      }
    }, isSelected ? /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#2563eb',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: '800',
        padding: '6px 12px',
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
      }
    }, "\u2713 ", t('activeBadge')) : /*#__PURE__*/React.createElement("div", {
      style: {
        border: '1px solid #cbd5e1',
        color: '#475569',
        fontSize: '11px',
        fontWeight: '700',
        padding: '6px 12px',
        borderRadius: '999px',
        background: '#f8fafc'
      }
    }, "Select \u2192")));
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer",
    style: {
      justifyContent: 'flex-end',
      paddingTop: '12px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: () => setIsLangModalOpen(false)
  }, t('close'))))), /*#__PURE__*/React.createElement("footer", {
    className: "site-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container footer-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-brand"
  }, /*#__PURE__*/React.createElement("h4", null, "\uD83C\uDFDB\uFE0F CivicGuide AI"), /*#__PURE__*/React.createElement("p", {
    style: {
      lineHeight: 1.6,
      maxWidth: '440px'
    }
  }, "An authoritative, open citizen platform designed to demystify complex government documentation, statutory fee structures, and application procedures across Indian departments.")), /*#__PURE__*/React.createElement("div", {
    className: "footer-links"
  }, /*#__PURE__*/React.createElement("h5", null, "Official Working Portals"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
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
  }, /*#__PURE__*/React.createElement("h5", null, "Assurance"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Zero Broker Policy"), /*#__PURE__*/React.createElement("li", null, "100% Official Source Citation"), /*#__PURE__*/React.createElement("li", null, "Official Gazette Verification"), /*#__PURE__*/React.createElement("li", null, "Multi-language Support (EN, TE, HI)")))), /*#__PURE__*/React.createElement("div", {
    className: "container footer-bottom"
  }, /*#__PURE__*/React.createElement("div", null, "\xA9 2026 CivicGuide AI. Government Information Assistant. Built for Indian Citizens."), /*#__PURE__*/React.createElement("div", null, "Strict Compliance: No legal advice \u2022 Non-government entity"))));
}