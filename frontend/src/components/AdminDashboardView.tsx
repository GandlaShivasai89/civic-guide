import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Plus, CheckCircle2, AlertTriangle, 
  ExternalLink, Edit3, History, Search, RefreshCw, X 
} from 'lucide-react';
import { ApiService } from '../services/api.js';

interface AdminDashboardViewProps {
  services: any[];
  onRefreshServices: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  services,
  onRefreshServices
}) => {
  const [stats, setStats] = useState<any>({
    totalServices: services.length,
    verifiedServices: services.filter(s => s.verification_status === 'VERIFIED').length,
    pendingReview: services.filter(s => s.verification_status === 'NEEDS_VERIFICATION').length,
    conflictingSources: services.filter(s => s.verification_status === 'CONFLICTING').length,
    totalAuditRecords: 0
  });

  const [auditRecords, setAuditRecords] = useState<any[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'audit'>('services');

  // Verify Action Modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<'VERIFIED' | 'NEEDS_VERIFICATION' | 'CONFLICTING'>('VERIFIED');
  const [findings, setFindings] = useState('');
  const [sourceUrlChecked, setSourceUrlChecked] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Service Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Identity & Citizenship');
  const [newState, setNewState] = useState('Telangana');
  const [newOfficialUrl, setNewOfficialUrl] = useState('');
  const [newFees, setNewFees] = useState('');
  const [newProcessingTime, setNewProcessingTime] = useState('15 working days');
  const [newDescription, setNewDescription] = useState('');
  const [newEligibility, setNewEligibility] = useState('');

  const fetchStats = async () => {
    try {
      const s = await ApiService.getAdminStats();
      if (s) setStats(s);
      const audits = await ApiService.getVerificationHistory();
      setAuditRecords(audits);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [services]);

  const handleOpenVerify = (srv: any) => {
    setSelectedService(srv);
    setNewStatus(srv.verification_status || 'VERIFIED');
    setSourceUrlChecked(srv.official_url || '');
    setFindings('');
    setVerifyModalOpen(true);
  };

  const handleExecuteVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !findings) return;
    setIsSubmitting(true);
    try {
      await ApiService.recordVerificationAction(selectedService.id, {
        status: newStatus,
        findings,
        source_url: sourceUrlChecked
      });
      setVerifyModalOpen(false);
      onRefreshServices();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newOfficialUrl) return;
    setIsSubmitting(true);
    try {
      await ApiService.createAdminService({
        title: newTitle,
        category: newCategory,
        state: newState,
        official_url: newOfficialUrl,
        fee_structure: newFees || 'Statutory Fee: Refer to Official Portal',
        processing_time: newProcessingTime,
        description: newDescription || newTitle,
        short_summary: newDescription || newTitle,
        eligibility_criteria: newEligibility || 'Indian citizen meeting jurisdictional rules'
      });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewOfficialUrl('');
      setNewFees('');
      setNewDescription('');
      setNewEligibility('');
      onRefreshServices();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.service_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-purple-500/20 text-purple-300">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">Government Information Verification Console</h2>
          </div>
          <p className="text-xs text-slate-300">
            Audit official gazette notices, certify authoritative sources, and update document checklists.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Government Service</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Services</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalServices}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Verified Official</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">{stats.verifiedServices}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Pending Review</span>
          <p className="text-2xl font-black text-amber-800 mt-1">{stats.pendingReview}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20">
          <span className="text-[11px] font-bold text-purple-700 uppercase">Audit Records</span>
          <p className="text-2xl font-black text-purple-800 mt-1">{auditRecords.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'services' ? 'border-purple-600 text-purple-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Services Verification Table
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'audit' ? 'border-purple-600 text-purple-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit History Trail ({auditRecords.length})
        </button>
      </div>

      {/* Services Table */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter services by name, code or state..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={() => { onRefreshServices(); fetchStats(); }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-3.5 pl-5">Service Title & Code</th>
                  <th className="p-3.5">Jurisdiction</th>
                  <th className="p-3.5">Last Verified</th>
                  <th className="p-3.5">Official Source</th>
                  <th className="p-3.5">Verification Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-slate-900">{srv.title}</div>
                      <span className="text-[10px] font-mono text-slate-500">{srv.service_code}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {srv.state}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-slate-600">
                      {srv.last_verified}
                    </td>

                    <td className="p-3.5">
                      <a
                        href={srv.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-civic-700 hover:underline flex items-center gap-1 font-medium truncate max-w-xs"
                      >
                        <span className="truncate">{srv.official_url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>

                    <td className="p-3.5">
                      {srv.verification_status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : srv.verification_status === 'CONFLICTING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          Conflicting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          Needs Review
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleOpenVerify(srv)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors"
                      >
                        Verify / Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4 text-purple-600" />
            <span>Official Verification Audit History</span>
          </h3>

          <div className="space-y-3">
            {auditRecords.map((rec) => (
              <div key={rec.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rec.status}
                    </span>
                    <span className="font-semibold text-slate-800">Service: {rec.service_id}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{new Date(rec.verified_at).toLocaleString()}</span>
                </div>

                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 mt-1">
                  <strong>Findings:</strong> {rec.findings}
                </p>

                <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                  <span>URL Inspected:</span>
                  <a href={rec.source_url_checked} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline truncate">
                    {rec.source_url_checked}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verify Action Modal */}
      {verifyModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Record Verification Action</h3>
              <button onClick={() => setVerifyModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteVerification} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-900 text-sm">{selectedService.title}</p>
                <p className="text-xs text-slate-500">Current Status: {selectedService.verification_status}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Verification Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="VERIFIED">✅ Verified (Matches Official Gazette / Portal)</option>
                  <option value="NEEDS_VERIFICATION">⚠️ Needs Verification / Pending Official Check</option>
                  <option value="CONFLICTING">❌ Conflicting Information Detected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Government Source URL Checked</label>
                <input
                  type="url"
                  value={sourceUrlChecked}
                  onChange={(e) => setSourceUrlChecked(e.target.value)}
                  required
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Findings & Notes</label>
                <textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  required
                  placeholder="Summarize regulatory findings, fee confirmation, and gazette notification reference."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Audit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Service Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-purple-900 text-white p-5 border-b border-purple-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Add Government Service</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-6 space-y-4 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Domicile Certificate Telangana"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Identity & Citizenship">Identity & Citizenship</option>
                    <option value="Civil Registration">Civil Registration</option>
                    <option value="Transport & Driving">Transport & Driving</option>
                    <option value="Revenue & Certificates">Revenue & Certificates</option>
                    <option value="Welfare & Schemes">Welfare & Schemes</option>
                    <option value="Education & Scholarships">Education & Scholarships</option>
                    <option value="Business & Taxation">Business & Taxation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="All-India">All-India</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Portal URL *</label>
                <input
                  type="url"
                  value={newOfficialUrl}
                  onChange={(e) => setNewOfficialUrl(e.target.value)}
                  required
                  placeholder="https://...gov.in"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Fee Structure</label>
                  <input
                    type="text"
                    value={newFees}
                    onChange={(e) => setNewFees(e.target.value)}
                    placeholder="e.g. ₹45 User charge"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Processing Time</label>
                  <input
                    type="text"
                    value={newProcessingTime}
                    onChange={(e) => setNewProcessingTime(e.target.value)}
                    placeholder="e.g. 7-15 working days"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Full description of the government service..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  value={newEligibility}
                  onChange={(e) => setNewEligibility(e.target.value)}
                  placeholder="Who is eligible to apply..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
