import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Sparkles, Volume2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface ShortAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (coins: number) => void;
  lang: Language;
}

const SPONSORS = [
  {
    title: 'Google Play Special ₹50 Cashback',
    tag: 'Official Partner',
    color: 'from-emerald-600 to-teal-800',
    descHi: 'Google Play Store पर नए गेम्स और ऐप्स के लिए खास डिस्काउंट ऑफर!',
    descEn: 'Exclusive discounts on top games and apps on Google Play Store!',
    ctaHi: 'ऑफर देखें',
    ctaEn: 'View Offer',
  },
  {
    title: 'PhonePe Instant UPI Cash Rewards',
    tag: 'Sponsored Ad',
    color: 'from-indigo-600 to-purple-800',
    descHi: 'हर UPI ट्रांसफर पर पाएं सीधा कैशबैक और रिवार्ड कूपन!',
    descEn: 'Get instant cashback and discount vouchers on every transaction!',
    ctaHi: 'पे करें',
    ctaEn: 'Pay Now',
  },
  {
    title: 'Top Free Games & BGMI Diamonds',
    tag: 'Gaming Ad',
    color: 'from-rose-600 to-red-800',
    descHi: 'भारत के नंबर-1 गेमिंग ऐप पर फ्री डायमंड्स और रिवार्ड्स जीतें!',
    descEn: 'Win free in-game diamonds and battle pass vouchers!',
    ctaHi: 'अभी खेलें',
    ctaEn: 'Play Now',
  },
];

export const ShortAdModal: React.FC<ShortAdModalProps> = ({
  isOpen,
  onClose,
  onReward,
  lang,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [sponsorIndex, setSponsorIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(5);
      setCanClose(false);
      setSponsorIndex(Math.floor(Math.random() * SPONSORS.length));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (secondsLeft <= 0) {
      setCanClose(true);
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isOpen, secondsLeft]);

  if (!isOpen) return null;

  const currentSponsor = SPONSORS[sponsorIndex];

  const handleClaimReward = () => {
    sound.playWin();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    onReward(10);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Ad Header Bar */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
              AD
            </span>
            <span className="text-slate-400 font-medium">
              {lang === 'hi' ? 'स्पॉन्सर विज्ञापन' : 'Sponsored Reward Ad'}
            </span>
          </div>

          {/* Countdown or Close Button */}
          {canClose ? (
            <button
              onClick={handleClaimReward}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 animate-pulse"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? '10 सिक्के लें ✕' : 'Claim 10 Coins ✕'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>
                {lang === 'hi' ? `रुकिए: ${secondsLeft}s` : `Wait: ${secondsLeft}s`}
              </span>
            </div>
          )}
        </div>

        {/* Ad Visual Stage */}
        <div className={`p-6 bg-gradient-to-br ${currentSponsor.color} text-white space-y-4 relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-black/30 border border-white/20">
              {currentSponsor.tag}
            </span>
            <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              +10 Coins Guaranteed
            </span>
          </div>

          <div className="py-4 space-y-2">
            <h3 className="text-xl font-black leading-tight drop-shadow-sm">
              {currentSponsor.title}
            </h3>
            <p className="text-xs text-white/90 leading-relaxed drop-shadow-sm">
              {lang === 'hi' ? currentSponsor.descHi : currentSponsor.descEn}
            </p>
          </div>

          {/* Simulated In-Ad Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] text-white/80 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'hi' ? 'सुरक्षित विज्ञापन' : 'Verified Ad'}</span>
            </div>
            <span className="text-xs font-black bg-white text-slate-950 px-4 py-1.5 rounded-xl shadow">
              {lang === 'hi' ? currentSponsor.ctaHi : currentSponsor.ctaEn} →
            </span>
          </div>
        </div>

        {/* Bottom Reward Action Info */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center space-y-3">
          <div className="text-xs text-slate-300">
            {canClose ? (
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {lang === 'hi' ? 'विज्ञापन पूरा हुआ! नीचे क्लिक करके 10 सिक्के क्लेम करें:' : 'Ad Complete! Click below to collect your 10 coins:'}
              </span>
            ) : (
              <span className="text-slate-400">
                {lang === 'hi'
                  ? `कृपया विज्ञापन पूरा होने तक रुकें (${secondsLeft} सेकंड)`
                  : `Please wait until the ad finishes (${secondsLeft}s)`}
              </span>
            )}
          </div>

          <button
            onClick={handleClaimReward}
            disabled={!canClose}
            className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              canClose
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 hover:scale-[1.02] active:scale-95 shadow-emerald-500/30 ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {canClose
                ? lang === 'hi'
                  ? '🎉 10 सिक्के खाते में जोड़ें (Claim Now)'
                  : '🎉 Collect 10 Coins Now'
                : lang === 'hi'
                ? `रुकिए... (${secondsLeft}s)`
                : `Wait... (${secondsLeft}s)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
