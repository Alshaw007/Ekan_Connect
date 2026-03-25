
import React, { useState, useEffect, useRef } from 'react';
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
  X
} from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Message, User as UserType, ChatThread, MessageType } from '../types';
import { EKANPilotService } from '../services/gemini';
import { useFirebase } from './FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc, where, limit } from 'firebase/firestore';

interface ChatProps {
  activePartner?: UserType | null;
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
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper to get deterministic chatId
  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  };

  // Sync Threads (for the list view)
  useEffect(() => {
    if (!authUser) return;

    // In a real app, we'd query a 'threads' collection where user is participant.
    // For now, let's just show users we can chat with.
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const otherUsers = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as UserType))
        .filter(u => u.id !== authUser.uid);
      
      const generatedThreads: ChatThread[] = otherUsers.map(u => ({
        id: getChatId(authUser.uid, u.id),
        partner: u,
        lastMessage: 'Tap to start bridging...',
        timestamp: new Date().toISOString(),
        unreadCount: 0,
        online: true
      }));
      setThreads(generatedThreads);
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
        id: getChatId(authUser.uid, activePartner.id), 
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

    let newMessageData: any = {
      senderId: authUser.uid,
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
    } else if (type === 'image' || type === 'video') {
      newMessageData.mediaUrl = type === 'image' 
        ? `https://picsum.photos/seed/${Math.random()}/800/600`
        : 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
      newMessageData.fileName = payload?.name || 'attachment';
    } else {
      newMessageData.mediaUrl = 'https://picsum.photos/seed/ekan/400/300';
    }

    try {
      await addDoc(collection(db, 'chats', currentThread.id, 'messages'), newMessageData);
      setShowAttachments(false);

      // AI Simulation: Partner auto-replies using the Gemini service
      if (type === 'text') {
        setTimeout(async () => {
          const prompt = `You are ${currentThread.partner.name} responding to a friend named ${profile.name}. They just sent: "${newMessageData.text}". Give a friendly, cultural, and professional reply. Keep it under 25 words.`;
          const reply = await EKANPilotService.getResponse(prompt);
          await addDoc(collection(db, 'chats', currentThread.id, 'messages'), {
            senderId: currentThread.partner.id,
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
            <button className={`p-5 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-[1.8rem] text-black shadow-2xl active:scale-95 transition-all`}>
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>
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
            </div>
          </div>
        </div>
        <div className="flex space-x-5">
            <button onClick={() => setCalling('audio')} className="p-5 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl"><Phone size={24} /></button>
            <button onClick={() => setCalling('video')} className="p-5 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl"><Video size={24} /></button>
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
        {messages.map((m) => {
          const isMe = m.senderId === authUser?.uid;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
              <div className={`max-w-[80%] relative group`}>
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
                  <div className="flex items-center justify-end space-x-3 mt-4 opacity-30">
                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck size={16} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
        <div className="flex items-center space-x-6">
          <div className="flex-1 bg-white/5 backdrop-blur-[60px] px-8 py-4 rounded-[3rem] border border-white/10 shadow-3xl flex items-center space-x-5 group focus-within:border-gold/30 transition-all">
            <button onClick={() => setShowAttachments(!showAttachments)} className={`p-2 transition-all duration-500 ${showAttachments ? 'text-gold rotate-45' : 'text-gray-600 hover:text-gold'}`}><Paperclip size={32} /></button>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Transmit message across nodes..." className="flex-1 bg-transparent py-5 text-lg font-medium focus:outline-none placeholder:text-gray-800 tracking-tight text-white" />
          </div>
          <button onClick={() => handleSend()} className={`p-8 rounded-full shadow-3xl transition-all active:scale-90 flex items-center justify-center ${inputValue.trim() ? `bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black` : 'bg-white/5 text-gray-700 border border-white/10'}`}>{inputValue.trim() ? <Send size={32} strokeWidth={3} /> : <Mic size={32} />}</button>
        </div>
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
