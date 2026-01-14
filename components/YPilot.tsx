
import React, { useState, useRef, useEffect } from 'react';
// Added Globe to the imported icons
import { Sparkles, Send, Mic, MoreHorizontal, ChevronRight, ShieldCheck, Globe } from './Icons';
// Fixed: Changed Y_GRADIENT_CSS to EKAN_GRADIENT_CSS
import { COLORS, EKAN_GRADIENT_CSS } from '../constants';
// Fixed: Changed YPilotService to EKANPilotService
import { EKANPilotService } from '../services/gemini';

const YPilot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hello! I'm Y-Pilot, your Digital Concierge. Connecting you to Monrovia, Africa, and the World. I can summarize 'The Feed', draft messages, or verify marketplace safety. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    
    setIsTyping(true);
    // Fixed: Changed YPilotService to EKANPilotService
    const aiResponse = await EKANPilotService.getResponse(textToSend);
    setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 via-gold-600/5 to-green-600/5 pointer-events-none"></div>

      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#0B0B0B]/70 backdrop-blur-xl z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                {/* Fixed: Changed Y_GRADIENT_CSS to EKAN_GRADIENT_CSS */}
                <div className={`p-3 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-2xl shadow-xl shadow-gold/20`}>
                    <Sparkles size={24} className="text-black" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Y-Pilot</h1>
                    <div className="flex items-center space-x-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gold opacity-80">Digital Concierge</div>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
            <button className="p-2 text-gray-500 hover:text-white transition-colors"><MoreHorizontal /></button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 z-10 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-2xl ${
              m.role === 'user' 
              ? 'bg-[#1A1A1A] text-white rounded-tr-none border border-white/5' 
              : 'bg-indigo-900/30 text-white rounded-tl-none border border-indigo-500/20 backdrop-blur-md'
            }`}>
              <p className="text-[15px] leading-relaxed font-medium">{m.text}</p>
              {m.role === 'assistant' && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[9px] font-black uppercase tracking-widest text-indigo-300 flex items-center">
                          <ShieldCheck size={12} className="mr-1" /> Culturally Verified
                      </div>
                  </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/10 flex items-center space-x-2">
                <div className="w-1 h-1 bg-gold rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Pilot is thinking</span>
             </div>
          </div>
        )}
      </div>

      {/* Persistent Interaction Tray */}
      <div className="p-6 pt-0 z-10 space-y-4">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide py-1">
            {[
                { label: "Morning Update", icon: Sparkles },
                { label: "Marketplace Safety", icon: ShieldCheck },
                { label: "Translate Chat", icon: Globe }
            ].map(action => (
                <button 
                    key={action.label}
                    onClick={() => handleSend(action.label)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
                >
                    <action.icon size={14} />
                    <span>{action.label}</span>
                </button>
            ))}
        </div>

        <div className="bg-[#111] p-2 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center space-x-2 group focus-within:border-gold/30 transition-all">
          <button className="p-4 text-gray-500 hover:text-gold transition-colors"><Mic size={24} /></button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to your Y-Pilot..."
            className="flex-1 bg-transparent px-2 py-3 text-sm font-medium focus:outline-none placeholder:text-gray-700"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`p-4 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-[1.8rem] shadow-xl shadow-gold/10 text-black hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all`}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YPilot;
