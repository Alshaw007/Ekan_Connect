
export type Module = 'feed' | 'chat' | 'gathering' | 'wallet' | 'pilot' | 'profile' | 'scanner';

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
  posts?: Post[];
}

export interface Post {
  id: string;
  thumbnail: string;
  likes: number;
}

export interface Story {
  id: string;
  content: string; // URL or base64
  type: 'image' | 'video';
  timestamp: Date;
}

export interface UserStory {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  hasUnseen: boolean;
}

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'money';

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  type: MessageType;
  mediaUrl?: string;
  fileName?: string;
  amount?: number;
  timestamp: Date;
  translatedText?: string;
  isVoice?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  partner: User;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  online?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  content: string;
  image: string;
  category: 'Local' | 'Global';
  timestamp: string;
  likes?: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  type: 'Professional' | 'Social';
  price: number;
  image: string;
  isTicketed: boolean;
  hasGroupChat?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'inbound' | 'outbound';
  description: string;
  status: 'completed' | 'pending';
  isEscrow?: boolean;
  timestamp: Date;
}

export interface LocalizationData {
  city: string;
  country: string;
  language: string;
  flag: string;
  greeting: string;
}
