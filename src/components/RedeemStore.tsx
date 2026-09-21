import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Coins, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  AlertCircle, 
  Flame, 
  QrCode, 
  Gamepad2, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Clock,
  Phone,
  Check,
  User,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardOption, Language, RedeemedCode, InventoryCode, PayoutRequest, GoogleAccount } from '../types';
import { 
  REWARD_CATALOG, 
  getInventoryCodes, 
  dispenseFromInventory, 
  getPayoutRequests, 
  savePayoutRequests 
} from '../utils/storage';
import { sound } from '../utils/audio';

interface RedeemStoreProps {
  coins: number;
  lang: Language;
  onRedeemSuccess: (newCode: RedeemedCode, coinCost: number) => void;
  onNavigateToEarn: () => void;
  googleAccount?: GoogleAccount;
  onOpenAuthModal?: () => void;
  isBanned?: boolean;
}

export const RedeemStore: React.FC<RedeemStoreProps> = ({
  coins,
  lang,
  onRedeemSuccess,
  onNavigateToEarn,
  googleAccount,
  onOpenAuthModal,
  isBanned = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedReward, setSelectedReward] = useState<RewardOption | null>(null);
  const [userContactInput, setUserContactInput] = useState('');
  const [generatedResult, setGeneratedResult] = useState<RedeemedCode | null>(null);
  const [isInstantStock, setIsInstantStock] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [inventoryList, setInventoryList] = useState<InventoryCode[]>(() => getInventoryCodes());

  useEffect(() => {
    setInventoryList(getInventoryCodes());
  }, [selectedReward]);

  const filteredRewards = activeCategory === 'all'
    ? REWARD_CATALOG
    : REWARD_CATALOG.filter((r) => r.category === activeCategory);

  // Check how many unused real codes exist for this reward
  const getStockCount = (category: RewardOption['category'], denomination: number) => {
    return inventoryList.filter((item) => !item.isUsed && item.category === category && item.denomination === denomination).length;
  };

  const handleOpenRedeem = (reward: RewardOption) => {
    if (isBanned) {
      sound.playTick();
      setErrorMsg(
        lang === 'hi'
          ? '🚫 आपकी ID बैन है। आप रिडीम नहीं कर सकते।'
          : '🚫 Your account ID is banned. Redemptions are disabled.'
      );
      return;
    }
    setSelectedReward(reward);
    setGeneratedResult(null);
    setCopied(false);
    setErrorMsg('');
    setUserContactInput(googleAccount?.email || '');
    setIsInstantStock(false);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;

    if (coins < selectedReward.coinCost) {
      setErrorMsg(
        lang === 'hi' 
          ? `आपके पास पर्याप्त सिक्के नहीं हैं! आपको ${(selectedReward.coinCost - coins).toLocaleString()} और चाहिए।`
          : `Not enough coins! You need ${(selectedReward.coinCost - coins).toLocaleString()} more coins.`
      );
      return;
    }

    // If UPI, validate UPI ID
    if (selectedReward.category === 'upi') {
      if (!userContactInput.trim() || !userContactInput.includes('@')) {
        setErrorMsg(
          lang === 'hi'
            ? 'कृपया वैध यूपीआई आईडी दर्ज करें (उदा. mobile@paytm)'
            : 'Please enter a valid UPI ID (e.g. mobile@paytm)'
        );
        return;
      }
    }

    const dateFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // 1. Check if real genuine code exists in admin inventory
    const dispensedItem = dispenseFromInventory(selectedReward.category, selectedReward.denomination);

    if (dispensedItem) {
      // INSTANT GENUINE CODE DISPENSED!
      setIsInstantStock(true);
      const newRedemption: RedeemedCode = {
        id: 'redeem-' + Date.now(),
        title: lang === 'hi' ? selectedReward.titleHi : selectedReward.title,
        category: selectedReward.category,
        code: dispensedItem.code,
        amount: selectedReward.denomination,
        coinCost: selectedReward.coinCost,
        date: dateFormatted,
        status: 'active',
        note: 'Genuine code from Owner Inventory',
        userGoogleId: googleAccount?.googleId,
        userEmail: googleAccount?.email,
        userName: googleAccount?.name,
      };

      sound.playWin();
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.5 },
      });

      setGeneratedResult(newRedemption);
      setInventoryList(getInventoryCodes()); // refresh
      onRedeemSuccess(newRedemption, selectedReward.coinCost);
    } else {
      // 2. Queue into Payout Requests for owner to fulfill with real purchase
      const destinationContact = userContactInput.trim() || googleAccount?.email || googleAccount?.googleId || '';
      if (!destinationContact) {
        setErrorMsg(
          lang === 'hi'
            ? 'कृपया अपना WhatsApp नंबर, Email या Google ID दर्ज करें ताकि मालिक असली कोड भेज सके।'
            : 'Please enter your WhatsApp, Email or login with Google to receive your code.'
        );
        return;
      }

      setIsInstantStock(false);
      const newPayoutId = 'req-' + Date.now();
      const newPayout: PayoutRequest = {
        id: newPayoutId,
        userContact: destinationContact,
        userGoogleId: googleAccount?.googleId || 'UID-GUEST',
        userEmail: googleAccount?.email,
        userName: googleAccount?.name,
        rewardTitle: lang === 'hi' ? selectedReward.titleHi : selectedReward.title,
        category: selectedReward.category,
        amount: selectedReward.denomination,
        coinCost: selectedReward.coinCost,
        status: 'pending',
        date: dateFormatted,
      };

      const existingPayouts = getPayoutRequests();
      savePayoutRequests([newPayout, ...existingPayouts]);

      const pendingRedemption: RedeemedCode = {
        id: 'redeem-' + Date.now(),
        title: lang === 'hi' ? selectedReward.titleHi : selectedReward.title,
        category: selectedReward.category,
        code: `ORD-${newPayoutId.slice(-6).toUpperCase()}`,
        amount: selectedReward.denomination,
        coinCost: selectedReward.coinCost,
        date: dateFormatted,
        status: 'pending',
        note: `Sent to Owner queue for delivery to ${destinationContact}`,
        userGoogleId: googleAccount?.googleId,
        userEmail: googleAccount?.email,
        userName: googleAccount?.name,
      };

      sound.playWin();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
      });

      setGeneratedResult(pendingRedemption);
      onRedeemSuccess(pendingRedemption, selectedReward.coinCost);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    sound.playCoin();
    setTimeout(() => setCopied(false), 2500);
  };

  const getCategoryIcon = (cat: RewardOption['category']) => {
    switch (cat) {
      case 'google_play':
        return <Gift className="w-5 h-5 text-emerald-400" />;
      case 'upi':
        return <QrCode className="w-5 h-5 text-teal-400" />;
      case 'game':
        return <Gamepad2 className="w-5 h-5 text-orange-400" />;
      case 'amazon':
        return <ShoppingBag className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 100% Genuine Rewards & Anti-Scam Banner */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm sm:text-base">
                {lang === 'hi' ? '100% असली व वर्किंग रिवार्ड्स गारंटी' : '100% Real & Working Rewards Promise'}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {lang === 'hi' ? 'Zero Fake Codes' : 'Zero Fake Codes'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {lang === 'hi'
                ? 'हम अन्य फर्जी ऐप्स की तरह कभी कोई अमान्य या फेक कोड नहीं देते। हर रिडीम कोड PhonePe/Google Play से असली पैसे से खरीदकर दिया जाता है। अगर कोड डिलीवर नहीं होता, तो आपके सिक्के 100% वापस!'
                : 'No invalid or fake generator codes. All vouchers are purchased with real money and delivered directly to you.'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: lang === 'hi' ? 'सभी रिवार्ड्स' : 'All Rewards' },
          { id: 'google_play', label: 'Google Play' },
          { id: 'upi', label: 'UPI Cash' },
          { id: 'game', label: lang === 'hi' ? 'गेम्स (FF / BGMI)' : 'Games' },
          { id: 'amazon', label: 'Amazon Pay' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reward Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRewards.map((reward) => {
          const hasEnough = coins >= reward.coinCost;
          const progressPct = Math.min(100, Math.round((coins / reward.coinCost) * 100));
          const stockCount = getStockCount(reward.category, reward.denomination);

          return (
            <div
              key={reward.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg relative group"
            >
              {/* Badge & Stock Indicator */}
              <div className="flex items-center justify-between gap-1 mb-2">
                {stockCount > 0 ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {stockCount} {lang === 'hi' ? 'असली कोड उपलब्ध' : 'In Stock'}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {lang === 'hi' ? '24h पेआउट कतार' : '24h Delivery'}
                  </span>
                )}

                {reward.badge && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {reward.badge}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: `${reward.brandColor}25` }}
                  >
                    {getCategoryIcon(reward.category)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base leading-tight">
                      {lang === 'hi' ? reward.titleHi : reward.title}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      {lang === 'hi' ? reward.descriptionHi : reward.description}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {reward.coinCost} {lang === 'hi' ? 'सिक्के' : 'Coins'}
                    </span>
                    <span className={hasEnough ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {hasEnough 
                        ? (lang === 'hi' ? 'तैयार है!' : 'Ready!') 
                        : `${progressPct}%`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        hasEnough 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenRedeem(reward)}
                className={`w-full mt-3 py-2.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  hasEnough
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
              >
                {hasEnough ? (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>{lang === 'hi' ? 'अभी रिडीम करें' : 'Redeem Now'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'hi' ? 'सिक्के कमाएं' : 'Earn More Coins'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Redemption Dialog / Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            {/* Close Cross */}
            <button
              onClick={() => setSelectedReward(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            {!generatedResult ? (
              /* Confirmation & Details Screen */
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: `${selectedReward.brandColor}25` }}
                  >
                    {getCategoryIcon(selectedReward.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {lang === 'hi' ? selectedReward.titleHi : selectedReward.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'hi' ? 'लागत: ' : 'Cost: '}
                      <span className="font-bold text-amber-300">{selectedReward.coinCost} Coins</span>
                    </p>
                  </div>
                </div>

                {/* Stock status indicator in modal */}
                {getStockCount(selectedReward.category, selectedReward.denomination) > 0 ? (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      {lang === 'hi'
                        ? '🟢 असली कोड स्टॉक में उपलब्ध है! कन्फर्म करते ही तुरंत कोड मिल जाएगा।'
                        : '🟢 Real code in stock! Instant delivery upon confirmation.'}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      {lang === 'hi'
                        ? 'यह असली कोड ऐप मालिक (Owner) द्वारा खरीदकर आपकी Google ID या WhatsApp पर 12-24 घंटे में भेजा जाएगा।'
                        : 'Owner will purchase genuine voucher and send to your Google ID or WhatsApp.'}
                    </span>
                  </div>
                )}

                {/* Google Account Status Pill */}
                {googleAccount?.isSignedIn ? (
                  <div className="p-2.5 bg-blue-950/40 border border-blue-500/40 rounded-xl text-blue-200 text-xs flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={googleAccount.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=48&h=48&q=80'}
                        alt="Avatar"
                        className="w-5 h-5 rounded-full object-cover border border-blue-400"
                      />
                      <div>
                        <span className="font-bold text-white text-[11px] block">{googleAccount.name}</span>
                        <span className="font-mono text-[10px] text-blue-300">{googleAccount.googleId}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      ✓ {lang === 'hi' ? 'Google लिंक है' : 'Linked'}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-800/90 border border-amber-500/30 rounded-xl text-xs flex items-center justify-between mb-3">
                    <span className="text-slate-300 text-[11px]">
                      {lang === 'hi' ? 'Google ID लिंक नहीं है' : 'Google ID not linked'}
                    </span>
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="px-2.5 py-1 rounded-lg bg-white text-slate-900 font-bold text-[11px] flex items-center gap-1 shadow-sm hover:bg-slate-100"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>{lang === 'hi' ? 'लॉगिन करें' : 'Login'}</span>
                    </button>
                  </div>
                )}

                {/* Contact Input (UPI ID or WhatsApp/Email if out of stock) */}
                {(selectedReward.category === 'upi' || getStockCount(selectedReward.category, selectedReward.denomination) === 0) && (
                  <div className="my-3">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {selectedReward.category === 'upi'
                        ? (lang === 'hi' ? 'अपनी यूपीआई आईडी दर्ज करें (UPI ID):' : 'Enter your UPI ID:')
                        : (lang === 'hi' ? 'WhatsApp नंबर या Email (कोड भेजने के लिए):' : 'WhatsApp or Email for code delivery:')}
                    </label>
                    <input
                      type="text"
                      placeholder={selectedReward.category === 'upi' ? 'e.g. mobile@paytm or user@okaxis' : 'e.g. +91 9876543210 or myemail@gmail.com'}
                      value={userContactInput}
                      onChange={(e) => setUserContactInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                )}

                {/* Current Coin Balance comparison */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 my-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{lang === 'hi' ? 'आपका बैलेंस' : 'Your Balance'}:</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    {coins} Coins
                  </span>
                </div>

                {errorMsg && (
                  <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {coins < selectedReward.coinCost ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedReward(null);
                        onNavigateToEarn();
                      }}
                      className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-md shadow-amber-500/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'स्पिन व टास्क से सिक्के कमाएं' : 'Earn Coins with Spin & Tasks'}</span>
                    </button>
                    <button
                      onClick={() => setSelectedReward(null)}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReward(null)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {lang === 'hi' ? 'वापस जाएं' : 'Back'}
                    </button>
                    <button
                      onClick={handleConfirmRedeem}
                      className="flex-1 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
                    >
                      {lang === 'hi' ? 'पुष्टि करें (Confirm)' : 'Confirm & Redeem'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Success & Code Display Screen */
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">
                  {isInstantStock 
                    ? (lang === 'hi' ? 'असली कोड तैयार है! 🎉' : 'Real Code Ready! 🎉')
                    : (lang === 'hi' ? 'पेआउट अनुरोध दर्ज हुआ! ✅' : 'Payout Request Submitted! ✅')}
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  {isInstantStock
                    ? (lang === 'hi'
                        ? 'यह एडमिन स्टॉक से असली और वैध कोड है! नीचे से कॉपी करके Play Store में इस्तेमाल करें।'
                        : 'This is a genuine voucher from stock! Copy and redeem on Google Play Store.')
                    : (lang === 'hi'
                        ? 'आपका अनुरोध सुरक्षित दर्ज हो गया है। असली खरीदा हुआ कोड 12-24 घंटे में आपके WhatsApp पर भेजा जाएगा।'
                        : 'Your request is safely queued. Genuine voucher will be delivered directly to your WhatsApp.')}
                </p>

                {isInstantStock ? (
                  /* Real instant code from stock */
                  <>
                    <div className="bg-slate-800 border-2 border-dashed border-amber-400/80 rounded-2xl p-4 my-4 flex items-center justify-between gap-2 shadow-inner">
                      <span className="font-mono font-black text-amber-300 text-base sm:text-lg tracking-wider select-all">
                        {generatedResult.code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(generatedResult.code)}
                        className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center gap-1 shadow-sm"
                        title="Copy Code"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="text-xs">{copied ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? 'कॉपी' : 'Copy')}</span>
                      </button>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-left my-4 text-xs text-slate-300 space-y-1.5">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'गूगल प्ले पर कैसे डालें:' : 'How to redeem on Google Play:'}</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                        <li>{lang === 'hi' ? 'Google Play Store ऐप खोलें' : 'Open Google Play Store app'}</li>
                        <li>{lang === 'hi' ? 'ऊपर दाईं ओर अपनी प्रोफाइल पर टैप करें' : 'Tap your profile icon at top-right'}</li>
                        <li>{lang === 'hi' ? '"भुगतान और सदस्यताएं" (Payments & Subscriptions) चुनें' : 'Select "Payments & subscriptions"'}</li>
                        <li>{lang === 'hi' ? '"रिडीम कोड" (Redeem code) पर क्लिक करके यह कोड पेस्ट करें' : 'Click "Redeem code" and paste this code'}</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  /* Order Confirmation Card for Real Purchase Delivery */
                  <div className="space-y-3 my-4">
                    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-left text-xs space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                        <span className="text-slate-400">{lang === 'hi' ? 'ऑर्डर ट्रैकिंग आईडी:' : 'Order Tracking ID:'}</span>
                        <span className="font-mono font-bold text-amber-300">#{generatedResult.code}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{lang === 'hi' ? 'इनाम:' : 'Reward Item:'}</span>
                        <span className="font-bold text-white">{generatedResult.title} (₹{generatedResult.amount})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{lang === 'hi' ? 'डिलीवरी संपर्क:' : 'Delivery To:'}</span>
                        <span className="font-mono font-bold text-emerald-400">{userContactInput}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{lang === 'hi' ? 'अनुमानित समय:' : 'Est. Delivery:'}</span>
                        <span className="text-amber-300 font-bold">{lang === 'hi' ? '12 से 24 घंटे' : '12-24 Hours'}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-left text-xs text-emerald-200 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-300">
                          {lang === 'hi' ? '100% असली कोड गारंटी (No Fake Codes)' : '100% Genuine Code Promise'}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          {lang === 'hi'
                            ? 'हम अन्य फर्जी ऐप्स की तरह कभी कोई नकली कोड नहीं देते। PhonePe से असली कोड खरीदकर आपके WhatsApp पर भेजा जाएगा। अगर कोड नहीं मिलता, तो सिक्के तुरंत रिफंड!'
                            : 'Every voucher is purchased with real currency. Zero invalid codes.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedReward(null)}
                  className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
                >
                  {lang === 'hi' ? 'हो गया (Done)' : 'Done & Continue Playing'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
