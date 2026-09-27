import React from 'react';
import { 
  ShieldCheck, AlertTriangle, Clock, CreditCard, 
  ExternalLink, Bookmark, CheckSquare, Sparkles, Building2, MapPin
} from 'lucide-react';
import { Language, DICTIONARY } from '../utils/i18n.js';

interface ServiceCardProps {
  service: any;
  currentLang: Language;
  onSelect: (service: any) => void;
  onAskAi: (service: any) => void;
  isSaved?: boolean;
  onToggleSave?: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  currentLang,
  onSelect,
  onAskAi,
  isSaved = false,
  onToggleSave
}) => {
  const t = DICTIONARY[currentLang];

  const isVerified = service.verification_status === 'VERIFIED';
  const isConflicting = service.verification_status === 'CONFLICTING';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Top Banner & Department */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Building2 className="w-3 h-3 text-slate-500" />
              {service.department?.code || 'GOVT'}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-civic-50 text-civic-700 border border-civic-200">
              <MapPin className="w-3 h-3 text-civic-500" />
              {service.state}
            </span>

            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
              {service.application_mode}
            </span>
          </div>

          {onToggleSave && (
            <button
              onClick={() => onToggleSave(service.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-transparent'
              }`}
              title={isSaved ? 'Remove bookmark' : 'Bookmark service'}
              aria-label="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(service)}
          className="text-base font-bold text-slate-900 group-hover:text-civic-700 transition-colors cursor-pointer leading-snug line-clamp-2 mb-2"
        >
          {service.title}
        </h3>

        {/* Short Summary */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {service.short_summary || service.description}
        </p>

        {/* Verification Status Pill */}
        <div className="flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200/80 mb-3">
          {isVerified ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.verifiedBadge}</span>
            </div>
          ) : isConflicting ? (
            <div className="flex items-center gap-1.5 text-rose-700 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Conflicting Sources</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.needsVerificationBadge}</span>
            </div>
          )}

          <span className="text-slate-400 text-[10px]">
            {t.lastVerified}: {service.last_verified}
          </span>
        </div>

        {/* Key Metrics: Fee & Processing */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100">
          <div className="flex items-start gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">{t.fees}</span>
              <span className="font-semibold text-slate-800 text-[11px] line-clamp-1">{service.fee_structure.split(';')[0]}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">{t.processingTime}</span>
              <span className="font-semibold text-slate-800 text-[11px] line-clamp-1">{service.processing_time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 p-3 px-5 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(service)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-civic-900 text-white hover:bg-civic-800 transition-colors shadow-sm"
        >
          <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.viewDetails}</span>
        </button>

        <button
          onClick={() => onAskAi(service)}
          className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
          title={t.askAi}
          aria-label="Ask CivicGuide AI"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
        </button>

        <a
          href={service.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
          title="Open Official Government Portal"
          aria-label="Official Portal Link"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
        </a>
      </div>
    </div>
  );
};
