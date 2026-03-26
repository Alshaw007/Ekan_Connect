
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
  MessageCircle,
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
      <div className="flex flex-col h-full bg-white dark:bg-[#111b21] animate-in fade-in duration-500">
        {/* Search Bar */}
        <div className="px-4 py-2">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-slate-100 dark:bg-[#202c33] border-none rounded-lg py-2 pl-12 pr-4 text-sm focus:outline-none transition-all placeholder:text-slate-500 text-slate-900 dark:text-[#e9edef]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {threads.map((thread) => (
            <button 
              key={thread.id}
              onClick={() => { setCurrentThread(thread); setView('conversation'); }}
              className="w-full flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#202c33] transition-colors border-b border-slate-100 dark:border-slate-800/50"
            >
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  {thread.partner.avatar ? (
                    <img src={thread.partner.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xl">
                      {thread.partner.name[0]}
                    </div>
                  )}
                </div>
                {thread.online && (
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#111b21]"></div>
                )}
              </div>
              <div className="flex-1 ml-4 text-left min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-semibold text-[17px] text-slate-900 dark:text-[#e9edef] truncate">
                    {thread.partner.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {thread.lastMessage}
                  </p>
                  {thread.unreadCount > 0 && (
                    <span className="bg-brand-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* FAB */}
        <button className="absolute bottom-6 right-6 w-14 h-14 bg-brand-green text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-20">
          <MessageCircle size={24} fill="currentColor" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] animate-in slide-in-from-right duration-300 relative">
      {/* WhatsApp Chat Background Pattern Simulation */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>

      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-slate-200 dark:border-slate-800 z-20">
        <div className="flex items-center">
          <button onClick={() => setView('list')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center ml-1 cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              {currentThread?.partner.avatar ? (
                <img src={currentThread.partner.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                  {currentThread?.partner.name[0]}
                </div>
              )}
            </div>
            <div className="ml-3">
              <h2 className="text-[16px] font-semibold text-slate-900 dark:text-[#e9edef] leading-tight">
                {currentThread?.partner.name}
              </h2>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight">
                {currentThread?.online ? 'online' : 'last seen recently'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setCalling('video')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <button onClick={() => setCalling('audio')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide z-10">
        <div className="flex justify-center mb-4">
          <span className="bg-white dark:bg-[#182229] text-slate-500 dark:text-slate-400 text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm uppercase tracking-wider">
            Today
          </span>
        </div>
        
        {messages.map((m) => {
          const isMe = m.senderId === authUser?.uid;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
              <div className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-whatsapp relative ${
                isMe 
                ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-[#e9edef] rounded-tr-none' 
                : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] rounded-tl-none'
              }`}>
                {/* Tail simulation */}
                <div className={`absolute top-0 w-2 h-2 ${
                  isMe 
                  ? '-right-1.5 bg-[#dcf8c6] dark:bg-[#005c4b]' 
                  : '-left-1.5 bg-white dark:bg-[#202c33]'
                }`} style={{ clipPath: isMe ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
                
                <div className="flex flex-col">
                  {m.type === 'text' && <p className="text-[14.5px] leading-normal">{m.text}</p>}
                  {m.type === 'image' && (
                    <div className="rounded-md overflow-hidden mb-1">
                      <img src={m.mediaUrl} alt="attachment" className="w-full max-h-64 object-cover" />
                    </div>
                  )}
                  {m.type === 'money' && (
                    <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/10 dark:border-white/10 mb-1">
                      <div className="flex items-center space-x-2 text-brand-green mb-1">
                        <DollarSign size={16} />
                        <span className="text-xs font-bold uppercase">Payment</span>
                      </div>
                      <p className="text-xl font-bold">${m.amount?.toFixed(2)}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-end space-x-1 mt-0.5 self-end">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck size={14} className="text-blue-400" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Tray */}
      <div className="p-2 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center space-x-2 z-20">
        <div className="flex items-center">
          <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <Sparkles size={24} />
          </button>
          <button onClick={() => setShowAttachments(!showAttachments)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <Paperclip size={24} />
          </button>
        </div>
        
        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg px-3 py-1.5 flex items-center">
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder="Type a message" 
            className="flex-1 bg-transparent border-none focus:outline-none text-[15px] text-slate-900 dark:text-[#e9edef] placeholder:text-slate-500" 
          />
        </div>

        <button 
          onClick={() => handleSend()} 
          className="w-11 h-11 bg-brand-green text-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          {inputValue.trim() ? <Send size={20} fill="currentColor" /> : <Mic size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Chat;
