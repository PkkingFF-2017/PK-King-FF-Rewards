export type Language = 'hi' | 'en';

export type TabType = 'home' | 'spin' | 'scratch' | 'quiz' | 'youtube' | 'redeem' | 'history' | 'admin' | 'business_guide';

export interface YouTubeConfig {
  channelUrl: string;
  channelName: string;
  videoUrl: string;
  videoTitle: string;
  subscribersCount?: string;
  viewsEarnCount: number;
}

export interface GoogleAccount {
  isSignedIn: boolean;
  googleId: string;
  name: string;
  email: string;
  avatarUrl: string;
  joinedDate: string;
}

export interface RedeemedCode {
  id: string;
  title: string;
  category: 'google_play' | 'upi' | 'game' | 'amazon';
  code: string;
  amount: number;
  coinCost: number;
  date: string;
  status: 'active' | 'completed' | 'pending';
  note?: string;
  userGoogleId?: string;
  userEmail?: string;
  userName?: string;
}

export interface InventoryCode {
  id: string;
  category: 'google_play' | 'upi' | 'game' | 'amazon';
  denomination: number;
  code: string;
  isUsed: boolean;
  usedBy?: string;
  dateAdded: string;
}

export interface PayoutRequest {
  id: string;
  userContact: string;
  rewardTitle: string;
  category: 'google_play' | 'upi' | 'game' | 'amazon';
  amount: number;
  coinCost: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  dispensedCode?: string;
  adminNote?: string;
  userGoogleId?: string;
  userEmail?: string;
  userName?: string;
}

export interface RewardOption {
  id: string;
  title: string;
  titleHi: string;
  category: 'google_play' | 'upi' | 'game' | 'amazon';
  denomination: number;
  coinCost: number;
  iconName: string;
  badge?: string;
  description: string;
  descriptionHi: string;
  brandColor: string;
}

export interface RegisteredUser {
  googleId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  coins: number;
  totalEarned: number;
  joinedDate: string;
  isBanned: boolean;
  banReason?: string;
  lastActive: string;
}

export interface UserProfile {
  coins: number;
  totalEarned: number;
  streakDay: number;
  lastCheckInDate: string | null;
  spinTickets: number;
  scratchTickets: number;
  referralCode: string;
  referralCount: number;
  completedTaskIds: string[];
  redeemedCodes: RedeemedCode[];
  googleAccount?: GoogleAccount;
  isBanned?: boolean;
  banReason?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  titleHi: string;
  rewardCoins: number;
  type: 'visit' | 'video' | 'quiz' | 'social';
  link?: string;
  icon: string;
}
