
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, X, ChevronRight, ChevronLeft, PlayCircle, ImageIcon, Send, Sparkles } from './Icons';
import { Story, User as UserType } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, orderBy, limit } from 'firebase/firestore';
import { useFirebase } from './FirebaseProvider';
import { EKAN_GRADIENT_CSS } from '../constants';

const Stories: React.FC = () => {
  const { profile } = useFirebase();
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch stories from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where('timestamp', '>', yesterday), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Story));
      setStories(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'stories');
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!auth.currentUser || !profile || !uploadPreview) return;
    setIsUploading(true);
    try {
      const storyData: Omit<Story, 'id'> = {
        userId: auth.currentUser.uid,
        userName: profile.name,
        userAvatar: profile.avatar,
        mediaUrl: uploadPreview, // In production, upload to Storage and get URL
        mediaType: uploadFile?.type.startsWith('video') ? 'video' : 'image',
        caption,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        viewers: []
      };
      await addDoc(collection(db, 'stories'), storyData);
      setShowUpload(false);
      setUploadFile(null);
      setUploadPreview(null);
      setCaption('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'stories');
    } finally {
      setIsUploading(false);
    }
  };

  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = {
        userId: story.userId,
        userName: story.userName,
        userAvatar: story.userAvatar,
        stories: []
      };
    }
    acc[story.userId].stories.push(story);
    return acc;
  }, {} as Record<string, { userId: string; userName: string; userAvatar: string; stories: Story[] }>);

  const storyGroups = Object.values(groupedStories);

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-1000 pb-28 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Status</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Transient Moments on the Grid</p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className={`p-4 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black shadow-2xl hover:scale-105 active:scale-95 transition-all`}
        >
          <Camera size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* My Story Trigger */}
        <div 
          onClick={() => setShowUpload(true)}
          className="group relative aspect-[9/16] bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden cursor-pointer hover:bg-white/[0.06] transition-all"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Add Status</span>
          </div>
          {profile?.avatar && (
            <img src={profile.avatar} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-gold shadow-xl" />
          )}
        </div>

        {/* Friend Stories */}
        {storyGroups.map((group) => (
          <div 
            key={group.userId}
            onClick={() => setActiveStory(group.stories[0])}
            className="group relative aspect-[9/16] bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden cursor-pointer hover:scale-[1.02] transition-all shadow-2xl"
          >
            <img src={group.stories[0].mediaUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div className="absolute top-4 left-4 right-4 flex items-center space-x-2">
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gold w-1/3"></div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-gold p-0.5 overflow-hidden">
                <img src={group.userAvatar} className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-white truncate uppercase tracking-widest">{group.userName}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{group.stories.length} Updates</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg aspect-[9/16] bg-[#050505] overflow-hidden">
            {activeStory.mediaType === 'video' ? (
              <video src={activeStory.mediaUrl} autoPlay className="w-full h-full object-cover" />
            ) : (
              <img src={activeStory.mediaUrl} className="w-full h-full object-cover" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60"></div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={activeStory.userAvatar} className="w-12 h-12 rounded-full border-2 border-gold" />
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">{activeStory.userName}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Just Now</p>
                </div>
              </div>
              <button onClick={() => setActiveStory(null)} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white">
                <X size={24} />
              </button>
            </div>

            {/* Caption */}
            {activeStory.caption && (
              <div className="absolute bottom-24 left-0 right-0 p-10 text-center">
                <p className="text-lg font-bold text-white leading-relaxed drop-shadow-2xl">{activeStory.caption}</p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="absolute top-4 left-8 right-8 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/2 animate-loading"></div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-[0_0_100px_rgba(252,209,22,0.1)]">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Transmit Status</h2>
              <button onClick={() => setShowUpload(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {!uploadPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[9/16] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-white/5 transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-600 group-hover:text-gold group-hover:scale-110 transition-all">
                  <ImageIcon size={40} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Select Media</p>
                  <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Image or Video (Max 15s)</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="image/*,video/*"
                />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden border border-white/10">
                  {uploadFile?.type.startsWith('video') ? (
                    <video src={uploadPreview} className="w-full h-full object-cover" />
                  ) : (
                    <img src={uploadPreview} className="w-full h-full object-cover" />
                  )}
                  <button 
                    onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                    className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-xl text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 ml-2">Add Caption</label>
                  <input 
                    type="text" 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold focus:outline-none focus:border-gold/50 transition-all"
                    placeholder="Describe this moment..."
                  />
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`w-full py-6 bg-gradient-to-r ${EKAN_GRADIENT_CSS} rounded-2xl text-black font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-4 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Transmit to Grid</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
