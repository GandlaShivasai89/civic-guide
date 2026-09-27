import React, { useState } from 'react';
import { 
  X, Sparkles, CheckSquare, ArrowRight, Printer, 
  ShieldCheck, FolderPlus, Download, CheckCircle2 
} from 'lucide-react';
import { Language, DICTIONARY } from '../utils/i18n.js';
import { ApiService } from '../services/api.js';

interface PersonalizedGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  services: any[];
  onTrackService: (service: any, checklist?: any[]) => void;
}

export const PersonalizedGuidanceModal: React.FC<PersonalizedGuidanceModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  services,
  onTrackService
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Telangana');
  const [district, setDistrict] = useState('Hyderabad');
  const [ageGroup, setAgeGroup] = useState('ADULT_18_59');
  const [occupation, setOccupation] = useState('CITIZEN');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || 'srv-passport');

  const [isLoading, setIsLoading] = useState(false);
  const [guidanceResult, setGuidanceResult] = useState<any | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const t = DICTIONARY[currentLang];

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getPersonalizedGuidance({
        country,
        state,
        district,
        ageGroup,
        occupation,
        serviceId: selectedServiceId
      });
      setGuidanceResult(res);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-civic-900 to-civic-800 text-white p-5 border-b border-civic-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white">
                Personalized Application Checklist
              </h3>
              <p className="text-xs text-slate-300">
                Tailored instructions based on your state & citizen category
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600">
                Answer these simple questions. CivicGuide AI does not collect any sensitive personal numbers (no Aadhaar/PAN numbers required).
              </p>

              {/* Service Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Which government service do you need?
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* State & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    2. Select State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi (NCR)</option>
                    <option value="All-India">All-India / Central</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    District / City
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Hyderabad, Warangal, Rangareddy"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Age Group */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Age Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'MINOR', label: 'Below 18 (Minor)' },
                    { id: 'ADULT_18_59', label: '18 – 59 Years' },
                    { id: 'SENIOR', label: '60+ (Senior)' },
                    { id: 'STUDENT', label: 'College Student' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAgeGroup(item.id)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                        ageGroup === item.id
                          ? 'bg-civic-900 text-white border-civic-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment / Occupation */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. Current Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'CITIZEN', label: 'General Citizen' },
                    { id: 'STUDENT', label: 'Student' },
                    { id: 'SALARIED', label: 'Salaried Employee' },
                    { id: 'BUSINESS', label: 'Business / MSME' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOccupation(item.id)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                        occupation === item.id
                          ? 'bg-civic-900 text-white border-civic-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Service Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase text-civic-700">Customized Application Plan</span>
                  <span className="text-[11px] text-slate-500 font-medium">State: {guidanceResult?.profile?.state}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{guidanceResult?.service?.title}</h4>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span>💰 Fee: <strong className="text-slate-800">{guidanceResult?.service?.fee}</strong></span>
                  <span>⏱️ Time: <strong className="text-slate-800">{guidanceResult?.service?.processingTime}</strong></span>
                </div>
              </div>

              {/* Interactive Checklist */}
              <div>
                <h5 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Your Actionable Preparation Checklist:</span>
                </h5>

                <div className="space-y-2">
                  {guidanceResult?.personalizedChecklist?.map((item: any, idx: number) => {
                    const isChecked = !!checkedItems[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCheck(idx)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50/50 border-emerald-300 text-slate-800'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`text-xs sm:text-sm font-semibold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {item.task}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{item.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{guidanceResult?.verificationNotice}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step === 2 ? (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Back to Questions
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Checklist</span>
                </button>

                <button
                  onClick={() => {
                    const srv = services.find(s => s.id === selectedServiceId);
                    if (srv) {
                      onClose();
                      onTrackService(srv, guidanceResult?.personalizedChecklist);
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Save to Applications</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-civic-900 text-white hover:bg-civic-800 disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>{isLoading ? 'Generating Checklist...' : 'Generate My Checklist'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
