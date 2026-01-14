
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Feed from './components/Feed';
import Chat from './components/Chat';
import Gathering from './components/Gathering';
import Wallet from './components/Wallet';
import Pilot from './components/Pilot';
import Profile from './components/Profile';
import Scanner from './components/Scanner';
import Auth from './components/Auth';
import { Module, User as UserType, UserProfile, Post, Message } from './types';

const INITIAL_USER: UserProfile = {
  id: 'user_me',
  name: '',
  email: '',
  handle: '',
  avatar: 'https://picsum.photos/seed/ekan_user/200/200',
  location: 'Syncing Node...',
  bio: 'Digital Native on the Pan-African Grid.',
  interests: [],
  balance: 0.00,
  joinedAt: new Date().toISOString(),
  isVerified: true,
  trustScore: 99
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('feed');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activeChatPartner, setActiveChatPartner] = useState<UserType | null>(null);

  // Persistence State - Simulating a real Production DB
  const [posts, setPosts] = useState<Post[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});
  const [friends, setFriends] = useState<UserType[]>([]);

  // Diagnostic: Session Recovery Protocol
  useEffect(() => {
    const saved = localStorage.getItem('ekan_v6_terminal_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || INITIAL_USER);
        setPosts(parsed.posts || []);
        // Re-construct dates in messages
        const msgs = parsed.messages || {};
        Object.keys(msgs).forEach(key => {
          msgs[key] = msgs[key].map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        });
        setMessagesByThread(msgs);
        setFriends(parsed.friends || []);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Diagnostic Error: Session manifest terminal corrupted.");
      }
    }
  }, []);

  // Sync state to local DB
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('ekan_v6_terminal_state', JSON.stringify({
        user, posts, messages: messagesByThread, friends
      }));
    }
  }, [user, posts, messagesByThread, friends, isLoggedIn]);

  const handleOnboardingComplete = (data: { name: string; email: string; interests: string[]; location: string }) => {
    const newUser = {
      ...user,
      name: data.name,
      email: data.email,
      location: data.location,
      handle: `@${data.name.toLowerCase().replace(/\s+/g, '_')}`,
      interests: data.interests,
      balance: 2500.00 // Global Launch Node Credit
    };
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const updateBalance = (amount: number) => {
    setUser(prev => ({ ...prev, balance: Math.max(0, prev.balance + amount) }));
  };

  const handleAddPost = (content: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      thumbnail: `https://picsum.photos/seed/${Math.random()}/1200/800`,
      likes: 0,
      authorName: user.name,
      content,
      timestamp: 'Just now'
    };
    setPosts([newPost, ...posts]);
    // Reward for active manifestation
    updateBalance(1.25);
  };

  const handleSendMessage = (threadId: string, msg: Message) => {
    setMessagesByThread(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), msg]
    }));
  };

  const handleAddFriend = (friend: UserType) => {
    setFriends(prev => {
      if (prev.find(f => f.id === friend.id)) return prev;
      return [...prev, friend];
    });
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'feed':
        return <Feed externalPosts={posts} onAddPost={handleAddPost} />;
      case 'chat':
        return (
          <Chat 
            activePartner={activeChatPartner} 
            onUpdateBalance={updateBalance}
            messagesByThread={messagesByThread}
            onSendMessage={handleSendMessage}
          />
        );
      case 'gathering':
        return <Gathering onStartChat={(u) => { setActiveChatPartner(u); setActiveModule('chat'); }} />;
      case 'wallet':
        return <Wallet balance={user.balance} onAddFunds={updateBalance} />;
      case 'pilot':
        return <Pilot />;
      case 'profile':
        return <Profile user={user} onLogout={() => { localStorage.removeItem('ekan_v6_terminal_state'); setIsLoggedIn(false); setUser(INITIAL_USER); }} />;
      case 'scanner':
        return <Scanner onAddFriend={handleAddFriend} onProcessPayment={(amt) => updateBalance(-amt)} />;
      default:
        return <Feed externalPosts={posts} onAddPost={handleAddPost} />;
    }
  };

  return (
    <>
      {!isLoggedIn ? (
        <Auth onComplete={handleOnboardingComplete} />
      ) : (
        <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
          <div className="max-w-5xl mx-auto h-full border-x border-white/5 bg-[#050505]/40 backdrop-blur-[60px] shadow-[0_50px_150px_rgba(0,0,0,1)] relative overflow-hidden">
            {renderModule()}
            {/* Grid Health HUD */}
            <div className="absolute top-8 right-10 pointer-events-none z-[100] hidden lg:block">
              <div className="bg-white/5 border border-white/10 backdrop-blur-3xl px-6 py-3 rounded-full flex items-center space-x-4 shadow-3xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Protocol Active</span>
                </div>
                <div className="h-4 w-[1px] bg-white/10"></div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{user.location} Node</span>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default App;
