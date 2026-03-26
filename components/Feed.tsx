
import React, { useState, useEffect } from 'react';
import { Search, Globe, Star, Plus, MessageCircle, X, Sparkles, ShieldCheck, ImageIcon, Camera, UserPlus, UserCheck, Ban, MoreHorizontal } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Post, UserProfile } from '../types';
import { useFirebase } from './FirebaseProvider';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface FeedProps {
  externalPosts: Post[];
  onAddPost: (content: string) => void;
  onToggleFollow: (targetUid: string) => void;
  onBlockUser: (targetUid: string) => void;
}

const Feed: React.FC<FeedProps> = ({ externalPosts, onAddPost, onToggleFollow, onBlockUser }) => {
  const { profile } = useFirebase();
  const [resonance, setResonance] = useState(94.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setResonance(prev => parseFloat((prev + (Math.random() > 0.5 ? 0.1 : -0.1)).toFixed(1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] animate-in fade-in duration-500 overflow-y-auto scrollbar-hide">
      {/* Status Section */}
      <section className="px-4 py-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#e9edef]">Status</h2>
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* My Status */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-slate-300 dark:border-slate-700">
                <img src={profile?.avatar || "https://picsum.photos/seed/me/150/150"} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute bottom-0 right-0 bg-brand-green text-white rounded-full p-0.5 border-2 border-white dark:border-[#111b21]">
                <Plus size={14} strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs text-slate-900 dark:text-[#e9edef] font-medium">My status</span>
          </div>

          {/* Recent Updates (Mock) */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
              <div className="w-16 h-16 rounded-full p-[2px] border-2 border-brand-green">
                <img src={`https://picsum.photos/seed/status${i}/150/150`} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <span className="text-xs text-slate-900 dark:text-[#e9edef] font-medium truncate w-16 text-center">User {i}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Channels Section */}
      <section className="px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#e9edef]">Channels</h2>
          <button className="text-brand-green text-sm font-semibold hover:underline">Find channels</button>
        </div>

        <div className="space-y-6">
          {externalPosts.map((post) => (
            <article key={post.id} className="flex space-x-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                <img src={post.thumbnail || `https://picsum.photos/seed/${post.id}/200/200`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-[15px] text-slate-900 dark:text-[#e9edef]">{post.authorName || 'Channel Name'}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                  {post.content}
                </p>
                {post.thumbnail && (
                  <div className="rounded-xl overflow-hidden mb-2 border border-slate-100 dark:border-slate-800">
                    <img src={post.thumbnail} className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400">
                  <button className="flex items-center space-x-1 hover:text-brand-green transition-colors">
                    <Star size={16} />
                    <span className="text-xs">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-brand-green transition-colors">
                    <MessageCircle size={16} />
                    <span className="text-xs">Reply</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FABs */}
      <div className="fixed bottom-24 right-6 flex flex-col space-y-4 items-center">
        <button className="w-10 h-10 bg-slate-100 dark:bg-[#202c33] text-slate-600 dark:text-slate-300 rounded-full shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
          <Sparkles size={20} />
        </button>
        <button className="w-14 h-14 bg-brand-green text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
          <Camera size={24} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default Feed;
