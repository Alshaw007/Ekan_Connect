
import React, { useState, useEffect } from 'react';
import { Search, Globe, Star, Plus, MessageCircle, X, Sparkles, ShieldCheck } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { NewsItem, Post } from '../types';

interface FeedProps {
  externalPosts: Post[];
  onAddPost: (content: string) => void;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'The Great Rail: Lagos to Abidjan Bridge',
    source: 'Grid Daily',
    content: 'Economic corridor officially linked via secure blockchain logistics, reducing transit time by 60%.',
    image: 'https://picsum.photos/seed/rail/1200/600',
    category: 'Global',
    timestamp: '1h ago',
    likes: 1240,
  },
  {
    id: 'n2',
    title: 'Monrovia Tech Summit 2025',
    source: 'Node Express',
    content: 'Over 5,000 creators gathered today to manifest the next generation of Pan-African digital identities.',
    image: 'https://picsum.photos/seed/summit/1200/600',
    category: 'Local',
    timestamp: '4h ago',
    likes: 842,
  }
];

const Feed: React.FC<FeedProps> = ({ externalPosts, onAddPost }) => {
  const [category, setCategory] = useState<'Local' | 'Global'>('Local');
  const [postInput, setPostInput] = useState('');
  const [resonance, setResonance] = useState(94.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setResonance(prev => parseFloat((prev + (Math.random() > 0.5 ? 0.1 : -0.1)).toFixed(1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePost = () => {
    if (!postInput.trim()) return;
    onAddPost(postInput);
    setPostInput('');
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-28 overflow-hidden">
      {/* resonance HUD */}
      <div className="px-10 pt-8 flex items-center justify-between z-20">
         <div className="flex items-center space-x-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 shadow-xl backdrop-blur-2xl">
            <Sparkles size={16} className="text-gold animate-bounce" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Grid Resonance: <span className="text-white">{resonance}%</span></span>
         </div>
         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 flex items-center">
           <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 animate-ping shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
           Resonance Stream
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
        {/* Manifestation Entry */}
        <div className="bg-white/5 backdrop-blur-[100px] p-10 rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-indigo-600/5 opacity-40 rounded-[4rem] pointer-events-none"></div>
          <div className="flex items-start space-x-6 relative z-10">
            <div className={`w-18 h-18 rounded-[2rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-2xl`}>
              <img src="https://picsum.photos/seed/me_profile/150/150" alt="me" className="w-full h-full object-cover rounded-[1.9rem]" />
            </div>
            <textarea 
              value={postInput}
              onChange={(e) => setPostInput(e.target.value)}
              placeholder="What are you manifesting on the grid today?"
              className="flex-1 bg-transparent border-none focus:outline-none text-xl font-medium resize-none pt-4 h-32 placeholder:text-gray-800 tracking-tight"
            />
          </div>
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5 relative z-10">
            <div className="flex space-x-4">
              <button className="p-4 bg-white/5 rounded-2xl text-gold hover:bg-white/10 hover:scale-105 transition-all"><Globe size={24} /></button>
              <button className="p-4 bg-white/5 rounded-2xl text-green-500 hover:bg-white/10 hover:scale-105 transition-all"><ShieldCheck size={24} /></button>
            </div>
            <button 
              onClick={handlePost}
              className={`px-16 py-5 rounded-[2.5rem] text-black font-black text-xs uppercase tracking-[0.4em] bg-gradient-to-r ${EKAN_GRADIENT_CSS} shadow-[0_20px_50px_rgba(206,17,38,0.4)] active:scale-95 hover:brightness-110 transition-all`}
            >
              MANIFEST
            </button>
          </div>
        </div>

        {/* stream filter */}
        <div className="flex bg-white/5 backdrop-blur-3xl p-2 rounded-[2.5rem] border border-white/10 w-full max-w-sm mx-auto shadow-2xl">
          {['Local', 'Global'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`flex-1 py-4 rounded-[2.2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${
                category === cat ? 'bg-white/10 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* The Grid Manifest */}
        <div className="space-y-12 pb-16">
          {externalPosts.length === 0 && category === 'Local' && (
            <div className="py-24 text-center space-y-6 opacity-30">
              <Sparkles size={64} className="mx-auto text-gray-500 animate-pulse" />
              <p className="text-[12px] font-black uppercase tracking-[0.6em]">Awaiting node manifestations...</p>
            </div>
          )}
          
          {externalPosts.map(post => (
            <article key={post.id} className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-10 border border-white/10 animate-in fade-in slide-in-from-bottom-10 duration-1000 shadow-[0_30px_70px_rgba(0,0,0,0.5)] group overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-5">
                   <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-red-600 to-gold p-0.5 shadow-2xl">
                      <img src={post.thumbnail} className="w-full h-full rounded-[1.7rem] object-cover" />
                   </div>
                   <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-xl tracking-tight text-white">{post.authorName}</h4>
                        <ShieldCheck size={18} className="text-indigo-400" />
                      </div>
                      <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mt-1">{post.timestamp} • Node Prime</p>
                   </div>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl text-gray-600 hover:text-white transition-all cursor-pointer"><Star size={20} /></div>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed font-medium mb-8 tracking-tight px-2">{post.content}</p>
              <div className="relative overflow-hidden rounded-[3rem] mb-8 shadow-3xl border border-white/5">
                <img src={post.thumbnail} className="w-full aspect-video object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="flex items-center space-x-12 pt-8 border-t border-white/5 px-4">
                <button className="flex items-center space-x-3 text-gray-500 hover:text-gold transition-all group/btn"><Star size={24} className="group-hover/btn:scale-125 transition-transform" /> <span className="text-[12px] font-black uppercase tracking-widest">{post.likes}</span></button>
                <button className="flex items-center space-x-3 text-gray-500 hover:text-indigo-400 transition-all group/btn"><MessageCircle size={24} className="group-hover/btn:scale-125 transition-transform" /> <span className="text-[12px] font-black uppercase tracking-widest">Connect</span></button>
              </div>
            </article>
          ))}
          
          {MOCK_NEWS.filter(n => n.category === category).map((news) => (
            <article key={news.id} className="group bg-white/5 backdrop-blur-[120px] rounded-[4.5rem] p-10 border border-white/10 hover:border-gold/30 transition-all duration-1000 shadow-3xl overflow-hidden relative">
              <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-3xl px-6 py-3 rounded-full text-[11px] uppercase font-black tracking-[0.4em] border border-white/20 text-gold shadow-2xl z-10">
                  {news.source}
              </div>
              <div className="relative overflow-hidden rounded-[3.5rem] aspect-[16/9] mb-10 shadow-3xl border border-white/5">
                <img src={news.image} alt={news.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-[3s] grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
              </div>
              <div className="px-4 pb-4 space-y-6">
                <h2 className="text-4xl font-black leading-[1.1] tracking-tighter group-hover:text-gold transition-colors duration-700">{news.title}</h2>
                <p className="text-base text-gray-500 leading-relaxed font-medium line-clamp-3 tracking-tight">{news.content}</p>
                <div className="flex items-center justify-between pt-10 border-t border-white/5">
                  <div className="text-[11px] text-gray-600 font-black uppercase tracking-[0.5em]">{news.timestamp}</div>
                  <div className="flex space-x-10">
                      <button className="flex items-center space-x-3 text-gray-500 hover:text-red-500 transition-all group/btn"><Star size={24} className="group-hover/btn:scale-125 transition-transform" /> <span className="text-[12px] font-black uppercase tracking-widest">{news.likes}</span></button>
                      <button className="flex items-center space-x-3 text-gray-500 hover:text-indigo-500 transition-all group/btn"><MessageCircle size={24} className="group-hover/btn:scale-125 transition-transform" /> <span className="text-[12px] font-black uppercase tracking-widest">Share</span></button>
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
