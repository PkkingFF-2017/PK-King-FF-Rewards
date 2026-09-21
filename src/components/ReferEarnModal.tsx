import React, { useState } from 'react';
import { Users, Copy, CheckCircle2, Share2, Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface ReferEarnModalProps {
  referralCode: string;
  referralCount: number;
  lang: Language;
  onSimulateReferral: () => void;
  onClose: () => void;
}

export const ReferEarnModal: React.FC<ReferEarnModalProps> = ({
  referralCode,
  referralCount,
  lang,
  onSimulateReferral,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    sound.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = lang === 'hi'
      ? `भाई इस ऐप पर फ्री Google Play रिडीम कोड और UPI कैश मिल रहा है! मेरा रेफरल कोड ${referralCode} इस्तेमाल करो और 150 सिक्के तुरंत पाओ!`
      : `Get Free Google Play Redeem Codes & UPI Cash! Use my referral code ${referralCode} to get 150 bonus coins immediately!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white mb-1">
            {lang === 'hi' ? 'दोस्तों को रेफर करें और कमाएं' : 'Refer & Earn 100 Coins'}
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            {lang === 'hi'
              ? 'हर दोस्त को इनवाइट करने पर आपको 100 सिक्के और आपके दोस्त को 150 सिक्के मिलेंगे!'
              : 'Earn 100 bonus coins for every friend who joins using your unique code!'}
          </p>

          {/* Referral Code Box */}
          <div className="bg-slate-800 border-2 border-dashed border-amber-500/60 rounded-2xl p-4 flex items-center justify-between gap-3 mb-4 shadow-inner">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {lang === 'hi' ? 'आपका रेफरल कोड' : 'YOUR CODE'}
              </span>
              <span className="text-xl font-mono font-black text-amber-300 tracking-widest">
                {referralCode}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (lang === 'hi' ? 'कॉपी हुआ' : 'Copied') : (lang === 'hi' ? 'कॉपी' : 'Copy')}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 block">{lang === 'hi' ? 'कुल दोस्त' : 'Total Friends'}</span>
              <span className="text-lg font-black text-white">{referralCount}</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 block">{lang === 'hi' ? 'रेफरल कमाई' : 'Total Earned'}</span>
              <span className="text-lg font-black text-amber-300">{referralCount * 100} Coins</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{lang === 'hi' ? 'व्हाट्सएप पर शेयर करें' : 'Share on WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
