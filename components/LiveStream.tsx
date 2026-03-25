
import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Users, 
  Plus, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  Sparkles, 
  X, 
  Gift as GiftIcon,
  DollarSign,
  Heart,
  Star,
  Zap,
  MoreHorizontal,
  Share2,
  ShieldCheck,
  Loader2
} from './Icons';
import { LiveStream, Gift, UserProfile } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import { EKAN_GRADIENT_CSS } from '../constants';

const GIFTS: Gift[] = [
  { id: 'g1', name: 'Heart', icon: '❤️', price: 10 },
  { id: 'g2', name: 'Star', icon: '⭐', price: 50 },
  { id: 'g3', name: 'Zap', icon: '⚡', price: 100 },
  { id: 'g4', name: 'Diamond', icon: '💎', price: 500 },
  { id: 'g5', name: 'Crown', icon: '👑', price: 1000 },
];

interface LiveStreamProps {
  profile: UserProfile | null;
}

const LiveStreamComponent: React.FC<LiveStreamProps> = ({ profile }) => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newStreamTitle, setNewStreamTitle] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [messages, setMessages] = useState<{ id: string, user: string, text: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const streamsRef = collection(db, 'live_streams');
    const q = query(streamsRef, where('isLive', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LiveStream));
      setStreams(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'live_streams');
    });

    return () => unsubscribe();
  }, []);

  const handleStartStream = async () => {
    if (!auth.currentUser || !profile || !newStreamTitle) return;
    try {
      const streamData: Omit<LiveStream, 'id'> = {
        hostId: auth.currentUser.uid,
        hostName: profile.name,
        hostAvatar: profile.avatar,
        title: newStreamTitle,
        viewerCount: 1,
        isLive: true,
        startedAt: new Date().toISOString(),
        category: 'General'
      };
      const docRef = await addDoc(collection(db, 'live_streams'), streamData);
      setActiveStream({ ...streamData, id: docRef.id });
      setShowCreate(false);
      setIsBroadcasting(true);
      
      // Request camera access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'live_streams');
    }
  };

  const handleJoinStream = async (stream: LiveStream) => {
    if (!auth.currentUser) return;
    try {
      const ref = doc(db, 'live_streams', stream.id);
      await updateDoc(ref, {
        viewerCount: stream.viewerCount + 1
      });
      setActiveStream(stream);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `live_streams/${stream.id}`);
    }
  };

  const handleEndStream = async () => {
    if (!activeStream || !auth.currentUser) return;
    try {
      const ref = doc(db, 'live_streams', activeStream.id);
      await updateDoc(ref, {
        isLive: false,
        viewerCount: 0
      });
      
      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      setActiveStream(null);
      setIsBroadcasting(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `live_streams/${activeStream.id}`);
    }
  };

  const handleSendGift = async (gift: Gift) => {
    if (!activeStream || !profile || profile.balance < gift.price) {
      alert('Insufficient balance');
      return;
    }
    try {
      const senderRef = doc(db, 'users', profile.id);
      await updateDoc(senderRef, {
        balance: profile.balance - gift.price
      });

      const hostRef = doc(db, 'users', activeStream.hostId);
      await updateDoc(hostRef, {
        balance: arrayUnion({ amount: gift.price, from: profile.name, gift: gift.name })
      });

      // Add to chat
      const giftMsg = { id: Date.now().toString(), user: profile.name, text: `sent a ${gift.icon} ${gift.name}!` };
      setMessages(prev => [...prev, giftMsg]);
      setShowGifts(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'gifting');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage || !profile) return;
    const msg = { id: Date.now().toString(), user: profile.name, text: newMessage };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-black animate-in fade-in duration-1000">
      {/* Header */}
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Live Grid</h1>
          <p className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mt-1">Real-time Visual Nodes</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className={`p-4 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black shadow-2xl active:scale-95 transition-all`}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Stream List */}
      <div className="flex-1 overflow-y-auto px-8 space-y-6 scrollbar-hide pb-32">
        {streams.map(stream => (
          <div 
            key={stream.id}
            onClick={() => handleJoinStream(stream)}
            className="relative aspect-[9/16] w-full rounded-[3.5rem] overflow-hidden group cursor-pointer border border-white/5"
          >
            <img src={`https://picsum.photos/seed/${stream.id}/800/1400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="stream" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
            
            <div className="absolute top-6 left-6 flex items-center space-x-3">
              <div className="bg-red-600 px-3 py-1 rounded-full flex items-center space-x-1.5 animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Live</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1.5 border border-white/10">
                <Users size={12} className="text-gold" />
                <span className="text-[9px] font-black text-white">{stream.viewerCount}</span>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5`}>
                  <img src={stream.hostAvatar} className="w-full h-full rounded-[0.9rem] object-cover" alt="host" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">{stream.title}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stream.hostName}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {streams.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Video size={32} className="text-gray-700" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">No Active Visual Nodes</p>
          </div>
        )}
      </div>

      {/* Active Stream Modal */}
      {activeStream && (
        <div className="fixed inset-0 z-[150] bg-black animate-in slide-in-from-bottom duration-500">
          <div className="relative h-full w-full flex flex-col">
            {/* Background Video/Image */}
            <div className="absolute inset-0 bg-gray-900">
              {isBroadcasting ? (
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
              ) : (
                <img src={`https://picsum.photos/seed/${activeStream.id}/800/1400`} className="w-full h-full object-cover" alt="stream" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 p-8 flex justify-between items-start">
              <div className="flex items-center space-x-4 bg-black/40 backdrop-blur-md p-2 pr-6 rounded-[2rem] border border-white/10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5`}>
                  <img src={activeStream.hostAvatar} className="w-full h-full rounded-[0.9rem] object-cover" alt="host" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">{activeStream.hostName}</p>
                  <p className="text-[9px] text-gold font-black uppercase tracking-widest">{activeStream.viewerCount} Viewers</p>
                </div>
                <button className="ml-4 px-4 py-1.5 bg-gold text-black rounded-full text-[9px] font-black uppercase tracking-widest">Follow</button>
              </div>
              <button onClick={handleEndStream} className="p-4 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10">
                <X size={24} />
              </button>
            </div>

            {/* Chat & Gifts */}
            <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-32">
              <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-3 mb-6">
                {messages.map(m => (
                  <div key={m.id} className="flex items-start space-x-3 animate-in slide-in-from-left duration-300">
                    <span className="text-gold font-black text-[10px] uppercase tracking-widest mt-1">{m.user}:</span>
                    <p className="text-sm font-medium text-white/90 leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Controls */}
            <div className="relative z-10 p-8 pb-12 flex items-center space-x-4">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Say something..."
                  className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl py-5 px-6 text-white focus:outline-none focus:border-gold/30 transition-all font-black text-sm"
                />
                <button onClick={handleSendMessage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gold">
                  <ChevronRight size={24} />
                </button>
              </div>
              <button 
                onClick={() => setShowGifts(!showGifts)}
                className="p-5 rounded-3xl bg-gold text-black shadow-2xl active:scale-95 transition-all"
              >
                <GiftIcon size={24} />
              </button>
              <button className="p-5 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 text-white">
                <Share2 size={24} />
              </button>
            </div>
          </div>

          {/* Gift Panel */}
          {showGifts && (
            <div className="fixed inset-0 z-[200] flex items-end justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-white tracking-tight">Send Grid Assets</h3>
                  <button onClick={() => setShowGifts(false)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {GIFTS.map(gift => (
                    <button 
                      key={gift.id}
                      onClick={() => handleSendGift(gift)}
                      className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 transition-all group"
                    >
                      <span className="text-3xl group-hover:scale-125 transition-transform">{gift.icon}</span>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-white uppercase tracking-widest">{gift.name}</p>
                        <p className="text-[10px] font-black text-gold mt-1">₦{gift.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gold uppercase tracking-widest">Your Balance</span>
                  <span className="text-sm font-black text-white tracking-tight">₦{profile?.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Stream Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[3.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-gold-600/5 to-green-600/5 opacity-40"></div>
            <button onClick={() => setShowCreate(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-gray-400 hover:text-white z-10">
              <X size={20} />
            </button>
            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight text-white">Initialize Visual Node</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Broadcast to the Grid</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Node Title</label>
                  <input 
                    type="text" 
                    value={newStreamTitle}
                    onChange={(e) => setNewStreamTitle(e.target.value)}
                    placeholder="What's the vision?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-gold/30 transition-all font-black text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={handleStartStream}
                className={`w-full py-5 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all`}
              >
                Go Live on Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamComponent;
