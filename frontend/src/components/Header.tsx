import React from 'react';
import { Shield, Sparkles, FolderCheck, Bell, User as UserIcon, LogOut, Globe, ShieldAlert } from 'lucide-react';
import { Language, DICTIONARY } from '../utils/i18n.js';
import { ApiUser } from '../services/api.js';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'services' | 'chat' | 'applications' | 'reminders' | 'admin';
  onTabChange: (tab: 'services' | 'chat' | 'applications' | 'reminders' | 'admin') => void;
  currentUser: ApiUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenGuidance: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenGuidance
}) => {
  const t = DICTIONARY[currentLang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Official Safety Disclaimer Banner */}
      <div className="bg-civic-900 text-slate-100 text-xs py-1.5 px-4 border-b border-civic-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-amber-300 flex-shrink-0">OFFICIAL CIVIC NOTICE:</span>
            <span className="truncate text-slate-200">{t.disclaimer}</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 text-[11px] text-slate-300">
            <span className="hidden md:inline">National & State Government Services (India)</span>
            <div className="flex items-center gap-1 bg-civic-800 px-2 py-0.5 rounded border border-civic-700">
              <Globe className="w-3 h-3 text-cyan-400" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                aria-label="Select Language"
              >
                <option value="en" className="text-slate-900">English (EN)</option>
                <option value="te" className="text-slate-900">తెలుగు (Telugu)</option>
                <option value="hi" className="text-slate-900">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Emblem */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('services')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-civic-900 via-civic-800 to-civic-700 flex items-center justify-center text-white shadow-md shadow-civic-900/10 border border-civic-700">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-civic-900 tracking-tight">CivicGuide</span>
                <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 bg-civic-100 text-civic-800 rounded tracking-wider">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:block">Government Process Assistant</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange('services')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'services'
                  ? 'bg-civic-50 text-civic-900 font-semibold'
                  : 'text-slate-600 hover:text-civic-900 hover:bg-slate-50'
              }`}
            >
              Services Catalog
            </button>

            <button
              onClick={() => onTabChange('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-civic-50 text-civic-900 font-semibold'
                  : 'text-slate-600 hover:text-civic-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t.askAi}
            </button>

            <button
              onClick={() => onTabChange('applications')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'applications'
                  ? 'bg-civic-50 text-civic-900 font-semibold'
                  : 'text-slate-600 hover:text-civic-900 hover:bg-slate-50'
              }`}
            >
              <FolderCheck className="w-4 h-4 text-emerald-600" />
              {t.myApplications}
            </button>

            <button
              onClick={() => onTabChange('reminders')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reminders'
                  ? 'bg-civic-50 text-civic-900 font-semibold'
                  : 'text-slate-600 hover:text-civic-900 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4 text-slate-500" />
              {t.reminders}
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onTabChange('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-purple-50 text-purple-900 font-semibold'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                {t.adminPortal}
              </button>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenGuidance}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Personalized Checklist</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 py-1 px-2.5 rounded-lg border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-civic-900 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-none">{currentUser.full_name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{currentUser.role}</p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-civic-900 text-white hover:bg-civic-800 transition-colors shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-t border-slate-200 bg-slate-50 overflow-x-auto py-1 px-2 gap-1 text-xs">
        <button
          onClick={() => onTabChange('services')}
          className={`px-3 py-1.5 rounded-md flex-shrink-0 font-medium ${
            activeTab === 'services' ? 'bg-white shadow-sm text-civic-900 font-bold' : 'text-slate-600'
          }`}
        >
          Services
        </button>
        <button
          onClick={() => onTabChange('chat')}
          className={`px-3 py-1.5 rounded-md flex-shrink-0 font-medium ${
            activeTab === 'chat' ? 'bg-white shadow-sm text-civic-900 font-bold' : 'text-slate-600'
          }`}
        >
          AI Assistant
        </button>
        <button
          onClick={() => onTabChange('applications')}
          className={`px-3 py-1.5 rounded-md flex-shrink-0 font-medium ${
            activeTab === 'applications' ? 'bg-white shadow-sm text-civic-900 font-bold' : 'text-slate-600'
          }`}
        >
          My Applications
        </button>
        <button
          onClick={() => onTabChange('reminders')}
          className={`px-3 py-1.5 rounded-md flex-shrink-0 font-medium ${
            activeTab === 'reminders' ? 'bg-white shadow-sm text-civic-900 font-bold' : 'text-slate-600'
          }`}
        >
          Reminders
        </button>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onTabChange('admin')}
            className={`px-3 py-1.5 rounded-md flex-shrink-0 font-medium ${
              activeTab === 'admin' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-purple-700'
            }`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
