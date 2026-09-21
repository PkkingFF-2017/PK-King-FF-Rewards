import React, { useState } from 'react';
import { History, Copy, CheckCircle2, ExternalLink, Gift, Clock, ShieldCheck } from 'lucide-react';
import { RedeemedCode, Language } from '../types';
import { sound } from '../utils/audio';

interface HistoryViewProps {
  codes: RedeemedCode[];
  lang: Language;
  onGoToStore: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ codes, lang, onGoToStore }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    sound.playCoin();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" />
            {lang === 'hi' ? 'मेरे रिडीम कोड और इतिहास' : 'My Redeemed Codes & History'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === 'hi'
              ? 'यहाँ आपके द्वारा जीते गए सभी कूपन कोड सुरक्षित हैं'
              : 'All your redeemed gift codes and payout records are saved here'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>{codes.length} {lang === 'hi' ? 'कोड उपलब्ध' : 'Codes Available'}</span>
        </div>
      </div>

      {codes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Gift className="w-8 h-8" />
          </div>
          <p className="text-slate-400 text-sm font-semibold mb-3">
            {lang === 'hi' ? 'अभी तक कोई कोड रिडीम नहीं किया है' : 'No codes redeemed yet'}
          </p>
          <button
            onClick={onGoToStore}
            className="px-5 py-2.5 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
          >
            {lang === 'hi' ? 'रिडीम स्टोर देखें' : 'Visit Redeem Store'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-400/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-sm sm:text-base">
                        {item.title}
                      </h4>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          item.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {item.status === 'pending' 
                          ? (lang === 'hi' ? 'प्रक्रियाधीन (12-24h)' : 'Processing') 
                          : (lang === 'hi' ? 'सक्रिय / तैयार' : 'Ready')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">{item.coinCost.toLocaleString()} Coins</span>
                      {item.userGoogleId && (
                        <>
                          <span>•</span>
                          <span className="text-blue-300 font-mono text-[11px] bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/20">
                            {item.userGoogleId}
                          </span>
                        </>
                      )}
                    </div>
                    {item.note && (
                      <div className="text-[11px] text-amber-300/80 mt-1 italic">
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>

                {item.status === 'pending' ? (
                  <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'hi' ? 'असली कोड सत्यापन व डिलीवरी' : 'Real Code Verification'}</span>
                    </div>
                    <span className="text-[10px] text-slate-300">
                      {lang === 'hi' ? '12-24h में आपके WhatsApp/Email पर आएगा' : 'Delivering to your WhatsApp/Email'}
                    </span>
                  </div>
                ) : (
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 bg-slate-900/80 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-slate-700">
                    <span className="font-mono text-xs sm:text-sm font-black text-amber-300 select-all tracking-wider px-2">
                      {item.code}
                    </span>
                    <button
                      onClick={() => copyCode(item.id, item.code)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 transition-all shadow-sm flex-shrink-0"
                    >
                      {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? (lang === 'hi' ? 'कॉपी हुआ' : 'Copied') : (lang === 'hi' ? 'कॉपी करें' : 'Copy')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Guide section */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-amber-400" />
          {lang === 'hi' ? 'गूगल प्ले स्टोर में कोड रिडीम करने का आसान तरीका:' : 'How to redeem on Google Play Store:'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="font-bold text-amber-400 block mb-1">1. Play Store खोलें</span>
            {lang === 'hi' ? 'अपने फोन पर Google Play Store ऐप ओपन करें।' : 'Open Google Play Store on your Android phone.'}
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="font-bold text-amber-400 block mb-1">2. प्रोफाइल और पेमेंट</span>
            {lang === 'hi' ? 'प्रोफाइल आइकन पर टैप करें और "Payments & subscriptions" चुनें।' : 'Tap profile icon > Payments & subscriptions.'}
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="font-bold text-amber-400 block mb-1">3. कोड पेस्ट करें</span>
            {lang === 'hi' ? '"Redeem code" पर टैप करें और ऊपर से कॉपी किया कोड पेस्ट करें!' : 'Tap "Redeem code" and paste the copied code to get balance!'}
          </div>
        </div>
      </div>
    </div>
  );
};
