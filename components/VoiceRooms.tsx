
import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Users, 
  Plus, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  Sparkles, 
  X, 
  Hand, 
  Gift as GiftIcon,
  DollarSign,
  Heart,
  Star,
  Zap,
  ShieldCheck
} from './Icons';
import { VoiceRoom, Gift, UserProfile } from '../types';
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

interface VoiceRoomsProps {
  profile: UserProfile | null;
}

const VoiceRooms: React.FC<VoiceRoomsProps> = ({ profile }) => {
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<VoiceRoom | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [showGifts, setShowGifts] = useState(false);

  useEffect(() => {
    const roomsRef = collection(db, 'voice_rooms');
    const q = query(roomsRef, where('isLive', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as VoiceRoom));
      setRooms(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'voice_rooms');
    });

    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async () => {
    if (!auth.currentUser || !profile || !newRoomTitle) return;
    try {
      const roomData: Omit<VoiceRoom, 'id'> = {
        title: newRoomTitle,
        hostId: auth.currentUser.uid,
        hostName: profile.name,
        hostAvatar: profile.avatar,
        participants: [auth.currentUser.uid],
        speakers: [auth.currentUser.uid],
        category: 'General',
        isLive: true,
        createdAt: new Date().toISOString(),
        viewerCount: 1
      };
      const docRef = await addDoc(collection(db, 'voice_rooms'), roomData);
      setActiveRoom({ ...roomData, id: docRef.id });
      setShowCreate(false);
      setNewRoomTitle('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'voice_rooms');
    }
  };

  const handleJoinRoom = async (room: VoiceRoom) => {
    if (!auth.currentUser) return;
    try {
      const ref = doc(db, 'voice_rooms', room.id);
      await updateDoc(ref, {
        participants: arrayUnion(auth.currentUser.uid),
        viewerCount: room.viewerCount + 1
      });
      setActiveRoom(room);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `voice_rooms/${room.id}`);
    }
  };

  const handleLeaveRoom = async () => {
    if (!activeRoom || !auth.currentUser) return;
    try {
      const ref = doc(db, 'voice_rooms', activeRoom.id);
      await updateDoc(ref, {
        participants: arrayRemove(auth.currentUser.uid),
        speakers: arrayRemove(auth.currentUser.uid),
        viewerCount: Math.max(0, activeRoom.viewerCount - 1)
      });
      setActiveRoom(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `voice_rooms/${activeRoom.id}`);
    }
  };

  const handleSendGift = async (gift: Gift) => {
    if (!activeRoom || !profile || profile.balance < gift.price) {
      alert('Insufficient balance');
      return;
    }
    try {
      // Deduct from sender
      const senderRef = doc(db, 'users', profile.id);
      await updateDoc(senderRef, {
        balance: profile.balance - gift.price
      });

      // Add to host (simulated redemption)
      const hostRef = doc(db, 'users', activeRoom.hostId);
      await updateDoc(hostRef, {
        balance: arrayUnion({ amount: gift.price, from: profile.name, gift: gift.name }) // This is a simplified simulation
      });

      alert(`Sent ${gift.name} to ${activeRoom.hostName}!`);
      setShowGifts(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'gifting');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black animate-in fade-in duration-1000">
      {/* Header */}
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Voice Rooms</h1>
          <p className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mt-1">Global Audio Nodes</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className={`p-4 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black shadow-2xl active:scale-95 transition-all`}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Search */}
      <div className="px-8 py-4">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search Audio Nodes..."
            className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-white focus:outline-none focus:border-gold/30 transition-all font-black text-sm"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto px-8 space-y-4 scrollbar-hide pb-32">
        {rooms.map(room => (
          <div 
            key={room.id}
            onClick={() => handleJoinRoom(room)}
            className="p-6 rounded-[2.5rem] bg-[#0B0B0B] border border-white/5 hover:border-gold/20 transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5`}>
                  <img src={room.hostAvatar} className="w-full h-full rounded-[0.9rem] object-cover" alt="host" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">{room.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{room.hostName} • {room.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <Users size={12} className="text-gold" />
                <span className="text-[10px] font-black text-white">{room.viewerCount}</span>
              </div>
            </div>
            <div className="flex -space-x-2">
              {room.participants.slice(0, 5).map((p, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${p}/100/100`} className="w-full h-full object-cover" alt="participant" />
                </div>
              ))}
              {room.participants.length > 5 && (
                <div className="w-8 h-8 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-[10px] font-black text-white">
                  +{room.participants.length - 5}
                </div>
              )}
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Mic size={32} className="text-gray-700" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">No Active Audio Nodes</p>
          </div>
        )}
      </div>

      {/* Active Room Modal */}
      {activeRoom && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-500">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-8 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center space-x-4">
                <button onClick={handleLeaveRoom} className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white">
                  <ChevronRight className="rotate-180" size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">{activeRoom.title}</h2>
                  <p className="text-[10px] text-gold font-black uppercase tracking-widest">Live Audio Node</p>
                </div>
              </div>
              <button onClick={handleLeaveRoom} className="px-6 py-2.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                Leave
              </button>
            </div>

            {/* Stage */}
            <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-3 gap-8">
                {/* Host */}
                <div className="col-span-3 flex flex-col items-center space-y-4 mb-8">
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-[3rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-2xl shadow-red-600/20`}>
                      <div className="w-full h-full rounded-[2.8rem] bg-black overflow-hidden relative">
                        <img src={activeRoom.hostAvatar} className="w-full h-full object-cover" alt="host" />
                        {!isMuted && activeRoom.hostId === auth.currentUser?.uid && (
                          <div className="absolute inset-0 bg-green-500/20 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black p-2 rounded-full border border-white/10">
                      <ShieldCheck size={16} className="text-gold" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-white uppercase tracking-widest">{activeRoom.hostName}</p>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Host • Speaking</p>
                  </div>
                </div>

                {/* Speakers */}
                {activeRoom.speakers.filter(s => s !== activeRoom.hostId).map((s, i) => (
                  <div key={i} className="flex flex-col items-center space-y-3">
                    <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 p-0.5">
                      <img src={`https://picsum.photos/seed/${s}/200/200`} className="w-full h-full rounded-[1.8rem] object-cover" alt="speaker" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Speaker</p>
                  </div>
                ))}
              </div>

              {/* Audience */}
              <div className="mt-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 mb-6">Audience ({activeRoom.participants.length})</h3>
                <div className="grid grid-cols-5 gap-6">
                  {activeRoom.participants.map((p, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${p}/100/100`} className="w-full h-full object-cover" alt="audience" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-8 pb-12 bg-black border-t border-white/5 flex justify-between items-center">
              <div className="flex space-x-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-5 rounded-3xl border transition-all ${isMuted ? 'bg-white/5 border-white/10 text-gray-500' : 'bg-green-500/10 border-green-500/30 text-green-500'}`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button className="p-5 rounded-3xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all">
                  <Hand size={24} />
                </button>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowGifts(!showGifts)}
                  className="p-5 rounded-3xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-all"
                >
                  <GiftIcon size={24} />
                </button>
                <button className="p-5 rounded-3xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all">
                  <MessageSquare size={24} />
                </button>
              </div>
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

      {/* Create Room Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[3.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-gold-600/5 to-green-600/5 opacity-40"></div>
            <button onClick={() => setShowCreate(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-gray-400 hover:text-white z-10">
              <X size={20} />
            </button>
            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight text-white">Initialize Audio Node</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Broadcast to the Grid</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Node Title</label>
                  <input 
                    type="text" 
                    value={newRoomTitle}
                    onChange={(e) => setNewRoomTitle(e.target.value)}
                    placeholder="What's the frequency?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-gold/30 transition-all font-black text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={handleCreateRoom}
                className={`w-full py-5 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all`}
              >
                Go Live on Audio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRooms;
