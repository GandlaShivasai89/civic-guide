import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiService, ApiUser } from '../services/api.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ApiUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [state, setState] = useState('Telangana');
  const [district, setDistrict] = useState('Hyderabad');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (isRegister) {
        const res = await ApiService.register({
          email,
          password,
          full_name: fullName,
          state,
          district
        });
        onSuccess(res.user);
        onClose();
      } else {
        const res = await ApiService.login({ email, password });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'citizen' | 'admin') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const creds = role === 'admin' 
        ? { email: 'admin@civicguide.gov.in', password: 'Password@123' }
        : { email: 'citizen@example.com', password: 'Password@123' };
      
      const res = await ApiService.login(creds);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-civic-900 text-white p-5 border-b border-civic-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isRegister ? 'Create Citizen Account' : 'Citizen & Admin Login'}
              </h3>
              <p className="text-xs text-slate-300">CivicGuide AI Account Access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Demo Login Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            1-Click Instant Demo Access:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('citizen')}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-civic-400 hover:bg-slate-50 text-xs font-semibold text-center transition-all shadow-xs"
            >
              👤 Citizen Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-purple-200 text-purple-900 hover:border-purple-400 hover:bg-purple-50 text-xs font-semibold text-center transition-all shadow-xs"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {isRegister && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Shiva Sai"
                  className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="citizen@example.com"
                className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                >
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="All-India">All-India</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-civic-900 text-white hover:bg-civic-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isLoading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs text-civic-700 font-semibold hover:underline"
            >
              {isRegister
                ? 'Already have an account? Sign in here'
                : "Don't have an account? Register as a Citizen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
