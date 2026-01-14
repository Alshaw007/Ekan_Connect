
import React, { useState } from 'react';
import { Search, Globe, Star, Plus, MoreHorizontal, MessageCircle } from './Icons';
import { COLORS, EKAN_GRADIENT_CSS } from '../constants';
import { NewsItem } from '../types';

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Lofa County Farmers Export Record Coffee Volumes',
    source: 'EKAN Local',
    content: 'Innovative cooperatives in Northern Liberia are seeing 40% growth in organic coffee exports to European markets.',
    image: 'https://picsum.photos/seed/coffee/800/400',
    category: 'Local',
    timestamp: '1h ago',
    likes: 85,
  },
  {
    id: '2',
    title: 'Global Tech Giants Pivot to African Fiber Infrastructure',
    source: 'Reuters / EKAN Global',
    content: 'New undersea cables connecting Lagos to Monrovia promise gigabit speeds for all coastal cities.',
    image: 'https://picsum.photos/seed/cable/800/400',
    category: 'Global',
    timestamp: '4h ago',
    likes: 242,
  }
];

const Feed: React.FC = () => {
  const [category, setCategory] = useState<'Local' | 'Global'>('Local');

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Microblogging Input */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex-shrink-0 overflow-hidden shadow-lg border border-white/10 p-0.5">
            <img src="https://picsum.photos/seed/user1/100/100" alt="me" className="w-full h-full rounded-2xl grayscale" />
          </div>
          <textarea 
            placeholder="What's happening in your corner of the grid?"
            className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-medium resize-none pt-3 h-20 placeholder:text-gray-600"
          />
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
          <div className="flex space-x-2">
            <button className="p-3 bg-white/5 rounded-2xl text-gold hover:bg-white/10 transition-all"><Globe size={20} /></button>
            <button className="p-3 bg-white/5 rounded-2xl text-green-500 hover:bg-white/10 transition-all"><Star size={20} /></button>
          </div>
          <button className={`px-10 py-3 rounded-full text-black font-black text-xs uppercase tracking-widest bg-gradient-to-r ${EKAN_GRADIENT_CSS} shadow-2xl shadow-red-600/20 active:scale-95 transition-all`}>
            SHARE
          </button>
        </div>
      </div>

      {/* Content Toggle */}
      <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-full max-w-xs mx-auto">
        <button
          onClick={() => setCategory('Local')}
          className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            category === 'Local' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Local
        </button>
        <button
          onClick={() => setCategory('Global')}
          className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            category === 'Global' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Global
        </button>
      </div>

      {/* Micro-Feed */}
      <div className="space-y-8 pb-10">
        {MOCK_NEWS.filter(n => n.category === category).map((news) => (
          <article key={news.id} className="group bg-white/5 backdrop-blur-xl rounded-[3rem] p-4 border border-white/10 hover:border-gold/20 transition-all duration-500 shadow-xl">
            <div className="relative overflow-hidden rounded-[2.2rem] aspect-[16/9] mb-6 shadow-2xl">
              <img src={news.image} alt={news.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-[2s] grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center space-x-3">
                 <div className="bg-white/10 backdrop-blur-2xl px-5 py-2 rounded-full text-[11px] uppercase font-black tracking-[0.2em] border border-white/20 text-gold shadow-2xl">
                    {news.source}
                 </div>
              </div>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <h2 className="text-2xl font-black leading-tight tracking-tighter group-hover:text-gold transition-colors duration-300">{news.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-3">{news.content}</p>
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                 <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">{news.timestamp}</div>
                 <div className="flex space-x-8">
                    <button className="flex items-center space-x-2.5 text-gray-500 hover:text-red-500 transition-all group/btn">
                        <Star size={20} className="group-hover/btn:fill-red-500 transition-all" /> <span className="text-sm font-black tracking-tight">{news.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2.5 text-gray-500 hover:text-indigo-500 transition-all">
                        <MessageCircle size={20} /> <span className="text-sm font-black tracking-tight">12</span>
                    </button>
                    <button className="text-gray-600 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
                 </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Feed;
