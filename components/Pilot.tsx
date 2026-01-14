
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Mic, MoreHorizontal, ShieldCheck, Globe, Search } from './Icons';
import { COLORS, EKAN_GRADIENT_CSS } from '../constants';
import { EKANPilotService } from '../services/gemini';

const Pilot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Systems online. I'm EKAN-Pilot, your Digital Concierge. I've analyzed your local node in Monrovia. I can help bridge the language gap, summarize the global feed, or secure your gathering passes. What can I help you bridge today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    
    setIsTyping(true);
    const aiResponse = await EKANPilotService.getResponse(textToSend);
    setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsTyping(false);
  };

  const actions = [
    { label: "Morning Feed Summary", icon: Sparkles, color: "text-gold" },
    { label: "Verify Ticket Safety", icon: ShieldCheck, color: "text-green-500" },
    { label: "Translate to Mandarin", icon: Globe, color: "text-blue-500" },
    { label: "Find Local Experts", icon: Search, color: "text-red-500" }
  ];

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#050505]/40">
      {/* Immersive background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="p-8 border-b border-white/10 bg-white/5 backdrop-blur-3xl z-10 flex items-center justify-between">
        <div className="flex items-center space-x-5">
            <div className={`w-16 h-16 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(206,17,38,0.2)] group cursor-pointer`}>
                <Sparkles size={32} className="text-black group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tighter">EKAN-Pilot</h1>
                <div className="flex items-center space-x-3 mt-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/80">Quantum Intelligence Agent</div>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    </div>
                </div>
            </div>
        </div>
        <button className="p-4 bg-white/5 rounded-2xl text-gray-400 hover:text-white border border-white/10 transition-all"><MoreHorizontal size={24} /></button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 z-10 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-500`}>
            <div className={`max-w-[85%] p-8 rounded-[3rem] shadow-2xl relative ${
              m.role === 'user' 
              ? 'bg-white/10 text-white rounded-tr-none border border-white/20' 
              : 'bg-indigo-900/30 text-white rounded-tl-none border border-indigo-500/20 backdrop-blur-3xl'
            }`}>
              <p className="text-[17px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{m.text}</p>
              {m.role === 'assistant' && (
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gold">E</div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">EKAN CORE VERIFIED</span>
                      </div>
                      <ShieldCheck size={16} className="text-green-500 opacity-60" />
                  </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
             <div className="bg-white/5 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] border border-white/10 flex items-center space-x-4 shadow-xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-duration:1s]"></div>
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Pilot is processing nodes...</span>
             </div>
          </div>
        )}
      </div>

      {/* Control Tray */}
      <div className="p-8 pt-0 z-10 space-y-6">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide py-3">
            {actions.map(action => (
                <button 
                    key={action.label}
                    onClick={() => handleSend(action.label)}
                    className="flex items-center space-x-3 px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 hover:border-gold/30 transition-all whitespace-nowrap shadow-2xl active:scale-95"
                >
                    <action.icon size={18} className={action.color} />
                    <span>{action.label}</span>
                </button>
            ))}
        </div>

        <div className="bg-white/5 backdrop-blur-3xl p-3 rounded-[3.5rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex items-center space-x-3 group focus-within:border-gold/30 transition-all duration-500">
          <button className="p-6 text-gray-500 hover:text-gold transition-colors hover:scale-110"><Mic size={30} /></button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Issue a global command..."
            className="flex-1 bg-transparent px-3 py-4 text-lg font-medium focus:outline-none placeholder:text-gray-700 tracking-tight"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`p-6 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-[2.8rem] shadow-[0_10px_30px_rgba(206,17,38,0.3)] text-black hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all duration-300`}
          >
            <Send size={30} className="fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pilot;
