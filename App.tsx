
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
  location: 'Detecting...',
  bio: 'Digital Native on the Pan-African Grid.',
  interests: [],
  balance: 0.00,
  joinedAt: new Date().toISOString(),
  isVerified: true,
  trustScore: 95
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('feed');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activeChatPartner, setActiveChatPartner] = useState<UserType | null>(null);

  // Global Mock Persistence Layer
  const [posts, setPosts] = useState<Post[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});
  const [friends, setFriends] = useState<UserType[]>([]);

  // Hydrate from LocalStorage (Simulating a real session fetch)
  useEffect(() => {
    const saved = localStorage.getItem('ekan_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Diagnostic Error: Session corrupted");
      }
    }
  }, []);

  const handleOnboardingComplete = (data: { name: string; email: string; interests: string[]; location: string }) => {
    const newUser = {
      ...user,
      name: data.name,
      email: data.email,
      location: data.location,
      handle: `@${data.name.toLowerCase().replace(/\s+/g, '_')}`,
      interests: data.interests,
      balance: 1000.00 // Promotional Early Manifestation Credit
    };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('ekan_user_session', JSON.stringify(newUser));
  };

  const updateBalance = (amount: number) => {
    setUser(prev => {
      const updated = { ...prev, balance: Math.max(0, prev.balance + amount) };
      localStorage.setItem('ekan_user_session', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddPost = (content: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      thumbnail: `https://picsum.photos/seed/${Math.random()}/800/600`,
      likes: 0,
      authorName: user.name,
      content,
      timestamp: 'Just now'
    };
    setPosts([newPost, ...posts]);
  };

  const handleStartChat = (targetUser: UserType) => {
    setActiveChatPartner(targetUser);
    setActiveModule('chat');
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
            onSendMessage={(threadId, msg) => {
              setMessagesByThread(prev => ({
                ...prev,
                [threadId]: [...(prev[threadId] || []), msg]
              }));
            }}
          />
        );
      case 'gathering':
        return <Gathering onStartChat={handleStartChat} />;
      case 'wallet':
        return <Wallet balance={user.balance} onAddFunds={() => updateBalance(250)} />;
      case 'pilot':
        return <Pilot />;
      case 'profile':
        return <Profile user={user} onLogout={() => {
          localStorage.removeItem('ekan_user_session');
          setIsLoggedIn(false);
          setUser(INITIAL_USER);
        }} />;
      case 'scanner':
        return <Scanner 
          onAddFriend={handleAddFriend} 
          onProcessPayment={(amt) => updateBalance(-amt)} 
        />;
      default:
        return <Feed externalPosts={posts} onAddPost={handleAddPost} />;
    }
  };

  return (
    <>
      {!isLoggedIn ? (
        <Auth onComplete={handleOnboardingComplete} />
      ) : (
        <Layout activeModule={activeModule} setActiveModule={(m) => {
          if (m !== 'chat') setActiveChatPartner(null);
          setActiveModule(m);
        }}>
          <div className="max-w-3xl mx-auto h-full border-x border-white/5 bg-[#050505]/40 backdrop-blur-3xl shadow-2xl relative">
            {renderModule()}
            {/* Immersive Performance HUD */}
            <div className="absolute top-4 right-4 pointer-events-none z-[100] hidden sm:block">
              <div className="bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400">Diag: Bridge Online • {user.location}</span>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default App;
