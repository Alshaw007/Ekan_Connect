
import React, { useState } from 'react';
import { Settings, ShieldCheck, MoreHorizontal, MessageCircle, Phone, Globe, Star, QrCode, X, Lock, UserPlus, Users } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Post, UserProfile } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// Fix: Added missing timestamp property to MOCK_POSTS to satisfy Post interface requirements
const MOCK_POSTS: Post[] = [
  { id: '1', authorId: 'm1', authorName: 'Me', content: 'Manifesting...', thumbnail: 'https://picsum.photos/seed/p1/400/400', likes: 124, timestamp: new Date().toISOString() },
  { id: '2', authorId: 'm1', authorName: 'Me', content: 'Manifesting...', thumbnail: 'https://picsum.photos/seed/p2/400/400', likes: 88, timestamp: new Date().toISOString() },
  { id: '3', authorId: 'm1', authorName: 'Me', content: 'Manifesting...', thumbnail: 'https://picsum.photos/seed/p3/400/400', likes: 215, timestamp: new Date().toISOString() },
  { id: '4', authorId: 'm1', authorName: 'Me', content: 'Manifesting...', thumbnail: 'https://picsum.photos/seed/p4/400/400', likes: 45, timestamp: new Date().toISOString() },
  { id: '5', authorId: 'm1', authorName: 'Me', content: 'Manifesting...', thumbnail: 'https://picsum.photos/seed/p5/400/400', likes: 932, timestamp: new Date().toISOString() },
  { id: '6', authorId: 'm1', authorName: 'Me', content: 'Manifesting...', thumbnail: 'https://picsum.photos/seed/p6/400/400', likes: 12, timestamp: new Date().toISOString() },
];

interface ProfileProps {
  user: UserProfile;
  posts: Post[];
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, posts, onLogout }) => {
  const [showQr, setShowQr] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncContacts = async () => {
    setIsSyncing(true);
    // Simulate contact sync
    setTimeout(async () => {
      if (auth.currentUser) {
        try {
          const ref = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(ref, {
            contacts: arrayUnion('contact_1', 'contact_2', 'contact_3') // Simulated contact IDs
          });
          alert('Contacts Synchronized with the Grid.');
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
        }
      }
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-1000 overflow-y-auto scrollbar-hide pb-24">
      <div className="p-8 pb-12 bg-[#0B0B0B] border-b border-white/5 relative">
        <div className="flex justify-between items-start mb-8">
            <div className="relative">
                <div className={`w-28 h-28 rounded-[2.5rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-2xl shadow-red-600/20`}>
                    <div className="w-full h-full rounded-[2.2rem] bg-black overflow-hidden border border-white/10">
                        <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                    </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-black flex items-center justify-center">
                    <ShieldCheck size={14} className="text-black" />
                </div>
            </div>
            <div className="flex space-x-3">
                <button 
                  onClick={handleSyncContacts}
                  disabled={isSyncing}
                  className={`p-4 bg-white/5 rounded-2xl text-gold hover:text-white transition-all border border-white/5 ${isSyncing ? 'animate-pulse' : ''}`}
                  title="Sync Contacts"
                >
                  <Users size={22} />
                </button>
                <button 
                  onClick={() => setShowQr(true)}
                  className="p-4 bg-white/5 rounded-2xl text-gold hover:text-white transition-all border border-white/5"
                >
                  <QrCode size={22} />
                </button>
                <button onClick={onLogout} className="p-4 bg-white/5 rounded-2xl text-red-500 hover:text-white transition-all border border-white/5">
                  <Lock size={22} />
                </button>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">{user.name}</h1>
                    <p className="text-gold text-[11px] font-black uppercase tracking-[0.4em] mt-1">{user.handle} • {user.location}</p>
                </div>
                <div className="flex space-x-6">
                    <div className="text-center">
                        <p className="text-xl font-black text-white">{user.followers?.length || 0}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Followers</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black text-white">{user.following?.length || 0}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Following</p>
                    </div>
                </div>
            </div>
            
            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-sm">
                {user.bio}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {user.interests.map(i => (
                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">{i}</span>
              ))}
            </div>
        </div>
      </div>

      <div className="flex-1 bg-black">
        <div className="flex justify-around border-b border-white/5 py-4">
            <button className="text-[10px] font-black uppercase tracking-[0.4em] text-white pb-2 border-b-2 border-gold">Grid Manifests</button>
            <button className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Bridges</button>
            <button className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Assets</button>
        </div>

        <div className="grid grid-cols-3 gap-0.5 pt-0.5">
            {posts.map(post => (
                <div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden">
                    <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="post" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-white font-black text-xs">
                            <Star size={14} className="text-gold" />
                            <span>{post.likes}</span>
                        </div>
                    </div>
                </div>
            ))}
            {posts.length === 0 && (
              <div className="col-span-3 py-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">No Grid Manifests Yet</p>
              </div>
            )}
        </div>
      </div>

      {showQr && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-[3.5rem] p-8 shadow-2xl overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-gold-600/5 to-green-600/5 opacity-40"></div>
             <button onClick={() => setShowQr(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
             <div className="relative z-10 flex flex-col items-center space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-black tracking-tight text-white">Grid Identity</h2>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">{user.handle}</p>
                </div>
                <div className={`p-1.5 rounded-[3rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} shadow-2xl`}>
                  <div className="bg-white p-6 rounded-[2.8rem] relative">
                     <div className="w-48 h-48 flex flex-col items-center justify-center">
                        <div className="grid grid-cols-4 gap-1 w-full h-full p-2 opacity-90">
                           {[...Array(16)].map((_, i) => (
                             <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-black' : 'bg-transparent'}`}></div>
                           ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5`}>
                              <img src={user.avatar} className="w-full h-full rounded-[0.9rem] object-cover border-2 border-white" alt="mini avatar" />
                            </div>
                        </div>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
