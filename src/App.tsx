/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  RotateCw, 
  Sparkles, 
  HelpCircle, 
  Gift, 
  History, 
  Users, 
  PlayCircle,
  Trophy,
  ArrowRight,
  Flame,
  Award,
  Wallet,
  ShieldCheck,
  Ban,
  AlertOctagon,
  Youtube
} from 'lucide-react';
import { Language, TabType, UserProfile, RedeemedCode, GoogleAccount } from './types';
import { getProfile, saveProfile, upsertRegisteredUser, isUserBanned } from './utils/storage';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { DailyCheckIn } from './components/DailyCheckIn';
import { SpinWheel } from './components/SpinWheel';
import { ScratchCard } from './components/ScratchCard';
import { MathQuiz } from './components/MathQuiz';
import { WatchEarn } from './components/WatchEarn';
import { YouTubeWatchSection } from './components/YouTubeWatchSection';
import { ShortAdModal } from './components/ShortAdModal';
import { RedeemStore } from './components/RedeemStore';
import { HistoryView } from './components/HistoryView';
import { ReferEarnModal } from './components/ReferEarnModal';
import { AdminPanel } from './components/AdminPanel';
import { BusinessGuide } from './components/BusinessGuide';
import { GoogleAuthModal } from './components/GoogleAuthModal';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const [lang, setLang] = useState<Language>('hi'); // Default Hindi for user comfort
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showReferModal, setShowReferModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adRewardTarget, setAdRewardTarget] = useState<'spin' | 'scratch' | 'coins'>('coins');

  // Check if current user is banned
  const isCurrentUserBanned = profile.googleAccount?.googleId 
    ? isUserBanned(profile.googleAccount.googleId) 
    : false;

  // Sync profile to localStorage on updates & sync registered user record
  useEffect(() => {
    saveProfile(profile);
    if (profile.googleAccount) {
      upsertRegisteredUser({
        googleId: profile.googleAccount.googleId,
        name: profile.googleAccount.name,
        email: profile.googleAccount.email,
        avatarUrl: profile.googleAccount.avatarUrl,
        coins: profile.coins,
        totalEarned: profile.totalEarned,
      });
    }
  }, [profile]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  // Google Sign-In handlers
  const handleSignInSuccess = (account: GoogleAccount, bonusCoins: number) => {
    const updatedCoins = profile.coins + bonusCoins;
    const updatedTotal = profile.totalEarned + bonusCoins;
    setProfile((prev) => ({
      ...prev,
      coins: updatedCoins,
      totalEarned: updatedTotal,
      googleAccount: account,
    }));
    upsertRegisteredUser({
      googleId: account.googleId,
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      coins: updatedCoins,
      totalEarned: updatedTotal,
    });
  };

  const handleSignOut = () => {
    setProfile((prev) => ({
      ...prev,
      googleAccount: undefined,
    }));
  };

  // 1. Daily Check-in claim
  const handleClaimStreak = (bonusCoins: number, nextStreak: number) => {
    if (isCurrentUserBanned) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + bonusCoins,
      totalEarned: prev.totalEarned + bonusCoins,
      streakDay: nextStreak,
      lastCheckInDate: todayStr,
    }));
  };

  // 2. Spin Wheel Win
  const handleSpinWin = (coinsWon: number) => {
    if (isCurrentUserBanned) return;
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + coinsWon,
      totalEarned: prev.totalEarned + coinsWon,
      spinTickets: Math.max(0, prev.spinTickets - 1),
    }));
  };

  const handleBuySpinTicket = (cost: number) => {
    if (profile.coins < cost) return;
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      spinTickets: prev.spinTickets + 1,
    }));
  };

  // 3. Scratch Card Win
  const handleScratchWin = (coinsWon: number) => {
    if (isCurrentUserBanned) return;
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + coinsWon,
      totalEarned: prev.totalEarned + coinsWon,
      scratchTickets: Math.max(0, prev.scratchTickets - 1),
    }));
  };

  const handleScratchNewCard = () => {
    // Ticket gets deducted upon reveal in handleScratchWin
  };

  // 4. Math Quiz Reward
  const handleQuizAnswer = (coinsWon: number) => {
    if (isCurrentUserBanned) return;
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + coinsWon,
      totalEarned: prev.totalEarned + coinsWon,
    }));
  };

  // 5. Watch Video Reward
  const handleVideoReward = (coinsWon: number) => {
    if (isCurrentUserBanned) return;
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + coinsWon,
      totalEarned: prev.totalEarned + coinsWon,
      spinTickets: prev.spinTickets + 1, // Bonus ticket too!
    }));
  };

  // 6. Redeem Reward
  const handleRedeemSuccess = (newCode: RedeemedCode, coinCost: number) => {
    if (isCurrentUserBanned) return;
    setProfile((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - coinCost),
      redeemedCodes: [newCode, ...prev.redeemedCodes],
    }));
  };

  // 7. Referral simulate
  const handleSimulateReferral = () => {
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + 100,
      totalEarned: prev.totalEarned + 100,
      referralCount: prev.referralCount + 1,
    }));
  };

  // 8. YouTube Video Watch Reward (Repeatedly +10 coins, no ads)
  const handleYouTubeReward = (coinsEarned: number) => {
    if (isCurrentUserBanned) return;
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      totalEarned: prev.totalEarned + coinsEarned,
    }));
  };

  // 9. Short Ad Trigger & Reward Handling
  const handleTriggerAd = (target: 'spin' | 'scratch' | 'coins' = 'coins') => {
    if (isCurrentUserBanned) return;
    setAdRewardTarget(target);
    setShowAdModal(true);
  };

  const handleAdReward = (coinsEarned: number) => {
    if (isCurrentUserBanned) return;
    if (adRewardTarget === 'spin') {
      setProfile((prev) => ({
        ...prev,
        coins: prev.coins + 5,
        totalEarned: prev.totalEarned + 5,
        spinTickets: prev.spinTickets + 3,
      }));
    } else if (adRewardTarget === 'scratch') {
      setProfile((prev) => ({
        ...prev,
        coins: prev.coins + 5,
        totalEarned: prev.totalEarned + 5,
        scratchTickets: prev.scratchTickets + 3,
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        totalEarned: prev.totalEarned + coinsEarned,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 sm:pb-8 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        coins={profile.coins}
        lang={lang}
        onToggleLang={toggleLang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        redeemedCount={profile.redeemedCodes.length}
        googleAccount={profile.googleAccount}
        onOpenAuthModal={() => setShowAuthModal(true)}
        isBanned={isCurrentUserBanned}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6 space-y-6">
        {/* Suspended / Banned Notice Banner if player's Google ID is blocked */}
        {isCurrentUserBanned && (
          <div className="p-4 rounded-3xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 shadow-xl flex items-start gap-3.5 animate-pulse">
            <AlertOctagon className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                <span>{lang === 'hi' ? '🚫 आपका खाता निलंबित (Banned) कर दिया गया है' : '🚫 Your Account is Banned'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300">
                  {profile.googleAccount?.googleId}
                </span>
              </h4>
              <p className="text-xs text-rose-300 leading-relaxed">
                {lang === 'hi'
                  ? 'मालिक/एडमिन द्वारा आपकी ID को ब्लॉक कर दिया गया है। आप नए सिक्के नहीं कमा सकते और न ही रिडीम कर सकते हैं। अधिक जानकारी के लिए एडमिन से संपर्क करें।'
                  : 'Your Google ID has been blocked by the admin. You cannot earn coins or request rewards.'}
              </p>
            </div>
          </div>
        )}


        {/* Tab Selection Bar (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-md overflow-x-auto">
          {[
            { id: 'home', label: lang === 'hi' ? 'होम / अर्निंग' : 'Home & Earn', icon: Coins },
            { id: 'youtube', label: lang === 'hi' ? '📺 यूट्यूब वॉच (+10)' : '📺 YouTube (+10)', icon: Youtube },
            { id: 'spin', label: lang === 'hi' ? 'लकी स्पिन' : 'Lucky Spin', icon: RotateCw },
            { id: 'scratch', label: lang === 'hi' ? 'स्क्रैच कार्ड' : 'Scratch Card', icon: Sparkles },
            { id: 'quiz', label: lang === 'hi' ? 'मैथ क्विज़' : 'Math Quiz', icon: HelpCircle },
            { id: 'redeem', label: lang === 'hi' ? 'रिडीम स्टोर' : 'Redeem Store', icon: Gift },
            { id: 'history', label: lang === 'hi' ? 'मेरे कोड' : 'My Codes', icon: History },
            { id: 'admin', label: lang === 'hi' ? 'एडमिन स्टॉक' : 'Admin Stock', icon: ShieldCheck },
            { id: 'business_guide', label: lang === 'hi' ? 'कमाई गाइड' : 'Earning Guide', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTick();
                  setActiveTab(tab.id as TabType);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Daily Check-in Streak Banner */}
            <DailyCheckIn
              streakDay={profile.streakDay}
              lastCheckInDate={profile.lastCheckInDate}
              lang={lang}
              onClaim={handleClaimStreak}
            />

            {/* Owner's YouTube Channel & Video Earn Section (Repeatedly earn 10 coins, no ads) */}
            <YouTubeWatchSection
              lang={lang}
              onRewardClaim={handleYouTubeReward}
              isBanned={isCurrentUserBanned}
            />

            {/* Quick Action Earn Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  {lang === 'hi' ? 'सिक्के कमाने के तरीके' : 'Ways to Earn Coins'}
                </h3>
                <span className="text-xs text-amber-400 font-bold">
                  {lang === 'hi' ? '100% फ्री गेम्स' : '100% Free Games'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Spin Card */}
                <div
                  onClick={() => {
                    sound.playTick();
                    setActiveTab('spin');
                  }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <RotateCw className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-white text-sm sm:text-base leading-snug">
                    {lang === 'hi' ? 'लकी स्पिन' : 'Lucky Spin'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'hi' ? '5 - 25 सिक्के जीतें' : 'Win 5 - 25 coins'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-black text-amber-400">
                    {profile.spinTickets} {lang === 'hi' ? 'टिकट बाकी' : 'Tickets Left'} →
                  </span>
                </div>

                {/* 2. Scratch Card */}
                <div
                  onClick={() => {
                    sound.playTick();
                    setActiveTab('scratch');
                  }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-white text-sm sm:text-base leading-snug">
                    {lang === 'hi' ? 'स्क्रैच कार्ड' : 'Scratch & Win'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'hi' ? '5 - 20 सिक्के पाएं' : 'Win 5 - 20 coins'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-black text-emerald-400">
                    {profile.scratchTickets} {lang === 'hi' ? 'कार्ड उपलब्ध' : 'Cards Left'} →
                  </span>
                </div>

                {/* 3. Math Quiz */}
                <div
                  onClick={() => {
                    sound.playTick();
                    setActiveTab('quiz');
                  }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-white text-sm sm:text-base leading-snug">
                    {lang === 'hi' ? 'मैथ क्विज़' : 'Math Quiz'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'hi' ? 'सही जवाब = 5 सिक्के' : '+5 coins each'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-black text-blue-400">
                    {lang === 'hi' ? 'अनलिमिटेड खेलें' : 'Play Unlimited'} →
                  </span>
                </div>

                {/* 4. Refer & Earn */}
                <div
                  onClick={() => {
                    sound.playTick();
                    setShowReferModal(true);
                  }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-white text-sm sm:text-base leading-snug">
                    {lang === 'hi' ? 'रेफर और कमाएं' : 'Refer & Earn'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'hi' ? '+25 सिक्के प्रति दोस्त' : '+25 coins / friend'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-black text-purple-400">
                    {profile.referralCode} →
                  </span>
                </div>
              </div>
            </div>

            {/* Watch Short Video for Bonus */}
            <WatchEarn lang={lang} onRewardClaim={handleVideoReward} />

            {/* Quick Preview of Redeem Store */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  {lang === 'hi' ? 'लोकप्रिय रिडीम कोड' : 'Popular Redeem Codes'}
                </h3>
                <button
                  onClick={() => {
                    sound.playTick();
                    setActiveTab('redeem');
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>{lang === 'hi' ? 'सभी देखें' : 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <RedeemStore
                coins={profile.coins}
                lang={lang}
                onRedeemSuccess={handleRedeemSuccess}
                onNavigateToEarn={() => setActiveTab('spin')}
                googleAccount={profile.googleAccount}
                onOpenAuthModal={() => setShowAuthModal(true)}
              />
            </div>
          </div>
        )}

        {/* TAB: YOUTUBE VIDEO EARN */}
        {activeTab === 'youtube' && (
          <div className="space-y-4">
            <YouTubeWatchSection
              lang={lang}
              onRewardClaim={handleYouTubeReward}
              isBanned={isCurrentUserBanned}
            />
          </div>
        )}

        {/* TAB 2: SPIN WHEEL */}
        {activeTab === 'spin' && (
          <SpinWheel
            spinTickets={profile.spinTickets}
            coins={profile.coins}
            lang={lang}
            onSpinWin={handleSpinWin}
            onBuyTicket={handleBuySpinTicket}
            onWatchAdForTickets={() => handleTriggerAd('spin')}
          />
        )}

        {/* TAB 3: SCRATCH CARD */}
        {activeTab === 'scratch' && (
          <ScratchCard
            scratchTickets={profile.scratchTickets}
            lang={lang}
            onScratchWin={handleScratchWin}
            onNewCardRequest={handleScratchNewCard}
            onWatchAdForCards={() => handleTriggerAd('scratch')}
          />
        )}

        {/* TAB 4: MATH QUIZ */}
        {activeTab === 'quiz' && (
          <MathQuiz lang={lang} onCorrectAnswer={handleQuizAnswer} />
        )}

        {/* TAB 5: REDEEM STORE */}
        {activeTab === 'redeem' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Gift className="w-6 h-6 text-amber-400" />
                  {lang === 'hi' ? 'रिवार्ड्स और रिडीम स्टोर' : 'Rewards & Redeem Store'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {lang === 'hi'
                    ? '100,000 सिक्के = ₹10 असली रिडीम कोड | केवल असली कोड, कोई फेक नहीं'
                    : '100,000 Coins = ₹10 Real Google Play Code | Genuine codes only'}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-2xl">
                <Wallet className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-medium">
                    {lang === 'hi' ? 'उपलब्ध सिक्के' : 'Your Balance'}
                  </div>
                  <div className="text-base font-black text-amber-300">
                    {profile.coins.toLocaleString()} Coins (≈ ₹{(profile.coins / 10000).toFixed(2)})
                  </div>
                </div>
              </div>
            </div>

            <RedeemStore
              coins={profile.coins}
              lang={lang}
              onRedeemSuccess={handleRedeemSuccess}
              onNavigateToEarn={() => setActiveTab('spin')}
              googleAccount={profile.googleAccount}
              onOpenAuthModal={() => setShowAuthModal(true)}
              isBanned={isCurrentUserBanned}
            />
          </div>
        )}

        {/* TAB 6: HISTORY */}
        {activeTab === 'history' && (
          <HistoryView
            codes={profile.redeemedCodes}
            lang={lang}
            onGoToStore={() => setActiveTab('redeem')}
          />
        )}

        {/* TAB 7: ADMIN CODE STOCK & PAYOUTS */}
        {activeTab === 'admin' && (
          <AdminPanel lang={lang} />
        )}

        {/* TAB 8: OWNER BUSINESS & EARNING GUIDE */}
        {activeTab === 'business_guide' && (
          <BusinessGuide
            lang={lang}
            onGoToAdmin={() => setActiveTab('admin')}
            onGoToEarn={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Refer & Earn Modal */}
      {showReferModal && (
        <ReferEarnModal
          referralCode={profile.referralCode}
          referralCount={profile.referralCount}
          lang={lang}
          onSimulateReferral={handleSimulateReferral}
          onClose={() => setShowReferModal(false)}
        />
      )}

      {/* Google Sign-In & ID Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        lang={lang}
        currentAccount={profile.googleAccount}
        onSignInSuccess={handleSignInSuccess}
        onSignOut={handleSignOut}
      />

      {/* Mobile Bottom Navigation Bar (App-like feel) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white px-1 py-1.5 flex items-center justify-around shadow-2xl overflow-x-auto">
        {[
          { id: 'home', label: lang === 'hi' ? 'होम' : 'Home', icon: Coins },
          { id: 'youtube', label: lang === 'hi' ? 'यूट्यूब' : 'YouTube', icon: Youtube },
          { id: 'spin', label: lang === 'hi' ? 'स्पिन' : 'Spin', icon: RotateCw },
          { id: 'scratch', label: lang === 'hi' ? 'स्क्रैच' : 'Scratch', icon: Sparkles },
          { id: 'redeem', label: lang === 'hi' ? 'रिडीम' : 'Redeem', icon: Gift },
          { id: 'history', label: lang === 'hi' ? 'कोड' : 'Codes', icon: History },
          { id: 'admin', label: lang === 'hi' ? 'एडमिन' : 'Admin', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTick();
                setActiveTab(tab.id as TabType);
              }}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[9px] mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Intermittent Sponsor Ad Modal */}
      <ShortAdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onReward={handleAdReward}
        lang={lang}
      />
    </div>
  );
}
