
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

interface ChatProps {
  activePartner?: UserType | null;
  onUpdateBalance: (amount: number) => void;
  messagesByThread: Record<string, Message[]>;
  onSendMessage: (threadId: string, msg: Message) => void;
}

const MOCK_THREADS: ChatThread[] = [
  {
    id: 't1',
    partner: { id: 'u1', name: 'Zoe M.', avatar: 'Z', location: 'London, UK' },
    lastMessage: "Asset bridging complete. Let's talk business.",
    timestamp: new Date(),
    unreadCount: 0,
    online: true
  },
  {
    id: 't2',
    partner: { id: 'u2', name: 'Kwame O.', avatar: 'K', location: 'Accra, GH' },
    lastMessage: "Manifesting new beats this weekend!",
    timestamp: new Date(Date.now() - 3600000),
    unreadCount: 0,
    online: false
  }
];

const Chat: React.FC<ChatProps> = ({ activePartner, onUpdateBalance, messagesByThread, onSendMessage }) => {
  const [view, setView] = useState<'list' | 'conversation'>('list');
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [calling, setCalling] = useState<'audio' | 'video' | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePartner) {
      const thread = { id: activePartner.id, partner: activePartner, lastMessage: '', timestamp: new Date(), unreadCount: 0, online: true };
      setCurrentThread(thread);
      setView('conversation');
    }
  }, [activePartner]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messagesByThread, view]);

  const handleSend = (type: MessageType = 'text', payload?: any) => {
    if (!currentThread) return;

    let newMessage: Message;
    
    if (type === 'text') {
      if (!inputValue.trim()) return;
      newMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        type: 'text',
        text: inputValue,
        timestamp: new Date(),
        status: 'sent'
      };
      setInputValue('');
    } else if (type === 'money') {
      const amt = parseFloat(transferAmount);
      if (isNaN(amt) || amt <= 0) return;
      newMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        type: 'money',
        amount: amt,
        timestamp: new Date(),
        status: 'sent'
      };
      onUpdateBalance(-amt);
      setTransferAmount('');
      setShowTransfer(false);
    } else {
      newMessage = { id: Date.now().toString(), senderId: 'me', type, mediaUrl: 'https://picsum.photos/seed/ekan/400/300', timestamp: new Date(), status: 'sent' };
    }

    onSendMessage(currentThread.id, newMessage);
    setShowAttachments(false);

    // AI Simulation: Partner auto-replies using the Gemini service
    setTimeout(async () => {
      const prompt = `You are ${currentThread.partner.name} responding to a friend named User. They just sent: "${newMessage.text || 'money transfer'}". Give a friendly, cultural, and professional reply. Keep it under 25 words.`;
      const reply = await EKANPilotService.getResponse(prompt);
      onSendMessage(currentThread.id, {
        id: (Date.now() + 1).toString(),
        senderId: currentThread.id,
        type: 'text',
        text: reply,
        timestamp: new Date(),
        status: 'read'
      });
    }, 3500);
  };

  const activeMessages = currentThread ? (messagesByThread[currentThread.id] || []) : [];

  if (view === 'list') {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-1000 pb-24">
        <div className="p-12 pb-6 space-y-10">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-black tracking-tighter">Bridges</h1>
            <button className={`p-5 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-[1.8rem] text-black shadow-2xl active:scale-95 transition-all`}>
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>
          <div className="relative group">
            <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-700" />
            <input 
              type="text" 
              placeholder="Search secure node threads..." 
              className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-6 pl-18 pr-8 text-sm focus:outline-none focus:border-gold/30 transition-all placeholder:text-gray-800"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 space-y-4 scrollbar-hide">
          {MOCK_THREADS.map((thread) => (
            <button 
              key={thread.id}
              onClick={() => { setCurrentThread(thread); setView('conversation'); }}
              className="w-full flex items-center space-x-6 p-7 rounded-[3.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/5 hover:border-white/10 transition-all group shadow-xl"
            >
              <div className="relative">
                <div className={`w-18 h-18 rounded-[1.6rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-xl`}>
                  <div className="w-full h-full bg-black rounded-[1.5rem] flex items-center justify-center font-black text-2xl">
                    {thread.partner.avatar}
                  </div>
                </div>
                {thread.online && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#050505]"></div>}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-black text-xl tracking-tight group-hover:text-gold transition-colors">{thread.partner.name}</h3>
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
              <div className="w-full h-full bg-black rounded-[4.8rem] flex items-center justify-center text-8xl font-black text-white">
                {currentThread?.partner.avatar}
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
                <div className="w-full h-full bg-black rounded-[1.3rem] flex items-center justify-center font-black text-3xl">
                  {currentThread?.partner.avatar}
                </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">{currentThread?.partner.name}</h2>
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
        {activeMessages.map((m) => {
          const isMe = m.senderId === 'me';
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
              <div className={`max-w-[80%] relative group`}>
                <div className={`p-8 rounded-[3rem] shadow-3xl relative overflow-hidden ${
                  isMe 
                  ? 'bg-indigo-600/20 text-white rounded-tr-none border border-indigo-500/20 backdrop-blur-3xl' 
                  : 'bg-white/[0.05] backdrop-blur-3xl text-white rounded-tl-none border border-white/10'
                }`}>
                  {m.type === 'text' && <p className="text-[17px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{m.text}</p>}
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
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck size={16} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Immersive Interaction Tray */}
      <div className="p-10 pt-2">
        {showAttachments && (
          <div className="grid grid-cols-4 gap-6 mb-8 animate-in slide-in-from-bottom-12 duration-500">
             {[
               { icon: ImageIcon, label: 'Asset', color: 'bg-indigo-600', type: 'image' },
               { icon: PlayCircle, label: 'Media', color: 'bg-red-600', type: 'video' },
               { icon: DollarSign, label: 'Transmission', color: 'bg-green-600', type: 'money' },
               { icon: MoreHorizontal, label: 'Protocol', color: 'bg-gray-800', type: 'none' }
             ].map(item => (
               <button 
                key={item.label}
                onClick={() => item.type === 'money' ? setShowTransfer(true) : item.type !== 'none' && handleSend(item.type as MessageType)}
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
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Transmit message across nodes..." className="flex-1 bg-transparent py-5 text-lg font-medium focus:outline-none placeholder:text-gray-800 tracking-tight" />
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
                <h3 className="text-5xl font-black tracking-tighter">Bridge Asset</h3>
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
