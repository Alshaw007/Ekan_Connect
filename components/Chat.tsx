
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
  ShieldCheck, 
  MoreHorizontal, 
  Plus, 
  ChevronLeft,
  Search,
  Phone,
  Video,
  CheckCheck,
  ImageIcon,
  DollarSign,
  PlayCircle,
  Paperclip,
  X,
  Sparkles,
  Users,
  MicOff,
  VideoOff,
  Volume2
} from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Message, User as UserType, ChatThread, MessageType, Community } from '../types';
import { EKANPilotService } from '../services/gemini';
import { useFirebase } from './FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc, where, limit } from 'firebase/firestore';

interface ChatProps {
  activePartner?: UserType | Community | null;
  onUpdateBalance: (amount: number, description?: string) => void;
  messagesByThread?: any;
  onSendMessage?: (threadId: string, msg: Message) => Promise<void>;
}

const Chat: React.FC<ChatProps> = ({ activePartner, onUpdateBalance }) => {
  const { user: authUser, profile } = useFirebase();
  const [view, setView] = useState<'list' | 'conversation'>('list');
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [calling, setCalling] = useState<'audio' | 'video' | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  
  const emojis = ['😀', '😂', '😍', '🤔', '🔥', '🙌', '✨', '🌍', '🇳🇬', '🇬🇭', '🇱🇷', '🇿🇦', '🇰🇪', '🇪🇬', '🇲🇦', '🇸🇳'];
  const stickers = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKv9QWQI2Z9zZ9u/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/l0HlTy9x7F8O8X0qY/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKVUn7iM8FMEU24/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKv9QWQI2Z9zZ9u/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKv9QWQI2Z9zZ9u/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4eXh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKv9QWQI2Z9zZ9u/giphy.gif'
  ];

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEmojiClick = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleStickerClick = (stickerUrl: string) => {
    handleSend('image', { mediaUrl: stickerUrl });
    setShowStickers(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0 || !authUser) return;

    const newGroup: any = {
      type: 'group',
      name: groupName,
      avatar: `https://picsum.photos/seed/${groupName}/200/200`,
      participants: [authUser.uid, ...selectedMembers],
      members: [authUser.uid, ...selectedMembers],
      lastMessage: 'Group bridge established.',
      timestamp: serverTimestamp(),
      unreadCount: 0,
      typing: {}
    };

    try {
      const docRef = await addDoc(collection(db, 'threads'), newGroup);
      setCurrentThread({ ...newGroup, id: docRef.id, partner: { id: docRef.id, name: groupName, avatar: newGroup.avatar, location: 'Global Node' } });
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedMembers([]);
      setView('conversation');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'threads');
    }
  };

  useEffect(() => {
    if (!currentThread || !authUser) return;

    if (inputValue.trim() && !isTyping) {
      setIsTyping(true);
      setDoc(doc(db, 'threads', currentThread.id), {
        typing: { [authUser.uid]: true }
      }, { merge: true });
    } else if (!inputValue.trim() && isTyping) {
      setIsTyping(false);
      setDoc(doc(db, 'threads', currentThread.id), {
        typing: { [authUser.uid]: false }
      }, { merge: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setDoc(doc(db, 'threads', currentThread.id), {
          typing: { [authUser.uid]: false }
        }, { merge: true });
      }
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [inputValue, currentThread, authUser]);

  const [isRecording, setIsRecording] = useState<'voice' | 'video' | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = (type: 'voice' | 'video') => {
    setIsRecording(type);
    setRecordingDuration(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = (send: boolean = true) => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (send && isRecording) {
      handleSend(isRecording === 'voice' ? 'voice_memo' : 'video_memo', { duration: recordingDuration });
    }
    setIsRecording(null);
    setRecordingDuration(0);
  };

  const TypingIndicator = () => (
    <div className="flex items-center space-x-3 p-5 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 w-fit animate-in fade-in slide-in-from-left-6 duration-700 shadow-2xl">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
              boxShadow: [
                '0 0 0px rgba(212, 175, 55, 0)',
                '0 0 15px rgba(212, 175, 55, 0.8)',
                '0 0 0px rgba(212, 175, 55, 0)'
              ]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="w-2.5 h-2.5 bg-gold rounded-full"
          />
        ))}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold animate-pulse">Neural Link Active</span>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Transmitting Data...</span>
      </div>
    </div>
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper to get deterministic chatId
  const getChatId = (uid1: string, partner: UserType | Community) => {
    if ('members' in partner) { // It's a community
      return partner.id;
    }
    return [uid1, partner.id].sort().join('_');
  };

  // Sync Threads (for the list view)
  useEffect(() => {
    if (!authUser) return;

    const threadsRef = collection(db, 'threads');
    const q = query(threadsRef, where('participants', 'array-contains', authUser.uid), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedThreads = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        // If it's a 1-on-1 chat, we need to fetch the partner's profile
        let partner = data.partner;
        if (data.type !== 'group' && data.participants) {
          const partnerId = data.participants.find((id: string) => id !== authUser.uid);
          if (partnerId) {
            const partnerDoc = await getDoc(doc(db, 'users', partnerId));
            if (partnerDoc.exists()) {
              partner = { ...partnerDoc.data(), id: partnerId };
            }
          }
        }
        return {
          ...data,
          id: d.id,
          partner
        } as ChatThread;
      }));
      
      if (fetchedThreads.length > 0) {
        setThreads(fetchedThreads);
      } else {
        // Fallback to showing users if no threads exist
        const usersRef = collection(db, 'users');
        const unsubUsers = onSnapshot(usersRef, (uSnap) => {
          const otherUsers = uSnap.docs
            .map(doc => ({ ...doc.data(), id: doc.id } as UserType))
            .filter(u => u.id !== authUser.uid);
          
          const generatedThreads: ChatThread[] = otherUsers.map(u => ({
            id: getChatId(authUser.uid, u),
            type: 'direct',
            members: [authUser.uid, u.id],
            partner: u,
            lastMessage: 'Tap to start bridging...',
            timestamp: new Date().toISOString(),
            unreadCount: 0,
            online: true,
            participants: [authUser.uid, u.id]
          } as ChatThread));
          setThreads(generatedThreads);
        });
        return () => unsubUsers();
      }
    });

    return () => unsubscribe();
  }, [authUser]);

  // Sync Messages for current thread
  useEffect(() => {
    if (!currentThread || !authUser) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'chats', currentThread.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Message;
      });
      setMessages(fetchedMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${currentThread.id}/messages`);
    });

    return () => unsubscribe();
  }, [currentThread, authUser]);

  useEffect(() => {
    if (activePartner && authUser) {
      const thread: ChatThread = { 
        id: getChatId(authUser.uid, activePartner), 
        type: 'direct',
        members: [authUser.uid, activePartner.id],
        partner: activePartner, 
        lastMessage: '', 
        timestamp: new Date().toISOString(), 
        unreadCount: 0, 
        online: true 
      };
      setCurrentThread(thread);
      setView('conversation');
    }
  }, [activePartner, authUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, view]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFileType, setPendingFileType] = useState<MessageType | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingFileType) {
      handleSend(pendingFileType, { name: file.name });
      setPendingFileType(null);
    }
  };

  const triggerFileSelect = (type: MessageType) => {
    setPendingFileType(type);
    fileInputRef.current?.click();
  };

  const handleSend = async (type: MessageType = 'text', payload?: any) => {
    if (!currentThread || !authUser || !profile) return;
    setShowEmoji(false);

    let newMessageData: any = {
      senderId: authUser.uid,
      senderName: profile.name,
      senderAvatar: profile.avatar,
      type,
      timestamp: serverTimestamp(),
      status: 'sent'
    };
    
    if (type === 'text') {
      if (!inputValue.trim()) return;
      newMessageData.text = inputValue;
      setInputValue('');
    } else if (type === 'money') {
      const amt = parseFloat(transferAmount);
      if (isNaN(amt) || amt <= 0) return;
      newMessageData.amount = amt;
      onUpdateBalance(-amt);
      setTransferAmount('');
      setShowTransfer(false);
    } else if (type === 'image' || type === 'video' || type === 'file') {
      newMessageData.mediaUrl = type === 'image' 
        ? `https://picsum.photos/seed/${Math.random()}/800/600`
        : type === 'video' 
          ? 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
          : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      newMessageData.fileName = payload?.name || 'attachment';
    } else if (type === 'voice_memo' || type === 'video_memo') {
      newMessageData.mediaUrl = type === 'voice_memo' 
        ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        : 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
      newMessageData.duration = payload?.duration || 0;
    } else if (type === 'call') {
      newMessageData.callId = payload?.callId;
      newMessageData.text = payload?.text || 'Call';
    } else {
      newMessageData.mediaUrl = 'https://picsum.photos/seed/ekan/400/300';
    }

    try {
      await addDoc(collection(db, 'chats', currentThread.id, 'messages'), newMessageData);
      setShowAttachments(false);

      // AI Simulation: Partner auto-replies using the Gemini service
      if (type === 'text') {
        setTimeout(async () => {
          const isCommunity = 'members' in currentThread.partner;
          const partnerName = currentThread.partner.name;
          const prompt = isCommunity 
            ? `You are the AI Pilot for the community "${partnerName}". A member named ${profile.name} just posted: "${newMessageData.text}". Give a helpful, community-focused, and culturally relevant reply. Keep it under 25 words.`
            : `You are ${partnerName} responding to a friend named ${profile.name}. They just sent: "${newMessageData.text}". Give a friendly, cultural, and professional reply. Keep it under 25 words.`;
          
          const reply = await EKANPilotService.getResponse(prompt);
          await addDoc(collection(db, 'chats', currentThread.id, 'messages'), {
            senderId: isCommunity ? 'community_pilot' : currentThread.partner.id,
            senderName: isCommunity ? `${partnerName} Pilot` : partnerName,
            senderAvatar: isCommunity ? 'https://picsum.photos/seed/pilot/200/200' : (currentThread.partner as UserType).avatar,
            type: 'text',
            text: reply,
            timestamp: serverTimestamp(),
            status: 'read'
          });
        }, 3500);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${currentThread.id}/messages`);
    }
  };

  if (view === 'list') {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-1000 pb-24">
        <div className="p-12 pb-6 space-y-10">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-black tracking-tighter text-white">Bridges</h1>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="p-5 bg-white/5 border border-white/10 rounded-[1.8rem] text-gold shadow-2xl active:scale-95 transition-all"
              >
                <Users size={28} strokeWidth={3} />
              </button>
              <button className={`p-5 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-[1.8rem] text-black shadow-2xl active:scale-95 transition-all`}>
                <Plus size={28} strokeWidth={3} />
              </button>
            </div>
          </div>
          
          {showCreateGroup && (
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-8 animate-in slide-in-from-top-10 duration-500 shadow-3xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black tracking-tighter text-white">Establish Group Node</h3>
                <button onClick={() => setShowCreateGroup(false)} className="p-3 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={24} /></button>
              </div>
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Node Name..." 
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-lg focus:outline-none focus:border-gold/30 transition-all placeholder:text-gray-800 text-white"
              />
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 px-4">Select Participants</p>
                <div className="flex flex-wrap gap-3">
                  {threads.filter(t => t.type !== 'group').map(t => (
                    <button
                      key={t.partner.id}
                      onClick={() => {
                        setSelectedMembers(prev => 
                          prev.includes(t.partner.id) ? prev.filter(id => id !== t.partner.id) : [...prev, t.partner.id]
                        );
                      }}
                      className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                        selectedMembers.includes(t.partner.id) 
                        ? 'bg-gold border-gold text-black' 
                        : 'bg-white/5 border-white/10 text-gray-500'
                      }`}
                    >
                      {t.partner.name}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleCreateGroup}
                className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-[13px] uppercase tracking-[0.5em] shadow-3xl active:scale-95 transition-all"
              >
                Establish Bridge
              </button>
            </div>
          )}
          <div className="relative group">
            <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-700" />
            <input 
              type="text" 
              placeholder="Search secure node threads..." 
              className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-6 pl-18 pr-8 text-sm focus:outline-none focus:border-gold/30 transition-all placeholder:text-gray-800 text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 space-y-4 scrollbar-hide">
          {threads.map((thread) => (
            <button 
              key={thread.id}
              onClick={() => { setCurrentThread(thread); setView('conversation'); }}
              className="w-full flex items-center space-x-6 p-7 rounded-[3.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/5 hover:border-white/10 transition-all group shadow-xl"
            >
              <div className="relative">
                <div className={`w-18 h-18 rounded-[1.6rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-xl`}>
                  <div className="w-full h-full bg-black rounded-[1.5rem] flex items-center justify-center font-black text-2xl text-white overflow-hidden">
                    {thread.partner.avatar ? <img src={thread.partner.avatar} className="w-full h-full object-cover" /> : thread.partner.name[0]}
                  </div>
                </div>
                {thread.online && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#050505]"></div>}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-black text-xl tracking-tight group-hover:text-gold transition-colors text-white">{thread.partner.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Active</span>
                </div>
                <p className="text-sm text-gray-500 font-medium truncate max-w-[220px]">{thread.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent animate-in slide-in-from-right duration-700 relative">
      {/* Immersive Call Modal */}
      {calling && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-[120px] flex flex-col items-center justify-center space-y-16 animate-in zoom-in-95 duration-500">
           <div className={`w-56 h-56 rounded-[5rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-3xl`}>
              <div className="w-full h-full bg-black rounded-[4.8rem] flex items-center justify-center text-8xl font-black text-white overflow-hidden">
                {currentThread?.partner.avatar ? <img src={currentThread.partner.avatar} className="w-full h-full object-cover" /> : currentThread?.partner.name[0]}
              </div>
           </div>
           <div className="text-center space-y-5">
              <h2 className="text-6xl font-black tracking-tighter text-white">{currentThread?.partner.name}</h2>
              <div className="flex items-center justify-center space-x-4 text-gold text-[13px] font-black uppercase tracking-[0.7em]">
                <div className="w-3 h-3 bg-gold rounded-full animate-ping"></div>
                <span>Syncing Audio Bridge</span>
              </div>
           </div>
           <div className="flex space-x-12 pt-12">
              <button onClick={() => setCalling(null)} className="w-28 h-28 rounded-full bg-red-600 flex items-center justify-center text-white shadow-3xl hover:scale-110 active:scale-90 transition-all"><X size={48} /></button>
              <button className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center text-black shadow-3xl hover:scale-110 active:scale-90 transition-all"><Phone size={48} /></button>
           </div>
        </div>
      )}

      {/* Persistent conversation header */}
      <div className="flex items-center justify-between p-10 border-b border-white/10 bg-white/5 backdrop-blur-3xl z-20">
        <div className="flex items-center space-x-6">
          <button onClick={() => setView('list')} className="p-3 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl"><ChevronLeft size={32} /></button>
          <div className="relative">
            <div className={`w-16 h-16 rounded-[1.4rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-xl`}>
                <div className="w-full h-full bg-black rounded-[1.3rem] flex items-center justify-center font-black text-3xl text-white overflow-hidden">
                  {currentThread?.partner.avatar ? <img src={currentThread.partner.avatar} className="w-full h-full object-cover" /> : currentThread?.partner.name[0]}
                </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-white">{currentThread?.partner.name}</h2>
            <div className="flex items-center space-x-2">
               <span className="text-[10px] text-green-500 font-black uppercase tracking-[0.4em]">Grid Encryption Active</span>
               {currentThread?.type === 'group' && <span className="text-[10px] text-gold font-black uppercase tracking-[0.4em]">• Group Node</span>}
            </div>
          </div>
        </div>
        <div className="flex space-x-5">
            {currentThread?.type === 'group' && (
              <button className="p-5 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl"><Users size={24} /></button>
            )}
            <button onClick={() => setCalling('audio')} className="p-5 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl"><Phone size={24} /></button>
            <button onClick={() => setCalling('video')} className="p-5 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl"><Video size={24} /></button>
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
        {messages.map((m) => {
          const isMe = m.senderId === authUser?.uid;
          const isCommunity = currentThread && 'members' in currentThread.partner;
          
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
              <div className={`max-w-[80%] relative group flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-4`}>
                {!isMe && isCommunity && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 mb-1">
                    <img src={m.senderAvatar || `https://picsum.photos/seed/${m.senderId}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && isCommunity && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{m.senderName || 'Anonymous'}</span>
                  )}
                  <div className={`p-8 rounded-[3rem] shadow-3xl relative overflow-hidden ${
                    isMe 
                    ? 'bg-indigo-600/20 text-white rounded-tr-none border border-indigo-500/20 backdrop-blur-3xl' 
                    : 'bg-white/[0.05] backdrop-blur-3xl text-white rounded-tl-none border border-white/10'
                  }`}>
                  {m.type === 'text' && <p className="text-[17px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{m.text}</p>}
                  {m.type === 'image' && (
                    <div className="rounded-2xl overflow-hidden border border-white/10">
                      <img src={m.mediaUrl} alt="attachment" className="w-full max-h-60 object-cover" />
                    </div>
                  )}
                  {m.type === 'video' && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 relative group/video">
                      <video src={m.mediaUrl} className="w-full max-h-60 object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/video:opacity-100 transition-opacity">
                        <PlayCircle size={48} className="text-white" />
                      </div>
                    </div>
                  )}
                  {m.type === 'file' && (
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl"><Paperclip size={24} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-white">{m.fileName || 'Document'}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Secure Transmission</p>
                      </div>
                    </div>
                  )}
                  {m.type === 'money' && (
                    <div className={`p-10 rounded-[2.5rem] ${isMe ? 'bg-green-500/10 border-green-500/30' : 'bg-gold/10 border-gold/30'} border space-y-8`}>
                       <div className="flex items-center space-x-5">
                         <div className={`p-5 rounded-2xl ${isMe ? 'bg-green-500/20 text-green-400' : 'bg-gold/20 text-gold'}`}><DollarSign size={40} /></div>
                         <div>
                            <h4 className="text-2xl font-black tracking-tight">{isMe ? 'Transmitted' : 'Received'} Asset</h4>
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Bridged via Safe-Grid Protocol</p>
                         </div>
                       </div>
                       <div className="text-6xl font-black tracking-tighter text-white">
                         <span className="text-base mr-1 opacity-40 text-gold">$</span>{m.amount?.toFixed(2)}
                       </div>
                       <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Encrypted Handshake OK</span>
                         <CheckCheck size={18} className="text-green-500" />
                       </div>
                    </div>
                  )}
                  {m.type === 'voice_memo' && (
                    <div className="flex items-center space-x-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 min-w-[240px]">
                       <button className="w-14 h-14 rounded-full bg-gold/20 text-gold flex items-center justify-center hover:scale-110 transition-transform"><PlayCircle size={32} /></button>
                       <div className="flex-1 space-y-2">
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-gold w-1/3"></div>
                          </div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                             <span>0:00</span>
                             <span>{Math.floor(m.duration! / 60)}:{String(m.duration! % 60).padStart(2, '0')}</span>
                          </div>
                       </div>
                       <Mic size={20} className="text-gold/40" />
                    </div>
                  )}
                  {m.type === 'video_memo' && (
                    <div className="rounded-[2.5rem] overflow-hidden border border-white/10 relative group/video aspect-square w-64">
                       <video src={m.mediaUrl} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/video:opacity-100 transition-opacity">
                         <PlayCircle size={48} className="text-white" />
                       </div>
                       <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white">
                          {Math.floor(m.duration! / 60)}:{String(m.duration! % 60).padStart(2, '0')}
                       </div>
                    </div>
                  )}
                  {m.type === 'call' && (
                    <div className="flex items-center space-x-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/10">
                       <div className={`p-4 rounded-2xl ${m.text?.includes('Missed') ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                          {m.text?.includes('Video') ? <Video size={28} /> : <Phone size={28} />}
                       </div>
                       <div>
                          <p className="text-lg font-black tracking-tight text-white">{m.text}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Bridge Call</p>
                       </div>
                    </div>
                  )}
                  <div className="flex items-center justify-end space-x-3 mt-4 opacity-30">
                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck size={16} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })}
        {currentThread?.typing && Object.entries(currentThread.typing).some(([uid, typing]) => uid !== authUser?.uid && typing) && (
          <TypingIndicator />
        )}
      </div>

      {/* Interaction Tray */}
      <div className="p-10 pt-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelect}
          accept={pendingFileType === 'image' ? 'image/*' : pendingFileType === 'video' ? 'video/*' : '*'}
        />
        {showAttachments && (
          <div className="grid grid-cols-4 gap-6 mb-8 animate-in slide-in-from-bottom-12 duration-500">
             {[
               { icon: ImageIcon, label: 'Asset', color: 'bg-indigo-600', type: 'image' },
               { icon: PlayCircle, label: 'Media', color: 'bg-red-600', type: 'video' },
               { icon: DollarSign, label: 'Transmission', color: 'bg-green-600', type: 'money' },
               { icon: Paperclip, label: 'File', color: 'bg-gray-800', type: 'file' }
             ].map(item => (
               <button 
                key={item.label}
                onClick={() => {
                  if (item.type === 'money') {
                    setShowTransfer(true);
                  } else if (item.type === 'image' || item.type === 'video' || item.type === 'file') {
                    triggerFileSelect(item.type as MessageType);
                  }
                }}
                className="flex flex-col items-center space-y-4 group"
               >
                  <div className={`w-20 h-20 rounded-[2.2rem] ${item.color} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform`}><item.icon size={32} /></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-600">{item.label}</span>
               </button>
             ))}
          </div>
        )}
        {showEmoji && (
          <div className="absolute bottom-28 left-10 right-10 bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 animate-in slide-in-from-bottom-10 duration-500 shadow-3xl z-30">
            <div className="flex border-b border-white/10 mb-6">
               <button onClick={() => setShowStickers(false)} className={`px-6 py-3 text-xs font-black uppercase tracking-widest ${!showStickers ? 'text-gold border-b-2 border-gold' : 'text-gray-500'}`}>Emojis</button>
               <button onClick={() => setShowStickers(true)} className={`px-6 py-3 text-xs font-black uppercase tracking-widest ${showStickers ? 'text-gold border-b-2 border-gold' : 'text-gray-500'}`}>Stickers</button>
            </div>
            {!showStickers ? (
              <div className="grid grid-cols-8 gap-4 max-h-60 overflow-y-auto scrollbar-hide">
                {emojis.map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-4xl hover:scale-125 transition-transform active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-h-60 overflow-y-auto scrollbar-hide">
                {stickers.map((sticker, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleStickerClick(sticker)}
                    className="hover:scale-105 transition-transform active:scale-95 rounded-2xl overflow-hidden aspect-square bg-white/5"
                  >
                    <img src={sticker} alt="Sticker" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex items-center space-x-6">
          <div className="flex-1 bg-white/5 backdrop-blur-[60px] px-8 py-4 rounded-[3rem] border border-white/10 shadow-3xl flex items-center space-x-5 group focus-within:border-gold/30 transition-all">
            <button onClick={() => setShowAttachments(!showAttachments)} className={`p-2 transition-all duration-500 ${showAttachments ? 'text-gold rotate-45' : 'text-gray-600 hover:text-gold'}`}><Paperclip size={32} /></button>
            <button onClick={() => setShowEmoji(!showEmoji)} className={`p-2 transition-all duration-500 ${showEmoji ? 'text-gold' : 'text-gray-600 hover:text-gold'}`}><Sparkles size={32} /></button>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Transmit message across nodes..." className="flex-1 bg-transparent py-5 text-lg font-medium focus:outline-none placeholder:text-gray-800 tracking-tight text-white" />
            <button 
              onMouseDown={() => startRecording('video')}
              onMouseUp={() => stopRecording()}
              className="p-2 text-gray-600 hover:text-gold transition-all"
            >
              <Video size={32} />
            </button>
          </div>
          <button 
            onClick={() => handleSend()} 
            onMouseDown={() => !inputValue.trim() && startRecording('voice')}
            onMouseUp={() => !inputValue.trim() && stopRecording()}
            className={`p-8 rounded-full shadow-3xl transition-all active:scale-90 flex items-center justify-center ${inputValue.trim() ? `bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black` : 'bg-white/5 text-gray-700 border border-white/10'}`}
          >
            {inputValue.trim() ? <Send size={32} strokeWidth={3} /> : <Mic size={32} />}
          </button>
        </div>
        
        {/* Recording Overlay */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-x-10 bottom-32 bg-red-600 rounded-[3rem] p-8 flex items-center justify-between shadow-3xl z-40"
            >
              <div className="flex items-center space-x-6">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                <span className="text-[13px] font-black uppercase tracking-[0.4em] text-white">Recording {isRecording} Memo</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
              </div>
              <button onClick={() => stopRecording(false)} className="p-4 bg-white/20 rounded-2xl text-white hover:bg-white/30 transition-all">
                <X size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bridge Transmission Modal */}
      {showTransfer && (
        <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-[60px] flex items-center justify-center p-10 animate-in fade-in duration-500">
           <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[5rem] p-16 space-y-12 shadow-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/[0.02] animate-pulse"></div>
              <button onClick={() => setShowTransfer(false)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={32} /></button>
              <div className="text-center space-y-6 pt-6 relative z-10">
                <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] mx-auto flex items-center justify-center text-green-500 mb-6 shadow-2xl border border-green-500/20"><DollarSign size={48} /></div>
                <h3 className="text-5xl font-black tracking-tighter text-white">Bridge Asset</h3>
                <p className="text-[12px] text-gray-500 font-black uppercase tracking-[0.5em]">Executing transmission to {currentThread?.partner.name}</p>
              </div>
              <div className="relative group z-10">
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gold font-black text-5xl opacity-40">$</span>
                <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-[3rem] py-14 pl-20 pr-10 text-7xl font-black text-white focus:outline-none focus:border-gold/30 transition-all text-center tracking-tighter shadow-inner" />
              </div>
              <button onClick={() => handleSend('money')} className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[3rem] font-black text-[13px] uppercase tracking-[0.5em] shadow-3xl active:scale-95 transition-all relative z-10`}>Authorize Asset Transmission</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
