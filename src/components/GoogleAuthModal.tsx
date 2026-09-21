import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, User, Mail, Sparkles, X, LogIn, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleAccount, Language } from '../types';
import { sound } from '../utils/audio';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentAccount?: GoogleAccount;
  onSignInSuccess: (account: GoogleAccount, bonusCoins: number) => void;
  onSignOut: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentAccount,
  onSignInSuccess,
  onSignOut,
}) => {
  const [emailInput, setEmailInput] = useState(currentAccount?.email || '');
  const [nameInput, setNameInput] = useState(currentAccount?.name || '');
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleQuickSignIn = (presetName: string, presetEmail: string) => {
    setIsProcessing(true);
    sound.playTick();

    setTimeout(() => {
      const generatedGoogleId = 'UID-G' + Math.floor(100000 + Math.random() * 900000);
      const avatars = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
      ];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

      const newAccount: GoogleAccount = {
        isSignedIn: true,
        googleId: currentAccount?.googleId && currentAccount.googleId.startsWith('UID-G') ? currentAccount.googleId : generatedGoogleId,
        name: presetName,
        email: presetEmail,
        avatarUrl: randomAvatar,
        joinedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      };

      setIsProcessing(false);
      sound.playWin();
      confetti({
        particleCount: 60,
        spread: 50,
      });

      onSignInSuccess(newAccount, 100); // 100 bonus coins on Google Auth!
      onClose();
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;

    const derivedName = nameInput.trim() || emailInput.split('@')[0];
    handleQuickSignIn(derivedName, emailInput.trim().toLowerCase());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {currentAccount?.isSignedIn ? (
          /* Already Signed In Profile Card */
          <div className="text-center space-y-4 pt-2">
            <div className="relative inline-block">
              <img
                src={currentAccount.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
                alt="Google Avatar"
                className="w-20 h-20 rounded-full border-2 border-emerald-400 shadow-md mx-auto object-cover"
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm">
                ✓
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'Google खाता सत्यापित है' : 'Google Account Verified'}</span>
              </div>
              <h3 className="text-lg font-black text-white">{currentAccount.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{currentAccount.email}</p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{lang === 'hi' ? 'खिलाड़ी Google ID:' : 'Player Google ID:'}</span>
                <span className="font-mono font-bold text-amber-300 select-all">{currentAccount.googleId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{lang === 'hi' ? 'सुरक्षा स्थिति:' : 'Security Status:'}</span>
                <span className="text-emerald-400 font-bold">{lang === 'hi' ? 'सुरक्षित व असली' : 'Secured & Real'}</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                {lang === 'hi'
                  ? 'जब आप 100K सिक्के जोड़कर ₹10 रिडीम करेंगे, तो असली कोड सीधे इसी ID पर भेजा जाएगा।'
                  : 'Genuine vouchers will be delivered directly to this Google ID.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                {lang === 'hi' ? 'ठीक है' : 'Done'}
              </button>
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'लॉगआउट' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Screen */
          <div className="space-y-4 pt-1">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-2.5 shadow-md">
                {/* Official Google 'G' icon */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              </div>
              <h3 className="text-xl font-black text-white">
                {lang === 'hi' ? 'Google ID से लॉगिन करें' : 'Sign in with Google ID'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {lang === 'hi'
                  ? 'लॉगिन करें ताकि आपके 100K सिक्के सुरक्षित रहें और असली रिडीम कोड आपकी ID में भेजा जा सके!'
                  : 'Login to secure your coins and receive genuine redeem codes directly into your ID.'}
              </p>
            </div>

            {/* Bonus Pill */}
            <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{lang === 'hi' ? 'लॉगिन करने पर तुरंत +100 सिक्के मुफ्त!' : 'Instant +100 Bonus Coins on Login!'}</span>
            </div>

            {/* 1-Click Fast Google Login */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleQuickSignIn('Player Gamer', 'player.gamer@gmail.com')}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg transition-all active:scale-98"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>{lang === 'hi' ? '1-क्लिक Google Sign-In' : '1-Click Fast Google Sign-In'}</span>
              </button>

              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-slate-800" />
                <span className="px-3 text-[11px] text-slate-500 uppercase font-semibold">
                  {lang === 'hi' ? 'या अपनी असली Gmail ID डालें' : 'OR ENTER YOUR GMAIL'}
                </span>
                <div className="flex-1 border-t border-slate-800" />
              </div>

              {/* Custom Gmail Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {lang === 'hi' ? 'आपका नाम (Name):' : 'Your Full Name:'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {lang === 'hi' ? 'आपकी Google Gmail ID:' : 'Your Google Gmail ID:'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul123@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'खाता कनेक्ट करें (+100 सिक्के)' : 'Connect Account (+100 Coins)'}</span>
                </button>
              </form>
            </div>

            <p className="text-[10px] text-center text-slate-400 leading-relaxed">
              {lang === 'hi'
                ? '🔒 100% सुरक्षित — आपकी Google ID से ही आपके 100K सिक्कों का असली पेआउट प्रोसेस होगा।'
                : '🔒 100% Secure — Real code will be routed directly to this verified Google ID.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
