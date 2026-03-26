
import React, { useState, useEffect } from 'react';
import { Home, MessageCircle, Calendar, Wallet, Sparkles, User, Bell, Globe, Search, Scan, Zap, Users, Activity, Mic, Video, Camera, MoreVertical } from './Icons';
import { Module, LocalizationData } from '../types';

interface LayoutProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeModule, setActiveModule, children }) => {
  const [loc, setLoc] = useState<LocalizationData | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setLoc({ 
        region: 'West Africa',
        currency: 'USD',
        timezone: 'GMT',
        city: 'Monrovia', 
        country: 'Liberia', 
        language: 'en-LR', 
        flag: '🇱🇷',
        greeting: 'Connected to the Grid.'
      });
    }, 500);
  }, []);

  const navItems: { id: Module; icon: any; label: string }[] = [
    { id: 'chat', icon: MessageCircle, label: 'Chats' },
    { id: 'stories', icon: Activity, label: 'Updates' },
    { id: 'communities', icon: Users, label: 'Communities' },
    { id: 'gathering', icon: Calendar, label: 'Calls' },
  ];

  const secondaryNav: { id: Module; icon: any; label: string }[] = [
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'utilities', icon: Zap, label: 'Utilities' },
    { id: 'pilot', icon: Sparkles, label: 'Pilot' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] dark:bg-[#111b21] text-slate-900 dark:text-[#e9edef] overflow-hidden relative font-sans">
      {/* Top Header - WhatsApp Style */}
      <header className="flex items-center justify-between px-4 py-3 bg-brand-navy dark:bg-[#202c33] text-white z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold tracking-tight">EKAN Connect</h1>
        </div>
        
        <div className="flex items-center space-x-5">
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <Camera size={22} />
          </button>
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <Search size={22} />
          </button>
          <div className="relative group">
            <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical size={22} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#233138] rounded-lg shadow-xl py-2 hidden group-hover:block z-[100] border border-slate-200 dark:border-slate-700">
              {secondaryNav.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors flex items-center space-x-3"
                >
                  <item.icon size={18} className="text-slate-500" />
                  <span>{item.label}</span>
                </button>
              ))}
              <hr className="my-1 border-slate-200 dark:border-slate-700" />
              <button className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors">Settings</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="flex-1 overflow-y-auto z-10 relative scroll-smooth scrollbar-hide bg-transparent">
        {children}
      </main>

      {/* Bottom Nav - WhatsApp Modern Style */}
      <nav className="flex justify-around items-center py-2 bg-white dark:bg-[#202c33] border-t border-slate-200 dark:border-slate-700 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 ${
                isActive ? 'text-brand-green' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className={`px-5 py-1 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-green/10' : ''}`}>
                <Icon size={24} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
              </div>
              <span className={`text-[12px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
