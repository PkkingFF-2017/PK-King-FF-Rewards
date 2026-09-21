import React, { useState, useEffect } from 'react';
import { PlayCircle, Award, CheckCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface WatchEarnProps {
  lang: Language;
  onRewardClaim: (coins: number) => void;
}

export const WatchEarn: React.FC<WatchEarnProps> = ({ lang, onRewardClaim }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    let timer: number | null = null;
    if (isPlaying && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isPlaying && countdown === 0) {
      setIsPlaying(false);
      setClaimed(true);
      sound.playWin();
      confetti({
        particleCount: 60,
        spread: 50,
      });
      onRewardClaim(10);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, countdown]);

  const handleStart = () => {
    setIsPlaying(true);
    setCountdown(5);
    setClaimed(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 flex-shrink-0">
          <PlayCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            {lang === 'hi' ? 'छोटा वीडियो विज्ञापन देखें' : 'Watch Short Video Ad'}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              +10 Coins
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'hi'
              ? 'सिर्फ 5 सेकंड का वीडियो विज्ञापन देखकर 10 सिक्के अर्जित करें'
              : 'Watch a 5-second reward video to earn 10 coins'}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        {isPlaying ? (
          <div className="flex items-center gap-2 bg-slate-800 border border-amber-500/40 px-4 py-2.5 rounded-xl text-amber-300 font-bold text-sm justify-center">
            <Clock className="w-4 h-4 animate-spin text-amber-400" />
            <span>
              {lang === 'hi' ? `रुकिए... ${countdown}s` : `Wait... ${countdown}s`}
            </span>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{lang === 'hi' ? 'विज्ञापन देखें (+10)' : 'Watch Ad (+10)'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
