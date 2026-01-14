
import React, { useState, useEffect } from 'react';
import { Search, Globe, Star, Plus, MoreHorizontal, MessageCircle, X, ChevronRight, ChevronLeft, ShieldCheck, Sparkles } from './Icons';
import { COLORS, EKAN_GRADIENT_CSS } from '../constants';
import { NewsItem, UserStory, Story } from '../types';

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

const MOCK_STORIES: UserStory[] = [
  {
    userId: 'u1',
    userName: 'Josephine',
    userAvatar: 'https://picsum.photos/seed/j1/100/100',
    hasUnseen: true,
    stories: [
      { id: 's1', content: 'https://picsum.photos/seed/story1/1080/1920', type: 'image', timestamp: new Date() },
      { id: 's2', content: 'https://picsum.photos/seed/story2/1080/1920', type: 'image', timestamp: new Date() },
    ]
  },
  {
    userId: 'u2',
    userName: 'Kwame',
    userAvatar: 'https://picsum.photos/seed/k1/100/100',
    hasUnseen: true,
    stories: [
      { id: 's3', content: 'https://picsum.photos/seed/story3/1080/1920', type: 'image', timestamp: new Date() },
    ]
  },
  {
    userId: 'u3',
    userName: 'Zoe M.',
    userAvatar: 'https://picsum.photos/seed/z1/100/100',
    hasUnseen: false,
    stories: [
      { id: 's4', content: 'https://picsum.photos/seed/story4/1080/1920', type: 'image', timestamp: new Date() },
    ]
  }
];

const Feed: React.FC = () => {
  const [category, setCategory] = useState<'Local' | 'Global'>('Local');
  const [activeStoryGroup, setActiveStoryGroup] = useState<UserStory | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);

  // Story Timer
  useEffect(() => {
    let timer: any;
    if (activeStoryGroup) {
      setStoryProgress(0);
      timer = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds total (100 * 50ms)
    }
    return () => clearInterval(timer);
  }, [activeStoryGroup, activeStoryIndex]);

  const handleNextStory = () => {
    if (!activeStoryGroup) return;
    if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setStoryProgress(0);
    } else {
      // End of this user's stories, maybe find next user?
      const currentIndex = MOCK_STORIES.findIndex(s => s.userId === activeStoryGroup.userId);
      if (currentIndex < MOCK_STORIES.length - 1) {
        setActiveStoryGroup(MOCK_STORIES[currentIndex + 1]);
        setActiveStoryIndex(0);
      } else {
        closeStoryViewer();
      }
    }
  };

  const handlePrevStory = () => {
    if (!activeStoryGroup) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setStoryProgress(0);
    } else {
      const currentIndex = MOCK_STORIES.findIndex(s => s.userId === activeStoryGroup.userId);
      if (currentIndex > 0) {
        setActiveStoryGroup(MOCK_STORIES[currentIndex - 1]);
        setActiveStoryIndex(MOCK_STORIES[currentIndex - 1].stories.length - 1);
      } else {
        closeStoryViewer();
      }
    }
  };

  const closeStoryViewer = () => {
    setActiveStoryGroup(null);
    setActiveStoryIndex(0);
    setStoryProgress(0);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Stories Bar */}
      <div className="px-6 py-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="flex space-x-5 overflow-x-auto scrollbar-hide py-2">
          {/* Post Own Story */}
          <div className="flex flex-col items-center space-y-2 flex-shrink-0 group cursor-pointer">
            <div className="relative">
              <div className="w-16 h-16 rounded-[1.6rem] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-gold/50 transition-all">
                <img src="https://picsum.photos/seed/me/100/100" className="w-full h-full rounded-[1.4rem] grayscale object-cover p-1 opacity-50" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-full border-4 border-[#050505] flex items-center justify-center text-black`}>
                <Plus size={14} strokeWidth={3} />
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">My Status</span>
          </div>

          {/* Contact Stories */}
          {MOCK_STORIES.map((group) => (
            <div 
              key={group.userId} 
              onClick={() => {
                setActiveStoryGroup(group);
                setActiveStoryIndex(0);
              }}
              className="flex flex-col items-center space-y-2 flex-shrink-0 group cursor-pointer"
            >
              <div className={`p-[2px] rounded-[1.6rem] bg-gradient-to-br ${group.hasUnseen ? EKAN_GRADIENT_CSS : 'from-white/10 to-white/5'} shadow-xl`}>
                <div className="w-16 h-16 bg-black rounded-[1.5rem] p-1">
                  <img src={group.userAvatar} className="w-full h-full rounded-[1.3rem] object-cover group-hover:scale-105 transition-transform" />
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                {group.userName.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
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

        {/* Feed Posts */}
        <div className="space-y-8 pb-20">
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

      {/* Story Viewer Overlay */}
      {activeStoryGroup && (
        <div className="fixed inset-0 z-[200] bg-black animate-in fade-in duration-300 flex flex-col items-center justify-center">
          <div className="relative w-full h-full max-w-xl bg-[#050505] shadow-2xl overflow-hidden flex flex-col">
            {/* Top Progress Bars */}
            <div className="absolute top-6 left-6 right-6 z-[210] flex space-x-1.5">
              {activeStoryGroup.stories.map((s, idx) => (
                <div key={s.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ 
                      width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? `${storyProgress}%` : '0%' 
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-12 left-6 right-6 z-[210] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-0.5 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS}`}>
                  <div className="w-10 h-10 rounded-[0.9rem] bg-black p-0.5">
                    <img src={activeStoryGroup.userAvatar} className="w-full h-full rounded-[0.8rem] object-cover" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-white text-sm tracking-tight">{activeStoryGroup.userName}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {activeStoryGroup.stories[activeStoryIndex].timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button onClick={closeStoryViewer} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-xl transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 relative flex items-center justify-center">
              {/* Navigation Zones (Left/Right) */}
              <div onClick={handlePrevStory} className="absolute left-0 top-0 bottom-0 w-1/4 z-[205] cursor-pointer"></div>
              <div onClick={handleNextStory} className="absolute right-0 top-0 bottom-0 w-3/4 z-[205] cursor-pointer"></div>

              <img 
                src={activeStoryGroup.stories[activeStoryIndex].content} 
                className="w-full h-full object-cover"
                alt="story content"
              />

              {/* Pilot Helper for Stories (Futuristic touch) */}
              <div className="absolute bottom-12 left-6 right-6 z-[210] bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} flex items-center justify-center text-black`}>
                    <Sparkles size={18} />
                  </div>
                  <p className="text-xs text-gray-300 font-medium">EKAN-Pilot is analyzing this status...</p>
                </div>
                <button className="p-3 text-gold hover:text-white transition-all">
                   <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Bottom Interaction (WhatsApp style reply) */}
            <div className="p-6 pb-12 z-[210] bg-gradient-to-t from-black to-transparent">
              <div className="bg-white/10 backdrop-blur-3xl p-2 rounded-full border border-white/10 flex items-center space-x-3">
                <input 
                  type="text" 
                  placeholder="Reply to status..."
                  className="flex-1 bg-transparent px-6 py-2 text-sm text-white focus:outline-none placeholder:text-gray-500"
                />
                <button className={`p-3 rounded-full bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black`}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
