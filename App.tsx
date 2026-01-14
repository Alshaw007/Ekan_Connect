
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
  location: 'Detecting Node...',
  bio: 'Digital Native on the Pan-African Grid.',
  interests: [],
  balance: 0.00,
  joinedAt: new Date().toISOString(),
  isVerified: true,
  trustScore: 98
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('feed');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activeChatPartner, setActiveChatPartner] = useState<UserType | null>(null);

  // Persistence State
  const [posts, setPosts] = useState<Post[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});
  const [friends, setFriends] = useState<UserType[]>([]);

  // Production Diagnostics: Session Recovery
  useEffect(() => {
    const saved = localStorage.getItem('ekan_master_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || INITIAL_USER);
        setPosts(parsed.posts || []);
        setMessagesByThread(parsed.messages || {});
        setFriends(parsed.friends || []);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Diagnostic Failure: Manifest Corrupted.");
      }
    }
  }, []);

  // Save state on every change
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('ekan_master_session', JSON.stringify({
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
      balance: 2500.00 // Promotional manifestation credit
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
      thumbnail: `https://picsum.photos/seed/${Math.random()}/800/600`,
      likes: 0,
      authorName: user.name,
      content,
      timestamp: 'Just now'
    };
    setPosts([newPost, ...posts]);
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
        return <Profile user={user} onLogout={() => { localStorage.removeItem('ekan_master_session'); setIsLoggedIn(false); }} />;
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
          <div className="max-w-4xl mx-auto h-full border-x border-white/5 bg-[#050505]/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            {renderModule()}
            {/* Grid Status HUD */}
            <div className="absolute top-6 right-8 pointer-events-none z-[100] hidden md:block">
              <div className="bg-white/5 border border-white/10 backdrop-blur-2xl px-5 py-2 rounded-full flex items-center space-x-3 shadow-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Grid Active</span>
                  <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">{user.location} Node</span>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default App;
