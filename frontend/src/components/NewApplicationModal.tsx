import React, { useState } from 'react';
import { X, FolderPlus, Building, Calendar, Hash, FileText } from 'lucide-react';
import { ApiService } from '../services/api.js';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: any[];
  preselectedService?: any;
  onCreated: () => void;
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  isOpen,
  onClose,
  services,
  preselectedService,
  onCreated
}) => {
  const [serviceId, setServiceId] = useState(preselectedService?.id || services[0]?.id || 'srv-passport');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [appliedOn, setAppliedOn] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('SUBMITTED');
  const [nextAction, setNextAction] = useState('Wait for verification');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ApiService.createApplication({
        service_id: serviceId,
        application_reference_number: referenceNumber,
        applied_on: appliedOn,
        status,
        next_action: nextAction,
        notes
      });
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-civic-900 text-white p-5 border-b border-civic-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Track Government Application</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Government Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Application / Reference / Token ID
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. TS009/LLR/2026/89421 or MS-TG-2026"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applied Date</label>
              <input
                type="date"
                value={appliedOn}
                onChange={(e) => setAppliedOn(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
              >
                <option value="DRAFT">Draft / Preparing Docs</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_SCRUTINY">Under Scrutiny / Verification</option>
                <option value="FIELD_VERIFICATION">Field / Police Verification</option>
                <option value="APPROVED">Approved / Dispatched</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Action Required</label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="e.g. Attend PSK slot on Oct 12 at 10:30 AM"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Personal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details to remember (e.g. counter token #4, officer asked for bank passbook)"
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-civic-900 text-white hover:bg-civic-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
