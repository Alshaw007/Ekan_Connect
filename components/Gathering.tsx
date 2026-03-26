
import React, { useState } from 'react';
import { Plus, Search, Calendar, ChevronRight, User as UserIcon, Globe, ShieldCheck, MessageSquare, Sparkles, Star, Phone, Video, Link2, X, Clock } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Event, User } from '../types';
import { useFirebase } from './FirebaseProvider';

interface GatheringProps {
  users: User[];
  onStartChat: (user: User) => void;
}

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'LPA Connect: Business Networking',
    date: 'March 15, 2025',
    location: 'Royal Grand Hotel, Monrovia',
    type: 'Professional',
    price: 25.00,
    attendees: 120,
    image: 'https://picsum.photos/seed/networking/800/600',
    isTicketed: true,
    hasGroupChat: true,
    time: '14:00',
    category: 'Professional'
  },
  {
    id: '2',
    title: 'Sun & Bass: Beach Party',
    date: 'April 02, 2025',
    location: 'Libassa Eco Resort',
    type: 'Social',
    price: 15.00,
    attendees: 450,
    image: 'https://picsum.photos/seed/beach/800/600',
    isTicketed: true,
    hasGroupChat: true,
    time: '16:00',
    category: 'Social'
  }
];

const Gathering: React.FC<GatheringProps> = ({ users, onStartChat }) => {
  const { user: authUser } = useFirebase();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.id !== authUser?.uid && 
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.handle?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] overflow-hidden pb-20">
      {/* Search Bar */}
      <div className="p-3 bg-[#F0F2F5] dark:bg-[#111b21]">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Search events or people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#202c33] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-0 dark:text-[#e9edef] dark:placeholder-[#8696a0]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Create Link Section */}
        <div className="px-4 py-3 flex items-center hover:bg-slate-50 dark:hover:bg-[#182229] cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white">
            <Link2 size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-bold dark:text-[#e9edef]">Create call link</p>
            <p className="text-xs text-slate-500 dark:text-[#8696a0]">Share a link for your EKAN gathering</p>
          </div>
        </div>

        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest mb-2">Recent</h3>
          
          {/* Mock Events as "Recent Calls" */}
          {MOCK_EVENTS.map(event => (
            <div key={event.id} className="flex items-center py-3 hover:bg-slate-50 dark:hover:bg-[#182229] cursor-pointer group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                <img src={event.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="ml-4 flex-1 border-b border-slate-100 dark:border-slate-700/50 pb-3 group-last:border-none">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold dark:text-[#e9edef]">{event.title}</p>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Video size={12} className="text-emerald-500" />
                      <p className="text-xs text-slate-500 dark:text-[#8696a0]">{event.date} • {event.time}</p>
                    </div>
                  </div>
                  <button className="text-brand-green p-2 hover:bg-brand-green/10 rounded-full transition-colors">
                    <Video size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connect Hub Section */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest mb-2">Connect Hub</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredUsers.map(user => (
              <div key={user.id} className="flex items-center py-3 hover:bg-slate-50 dark:hover:bg-[#182229] cursor-pointer group" onClick={() => onStartChat(user)}>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-navy text-white font-bold">
                      {user.name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1 border-b border-slate-100 dark:border-slate-700/50 pb-3 group-last:border-none">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold dark:text-[#e9edef]">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#8696a0]">@{user.handle || 'user'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-brand-green p-2 hover:bg-brand-green/10 rounded-full transition-colors">
                        <Phone size={20} />
                      </button>
                      <button className="text-brand-green p-2 hover:bg-brand-green/10 rounded-full transition-colors">
                        <Video size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gathering;
