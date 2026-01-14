
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
    partner: { id: 'u1', name: 'Josephine B.', avatar: 'J', location: 'Monrovia, LR' },
    lastMessage: "Asset bridging complete. See you at the gathering.",
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

    // AI Simulation: Partner auto-replies
    setTimeout(async () => {
      const reply = await EKANPilotService.getResponse(`Pretend you are ${currentThread.partner.name}. Reply to: "${newMessage.text || 'asset sent'}"`);
      onSendMessage(currentThread.id, {
        id: (Date.now() + 1).toString(),
        senderId: currentThread.id,
        type: 'text',
        text: reply,
        timestamp: new Date(),
        status: 'read'
      });
    }, 3000);
  };

  const activeMessages = currentThread ? (messagesByThread[currentThread.id] || []) : [];

  if (view === 'list') {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-1000 pb-24">
        <div className="p-10 pb-6 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-black tracking-tighter">Bridges</h1>
            <button className={`p-4 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-2xl text-black shadow-2xl active:scale-95 transition-all`}>
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
          <div className="relative group">
            <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
            <input 
              type="text" 
              placeholder="Search secure threads..." 
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm focus:outline-none focus:border-gold/30 transition-all placeholder:text-gray-800"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 space-y-3 scrollbar-hide">
          {MOCK_THREADS.map((thread) => (
            <button 
              key={thread.id}
              onClick={() => { setCurrentThread(thread); setView('conversation'); }}
              className="w-full flex items-center space-x-5 p-6 rounded-[3rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/5 hover:border-white/10 transition-all group"
            >
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-xl`}>
                  <div className="w-full h-full bg-black rounded-[0.9rem] flex items-center justify-center font-black text-xl">
                    {thread.partner.avatar}
                  </div>
                </div>
                {thread.online && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#050505]"></div>}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-black text-lg tracking-tight group-hover:text-gold transition-colors">{thread.partner.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Now</span>
                </div>
                <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{thread.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent animate-in slide-in-from-right duration-700 relative">
      {/* Call UI */}
      {calling && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-[100px] flex flex-col items-center justify-center space-y-12 animate-in zoom-in-95 duration-500">
           <div className={`w-48 h-48 rounded-[4rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-2xl`}>
              <div className="w-full h-full bg-black rounded-[3.8rem] flex items-center justify-center text-7xl font-black text-white">
                {currentThread?.partner.avatar}
              </div>
           </div>
           <div className="text-center space-y-4">
              <h2 className="text-5xl font-black tracking-tighter text-white">{currentThread?.partner.name}</h2>
              <div className="flex items-center justify-center space-x-3 text-gold text-[12px] font-black uppercase tracking-[0.6em]">
                <div className="w-2 h-2 bg-gold rounded-full animate-ping"></div>
                <span>Syncing Audio Bridge</span>
              </div>
           </div>
           <div className="flex space-x-10 pt-10">
              <button onClick={() => setCalling(null)} className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white shadow-3xl hover:scale-110 active:scale-90 transition-all"><X size={40} /></button>
              <button className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-black shadow-3xl hover:scale-110 active:scale-90 transition-all"><Phone size={40} /></button>
           </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="flex items-center justify-between p-8 border-b border-white/10 bg-white/5 backdrop-blur-3xl z-20">
        <div className="flex items-center space-x-5">
          <button onClick={() => setView('list')} className="p-2 text-gray-500 hover:text-white transition-all"><ChevronLeft size={30} /></button>
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-xl`}>
                <div className="w-full h-full bg-black rounded-[0.9rem] flex items-center justify-center font-black text-2xl">
                  {currentThread?.partner.avatar}
                </div>
            </div>
            {currentThread?.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0B0B0B]"></div>}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter">{currentThread?.partner.name}</h2>
            <div className="flex items-center space-x-2">
               <span className="text-[10px] text-green-500 font-black uppercase tracking-[0.3em]">Node Active</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
            <button onClick={() => setCalling('audio')} className="p-4 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl"><Phone size={22} /></button>
            <button onClick={() => setCalling('video')} className="p-4 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl"><Video size={22} /></button>
        </div>
      </div>

      {/* Messaging Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
        {activeMessages.map((m) => {
          const isMe = m.senderId === 'me';
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] relative group`}>
                <div className={`p-6 rounded-[2.5rem] shadow-2xl relative ${
                  isMe 
                  ? 'bg-indigo-600/20 text-white rounded-tr-none border border-indigo-500/20 backdrop-blur-3xl' 
                  : 'bg-white/[0.05] backdrop-blur-3xl text-white rounded-tl-none border border-white/10'
                }`}>
                  {m.type === 'text' && <p className="text-[16px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{m.text}</p>}
                  {m.type === 'money' && (
                    <div className={`p-8 rounded-[2rem] ${isMe ? 'bg-green-500/10 border-green-500/30' : 'bg-gold/10 border-gold/30'} border space-y-6`}>
                       <div className="flex items-center space-x-4">
                         <div className={`p-4 rounded-2xl ${isMe ? 'bg-green-500/20 text-green-400' : 'bg-gold/20 text-gold'}`}><DollarSign size={32} /></div>
                         <div>
                            <h4 className="text-xl font-black tracking-tight">{isMe ? 'Sent' : 'Received'} Asset</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bridged via Grid Rail</p>
                         </div>
                       </div>
                       <div className="text-5xl font-black tracking-tighter text-white">
                         <span className="text-base mr-1 opacity-40 text-gold">$</span>{m.amount?.toFixed(2)}
                       </div>
                       <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">Protocol Confirmed</span>
                         <CheckCheck size={14} className="text-green-500" />
                       </div>
                    </div>
                  )}
                  <div className="flex items-center justify-end space-x-2 mt-4 opacity-40">
                    <span className="text-[9px] font-black uppercase tracking-widest">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck size={14} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Tray */}
      <div className="p-8 pt-2">
        {showAttachments && (
          <div className="grid grid-cols-4 gap-4 mb-6 animate-in slide-in-from-bottom-10 duration-500">
             {[
               { icon: ImageIcon, label: 'Asset', color: 'bg-indigo-600', type: 'image' },
               { icon: PlayCircle, label: 'Media', color: 'bg-red-600', type: 'video' },
               { icon: DollarSign, label: 'Money', color: 'bg-green-600', type: 'money' },
               { icon: MoreHorizontal, label: 'More', color: 'bg-gray-800', type: 'none' }
             ].map(item => (
               <button 
                key={item.label}
                onClick={() => item.type === 'money' ? setShowTransfer(true) : item.type !== 'none' && handleSend(item.type as MessageType)}
                className="flex flex-col items-center space-y-3 group"
               >
                  <div className={`w-16 h-16 rounded-3xl ${item.color} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform`}><item.icon size={28} /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">{item.label}</span>
               </button>
             ))}
          </div>
        )}
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-white/5 backdrop-blur-[50px] px-6 py-3 rounded-[2.5rem] border border-white/10 shadow-3xl flex items-center space-x-3 group focus-within:border-gold/30 transition-all">
            <button onClick={() => setShowAttachments(!showAttachments)} className={`p-2 transition-all ${showAttachments ? 'text-gold rotate-45' : 'text-gray-600 hover:text-gold'}`}><Paperclip size={28} /></button>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Message across the bridge..." className="flex-1 bg-transparent py-4 text-base font-medium focus:outline-none placeholder:text-gray-800 tracking-tight" />
          </div>
          <button onClick={() => handleSend()} className={`p-6 rounded-full shadow-3xl transition-all active:scale-90 flex items-center justify-center ${inputValue.trim() ? `bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black` : 'bg-white/5 text-gray-700 border border-white/10'}`}>{inputValue.trim() ? <Send size={28} strokeWidth={3} /> : <Mic size={28} />}</button>
        </div>
      </div>

      {showTransfer && (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-[40px] flex items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[4rem] p-12 space-y-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative">
              <button onClick={() => setShowTransfer(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={24} /></button>
              <div className="text-center space-y-4 pt-4">
                <div className="w-20 h-20 bg-green-500/10 rounded-3xl mx-auto flex items-center justify-center text-green-500 mb-4"><DollarSign size={40} /></div>
                <h3 className="text-4xl font-black tracking-tighter">Bridge Assets</h3>
                <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.4em]">Bridging funds to {currentThread?.partner.name}</p>
              </div>
              <div className="relative group">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gold font-black text-3xl">$</span>
                <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-10 pl-16 pr-8 text-5xl font-black text-white focus:outline-none focus:border-gold/30 transition-all text-center tracking-tighter" />
              </div>
              <button onClick={() => handleSend('money')} className={`w-full py-7 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-3xl active:scale-95 transition-all`}>Authorize Transmission</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
