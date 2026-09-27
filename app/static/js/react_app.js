import { DICTIONARY, getLocalizedTitle, getLocalizedDescription, getLocalizedCategory } from './i18n.js';

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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // Data lists
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [toast, setToast] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am CivicGuide AI, your official government process assistant. Ask me anything about required documents, statutory fees, eligibility, or application procedures for Indian public services.'
    }
  ]);
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

  // Initial Load
  useEffect(() => {
    api('/services/categories')
      .then(res => setCategories(res.data || []))
      .catch(console.error);

    api('/services')
      .then(res => setServices(res.data || []))
      .catch(err => showToast(err.message, 'error'));

    if (currentUser) {
      api('/applications/saved')
        .then(res => setSavedIds(new Set((res.data || []).map(s => s.id))))
        .catch(console.error);
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
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.service_code && s.service_code.toLowerCase().includes(q))
      );
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
  const handleToggleSave = async (serviceId) => {
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
          text: 'Sorry, I encountered an issue retrieving verified government records: ' + err.message
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Auth logout
  const handleLogout = () => {
    localStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_user');
    setCurrentUser(null);
    setSavedIds(new Set());
    showToast('Signed out successfully');
  };

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
            <button
              onClick={() => setIsLangModalOpen(true)}
              style={{
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
              }}
              title="Click to Switch Language / భాష మార్చండి / भाषा बदलें"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'English (EN)' : lang === 'te' ? 'తెలుగు (TE)' : 'हिंदी (HI)'}</span>
              <span style={{ fontSize: '10px', color: '#2563eb' }}>⇄ Change</span>
            </button>
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
                <span className="brand-title">CivicGuide</span>
                <span className="ai-pill">AI</span>
              </div>
              <p className="brand-sub">Government Process Assistant</p>
            </div>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <span>🏛️</span> {t('servicesNav')}
            </button>
            <button
              className={`nav-btn ${isAiOpen ? 'active' : ''}`}
              onClick={() => setIsAiOpen(true)}
            >
              <span>✨</span> {t('askAi')}
            </button>
            <button
              className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <span>📋</span> {t('myApplications')}
            </button>
            <button
              className={`nav-btn ${activeTab === 'reminders' ? 'active' : ''}`}
              onClick={() => setActiveTab('reminders')}
            >
              <span>🔔</span> {t('reminders')}
            </button>
            {currentUser?.role === 'admin' && (
              <button
                className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
                style={{ color: '#7c3aed' }}
              >
                <span>🛡️</span> {t('adminPortal')}
              </button>
            )}
          </nav>

          <div className="header-actions">
            <button
              className="btn-secondary"
              onClick={() => setIsLangModalOpen(true)}
              style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Click to Switch Language (English / తెలుగు / हिंदी)"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'EN' : lang === 'te' ? 'తెలుగు' : 'हिंदी'}</span>
            </button>
            <button className="btn-gold" onClick={() => setIsWizardOpen(true)}>
              <span>✨</span> {t('getGuidance')}
            </button>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#0f2744', color: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px'
                }}>
                  {currentUser.full_name.charAt(0)}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{currentUser.full_name.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', padding: '4px' }}
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setIsAuthOpen(true)}>
                <span>👤</span> {t('login')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* TAB: SERVICES */}
      {activeTab === 'services' && (
        <main>
          {/* Hero Section with Extra Graphics */}
          <section className="hero-section">
            <div className="hero-decor-orb-1"></div>
            <div className="hero-decor-orb-2"></div>
            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
              <div className="hero-tag">
                <span>🇮🇳</span> National Citizen Information Initiative
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
                {['Passport', 'Driving Licence', 'Income Certificate', 'Birth Certificate', 'Caste Certificate', 'Voter ID', 'Aadhaar', 'Scholarship'].map(tag => (
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
                  <div className="metric-value">12+</div>
                  <div className="metric-label">{t('statPortals')}</div>
                </div>
                <div className="metric-card">
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>⚡</div>
                  <div className="metric-value">100%</div>
                  <div className="metric-label">{t('statRag')}</div>
                </div>
                <div className="metric-card">
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>🛡️</div>
                  <div className="metric-value">Zero</div>
                  <div className="metric-label">{t('statBroker')}</div>
                </div>
                <div
                  className="metric-card interactive-metric"
                  onClick={() => setIsLangModalOpen(true)}
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 0.95))',
                    border: '1.5px solid #60a5fa',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
                    position: 'relative'
                  }}
                  title="Click to Switch Language / భాష మార్చండి / भाषा बदलें"
                >
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>🌐</div>
                  <div className="metric-value" style={{ color: '#1e40af' }}>3</div>
                  <div className="metric-label" style={{ color: '#1e3a8a', fontWeight: '800' }}>
                    {t('statLang')} <span>⇄</span>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#2563eb',
                    fontWeight: '700',
                    marginTop: '4px',
                    background: '#dbeafe',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    display: 'inline-block'
                  }}>
                    {lang === 'en' ? '🇬🇧 English' : lang === 'te' ? '🇮🇳 తెలుగు' : '🇮🇳 हिंदी'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                    {t('statLangSub')}
                  </div>
                </div>
              </div>

              {/* Extra Graphics: Category Shelf */}
              <div className="category-badges-shelf">
                <button
                  className={`cat-pill-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('ALL')}
                >
                  <span>🌟</span> {t('allCategories')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`cat-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>
                      {cat.includes('Identity') ? '🛂' : cat.includes('Transport') ? '🚗' : cat.includes('Revenue') ? '📜' : cat.includes('Civil') ? '👶' : cat.includes('Education') ? '🎓' : '🏢'}
                    </span>
                    {getLocalizedCategory(cat, lang)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Catalog Filters & Grid */}
          <div className="container">
            <div className="filter-bar">
              <div className="filter-group">
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>JURISDICTION:</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All States / Pan-India</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                </select>

                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginLeft: '8px' }}>MODE:</label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Modes</option>
                  <option value="ONLINE">Online Portal</option>
                  <option value="OFFLINE">Offline Office</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div className="results-counter">
                {filteredServices.length} services found
              </div>
            </div>

            {/* Services Grid with Visual Cards */}
            <div className="services-grid">
              {filteredServices.length === 0 ? (
                <div style={{
                  gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px',
                  background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</p>
                  <h4 style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>No matching government services found</h4>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Try adjusting your search query or jurisdiction filters.</p>
                </div>
              ) : (
                filteredServices.map(s => {
                  const isSaved = savedIds.has(s.id);
                  const isVerified = s.verification_status === 'VERIFIED';
                  const feeSnippet = s.fee_structure ? s.fee_structure.split(';')[0] : 'Check Portal';

                  return (
                    <div key={s.id} className="service-card">
                      <div>
                        <div className="card-header-meta">
                          <div className="meta-badges">
                            <span className="badge-dept">{s.department?.code || 'GOVT'}</span>
                            <span className="badge-state">{s.state}</span>
                            <span className="badge-mode">{s.application_mode}</span>
                          </div>
                          <button
                            className={`bookmark-btn ${isSaved ? 'saved' : ''}`}
                            onClick={() => handleToggleSave(s.id)}
                            title={isSaved ? 'Remove bookmark' : 'Bookmark service'}
                          >
                            ★
                          </button>
                        </div>

                        <h3 className="service-title" onClick={() => openServiceModal(s.id)}>
                          {getLocalizedTitle(s, lang)}
                        </h3>
                        <p className="service-desc">{getLocalizedDescription(s, lang)}</p>

                        <div className={`verification-pill ${isVerified ? 'verified' : 'unverified'}`}>
                          <span>{isVerified ? '🛡️ ' + t('verifiedBadge') : '⚠️ ' + t('needsVerificationBadge')}</span>
                          <span className="last-verified-date">{t('lastVerified')}: {s.last_verified}</span>
                        </div>

                        <div className="card-facts">
                          <div className="fact-item">
                            <span className="fact-label">{t('fees')}</span>
                            <span className="fact-value" title={s.fee_structure}>
                              💰 {feeSnippet}
                            </span>
                          </div>
                          <div className="fact-item">
                            <span className="fact-label">{t('processingTime')}</span>
                            <span className="fact-value">
                              ⏱️ {s.processing_time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button className="btn-primary" onClick={() => openServiceModal(s.id)}>
                          <span>📋</span> {t('viewDetails')}
                        </button>
                        <button
                          className="btn-gold"
                          onClick={() => {
                            setIsAiOpen(true);
                            handleSendMessage(`Explain required documents and process for ${s.title}`, s.id);
                          }}
                          title="Ask AI"
                        >
                          ✨
                        </button>
                        <a
                          href={s.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          title="Open Verified Official Government Portal"
                        >
                          🔗
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      )}

      {/* TAB: APPLICATIONS */}
      {activeTab === 'applications' && (
        <main className="container" style={{ padding: '40px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f2744' }}>My Tracked Applications</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Monitor documents readiness, application tokens, and stage progression.</p>
            </div>
            <button className="btn-primary" onClick={() => setIsNewAppOpen(true)}>
              + Track New Application
            </button>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>📁</p>
              <h3 style={{ fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>No tracked applications yet</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Add an ongoing government application or open any service to track your documentation readiness.
              </p>
              <button className="btn-primary" onClick={() => setIsNewAppOpen(true)}>+ Track New Application</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {applications.map(app => {
                const docs = app.documents || [];
                const readyCount = docs.filter(d => d.status === 'READY' || d.status === 'UPLOADED').length;
                const progressPct = docs.length ? Math.round((readyCount / docs.length) * 100) : 0;

                return (
                  <div key={app.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0f2744' }}>{app.service_title}</h4>
                          <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: '#eff6ff', color: '#1e40af' }}>
                            {app.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          Ref / Token: <strong>{app.application_reference_number || 'N/A'}</strong> • Applied on: {app.applied_on || 'Pending'}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this tracked application?')) {
                            await api(`/applications/${app.id}`, { method: 'DELETE' });
                            setApplications(applications.filter(a => a.id !== app.id));
                            showToast('Application deleted');
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        Delete
                      </button>
                    </div>

                    {/* Progress Bar with Extra Graphics */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                        <span>Document Readiness: {readyCount}/{docs.length} documents ready</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${progressPct}%`, height: '100%',
                          background: progressPct === 100 ? '#10b981' : progressPct > 50 ? '#3b82f6' : '#f59e0b',
                          transition: 'width 0.4s ease'
                        }}></div>
                      </div>
                    </div>

                    {/* Document items */}
                    <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                        Checklist Items
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {docs.map(d => (
                          <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                            <span style={{ color: '#0f172a', fontWeight: '500' }}>{d.document_name}</span>
                            <select
                              value={d.status}
                              onChange={async (e) => {
                                const newStat = e.target.value;
                                await api(`/applications/documents/${d.id}`, {
                                  method: 'PATCH',
                                  body: JSON.stringify({ status: newStat })
                                });
                                setApplications(applications.map(a => {
                                  if (a.id === app.id) {
                                    return {
                                      ...a,
                                      documents: a.documents.map(item => item.id === d.id ? { ...item, status: newStat } : item)
                                    };
                                  }
                                  return a;
                                }));
                                showToast('Document status updated', 'success');
                              }}
                              style={{ fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            >
                              <option value="NOT_READY">Not Ready</option>
                              <option value="READY">Ready (Original)</option>
                              <option value="UPLOADED">Uploaded / Scanned</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* TAB: REMINDERS */}
      {activeTab === 'reminders' && (
        <main className="container" style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f2744', marginBottom: '8px' }}>🔔 Civic Expiry & Renewal Reminders</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Set reminders for passport expiry, driving licence renewal, tax filing deadlines, or scholarship submission dates.</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = e.target;
              const title = f.remTitle.value;
              const date = f.remDate.value;
              const notes = f.remNotes.value;
              try {
                const res = await api('/reminders', {
                  method: 'POST',
                  body: JSON.stringify({ title, reminder_date: date, notes })
                });
                setReminders([...reminders, res.data]);
                showToast('Reminder added', 'success');
                f.reset();
              } catch (err) {
                showToast(err.message, 'error');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
              <input name="remTitle" className="form-control" placeholder="Reminder Title (e.g., Renew Driving Licence)" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="date" name="remDate" className="form-control" required />
                <input type="text" name="remNotes" className="form-control" placeholder="Notes (optional)" />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>+ Add Reminder</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reminders.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={r.is_completed}
                      onChange={async (e) => {
                        const val = e.target.checked;
                        await api(`/reminders/${r.id}`, { method: 'PATCH', body: JSON.stringify({ is_completed: val }) });
                        setReminders(reminders.map(item => item.id === r.id ? { ...item, is_completed: val } : item));
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: r.is_completed ? '#94a3b8' : '#0f172a', textDecoration: r.is_completed ? 'line-through' : 'none' }}>
                        {r.title}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                        📅 Due: {r.reminder_date} • {r.service_title || 'Civic Procedure'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await api(`/reminders/${r.id}`, { method: 'DELETE' });
                      setReminders(reminders.filter(item => item.id !== r.id));
                      showToast('Reminder deleted');
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* TAB: ADMIN CONSOLE */}
      {activeTab === 'admin' && currentUser?.role === 'admin' && (
        <main className="container" style={{ padding: '40px 20px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f2744' }}>Government Information Admin Console</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Manage official services, audit sources, and certify accuracy against government gazettes.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Services</span>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{adminStats?.totalServices || services.length}</h3>
            </div>
            <div style={{ background: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase' }}>Verified Official</span>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>{adminStats?.verifiedServices || 12}</h3>
            </div>
            <div style={{ background: '#fffbeb', padding: '18px', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>Pending Review</span>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>{adminStats?.pendingReview || 0}</h3>
            </div>
            <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Audit Records</span>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#475569', marginTop: '4px' }}>{adminStats?.totalAuditRecords || 2}</h3>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: '700', color: '#0f2744' }}>Cataloged Services & Verification Audits</h4>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="civic-table">
                <thead>
                  <tr>
                    <th>Service Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Last Checked</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.title}</strong></td>
                      <td>{s.category}</td>
                      <td>
                        <span className={`verification-pill ${s.verification_status === 'VERIFIED' ? 'verified' : 'unverified'}`} style={{ margin: 0, display: 'inline-flex' }}>
                          {s.verification_status}
                        </span>
                      </td>
                      <td>{s.last_verified}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={async () => {
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
                          }}
                        >
                          Verify Source ↗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* SERVICE DETAIL MODAL WITH EXTRA GRAPHICS */}
      {selectedService && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target.className === 'modal-backdrop') setSelectedService(null); }}>
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">{getLocalizedTitle(selectedService, lang)}</h3>
              <button className="close-btn" onClick={() => setSelectedService(null)}>✕</button>
            </div>

            <div className="modal-tabs">
              <button className={`modal-tab-btn ${modalTab === 'overview' ? 'active' : ''}`} onClick={() => setModalTab('overview')}>
                Overview
              </button>
              <button className={`modal-tab-btn ${modalTab === 'documents' ? 'active' : ''}`} onClick={() => setModalTab('documents')}>
                Required Documents ({selectedService.documents?.length || 0})
              </button>
              <button className={`modal-tab-btn ${modalTab === 'steps' ? 'active' : ''}`} onClick={() => setModalTab('steps')}>
                Step-by-Step Procedure ({selectedService.steps?.length || 0})
              </button>
              <button className={`modal-tab-btn ${modalTab === 'sources' ? 'active' : ''}`} onClick={() => setModalTab('sources')}>
                Official Sources ({selectedService.sources?.length || 0})
              </button>
              <button className={`modal-tab-btn ${modalTab === 'faqs' ? 'active' : ''}`} onClick={() => setModalTab('faqs')}>
                FAQs ({selectedService.faqs?.length || 0})
              </button>
            </div>

            <div className="modal-body">
              {modalTab === 'overview' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontWeight: '700', color: '#0f2744', marginBottom: '8px' }}>Official Summary</h4>
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{getLocalizedDescription(selectedService, lang)}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b' }}>Statutory Fees</span>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedService.fee_structure}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b' }}>Processing Timeline</span>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedService.processing_time}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b' }}>Who is Eligible</span>
                      <p style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>{selectedService.eligibility_criteria}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b' }}>Application Mode & State</span>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginTop: '2px' }}>{selectedService.application_mode} • {selectedService.state}</p>
                    </div>
                  </div>

                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Official Verified Government Portal</span>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a8a' }}>{selectedService.official_url}</p>
                      </div>
                      <a
                        href={selectedService.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ background: '#1e40af', borderColor: '#1d4ed8' }}
                      >
                        Visit Official Portal ↗
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-primary"
                      onClick={async () => {
                        await api('/applications', {
                          method: 'POST',
                          body: JSON.stringify({ service_id: selectedService.id, service_title: selectedService.title })
                        });
                        showToast(`Added ${selectedService.title} to tracker!`, 'success');
                        setSelectedService(null);
                        setActiveTab('applications');
                      }}
                    >
                      ➕ Track This Application
                    </button>
                    <button
                      className="btn-gold"
                      onClick={() => {
                        setIsAiOpen(true);
                        handleSendMessage(`Explain documents and steps for ${selectedService.title}`, selectedService.id);
                      }}
                    >
                      ✨ Ask AI Assistant
                    </button>
                  </div>
                </div>
              )}

              {modalTab === 'documents' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    Prepare these verified mandatory documents before initiating your application. Click to mark readiness:
                  </p>
                  {(selectedService.documents || []).map((d, i) => (
                    <div key={d.id} className="doc-item-row">
                      <div
                        className="doc-check-box"
                        onClick={(e) => e.currentTarget.classList.toggle('ready')}
                      >
                        ✓
                      </div>
                      <div className="doc-info-col">
                        <h4>{i + 1}. {d.document_name}</h4>
                        <p>{d.purpose}</p>
                        <div className="doc-meta-tags">
                          <span className="doc-badge">Format: {d.accepted_formats || 'PDF/Scan'}</span>
                          <span className="doc-badge">{d.is_original_required ? '⚠️ Original Required' : 'Self-attested Copy'}</span>
                          {d.notes && <span className="doc-badge" style={{ background: '#fef3c7', color: '#92400e' }}>{d.notes}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {modalTab === 'steps' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    Follow these sequential stages on the authorized government portal:
                  </p>
                  {(selectedService.steps || []).map(step => (
                    <div key={step.id} className="step-item-card">
                      <div className="step-number-bubble">{step.step_number}</div>
                      <div className="step-content">
                        <h4>{step.title}</h4>
                        <p>{step.description}</p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                          <span>⏱️ Est. Time: {step.estimated_time || '1 day'}</span>
                          <span>•</span>
                          <span>{step.is_online_step ? '🌐 Online Submission' : '🏛️ Physical Counter Visit'}</span>
                        </div>
                        {step.tips && (
                          <div className="step-tip">💡 <strong>Citizen Tip:</strong> {step.tips}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {modalTab === 'sources' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    Every procedure on CivicGuide AI is grounded directly in gazetted government portals and statutory rules:
                  </p>
                  {(selectedService.sources || []).map(src => (
                    <div key={src.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f2744' }}>{src.authority_name}</h4>
                        <span style={{ fontSize: '10px', fontWeight: '700', background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '999px' }}>
                          {src.verification_badge || 'OFFICIAL_VERIFIED'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>{src.citation_text}</p>
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                        <a href={src.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                          Verify at: {src.source_url} ↗
                        </a>
                        <span>Checked: {src.last_checked_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {modalTab === 'faqs' && (
                <div>
                  {(selectedService.faqs || []).map(f => (
                    <div key={f.id} style={{ marginBottom: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Q: {f.question}</h4>
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{f.answer}</p>
                      {f.official_reference && (
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '6px' }}>Ref: {f.official_reference}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHAT DRAWER: AI CIVIC ASSISTANT */}
      <div className={`chat-drawer ${isAiOpen ? 'open' : ''}`}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>✨</span>
            <h3 className="modal-title" style={{ fontSize: '16px' }}>CivicGuide AI Assistant</h3>
          </div>
          <button className="close-btn" onClick={() => setIsAiOpen(false)}>✕</button>
        </div>

        <div className="chat-prompt-chips">
          {['What documents are needed for passport?', 'How much is driving licence fee?', 'Explain Non-ECR vs ECR', 'What is MeeSeva?'].map(prompt => (
            <button
              key={prompt}
              className="prompt-chip-btn"
              onClick={() => handleSendMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="chat-messages">
          {chatMessages.map((m, idx) => (
            <div key={idx} className={`msg-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #cbd5e1', fontSize: '11px' }}>
                  <strong>Verified Sources:</strong>
                  {m.sources.map((src, i) => (
                    <div key={i} style={{ marginTop: '2px' }}>
                      <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>
                        • {src.title} ({src.lastVerified})
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isChatLoading && (
            <div className="msg-bubble assistant" style={{ color: '#64748b' }}>
              <span>Analyzing verified government gazettes and rules...</span>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="form-control"
            placeholder="Ask a government service question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          />
          <button className="btn-primary" onClick={() => handleSendMessage()} style={{ padding: '10px 18px' }}>
            Send
          </button>
        </div>
      </div>

      {/* PERSONALIZED WIZARD MODAL */}
      {isWizardOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target.className === 'modal-backdrop') setIsWizardOpen(false); }}>
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">✨ Personalized Checklist Wizard</h3>
              <button className="close-btn" onClick={() => setIsWizardOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const f = e.target;
                const serviceId = f.wizService.value;
                const stateVal = f.wizState.value;
                const ageGroup = f.wizAge.value;
                const occupation = f.wizOcc.value;

                try {
                  const res = await api('/ai/guidance', {
                    method: 'POST',
                    body: JSON.stringify({ serviceId, state: stateVal, ageGroup, occupation })
                  });
                  alert(`Personalized checklist generated with ${res.personalizedChecklist.length} steps!`);
                } catch (err) {
                  showToast(err.message, 'error');
                }
              }}>
                <div className="form-group">
                  <label className="form-label">Select Government Service</label>
                  <select name="wizService" className="form-control" required>
                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Your State / UT</label>
                  <select name="wizState" className="form-control">
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Age Category</label>
                    <select name="wizAge" className="form-control">
                      <option value="ADULT_18_59">Adult (18 - 59 yrs)</option>
                      <option value="MINOR_UNDER_18">Minor (Under 18 yrs)</option>
                      <option value="SENIOR_60_PLUS">Senior Citizen (60+ yrs)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Occupation / Group</label>
                    <select name="wizOcc" className="form-control">
                      <option value="CITIZEN">Salaried / General Citizen</option>
                      <option value="STUDENT">Student</option>
                      <option value="BUSINESS">Business / MSME Owner</option>
                      <option value="FARMER">Farmer / Agriculture</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                  Generate Tailored Checklist
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {isAuthOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target.className === 'modal-backdrop') setIsAuthOpen(false); }}>
          <div className="modal-dialog" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Citizen Account</h3>
              <button className="close-btn" onClick={() => setIsAuthOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Quick Demo Login Buttons */}
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', marginBottom: '18px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  ⚡ Quick Demo Logins
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 10px', flex: 1 }}
                    onClick={async () => {
                      const res = await api('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({ email: 'citizen@example.com', password: 'Password@123' })
                      });
                      localStorage.setItem('civic_auth_token', res.data.token);
                      localStorage.setItem('civic_user', JSON.stringify(res.data.user));
                      setCurrentUser(res.data.user);
                      showToast('Logged in as Citizen Shiva Sai!', 'success');
                      setIsAuthOpen(false);
                    }}
                  >
                    👤 Demo Citizen
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 10px', flex: 1 }}
                    onClick={async () => {
                      const res = await api('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({ email: 'admin@civicguide.gov.in', password: 'Password@123' })
                      });
                      localStorage.setItem('civic_auth_token', res.data.token);
                      localStorage.setItem('civic_user', JSON.stringify(res.data.user));
                      setCurrentUser(res.data.user);
                      showToast('Logged in as Official Civic Administrator!', 'success');
                      setIsAuthOpen(false);
                    }}
                  >
                    🛡️ Demo Admin
                  </button>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const f = e.target;
                try {
                  const res = await api('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email: f.loginEmail.value, password: f.loginPassword.value })
                  });
                  localStorage.setItem('civic_auth_token', res.data.token);
                  localStorage.setItem('civic_user', JSON.stringify(res.data.user));
                  setCurrentUser(res.data.user);
                  showToast('Signed in successfully!', 'success');
                  setIsAuthOpen(false);
                } catch (err) {
                  showToast(err.message, 'error');
                }
              }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="loginEmail" className="form-control" placeholder="citizen@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" name="loginPassword" className="form-control" placeholder="••••••••" required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '11px' }}>
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NEW APP MODAL */}
      {isNewAppOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target.className === 'modal-backdrop') setIsNewAppOpen(false); }}>
          <div className="modal-dialog" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">+ Track New Application</h3>
              <button className="close-btn" onClick={() => setIsNewAppOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={async (e) => {
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
              }}>
                <div className="form-group">
                  <label className="form-label">Select Service</label>
                  <select name="appService" className="form-control" required>
                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Application / Token Reference Number</label>
                  <input type="text" name="appRef" className="form-control" placeholder="e.g., TS2690847294" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Applied</label>
                  <input type="date" name="appDate" className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Stage</label>
                  <select name="appStatus" className="form-control">
                    <option value="DRAFT">Draft Preparation</option>
                    <option value="SUBMITTED">Submitted Online</option>
                    <option value="UNDER_SCRUTINY">Under Scrutiny / Review</option>
                    <option value="FIELD_VERIFICATION">Police / Field Verification</option>
                    <option value="APPROVED">Approved / Issued</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Add to Tracker
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TOAST CONTAINER */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <span>{toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* LANGUAGE SELECTION MODAL (TELUGU, HINDI, ENGLISH) */}
      {isLangModalOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target.className === 'modal-backdrop') setIsLangModalOpen(false); }}>
          <div className="modal-dialog" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🌐</span> {t('selectLanguageTitle')}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {t('selectLanguageSub')}
                </p>
              </div>
              <button className="close-btn" onClick={() => setIsLangModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
              {[
                {
                  code: 'en',
                  flag: '🇬🇧',
                  native: 'English',
                  roman: 'English (EN)',
                  desc: 'Official Pan-India Guidelines, Gazette Citations, and Forms in English.'
                },
                {
                  code: 'te',
                  flag: '🇮🇳',
                  native: 'తెలుగు',
                  roman: 'Telugu (TE)',
                  desc: 'తెలంగాణ మరియు ఆంధ్రప్రదేశ్ ప్రభుత్వ సేవల సమాచారం, మీసేవ, పోర్టల్ లింకులు మరియు పత్రాల చెక్‌లిస్ట్.'
                },
                {
                  code: 'hi',
                  flag: '🇮🇳',
                  native: 'हिन्दी',
                  roman: 'Hindi (HI)',
                  desc: 'अखिल भारतीय एवं राज्य स्तरीय सरकारी सेवाओं, आवश्यक दस्तावेजों की चेकलिस्ट तथा आधिकारिक पोर्टल लिंक्स।'
                }
              ].map(opt => {
                const isSelected = lang === opt.code;
                return (
                  <div
                    key={opt.code}
                    onClick={() => {
                      setLang(opt.code);
                      localStorage.setItem('civic_lang', opt.code);
                      setIsLangModalOpen(false);
                      const toasts = {
                        en: 'Language set to English',
                        te: 'భాష తెలుగుకి మార్చబడింది (Language set to Telugu)',
                        hi: 'भाषा हिंदी में बदली गई (Language set to Hindi)'
                      };
                      showToast(toasts[opt.code] || 'Language updated', 'success');
                    }}
                    style={{
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
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#93c5fd';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        fontSize: '32px',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                      }}>
                        {opt.flag}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '800', color: isSelected ? '#1e40af' : '#0f172a' }}>
                            {opt.native}
                          </span>
                          <span style={{ fontSize: '13px', color: isSelected ? '#2563eb' : '#64748b', fontWeight: '700' }}>
                            ({opt.roman})
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: isSelected ? '#1e3a8a' : '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginLeft: '12px', flexShrink: 0 }}>
                      {isSelected ? (
                        <div style={{
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
                        }}>
                          ✓ {t('activeBadge')}
                        </div>
                      ) : (
                        <div style={{
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '6px 12px',
                          borderRadius: '999px',
                          background: '#f8fafc'
                        }}>
                          Select →
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', paddingTop: '12px' }}>
              <button className="btn-secondary" onClick={() => setIsLangModalOpen(false)}>
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h4>🏛️ CivicGuide AI</h4>
            <p style={{ lineHeight: 1.6, maxWidth: '440px' }}>
              An authoritative, open citizen platform designed to demystify complex government documentation, statutory fee structures, and application procedures across Indian departments.
            </p>
          </div>
          <div className="footer-links">
            <h5>Official Working Portals</h5>
            <ul>
              <li><a href="https://www.passportindia.gov.in" target="_blank" rel="noopener">Passport Seva (.gov.in)</a></li>
              <li><a href="https://sarathi.parivahan.gov.in" target="_blank" rel="noopener">Parivahan Sarathi (.gov.in)</a></li>
              <li><a href="https://myaadhaar.uidai.gov.in" target="_blank" rel="noopener">UIDAI Aadhaar (.gov.in)</a></li>
              <li><a href="https://voters.eci.gov.in" target="_blank" rel="noopener">Election Commission (.gov.in)</a></li>
              <li><a href="https://meeseva.telangana.gov.in" target="_blank" rel="noopener">MeeSeva Telangana</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>Assurance</h5>
            <ul>
              <li>Zero Broker Policy</li>
              <li>100% Official Source Citation</li>
              <li>Official Gazette Verification</li>
              <li>Multi-language Support (EN, TE, HI)</li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <div>© 2026 CivicGuide AI. Government Information Assistant. Built for Indian Citizens.</div>
          <div>Strict Compliance: No legal advice • Non-government entity</div>
        </div>
      </footer>
    </div>
  );
}
