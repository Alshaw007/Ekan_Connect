
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
  User,
  Key,
  Bell
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location,
    handle: user.handle
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const settingsItems = [
    { icon: Key, label: 'Account', sub: 'Security notifications, change number', color: 'text-slate-500' },
    { icon: Lock, label: 'Privacy', sub: 'Block contacts, disappearing messages', color: 'text-slate-500' },
    { icon: MessageCircle, label: 'Chats', sub: 'Theme, wallpapers, chat history', color: 'text-slate-500' },
    { icon: Bell, label: 'Notifications', sub: 'Message, group & call tones', color: 'text-slate-500' },
    { icon: Globe, label: 'App language', sub: "English (phone's language)", color: 'text-slate-500' },
    { icon: Users, label: 'Invite a friend', sub: '', color: 'text-slate-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] dark:bg-[#111b21] overflow-y-auto scrollbar-hide pb-20">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#202c33] p-6 flex flex-col items-center border-b border-slate-200 dark:border-slate-700">
        <div className="relative group mb-4">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-lg`}>
            <div className="w-full h-full rounded-full bg-slate-200 dark:bg-[#2a3942] overflow-hidden relative border-4 border-white dark:border-[#202c33]">
              <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={24} />
              </button>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarUpload}
          />
          <div className="absolute bottom-1 right-1 bg-brand-green w-8 h-8 rounded-full border-4 border-white dark:border-[#202c33] flex items-center justify-center shadow-md">
            <Camera size={14} className="text-white" />
          </div>
        </div>

        {isEditing ? (
          <div className="w-full space-y-4 animate-in fade-in duration-300">
            <input 
              type="text" 
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className="w-full bg-slate-100 dark:bg-[#2a3942] border-none rounded-lg py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-green transition-all font-bold text-center"
              placeholder="Your Name"
            />
            <textarea 
              value={editData.bio}
              onChange={(e) => setEditData({...editData, bio: e.target.value})}
              className="w-full bg-slate-100 dark:bg-[#2a3942] border-none rounded-lg py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-green transition-all text-sm h-20 text-center"
              placeholder="About"
            />
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 bg-slate-200 dark:bg-[#3b4a54] text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateProfile}
                className="flex-1 py-2 bg-brand-green text-white rounded-lg font-bold text-sm"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e9edef]">{user.name}</h1>
            <p className="text-slate-500 dark:text-[#8696a0] text-sm mt-1">{user.handle}</p>
            <button 
              onClick={() => setIsEditing(true)}
              className="mt-3 text-brand-green font-bold text-sm hover:underline"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Settings List */}
      <div className="mt-4 bg-white dark:bg-[#202c33] border-y border-slate-200 dark:border-slate-700">
        {settingsItems.map((item, idx) => (
          <button 
            key={item.label}
            className={`w-full flex items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-[#182229] transition-colors ${idx !== settingsItems.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/50' : ''}`}
          >
            <div className={`w-10 h-10 flex items-center justify-center ${item.color}`}>
              <item.icon size={22} />
            </div>
            <div className="ml-4 flex-1 text-left">
              <p className="text-base font-medium text-slate-900 dark:text-[#e9edef]">{item.label}</p>
              {item.sub && <p className="text-xs text-slate-500 dark:text-[#8696a0]">{item.sub}</p>}
            </div>
            <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
          </button>
        ))}
      </div>

      <div className="mt-4 bg-white dark:bg-[#202c33] border-y border-slate-200 dark:border-slate-700">
        <button 
          onClick={onLogout}
          className="w-full flex items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-[#182229] transition-colors text-red-500"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <Lock size={22} />
          </div>
          <div className="ml-4 flex-1 text-left">
            <p className="text-base font-bold">Log Out</p>
          </div>
        </button>
      </div>

      <div className="mt-8 text-center pb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">from</p>
        <p className="text-sm font-black tracking-widest text-brand-navy dark:text-white mt-1">EKAN INTERNATIONAL</p>
      </div>
    </div>
  );
};

export default Profile;
