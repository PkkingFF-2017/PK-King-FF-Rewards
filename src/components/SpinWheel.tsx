import React, { useState, useRef } from 'react';
import { Sparkles, RotateCw, Ticket, Trophy, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface SpinWheelProps {
  spinTickets: number;
  coins: number;
  lang: Language;
  onSpinWin: (coinsWon: number) => void;
  onBuyTicket: (cost: number) => void;
  onWatchAdForTickets?: () => void;
}

const SEGMENTS = [
  { label: '5 Coins', value: 5, color: '#f59e0b', textColor: '#0f172a' },
  { label: '10 Coins', value: 10, color: '#10b981', textColor: '#0f172a' },
  { label: '8 Coins', value: 8, color: '#3b82f6', textColor: '#ffffff' },
  { label: '25 JACKPOT', value: 25, color: '#ec4899', textColor: '#ffffff' },
  { label: '12 Coins', value: 12, color: '#8b5cf6', textColor: '#ffffff' },
  { label: '6 Coins', value: 6, color: '#f97316', textColor: '#ffffff' },
  { label: '15 Coins', value: 15, color: '#06b6d4', textColor: '#0f172a' },
  { label: '10 Coins', value: 10, color: '#eab308', textColor: '#0f172a' },
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
  spinTickets,
  coins,
  lang,
  onSpinWin,
  onBuyTicket,
  onWatchAdForTickets,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [lastWon, setLastWon] = useState<number | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  const numSegments = SEGMENTS.length;
  const segmentAngle = 360 / numSegments;

  const handleSpin = () => {
    if (spinning || spinTickets <= 0) return;

    setSpinning(true);
    setLastWon(null);

    // Pick random segment
    const targetIndex = Math.floor(Math.random() * numSegments);
    const winningReward = SEGMENTS[targetIndex];

    // Pointer is at the top (270 degrees or -90 degrees in standard circle)
    // To land on index `targetIndex`, wheel must rotate such that target center aligns with top pointer.
    // Index center is: targetIndex * segmentAngle + segmentAngle / 2
    const centerOfTarget = targetIndex * segmentAngle + segmentAngle / 2;
    
    // Top is 0 / 360 or 270 depending on SVG orientation.
    // If 0 deg is top:
    const baseSpins = 360 * 5; // 5 full rotations
    // Wheel rotates clockwise: to bring angle `centerOfTarget` to 0 deg (top), we rotate `360 - centerOfTarget`
    const targetRotation = currentRotation + baseSpins + (360 - (centerOfTarget % 360));

    setCurrentRotation(targetRotation);

    // Play tick sounds during spin
    let tickCount = 0;
    const interval = window.setInterval(() => {
      sound.playTick();
      tickCount++;
      if (tickCount > 25) {
        clearInterval(interval);
      }
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setSpinning(false);
      setLastWon(winningReward.value);
      sound.playWin();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onSpinWin(winningReward.value);
    }, 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <RotateCw className="w-6 h-6 text-amber-400" />
            {lang === 'hi' ? 'लकी स्पिन व्हील' : 'Lucky Spin Wheel'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === 'hi'
              ? 'व्हील घुमाएं और 100 सिक्के तक का बंपर जैकपॉट जीतें!'
              : 'Spin the wheel to win up to 100 Jackpot coins!'}
          </p>
        </div>

        {/* Tickets Available */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-2xl">
          <Ticket className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <div className="text-xs text-slate-400 font-medium">
              {lang === 'hi' ? 'स्पिन टिकट्स' : 'Spin Tickets'}
            </div>
            <div className="text-base font-black text-white">
              {spinTickets} {lang === 'hi' ? 'बचे हैं' : 'Left'}
            </div>
          </div>
        </div>
      </div>

      {/* Wheel Visual Container */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 select-none">
          {/* Wheel Pointer at TOP */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-8 h-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400" />
          </div>

          {/* Glowing outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-400/20 to-purple-500/20 blur-md" />

          {/* SVG Rotating Wheel */}
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full rounded-full shadow-[0_0_40px_rgba(0,0,0,0.6)] border-4 border-amber-400/60"
            style={{
              transform: `rotate(${currentRotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none',
            }}
          >
            {SEGMENTS.map((seg, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = (i + 1) * segmentAngle;

              // Convert polar to cartesian
              const r = 145;
              const cx = 150;
              const cy = 150;

              const x1 = cx + r * Math.cos((Math.PI * (startAngle - 90)) / 180);
              const y1 = cy + r * Math.sin((Math.PI * (startAngle - 90)) / 180);
              const x2 = cx + r * Math.cos((Math.PI * (endAngle - 90)) / 180);
              const y2 = cy + r * Math.sin((Math.PI * (endAngle - 90)) / 180);

              const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

              // Text position along middle of wedge
              const midAngle = startAngle + segmentAngle / 2;
              const textR = 95;
              const tx = cx + textR * Math.cos((Math.PI * (midAngle - 90)) / 180);
              const ty = cy + textR * Math.sin((Math.PI * (midAngle - 90)) / 180);

              return (
                <g key={i}>
                  <path d={pathData} fill={seg.color} stroke="#0f172a" strokeWidth="2.5" />
                  <text
                    x={tx}
                    y={ty}
                    fill={seg.textColor}
                    fontSize={seg.value === 100 ? '11' : '12'}
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                  >
                    {seg.value === 100 ? '⭐ 100' : `${seg.value}`}
                  </text>
                </g>
              );
            })}

            {/* Center Golden Knob */}
            <circle cx="150" cy="150" r="28" fill="#0f172a" stroke="#fbbf24" strokeWidth="4" />
            <circle cx="150" cy="150" r="20" fill="#f59e0b" />
          </svg>

          {/* Center Spin Icon Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Sparkles className="w-6 h-6 text-slate-950 animate-pulse" />
          </div>
        </div>

        {/* Won Announcement */}
        {lastWon !== null && !spinning && (
          <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-400 rounded-2xl flex items-center gap-3 animate-bounce">
            <Trophy className="w-6 h-6 text-emerald-400" />
            <span className="font-extrabold text-emerald-300 text-sm sm:text-base">
              {lang === 'hi'
                ? `बधाई हो! आपने ${lastWon} सिक्के जीते!`
                : `Congratulations! You won ${lastWon} Coins!`}
            </span>
          </div>
        )}

        {/* Spin Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <button
            onClick={handleSpin}
            disabled={spinning || spinTickets <= 0}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              spinning || spinTickets <= 0
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:scale-105 active:scale-95 text-slate-950 shadow-amber-500/30'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
            {spinning
              ? lang === 'hi'
                ? 'व्हील घूम रहा है...'
                : 'Spinning...'
              : spinTickets > 0
              ? lang === 'hi'
                ? 'व्हील घुमाएं (1 टिकट)'
                : 'Spin Now (1 Ticket)'
              : lang === 'hi'
              ? 'टिकट खत्म हो गए'
              : 'No Tickets Left'}
          </button>

          {/* Buy or Free Ticket option */}
          {spinTickets === 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {onWatchAdForTickets && (
                <button
                  onClick={onWatchAdForTickets}
                  className="w-full sm:w-auto text-xs font-black py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  {lang === 'hi' ? '⚡ 3 फ्री टिकट्स लें (छोटा Ad)' : '⚡ 3 Free Tickets (Short Ad)'}
                </button>
              )}
              <button
                onClick={() => onBuyTicket(10)}
                disabled={coins < 10}
                className={`w-full sm:w-auto text-xs font-bold py-3 px-4 rounded-xl border flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                  coins >= 10
                    ? 'bg-slate-800 hover:bg-slate-700 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Gift className="w-4 h-4" />
                {lang === 'hi' ? '+1 टिकट लें (10 सिक्के)' : '+1 Ticket (10 Coins)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
