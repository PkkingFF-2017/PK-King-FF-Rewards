import React from 'react';
import { Coins, Volume2, VolumeX, Globe, History, ShieldCheck, BookOpen, Lock } from 'lucide-react';
import { Language, TabType, GoogleAccount } from '../types';
import { sound } from '../utils/audio';

interface NavbarProps {
  coins: number;
  lang: Language;
  onToggleLang: () => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  redeemedCount: number;
  googleAccount?: GoogleAccount;
  onOpenAuthModal?: () => void;
  isBanned?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  coins,
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  soundEnabled,
  onToggleSound,
  redeemedCount,
  googleAccount,
  onOpenAuthModal,
  isBanned = false,
}) => {
  // 100,000 coins = ₹10 (i.e. 10,000 coins = ₹1.00)
  const rupeeValue = (coins / 10000).toFixed(2);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
        {/* App Title */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Coins className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight leading-none bg-gradient-to-r from-amber-300 via-yellow-200 to-white bg-clip-text text-transparent">
              {lang === 'hi' ? 'रिडीम कोड रिवार्ड्स' : 'Redeem Code Rewards'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-amber-400 font-medium">
              {lang === 'hi' ? '100K सिक्के = ₹10 असली कोड' : '100K Coins = ₹10 Real Code'}
            </p>
          </div>
        </div>

        {/* Right side controls: Coin balance & Google Account & Admin access */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Google Account Profile / Sign In Pill */}
          <button
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
              googleAccount?.isSignedIn
                ? isBanned
                  ? 'bg-rose-950/70 border-rose-500/80 text-rose-300 hover:bg-rose-900/60 shadow-sm'
                  : 'bg-blue-950/50 border-blue-500/40 text-blue-300 hover:bg-blue-900/40 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-900 border-white shadow-md active:scale-95'
            }`}
            title={
              googleAccount?.isSignedIn
                ? isBanned
                  ? `Google ID: ${googleAccount.googleId} (BANNED)`
                  : `Google ID: ${googleAccount.googleId}`
                : 'Google ID से लॉगिन करें'
            }
          >
            {googleAccount?.isSignedIn ? (
              <>
                <img
                  src={googleAccount.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=48&h=48&q=80'}
                  alt="Avatar"
                  className={`w-4 h-4 rounded-full object-cover border ${isBanned ? 'border-rose-400' : 'border-blue-400'}`}
                />
                <span className="hidden sm:inline truncate max-w-[80px] text-[11px]">
                  {googleAccount.name.split(' ')[0]}
                </span>
                <span className={`font-mono text-[9px] px-1 rounded ${isBanned ? 'bg-rose-500/30 text-rose-200' : 'bg-blue-500/20 text-blue-200'}`}>
                  {isBanned ? '🚫 BANNED' : googleAccount.googleId.replace('UID-', '')}
                </span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-[11px] font-black">{lang === 'hi' ? 'Google लॉगिन' : 'Google Login'}</span>
              </>
            )}
          </button>

          {/* Wallet Balance Pill */}
          <div 
            onClick={() => {
              sound.playCoin();
              onSelectTab('redeem');
            }}
            title={lang === 'hi' ? 'रिडीम करने के लिए क्लिक करें' : 'Click to redeem'}
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 hover:border-amber-400 px-2.5 sm:px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105 shadow-inner"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-sm animate-pulse">
              <Coins className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-slate-950" />
            </div>
            <div className="flex flex-col text-right">
              <span className="font-black text-amber-300 text-xs sm:text-sm leading-tight">
                {coins.toLocaleString()}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-300 font-medium">
                ≈ ₹{rupeeValue}
              </span>
            </div>
          </div>

          {/* Owner Protected Portal Button */}
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-emerald-300 hover:bg-slate-800'
            }`}
            title={lang === 'hi' ? 'मालिक कंट्रोल रूम (Owner Only)' : 'Owner Control Room'}
          >
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'मालिक पोर्टल' : 'Owner'}</span>
          </button>

          {/* My Codes Quick Button */}
          <button
            onClick={() => onSelectTab('history')}
            className={`relative p-2 rounded-xl border transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={lang === 'hi' ? 'मेरे रिडीम कोड' : 'My Redeemed Codes'}
          >
            <History className="w-4 h-4" />
            {redeemedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {redeemedCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all hidden sm:block"
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 text-amber-300 hover:bg-slate-800 transition-all"
            title="भाषा बदलें / Change Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[11px]">{lang === 'hi' ? 'EN' : 'हिंदी'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

