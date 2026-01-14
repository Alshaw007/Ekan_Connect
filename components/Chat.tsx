
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  ShieldCheck, 
  MoreHorizontal, 
  Globe, 
  Plus, 
  Sparkles, 
  ChevronLeft,
  Search,
  Phone,
  Video,
  CheckCheck,
  ImageIcon,
  FileText,
  DollarSign,
  Camera,
  PlayCircle,
  Paperclip,
  X
} from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Message, User as UserType, ChatThread, MessageType } from '../types';
import { EKANPilotService } from '../services/gemini';

interface ChatProps {
  activePartner?: UserType | null;
  onUpdateBalance?: (amount: number) => void;
}

const MOCK_THREADS: ChatThread[] = [
  {
    id: 't1',
    partner: { id: 'u1', name: 'Josephine B.', avatar: 'J', location: 'Monrovia, LR' },
    lastMessage: "Yeah, just bought my ticket on EKAN!",
    timestamp: new Date(),
    unreadCount: 2,
    online: true
  },
  {
    id: 't2',
    partner: { id: 'u2', name: 'Kwame O.', avatar: 'K', location: 'Accra, GH' },
    lastMessage: "Did you check the new Afrobeats drop?",
    timestamp: new Date(Date.now() - 3600000),
    unreadCount: 0,
    online: false
  },
  {
    id: 't3',
    partner: { id: 'u3', name: 'Zoe M.', avatar: 'Z', location: 'London, UK' },
    lastMessage: "The translation tool is incredible.",
    timestamp: new Date(Date.now() - 86400000),
    unreadCount: 0,
    online: true
  }
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', senderId: 'friend', type: 'text', text: 'Hey, are you going to the Tech Summit in Monrovia tomorrow?', timestamp: new Date(Date.now() - 7200000), status: 'read' },
  { id: '2', senderId: 'me', type: 'text', text: 'Yeah, just bought my ticket! The escrow protection made it so much safer.', timestamp: new Date(Date.now() - 3600000), status: 'read' },
  { id: '3', senderId: 'friend', type: 'text', text: 'Salut, pourrais-tu m\'aider à traduire ce document?', timestamp: new Date(Date.now() - 1800000), status: 'read' },
];

const Chat: React.FC<ChatProps> = ({ activePartner, onUpdateBalance }) => {
  const [view, setView] = useState<'list' | 'conversation'>('list');
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [calling, setCalling] = useState<'audio' | 'video' | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePartner) {
      const thread = { id: 'new', partner: activePartner, lastMessage: '', timestamp: new Date(), unreadCount: 0, online: true };
      setCurrentThread(thread);
      setView('conversation');
      setMessages([
        { 
          id: 'welcome', 
          senderId: 'friend', 
          type: 'text',
          text: `Hi! I saw we share interests in ${activePartner.interests?.join(', ')}. Let's connect!`, 
          timestamp: new Date(),
          status: 'read'
        }
      ]);
    } else {
      setView('list');
      setCurrentThread(null);
    }
  }, [activePartner]);

  useEffect(() => {
    if (scrollRef.current && view === 'conversation') {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, view]);

  const handleSend = (type: MessageType = 'text', payload?: any) => {
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
      onUpdateBalance?.(-amt);
      setTransferAmount('');
      setShowTransfer(false);
    } else {
      newMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        type: type,
        mediaUrl: payload.url,
        fileName: payload.name,
        timestamp: new Date(),
        status: 'sent'
      };
    }

    setMessages([...messages, newMessage]);
    setShowAttachments(false);
    
    // Simulate partner response
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m));
      }, 1500);
    }, 1000);
  };

  const translateMsg = async (id: string, text: string) => {
    setIsTranslating(id);
    const translated = await EKANPilotService.translateMessage(text);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, translatedText: translated } : m));
    setIsTranslating(null);
  };

  const openThread = (thread: ChatThread) => {
    setCurrentThread(thread);
    setView('conversation');
    setMessages(MOCK_MESSAGES);
  };

  if (view === 'list') {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500 pb-24">
        <div className="p-8 pb-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black tracking-tighter">Messages</h1>
            <div className="flex space-x-2">
              <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"><MoreHorizontal size={20} /></button>
              <button className={`p-3 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-2xl text-black shadow-lg active:scale-95 transition-all`}>
                <Plus size={20} />
              </button>
            </div>
          </div>
          
          <div className="relative group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-gold/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-2 scrollbar-hide">
          {MOCK_THREADS.map((thread) => (
            <button 
              key={thread.id}
              onClick={() => openThread(thread)}
              className="w-full flex items-center space-x-4 p-5 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/5 hover:border-white/10 transition-all group"
            >
              <div className="relative">
                <div className={`w-16 h-16 rounded-[1.4rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-xl`}>
                  <div className="w-full h-full bg-black rounded-[1.3rem] flex items-center justify-center font-black text-xl text-white">
                    {thread.partner.avatar}
                  </div>
                </div>
                {thread.online && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#050505] animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-black text-lg tracking-tight group-hover:text-gold transition-colors">{thread.partner.name}</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                    {thread.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-medium truncate max-w-[180px]">{thread.lastMessage}</p>
                  {thread.unreadCount > 0 && (
                    <div className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">
                      {thread.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent animate-in slide-in-from-right duration-500 relative">
      {/* Call Overlay */}
      {calling && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center space-y-12 animate-in zoom-in-95">
           <div className={`w-40 h-40 rounded-[3rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-2xl`}>
              <div className="w-full h-full bg-black rounded-[2.8rem] flex items-center justify-center text-6xl font-black text-white">
                {currentThread?.partner.avatar}
              </div>
           </div>
           <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tighter text-white">{currentThread?.partner.name}</h2>
              <p className="text-gold text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">Bridging Secure Line...</p>
           </div>
           <div className="flex space-x-8">
              <button onClick={() => setCalling(null)} className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-90 transition-all">
                <X size={32} />
              </button>
              <button className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-black shadow-2xl hover:scale-110 active:scale-90 transition-all">
                {calling === 'audio' ? <Phone size={32} /> : <Video size={32} />}
              </button>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-2xl z-20">
        <div className="flex items-center space-x-4">
          <button onClick={() => setView('list')} className="p-2 text-gray-500 hover:text-white transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="relative group cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-xl`}>
                <div className="w-full h-full bg-black rounded-[0.9rem] flex items-center justify-center font-black text-lg">
                  {currentThread?.partner.avatar}
                </div>
            </div>
            {currentThread?.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0B0B0B]"></div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tighter">{currentThread?.partner.name}</h2>
            <div className="flex items-center space-x-2">
               <span className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em]">{currentThread?.online ? 'Online' : 'Last seen 2h ago'}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
            <button onClick={() => setCalling('audio')} className="p-3 text-gray-500 hover:text-white transition-all"><Phone size={20} /></button>
            <button onClick={() => setCalling('video')} className="p-3 text-gray-500 hover:text-white transition-all"><Video size={20} /></button>
            <button className="p-3 text-gray-500 hover:text-white transition-all"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        {messages.map((m) => {
          const isMe = m.senderId === 'me';
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] relative group`}>
                <div className={`p-4 rounded-3xl shadow-2xl relative ${
                  isMe 
                  ? 'bg-indigo-600/20 text-white rounded-tr-none border border-indigo-500/20 backdrop-blur-xl' 
                  : 'bg-white/[0.05] backdrop-blur-2xl text-white rounded-tl-none border border-white/10'
                }`}>
                  {m.type === 'text' && (
                    <p className="text-[14px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{m.text}</p>
                  )}

                  {m.type === 'image' && (
                    <div className="rounded-2xl overflow-hidden border border-white/10">
                       <img src={m.mediaUrl || 'https://picsum.photos/seed/chat/400/300'} className="w-full object-cover max-h-60" />
                    </div>
                  )}

                  {m.type === 'video' && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 relative group/vid">
                       <img src="https://picsum.photos/seed/video/400/300" className="w-full object-cover max-h-60 opacity-60" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={48} className="text-white opacity-80 group-hover/vid:scale-110 transition-transform" />
                       </div>
                    </div>
                  )}

                  {m.type === 'file' && (
                    <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                       <div className="p-3 bg-white/10 rounded-xl text-indigo-400">
                         <FileText size={24} />
                       </div>
                       <div className="flex-1">
                         <p className="text-sm font-bold truncate max-w-[120px]">{m.fileName || 'document.pdf'}</p>
                         <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">2.4 MB • PDF</p>
                       </div>
                    </div>
                  )}

                  {m.type === 'money' && (
                    <div className={`p-6 rounded-2xl ${isMe ? 'bg-green-500/10' : 'bg-gold/10'} border border-white/10 space-y-4`}>
                       <div className="flex items-center space-x-3">
                         <div className={`p-3 rounded-xl ${isMe ? 'bg-green-500/20 text-green-400' : 'bg-gold/20 text-gold'}`}>
                            <DollarSign size={24} />
                         </div>
                         <h4 className="text-lg font-black tracking-tight">{isMe ? 'Transfer Sent' : 'Transfer Received'}</h4>
                       </div>
                       <div className="text-4xl font-black tracking-tighter">
                         <span className="text-sm mr-1 opacity-60">$</span>{m.amount?.toFixed(2)}
                       </div>
                       <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                         <ShieldCheck size={12} /> <span>Secured by EKAN Vault</span>
                       </div>
                    </div>
                  )}

                  {m.translatedText && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">
                        <Sparkles size={10} /> <span>AI Translation</span>
                      </div>
                      <p className="italic text-xs text-indigo-200/60 leading-relaxed">{m.translatedText}</p>
                    </div>
                  )}

                  <div className={`flex items-center justify-end space-x-1.5 mt-2 opacity-60`}>
                    <span className="text-[8px] font-black uppercase text-gray-400">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <CheckCheck size={12} className={m.status === 'read' ? 'text-blue-500' : 'text-gray-600'} />
                    )}
                  </div>
                </div>

                {!isMe && m.type === 'text' && !m.translatedText && (
                  <button 
                    onClick={() => translateMsg(m.id, m.text || '')}
                    className="absolute -right-12 top-0 p-2 text-indigo-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Globe size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Tray with Attachment Menu */}
      <div className="p-6 pt-2 z-20">
        {showAttachments && (
          <div className="grid grid-cols-4 gap-4 mb-4 animate-in slide-in-from-bottom-8 duration-500">
             {[
               { icon: ImageIcon, label: 'Image', color: 'bg-indigo-600', type: 'image' },
               { icon: PlayCircle, label: 'Video', color: 'bg-red-600', type: 'video' },
               { icon: FileText, label: 'File', color: 'bg-blue-600', type: 'file' },
               { icon: DollarSign, label: 'Money', color: 'bg-green-600', type: 'money' }
             ].map(item => (
               <button 
                key={item.label}
                onClick={() => {
                  if (item.type === 'money') setShowTransfer(true);
                  else handleSend(item.type as MessageType, { name: `${item.label.toLowerCase()}_demo.dat`, url: '' });
                }}
                className="flex flex-col items-center space-y-2 group"
               >
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
               </button>
             ))}
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-white/5 backdrop-blur-3xl px-4 py-2 rounded-[2rem] border border-white/10 shadow-2xl flex items-center space-x-2 group focus-within:border-gold/30 transition-all">
            <button 
              onClick={() => setShowAttachments(!showAttachments)}
              className={`p-2 transition-all ${showAttachments ? 'text-gold rotate-45' : 'text-gray-500 hover:text-gold'}`}
            >
              <Paperclip size={24} />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message..."
              className="flex-1 bg-transparent py-3 text-sm font-medium focus:outline-none placeholder:text-gray-700"
            />
            <button className="p-2 text-gray-500 hover:text-gold transition-colors"><Camera size={24} /></button>
          </div>
          
          <button 
            onClick={() => handleSend()}
            className={`p-5 rounded-full shadow-xl transition-all active:scale-90 flex items-center justify-center ${
              inputValue.trim() 
              ? `bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black` 
              : 'bg-white/5 text-gray-500 border border-white/10'
            }`}
          >
            {inputValue.trim() ? <Send size={24} /> : <Mic size={24} />}
          </button>
        </div>
      </div>

      {/* Money Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
           <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[3.5rem] p-10 space-y-8 shadow-2xl relative">
              <button onClick={() => setShowTransfer(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
              <div className="text-center space-y-2">
                 <h3 className="text-3xl font-black tracking-tighter">Bridge Transfer</h3>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Send Funds to {currentThread?.partner.name}</p>
              </div>
              
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gold font-black text-2xl">$</span>
                <input 
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-8 pl-14 pr-8 text-4xl font-black text-white focus:outline-none focus:border-gold/30 transition-all"
                />
              </div>

              <div className="flex space-x-3 overflow-x-auto scrollbar-hide py-1">
                 {[10, 20, 50, 100].map(amt => (
                   <button 
                    key={amt}
                    onClick={() => setTransferAmount(amt.toString())}
                    className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-gold/30 transition-all"
                   >
                     +${amt}
                   </button>
                 ))}
              </div>

              <button 
                onClick={() => handleSend('money')}
                className={`w-full py-6 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all`}
              >
                Execute Vault Protocol
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
