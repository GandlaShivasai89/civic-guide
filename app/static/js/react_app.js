import { DICTIONARY, getLocalizedService } from './i18n.js';

const { useState, useEffect, useMemo, useRef } = React;

// API Helper
async function api(path, options = {}) {
  const token = localStorage.getItem('civic_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`/api${path}`, { ...options, headers });
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
  const t = (key) => {
    const dict = DICTIONARY[lang] || DICTIONARY.en;
    return dict[key] || DICTIONARY.en[key] || key;
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync default chat welcome message when language changes
  useEffect(() => {
    setChatMessages([
      {
        role: 'assistant',
        text: t('chatWelcome')
      }
    ]);
  }, [lang]);

  // Initial Load of catalog
  useEffect(() => {
    api('/services/categories')
      .then(res => setCategories(res.data || []))
      .catch(console.error);

    api('/services')
      .then(res => setServices(res.data || []))
      .catch(err => showToast(err.message, 'error'));

    if (currentUser && !currentUser.is_guest) {
      api('/applications/saved')
        .then(res => setSavedIds(new Set((res.data || []).map(s => s.id))))
        .catch(console.error);
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
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.short_summary && s.short_summary.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.service_code && s.service_code.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'ALL') {
      list = list.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()) || (s.orig_category && s.orig_category === selectedCategory));
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
  const handleToggleSave = async (serviceId) => {
    if (!currentUser || currentUser.is_guest) {
      showToast('Bookmarks saved for session', 'info');
      const newSaved = new Set(savedIds);
      if (newSaved.has(serviceId)) newSaved.delete(serviceId);
      else newSaved.add(serviceId);
      setSavedIds(newSaved);
      return;
    }
    try {
      const res = await api('/applications/saved/toggle', {
        method: 'POST',
        body: JSON.stringify({ serviceId })
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
  const openServiceModal = async (serviceId) => {
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

    const newMessages = [...chatMessages, { role: 'user', text: q }];
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

      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: res.data.answer,
          sources: res.data.sources || []
        }
      ]);
    } catch (err) {
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Error retrieving verified government records: ' + err.message
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Auth Submit (Login / Register)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const res = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: authEmail, password: authPassword })
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
        body: JSON.stringify({ email, password })
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
  const handleCreateApplication = async (e) => {
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
  const handleCreateReminder = async (e) => {
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
    return (
      <div className="login-gateway-container">
        {/* Top Language Bar for Login Gateway */}
        <div className="top-notice-bar">
          <div className="container notice-inner">
            <div className="notice-left">
              <span className="live-indicator"></span>
              <span className="notice-badge">CIVIC NOTICE:</span>
              <span className="notice-text">{t('officialNotice')}</span>
            </div>
            <div className="lang-dropdown-wrapper">
              <span>🌐</span>
              <select
                value={lang}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLang(newLang);
                  localStorage.setItem('civic_lang', newLang);
                }}
                className="lang-dropdown"
                aria-label="Select Language"
              >
                <option value="en">English (EN)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Login Hero Box with Extra Graphics */}
        <div className="login-hero-card">
          <div className="login-brand-header">
            <div className="brand-emblem-large">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="login-title">{t('loginGatewayTitle')}</h1>
            <p className="login-sub">{t('loginGatewaySubtitle')}</p>
          </div>

          {/* 4 Trust Badges */}
          <div className="login-trust-badges">
            <span className="trust-pill">{t('trustBadge1')}</span>
            <span className="trust-pill">{t('trustBadge2')}</span>
            <span className="trust-pill">{t('trustBadge3')}</span>
            <span className="trust-pill">{t('trustBadge4')}</span>
          </div>

          {/* Login Card Box */}
          <div className="login-card-box">
            <div className="login-tabs">
              <button
                className={`login-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                {t('tabSignIn')}
              </button>
              <button
                className={`login-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                {t('tabRegister')}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="login-form">
              {authMode === 'register' && (
                <div className="form-group">
                  <label>{t('fullNameLabel')}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Shiva Sai"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>{t('emailLabel')}</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="citizen@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('passwordLabel')}</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
                {authMode === 'login' ? t('btnSignInAction') : t('btnRegisterAction')}
              </button>
            </form>

            {/* Quick 1-Click Instant Access */}
            <div className="quick-access-section">
              <div className="divider-text">
                <span>{t('quickDemoTitle')}</span>
              </div>

              <div className="quick-buttons-stack">
                <button
                  type="button"
                  className="btn-quick-demo citizen"
                  onClick={() => handleQuickLogin('citizen@example.com', 'Password@123')}
                >
                  {t('demoCitizenBtn')}
                </button>

                <button
                  type="button"
                  className="btn-quick-demo admin"
                  onClick={() => handleQuickLogin('admin@civicguide.gov.in', 'Password@123')}
                >
                  {t('demoAdminBtn')}
                </button>

                <button
                  type="button"
                  className="btn-quick-guest"
                  onClick={handleContinueAsGuest}
                >
                  {t('continueGuestBtn')}
                </button>
              </div>

              <p className="guest-note">{t('guestNotice')}</p>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="toast-container">
            <div className="toast">
              <span>{toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MAIN CIVIC PORTAL (Rendered after Login - "next")
  // =========================================================================
  return (
    <div>
      {/* Top Notice Bar */}
      <div className="top-notice-bar">
        <div className="container notice-inner">
          <div className="notice-left">
            <span className="live-indicator"></span>
            <span className="notice-badge">OFFICIAL NOTICE:</span>
            <span className="notice-text">{t('disclaimer')}</span>
          </div>
          <div className="lang-dropdown-wrapper">
            <span>🌐</span>
            <select
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value;
                setLang(newLang);
                localStorage.setItem('civic_lang', newLang);
              }}
              className="lang-dropdown"
              aria-label="Select Language"
            >
              <option value="en">English (EN)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="container header-inner">
          <div className="brand-group" onClick={() => setActiveTab('services')}>
            <div className="brand-emblem">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="brand-title">{t('brandTitle')}</span>
                <span className="ai-pill">AI</span>
              </div>
              <p className="brand-sub">{t('brandSub')}</p>
            </div>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <span>🏛️</span> {t('navServices')}
            </button>
            <button
              className={`nav-btn ${isAiOpen ? 'active' : ''}`}
              onClick={() => setIsAiOpen(true)}
            >
              <span>✨</span> {t('navChat')}
            </button>
            <button
              className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <span>📋</span> {t('navApplications')}
            </button>
            <button
              className={`nav-btn ${activeTab === 'reminders' ? 'active' : ''}`}
              onClick={() => setActiveTab('reminders')}
            >
              <span>🔔</span> {t('navReminders')}
            </button>
            {currentUser?.role === 'admin' && (
              <button
                className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
                style={{ color: '#7c3aed' }}
              >
                <span>🛡️</span> {t('navAdmin')}
              </button>
            )}
          </nav>

          <div className="header-actions">
            <button className="btn-gold" onClick={() => setIsWizardOpen(true)}>
              <span>✨</span> {t('btnWizard')}
            </button>

            {/* User Profile & Sign Out */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#0f2744', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px'
              }}>
                {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>
                {currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Citizen'}
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Sign Out"
              >
                <span>🚪</span> {t('btnLogout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* TAB 1: SERVICES (Catalog & Hero) */}
      {activeTab === 'services' && (
        <main>
          {/* Hero Section with Extra Graphics */}
          <section className="hero-section">
            <div className="hero-decor-orb-1"></div>
            <div className="hero-decor-orb-2"></div>
            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
              <div className="hero-tag">
                <span>🇮🇳</span> {t('nationalInitiative')}
              </div>
              <h1 className="hero-title">{t('heroTitle')}</h1>
              <p className="hero-subtitle">{t('heroSubtitle')}</p>

              {/* Search Bar */}
              <div className="search-box-wrapper">
                <div className="search-box">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px', fontSize: '16px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="quick-tags">
                <span>{t('popularSearches')}</span>
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    className="tag-chip"
                    onClick={() => setSearchQuery(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Extra Graphics: Metric Cards Grid */}
              <div className="hero-metrics-grid">
                <div className="metric-card">
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>🏛️</div>
                  <div className="metric-value">{t('metricPortalsVal')}</div>
                  <div className="metric-label">{t('metricPortalsLbl')}</div>
                </div>
                <div className="metric-card">
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>⚡</div>
                  <div className="metric-value">{t('metricRagVal')}</div>
                  <div className="metric-label">{t('metricRagLbl')}</div>
                </div>
                <div className="metric-card">
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>🛡️</div>
                  <div className="metric-value">{t('metricToutsVal')}</div>
                  <div className="metric-label">{t('metricToutsLbl')}</div>
                </div>
                <div className="metric-card">
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>🌐</div>
                  <div className="metric-value">{t('metricLangVal')}</div>
                  <div className="metric-label">{t('metricLangLbl')}</div>
                </div>
              </div>

              {/* Extra Graphics: Category Shelf */}
              <div className="category-badges-shelf">
                <button
                  className={`cat-pill-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('ALL')}
                >
                  <span>🌟</span> {t('catAll')}
                </button>
                <button
                  className={`cat-pill-btn ${selectedCategory === 'Identity' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('Identity')}
                >
                  <span>🛂</span> {t('catIdentity')}
                </button>
                <button
                  className={`cat-pill-btn ${selectedCategory === 'Transport' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('Transport')}
                >
                  <span>🚗</span> {t('catTransport')}
                </button>
                <button
                  className={`cat-pill-btn ${selectedCategory === 'Revenue' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('Revenue')}
                >
                  <span>📜</span> {t('catRevenue')}
                </button>
                <button
                  className={`cat-pill-btn ${selectedCategory === 'Civil' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('Civil')}
                >
                  <span>👶</span> {t('catCivil')}
                </button>
                <button
                  className={`cat-pill-btn ${selectedCategory === 'Business' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('Business')}
                >
                  <span>💼</span> {t('catBusiness')}
                </button>
                <button
                  className={`cat-pill-btn ${selectedCategory === 'Education' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('Education')}
                >
                  <span>🎓</span> {t('catEducation')}
                </button>
              </div>
            </div>
          </section>

          {/* Catalog Filters & Grid */}
          <div className="container">
            <div className="filter-bar">
              <div className="filter-group">
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{t('filterJurisdiction')}</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">{t('allStates')}</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                </select>

                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginLeft: '8px' }}>{t('filterMode')}</label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">{t('allModes')}</option>
                  <option value="ONLINE">{t('modeOnline')}</option>
                  <option value="OFFLINE">{t('modeOffline')}</option>
                  <option value="HYBRID">{t('modeHybrid')}</option>
                </select>
              </div>

              <div className="results-counter">
                {filteredServices.length} {t('serviceCountSuffix')}
              </div>
            </div>

            {/* Services Grid */}
            <div className="services-grid">
              {filteredServices.map(srv => {
                const isSaved = savedIds.has(srv.id);
                return (
                  <div key={srv.id} className="service-card">
                    <div className="service-card-header">
                      <div className="service-card-meta">
                        <span className="service-badge-category">{srv.category}</span>
                        <span className="service-badge-verified">
                          <span>✓</span> {t('badgeOfficial')}
                        </span>
                      </div>
                      <button
                        className={`btn-bookmark ${isSaved ? 'active' : ''}`}
                        onClick={() => handleToggleSave(srv.id)}
                        title={isSaved ? t('btnSaved') : t('btnSave')}
                      >
                        {isSaved ? '★' : '☆'}
                      </button>
                    </div>

                    <h3 className="service-card-title">{srv.title}</h3>
                    <p className="service-card-desc">{srv.short_summary || srv.description}</p>

                    <div className="service-card-details">
                      <div className="detail-item">
                        <span className="detail-label">{t('lblProcessing')}</span>
                        <span className="detail-value">{srv.processing_time || '7-15 Days'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">{t('lblFees')}</span>
                        <span className="detail-value" style={{ color: '#0f766e', fontWeight: '700' }}>
                          {srv.fee_structure ? srv.fee_structure.split(';')[0] : t('freeFee')}
                        </span>
                      </div>
                    </div>

                    <div className="service-card-actions">
                      <button
                        className="btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => openServiceModal(srv.id)}
                      >
                        <span>📄</span> {t('btnViewDetails')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* TAB 2: APPLICATIONS TRACKER */}
      {activeTab === 'applications' && (
        <div className="container" style={{ padding: '36px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t('appsTitle')}</h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>{t('appsSubtitle')}</p>
            </div>
            <button className="btn-primary" onClick={() => setIsNewAppOpen(true)}>
              {t('btnNewApp')}
            </button>
          </div>

          {applications.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{t('emptyApps')}</h3>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '700', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '14px 18px' }}>{t('colService')}</th>
                    <th style={{ padding: '14px 18px' }}>{t('colRefNum')}</th>
                    <th style={{ padding: '14px 18px' }}>{t('colStatus')}</th>
                    <th style={{ padding: '14px 18px' }}>{t('colDate')}</th>
                    <th style={{ padding: '14px 18px' }}>{t('colActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: '600' }}>{app.service_title || app.service_id}</td>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#0f2744', fontWeight: '700' }}>
                        {app.application_reference_number}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                          background: app.status === 'APPROVED' ? '#dcfce7' : app.status === 'UNDER_REVIEW' ? '#fef3c7' : '#eff6ff',
                          color: app.status === 'APPROVED' ? '#166534' : app.status === 'UNDER_REVIEW' ? '#92400e' : '#1e40af'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>{app.created_at ? app.created_at.split('T')[0] : '2026-09-27'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={async () => {
                            try {
                              await api(`/applications/${app.id}`, { method: 'DELETE' });
                              setApplications(applications.filter(a => a.id !== app.id));
                              showToast('Application record removed');
                            } catch (e) {
                              showToast(e.message, 'error');
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}
                        >
                          ✕ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="container" style={{ padding: '36px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t('remindersTitle')}</h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>{t('remindersSubtitle')}</p>
            </div>
            <button className="btn-primary" onClick={() => setIsNewReminderOpen(true)}>
              {t('btnNewReminder')}
            </button>
          </div>

          {reminders.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{t('emptyReminders')}</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {reminders.map(rem => (
                <div key={rem.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f2744' }}>{rem.title}</h4>
                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', background: '#fef2f2', padding: '3px 8px', borderRadius: '6px' }}>
                      📅 {rem.reminder_date}
                    </span>
                  </div>
                  {rem.notes && <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{rem.notes}</p>}
                  <button
                    onClick={async () => {
                      try {
                        await api(`/reminders/${rem.id}`, { method: 'DELETE' });
                        setReminders(reminders.filter(r => r.id !== rem.id));
                        showToast('Reminder dismissed');
                      } catch (e) {
                        showToast(e.message, 'error');
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    ✓ Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADMIN CONSOLE */}
      {activeTab === 'admin' && currentUser?.role === 'admin' && (
        <div className="container" style={{ padding: '36px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t('adminTitle')}</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>{t('adminSubtitle')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f2744' }}>{adminStats?.totalServices || 12}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{t('statTotalServices')}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>{adminStats?.verifiedServices || 12}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{t('statVerified')}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>{adminStats?.pendingReview || 0}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{t('statPending')}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed' }}>{adminStats?.totalAuditRecords || 24}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{t('statAudits')}</div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE DETAIL MODAL */}
      {selectedService && (
        <div className="modal-backdrop" onClick={() => setSelectedService(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="service-badge-category">{selectedService.category}</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                  {selectedService.title}
                </h2>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedService(null)}>✕</button>
            </div>

            <div className="modal-tabs">
              <button
                className={`modal-tab-btn ${modalTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalTab('overview')}
              >
                {t('tabOverview')}
              </button>
              <button
                className={`modal-tab-btn ${modalTab === 'checklist' ? 'active' : ''}`}
                onClick={() => setModalTab('checklist')}
              >
                {t('tabChecklist')}
              </button>
              <button
                className={`modal-tab-btn ${modalTab === 'steps' ? 'active' : ''}`}
                onClick={() => setModalTab('steps')}
              >
                {t('tabSteps')}
              </button>
              <button
                className={`modal-tab-btn ${modalTab === 'sources' ? 'active' : ''}`}
                onClick={() => setModalTab('sources')}
              >
                {t('tabSources')}
              </button>
            </div>

            <div className="modal-body">
              {modalTab === 'overview' && (
                <div>
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', marginBottom: '20px' }}>
                    {selectedService.description}
                  </p>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ fontWeight: '700', color: '#0f2744', marginBottom: '6px' }}>{t('lblEligibility')}</div>
                    <p style={{ fontSize: '13px', color: '#475569' }}>{selectedService.eligibility_criteria || 'Indian Citizens meeting age and residential jurisdiction requirements.'}</p>
                  </div>

                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontWeight: '700', color: '#1e40af', marginBottom: '6px' }}>{t('lblGovFee')}</div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f2744' }}>{selectedService.fee_structure}</p>
                  </div>
                </div>
              )}

              {modalTab === 'checklist' && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{t('docsChecklistTitle')}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{t('checklistSubtitle')}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedService.required_documents || [
                      { document_name: 'Proof of Identity (Aadhaar / Voter ID / PAN)', mandatory: true },
                      { document_name: 'Proof of Address (Electricity bill / Passport / Bank Passbook)', mandatory: true },
                      { document_name: 'Proof of Date of Birth (Birth Certificate / SSC Certificate)', mandatory: true },
                      { document_name: 'Recent Passport Size Color Photographs (35mm x 45mm)', mandatory: true }
                    ]).map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{doc.document_name}</div>
                          {doc.mandatory && <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '700' }}>* MANDATORY</span>}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px' }}>
                          ✓ {t('statusReady')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalTab === 'steps' && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{t('timelineStepsTitle')}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{t('timelineSubtitle')}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(selectedService.application_steps || [
                      { step_number: 1, title: 'Portal Registration & Online Form Filling', description: 'Visit verified government portal, register using email/mobile and fill application details.' },
                      { step_number: 2, title: 'Document Upload & Scrutiny', description: 'Attach scanned clear copies of mandatory identity, address, and date of birth proofs.' },
                      { step_number: 3, title: 'Statutory Fee Payment & Appointment Slot', description: 'Pay the exact statutory government fee via SBI ePay/UPI and schedule verification slot.' },
                      { step_number: 4, title: 'In-Person Biometric Verification & Delivery', description: 'Attend appointment at center. Certificate or document dispatched via India Speed Post.' }
                    ]).map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0f2744', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                          {step.step_number || idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{step.title}</div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalTab === 'sources' && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{t('sourcesTitle')}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{t('sourcesSubtitle')}</p>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Official Portal Link</div>
                    <a
                      href={selectedService.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}
                    >
                      {selectedService.official_url} ↗
                    </a>
                  </div>

                  <a
                    href={selectedService.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <span>🌐</span> {t('btnVisitPortal')}
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedService(null)}>
                {t('btnClose')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GUIDANCE WIZARD MODAL */}
      {isWizardOpen && (
        <div className="modal-backdrop" onClick={() => setIsWizardOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{t('wizardTitle')}</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{t('wizardSubtitle')}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsWizardOpen(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>{t('wizStateLbl')}</label>
                <select value={wizState} onChange={(e) => setWizState(e.target.value)} className="form-control">
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>{t('wizAgeLbl')}</label>
                <select value={wizAge} onChange={(e) => setWizAge(e.target.value)} className="form-control">
                  <option value="ADULT_18_59">{t('wizAgeAdult')}</option>
                  <option value="MINOR_UNDER_18">{t('wizAgeMinor')}</option>
                  <option value="SENIOR_60_PLUS">{t('wizAgeSenior')}</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>{t('wizOccLbl')}</label>
                <select value={wizOcc} onChange={(e) => setWizOcc(e.target.value)} className="form-control">
                  <option value="CITIZEN">{t('wizOccCitizen')}</option>
                  <option value="STUDENT">{t('wizOccStudent')}</option>
                  <option value="BUSINESS">{t('wizOccBusiness')}</option>
                  <option value="GOVERNMENT">{t('wizOccGovt')}</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>{t('wizServiceLbl')}</label>
                <select value={wizService} onChange={(e) => setWizService(e.target.value)} className="form-control">
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={handleGenerateGuidance}
                disabled={isWizLoading}
              >
                {isWizLoading ? 'Analyzing Government Gazette Rules...' : t('btnGenerateGuidance')}
              </button>

              {wizResult && (
                <div style={{ marginTop: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f2744', marginBottom: '8px' }}>
                    {t('wizardResultTitle')}
                  </h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', lineHeight: 1.7, color: '#334155' }}>
                    {(wizResult.personalizedChecklist || []).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRACK NEW APPLICATION MODAL */}
      {isNewAppOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewAppOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{t('modalNewAppTitle')}</h3>
              <button className="modal-close-btn" onClick={() => setIsNewAppOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateApplication} className="modal-body">
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>{t('lblSelectService')}</label>
                <select
                  value={newAppServiceId}
                  onChange={(e) => setNewAppServiceId(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">-- Choose Government Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>{t('lblRefNumber')}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ARN-2026-981245"
                  value={newAppRef}
                  onChange={(e) => setNewAppRef(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>{t('lblInitialStatus')}</label>
                <select
                  value={newAppStatus}
                  onChange={(e) => setNewAppStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="SUBMITTED">{t('statusSubmitted')}</option>
                  <option value="UNDER_REVIEW">{t('statusUnderReview')}</option>
                  <option value="APPROVED">{t('statusApproved')}</option>
                  <option value="ACTION_REQUIRED">{t('statusActionRequired')}</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                {t('btnSaveApp')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW REMINDER MODAL */}
      {isNewReminderOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewReminderOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{t('modalNewReminderTitle')}</h3>
              <button className="modal-close-btn" onClick={() => setIsNewReminderOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateReminder} className="modal-body">
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>{t('lblReminderTitle')}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Renew Driving Licence"
                  value={newRemTitle}
                  onChange={(e) => setNewRemTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>{t('lblDueDate')}</label>
                <input
                  type="date"
                  className="form-control"
                  value={newRemDate}
                  onChange={(e) => setNewRemDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>{t('lblNotes')}</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Documents needed or reference notes..."
                  value={newRemNotes}
                  onChange={(e) => setNewRemNotes(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                {t('btnSaveReminder')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASK CIVIC AI DRAWER */}
      {isAiOpen && (
        <div className="modal-backdrop" onClick={() => setIsAiOpen(false)}>
          <div
            style={{
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f2744', color: '#fff' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>✨ {t('chatTitle')}</h3>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>{t('chatSubtitle')}</p>
              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {[t('chatQuick1'), t('chatQuick2'), t('chatQuick3'), t('chatQuick4')].map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Messages Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.role === 'user' ? '#0f2744' : '#f1f5f9',
                    color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '13px',
                    lineHeight: 1.6
                  }}
                >
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '11px', color: '#475569' }}>
                      <span style={{ fontWeight: '700' }}>Sources: </span>
                      {msg.sources.map((s, idx) => (
                        <span key={idx} style={{ marginRight: '6px' }}>• {s.authority || s.title}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', color: '#64748b' }}>
                  Searching verified government records...
                </div>
              )}
            </div>

            {/* Input area */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder={t('chatPlaceholder')}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <button
                className="btn-primary"
                onClick={() => handleSendMessage()}
                disabled={isChatLoading || !chatInput.trim()}
              >
                {t('chatSendBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <span>{toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h4>🏛️ {t('brandTitle')} AI</h4>
            <p style={{ lineHeight: 1.6, maxWidth: '440px' }}>
              {t('footerDesc')}
            </p>
          </div>
          <div className="footer-links">
            <h5>{t('footerPortalsTitle')}</h5>
            <ul>
              <li><a href="https://www.passportindia.gov.in" target="_blank" rel="noopener">Passport Seva (.gov.in)</a></li>
              <li><a href="https://sarathi.parivahan.gov.in" target="_blank" rel="noopener">Parivahan Sarathi (.gov.in)</a></li>
              <li><a href="https://myaadhaar.uidai.gov.in" target="_blank" rel="noopener">UIDAI Aadhaar (.gov.in)</a></li>
              <li><a href="https://voters.eci.gov.in" target="_blank" rel="noopener">Election Commission (.gov.in)</a></li>
              <li><a href="https://meeseva.telangana.gov.in" target="_blank" rel="noopener">MeeSeva Telangana</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>{t('footerAssuranceTitle')}</h5>
            <ul>
              <li>{t('assurance1')}</li>
              <li>{t('assurance2')}</li>
              <li>{t('assurance3')}</li>
              <li>{t('assurance4')}</li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <div>{t('footerCopyright')}</div>
          <div>{t('footerCompliance')}</div>
        </div>
      </footer>
    </div>
  );
}
