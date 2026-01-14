
import React, { useState, useEffect } from 'react';
import { Search, Globe, Star, Plus, MoreHorizontal, MessageCircle, X, ChevronRight, Sparkles, ShieldCheck } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { NewsItem, UserStory, Post } from '../types';

interface FeedProps {
  externalPosts: Post[];
  onAddPost: (content: string) => void;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Lofa County Farmers Export Record Coffee Volumes',
    source: 'EKAN Local',
    content: 'Innovative cooperatives in Northern Liberia are seeing 40% growth in organic coffee exports.',
    image: 'https://picsum.photos/seed/coffee/800/400',
    category: 'Local',
    timestamp: '1h ago',
    likes: 85,
  },
  {
    id: 'n2',
    title: 'New Undersea Cable Connection Live',
    source: 'EKAN Global',
    content: 'The 10Tbps bridge connection between Monrovia and Lisbon is officially operational.',
    image: 'https://picsum.photos/seed/cable/800/400',
    category: 'Global',
    timestamp: '4h ago',
    likes: 242,
  }
];

const MOCK_STORIES: UserStory[] = [
  {
    userId: 'u1',
    userName: 'Josephine',
    userAvatar: 'https://picsum.photos/seed/j1/100/100',
    hasUnseen: true,
    stories: [{ id: 's1', content: 'https://picsum.photos/seed/story1/1080/1920', type: 'image', timestamp: new Date() }]
  },
  {
    userId: 'u2',
    userName: 'Kwame',
    userAvatar: 'https://picsum.photos/seed/k1/100/100',
    hasUnseen: true,
    stories: [{ id: 's3', content: 'https://picsum.photos/seed/story3/1080/1920', type: 'image', timestamp: new Date() }]
  }
];

const Feed: React.FC<FeedProps> = ({ externalPosts, onAddPost }) => {
  const [category, setCategory] = useState<'Local' | 'Global'>('Local');
  const [postInput, setPostInput] = useState('');
  const [activeStoryGroup, setActiveStoryGroup] = useState<UserStory | null>(null);
  const [vibeScore, setVibeScore] = useState(88);

  useEffect(() => {
    const interval = setInterval(() => {
      setVibeScore(prev => Math.min(100, Math.max(80, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePost = () => {
    if (!postInput.trim()) return;
    onAddPost(postInput);
    setPostInput('');
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-24">
      {/* Vibe HUD */}
      <div className="px-6 pt-4 flex items-center justify-between">
         <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Sparkles size={12} className="text-gold" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Grid Resonance: <span className="text-white">{vibeScore}%</span></span>
         </div>
         <div className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400">Trending Now</div>
      </div>

      {/* Stories Bar */}
      <div className="px-6 py-4 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-5">
          <div className="flex flex-col items-center space-y-2 flex-shrink-0 group cursor-pointer">
            <div className="relative">
              <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-gold/50 transition-all">
                <img src="https://picsum.photos/seed/me/100/100" className="w-full h-full rounded-[1.6rem] grayscale object-cover p-1 opacity-50" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-full border-4 border-[#050505] flex items-center justify-center text-black`}>
                <Plus size={14} strokeWidth={3} />
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">My Status</span>
          </div>

          {MOCK_STORIES.map((group) => (
            <div key={group.userId} onClick={() => setActiveStoryGroup(group)} className="flex flex-col items-center space-y-2 flex-shrink-0 group cursor-pointer">
              <div className={`p-[2px] rounded-[1.8rem] bg-gradient-to-br ${group.hasUnseen ? EKAN_GRADIENT_CSS : 'from-white/10 to-white/5'} shadow-xl`}>
                <div className="w-16 h-16 bg-black rounded-[1.7rem] p-1">
                  <img src={group.userAvatar} className="w-full h-full rounded-[1.5rem] object-cover group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{group.userName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {/* Post Input */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 overflow-hidden shadow-lg border border-white/10 p-0.5">
              <img src="https://picsum.photos/seed/user1/100/100" alt="me" className="w-full h-full rounded-2xl grayscale" />
            </div>
            <textarea 
              value={postInput}
              onChange={(e) => setPostInput(e.target.value)}
              placeholder="What are you manifesting today?"
              className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-medium resize-none pt-2 h-20 placeholder:text-gray-600"
            />
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
            <div className="flex space-x-2">
              <button className="p-3 bg-white/5 rounded-2xl text-gold hover:bg-white/10 transition-all"><Globe size={18} /></button>
              <button className="p-3 bg-white/5 rounded-2xl text-green-500 hover:bg-white/10 transition-all"><ShieldCheck size={18} /></button>
            </div>
            <button 
              onClick={handlePost}
              className={`px-10 py-3 rounded-full text-black font-black text-xs uppercase tracking-widest bg-gradient-to-r ${EKAN_GRADIENT_CSS} shadow-2xl active:scale-95 transition-all`}
            >
              MANIFEST
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-full max-w-xs mx-auto shadow-inner">
          {['Local', 'Global'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                category === cat ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {externalPosts.map(post => (
            <article key={post.id} className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 p-0.5 shadow-xl">
                    <img src={post.thumbnail} className="w-full h-full rounded-lg object-cover" />
                 </div>
                 <div>
                    <div className="flex items-center">
                      <h4 className="font-black text-sm tracking-tight text-white">{post.authorName}</h4>
                      <div className="w-3 h-3 bg-indigo-500 rounded-full ml-2 flex items-center justify-center"><ShieldCheck size={8} className="text-white" /></div>
                    </div>
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{post.timestamp}</p>
                 </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed font-medium mb-4">{post.content}</p>
              <img src={post.thumbnail} className="w-full aspect-video object-cover rounded-[2rem] mb-4 border border-white/5 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
              <div className="flex items-center space-x-6 pt-4 border-t border-white/5">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-gold transition-colors"><Star size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">{post.likes}</span></button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-400 transition-colors"><MessageCircle size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">0</span></button>
              </div>
            </article>
          ))}
        </div>

        {/* News Feed */}
        <div className="space-y-8 pb-20">
          {MOCK_NEWS.filter(n => n.category === category).map((news) => (
            <article key={news.id} className="group bg-white/5 backdrop-blur-xl rounded-[3rem] p-4 border border-white/10 hover:border-gold/20 transition-all duration-500 shadow-xl">
              <div className="relative overflow-hidden rounded-[2.5rem] aspect-[16/9] mb-6 shadow-2xl">
                <img src={news.image} alt={news.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-[2s] grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-2xl px-5 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.2em] border border-white/20 text-gold shadow-2xl">
                    {news.source}
                </div>
              </div>
              <div className="px-4 pb-4 space-y-4">
                <h2 className="text-2xl font-black leading-tight tracking-tighter group-hover:text-gold transition-colors duration-300">{news.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-3">{news.content}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em]">{news.timestamp}</div>
                  <div className="flex space-x-6">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-all"><Star size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">{news.likes}</span></button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-500 transition-all"><MessageCircle size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">12</span></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeStoryGroup && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">
           <div className="flex-1 relative">
              <img src={activeStoryGroup.stories[0].content} className="w-full h-full object-cover" />
              <div className="absolute top-10 left-6 flex items-center space-x-3 bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
                 <img src={activeStoryGroup.userAvatar} className="w-8 h-8 rounded-lg border border-white/20" />
                 <span className="text-sm font-black text-white">{activeStoryGroup.userName}</span>
              </div>
              <button onClick={() => setActiveStoryGroup(null)} className="absolute top-10 right-6 p-4 bg-white/10 backdrop-blur-2xl rounded-full text-white"><X size={24} /></button>
           </div>
           <div className="p-6 pb-12 bg-black border-t border-white/5">
              <input type="text" placeholder="Bridge a response..." className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-6 text-sm text-white focus:outline-none focus:border-gold/30 transition-all" />
           </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
