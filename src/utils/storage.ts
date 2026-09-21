import { UserProfile, RedeemedCode, RewardOption, InventoryCode, PayoutRequest, GoogleAccount, RegisteredUser, YouTubeConfig } from '../types';

const STORAGE_KEY = 'redeem_app_profile_v2';
const INVENTORY_KEY = 'redeem_app_inventory_v3';
const PAYOUT_KEY = 'redeem_app_payouts_v2';
const USERS_KEY = 'redeem_app_registered_users_v1';
const OWNER_PIN_KEY = 'redeem_app_owner_pin_v1';
const YOUTUBE_CONFIG_KEY = 'redeem_app_youtube_config_v1';
export const DEFAULT_OWNER_PIN = '1234';

export const INITIAL_YOUTUBE_CONFIG: YouTubeConfig = {
  channelUrl: 'https://youtube.com/@p.k.king.freefire?si=150OeqOA7oTe7Qcb',
  channelName: 'PK King FF (Official YouTube Channel)',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  videoTitle: 'PK King FF - Free Fire Live & Gameplay Videos (Watch & Earn 10 Coins)',
  subscribersCount: '25.0K',
  viewsEarnCount: 1850,
};

export function getYouTubeConfig(): YouTubeConfig {
  if (typeof window === 'undefined') return INITIAL_YOUTUBE_CONFIG;
  try {
    const raw = localStorage.getItem(YOUTUBE_CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(YOUTUBE_CONFIG_KEY, JSON.stringify(INITIAL_YOUTUBE_CONFIG));
      return INITIAL_YOUTUBE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    // If it's still the old default name, update to PK King FF automatically
    if (!parsed.channelName || parsed.channelName.includes('मालिक') || parsed.channelName.includes('Official Gaming') || !parsed.channelUrl?.includes('p.k.king.freefire')) {
      parsed.channelName = 'PK King FF (Official YouTube Channel)';
      parsed.channelUrl = 'https://youtube.com/@p.k.king.freefire?si=150OeqOA7oTe7Qcb';
      localStorage.setItem(YOUTUBE_CONFIG_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_YOUTUBE_CONFIG;
  }
}

export function saveYouTubeConfig(cfg: YouTubeConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(YOUTUBE_CONFIG_KEY, JSON.stringify(cfg));
  } catch (err) {
    console.error('Failed to save youtube config', err);
  }
}

export function extractYouTubeId(url: string): string {
  if (!url) return 'dQw4w9WgXcQ';
  const clean = url.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match && match[1]) return match[1];
  if (clean.length === 11 && !clean.includes('/') && !clean.includes('.')) return clean;
  return 'dQw4w9WgXcQ';
}

export function getOwnerPin(): string {
  if (typeof window === 'undefined') return DEFAULT_OWNER_PIN;
  try {
    const saved = localStorage.getItem(OWNER_PIN_KEY);
    return saved && saved.trim() ? saved.trim() : DEFAULT_OWNER_PIN;
  } catch {
    return DEFAULT_OWNER_PIN;
  }
}

export function saveOwnerPin(newPin: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OWNER_PIN_KEY, newPin.trim());
  } catch (err) {
    console.error('Failed to save owner pin', err);
  }
}

export function checkOwnerPin(pinAttempt: string): boolean {
  return pinAttempt.trim() === getOwnerPin();
}

// Registered Players Management (Owner Eyes Only)
export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    googleId: 'UID-G782194',
    name: 'Rahul Kumar',
    email: 'rahulkumar.play@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
    coins: 100050,
    totalEarned: 100050,
    joinedDate: '15 Sep 2026',
    isBanned: false,
    lastActive: 'आज (Today)',
  },
  {
    googleId: 'UID-G419023',
    name: 'Amit Verma',
    email: 'amit.verma99@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80',
    coins: 4520,
    totalEarned: 4520,
    joinedDate: '16 Sep 2026',
    isBanned: false,
    lastActive: 'कल (Yesterday)',
  },
  {
    googleId: 'UID-G992104',
    name: 'Fake Clicker (Suspicious)',
    email: 'autobot9921@tempmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80',
    coins: 0,
    totalEarned: 120,
    joinedDate: '14 Sep 2026',
    isBanned: true,
    banReason: 'Auto clicker / Fraud attempt',
    lastActive: '14 Sep 2026',
  },
];

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return INITIAL_REGISTERED_USERS;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REGISTERED_USERS;
  }
}

export function saveRegisteredUsers(users: RegisteredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users', err);
  }
}

export function upsertRegisteredUser(user: Partial<RegisteredUser> & { googleId: string; email: string; name: string }): void {
  const current = getRegisteredUsers();
  const index = current.findIndex((u) => u.googleId === user.googleId || u.email === user.email);
  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (index !== -1) {
    current[index] = {
      ...current[index],
      ...user,
      lastActive: 'आज (Today)',
    };
  } else {
    current.unshift({
      googleId: user.googleId,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
      coins: user.coins || 0,
      totalEarned: user.totalEarned || 0,
      joinedDate: nowStr,
      isBanned: false,
      lastActive: 'आज (Today)',
    });
  }
  saveRegisteredUsers(current);
}

export function toggleBanUser(googleId: string, reason?: string): boolean {
  const current = getRegisteredUsers();
  const user = current.find((u) => u.googleId === googleId);
  if (!user) return false;

  user.isBanned = !user.isBanned;
  if (user.isBanned) {
    user.banReason = reason || 'Admin blocked this account';
  } else {
    user.banReason = undefined;
  }
  saveRegisteredUsers(current);
  return user.isBanned;
}

export function isUserBanned(googleId?: string): boolean {
  if (!googleId) return false;
  const current = getRegisteredUsers();
  const user = current.find((u) => u.googleId === googleId);
  return !!user?.isBanned;
}

// Inventory starts empty. Real codes purchased from PhonePe/Paytm/Amazon are added via Admin Panel.
export const INITIAL_INVENTORY: InventoryCode[] = [];

export const INITIAL_PAYOUTS: PayoutRequest[] = [];

export function getInventoryCodes(): InventoryCode[] {
  if (typeof window === 'undefined') return INITIAL_INVENTORY;
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (!raw) {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVENTORY;
  }
}

export function saveInventoryCodes(codes: InventoryCode[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(codes));
  } catch (err) {
    console.error('Failed to save inventory', err);
  }
}

export function getPayoutRequests(): PayoutRequest[] {
  if (typeof window === 'undefined') return INITIAL_PAYOUTS;
  try {
    const raw = localStorage.getItem(PAYOUT_KEY);
    if (!raw) {
      localStorage.setItem(PAYOUT_KEY, JSON.stringify(INITIAL_PAYOUTS));
      return INITIAL_PAYOUTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYOUTS;
  }
}

export function savePayoutRequests(requests: PayoutRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PAYOUT_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save payout requests', err);
  }
}

// Dispense an unused code from admin inventory if available
export function dispenseFromInventory(
  category: RewardOption['category'],
  denomination: number
): InventoryCode | null {
  const inventory = getInventoryCodes();
  const availableIndex = inventory.findIndex(
    (item) => !item.isUsed && item.category === category && item.denomination === denomination
  );

  if (availableIndex !== -1) {
    const item = inventory[availableIndex];
    item.isUsed = true;
    item.usedBy = 'User (Google Account)';
    saveInventoryCodes(inventory);
    return item;
  }
  return null;
}

export const INITIAL_PROFILE: UserProfile = {
  coins: 50, // Realistic initial bonus
  totalEarned: 50,
  streakDay: 1,
  lastCheckInDate: null,
  spinTickets: 3,
  scratchTickets: 3,
  referralCode: 'EARN' + Math.floor(1000 + Math.random() * 9000),
  referralCount: 0,
  completedTaskIds: [],
  redeemedCodes: [],
  googleAccount: {
    isSignedIn: false,
    googleId: 'UID-' + Math.floor(100000 + Math.random() * 900000),
    name: '',
    email: '',
    avatarUrl: '',
    joinedDate: '',
  },
};

export const REWARD_CATALOG: RewardOption[] = [
  // Google Play (15,000 Coins for ₹10)
  {
    id: 'gp-10',
    title: 'Google Play Code ₹10',
    titleHi: 'गूगल प्ले कोड ₹10',
    category: 'google_play',
    denomination: 10,
    coinCost: 15000, // 15K Coins
    iconName: 'Play',
    badge: 'Popular (15K)',
    description: '100% Genuine ₹10 Play Store code purchased with real money.',
    descriptionHi: 'PhonePe/Paytm से खरीदा हुआ ₹10 का 100% असली कोड।',
    brandColor: '#01875f',
  },
  {
    id: 'gp-25',
    title: 'Google Play Code ₹25',
    titleHi: 'गूगल प्ले कोड ₹25',
    category: 'google_play',
    denomination: 25,
    coinCost: 250000, // 250K Coins
    iconName: 'Play',
    badge: 'Best Value',
    description: 'Genuine ₹25 Play Store balance for in-app offers & games.',
    descriptionHi: 'गेम्स और इन-ऐप ऑफर्स के लिए ₹25 का असली प्ले स्टोर कोड।',
    brandColor: '#01875f',
  },
  {
    id: 'gp-50',
    title: 'Google Play Code ₹50',
    titleHi: 'गूगल प्ले कोड ₹50',
    category: 'google_play',
    denomination: 50,
    coinCost: 500000, // 500K Coins
    iconName: 'Play',
    badge: 'Mega Pack',
    description: 'Buy games, books, or in-app items on Play Store.',
    descriptionHi: 'प्ले स्टोर पर गेम्स, बुक्स या इन-ऐप आइटम खरीदें।',
    brandColor: '#01875f',
  },
  {
    id: 'gp-100',
    title: 'Google Play Code ₹100',
    titleHi: 'गूगल प्ले कोड ₹100',
    category: 'google_play',
    denomination: 100,
    coinCost: 1000000, // 1M Coins
    iconName: 'Play',
    badge: 'Super Saver',
    description: '₹100 direct Play Store voucher code delivered to your ID.',
    descriptionHi: '₹100 डायरेक्ट प्ले स्टोर वाउचर कोड आपकी ID में।',
    brandColor: '#01875f',
  },

  // Instant UPI Cash
  {
    id: 'upi-10',
    title: 'Instant UPI Cash ₹10',
    titleHi: 'इंस्टेंट यूपीआई कैश ₹10',
    category: 'upi',
    denomination: 10,
    coinCost: 15000, // 15K Coins
    iconName: 'QrCode',
    badge: 'Fast Transfer (15K)',
    description: 'Direct payout to Google Pay, PhonePe, Paytm via UPI ID.',
    descriptionHi: 'सीधे गूगल पे, फोनपे, पेटीएम में ट्रांसफर।',
    brandColor: '#0f766e',
  },
  {
    id: 'upi-25',
    title: 'Instant UPI Cash ₹25',
    titleHi: 'इंस्टेंट यूपीआई कैश ₹25',
    category: 'upi',
    denomination: 25,
    coinCost: 250000, // 250K Coins
    iconName: 'QrCode',
    description: 'Direct bank payout using your UPI ID.',
    descriptionHi: 'अपनी यूपीआई आईडी से सीधा बैंक पेआउट।',
    brandColor: '#0f766e',
  },
  {
    id: 'upi-50',
    title: 'Instant UPI Cash ₹50',
    titleHi: 'इंस्टेंट यूपीआई कैश ₹50',
    category: 'upi',
    denomination: 50,
    coinCost: 500000, // 500K Coins
    iconName: 'QrCode',
    badge: 'Fast Transfer',
    description: 'Direct bank payout using your UPI ID.',
    descriptionHi: 'अपनी यूपीआई आईडी से सीधा बैंक पेआउट।',
    brandColor: '#0f766e',
  },
  {
    id: 'upi-100',
    title: 'Instant UPI Cash ₹100',
    titleHi: 'इंस्टेंट यूपीआई कैश ₹100',
    category: 'upi',
    denomination: 100,
    coinCost: 1000000, // 1M Coins
    iconName: 'QrCode',
    description: 'Transfer directly to any bank account via UPI.',
    descriptionHi: 'UPI के माध्यम से किसी भी बैंक खाते में सीधे ट्रांसफर करें।',
    brandColor: '#0f766e',
  },
];

export function getProfile(): UserProfile {
  if (typeof window === 'undefined') return INITIAL_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.googleAccount) {
      parsed.googleAccount = INITIAL_PROFILE.googleAccount;
    }
    return parsed;
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

// Generate realistic alphanumeric redeem codes
export function generateRandomCode(category: RewardOption['category']): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const getBlock = (len: number) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  if (category === 'google_play') {
    return `GPLY-${getBlock(4)}-${getBlock(4)}-${getBlock(4)}`;
  } else if (category === 'upi') {
    return `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}@ref`;
  } else if (category === 'amazon') {
    return `AMZN-${getBlock(4)}-${getBlock(4)}-${getBlock(4)}`;
  } else {
    return `GAME-${getBlock(4)}-${getBlock(4)}-${getBlock(4)}`;
  }
}
