import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User as UserIcon, ShieldCheck, 
  ExternalLink, X, RotateCcw, AlertTriangle, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { Language, DICTIONARY } from '../utils/i18n.js';
import { ApiService } from '../services/api.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  verificationBadge?: string;
  suggestedFollowUps?: string[];
  timestamp: string;
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  preloadedPrompt?: string;
  selectedService?: any;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  currentLang,
  preloadedPrompt,
  selectedService
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: currentLang === 'te' 
        ? 'నమస్కారం! నేను సివిక్‌గైడ్ AI – మీ ప్రభుత్వ సేవల సమాచార సహాయకుడిని. పాస్‌పోర్ట్, డ్రైవింగ్ లైసెన్స్, ఆదాయం, కుల ధ్రువీకరణ పత్రాలు, లేదా స్కాలర్‌షిప్‌ల గురించి ఏదైనా ప్రశ్న అడగండి.'
        : currentLang === 'hi'
        ? 'नमस्ते! मैं सिविकगाइड AI हूँ – आपका सरकारी प्रक्रिया सहायक। पासपोर्ट, ड्राइविंग लाइसेंस, आय, जाति प्रमाण पत्र, या छात्रवृत्ति से संबंधित अपना प्रश्न पूछें।'
        : 'Hello! I am CivicGuide AI – your government process assistant. Ask me anything about applying for a passport, driving licence, certificates, voter ID, or scholarships. All answers are verified against official government sources.',
      verificationBadge: 'VERIFIED_OFFICIAL',
      suggestedFollowUps: currentLang === 'te'
        ? ['ఆదాయ ధ్రువీకరణ పత్రానికి ఏ డాక్యుమెంట్లు కావాలి?', 'డ్రైవింగ్ లైసెన్స్ ఆన్‌లైన్‌లో ఎలా దరఖాస్తు చేయాలి?', 'తత్కాల్ పాస్‌పోర్ట్ ఫీజు ఎంత?']
        : currentLang === 'hi'
        ? ['आय प्रमाण पत्र के लिए कौन से दस्तावेज चाहिए?', 'ड्राइविंग लाइसेंस ऑनलाइन कैसे बनाएं?', 'तत्काल पासपोर्ट का शुल्क कितना है?']
        : ['What documents do I need for an income certificate?', 'How to apply for driving licence online?', 'What is the Tatkaal passport fee and timeline?'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (preloadedPrompt && isOpen) {
      handleSend(preloadedPrompt);
    }
  }, [preloadedPrompt, isOpen]);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!queryToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await ApiService.askAi(query, {
        serviceId: selectedService?.id,
        state: selectedService?.state || 'Telangana',
        language: currentLang
      });

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        verificationBadge: response.verificationBadge,
        suggestedFollowUps: response.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ I encountered an issue retrieving verified government data. Please verify your connection or try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="bg-civic-900 text-white p-4 px-5 border-b border-civic-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>CivicGuide AI</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Assistant
              </span>
            </h3>
            <p className="text-[11px] text-slate-300">Grounded in official government rules</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            title="Reset conversation"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-civic-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-civic-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50/80 px-4 py-2 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="leading-snug">
          CivicGuide AI provides simplified explanations from official portals. Never pay unauthorized touts.
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-civic-900 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-xs mt-1">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-civic-900 text-white rounded-br-xs shadow-sm'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
            }`}>
              {/* Formatted Text */}
              <div className="whitespace-pre-line prose-xs">
                {msg.content}
              </div>

              {/* Cited Sources Card */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Sources Cited ({msg.sources.length}):</span>
                  </div>

                  <div className="space-y-1">
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700 transition-colors"
                      >
                        <span className="truncate font-medium">{src.title || src.authority}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up suggestions */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {msg.suggestedFollowUps.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 text-slate-600 border border-slate-200 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <div className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs shadow-xs mt-1">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-civic-900 text-white flex items-center justify-center flex-shrink-0 text-xs">
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 px-4 shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-civic-600 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-civic-600 animate-pulse delay-75"></span>
              <span className="w-2 h-2 rounded-full bg-civic-600 animate-pulse delay-150"></span>
              <span>Retrieving verified government facts...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about required documents, fees, or steps..."
            className="flex-1 py-2.5 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-500 focus:bg-white transition-all"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-civic-900 text-white hover:bg-civic-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            aria-label="Send Message"
          >
            <Send className="w-4 h-4 text-amber-400" />
          </button>
        </form>
      </div>
    </div>
  );
};
