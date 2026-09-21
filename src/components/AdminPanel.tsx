import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PackagePlus, 
  ListOrdered, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Copy, 
  Trash2, 
  Plus, 
  Gift, 
  Coins, 
  Send,
  AlertTriangle,
  Info,
  Check,
  Search,
  Lock,
  KeyRound,
  User,
  ExternalLink,
  Users,
  Ban,
  UserCheck,
  UserX,
  ShieldAlert,
  Youtube,
  Play,
  Sparkles
} from 'lucide-react';
import { InventoryCode, PayoutRequest, Language, RegisteredUser, YouTubeConfig } from '../types';
import { 
  getInventoryCodes, 
  saveInventoryCodes, 
  getPayoutRequests, 
  savePayoutRequests,
  getOwnerPin,
  saveOwnerPin,
  checkOwnerPin,
  DEFAULT_OWNER_PIN,
  getRegisteredUsers,
  saveRegisteredUsers,
  toggleBanUser,
  isUserBanned,
  getYouTubeConfig,
  saveYouTubeConfig,
  extractYouTubeId
} from '../utils/storage';
import { sound } from '../utils/audio';

interface AdminPanelProps {
  lang: Language;
  onRefreshData?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang, onRefreshData }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinVal, setNewPinVal] = useState('');

  const [inventory, setInventory] = useState<InventoryCode[]>(() => getInventoryCodes());
  const [payouts, setPayouts] = useState<PayoutRequest[]>(() => getPayoutRequests());
  const [players, setPlayers] = useState<RegisteredUser[]>(() => getRegisteredUsers());
  const [activeAdminTab, setActiveAdminTab] = useState<'players' | 'payouts' | 'inventory' | 'youtube'>('players');

  // YouTube Channel & Video Configuration State
  const [ytConfig, setYtConfig] = useState<YouTubeConfig>(() => getYouTubeConfig());
  const [ytChannelUrl, setYtChannelUrl] = useState(ytConfig.channelUrl);
  const [ytChannelName, setYtChannelName] = useState(ytConfig.channelName);
  const [ytVideoUrl, setYtVideoUrl] = useState(ytConfig.videoUrl);
  const [ytVideoTitle, setYtVideoTitle] = useState(ytConfig.videoTitle);
  const [ytSavedSuccess, setYtSavedSuccess] = useState(false);

  // Player search & filter
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerFilter, setPlayerFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [banModalUser, setBanModalUser] = useState<RegisteredUser | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');

  // Form states for adding new real codes
  const [newCategory, setNewCategory] = useState<'google_play' | 'upi' | 'game' | 'amazon'>('google_play');
  const [newDenomination, setNewDenomination] = useState<number>(10);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [isBulk, setIsBulk] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Payout fulfill modal / action state
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [dispenseCodeText, setDispenseCodeText] = useState('');
  const [adminNoteText, setAdminNoteText] = useState('');

  const refreshState = () => {
    setInventory(getInventoryCodes());
    setPayouts(getPayoutRequests());
    setPlayers(getRegisteredUsers());
    if (onRefreshData) onRefreshData();
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkOwnerPin(pinInput)) {
      sound.playWin();
      setIsUnlocked(true);
      setPinError('');
    } else {
      sound.playTick();
      setPinError(lang === 'hi' ? 'गलत PIN! डिफ़ॉल्ट PIN 1234 है।' : 'Incorrect PIN! Default PIN is 1234.');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinVal.trim().length >= 4) {
      saveOwnerPin(newPinVal.trim());
      sound.playWin();
      setIsChangingPin(false);
      setNewPinVal('');
      setFeedbackMsg(lang === 'hi' ? 'नया मालिक PIN सुरक्षित सेव हो गया!' : 'New Owner PIN saved securely!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  // If locked, render owner authentication lock screen
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-8 bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20 text-slate-950">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white">
          {lang === 'hi' ? 'मालिक कंट्रोल रूम (Owner Only)' : 'Owner Control Room'}
        </h2>
        <p className="text-xs text-slate-300 mt-1 mb-5 leading-relaxed">
          {lang === 'hi'
            ? 'यह पैनल केवल ऐप के मालिक (आप) के लिए है। यहां से आप असली खरीदे गए रिडीम कोड स्टॉक में डाल सकते हैं और 100K सिक्के जमा करने वाले प्लेयर्स को असली कोड भेज सकते हैं।'
            : 'Protected area for the app owner to deposit real codes and fulfill verified player payouts.'}
        </p>

        <form onSubmit={handleUnlock} className="space-y-3">
          <div>
            <label className="block text-left text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'मालिक सुरक्षा PIN दर्ज करें:' : 'Enter Owner Security PIN:'}</span>
            </label>
            <input
              type="password"
              autoFocus
              placeholder="डिफ़ॉल्ट PIN: 1234"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError('');
              }}
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-center text-lg font-mono text-white tracking-widest focus:outline-none"
            />
          </div>

          {pinError && (
            <p className="text-xs text-rose-400 font-bold bg-rose-950/40 border border-rose-800/50 py-1.5 rounded-xl">
              {pinError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-md shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{lang === 'hi' ? 'मालिक पोर्टल खोलें' : 'Unlock Owner Portal'}</span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'hi' ? 'शुरुआती डिफ़ॉल्ट PIN: 1234 (अंदर जाकर बदल सकते हैं)' : 'Default PIN: 1234'}</span>
        </div>
      </div>
    );
  }

  const handleAddSingleCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeInput.trim()) return;

    const newEntry: InventoryCode = {
      id: 'inv-' + Date.now(),
      category: newCategory,
      denomination: Number(newDenomination),
      code: newCodeInput.trim().toUpperCase(),
      isUsed: false,
      dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    const updated = [newEntry, ...inventory];
    setInventory(updated);
    saveInventoryCodes(updated);
    setNewCodeInput('');
    sound.playWin();
    setFeedbackMsg(lang === 'hi' ? 'असली कोड सफलतापूर्वक स्टॉक में जुड़ गया!' : 'Real code added to inventory successfully!');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleAddBulkCodes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim().toUpperCase())
      .filter((l) => l.length > 3);

    if (lines.length === 0) return;

    const newEntries: InventoryCode[] = lines.map((code, idx) => ({
      id: `inv-${Date.now()}-${idx}`,
      category: newCategory,
      denomination: Number(newDenomination),
      code,
      isUsed: false,
      dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));

    const updated = [...newEntries, ...inventory];
    setInventory(updated);
    saveInventoryCodes(updated);
    setBulkInput('');
    sound.playWin();
    setFeedbackMsg(lang === 'hi' ? `${lines.length} कोड्स स्टॉक में जुड़ गए!` : `${lines.length} codes added to inventory!`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleDeleteCode = (id: string) => {
    const updated = inventory.filter((item) => item.id !== id);
    setInventory(updated);
    saveInventoryCodes(updated);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sound.playCoin();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Payout actions
  const handleFulfillPayout = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    // Suggest unused code from inventory if available
    const matched = inventory.find(
      (item) => !item.isUsed && item.category === payout.category && item.denomination === payout.amount
    );
    setDispenseCodeText(matched ? matched.code : '');
    setAdminNoteText('');
  };

  const handleConfirmFulfill = (status: 'completed' | 'rejected') => {
    if (!selectedPayout) return;

    const updatedPayouts = payouts.map((p) => {
      if (p.id === selectedPayout.id) {
        return {
          ...p,
          status,
          dispensedCode: status === 'completed' ? dispenseCodeText.trim() : undefined,
          adminNote: adminNoteText.trim() || (status === 'completed' ? 'Approved & sent by Admin' : 'Rejected by Admin'),
        };
      }
      return p;
    });

    // If an inventory code was used, mark it used
    if (status === 'completed' && dispenseCodeText.trim()) {
      const updatedInv = inventory.map((item) => {
        if (item.code === dispenseCodeText.trim()) {
          return { ...item, isUsed: true, usedBy: selectedPayout.userContact };
        }
        return item;
      });
      setInventory(updatedInv);
      saveInventoryCodes(updatedInv);
    }

    setPayouts(updatedPayouts);
    savePayoutRequests(updatedPayouts);
    setSelectedPayout(null);
    sound.playWin();
    refreshState();
  };

  const handleToggleBan = (player: RegisteredUser, reason?: string) => {
    const isNowBanned = toggleBanUser(player.googleId, reason);
    sound.playTick();
    setFeedbackMsg(
      isNowBanned
        ? (lang === 'hi' ? `आईडी ${player.googleId} (${player.name}) को सफलतापूर्वक बैन कर दिया गया!` : `User ID ${player.googleId} banned!`)
        : (lang === 'hi' ? `आईडी ${player.googleId} (${player.name}) को अनबैन कर दिया गया!` : `User ID ${player.googleId} unbanned!`)
    );
    setBanModalUser(null);
    setBanReasonInput('');
    refreshState();
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const unusedCount = inventory.filter((i) => !i.isUsed).length;
  const pendingPayoutsCount = payouts.filter((p) => p.status === 'pending').length;
  const totalPlayersCount = players.length;
  const bannedPlayersCount = players.filter((p) => p.isBanned).length;
  const activePlayersCount = totalPlayersCount - bannedPlayersCount;

  // Filtered players list
  const filteredPlayers = players.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
      p.googleId.toLowerCase().includes(playerSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(playerSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (playerFilter === 'active') return !p.isBanned;
    if (playerFilter === 'banned') return p.isBanned;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'hi' ? 'मालिक कंट्रोल रूम (Owner Only)' : 'Admin Control Room'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PIN 1234
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {lang === 'hi'
                  ? 'खिलाड़ियों की आईडी देखना, चीटर को बैन करना और 100K जमा करने वालों को असली कोड डिलीवर करना — सब आपके हाथ में।'
                  : 'Manage registered player IDs, ban suspicious users, and fulfill 100K genuine redeem code requests.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-semibold">{lang === 'hi' ? 'कुल खिलाड़ी' : 'Players'}</div>
              <div className="text-base sm:text-lg font-black text-blue-400">{totalPlayersCount}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-semibold">{lang === 'hi' ? 'बैन आईडी' : 'Banned'}</div>
              <div className="text-base sm:text-lg font-black text-rose-400">{bannedPlayersCount}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-semibold">{lang === 'hi' ? 'लंबित पेआउट' : 'Pending'}</div>
              <div className="text-base sm:text-lg font-black text-amber-400">{pendingPayoutsCount}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-semibold">{lang === 'hi' ? 'स्टॉक कोड' : 'In Stock'}</div>
              <div className="text-base sm:text-lg font-black text-emerald-400">{unusedCount}</div>
            </div>
          </div>
        </div>

        {/* Strict Privacy Guarantee Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
          <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-extrabold text-emerald-300">
              {lang === 'hi' ? '🔒 100% आपकी आँखों के लिए (Strict Privacy):' : '🔒 Strict Privacy Guarantee:'}
            </span>{' '}
            {lang === 'hi'
              ? 'यह पूरा कंट्रोल रूम केवल आपके गुप्त PIN (डिफ़ॉल्ट 1234) से खुलता है। आम प्लेयर्स को केवल उनका अपना सिक्का और गेम दिखेगा। किसी भी दूसरे प्लेयर को यह लिस्ट, किसी की Google ID या आपका कोड स्टॉक कभी नहीं दिखेगा।'
              : 'This control room is protected by your secret PIN. Regular players only see their own coins balance. No player can ever view other user profiles or your inventory.'}
          </div>
        </div>

        {/* 3 Main Control Tabs */}
        <div className="flex gap-2 mt-5 border-t border-slate-800 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveAdminTab('players')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeAdminTab === 'players'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'hi' ? '👥 खिलाड़ी लिस्ट व बैन सिस्टम' : '👥 Players & Ban Control'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/40 text-amber-200">
              {totalPlayersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('payouts')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${
              activeAdminTab === 'payouts'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>{lang === 'hi' ? '🎁 रिडीम कोड पेआउट अनुरोध' : '🎁 Payout Requests'}</span>
            {pendingPayoutsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-black animate-pulse">
                {pendingPayoutsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeAdminTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>{lang === 'hi' ? '📦 असली कोड स्टॉक' : '📦 Real Code Stock'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/40 text-amber-200">
              {unusedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('youtube')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeAdminTab === 'youtube'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-102'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-400" />
            <span>{lang === 'hi' ? '📺 यूट्यूब चैनल सेटिंग्स' : '📺 YouTube Setup'}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* VIEW 0: REGISTERED PLAYERS & BAN SYSTEM */}
      {activeAdminTab === 'players' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          {/* Header & Answers to User questions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>{lang === 'hi' ? 'खिलाड़ी लॉगिन सूची व आईडी बैन कंट्रोल' : 'Registered Players & Ban Control'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'hi'
                  ? 'यहां उन सभी खिलाड़ियों की असली Google ID दिखेगी जिन्होंने लॉगिन किया है। आप किसी भी चीटर को 1 क्लिक में बैन कर सकते हैं।'
                  : 'Real Google IDs of players who signed in. You can ban suspicious users with one click.'}
              </p>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 self-start md:self-auto">
              {(['all', 'active', 'banned'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setPlayerFilter(filterType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    playerFilter === filterType
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filterType === 'all' && (lang === 'hi' ? `सभी (${totalPlayersCount})` : `All (${totalPlayersCount})`)}
                  {filterType === 'active' && (lang === 'hi' ? `सक्रिय (${activePlayersCount})` : `Active (${activePlayersCount})`)}
                  {filterType === 'banned' && (lang === 'hi' ? `बैन आईडी (${bannedPlayersCount})` : `Banned (${bannedPlayersCount})`)}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'hi' ? 'खिलाड़ी का नाम, Google ID (UID-G...) या ईमेल खोजें...' : 'Search by name, Google ID, or email...'}
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            {playerSearch && (
              <button
                onClick={() => setPlayerSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Direct Answer Explanations card */}
          <div className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 text-xs space-y-2">
            <h4 className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'मालिक के लिए जरूरी गाइड (Owner Guide):' : 'Owner Guide:'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-0.5">1. कौन सा बंदा लॉगिन किया है?</span>
                <span className="text-slate-400 text-[11px]">नीचे हर खिलाड़ी का नाम, Google ID और ईमेल साफ़ दिखता है। नया लॉगिन होते ही वह तुरंत यहां जुड़ जाएगा।</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-0.5">2. आईडी बैन कैसे करें?</span>
                <span className="text-slate-400 text-[11px]">प्लेयर के आगे लाल <b className="text-rose-400">"🚫 ID बैन करें"</b> दबाएं। बैन होते ही वह न तो गेम खेल सकेगा और न ही रिडीम। कभी भी अनबैन कर सकते हैं।</span>
              </div>
            </div>
          </div>

          {/* Player Cards List */}
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-2xl">
              <UserX className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">{lang === 'hi' ? 'कोई खिलाड़ी नहीं मिला।' : 'No players found matching your search.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlayers.map((player) => (
                <div
                  key={player.googleId}
                  className={`bg-slate-800/70 border rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    player.isBanned
                      ? 'border-rose-800/50 bg-rose-950/10'
                      : 'border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={player.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                        alt={player.name}
                        className={`w-11 h-11 rounded-2xl object-cover border-2 ${
                          player.isBanned ? 'border-rose-500 opacity-60' : 'border-blue-400'
                        }`}
                      />
                      {player.isBanned ? (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center text-white text-[10px]" title="Banned">
                          ✕
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" title="Active" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm">
                          {player.name}
                        </h4>
                        
                        {/* Status badge */}
                        {player.isBanned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <Ban className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'आईडी बैन है' : 'Banned'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'सक्रिय खिलाड़ी' : 'Active'}</span>
                          </span>
                        )}

                        {player.coins >= 100000 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            ⭐ 100K सिक्का पूरा (₹10 योग्य)
                          </span>
                        )}
                      </div>

                      {/* Google ID Pill with Copy */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleCopy(player.googleId, player.googleId)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 transition-colors"
                          title="Click to copy Google ID"
                        >
                          <User className="w-3 h-3" />
                          <span>{player.googleId}</span>
                          {copiedId === player.googleId ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 text-blue-400/80" />
                          )}
                        </button>

                        <span className="text-[11px] font-mono text-slate-400">
                          {player.email}
                        </span>
                      </div>

                      {/* Coins & Dates */}
                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 font-bold text-amber-300">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>{player.coins.toLocaleString()} सिक्के</span>
                          <span className="text-slate-400 font-normal">(कुल: {player.totalEarned.toLocaleString()})</span>
                        </span>
                        <span>•</span>
                        <span>शामिल: {player.joinedDate}</span>
                        <span>•</span>
                        <span className="text-slate-400">{player.lastActive}</span>
                      </div>

                      {player.isBanned && player.banReason && (
                        <p className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-800/40 px-2 py-1 rounded-lg mt-1 inline-block">
                          कारण: {player.banReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Ban / Unban */}
                  <div className="flex items-center gap-2 sm:self-center">
                    {player.isBanned ? (
                      <button
                        onClick={() => handleToggleBan(player)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? '🟢 अनबैन करें' : 'Unban ID'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBanModalUser(player);
                          setBanReasonInput('संदिग्ध गतिविधि या ऑटो क्लिकर का उपयोग');
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all active:scale-95"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? '🚫 ID बैन करें' : 'Ban ID'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 1: INVENTORY MANAGER */}
      {activeAdminTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Code Form Card */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                {lang === 'hi' ? 'नया असली कोड जोड़ें' : 'Add Real Codes'}
              </h3>
              <button
                onClick={() => setIsBulk(!isBulk)}
                className="text-[11px] font-bold text-amber-400 hover:underline"
              >
                {isBulk ? (lang === 'hi' ? 'सिंगल कोड' : 'Single Code') : (lang === 'hi' ? 'एक साथ कई कोड (Bulk)' : 'Bulk Add')}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'hi' ? 'रिवार्ड श्रेणी (Category):' : 'Category:'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="google_play">Google Play Gift Code</option>
                  <option value="amazon">Amazon Pay Voucher</option>
                  <option value="game">Free Fire / BGMI Pin</option>
                  <option value="upi">UPI Cash Voucher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'hi' ? 'मूल्य (Denomination ₹):' : 'Denomination (₹):'}
                </label>
                <select
                  value={newDenomination}
                  onChange={(e) => setNewDenomination(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value={10}>₹10 Code</option>
                  <option value={20}>₹20 Code</option>
                  <option value={50}>₹50 Code</option>
                  <option value={100}>₹100 Code</option>
                  <option value={250}>₹250 Code</option>
                </select>
              </div>

              {!isBulk ? (
                <form onSubmit={handleAddSingleCode} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {lang === 'hi' ? 'असली कोड डालें (Paste Real Code):' : 'Paste Real Code:'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GPLY-4829-KDJ8-9214"
                      value={newCodeInput}
                      onChange={(e) => setNewCodeInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {lang === 'hi'
                        ? 'Paytm, Amazon या PhonePe से खरीदा गया असली 16-अंक का कोड यहां पेस्ट करें।'
                        : 'Paste genuine code purchased from Amazon, Paytm, or Google Play.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'स्टॉक में जोड़ें' : 'Add to Stock'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAddBulkCodes} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {lang === 'hi' ? 'एक साथ कई कोड (प्रति पंक्ति एक कोड):' : 'Bulk Codes (One per line):'}
                    </label>
                    <textarea
                      rows={5}
                      placeholder={`GPLY-XXXX-XXXX-XXXX\nGPLY-YYYY-YYYY-YYYY`}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'सभी कोड जोड़ें' : 'Add All Codes'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Current Inventory Table Card */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {lang === 'hi' ? 'वर्तमान स्टॉक सूची' : 'Current Stock Inventory'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'hi'
                    ? 'यूजर जब रिडीम करेगा, हरा (Available) कोड अपने आप उसे मिल जाएगा।'
                    : 'Unused codes are automatically dispensed to users when they redeem coins.'}
                </p>
              </div>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                <Gift className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">{lang === 'hi' ? 'स्टॉक खाली है। कृपया ऊपर से कोड जोड़ें।' : 'Inventory empty. Add codes on the left.'}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      item.isUsed
                        ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                        : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.isUsed ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-300">
                            {item.code}
                          </span>
                          <button
                            onClick={() => handleCopy(item.code, item.id)}
                            className="text-slate-400 hover:text-white p-1"
                            title="Copy code"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-300">₹{item.denomination}</span>
                          <span>•</span>
                          <span className="capitalize">{item.category.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{item.dateAdded}</span>
                          {item.usedBy && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-medium">Used by {item.usedBy}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          item.isUsed
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {item.isUsed ? (lang === 'hi' ? 'इस्तेमाल हुआ' : 'Used') : (lang === 'hi' ? 'उपलब्ध' : 'Available')}
                      </span>

                      <button
                        onClick={() => handleDeleteCode(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: PAYOUT REQUESTS MANAGER */}
      {activeAdminTab === 'payouts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-base">
              {lang === 'hi' ? 'यूजर पेआउट व रिडीम अनुरोध' : 'User Payout & Redeem Requests'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'hi'
                ? 'जब यूजर UPI कैश या आउट-ऑफ़-स्टॉक कोड का अनुरोध करता है, वह यहां आता है। आप यहां से कोड भेज सकते हैं या अप्रूव कर सकते हैं।'
                : 'Incoming withdrawal requests from users (UPI transfers or custom codes) requiring admin fulfillment.'}
            </p>
          </div>

          {payouts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-2xl">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">{lang === 'hi' ? 'कोई लंबित पेआउट अनुरोध नहीं है।' : 'No payout requests at this time.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-sm">
                        {req.rewardTitle} (₹{req.amount})
                      </h4>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          req.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : req.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Google ID Player Badge */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 font-bold">
                        <User className="w-3 h-3" />
                        <span>{req.userGoogleId || 'UID-GUEST'}</span>
                        {req.userName && <span className="text-white font-sans font-normal">({req.userName})</span>}
                      </span>
                      {req.userEmail && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {req.userEmail}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 mt-1 font-mono">
                      {lang === 'hi' ? 'डिलीवरी संपर्क / UPI / WhatsApp:' : 'Delivery Contact / UPI:'}{' '}
                      <span className="font-bold text-amber-300 select-all">{req.userContact}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{req.date}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">{req.coinCost.toLocaleString()} Coins</span>
                    </div>

                    {req.dispensedCode && (
                      <div className="mt-2 text-xs font-mono bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Code: {req.dispensedCode}</span>
                      </div>
                    )}

                    {req.adminNote && (
                      <p className="text-[11px] text-slate-400 italic mt-1">Note: {req.adminNote}</p>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFulfillPayout(req)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'कोड भेजें / अप्रूव करें' : 'Send Code / Approve'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPayout(req);
                          handleConfirmFulfill('rejected');
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200"
                      >
                        {lang === 'hi' ? 'रद्द करें' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: YOUTUBE CHANNEL & VIDEO SETUP */}
      {activeAdminTab === 'youtube' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center flex-shrink-0">
                <Youtube className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base sm:text-lg">
                  {lang === 'hi' ? '📺 अपना यूट्यूब चैनल व वीडियो लिंक सेट करें' : '📺 Owner YouTube Channel Setup'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'hi'
                    ? 'यहाँ अपना यूट्यूब चैनल और वीडियो लिंक डालें। बंदे वीडियो देखेंगे तो आपके व्यूज बढ़ेंगे और उन्हें 10 सिक्के मिलेंगे!'
                    : 'Set your YouTube channel & video link. Players watch your video to earn 10 coins, boosting your views!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">
                {lang === 'hi' ? 'कुल वीडियो व्यूज:' : 'Total App Views:'}
              </span>
              <span className="text-sm font-mono font-black text-red-400">
                {(ytConfig.viewsEarnCount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Special Owner Rule Note */}
          <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'आपके चैनल का व्यूज ग्रोथ सिस्टम:' : 'Your Views Growth System:'}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
              <li><b>असली व्यूज:</b> बंदे आपके यूट्यूब वीडियो को ऐप में 15 सेकंड देखेंगे, जिससे आपका यूट्यूब वॉच टाइम और व्यूज बढ़ेंगे।</li>
              <li><b>हर बार 10 सिक्के:</b> वीडियो देखने पर बंदे जितनी बार चाहें हर बार 10 सिक्के कलेक्ट कर सकेंगे।</li>
              <li><b>कोई फालतू ऐड नहीं:</b> आपके यूट्यूब वीडियो को देखते समय कोई बीच में ऐड नहीं आएगा ताकि आपके व्यूज में कोई रुकावट न हो।</li>
              <li><b>सब्सक्राइब बटन:</b> ऊपर 'सब्सक्राइब' बटन दबाने पर बंदा सीधे आपके यूट्यूब चैनल पर पहुंचेगा!</li>
            </ul>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const updated: YouTubeConfig = {
                ...ytConfig,
                channelUrl: ytChannelUrl.trim(),
                channelName: ytChannelName.trim() || 'Official Channel',
                videoUrl: ytVideoUrl.trim(),
                videoTitle: ytVideoTitle.trim() || 'Watch & Earn 10 Coins',
              };
              saveYouTubeConfig(updated);
              setYtConfig(updated);
              setYtSavedSuccess(true);
              sound.playWin();
              setTimeout(() => setYtSavedSuccess(false), 3500);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Channel Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'hi' ? '1. यूट्यूब चैनल का नाम:' : '1. YouTube Channel Name:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asharphi Gaming / Tech Official"
                  value={ytChannelName}
                  onChange={(e) => setYtChannelName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              {/* Channel URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'hi' ? '2. यूट्यूब चैनल का लिंक (URL):' : '2. YouTube Channel URL:'}
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://youtube.com/@YourChannel"
                  value={ytChannelUrl}
                  onChange={(e) => setYtChannelUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'hi' ? '3. यूट्यूब वीडियो का लिंक या ID:' : '3. YouTube Video Link or ID:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/watch?v=... या https://youtu.be/..."
                  value={ytVideoUrl}
                  onChange={(e) => setYtVideoUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {lang === 'hi'
                    ? 'आप यूट्यूब से कोई भी वीडियो का लिंक कॉपी करके यहाँ सीधे पेस्ट कर सकते हैं।'
                    : 'Paste any full YouTube link or short link.'}
                </span>
              </div>

              {/* Video Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'hi' ? '4. वीडियो का शीर्षक (Title):' : '4. Video Title:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. नई ट्रिक वीडियो देखें और 10 सिक्के पाएं!"
                  value={ytVideoTitle}
                  onChange={(e) => setYtVideoTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Live Video Preview in Admin */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-red-400" />
                  {lang === 'hi' ? 'लाइव वीडियो प्रीव्यू (Live Preview):' : 'Live Video Preview:'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Video ID: {extractYouTubeId(ytVideoUrl)}
                </span>
              </div>
              <div className="max-w-md mx-auto aspect-video rounded-xl overflow-hidden bg-black border border-slate-700">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(ytVideoUrl)}?rel=0`}
                  title="Admin YouTube Preview"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Submit / Save Button */}
            <div className="flex items-center justify-between pt-2">
              {ytSavedSuccess ? (
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'hi' ? '✓ यूट्यूब चैनल व वीडियो सफलतापूर्वक सेव हो गया!' : '✓ YouTube settings saved successfully!'}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  {lang === 'hi' ? 'सेव करने के बाद सभी प्लेयर्स को यही वीडियो दिखेगा।' : 'Saved changes apply immediately to all players.'}
                </span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Youtube className="w-4 h-4" />
                <span>{lang === 'hi' ? 'यूट्यूब सेटिंग्स सेव करें' : 'Save YouTube Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fulfill Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-white text-base">
                {lang === 'hi' ? 'पेआउट पूरा करें' : 'Complete Payout'}
              </h3>
              <button
                onClick={() => setSelectedPayout(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>{' '}
                <span className="font-bold text-white">{selectedPayout.rewardTitle} (₹{selectedPayout.amount})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coins Deducted:</span>{' '}
                <span className="font-bold text-amber-300">{selectedPayout.coinCost.toLocaleString()} Coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Player Google ID:</span>{' '}
                <span className="font-mono font-bold text-blue-300">{selectedPayout.userGoogleId || 'UID-GUEST'}</span>
              </div>
              {selectedPayout.userName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Player Name:</span>{' '}
                  <span className="font-bold text-white">{selectedPayout.userName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Contact / UPI:</span>{' '}
                <span className="font-mono font-bold text-amber-300">{selectedPayout.userContact}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'hi' ? 'यूजर को भेजा जाने वाला असली कोड:' : 'Real Code to Send to User:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPLY-4829-KDJ8-9214"
                  value={dispenseCodeText}
                  onChange={(e) => setDispenseCodeText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'hi' ? 'एडमिन नोट / ट्रांजेक्शन आईडी:' : 'Admin Note / Txn Ref:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sent via PhonePe #88219"
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* 1-Click WhatsApp Quick Action */}
              {(() => {
                const digits = selectedPayout.userContact.replace(/\D/g, '');
                const hasPhone = digits.length >= 10;
                const phoneNum = digits.slice(-10);
                const playerName = selectedPayout.userName || 'Player';
                const googleId = selectedPayout.userGoogleId || 'Verified Account';
                const message = `नमस्ते ${playerName}! आपकी "${selectedPayout.rewardTitle}" (₹${selectedPayout.amount}) के लिए ${selectedPayout.coinCost.toLocaleString()} सिक्कों की रिडीम रिक्वेस्ट मंज़ूर हो गई है।\n\n👤 आपकी Google ID: ${googleId}\n🎁 आपका 100% असली कोड: ${dispenseCodeText || '[CODE_HERE]'}\n\nGoogle Play Store ऐप खोलें -> Profile Icon -> "Payments & Subscriptions" -> "Redeem code" में डालें।\nबधाई हो! 🎉`;
                const waUrl = `https://wa.me/91${phoneNum}?text=${encodeURIComponent(message)}`;

                return (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">WhatsApp डायरेक्ट डिलीवरी:</span>
                      {hasPhone ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all"
                        >
                          <span>WhatsApp खोलें</span>
                          <Send className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500">ईमेल या गैर-फोन संपर्क</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      PhonePe या Paytm से खरीदा हुआ ₹{selectedPayout.amount} का असली कोड ऊपर भरें और सीधे यूजर के WhatsApp पर भेजें।
                    </p>
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleConfirmFulfill('completed')}
                  disabled={!dispenseCodeText.trim() && selectedPayout.category !== 'upi'}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  {lang === 'hi' ? 'सफल मार्क करें' : 'Confirm & Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Reason Confirmation Modal */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600/40 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {lang === 'hi' ? 'खिलाड़ी आईडी बैन करें' : 'Ban Player ID'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {banModalUser.name} ({banModalUser.googleId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBanModalUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-200 space-y-1.5 mb-4">
              <p className="font-bold">⚠️ आईडी बैन होने के बाद क्या होगा?</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li>यह यूजर ऐप में कोई भी नया सिक्का नहीं कमा सकेगा।</li>
                <li>कोई भी रिडीम कोड या पेआउट रिक्वेस्ट नहीं भेज सकेगा।</li>
                <li>उसके स्क्रीन पर खाता निलंबित (Banned) का संदेश दिखेगा।</li>
                <li>आप जब चाहें इसी एडमिन पैनल से इसे तुरंत <b className="text-emerald-400">अनबैन</b> कर सकते हैं।</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'hi' ? 'बैन करने का कारण (खिलाड़ी को दिखेगा):' : 'Ban Reason:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. ऑटो क्लिकर / चीटिंग / संदिग्ध गतिविधि"
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-rose-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Quick reason chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'ऑटो क्लिकर / चीटिंग',
                  'नकली अकाउंट / स्पैम',
                  'संदिग्ध गतिविधि',
                  'नियमों का उल्लंघन'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setBanReasonInput(reason)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBanModalUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleBan(banModalUser, banReasonInput || 'संदिग्ध गतिविधि के कारण बैन')}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
                >
                  {lang === 'hi' ? 'हाँ, तुरंत बैन करें' : 'Confirm Ban'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
