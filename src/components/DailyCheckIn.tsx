import React, { useState } from 'react';
import { Calendar, CheckCircle2, Gift, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface DailyCheckInProps {
  streakDay: number;
  lastCheckInDate: string | null;
  lang: Language;
  onClaim: (coins: number, newStreak: number) => void;
}

const STREAK_REWARDS = [
  { day: 1, coins: 10 },
  { day: 2, coins: 15 },
  { day: 3, coins: 20 },
  { day: 4, coins: 25 },
  { day: 5, coins: 30 },
  { day: 6, coins: 40 },
  { day: 7, coins: 50, mega: true },
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  streakDay,
  lastCheckInDate,
  lang,
  onClaim,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyClaimedToday = lastCheckInDate === todayStr;

  const currentActiveDay = alreadyClaimedToday ? streakDay : (streakDay > 7 ? 1 : streakDay);
  const todayReward = STREAK_REWARDS.find((r) => r.day === currentActiveDay) || STREAK_REWARDS[0];

  const handleClaimToday = () => {
    if (alreadyClaimedToday) return;

    sound.playWin();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });

    const nextStreak = currentActiveDay >= 7 ? 1 : currentActiveDay + 1;
    onClaim(todayReward.coins, nextStreak);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
              {lang === 'hi' ? 'दैनिक हाजिरी बोनस' : 'Daily Check-in Bonus'}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {lang === 'hi' ? `दिन ${currentActiveDay}` : `Day ${currentActiveDay}`}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'hi'
                ? 'रोज़ाना आकर सिक्के कलेक्ट करें और 7वें दिन मेगा बॉक्स पाएं!'
                : 'Check-in daily to build streak and unlock the Day 7 Mega Box!'}
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimToday}
          disabled={alreadyClaimedToday}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            alreadyClaimedToday
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/20'
          }`}
        >
          {alreadyClaimedToday ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'आज का क्लेम हो गया' : 'Claimed for Today'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>
                {lang === 'hi' ? `+${todayReward.coins} सिक्के पाएं` : `Claim +${todayReward.coins} Coins`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 7 Days Row */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {STREAK_REWARDS.map((item) => {
          const isPast = item.day < currentActiveDay || (alreadyClaimedToday && item.day === currentActiveDay);
          const isCurrent = item.day === currentActiveDay && !alreadyClaimedToday;

          return (
            <div
              key={item.day}
              className={`flex flex-col items-center justify-between p-2 rounded-xl text-center border transition-all ${
                isCurrent
                  ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10 scale-105 ring-2 ring-amber-400/40'
                  : isPast
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {lang === 'hi' ? `दिन ${item.day}` : `Day ${item.day}`}
              </span>

              <div className="my-1">
                {item.mega ? (
                  <Gift className={`w-5 h-5 ${isCurrent ? 'text-amber-300 animate-bounce' : 'text-amber-400'}`} />
                ) : isPast ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span className="text-xs font-black text-amber-300">🪙</span>
                )}
              </div>

              <span className={`text-xs font-black ${isCurrent ? 'text-amber-300' : isPast ? 'text-emerald-400' : 'text-slate-300'}`}>
                +{item.coins}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
