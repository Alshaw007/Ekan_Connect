
import React, { useState, useEffect } from 'react';
import { Home, MessageCircle, Calendar, Wallet, Sparkles, User, Bell, Globe, Search, Scan, Zap } from './Icons';
import { Module, LocalizationData } from '../types';
import { COLORS, VaiPattern, KruPattern, EKAN_GRADIENT_CSS } from '../constants';

interface LayoutProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeModule, setActiveModule, children }) => {
  // We can simulate localized text based on the user's location here if needed
  const [loc, setLoc] = useState<LocalizationData | null>(null);

  useEffect(() => {
    // In a real app, this would come from a global user state
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
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'gathering', icon: Calendar, label: 'Gather' },
    { id: 'utilities', icon: Zap, label: 'Utilities' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'pilot', icon: Sparkles, label: 'Pilot' },
    { id: 'profile', icon: User, label: 'Me' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#020202] text-white overflow-hidden relative font-['Inter'] selection:bg-gold selection:text-black">
      {/* Immersive Background Nodes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-15%] w-[80%] h-[80%] bg-red-600/[0.03] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-15%] left-[-15%] w-[80%] h-[80%] bg-green-600/[0.03] blur-[150px] rounded-full"></div>
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-gold/[0.03] blur-[120px] rounded-full"></div>
      </div>

      {/* Cultural Heritage Watermarks */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden z-1">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute scale-[3] rotate-12" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}>
                {i % 2 === 0 ? <VaiPattern /> : <KruPattern />}
            </div>
        ))}
      </div>

      {/* Top Header */}
      <header className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-white/[0.03] backdrop-blur-3xl z-50">
        <div className="flex items-center space-x-6">
            <div 
              onClick={() => setActiveModule('feed')}
              className={`w-12 h-12 rounded-[1.2rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} flex items-center justify-center font-black text-black text-2xl shadow-[0_10px_30px_rgba(206,17,38,0.2)] active:scale-90 transition-all cursor-pointer group hover:rotate-6`}
            >
              E
            </div>
            <div className="hidden sm:flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-gold/90">{loc?.country || 'Detecting...'}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{loc?.city || 'Syncing Node...'}</span>
            </div>
        </div>
        
        <div className="flex-1 max-w-sm mx-12 hidden lg:block">
            <div className="relative group">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors duration-300" />
                <input 
                    type="text" 
                    placeholder="Search the global grid..." 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-full py-3.5 pl-14 pr-8 text-sm font-semibold focus:outline-none focus:border-gold/50 focus:bg-white/[0.06] transition-all duration-500 placeholder:text-gray-700 tracking-tight"
                />
            </div>
        </div>

        <div className="flex items-center space-x-5">
          <button 
            onClick={() => setActiveModule('scanner')}
            className={`p-3.5 rounded-2xl transition-all duration-500 border border-white/10 relative overflow-hidden group ${activeModule === 'scanner' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-gold hover:bg-white/10 hover:scale-105 active:scale-95'}`}
          >
            <Scan size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
          <button className="p-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl relative transition-all group active:scale-95">
            <Bell size={24} className="group-hover:shake transition-all" />
            <div className="absolute top-3.5 right-3.5 w-3 h-3 bg-red-600 rounded-full border-[3.5px] border-black"></div>
          </button>
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15 p-1 overflow-hidden hover:scale-110 transition-all duration-500 cursor-pointer shadow-xl">
            <img src="https://picsum.photos/seed/user1/100/100" className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="flex-1 overflow-y-auto z-10 relative scroll-smooth scrollbar-hide bg-transparent">
        {children}
      </main>

      {/* Bottom Nav OS-style Floating Dock */}
      <div className="px-8 pb-10 pt-4 z-50">
        <nav className="flex justify-around items-center py-5 px-6 bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex flex-col items-center space-y-2 transition-all duration-700 group ${
                  isActive ? 'text-white' : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                <div className={`p-4 rounded-[1.4rem] transition-all duration-700 relative ${isActive ? `bg-gradient-to-br ${EKAN_GRADIENT_CSS} shadow-[0_15px_40px_-5px_rgba(206,17,38,0.5)] scale-110` : 'hover:bg-white/5 hover:scale-105'}`}>
                  <Icon size={24} className={isActive ? 'stroke-[3px] text-black' : 'stroke-[1.5px] group-hover:scale-110 transition-transform duration-500'} />
                </div>
                <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1 scale-90'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
