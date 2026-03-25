
export type Module = 'feed' | 'chat' | 'gathering' | 'wallet' | 'pilot' | 'profile' | 'scanner' | 'utilities';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  location: string;
  bio: string;
  interests: string[];
  balance: number;
  joinedAt: string;
  isVerified: boolean;
  trustScore: number; 
  role: UserRole;
  nativeLanguage?: string;
  learningLanguages?: string[];
  following?: string[];
  followers?: string[];
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
  bio?: string;
  status?: string;
  interests?: string[];
  languages?: string[];
  nativeLanguage?: string;
  learningLanguages?: string[];
  posts?: Post[];
  handle?: string;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  thumbnail?: string;
  likes: number;
  timestamp: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'money';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  type: MessageType;
  mediaUrl?: string;
  fileName?: string;
  amount?: number;
  timestamp: string;
  translatedText?: string;
  isVoice?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  partner: User;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'inbound' | 'outbound';
  description: string;
  status: 'completed' | 'pending';
  isEscrow?: boolean;
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  image: string;
  type: string;
  price?: number;
  hasGroupChat?: boolean;
  isTicketed?: boolean;
}

export interface LocalizationData {
  region: string;
  language: string;
  currency: string;
  timezone: string;
  city?: string;
  country?: string;
  flag?: string;
  greeting?: string;
}

export interface GroupVault {
  id: string;
  name: string;
  balance: number;
  members: number;
  goal: number;
  type: string;
}
