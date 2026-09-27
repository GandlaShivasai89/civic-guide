import { DICTIONARY } from './i18n.js';

// Application State
const state = {
  lang: localStorage.getItem('civic_lang') || 'en',
  activeTab: 'services',
  currentUser: null,
  services: [],
  categories: [],
  selectedService: null,
  activeModalTab: 'overview',
  savedServiceIds: new Set(),
  applications: [],
  reminders: [],
  adminStats: null,
  searchQuery: '',
  selectedCategory: 'ALL',
  selectedState: 'ALL',
  selectedMode: 'ALL',
  chatMessages: [
    {
      role: 'assistant',
      text: 'Namaste! I am CivicGuide AI, your official government process assistant. Ask me anything about required documents, fees, eligibility, or application steps for Indian public services.'
    }
  ]
};

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

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Translations shortcut
function t(key) {
  const dict = DICTIONARY[state.lang] || DICTIONARY.en;
  return dict[key] || DICTIONARY.en[key] || key;
}

// Initialize Application
async function init() {
  // Load saved user
  try {
    const savedUser = localStorage.getItem('civic_user');
    if (savedUser) state.currentUser = JSON.parse(savedUser);
  } catch (e) {}

  setupEventListeners();
  updateStaticTexts();
  
  await loadCategories();
  await loadServices();
  if (state.currentUser) {
    await loadSavedServices();
  }
}

// Update Static Texts across DOM
function updateStaticTexts() {
  document.getElementById('siteNotice').innerText = t('disclaimer');
  document.getElementById('heroTitle').innerText = t('heroTitle');
  document.getElementById('heroSubtitle').innerText = t('heroSubtitle');
  document.getElementById('searchInput').placeholder = t('searchPlaceholder');
  document.getElementById('popularSearchesLabel').innerText = t('popularSearches');
  document.getElementById('langSelect').value = state.lang;
  
  renderNav();
}

// Setup Event Listeners
function setupEventListeners() {
  // Language Change
  document.getElementById('langSelect').addEventListener('change', (e) => {
    state.lang = e.target.value;
    localStorage.setItem('civic_lang', state.lang);
    updateStaticTexts();
    renderServices();
  });

  // Search Input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    filterAndRenderServices();
  });

  // Filters
  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    state.selectedCategory = e.target.value;
    filterAndRenderServices();
  });
  document.getElementById('stateFilter').addEventListener('change', (e) => {
    state.selectedState = e.target.value;
    filterAndRenderServices();
  });
  document.getElementById('modeFilter').addEventListener('change', (e) => {
    state.selectedMode = e.target.value;
    filterAndRenderServices();
  });

  // Search Suggestion Chips
  document.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.query;
      searchInput.value = q;
      state.searchQuery = q.toLowerCase();
      filterAndRenderServices();
    });
  });

  // Nav buttons
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Modal Closers
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    });
  });

  // Chat Drawer Closer
  document.getElementById('closeChatBtn').addEventListener('click', () => {
    document.getElementById('chatDrawer').classList.remove('open');
  });

  // Chat Send
  document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Pre-set Chat Chips
  document.querySelectorAll('.prompt-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chatInput').value = btn.innerText;
      sendChatMessage();
    });
  });

  // Personalized Wizard Button
  document.getElementById('wizardNavBtn').addEventListener('click', openGuidanceWizard);
  document.getElementById('guidanceForm').addEventListener('submit', handleGuidanceSubmit);

  // Auth Button
  document.getElementById('authNavBtn').addEventListener('click', openAuthModal);
  document.getElementById('authLoginForm').addEventListener('submit', handleLogin);
  document.getElementById('authRegisterForm').addEventListener('submit', handleRegister);
  document.getElementById('demoCitizenBtn').addEventListener('click', () => {
    document.getElementById('loginEmail').value = 'citizen@example.com';
    document.getElementById('loginPassword').value = 'Password@123';
  });
  document.getElementById('demoAdminBtn').addEventListener('click', () => {
    document.getElementById('loginEmail').value = 'admin@civicguide.gov.in';
    document.getElementById('loginPassword').value = 'Password@123';
  });

  // Application tracker form
  const newAppForm = document.getElementById('newAppForm');
  if (newAppForm) newAppForm.addEventListener('submit', handleNewApplication);

  // Reminder form
  const newReminderForm = document.getElementById('newReminderForm');
  if (newReminderForm) newReminderForm.addEventListener('submit', handleNewReminder);
}

// Navigation Tab Switcher
function switchTab(tab) {
  state.activeTab = tab;
  renderNav();

  document.getElementById('tabServices').style.display = tab === 'services' ? 'block' : 'none';
  document.getElementById('tabApplications').style.display = tab === 'applications' ? 'block' : 'none';
  document.getElementById('tabReminders').style.display = tab === 'reminders' ? 'block' : 'none';
  document.getElementById('tabAdmin').style.display = tab === 'admin' ? 'block' : 'none';

  if (tab === 'chat') {
    openAiDrawer();
    return;
  }
  if (tab === 'applications') loadApplications();
  if (tab === 'reminders') loadReminders();
  if (tab === 'admin') loadAdminStats();
}

function renderNav() {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    if (btn.dataset.tab === state.activeTab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const adminNav = document.getElementById('adminNavBtn');
  if (adminNav) {
    adminNav.style.display = state.currentUser?.role === 'admin' ? 'flex' : 'none';
  }

  const authBtn = document.getElementById('authNavBtn');
  if (state.currentUser) {
    authBtn.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:28px;height:28px;border-radius:50%;background:#0f2744;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">
          ${state.currentUser.full_name.charAt(0)}
        </div>
        <span style="font-size:13px;font-weight:700;">${state.currentUser.full_name.split(' ')[0]}</span>
        <button id="logoutBtn" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:14px;padding:2px 4px;" title="Logout">🚪</button>
      </div>
    `;
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.stopPropagation();
        logout();
      };
    }
  } else {
    authBtn.innerHTML = `<span>👤</span> <span>${t('login')}</span>`;
  }
}

// Load Categories
async function loadCategories() {
  try {
    const res = await api('/services/categories');
    state.categories = res.data || [];
    const select = document.getElementById('categoryFilter');
    select.innerHTML = `<option value="ALL">${t('allCategories')}</option>`;
    state.categories.forEach(cat => {
      select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  } catch (e) {
    console.error(e);
  }
}

// Load Services
async function loadServices() {
  try {
    const res = await api('/services');
    state.services = res.data || [];
    filterAndRenderServices();
  } catch (e) {
    console.error(e);
    showToast('Failed to load services: ' + e.message, 'error');
  }
}

// Filter and Render Services Grid
function filterAndRenderServices() {
  let list = [...state.services];

  if (state.searchQuery) {
    const q = state.searchQuery;
    list = list.filter(s => 
      s.title.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.service_code && s.service_code.toLowerCase().includes(q))
    );
  }

  if (state.selectedCategory !== 'ALL') {
    list = list.filter(s => s.category === state.selectedCategory);
  }

  if (state.selectedState !== 'ALL') {
    list = list.filter(s => s.state === 'All-India' || s.state === state.selectedState);
  }

  if (state.selectedMode !== 'ALL') {
    list = list.filter(s => s.application_mode === state.selectedMode);
  }

  document.getElementById('serviceCount').innerText = `${list.length} services found`;
  renderServicesGrid(list);
}

function renderServicesGrid(list) {
  const container = document.getElementById('servicesGrid');
  if (!list.length) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 48px 20px; background:#fff; border-radius:16px; border:1px solid #e2e8f0;">
        <p style="font-size: 24px; margin-bottom:8px;">🔍</p>
        <h4 style="font-weight:700; color:#0f172a; margin-bottom:4px;">No matching government services found</h4>
        <p style="font-size:13px; color:#64748b;">Try searching for "Passport", "Driving Licence", "Income Certificate" or reset filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(s => {
    const isSaved = state.savedServiceIds.has(s.id);
    const isVerified = s.verification_status === 'VERIFIED';
    const isConflict = s.verification_status === 'CONFLICTING';
    const feeSnippet = s.fee_structure ? s.fee_structure.split(';')[0] : 'Check Portal';

    return `
      <div class="service-card" data-service-id="${s.id}">
        <div>
          <div class="card-header-meta">
            <div class="meta-badges">
              <span class="badge-dept">${s.department?.code || 'GOVT'}</span>
              <span class="badge-state">${s.state}</span>
              <span class="badge-mode">${s.application_mode}</span>
            </div>
            <button class="bookmark-btn ${isSaved ? 'saved' : ''}" onclick="toggleSaveService('${s.id}')" title="Bookmark service">
              ★
            </button>
          </div>

          <h3 class="service-title" onclick="openServiceModal('${s.id}')">${s.title}</h3>
          <p class="service-desc">${s.short_summary || s.description}</p>

          <div class="verification-pill ${isVerified ? 'verified' : isConflict ? 'conflicting' : 'unverified'}">
            <span>${isVerified ? '🛡️ ' + t('verifiedBadge') : '⚠️ ' + t('needsVerificationBadge')}</span>
            <span class="last-verified-date">${t('lastVerified')}: ${s.last_verified}</span>
          </div>

          <div class="card-facts">
            <div class="fact-item">
              <span class="fact-label">${t('fees')}</span>
              <span class="fact-value" title="${s.fee_structure}">${feeSnippet}</span>
            </div>
            <div class="fact-item">
              <span class="fact-label">${t('processingTime')}</span>
              <span class="fact-value">${s.processing_time}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-primary" onclick="openServiceModal('${s.id}')">
            <span>📋</span> ${t('viewDetails')}
          </button>
          <button class="btn-gold" onclick="openAiDrawer('Explain process for ${s.title}', '${s.id}')" title="Ask AI">
            ✨
          </button>
          <a href="${s.official_url}" target="_blank" rel="noopener noreferrer" class="btn-secondary" title="Open Official Portal">
            🔗
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// Window attachments for inline onclicks
window.openServiceModal = async function(serviceId) {
  try {
    const res = await api(`/services/${serviceId}`);
    state.selectedService = res.data;
    state.activeModalTab = 'overview';
    renderServiceModal();
    document.getElementById('serviceModalBackdrop').classList.add('open');
  } catch (e) {
    showToast(e.message, 'error');
  }
};

function renderServiceModal() {
  const s = state.selectedService;
  if (!s) return;

  document.getElementById('modalServiceTitle').innerText = s.title;

  const tabsContainer = document.getElementById('modalTabsContainer');
  tabsContainer.innerHTML = `
    <button class="modal-tab-btn ${state.activeModalTab === 'overview' ? 'active' : ''}" onclick="switchModalTab('overview')">Overview</button>
    <button class="modal-tab-btn ${state.activeModalTab === 'documents' ? 'active' : ''}" onclick="switchModalTab('documents')">Required Documents (${s.documents?.length || 0})</button>
    <button class="modal-tab-btn ${state.activeModalTab === 'steps' ? 'active' : ''}" onclick="switchModalTab('steps')">Step-by-Step Procedure (${s.steps?.length || 0})</button>
    <button class="modal-tab-btn ${state.activeModalTab === 'sources' ? 'active' : ''}" onclick="switchModalTab('sources')">Official Sources (${s.sources?.length || 0})</button>
    <button class="modal-tab-btn ${state.activeModalTab === 'faqs' ? 'active' : ''}" onclick="switchModalTab('faqs')">FAQs (${s.faqs?.length || 0})</button>
  `;

  const body = document.getElementById('modalContentBody');
  if (state.activeModalTab === 'overview') {
    body.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4 style="font-weight:700; color:#0f2744; margin-bottom:8px;">Official Summary</h4>
        <p style="font-size:14px; color:#475569; line-height:1.6;">${s.description}</p>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px; background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
        <div>
          <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Statutory Fees</span>
          <p style="font-size:14px; font-weight:700; color:#0f172a; margin-top:2px;">${s.fee_structure}</p>
        </div>
        <div>
          <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Processing Timeline</span>
          <p style="font-size:14px; font-weight:700; color:#0f172a; margin-top:2px;">${s.processing_time}</p>
        </div>
        <div>
          <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Who is Eligible</span>
          <p style="font-size:13px; color:#334155; margin-top:2px;">${s.eligibility_criteria}</p>
        </div>
        <div>
          <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Application Mode & State</span>
          <p style="font-size:13px; font-weight:600; color:#334155; margin-top:2px;">${s.application_mode} • ${s.state}</p>
        </div>
      </div>

      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:16px; margin-bottom:24px;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
          <div>
            <span style="font-size:11px; font-weight:700; color:#1e40af; text-transform:uppercase;">Official Government Portal</span>
            <p style="font-size:14px; font-weight:700; color:#1e3a8a;">${s.official_url}</p>
          </div>
          <a href="${s.official_url}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="background:#1e40af; border-color:#1d4ed8;">
            Visit Official Portal ↗
          </a>
        </div>
      </div>

      <div style="display:flex; gap:10px;">
        <button class="btn-primary" onclick="trackServiceFromModal('${s.id}', '${s.title}')">
          ➕ Track This Application
        </button>
        <button class="btn-gold" onclick="openAiDrawer('Explain documents and steps for ${s.title}', '${s.id}')">
          ✨ Ask AI Assistant
        </button>
      </div>
    `;
  } else if (state.activeModalTab === 'documents') {
    const docs = s.documents || [];
    body.innerHTML = `
      <p style="font-size:13px; color:#64748b; margin-bottom:16px;">
        Prepare these verified mandatory documents before initiating your application. Click to mark readiness:
      </p>
      ${docs.map((d, i) => `
        <div class="doc-item-row">
          <div class="doc-check-box" onclick="this.classList.toggle('ready')">✓</div>
          <div class="doc-info-col">
            <h4>${i + 1}. ${d.document_name}</h4>
            <p>${d.purpose}</p>
            <div class="doc-meta-tags">
              <span class="doc-badge">Format: ${d.accepted_formats || 'PDF/Scan'}</span>
              <span class="doc-badge">${d.is_original_required ? '⚠️ Original Required' : 'Self-attested Copy'}</span>
              ${d.notes ? `<span class="doc-badge" style="background:#fef3c7; color:#92400e;">${d.notes}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    `;
  } else if (state.activeModalTab === 'steps') {
    const steps = s.steps || [];
    body.innerHTML = `
      <p style="font-size:13px; color:#64748b; margin-bottom:16px;">
        Follow these standardized sequential stages on the authorized government portal:
      </p>
      ${steps.map(step => `
        <div class="step-item-card">
          <div class="step-number-bubble">${step.step_number}</div>
          <div class="step-content">
            <h4>${step.title}</h4>
            <p>${step.description}</p>
            <div style="display:flex; gap:8px; margin-top:6px; font-size:11px; color:#64748b;">
              <span>⏱️ Est. Time: ${step.estimated_time || '1 day'}</span>
              <span>•</span>
              <span>${step.is_online_step ? '🌐 Online Submission' : '🏛️ Physical Counter Visit'}</span>
            </div>
            ${step.tips ? `<div class="step-tip">💡 <strong>Citizen Tip:</strong> ${step.tips}</div>` : ''}
          </div>
        </div>
      `).join('')}
    `;
  } else if (state.activeModalTab === 'sources') {
    const sources = s.sources || [];
    body.innerHTML = `
      <p style="font-size:13px; color:#64748b; margin-bottom:16px;">
        Every procedure on CivicGuide AI is grounded directly in gazetted government portals and statutory rules:
      </p>
      ${sources.map(src => `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <h4 style="font-size:14px; font-weight:700; color:#0f2744;">${src.authority_name}</h4>
            <span style="font-size:10px; font-weight:700; background:#ecfdf5; color:#065f46; padding:2px 8px; border-radius:999px;">
              ${src.verification_badge || 'OFFICIAL_VERIFIED'}
            </span>
          </div>
          <p style="font-size:12px; color:#475569; margin-bottom:8px;">${src.citation_text}</p>
          <div style="font-size:11px; color:#64748b; display:flex; justify-content:space-between;">
            <a href="${src.source_url}" target="_blank" rel="noopener noreferrer" style="color:#2563eb; font-weight:600; text-decoration:none;">
              Verify at: ${src.source_url} ↗
            </a>
            <span>Checked: ${src.last_checked_date}</span>
          </div>
        </div>
      `).join('')}
    `;
  } else if (state.activeModalTab === 'faqs') {
    const faqs = s.faqs || [];
    body.innerHTML = faqs.length ? faqs.map(f => `
      <div style="margin-bottom:16px; background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
        <h4 style="font-size:14px; font-weight:700; color:#0f172a; margin-bottom:6px;">Q: ${f.question}</h4>
        <p style="font-size:13px; color:#475569; line-height:1.5;">${f.answer}</p>
        ${f.official_reference ? `<span style="font-size:10px; color:#64748b; display:block; margin-top:6px;">Ref: ${f.official_reference}</span>` : ''}
      </div>
    `).join('') : '<p style="color:#64748b; font-size:13px;">No specific FAQs cataloged for this service yet.</p>';
  }
}

window.switchModalTab = function(tab) {
  state.activeModalTab = tab;
  renderServiceModal();
};

window.trackServiceFromModal = async function(serviceId, serviceTitle) {
  try {
    await api('/applications', {
      method: 'POST',
      body: JSON.stringify({ service_id: serviceId, service_title: serviceTitle })
    });
    showToast(`Added ${serviceTitle} to My Applications!`, 'success');
    document.getElementById('serviceModalBackdrop').classList.remove('open');
    switchTab('applications');
  } catch (e) {
    showToast(e.message, 'error');
  }
};

window.toggleSaveService = async function(serviceId) {
  try {
    const res = await api('/applications/saved/toggle', {
      method: 'POST',
      body: JSON.stringify({ serviceId })
    });
    if (res.isSaved) {
      state.savedServiceIds.add(serviceId);
      showToast('Service saved to bookmarks', 'success');
    } else {
      state.savedServiceIds.delete(serviceId);
      showToast('Removed from bookmarks');
    }
    filterAndRenderServices();
  } catch (e) {
    showToast(e.message, 'error');
  }
};

async function loadSavedServices() {
  try {
    const res = await api('/applications/saved');
    state.savedServiceIds = new Set((res.data || []).map(s => s.id));
    filterAndRenderServices();
  } catch (e) {}
}

// AI Chat Drawer
window.openAiDrawer = function(prefillQuery = '', serviceId = null) {
  const drawer = document.getElementById('chatDrawer');
  drawer.classList.add('open');
  if (prefillQuery) {
    document.getElementById('chatInput').value = prefillQuery;
    sendChatMessage(serviceId);
  }
};

async function sendChatMessage(targetServiceId = null) {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;

  state.chatMessages.push({ role: 'user', text: query });
  input.value = '';
  renderChatMessages();

  // Scroll to bottom
  const container = document.getElementById('chatMessages');
  container.scrollTop = container.scrollHeight;

  // Assistant typing placeholder
  const placeholderIdx = state.chatMessages.length;
  state.chatMessages.push({ role: 'assistant', text: 'Analyzing verified government gazettes and official procedures...' });
  renderChatMessages();

  try {
    const res = await api('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({
        query,
        serviceId: targetServiceId,
        state: 'Telangana',
        language: state.lang
      })
    });

    state.chatMessages[placeholderIdx] = {
      role: 'assistant',
      text: res.data.answer,
      sources: res.data.sources || []
    };
  } catch (err) {
    state.chatMessages[placeholderIdx] = {
      role: 'assistant',
      text: 'Sorry, I encountered an issue retrieving the verified government records: ' + err.message
    };
  }

  renderChatMessages();
  container.scrollTop = container.scrollHeight;
}

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  container.innerHTML = state.chatMessages.map(m => {
    const isUser = m.role === 'user';
    return `
      <div class="msg-bubble ${isUser ? 'user' : 'assistant'}">
        <div style="white-space: pre-wrap;">${m.text}</div>
        ${m.sources && m.sources.length ? `
          <div style="margin-top:10px; padding-top:8px; border-top:1px solid #cbd5e1; font-size:11px;">
            <strong>Verified Sources:</strong>
            ${m.sources.map(src => `
              <div style="margin-top:2px;">
                <a href="${src.url}" target="_blank" rel="noopener noreferrer" style="color:#0284c7; text-decoration:none;">
                  • ${src.title} (${src.lastVerified})
                </a>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Personalized Guidance Wizard
function openGuidanceWizard() {
  const select = document.getElementById('wizardServiceSelect');
  select.innerHTML = state.services.map(s => `
    <option value="${s.id}">${s.title}</option>
  `).join('');
  document.getElementById('guidanceResultArea').innerHTML = '';
  document.getElementById('guidanceModalBackdrop').classList.add('open');
}

async function handleGuidanceSubmit(e) {
  e.preventDefault();
  const serviceId = document.getElementById('wizardServiceSelect').value;
  const stateVal = document.getElementById('wizardStateSelect').value;
  const ageGroup = document.getElementById('wizardAgeSelect').value;
  const occupation = document.getElementById('wizardOccSelect').value;

  const resultArea = document.getElementById('guidanceResultArea');
  resultArea.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Generating personalized compliance checklist...</div>`;

  try {
    const res = await api('/ai/guidance', {
      method: 'POST',
      body: JSON.stringify({ serviceId, state: stateVal, ageGroup, occupation })
    });

    const data = res;
    const list = data.personalizedChecklist || [];
    resultArea.innerHTML = `
      <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px; padding:16px; margin-top:20px;">
        <h4 style="font-weight:700; color:#065f46; margin-bottom:4px;">✨ Your Custom Checklist for ${data.service.title}</h4>
        <p style="font-size:12px; color:#047857; margin-bottom:12px;">Based on your profile: ${occupation} • ${stateVal}</p>
        
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${list.map((item, idx) => `
            <div style="display:flex; align-items:flex-start; gap:10px; background:#fff; padding:10px 14px; border-radius:8px; border:1px solid #e2e8f0;">
              <span style="font-weight:700; color:#065f46; font-size:13px;">${idx + 1}.</span>
              <div>
                <strong style="font-size:13px; color:#0f172a; display:block;">${item.task}</strong>
                <span style="font-size:12px; color:#64748b;">${item.details}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    resultArea.innerHTML = `<div style="color:#ef4444; padding:16px;">Failed to generate checklist: ${err.message}</div>`;
  }
}

// Applications Tracker
async function loadApplications() {
  const container = document.getElementById('applicationsContainer');
  container.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b;">Loading tracked applications...</div>`;

  try {
    const res = await api('/applications');
    state.applications = res.data || [];
    renderApplications();
  } catch (e) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">${e.message}</div>`;
  }
}

function renderApplications() {
  const container = document.getElementById('applicationsContainer');
  if (!state.applications.length) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; background:#fff; border-radius:16px; border:1px solid #e2e8f0;">
        <p style="font-size:32px; margin-bottom:12px;">📁</p>
        <h3 style="font-weight:700; color:#0f172a; margin-bottom:6px;">No tracked applications yet</h3>
        <p style="font-size:13px; color:#64748b; margin-bottom:20px;">Add an ongoing government application or open any service to track your documentation readiness.</p>
        <button class="btn-primary" onclick="openNewApplicationModal()">+ Track New Application</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h3 style="font-weight:800; color:#0f2744; font-size:20px;">My Ongoing Applications (${state.applications.length})</h3>
      <button class="btn-primary" onclick="openNewApplicationModal()">+ Track New Application</button>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${state.applications.map(app => {
        const docs = app.documents || [];
        const readyCount = docs.filter(d => d.status === 'READY' || d.status === 'UPLOADED').length;
        const progressPct = docs.length ? Math.round((readyCount / docs.length) * 100) : 0;

        return `
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <h4 style="font-size:17px; font-weight:800; color:#0f2744;">${app.service_title}</h4>
                  <span style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; background:#eff6ff; color:#1e40af;">
                    ${app.status}
                  </span>
                </div>
                <p style="font-size:12px; color:#64748b; margin-top:2px;">
                  Ref / Token: <strong>${app.application_reference_number || 'N/A'}</strong> • Applied on: ${app.applied_on || 'Pending'}
                </p>
              </div>
              <button onclick="deleteApplication('${app.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:12px; font-weight:600;">
                Delete
              </button>
            </div>

            <!-- Progress Bar -->
            <div style="margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#475569; margin-bottom:4px;">
                <span>Document Readiness: ${readyCount}/${docs.length} ${t('progressReady')}</span>
                <span>${progressPct}%</span>
              </div>
              <div style="height:6px; background:#f1f5f9; border-radius:999px; overflow:hidden;">
                <div style="width:${progressPct}%; height:100%; background:#10b981; transition:width 0.3s;"></div>
              </div>
            </div>

            <!-- Documents Checklist -->
            <div style="background:#f8fafc; border-radius:10px; padding:12px; border:1px solid #f1f5f9;">
              <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:#64748b; display:block; margin-bottom:8px;">
                Checklist Items
              </span>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${docs.map(d => `
                  <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0; font-size:12px;">
                    <span style="color:#0f172a; font-weight:500;">${d.document_name}</span>
                    <select onchange="updateDocStatus('${d.id}', this.value)" style="font-size:11px; font-weight:600; padding:2px 6px; border-radius:4px; border:1px solid #cbd5e1;">
                      <option value="NOT_READY" ${d.status === 'NOT_READY' ? 'selected' : ''}>Not Ready</option>
                      <option value="READY" ${d.status === 'READY' ? 'selected' : ''}>Ready (Original)</option>
                      <option value="UPLOADED" ${d.status === 'UPLOADED' ? 'selected' : ''}>Uploaded / Scanned</option>
                    </select>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.openNewApplicationModal = function() {
  const select = document.getElementById('appServiceSelect');
  select.innerHTML = state.services.map(s => `
    <option value="${s.id}">${s.title}</option>
  `).join('');
  document.getElementById('newAppModalBackdrop').classList.add('open');
};

async function handleNewApplication(e) {
  e.preventDefault();
  const serviceId = document.getElementById('appServiceSelect').value;
  const srv = state.services.find(s => s.id === serviceId);
  const refNum = document.getElementById('appRefNumber').value;
  const appliedDate = document.getElementById('appAppliedDate').value;
  const status = document.getElementById('appStatusSelect').value;

  try {
    await api('/applications', {
      method: 'POST',
      body: JSON.stringify({
        service_id: serviceId,
        service_title: srv ? srv.title : 'Government Service',
        application_reference_number: refNum,
        applied_on: appliedDate,
        status: status
      })
    });
    showToast('Application record created', 'success');
    document.getElementById('newAppModalBackdrop').classList.remove('open');
    loadApplications();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.updateDocStatus = async function(docId, newStatus) {
  try {
    await api(`/applications/documents/${docId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    showToast('Document status updated', 'success');
    loadApplications();
  } catch (e) {
    showToast(e.message, 'error');
  }
};

window.deleteApplication = async function(appId) {
  if (!confirm('Are you sure you want to stop tracking this application?')) return;
  try {
    await api(`/applications/${appId}`, { method: 'DELETE' });
    showToast('Application removed');
    loadApplications();
  } catch (e) {
    showToast(e.message, 'error');
  }
};

// Reminders
async function loadReminders() {
  const container = document.getElementById('remindersList');
  container.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Loading reminders...</div>`;

  try {
    const res = await api('/reminders');
    state.reminders = res.data || [];
    renderReminders();
  } catch (e) {
    container.innerHTML = `<div style="color:#ef4444;">${e.message}</div>`;
  }
}

function renderReminders() {
  const container = document.getElementById('remindersList');
  if (!state.reminders.length) {
    container.innerHTML = `<p style="font-size:13px; color:#64748b; padding:16px 0;">No active civic reminders set.</p>`;
    return;
  }

  container.innerHTML = state.reminders.map(r => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#fff; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:8px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <input type="checkbox" ${r.is_completed ? 'checked' : ''} onchange="toggleReminder('${r.id}', this.checked)" style="width:18px; height:18px; cursor:pointer;" />
        <div>
          <span style="font-size:14px; font-weight:700; color:${r.is_completed ? '#94a3b8' : '#0f172a'}; text-decoration:${r.is_completed ? 'line-through' : 'none'};">
            ${r.title}
          </span>
          <span style="font-size:12px; color:#64748b; display:block;">
            📅 Due: ${r.reminder_date} • ${r.service_title || 'Civic Procedure'}
          </span>
        </div>
      </div>
      <button onclick="deleteReminder('${r.id}')" style="background:none; border:none; color:#ef4444; font-size:12px; cursor:pointer; font-weight:600;">
        ✕
      </button>
    </div>
  `).join('');
}

async function handleNewReminder(e) {
  e.preventDefault();
  const title = document.getElementById('remTitle').value;
  const date = document.getElementById('remDate').value;
  const notes = document.getElementById('remNotes').value;

  try {
    await api('/reminders', {
      method: 'POST',
      body: JSON.stringify({ title, reminder_date: date, notes })
    });
    showToast('Reminder added', 'success');
    document.getElementById('remTitle').value = '';
    document.getElementById('remDate').value = '';
    document.getElementById('remNotes').value = '';
    loadReminders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.toggleReminder = async function(remId, isCompleted) {
  try {
    await api(`/reminders/${remId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted })
    });
    loadReminders();
  } catch (e) {
    showToast(e.message, 'error');
  }
};

window.deleteReminder = async function(remId) {
  try {
    await api(`/reminders/${remId}`, { method: 'DELETE' });
    showToast('Reminder deleted');
    loadReminders();
  } catch (e) {
    showToast(e.message, 'error');
  }
};

// Admin Console
async function loadAdminStats() {
  if (state.currentUser?.role !== 'admin') {
    showToast('Admin privilege required', 'error');
    switchTab('services');
    return;
  }

  try {
    const res = await api('/admin/stats');
    state.adminStats = res.data;
    renderAdmin();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function renderAdmin() {
  const stats = state.adminStats || { totalServices: 0, verifiedServices: 0, pendingReview: 0, conflictingSources: 0, totalAuditRecords: 0 };
  document.getElementById('statTotalServices').innerText = stats.totalServices;
  document.getElementById('statVerified').innerText = stats.verifiedServices;
  document.getElementById('statPending').innerText = stats.pendingReview;
  document.getElementById('statAudit').innerText = stats.totalAuditRecords;

  const tableBody = document.getElementById('adminServicesTableBody');
  tableBody.innerHTML = state.services.map(s => `
    <tr>
      <td><strong>${s.title}</strong></td>
      <td>${s.category}</td>
      <td>
        <span class="verification-pill ${s.verification_status === 'VERIFIED' ? 'verified' : 'unverified'}" style="margin:0; display:inline-flex;">
          ${s.verification_status}
        </span>
      </td>
      <td>${s.last_verified}</td>
      <td>
        <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="verifyServiceAction('${s.id}')">
          Verify Source ↗
        </button>
      </td>
    </tr>
  `).join('');
}

window.verifyServiceAction = async function(serviceId) {
  const findings = prompt('Enter administrative verification finding: \n(e.g., "Confirmed gazette fees and portal URL with official MEA website.")');
  if (!findings) return;

  try {
    await api(`/admin/services/${serviceId}/verify`, {
      method: 'POST',
      body: JSON.stringify({
        status: 'VERIFIED',
        findings: findings,
        source_url: 'https://services.india.gov.in'
      })
    });
    showToast('Verification record saved to government audit trail', 'success');
    await loadServices();
    await loadAdminStats();
  } catch (e) {
    showToast(e.message, 'error');
  }
};

// Auth Modal Handlers
function openAuthModal() {
  document.getElementById('authModalBackdrop').classList.add('open');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('civic_auth_token', res.data.token);
    localStorage.setItem('civic_user', JSON.stringify(res.data.user));
    state.currentUser = res.data.user;
    showToast(`Welcome back, ${state.currentUser.full_name}!`, 'success');
    document.getElementById('authModalBackdrop').classList.remove('open');
    renderNav();
    loadSavedServices();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const stateVal = document.getElementById('regState').value;

  try {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: name, email, password, state: stateVal })
    });
    localStorage.setItem('civic_auth_token', res.data.token);
    localStorage.setItem('civic_user', JSON.stringify(res.data.user));
    state.currentUser = res.data.user;
    showToast(`Account registered successfully! Welcome ${name}`, 'success');
    document.getElementById('authModalBackdrop').classList.remove('open');
    renderNav();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function logout() {
  localStorage.removeItem('civic_auth_token');
  localStorage.removeItem('civic_user');
  state.currentUser = null;
  state.savedServiceIds.clear();
  renderNav();
  showToast('Signed out successfully');
  switchTab('services');
  filterAndRenderServices();
}

// Kickstart
document.addEventListener('DOMContentLoaded', init);
