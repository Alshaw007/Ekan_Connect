
import React, { useState, useEffect } from 'react';
import { Search, Globe, Star, Plus, MessageCircle, X, Sparkles, ShieldCheck, ImageIcon, Camera, UserPlus, UserCheck } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Post, UserProfile } from '../types';
import { useFirebase } from './FirebaseProvider';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface FeedProps {
  externalPosts: Post[];
  onAddPost: (content: string) => void;
  onToggleFollow: (targetUid: string) => void;
}

const Feed: React.FC<FeedProps> = ({ externalPosts, onAddPost, onToggleFollow }) => {
  const { profile } = useFirebase();
  const [category, setCategory] = useState<'Following' | 'Discover' | 'Global'>('Following');
  const [postInput, setPostInput] = useState('');
  const [resonance, setResonance] = useState(94.8);
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [isLoadingDiscover, setIsLoadingDiscover] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setResonance(prev => parseFloat((prev + (Math.random() > 0.5 ? 0.1 : -0.1)).toFixed(1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (category === 'Discover') {
      fetchDiscoverUsers();
    }
  }, [category]);

  const fetchDiscoverUsers = async () => {
    setIsLoadingDiscover(true);
    try {
      const q = query(collection(db, 'users'), limit(10));
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        if (userData.id !== profile?.id) {
          users.push(userData);
        }
      });
      setDiscoverUsers(users);
    } catch (error) {
      console.error("Error fetching discover users:", error);
    } finally {
      setIsLoadingDiscover(false);
    }
  };

  const handlePost = () => {
    if (!postInput.trim()) return;
    onAddPost(postInput);
    setPostInput('');
  };

  const filteredPosts = externalPosts.filter(post => {
    if (category === 'Following') {
      return profile?.following?.includes(post.authorId) || post.authorId === profile?.id;
    }
    return true; // For Global and Discover (though Discover shows users)
  });

  return (
    <div className="flex flex-col h-full bg-transparent pb-28 overflow-hidden">
      {/* Dynamic Resonance HUD */}
      <div className="px-10 pt-8 flex items-center justify-between z-20 sticky top-0 bg-[#050505]/40 backdrop-blur-3xl pb-4">
         <div className="flex items-center space-x-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 shadow-xl backdrop-blur-2xl">
            <Sparkles size={16} className="text-gold animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">
              Grid Resonance: <span className="text-white">{resonance}%</span>
            </span>
         </div>
         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400 flex items-center">
           <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
           Live Feed
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
        {/* Manifestation Entry */}
        <div className="bg-white/5 backdrop-blur-[100px] p-10 rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-emerald-600/5 opacity-40 rounded-[4rem] pointer-events-none"></div>
          <div className="flex items-start space-x-6 relative z-10">
            <div className={`w-18 h-18 rounded-[2rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-2xl`}>
              <img src={profile?.avatar || "https://picsum.photos/seed/me_profile/150/150"} alt="me" className="w-full h-full object-cover rounded-[1.9rem]" />
            </div>
            <textarea 
              value={postInput}
              onChange={(e) => setPostInput(e.target.value)}
              placeholder="What are you manifesting on the grid today?"
              className="flex-1 bg-transparent border-none focus:outline-none text-xl font-medium resize-none pt-4 h-32 placeholder:text-gray-800 tracking-tight text-white"
            />
          </div>
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5 relative z-10">
            <div className="flex space-x-4">
              <button className="p-4 bg-white/5 rounded-2xl text-gold hover:bg-white/10 hover:scale-105 transition-all"><Camera size={24} /></button>
              <button className="p-4 bg-white/5 rounded-2xl text-emerald-500 hover:bg-white/10 hover:scale-105 transition-all"><Globe size={24} /></button>
            </div>
            <button 
              onClick={handlePost}
              className={`px-16 py-5 rounded-[2.5rem] text-black font-black text-xs uppercase tracking-[0.4em] bg-gradient-to-r ${EKAN_GRADIENT_CSS} shadow-[0_20px_50px_rgba(206,17,38,0.4)] active:scale-95 hover:brightness-110 transition-all`}
            >
              MANIFEST
            </button>
          </div>
        </div>

        {/* Resonance Switch */}
        <div className="flex bg-white/5 backdrop-blur-3xl p-2 rounded-[2.5rem] border border-white/10 w-full max-w-md mx-auto shadow-2xl">
          {['Following', 'Discover', 'Global'].map((cat) => (
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

        {/* The Manifest Stream */}
        <div className="space-y-12 pb-16">
          {category === 'Discover' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoadingDiscover ? (
                <div className="col-span-full py-24 text-center space-y-6 opacity-30">
                  <Sparkles size={64} className="mx-auto text-gray-500 animate-spin" />
                  <p className="text-[12px] font-black uppercase tracking-[0.6em]">Scanning grid for nodes...</p>
                </div>
              ) : (
                discoverUsers.map(user => (
                  <div key={user.id} className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all duration-500">
                    <div className="flex items-center space-x-5">
                      <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-indigo-600 to-purple-600 p-0.5 shadow-2xl">
                        <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-full h-full rounded-[1.7rem] object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg tracking-tight text-white">{user.name}</h4>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">{user.location}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onToggleFollow(user.id)}
                      className={`p-4 rounded-2xl transition-all ${
                        profile?.following?.includes(user.id) 
                        ? 'bg-emerald-500/20 text-emerald-500' 
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {profile?.following?.includes(user.id) ? <UserCheck size={24} /> : <UserPlus size={24} />}
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {filteredPosts.length === 0 && (
                <div className="py-24 text-center space-y-6 opacity-30">
                  <Sparkles size={64} className="mx-auto text-gray-500 animate-pulse" />
                  <p className="text-[12px] font-black uppercase tracking-[0.6em]">Awaiting node manifestations...</p>
                </div>
              )}
              
              {filteredPosts.map(post => (
                <article key={post.id} className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-10 border border-white/10 animate-in fade-in slide-in-from-bottom-10 duration-1000 shadow-[0_30px_70px_rgba(0,0,0,0.5)] group overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-5">
                       <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-red-600 to-gold p-0.5 shadow-2xl">
                          <img src={post.thumbnail || `https://picsum.photos/seed/${post.id}/200/200`} className="w-full h-full rounded-[1.7rem] object-cover" />
                       </div>
                       <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-black text-xl tracking-tight text-white">{post.authorName || 'User Node'}</h4>
                            <ShieldCheck size={18} className="text-indigo-400" />
                          </div>
                          <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mt-1">
                            {new Date(post.timestamp).toLocaleTimeString()} • Active Resonance
                          </p>
                       </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl text-gray-600 hover:text-white transition-all cursor-pointer"><Star size={20} /></div>
                  </div>
                  <p className="text-lg text-gray-300 leading-relaxed font-medium mb-8 tracking-tight px-2">{post.content}</p>
                  {post.thumbnail && (
                    <div className="relative overflow-hidden rounded-[3rem] mb-8 shadow-3xl border border-white/5">
                      <img src={post.thumbnail} className="w-full aspect-video object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  )}
                  <div className="flex items-center space-x-12 pt-8 border-t border-white/5 px-4">
                    <button className="flex items-center space-x-3 text-gray-500 hover:text-gold transition-all group/btn"><Star size={24} className="group-hover/btn:scale-125 transition-transform" /> <span className="text-[12px] font-black uppercase tracking-widest">{post.likes}</span></button>
                    <button className="flex items-center space-x-3 text-gray-500 hover:text-emerald-400 transition-all group/btn"><MessageCircle size={24} className="group-hover/btn:scale-125 transition-transform" /> <span className="text-[12px] font-black uppercase tracking-widest">Resonate</span></button>
                  </div>
                </article>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
