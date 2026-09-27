import React, { useState } from 'react';
import { Bell, Plus, Calendar, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import { ApiService } from '../services/api.js';

interface RemindersViewProps {
  reminders: any[];
  services: any[];
  onRefresh: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  services,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !reminderDate) return;
    setIsSubmitting(true);
    try {
      const srv = services.find(s => s.id === selectedServiceId);
      await ApiService.createReminder({
        title,
        reminder_date: reminderDate,
        service_id: selectedServiceId || undefined,
        service_title: srv?.title || 'Civic Reminder',
        notes
      });
      setTitle('');
      setNotes('');
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await ApiService.toggleReminder(id, !currentStatus);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ApiService.deleteReminder(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Citizen Reminders</h2>
          </div>
          <p className="text-xs text-slate-500">
            Never miss licence renewals, scholarship deadlines, or certificate expiration milestones.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-civic-900 text-white hover:bg-civic-800 text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>New Reminder</span>
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No reminders set</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Set alerts for driving licence renewals, caste certificate updates, or application deadlines.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-civic-900 text-white hover:bg-civic-800"
          >
            Create Your First Reminder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                rem.is_completed ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] font-semibold text-civic-700 bg-civic-50 px-2.5 py-0.5 rounded-md border border-civic-200">
                    {rem.service_title || 'Government Process'}
                  </span>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className={`text-base font-bold ${rem.is_completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {rem.title}
                </h4>

                {rem.notes && (
                  <p className="text-xs text-slate-600 mt-1">{rem.notes}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due: <strong className="text-slate-800">{rem.reminder_date}</strong>
                </span>

                <button
                  onClick={() => handleToggle(rem.id, rem.is_completed)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    rem.is_completed
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{rem.is_completed ? 'Mark Incomplete' : 'Mark Completed'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-civic-900 text-white p-5 border-b border-civic-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Create Civic Reminder</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reminder Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Remind me to renew my driving licence"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reminder Date</label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Linked Service (Optional)</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                >
                  <option value="">None / General Reminder</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Action Details</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any details (e.g. valid till Nov 2026, medical test required)"
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-civic-900 text-white hover:bg-civic-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Creating...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
