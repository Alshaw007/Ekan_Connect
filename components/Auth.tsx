
import React, { useState, useEffect } from 'react';
import { EKAN_GRADIENT_CSS } from '../constants';
import { 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  Mail, 
  Sparkles, 
  User, 
  CheckCircle2, 
  Fingerprint,
  MessageSquare,
  Smartphone
} from './Icons';

interface AuthProps {
  onComplete: (data: { name: string; email: string; interests: string[]; location: string }) => void;
}

const INTEREST_OPTIONS = ['Fintech', 'Afrobeats', 'Agriculture', 'Tech Ed', 'Logistics', 'Art', 'Fashion', 'Trade'];

const getLocInfo = (countryCode: string) => {
  const data: Record<string, { country: string; continent: string; lang: string; greeting: string }> = {
    'LR': { country: 'Liberia', continent: 'Africa', lang: 'English', greeting: 'Welcome' },
    'GH': { country: 'Ghana', continent: 'Africa', lang: 'English', greeting: 'Akwaaba' },
    'NG': { country: 'Nigeria', continent: 'Africa', lang: 'English', greeting: 'Welcome' },
    'CN': { country: 'China', continent: 'Asia', lang: 'Mandarin', greeting: '欢迎' },
    'US': { country: 'USA', continent: 'North America', lang: 'English', greeting: 'Welcome' },
    'FR': { country: 'France', continent: 'Europe', lang: 'French', greeting: 'Bienvenue' },
  };
  return data[countryCode] || { country: 'your country', continent: 'your continent', lang: 'English', greeting: 'Welcome' };
};

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'email' | 'otp' | 'setup' | 'success'>('welcome');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [locInfo, setLocInfo] = useState({ country: '...', continent: '...', lang: 'Detecting...', greeting: 'Hello' });
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Production Simulation: Detecting geographic node
    setTimeout(() => {
      setLocInfo(getLocInfo('LR')); 
    }, 1200);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const verifyOtp = () => {
    if (otp.join('').length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setStep('setup');
      }, 1500);
    }
  };

  const finalize = () => {
    setStep('success');
    setTimeout(() => {
      onComplete({ 
        name: name || email.split('@')[0], 
        email, 
        interests: selectedInterests,
        location: `${locInfo.country}, ${locInfo.continent}`
      });
    }, 2500);
  };

  const glassCard = "bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]";

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center p-6 overflow-hidden select-none font-['Inter']">
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-red-600/10 blur-[180px] rounded-full opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-green-600/10 blur-[180px] rounded-full opacity-60"></div>
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse:70%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className={`w-full max-w-lg p-12 rounded-[4.5rem] ${glassCard} relative z-10 transition-all duration-700`}>
        {step === 'welcome' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} flex items-center justify-center shadow-2xl`}>
                  <span className="text-3xl font-black text-black">E</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Globe size={14} className="text-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{locInfo.lang} • {locInfo.country} Node</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl font-black tracking-tighter leading-[1.0] text-white">
                  {locInfo.greeting} to EKAN Social,<br/>
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${EKAN_GRADIENT_CSS}`}>
                    Connecting {locInfo.country}, {locInfo.continent}, and the World.
                  </span>
                </h1>
                <p className="text-lg text-gray-400 font-medium tracking-tight leading-relaxed max-w-sm">
                  The first high-resonance grid for cultural discovery and secure global exchange.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setStep('email')} 
                  className="w-full py-5.5 bg-gradient-to-r from-[#FCD116] to-[#D4AF37] text-black rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center space-x-3 hover:brightness-110 transition-all shadow-2xl active:scale-[0.98]"
                >
                  <Sparkles size={18} strokeWidth={2.5} /> 
                  <span>Create Account</span>
                </button>
                <button 
                  onClick={() => setStep('email')} 
                  className="w-full py-5.5 bg-white/5 border border-white/10 text-white rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Sign In
                </button>
              </div>

              <div className="relative py-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <span className="relative bg-[#050505] px-6 text-[8px] font-black uppercase tracking-[0.6em] text-gray-700">Unified Bridge</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="py-4 bg-white/5 border border-white/10 rounded-[1.8rem] flex items-center justify-center space-x-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <Mail size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
                  <span>Gmail</span>
                </button>
                <button className="py-4 bg-white/5 border border-white/10 rounded-[1.8rem] flex items-center justify-center space-x-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <Globe size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>Meta</span>
                </button>
                <button className="py-4 bg-white/5 border border-white/10 rounded-[1.8rem] flex items-center justify-center space-x-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <MessageSquare size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </button>
                <button className="py-4 bg-white/5 border border-white/10 rounded-[1.8rem] flex items-center justify-center space-x-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <Globe size={16} className="text-gold group-hover:scale-110 transition-transform" />
                  <span>WeChat</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <div className="flex items-center space-x-3 bg-white/[0.01] px-6 py-3 rounded-full border border-white/5">
                <ShieldCheck size={14} className="text-gold" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-600">Encrypted Grid Protocol Engaged</span>
              </div>
            </div>
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <button onClick={() => setStep('welcome')} className="text-gray-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] flex items-center space-x-2">
              <ArrowRight size={14} className="rotate-180" /> <span>Back to Nexus</span>
            </button>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter text-white">Identify Node</h2>
              <p className="text-sm text-gray-500 font-medium">Link your primary email to synchronize with the global grid.</p>
            </div>
            <div className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  type="email" 
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="IDENTITY@GRID.COM"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-black tracking-widest focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-800 uppercase"
                />
              </div>
              <button 
                onClick={() => setStep('otp')}
                disabled={!email.includes('@')}
                className={`w-full py-6 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-20 transition-all`}
              >
                <span>Initialize Handshake</span> <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <button onClick={() => setStep('email')} className="text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-[0.3em]">Recalibrate Email</button>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter text-white">Validation</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">A 6-digit sync token has been transmitted to your secure email terminal.</p>
            </div>
            <div className="space-y-10">
              <div className="flex justify-between gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-full h-20 bg-white/[0.03] border border-white/10 rounded-[2rem] text-center text-3xl font-black text-gold focus:outline-none focus:border-gold/50 transition-all"
                  />
                ))}
              </div>
              <button 
                onClick={verifyOtp}
                disabled={otp.join('').length < 6 || isVerifying}
                className={`w-full py-6 bg-white text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl disabled:opacity-30 transition-all flex items-center justify-center space-x-3`}
              >
                {isVerifying ? <span>Bridging...</span> : <span>Confirm Link</span>}
              </button>
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 max-h-[75vh] overflow-y-auto pr-3 scrollbar-hide">
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter text-white">Manifest Core</h2>
              <p className="text-sm text-gray-500 font-medium">How should the global grid perceive your manifestation?</p>
            </div>
            <div className="space-y-8">
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="GRID IDENTIFIER"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[2.2rem] py-6 pl-16 pr-8 text-sm font-black tracking-widest focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-800"
                />
              </div>

              <div className="space-y-5">
                <div className="flex items-center space-x-3 px-4">
                  <Sparkles size={16} className="text-gold" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Core Resonators (Pick 3)</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {INTEREST_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleInterest(opt)}
                      className={`px-6 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                        selectedInterests.includes(opt) 
                        ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={finalize}
                disabled={!name || selectedInterests.length < 3}
                className={`w-full py-6 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl disabled:opacity-20 transition-all flex items-center justify-center space-x-3`}
              >
                <span>Manifest Identity</span> <Fingerprint size={22} />
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-16 flex flex-col items-center space-y-12 animate-in zoom-in-95 duration-1000 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative w-36 h-36 rounded-[4rem] bg-green-500/10 border-2 border-green-500 flex items-center justify-center text-green-500 shadow-2xl">
                <CheckCircle2 size={72} strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-black tracking-tighter text-white">Manifested.</h2>
              <p className="text-sm text-gray-500 font-black uppercase tracking-[0.5em] leading-relaxed">Welcome to the Pan-African Grid, {name}.</p>
            </div>
            <div className="w-full max-w-[280px] h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-2xl">
               <div className={`h-full bg-gradient-to-r ${EKAN_GRADIENT_CSS} w-full origin-left animate-[loading_3s_ease-in-out] rounded-full`}></div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default Auth;
