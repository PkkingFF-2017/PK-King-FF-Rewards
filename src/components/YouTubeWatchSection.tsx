import React, { useState, useEffect } from 'react';
import { Play, Youtube, CheckCircle2, Clock, Sparkles, ExternalLink, RefreshCw, Trophy, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, YouTubeConfig } from '../types';
import { extractYouTubeId, getYouTubeConfig, saveYouTubeConfig } from '../utils/storage';
import { sound } from '../utils/audio';

interface YouTubeWatchSectionProps {
  lang: Language;
  onRewardClaim: (coins: number) => void;
  isBanned?: boolean;
}

export const YouTubeWatchSection: React.FC<YouTubeWatchSectionProps> = ({
  lang,
  onRewardClaim,
  isBanned = false,
}) => {
  const [config, setConfig] = useState<YouTubeConfig>(() => getYouTubeConfig());
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchSeconds, setWatchSeconds] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);
  const [subscribedBonusClaimed, setSubscribedBonusClaimed] = useState(false);

  const videoId = extractYouTubeId(config.videoUrl);

  // Countdown timer while watching
  useEffect(() => {
    let timer: number | null = null;
    if (isPlaying && watchSeconds > 0 && !isCompleted) {
      timer = window.setInterval(() => {
        setWatchSeconds((prev) => {
          if (prev <= 1) {
            setIsCompleted(true);
            sound.playWin();
            confetti({
              particleCount: 50,
              spread: 60,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, watchSeconds, isCompleted]);

  const handleStartWatching = () => {
    if (isBanned) return;
    setIsPlaying(true);
    setWatchSeconds(15);
    setIsCompleted(false);
    sound.playTick();
  };

  const handleClaimCoins = () => {
    if (isBanned || !isCompleted) return;
    onRewardClaim(10);
    sound.playWin();

    // Increment owner view counter
    const updated = { ...config, viewsEarnCount: (config.viewsEarnCount || 0) + 1 };
    setConfig(updated);
    saveYouTubeConfig(updated);

    // Reset so player can watch again and earn another 10 coins!
    setIsCompleted(false);
    setIsPlaying(false);
    setWatchSeconds(15);
  };

  const handleSubscribe = () => {
    if (config.channelUrl) {
      window.open(config.channelUrl, '_blank', 'noopener,noreferrer');
      if (!subscribedBonusClaimed && !isBanned) {
        setSubscribedBonusClaimed(true);
        setTimeout(() => {
          onRewardClaim(50);
          sound.playWin();
          confetti({ particleCount: 80, spread: 70 });
        }, 1500);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 flex-shrink-0">
            <Youtube className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {lang === 'hi' ? 'PK King FF YouTube चैनल' : 'PK King FF YouTube Channel'}
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                +10 Coins / Visit
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'hi'
                ? 'यह YouTube channel ka link hai, aap video dekhenge har video par 10 coin milenge!'
                : 'Official channel link: watch videos and earn 10 coins per task!'}
            </p>
          </div>
        </div>

        {/* Subscribe Channel Button */}
        <button
          onClick={handleSubscribe}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl font-black text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <Youtube className="w-4 h-4" />
          <span>
            {subscribedBonusClaimed
              ? lang === 'hi'
                ? '✓ चैनल सब्सक्राइब किया गया'
                : '✓ Channel Subscribed'
              : lang === 'hi'
              ? 'चैनल सब्सक्राइब करें (+50 बोनस)'
              : 'Subscribe Channel (+50 Bonus)'}
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Channel info banner */}
      <div className="bg-slate-950/90 border border-red-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/30 text-red-400 flex items-center justify-center font-black text-base shadow-inner">
              PK
            </div>
            <div>
              <div className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                <span>PK King FF</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">Official Free Fire</span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {lang === 'hi'
                  ? 'यह YouTube channel ka link hai, aap video dekhenge har video par 10 coin milenge!'
                  : 'Official PK King FF YouTube channel - Watch videos & earn 10 coins!'}
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-slate-400">
              {lang === 'hi' ? 'कुल विज़िट' : 'Total Visits'}
            </div>
            <div className="text-sm font-mono font-black text-red-400">
              {(config.viewsEarnCount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-300 text-xs font-mono truncate max-w-xs sm:max-w-md">
            🔗 https://youtube.com/@p.k.king.freefire?si=150OeqOA7oTe7Qcb
          </span>
          <button
            onClick={handleSubscribe}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs"
          >
            <Youtube className="w-4 h-4" />
            <span>{lang === 'hi' ? 'चैनल खोलें और वीडियो देखें' : 'Open Channel & Watch Videos'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
