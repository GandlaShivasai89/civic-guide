import React, { useState, useEffect } from 'react';
import { 
  Search, Shield, Sparkles, Filter, CheckCircle2, 
  MapPin, ExternalLink, ArrowRight, BookOpen, Layers,
  Compass, HelpCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { Language, DICTIONARY } from './utils/i18n.js';
import { ApiService, ApiUser } from './services/api.js';
import { Header } from './components/Header.js';
import { ServiceCard } from './components/ServiceCard.js';
import { ServiceDetailModal } from './components/ServiceDetailModal.js';
import { AiChatDrawer } from './components/AiChatDrawer.js';
import { PersonalizedGuidanceModal } from './components/PersonalizedGuidanceModal.js';
import { ApplicationsTrackerView } from './components/ApplicationsTrackerView.js';
import { RemindersView } from './components/RemindersView.js';
import { AdminDashboardView } from './components/AdminDashboardView.js';
import { NewApplicationModal } from './components/NewApplicationModal.js';
import { AuthModal } from './components/AuthModal.js';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'services' | 'chat' | 'applications' | 'reminders' | 'admin'>('services');

  // Core Data
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [savedServices, setSavedServices] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Modals & Drawers
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPreloadPrompt, setChatPreloadPrompt] = useState<string | undefined>();
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const t = DICTIONARY[currentLang];

  // Fetch initial data
  const loadData = async () => {
    setIsLoadingServices(true);
    try {
      const [srvList, catList, user] = await Promise.all([
        ApiService.getServices(),
        ApiService.getCategories(),
        Promise.resolve(ApiService.getCurrentUser())
      ]);
      setServices(srvList);
      setCategories(catList);
      setCurrentUser(user);

      if (user) {
        const [apps, saved, rems] = await Promise.all([
          ApiService.getApplications(),
          ApiService.getSavedServices(),
          ApiService.getReminders()
        ]);
        setApplications(apps);
        setSavedServices(saved);
        setReminders(rems);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Services List
  const filteredServices = services.filter((s) => {
    const matchesSearch = !searchQuery.trim() || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.service_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesState = selectedState === 'ALL' || s.state === 'All-India' || s.state.toLowerCase() === selectedState.toLowerCase();
    const matchesMode = selectedMode === 'ALL' || s.application_mode === selectedMode;

    return matchesSearch && matchesCategory && matchesState && matchesMode;
  });

  const handleSelectService = (srv: any) => {
    setSelectedService(srv);
    setIsDetailModalOpen(true);
  };

  const handleAskAiForService = (srv: any, customPrompt?: string) => {
    setSelectedService(srv);
    setChatPreloadPrompt(customPrompt || `What documents and steps do I need for ${srv.title}?`);
    setIsChatOpen(true);
  };

  const handleToggleSaveService = async (serviceId: string) => {
    try {
      const res = await ApiService.toggleSavedService(serviceId);
      const updatedSaved = await ApiService.getSavedServices();
      setSavedServices(updatedSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackService = (srv: any) => {
    setSelectedService(srv);
    setIsNewAppModalOpen(true);
  };

  const handleLogout = () => {
    ApiService.logout();
    setCurrentUser(null);
    setApplications([]);
    setSavedServices([]);
    setReminders([]);
    if (activeTab === 'admin') setActiveTab('services');
  };

  const popularKeywords = [
    'Apply for passport',
    'Get income certificate',
    'Renew driving licence',
    'Birth certificate',
    'Post-Matric Scholarship',
    'Voter ID registration'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-civic-500 selection:text-white" lang={currentLang}>
      {/* Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'chat') {
            setIsChatOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenGuidance={() => setIsGuidanceModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB: SERVICES (HOME) */}
        {activeTab === 'services' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Section */}
            <div className="relative rounded-3xl bg-gradient-to-br from-civic-950 via-civic-900 to-civic-800 text-white p-6 sm:p-10 md:p-12 shadow-xl border border-civic-800 overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-4 border border-white/10">
                  <Shield className="w-3.5 h-3.5" />
                  <span>100% Authoritative Government Information Grounded in Official Portals</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white mb-4">
                  {t.heroTitle}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-normal">
                  {t.heroSubtitle}
                </p>

                {/* Global Search Bar */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-2 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full py-2.5 px-2 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400"
                    />

                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-slate-400 hover:text-slate-600 px-2 font-medium"
                      >
                        Clear
                      </button>
                    )}

                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-civic-900 hover:bg-civic-800 text-white text-xs font-bold transition-colors shadow-sm flex-shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{t.askAi}</span>
                    </button>
                  </div>
                </div>

                {/* Popular Search Chips */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">{t.popularSearches}</span>
                  {popularKeywords.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(kw)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-medium transition-colors border border-white/5"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative Background Accents */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              <div className="absolute right-10 top-10 w-60 h-60 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            </div>

            {/* Filter Row */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="font-bold text-slate-400 uppercase text-[11px] flex-shrink-0 pr-1">Category:</span>
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-civic-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.allCategories}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-civic-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Jurisdiction & Mode Selectors */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">Jurisdiction:</span>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-medium text-slate-800 focus:outline-none"
                    >
                      <option value="ALL">All States / Pan-India</option>
                      <option value="Telangana">Telangana (MeeSeva / GHMC)</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi (NCR)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Mode:</span>
                    <select
                      value={selectedMode}
                      onChange={(e) => setSelectedMode(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-medium text-slate-800 focus:outline-none"
                    >
                      <option value="ALL">All Modes</option>
                      <option value="ONLINE">🌐 100% Online</option>
                      <option value="HYBRID">🏛️ Hybrid (Online + Slot)</option>
                      <option value="OFFLINE">🏢 Offline Counter</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    Showing <strong className="text-slate-900">{filteredServices.length}</strong> verified services
                  </span>
                  {(searchQuery || selectedCategory !== 'ALL' || selectedState !== 'ALL' || selectedMode !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('ALL');
                        setSelectedState('ALL');
                        setSelectedMode('ALL');
                      }}
                      className="text-civic-700 hover:underline font-semibold"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {isLoadingServices ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-8 h-8 text-civic-600 animate-spin mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Loading verified government services...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No services match your search</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Try searching for keywords like "Passport", "Driving", "Income", "Birth", or select "All Categories".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedState('ALL');
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-civic-900 text-white hover:bg-civic-800"
                >
                  Clear Search Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    currentLang={currentLang}
                    onSelect={handleSelectService}
                    onAskAi={handleAskAiForService}
                    isSaved={savedServices.some(s => s.id === service.id)}
                    onToggleSave={handleToggleSaveService}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: APPLICATIONS & TRACKER */}
        {activeTab === 'applications' && (
          <ApplicationsTrackerView
            applications={applications}
            savedServices={savedServices}
            currentLang={currentLang}
            onRefresh={loadData}
            onSelectService={handleSelectService}
            onOpenNewApplication={() => setIsNewAppModalOpen(true)}
            onAskAi={handleAskAiForService}
          />
        )}

        {/* TAB: REMINDERS */}
        {activeTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            services={services}
            onRefresh={loadData}
          />
        )}

        {/* TAB: ADMIN CONSOLE */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboardView
            services={services}
            onRefreshServices={loadData}
          />
        )}
      </main>

      {/* Floating AI Assistant Trigger Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-civic-900 to-civic-800 text-white font-bold text-xs shadow-2xl hover:shadow-civic-900/30 hover:scale-105 transition-all duration-200 border border-civic-700 group"
      >
        <div className="w-6 h-6 rounded-full bg-amber-400 text-civic-950 flex items-center justify-center font-black">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span>{t.askAi}</span>
      </button>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 text-xs text-slate-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-civic-900 text-white flex items-center justify-center font-bold">
              CG
            </div>
            <div>
              <p className="font-bold text-slate-800">CivicGuide AI – Government Process Assistant</p>
              <p className="text-[11px] text-slate-400">Promoting civic transparency, official sources, and simple procedures.</p>
            </div>
          </div>

          <div className="text-center md:text-right max-w-md">
            <p className="font-medium text-slate-700">Official Sources Policy:</p>
            <p className="text-[11px] text-slate-400">
              Information is regularly cross-referenced against Gazette notifications and authorized state portals (.gov.in / .nic.in).
            </p>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        currentLang={currentLang}
        onAskAi={handleAskAiForService}
        onTrackService={handleTrackService}
        isSaved={selectedService ? savedServices.some(s => s.id === selectedService.id) : false}
        onToggleSave={handleToggleSaveService}
      />

      <AiChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatPreloadPrompt(undefined);
        }}
        currentLang={currentLang}
        preloadedPrompt={chatPreloadPrompt}
        selectedService={selectedService}
      />

      <PersonalizedGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        currentLang={currentLang}
        services={services}
        onTrackService={handleTrackService}
      />

      <NewApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        services={services}
        preselectedService={selectedService}
        onCreated={loadData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          loadData();
        }}
      />
    </div>
  );
};

export default App;
