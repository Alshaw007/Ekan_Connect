
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Mic, MoreHorizontal, ShieldCheck, Globe, Search, ArrowRight, Languages, BookOpen } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { EKANPilotService } from '../services/gemini';
import { useFirebase } from './FirebaseProvider';

const Pilot: React.FC = () => {
  const { profile } = useFirebase();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile && messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          text: `EKAN-Pilot active. I've synchronized with your node in ${profile.location}. 
          
I see you're learning ${profile.learningLanguages?.join(', ')}. I can provide real-time translations, suggest learning paths based on your interests in ${profile.interests?.join(', ')}, or verify marketplace manifests. 

What shall we bridge today?` 
        }
      ]);
    }
  }, [profile]);

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
    try {
      const aiResponse = await EKANPilotService.getResponse(textToSend, profile);
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "I encountered a resonance interference. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real app, we'd use the Web Speech API here
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        handleSend("Translate 'How are you' to Mandarin");
      }, 2000);
    }
  };

  const actionableCommands = [
    { label: "Translate Chat", icon: Globe, color: "text-blue-500" },
    { label: "Learning Path", icon: BookOpen, color: "text-emerald-500" },
    { label: "Market Safety", icon: ShieldCheck, color: "text-green-500" },
    { label: "Find Opps", icon: Search, color: "text-red-500" }
  ];

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#050505]/60 pb-28">
      {/* Grid Pulse Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
      </div>

      {/* Header OS-Style */}
      <div className="p-10 border-b border-white/10 bg-white/5 backdrop-blur-3xl z-10 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-6">
            <div className={`w-16 h-16 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-[2rem] flex items-center justify-center shadow-3xl group cursor-pointer active:scale-95 transition-all`}>
                <Sparkles size={32} className="text-black group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-white">EKAN-Pilot</h1>
                <div className="flex items-center space-x-3 mt-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gold/80">Quantum Concierge Agent</span>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse [animation-delay:0.3s]"></div>
                    </div>
                </div>
            </div>
        </div>
        <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"><MoreHorizontal size={24} /></button>
      </div>

      {/* Transmission History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-12 z-10 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-700`}>
            <div className={`max-w-[85%] p-8 rounded-[3.5rem] shadow-3xl relative border overflow-hidden ${
              m.role === 'user' 
              ? 'bg-white/10 text-white rounded-tr-none border-white/20' 
              : 'bg-indigo-900/20 text-white rounded-tl-none border-indigo-500/20 backdrop-blur-3xl'
            }`}>
              {m.role === 'assistant' && <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={64} /></div>}
              <p className="text-[17px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap relative z-10">{m.text}</p>
              {m.role === 'assistant' && (
                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-gold">E</div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300">ACTUAL & FACTUAL VERIFIED</span>
                      </div>
                      <ShieldCheck size={20} className="text-green-500 opacity-50" />
                  </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-500">
             <div className="bg-white/5 backdrop-blur-2xl px-12 py-7 rounded-[3rem] border border-white/10 flex items-center space-x-5 shadow-2xl">
                <div className="flex space-x-2.5">
                  <div className="w-2.5 h-2.5 bg-gold rounded-full animate-bounce [animation-duration:0.8s]"></div>
                  <div className="w-2.5 h-2.5 bg-gold rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                  <div className="w-2.5 h-2.5 bg-gold rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-500">Pilot is bridging nodes...</span>
             </div>
          </div>
        )}
      </div>

      {/* Control Module */}
      <div className="p-10 pt-0 z-10 space-y-8">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-4 px-2">
            {actionableCommands.map(cmd => (
                <button 
                    key={cmd.label}
                    onClick={() => handleSend(cmd.label)}
                    className="flex items-center space-x-4 px-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white hover:bg-white/10 hover:border-gold/30 transition-all whitespace-nowrap shadow-xl active:scale-95"
                >
                    <cmd.icon size={20} className={cmd.color} />
                    <span>{cmd.label}</span>
                </button>
            ))}
        </div>

        <div className="bg-white/5 backdrop-blur-[50px] p-4 rounded-[4rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.7)] flex items-center space-x-4 group focus-within:border-gold/30 transition-all duration-700">
          <button 
            onClick={toggleListening}
            className={`p-7 rounded-full transition-all hover:scale-110 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-gold'}`}
          >
            <Mic size={32} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to your Digital Concierge..."
            className="flex-1 bg-transparent px-4 py-5 text-xl font-medium focus:outline-none placeholder:text-gray-800 tracking-tight text-white"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`p-7 bg-gradient-to-br ${EKAN_GRADIENT_CSS} rounded-[3rem] shadow-3xl text-black hover:scale-105 active:scale-95 disabled:opacity-20 disabled:grayscale transition-all duration-500`}
          >
            <Send size={32} className="fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pilot;
