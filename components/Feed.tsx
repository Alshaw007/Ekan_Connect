
import React, { useState, useEffect } from 'react';
import { Search, Globe, Star, Plus, MessageCircle, X, Sparkles, ShieldCheck } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { NewsItem, UserStory, Post } from '../types';

interface FeedProps {
  externalPosts: Post[];
  onAddPost: (content: string) => void;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Continental Bridge live in Accra',
    source: 'EKAN Global',
    content: 'The new high-speed rail and digital bridge connecting West African tech hubs is now operational.',
    image: 'https://picsum.photos/seed/tech/800/400',
    category: 'Global',
    timestamp: '2h ago',
    likes: 412,
  },
  {
    id: 'n2',
    title: 'Monrovia Arts Festival 2025',
    source: 'Local Node',
    content: 'Creators from across the continent are gathering in Sinkor for a month-long celebration of digital manifestation.',
    image: 'https://picsum.photos/seed/art/800/400',
    category: 'Local',
    timestamp: '5h ago',
    likes: 89,
  }
];

const Feed: React.FC<FeedProps> = ({ externalPosts, onAddPost }) => {
  const [category, setCategory] = useState<'Local' | 'Global'>('Local');
  const [postInput, setPostInput] = useState('');
  const [vibeScore, setVibeScore] = useState(92);

  useEffect(() => {
    const interval = setInterval(() => {
      setVibeScore(prev => Math.min(100, Math.max(85, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePost = () => {
    if (!postInput.trim()) return;
    onAddPost(postInput);
    setPostInput('');
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-24 overflow-hidden">
      {/* Vibe HUD */}
      <div className="px-8 pt-6 flex items-center justify-between z-20">
         <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <Sparkles size={14} className="text-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Grid Resonance: <span className="text-white">{vibeScore}%</span></span>
         </div>
         <div className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 flex items-center">
           <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 animate-ping"></div>
           Pulse Stream
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
        {/* Post Input - Manifestation Tool */}
        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-start space-x-5">
            <div className="w-14 h-14 rounded-[1.2rem] bg-indigo-600 flex-shrink-0 overflow-hidden shadow-xl border border-white/10">
              <img src="https://picsum.photos/seed/me_profile/100/100" alt="me" className="w-full h-full object-cover" />
            </div>
            <textarea 
              value={postInput}
              onChange={(e) => setPostInput(e.target.value)}
              placeholder="What are you manifesting on the grid today?"
              className="flex-1 bg-transparent border-none focus:outline-none text-[17px] font-medium resize-none pt-3 h-24 placeholder:text-gray-700 tracking-tight"
            />
          </div>
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
            <div className="flex space-x-3">
              <button className="p-3 bg-white/5 rounded-2xl text-gold hover:bg-white/10 transition-all"><Globe size={20} /></button>
              <button className="p-3 bg-white/5 rounded-2xl text-green-500 hover:bg-white/10 transition-all"><ShieldCheck size={20} /></button>
            </div>
            <button 
              onClick={handlePost}
              className={`px-12 py-4 rounded-full text-black font-black text-xs uppercase tracking-[0.2em] bg-gradient-to-r ${EKAN_GRADIENT_CSS} shadow-2xl active:scale-95 transition-all`}
            >
              MANIFEST
            </button>
          </div>
        </div>

        {/* Global/Local Toggle */}
        <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-full max-w-sm mx-auto shadow-inner">
          {['Local', 'Global'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all ${
                category === cat ? 'bg-white/10 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Post Stream */}
        <div className="space-y-8 pb-10">
          {externalPosts.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-20">
              <Sparkles size={48} className="mx-auto text-gray-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">No recent manifestations detected.</p>
            </div>
          )}
          {externalPosts.map(post => (
            <article key={post.id} className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 border border-white/10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center space-x-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-gold p-0.5 shadow-xl">
                    <img src={post.thumbnail} className="w-full h-full rounded-[1.1rem] object-cover" />
                 </div>
                 <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-base tracking-tight text-white">{post.authorName}</h4>
                      <ShieldCheck size={14} className="text-indigo-400" />
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{post.timestamp}</p>
                 </div>
              </div>
              <p className="text-base text-gray-300 leading-relaxed font-medium mb-6 tracking-tight">{post.content}</p>
              <div className="relative overflow-hidden rounded-[2.5rem] mb-6 shadow-2xl border border-white/5">
                <img src={post.thumbnail} className="w-full aspect-video object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s] hover:scale-105" />
              </div>
              <div className="flex items-center space-x-8 pt-6 border-t border-white/5">
                <button className="flex items-center space-x-2.5 text-gray-500 hover:text-gold transition-all"><Star size={20} /> <span className="text-[11px] font-black uppercase tracking-widest">{post.likes}</span></button>
                <button className="flex items-center space-x-2.5 text-gray-500 hover:text-indigo-400 transition-all"><MessageCircle size={20} /> <span className="text-[11px] font-black uppercase tracking-widest">Connect</span></button>
              </div>
            </article>
          ))}
          
          {/* News Feed Items */}
          {MOCK_NEWS.filter(n => n.category === category).map((news) => (
            <article key={news.id} className="group bg-white/5 backdrop-blur-xl rounded-[3.5rem] p-6 border border-white/10 hover:border-gold/30 transition-all duration-700 shadow-2xl overflow-hidden">
              <div className="relative overflow-hidden rounded-[3rem] aspect-[16/9] mb-8 shadow-2xl">
                <img src={news.image} alt={news.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-[2s] grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-2xl px-5 py-2.5 rounded-full text-[10px] uppercase font-black tracking-[0.3em] border border-white/20 text-gold shadow-2xl">
                    {news.source}
                </div>
              </div>
              <div className="px-4 pb-4 space-y-4">
                <h2 className="text-3xl font-black leading-none tracking-tighter group-hover:text-gold transition-colors duration-500">{news.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-2 tracking-tight">{news.content}</p>
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">{news.timestamp}</div>
                  <div className="flex space-x-8">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-all"><Star size={20} /> <span className="text-[11px] font-black uppercase tracking-widest">{news.likes}</span></button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-500 transition-all"><MessageCircle size={20} /> <span className="text-[11px] font-black uppercase tracking-widest">Share</span></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;
