
import React, { useState, useRef } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  MoreHorizontal, 
  MessageCircle, 
  Phone, 
  Globe, 
  Star, 
  QrCode, 
  X, 
  Lock, 
  UserPlus, 
  Users,
  Camera,
  Check,
  Moon,
  Sun,
  Monitor,
  Ban,
  ChevronRight,
  User
} from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Post, UserProfile } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface ProfileProps {
  user: UserProfile;
  posts: Post[];
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, posts, onLogout }) => {
  const [showQr, setShowQr] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location,
    handle: user.handle
  });
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSyncContacts = async () => {
    setIsSyncing(true);
    setTimeout(async () => {
      if (auth.currentUser) {
        try {
          const ref = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(ref, {
            contacts: arrayUnion('contact_1', 'contact_2', 'contact_3')
          });
          alert('Contacts Synchronized with the Grid.');
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
        }
      }
      setIsSyncing(false);
    }, 2000);
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const ref = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(ref, {
        ...editData
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    // Simulate upload
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const ref = doc(db, 'users', auth.currentUser!.uid);
        await updateDoc(ref, { avatar: base64String });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleThemeChange = async (theme: 'dark' | 'light' | 'system') => {
    if (!auth.currentUser) return;
    try {
      const ref = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(ref, { theme });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-1000 overflow-y-auto scrollbar-hide pb-24">
      <div className="p-8 pb-12 bg-[#0B0B0B] border-b border-white/5 relative">
        <div className="flex justify-between items-start mb-8">
            <div className="relative group">
                <div className={`w-28 h-28 rounded-[2.5rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-2xl shadow-red-600/20`}>
                    <div className="w-full h-full rounded-[2.2rem] bg-black overflow-hidden border border-white/10 relative">
                        <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                        {isEditing && (
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Camera size={24} />
                          </button>
                        )}
                    </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-black flex items-center justify-center">
                    <ShieldCheck size={14} className="text-black" />
                </div>
            </div>
            <div className="flex space-x-3">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-4 bg-white/5 rounded-2xl text-gold hover:text-white transition-all border border-white/5"
                >
                  <Settings size={22} />
                </button>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-4 bg-white/5 rounded-2xl ${isEditing ? 'text-green-500' : 'text-gold'} hover:text-white transition-all border border-white/5`}
                >
                  {isEditing ? <Check size={22} /> : <Globe size={22} />}
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

        {isEditing ? (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Grid Name</label>
              <input 
                type="text" 
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-gold/30 transition-all font-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Grid Handle</label>
              <input 
                type="text" 
                value={editData.handle}
                onChange={(e) => setEditData({...editData, handle: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-gold/30 transition-all font-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Grid Bio</label>
              <textarea 
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-gold/30 transition-all font-medium h-24"
              />
            </div>
            <button 
              onClick={handleUpdateProfile}
              className={`w-full py-5 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all`}
            >
              Update Grid Identity
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {showSettings && (
        <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 bg-black/40 border-b border-white/5">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Grid Atmosphere</h3>
            <div className="flex space-x-4">
              <button 
                onClick={() => handleThemeChange('light')}
                className={`flex-1 flex flex-col items-center space-y-3 p-6 rounded-3xl border ${user.theme === 'light' ? 'border-gold bg-gold/10 text-gold' : 'border-white/5 bg-white/5 text-gray-500'}`}
              >
                <Sun size={24} />
                <span className="text-[9px] font-black uppercase tracking-widest">Light</span>
              </button>
              <button 
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 flex flex-col items-center space-y-3 p-6 rounded-3xl border ${user.theme === 'dark' ? 'border-gold bg-gold/10 text-gold' : 'border-white/5 bg-white/5 text-gray-500'}`}
              >
                <Moon size={24} />
                <span className="text-[9px] font-black uppercase tracking-widest">Dark</span>
              </button>
              <button 
                onClick={() => handleThemeChange('system')}
                className={`flex-1 flex flex-col items-center space-y-3 p-6 rounded-3xl border ${user.theme === 'system' ? 'border-gold bg-gold/10 text-gold' : 'border-white/5 bg-white/5 text-gray-500'}`}
              >
                <Monitor size={24} />
                <span className="text-[9px] font-black uppercase tracking-widest">System</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Grid Security</h3>
            <button 
              onClick={handleSyncContacts}
              disabled={isSyncing}
              className={`w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-gold/30 transition-all group ${isSyncing ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <Users size={24} className="text-gold" />
                <span className="text-sm font-black text-white uppercase tracking-widest">Sync External Nodes</span>
              </div>
              <ChevronRight size={20} className="text-gray-700 group-hover:text-white transition-all" />
            </button>
            <button 
              className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <Ban size={24} className="text-red-500" />
                <span className="text-sm font-black text-white uppercase tracking-widest">Blocked Nodes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-gray-600">{user.blockedUsers?.length || 0}</span>
                <ChevronRight size={20} className="text-gray-700 group-hover:text-white transition-all" />
              </div>
            </button>
          </div>
        </div>
      )}

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
