
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
import { Module, User as UserType, UserProfile } from './types';

const INITIAL_USER: UserProfile = {
  id: 'user_001',
  name: '',
  email: '',
  handle: '',
  avatar: 'https://picsum.photos/seed/user1/200/200',
  location: 'Monrovia, Liberia',
  bio: 'Bridging communities via the Pan-African Grid.',
  interests: [],
  balance: 0.00,
  joinedAt: new Date().toISOString(),
  isVerified: true
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('feed');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activeChatPartner, setActiveChatPartner] = useState<UserType | null>(null);

  // Persistence check on mount
  useEffect(() => {
    const saved = localStorage.getItem('ekan_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Failed to restore session");
      }
    }
  }, []);

  const handleOnboardingComplete = (data: { name: string; email: string; interests: string[] }) => {
    const newUser = {
      ...user,
      name: data.name,
      email: data.email,
      handle: `@${data.name.toLowerCase().replace(/\s+/g, '_')}`,
      interests: data.interests,
      balance: 100.00 // Bonus for joining!
    };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('ekan_user_session', JSON.stringify(newUser));
  };

  const handleStartChat = (targetUser: UserType) => {
    setActiveChatPartner(targetUser);
    setActiveModule('chat');
  };

  const updateBalance = (amount: number) => {
    const updated = { ...user, balance: user.balance + amount };
    setUser(updated);
    localStorage.setItem('ekan_user_session', JSON.stringify(updated));
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'feed':
        return <Feed />;
      case 'chat':
        return <Chat activePartner={activeChatPartner} />;
      case 'gathering':
        return <Gathering onStartChat={handleStartChat} />;
      case 'wallet':
        return <Wallet balance={user.balance} onAddFunds={() => updateBalance(50)} />;
      case 'pilot':
        return <Pilot />;
      case 'profile':
        return <Profile user={user} onLogout={() => {
          localStorage.removeItem('ekan_user_session');
          setIsLoggedIn(false);
          setUser(INITIAL_USER);
        }} />;
      case 'scanner':
        return <Scanner onAddFriend={() => console.log("Added from scanner")} onProcessPayment={(amt) => updateBalance(-amt)} />;
      default:
        return <Feed />;
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
            {/* Real-time Diagnostics HUD Overlay */}
            <div className="absolute top-4 right-4 pointer-events-none z-[100] hidden sm:block">
              <div className="bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Diag: Grid Connected</span>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default App;
