
import React, { useState, useEffect } from 'react';
import { Send, Mic, ShieldCheck, MoreHorizontal, User, Globe, ArrowRight, Sparkles } from './Icons';
import { COLORS, EKAN_GRADIENT_CSS } from '../constants';
import { Message, User as UserType } from '../types';
import { EKANPilotService } from '../services/gemini';

interface ChatProps {
  activePartner?: UserType | null;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', senderId: 'friend', text: 'Hey, are you going to the Tech Summit in Monrovia tomorrow? I heard the networking session is going to be huge.', timestamp: new Date() },
  { id: '2', senderId: 'me', text: 'Yeah, just bought my ticket on EKAN! The escrow protection made it so much safer.', timestamp: new Date() },
  { id: '3', senderId: 'friend', text: 'Salut, pourrais-tu m\'aider à traduire ce document pour notre réunion avec les partenaires chinois?', timestamp: new Date() },
];

const Chat: React.FC<ChatProps> = ({ activePartner }) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTranslating, setIsTranslating] = useState<string | null>(null);

  useEffect(() => {
    if (activePartner) {
      // In a real app, we'd fetch the history for this partner
      // For demo, we just clear and show a welcome
      setMessages([
        { 
          id: 'welcome', 
          senderId: 'friend', 
          text: `Hi! I saw we share interests in ${activePartner.interests?.join(', ')}. Let's connect!`, 
          timestamp: new Date() 
        }
      ]);
    } else {
      setMessages(MOCK_MESSAGES);
    }
  }, [activePartner]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const translateMsg = async (id: string, text: string) => {
    setIsTranslating(id);
    const translated = await EKANPilotService.translateMessage(text);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, translatedText: translated } : m));
    setIsTranslating(null);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Immersive Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-2xl z-20">
        <div className="flex items-center space-x-5">
          <div className="relative group cursor-pointer">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-0.5 shadow-xl`}>
                <div className="w-full h-full bg-black rounded-[0.9rem] flex items-center justify-center font-black text-xl">
                  {activePartner ? activePartner.avatar : 'J'}
                </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0B0B0B] animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter">{activePartner ? activePartner.name : 'Josephine B.'}</h2>
            <div className="flex items-center space-x-2 mt-0.5">
               <ShieldCheck size={12} className="text-green-500" />
               <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">End-to-End Encrypted</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
            <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"><Globe size={20} /></button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {messages.map((m) => {
          const isMe = m.senderId === 'me';
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] space-y-2`}>
                <div className={`p-6 rounded-[2.5rem] shadow-2xl relative ${
                  isMe 
                  ? 'bg-white/10 text-white rounded-tr-none border border-white/20' 
                  : 'bg-white/[0.03] backdrop-blur-xl text-white rounded-tl-none border border-white/10 shadow-inner'
                }`}>
                  <p className="text-[15px] leading-relaxed font-medium tracking-tight">{m.text}</p>
                  {m.translatedText && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">
                        <Sparkles size={10} /> <span>EKAN-Pilot Translation</span>
                      </div>
                      <p className="italic text-sm text-indigo-200/80 leading-relaxed">{m.translatedText}</p>
                    </div>
                  )}
                </div>
                {!isMe && !m.translatedText && (
                  <div className="flex justify-start px-2">
                    <button 
                        onClick={() => translateMsg(m.id, m.text)}
                        disabled={isTranslating === m.id}
                        className="group flex items-center space-x-2 text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] hover:text-white transition-all py-1"
                    >
                        {isTranslating === m.id ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <>
                                <Globe size={12} className="group-hover:rotate-12 transition-transform" />
                                <span>Auto-Translate</span>
                            </>
                        )}
                    </button>
                  </div>
                )}
                <div className={`text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 px-4 ${isMe ? 'text-right' : 'text-left'}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Tray */}
      <div className="p-6 pt-2 z-20">
        <div className="bg-white/5 backdrop-blur-3xl p-3 rounded-[3rem] border border-white/10 shadow-2xl flex items-center space-x-3 group focus-within:border-gold/30 transition-all duration-500">
          <button className="p-5 text-gray-500 hover:text-gold transition-colors hover:scale-110"><Mic size={24} /></button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Secure message via E2EE..."
            className="flex-1 bg-transparent px-2 py-4 text-base font-medium focus:outline-none placeholder:text-gray-800 tracking-tight"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`p-5 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-[2.2rem] shadow-xl text-black hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all duration-300`}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
