
import React, { useState } from 'react';
import { Plus, Search, Calendar, ChevronRight, User, Globe, ShieldCheck, MessageCircle, Sparkles, Star, Phone } from './Icons';
import { COLORS, EKAN_GRADIENT_CSS } from '../constants';
import { Event, User as UserType } from '../types';

interface GatheringProps {
  onStartChat: (user: UserType) => void;
}

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'LPA Connect: Business Networking',
    date: 'March 15, 2025',
    location: 'Royal Grand Hotel, Monrovia',
    type: 'Professional',
    price: 25.00,
    image: 'https://picsum.photos/seed/networking/800/600',
    isTicketed: true,
    hasGroupChat: true,
  },
  {
    id: '2',
    title: 'Sun & Bass: Beach Party',
    date: 'April 02, 2025',
    location: 'Libassa Eco Resort',
    type: 'Social',
    price: 15.00,
    image: 'https://picsum.photos/seed/beach/800/600',
    isTicketed: true,
    hasGroupChat: true,
  }
];

const MOCK_DISCOVERY: UserType[] = [
  { id: 'u1', name: 'Zoe M.', avatar: 'Z', location: 'London, UK', interests: ['Investments', 'Art'], languages: ['English', 'French'], bio: "Art curator and angel investor looking for Liberian talent." },
  { id: 'u2', name: 'Kwame O.', avatar: 'K', location: 'Accra, Ghana', interests: ['Music Production', 'Afrobeats'], languages: ['English', 'Twi'], bio: "Producer at O-Sound. Let's make some hits together." },
  { id: 'u3', name: 'Chen X.', avatar: 'C', location: 'Beijing, China', interests: ['Logistics', 'Trade'], languages: ['Mandarin', 'English'], bio: "Infrastructure developer exploring partnerships in West Africa." },
  { id: 'u4', name: 'Marie T.', avatar: 'M', location: 'Monrovia, Liberia', interests: ['Fashion', 'Social Tech'], languages: ['English', 'Kru'], bio: "Founder of Monrovia Styles. Building the local creator economy." },
];

const Gathering: React.FC<GatheringProps> = ({ onStartChat }) => {
  const [mode, setMode] = useState<'events' | 'discovery'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<string[]>([]);

  const toggleFriend = (id: string) => {
    if (friends.includes(id)) {
      setFriends(friends.filter(f => f !== id));
    } else {
      setFriends([...friends, id]);
    }
  };

  const filteredDiscovery = MOCK_DISCOVERY.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.interests?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-8 h-full flex flex-col">
      {/* Mode Navigation */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-black tracking-tighter">Gathering</h1>
        <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <button 
                onClick={() => setMode('events')}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'events' ? `bg-white/10 text-white shadow-lg` : 'text-gray-600 hover:text-gray-400'}`}
            >
                The Gathering
            </button>
            <button 
                onClick={() => setMode('discovery')}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'discovery' ? `bg-white/10 text-white shadow-lg` : 'text-gray-600 hover:text-gray-400'}`}
            >
                Connect Hub
            </button>
        </div>
      </div>

      {mode === 'events' ? (
        <div className="space-y-8 animate-in fade-in duration-700 flex-1">
          <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
            {['All Events', 'Professional', 'Concerts', 'Social', 'My Tickets'].map((cat, i) => (
              <button key={cat} className={`px-7 py-2.5 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${i === 0 ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {MOCK_EVENTS.map((event) => (
              <div key={event.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3.5rem] overflow-hidden hover:border-gold/20 transition-all duration-500 shadow-2xl">
                <div className="relative aspect-[21/9]">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-[1.5s]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute top-8 left-8 flex space-x-3">
                    <div className="bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 text-gold shadow-2xl">
                        {event.type}
                    </div>
                    {event.hasGroupChat && (
                        <div className="bg-green-600/30 backdrop-blur-2xl px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20 text-green-400 shadow-2xl flex items-center">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                           Live Chat
                        </div>
                    )}
                  </div>
                </div>
                <div className="p-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tighter leading-none">{event.title}</h3>
                        <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em]">{event.location}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-white tracking-tighter"><span className="text-gold text-sm mr-1">$</span>{event.price.toFixed(2)}</div>
                        <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Managed via Escrow</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className={`flex-1 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-red-600/20 active:scale-95 transition-all`}>
                      Get Ticket
                    </button>
                    <button className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-xl">
                        <MessageCircle size={24} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 via-black/40 to-black/80 backdrop-blur-3xl p-10 rounded-[4rem] border border-indigo-500/20 flex justify-between items-center group cursor-pointer shadow-2xl mt-12 mb-20">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <ShieldCheck size={18} className="text-indigo-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-300">Resale Marketplace</span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Verified P2P Exchange</h2>
              <p className="text-sm text-indigo-200/50 font-medium leading-relaxed">Safety-first ticket resale within the EKAN ecosystem.</p>
            </div>
            <div className={`w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all border border-white/10`}>
              <ChevronRight size={32} className="text-indigo-400" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right duration-700 pb-20 flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col items-center text-center space-y-6 py-8">
                <div className={`w-20 h-20 rounded-[2.2rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} flex items-center justify-center shadow-2xl mb-2`}>
                    <Sparkles size={40} className="text-black" />
                </div>
                <div className="space-y-2 px-8">
                  <h2 className="text-4xl font-black tracking-tighter">The Connect Hub</h2>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">Discover professionals, creators, and partners based on shared interests.</p>
                </div>
            </div>

            {/* Search Hub */}
            <div className="px-2">
                <div className="relative group">
                    <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by Interest (e.g. Afrobeats, Fintech, Art)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-16 pr-8 text-sm focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all"
                    />
                </div>
            </div>
            
            <div className="space-y-6">
                {filteredDiscovery.map(user => (
                    <div key={user.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white/10 flex flex-col space-y-6 group hover:border-gold/30 transition-all duration-500 shadow-xl overflow-hidden relative">
                        {/* Status bar */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                <Globe size={14} className="text-green-500" />
                                <span>{user.location}</span>
                            </div>
                            <button 
                              onClick={() => toggleFriend(user.id)}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all text-[9px] font-black uppercase tracking-widest ${friends.includes(user.id) ? 'bg-green-500 border-green-500 text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                            >
                                {friends.includes(user.id) ? <ShieldCheck size={12} /> : <Plus size={12} />}
                                <span>{friends.includes(user.id) ? 'Connected' : 'Add Friend'}</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className={`w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-gold font-black text-4xl shadow-inner relative group-hover:scale-105 transition-transform duration-500`}>
                                {user.avatar}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0B0B0B]"></div>
                            </div>
                            <div className="space-y-1 flex-1">
                                <h4 className="font-black text-2xl tracking-tighter flex items-center">
                                  {user.name}
                                  <Star size={16} className="ml-2 text-gold fill-gold" />
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{user.bio}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                            {user.interests?.map(interest => (
                                <span key={interest} className="text-[9px] bg-white/5 text-gray-400 px-4 py-2 rounded-full border border-white/10 uppercase font-black tracking-widest group-hover:border-gold/20 transition-all">{interest}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <button 
                             onClick={() => onStartChat(user)}
                             className="flex items-center justify-center space-x-3 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-lg active:scale-95"
                           >
                              <MessageCircle size={18} className="text-indigo-400" />
                              <span>Message</span>
                           </button>
                           <button className="flex items-center justify-center space-x-3 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-lg active:scale-95">
                              <Phone size={18} className="text-gold" />
                              <span>Bridge Call</span>
                           </button>
                        </div>
                    </div>
                ))}

                {filteredDiscovery.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                      <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No partners found for this interest grid.</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-gold text-[10px] font-black uppercase tracking-widest border-b border-gold/30"
                      >
                        Reset Hub Search
                      </button>
                  </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Gathering;
