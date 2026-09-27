import React, { useState } from 'react';
import { 
  X, ShieldCheck, AlertTriangle, ExternalLink, Sparkles, 
  FileText, CheckCircle2, Clock, CreditCard, HelpCircle, 
  Share2, Bookmark, FolderPlus, ArrowRight, BookOpen, Building
} from 'lucide-react';
import { Language, DICTIONARY } from '../utils/i18n.js';

interface ServiceDetailModalProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onAskAi: (service: any, prompt?: string) => void;
  onTrackService: (service: any) => void;
  isSaved?: boolean;
  onToggleSave?: (serviceId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  currentLang,
  onAskAi,
  onTrackService,
  isSaved = false,
  onToggleSave
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'steps' | 'fees' | 'sources' | 'faqs'>('overview');
  const [docStatuses, setDocStatuses] = useState<Record<string, 'NOT_READY' | 'READY' | 'UPLOADED'>>({});

  if (!isOpen || !service) return null;

  const t = DICTIONARY[currentLang];
  const docs = service.documents || [];
  const steps = service.steps || [];
  const sources = service.sources || [];
  const faqs = service.faqs || [];

  const handleDocStatusChange = (docId: string, status: 'NOT_READY' | 'READY' | 'UPLOADED') => {
    setDocStatuses(prev => ({ ...prev, [docId]: status }));
  };

  const readyDocsCount = docs.filter((d: any) => {
    const s = docStatuses[d.id] || 'NOT_READY';
    return s === 'READY' || s === 'UPLOADED';
  }).length;

  const progressPercent = docs.length > 0 ? Math.round((readyDocsCount / docs.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-civic-800 text-cyan-300 border border-civic-700">
                  {service.service_code}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {service.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-amber-300 border border-slate-700">
                  {service.state} ({service.country})
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                {service.title}
              </h2>

              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{service.department?.name || 'Department of Public Services'}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Official Verification Banner */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Official Source
              </span>
              <span className="text-slate-400 text-[11px]">
                {t.lastVerified}: <span className="text-slate-200 font-medium">{service.last_verified}</span>
              </span>
            </div>

            <a
              href={service.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 underline text-xs font-medium"
            >
              <span>Visit Official Government Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto gap-1 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors flex-shrink-0 ${
              activeTab === 'overview'
                ? 'border-civic-900 text-civic-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Eligibility
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'documents'
                ? 'border-civic-900 text-civic-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.documentsRequired}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-civic-100 text-civic-800 font-bold">
              {docs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'steps'
                ? 'border-civic-900 text-civic-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.stepsProcedure}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {steps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`py-3 px-3 border-b-2 transition-colors flex-shrink-0 ${
              activeTab === 'fees'
                ? 'border-civic-900 text-civic-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.fees} & Timelines
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'sources'
                ? 'border-civic-900 text-civic-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.officialSources}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {sources.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-3 px-3 border-b-2 transition-colors flex-shrink-0 ${
              activeTab === 'faqs'
                ? 'border-civic-900 text-civic-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.faqs}
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800 text-sm leading-relaxed space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Service Description</h4>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {service.description}
                </p>
              </div>

              {/* Who is eligible */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.eligibility}</h4>
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-900 font-medium">{service.eligibility_criteria}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-800 font-medium">
                          Audience: {service.target_audience}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-800 font-medium">
                          Application Mode: {service.application_mode}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-800 font-medium">
                          Jurisdiction: {service.state}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-civic-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">{t.fees}</h5>
                    <p className="text-xs text-slate-700 font-medium">{service.fee_structure}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-civic-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">{t.processingTime}</h5>
                    <p className="text-xs text-slate-700 font-medium">{service.processing_time}</p>
                  </div>
                </div>
              </div>

              {/* Quick Prompt */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Have specific questions about this service?</h5>
                    <p className="text-xs text-slate-600">CivicGuide AI can explain specific terms, check your age/income eligibility, and list steps.</p>
                  </div>
                </div>
                <button
                  onClick={() => onAskAi(service, `What are the step-by-step instructions for ${service.title}?`)}
                  className="px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex-shrink-0 shadow-sm"
                >
                  Ask Assistant
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REQUIRED DOCUMENTS CHECKLIST */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Checklist Readiness Progress:</span>
                  <span className="text-civic-900 font-bold">{readyDocsCount} / {docs.length} {t.progressReady} ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                {docs.map((doc: any, idx: number) => {
                  const status = docStatuses[doc.id] || 'NOT_READY';
                  return (
                    <div 
                      key={doc.id || idx}
                      className={`p-4 rounded-xl border transition-all ${
                        status === 'READY' || status === 'UPLOADED'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{doc.document_name}</h5>
                            <p className="text-xs text-slate-600 mt-0.5"><span className="font-semibold text-slate-700">Purpose:</span> {doc.purpose}</p>

                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                Accepted: {doc.accepted_formats || 'PDF/Scan'}
                              </span>
                              <span className={`px-2 py-0.5 rounded font-medium ${
                                doc.is_original_required ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {doc.is_original_required ? 'Original Required at Verification' : 'Photocopy / Digital'}
                              </span>
                            </div>

                            {doc.notes && (
                              <p className="text-[11px] text-slate-500 mt-2 bg-slate-100/60 p-2 rounded border border-slate-200/60">
                                💡 <span className="font-medium text-slate-700">Official Note:</span> {doc.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Interactive Status Switch */}
                        <div className="flex flex-col gap-1 flex-shrink-0 text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Status</span>
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
                            <button
                              onClick={() => handleDocStatusChange(doc.id, 'NOT_READY')}
                              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                status === 'NOT_READY' ? 'bg-rose-100 text-rose-800 font-bold shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              {t.notReady}
                            </button>
                            <button
                              onClick={() => handleDocStatusChange(doc.id, 'READY')}
                              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                status === 'READY' ? 'bg-amber-100 text-amber-800 font-bold shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              {t.ready}
                            </button>
                            <button
                              onClick={() => handleDocStatusChange(doc.id, 'UPLOADED')}
                              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                status === 'UPLOADED' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              {t.uploaded}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP PROCEDURE */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Follow these official steps carefully. Ensure all information matches your supporting documents.
              </p>

              <div className="relative border-l-2 border-civic-200 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-6">
                {steps.map((step: any) => (
                  <div key={step.id || step.step_number} className="relative">
                    {/* Step Pin */}
                    <div className="absolute -left-[25px] sm:-left-[33px] top-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-civic-900 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                      {step.step_number}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <h5 className="font-bold text-slate-900 text-sm">{step.title}</h5>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            step.is_online_step ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}>
                            {step.is_online_step ? '🌐 Online Step' : '🏛️ Office Visit'}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {step.estimated_time}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed mb-2">{step.description}</p>

                      {step.tips && (
                        <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 flex items-start gap-1.5">
                          <span className="font-bold">Advice:</span>
                          <span>{step.tips}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FEES & TIMELINES */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Verified Official Fee Structure</h4>
                <p className="text-base font-semibold text-slate-900 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {service.fee_structure}
                </p>

                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Citizen Warning on Unofficial Extra Charges:</span>
                      <p className="mt-0.5">
                        Never pay un-receipted cash to private brokers or touts. Official fees are legally fixed and receipted electronically on the government portal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Processing Time & Delivery</h4>
                <p className="text-sm font-medium text-slate-800">
                  Standard processing duration: <span className="font-bold text-civic-900">{service.processing_time}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Timeline commences post physical document scrutiny, biometric submission, or field police verification where applicable.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL SOURCES & CITATIONS */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-emerald-950 text-sm">Authoritative Government Data Assurance</h5>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    CivicGuide AI retrieves and validates service procedures solely from primary government portals, statutory acts, and gazetted orders.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {sources.map((src: any) => (
                  <div key={src.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-civic-100 text-civic-800">
                            {src.source_type}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Checked: {src.last_checked_date}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm">{src.document_title || src.authority_name}</h5>
                        <p className="text-xs text-slate-600 mt-1">{src.authority_name}</p>
                        <p className="text-xs text-slate-700 italic mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                          "{src.citation_text}"
                        </p>
                      </div>

                      <a
                        href={src.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex-shrink-0"
                      >
                        <span>Visit Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-3">
              {faqs.map((faq: any, idx: number) => (
                <div key={faq.id || idx} className="bg-white p-4 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-sm mb-1 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-civic-600 mt-0.5 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </h5>
                  <p className="text-xs text-slate-700 pl-6 leading-relaxed mb-2">{faq.answer}</p>
                  {faq.official_reference && (
                    <p className="text-[10px] text-slate-400 pl-6">
                      Official Reference: <span className="font-medium text-slate-600">{faq.official_reference}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(service.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  isSaved
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                <span>{isSaved ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            )}

            <button
              onClick={() => onTrackService(service)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Track Application</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAskAi(service, `What are the documents and steps for ${service.title}?`);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.askAi}</span>
            </button>

            <a
              href={service.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-civic-900 text-white hover:bg-civic-800 transition-colors shadow-sm"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
