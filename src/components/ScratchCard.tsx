import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Trophy, RotateCcw, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface ScratchCardProps {
  scratchTickets: number;
  lang: Language;
  onScratchWin: (coinsWon: number) => void;
  onNewCardRequest: () => void;
  onWatchAdForCards?: () => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  scratchTickets,
  lang,
  onScratchWin,
  onNewCardRequest,
  onWatchAdForCards,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hiddenReward, setHiddenReward] = useState<number>(() => {
    const rewards = [5, 6, 8, 10, 12, 15];
    return rewards[Math.floor(Math.random() * rewards.length)];
  });

  const width = 280;
  const height = 180;

  // Initialize canvas with scratchable silver coating
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Silver metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#94a3b8');
    gradient.addColorStop(0.3, '#cbd5e1');
    gradient.addColorStop(0.5, '#e2e8f0');
    gradient.addColorStop(0.7, '#cbd5e1');
    gradient.addColorStop(1, '#94a3b8');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative pattern and text
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'hi' ? 'यहाँ स्क्रैच करें!' : 'SCRATCH HERE!', width / 2, height / 2 - 10);

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(lang === 'hi' ? 'सिक्के जीतने के लिए घिसें' : 'Swipe to reveal coins', width / 2, height / 2 + 15);

    // Border frame on canvas
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);
  };

  useEffect(() => {
    initCanvas();
  }, [lang]);

  const scratch = (clientX: number, clientY: number) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    sound.playScratch();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check scratch progress
    checkScratchProgress();
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const pixels = imgData.data;
      let transparentPixels = 0;
      const totalPixels = pixels.length / 4;

      // Sample every 8th pixel for performance
      for (let i = 3; i < pixels.length; i += 32) {
        if (pixels[i] === 0) {
          transparentPixels++;
        }
      }

      const ratio = transparentPixels / (totalPixels / 8);
      if (ratio > 0.42) {
        // Revealed!
        completeReveal();
      }
    } catch {
      // Ignore security/context issues
    }
  };

  const completeReveal = () => {
    if (revealed) return;
    setRevealed(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    }

    sound.playWin();
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.65 },
    });

    onScratchWin(hiddenReward);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching || revealed) return;
    const touch = e.touches[0];
    if (touch) {
      scratch(touch.clientX, touch.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching || revealed) return;
    scratch(e.clientX, e.clientY);
  };

  const startNewCard = () => {
    if (scratchTickets <= 0) return;
    const rewards = [5, 6, 8, 10, 12, 15, 20];
    setHiddenReward(rewards[Math.floor(Math.random() * rewards.length)]);
    setRevealed(false);
    initCanvas();
    onNewCardRequest();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            {lang === 'hi' ? 'लकी स्क्रैच कार्ड' : 'Lucky Scratch Card'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === 'hi'
              ? 'सिल्वर कोटिंग को अपनी उंगली या माउस से घिसें और सिक्के जीतें!'
              : 'Scratch off the silver cover to reveal secret bonus coins!'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-2xl">
          <Ticket className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <div className="text-xs text-slate-400 font-medium">
              {lang === 'hi' ? 'स्क्रैच कार्ड' : 'Scratch Cards'}
            </div>
            <div className="text-base font-black text-white">
              {scratchTickets} {lang === 'hi' ? 'बचे हैं' : 'Left'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center my-4">
        {/* The Card Container */}
        <div 
          className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/50"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* Underlying Hidden Reward Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 flex flex-col items-center justify-center p-4 select-none">
            <div className="w-12 h-12 rounded-full bg-slate-950/20 flex items-center justify-center mb-1">
              <Trophy className="w-7 h-7 text-slate-950" />
            </div>
            <span className="text-slate-950 text-xs font-bold uppercase tracking-wider">
              {lang === 'hi' ? 'आपने जीते' : 'YOU WON'}
            </span>
            <span className="text-4xl font-black text-slate-950 tracking-tight">
              +{hiddenReward}
            </span>
            <span className="text-slate-900 text-xs font-black">
              {lang === 'hi' ? 'सिक्के (Coins)' : 'Coins'}
            </span>
          </div>

          {/* Foreground Scratch Canvas Layer */}
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`absolute inset-0 cursor-crosshair touch-none transition-opacity duration-300 ${
              revealed ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
            onMouseDown={() => setIsScratching(true)}
            onMouseUp={() => setIsScratching(false)}
            onMouseLeave={() => setIsScratching(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsScratching(true)}
            onTouchEnd={() => setIsScratching(false)}
            onTouchMove={handleTouchMove}
          />
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {revealed ? (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={startNewCard}
                disabled={scratchTickets <= 0}
                className={`py-3 px-6 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg transition-all ${
                  scratchTickets > 0
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {scratchTickets > 0
                  ? lang === 'hi'
                    ? 'अगला कार्ड स्क्रैच करें (1 टिकट)'
                    : 'Scratch Next Card (1 Ticket)'
                  : lang === 'hi'
                  ? 'कार्ड खत्म हो गए'
                  : 'No Cards Left'}
              </button>

              {scratchTickets <= 0 && onWatchAdForCards && (
                <button
                  onClick={onWatchAdForCards}
                  className="py-3 px-5 rounded-2xl font-black text-xs bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{lang === 'hi' ? '⚡ 3 फ्री कार्ड्स लें (छोटा Ad)' : '⚡ 3 Free Cards (Short Ad)'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 animate-pulse">
              <span>👉</span>
              <span>
                {lang === 'hi'
                  ? 'स्क्रीन पर उंगली या माउस फेरकर कार्ड खोलें'
                  : 'Swipe across the silver area to reveal'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
