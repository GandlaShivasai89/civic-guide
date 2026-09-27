import React, { useState } from 'react';
import { 
  FolderCheck, Plus, Clock, CheckCircle2, AlertCircle, 
  ExternalLink, Trash2, Edit3, Bookmark, FileCheck, ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Language, DICTIONARY } from '../utils/i18n.js';
import { ApiService } from '../services/api.js';

interface ApplicationsTrackerViewProps {
  applications: any[];
  savedServices: any[];
  currentLang: Language;
  onRefresh: () => void;
  onSelectService: (service: any) => void;
  onOpenNewApplication: () => void;
  onAskAi: (service: any) => void;
}

export const ApplicationsTrackerView: React.FC<ApplicationsTrackerViewProps> = ({
  applications,
  savedServices,
  currentLang,
  onRefresh,
  onSelectService,
  onOpenNewApplication,
  onAskAi
}) => {
  const t = DICTIONARY[currentLang];
  const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications');
  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);

  const handleDocStatusToggle = async (doc: any) => {
    setUpdatingDocId(doc.id);
    const nextStatus = doc.status === 'NOT_READY' ? 'READY' : doc.status === 'READY' ? 'UPLOADED' : 'NOT_READY';
    try {
      await ApiService.updateDocumentStatus(doc.id, nextStatus);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingDocId(null);
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this tracked application?')) return;
    try {
      await ApiService.deleteApplication(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Approved</span>;
      case 'UNDER_SCRUTINY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">Under Scrutiny / Verification</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Submitted</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">Draft / Document Prep</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Manual Tracking Notice */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <FolderCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Citizen Application Tracker & Saved Services</h2>
          </div>
          <p className="text-xs text-slate-500">
            Organize personal application reference numbers, track document readiness, and monitor offline/online submissions.
          </p>
        </div>

        <button
          onClick={onOpenNewApplication}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-civic-900 text-white hover:bg-civic-800 text-xs font-bold transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Track New Application</span>
        </button>
      </div>

      {/* Official Status Transparency Disclaimer */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Civic Integrity Notice:</strong> CivicGuide AI manages your personal application notes and document checklist milestones. We do not connect to classified police/intelligence databases or alter government records. To obtain legally binding application status, always visit the official government portal link listed below.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'applications'
              ? 'border-civic-900 text-civic-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Tracked Applications</span>
          <span className="px-2 py-0.2 rounded-full text-xs bg-civic-100 text-civic-800">
            {applications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-civic-900 text-civic-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Saved Services</span>
          <span className="px-2 py-0.2 rounded-full text-xs bg-amber-100 text-amber-800">
            {savedServices.length}
          </span>
        </button>
      </div>

      {/* TAB 1: APPLICATIONS LIST */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <FolderCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No applications tracked yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Keep track of your Passport, Driving Licence, or Certificate applications, document readiness, and reference tokens.
              </p>
              <button
                onClick={onOpenNewApplication}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-civic-900 text-white hover:bg-civic-800"
              >
                Track an Application
              </button>
            </div>
          ) : (
            applications.map((app) => {
              const docs = app.documents || [];
              const readyCount = docs.filter((d: any) => d.status === 'READY' || d.status === 'UPLOADED').length;
              const percent = docs.length > 0 ? Math.round((readyCount / docs.length) * 100) : 0;

              return (
                <div key={app.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {getStatusBadge(app.status)}
                        {app.application_reference_number && (
                          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            Ref: {app.application_reference_number}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          Applied: {app.applied_on || 'Not yet submitted'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{app.service_title}</h3>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {app.submission_portal_url && (
                        <a
                          href={app.submission_portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-500 hover:text-civic-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Open official portal"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-500" />
                          <span className="hidden sm:inline">Official Portal</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Next Action & Notes */}
                  <div className="p-5 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Next Action Required</span>
                      <p className="text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-slate-200">
                        {app.next_action || 'No pending action.'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Personal Notes</span>
                      <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 line-clamp-2">
                        {app.notes || 'No notes added.'}
                      </p>
                    </div>
                  </div>

                  {/* Document Checklist Readiness for this application */}
                  {docs.length > 0 && (
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-700">Document Preparation Readiness:</span>
                        <span className="text-civic-900 font-bold">{readyCount} / {docs.length} Ready ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {docs.map((doc: any) => (
                          <button
                            key={doc.id}
                            disabled={updatingDocId === doc.id}
                            onClick={() => handleDocStatusToggle(doc)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start justify-between gap-2 ${
                              doc.status === 'UPLOADED'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : doc.status === 'READY'
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <div className="truncate flex-1">
                              <span className="font-semibold block truncate">{doc.document_name}</span>
                              <span className="text-[10px] uppercase font-bold opacity-80 mt-0.5 block">
                                {doc.status.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[10px] mt-0.5">Click to toggle</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SAVED SERVICES */}
      {activeTab === 'saved' && (
        <div>
          {savedServices.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No saved services</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Click the bookmark icon on any government service card in the catalog to quickly access it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedServices.map((service) => (
                <div key={service.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-civic-700 uppercase">{service.category}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{service.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{service.short_summary}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onSelectService(service)}
                      className="text-xs font-bold text-civic-900 hover:text-civic-700 flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                    </button>

                    <button
                      onClick={() => onAskAi(service)}
                      className="text-xs text-amber-700 font-semibold hover:underline"
                    >
                      Ask AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
