
import React, { useState, useEffect } from 'react';
import { EKAN_GRADIENT_CSS, COLORS } from '../constants';
import { ShieldCheck, ArrowRight, MessageCircle, Globe, Mail, Lock, Sparkles, User, Star } from './Icons';

interface AuthProps {
  onComplete: (data: { name: string; email: string; interests: string[] }) => void;
}

const INTEREST_OPTIONS = ['Fintech', 'Afrobeats', 'Agriculture', 'Tech Education', 'Logistics', 'Art', 'Fashion', 'Crypto'];

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'email' | 'otp' | 'setup' | 'success'>('welcome');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [location, setLocation] = useState('Detecting...');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setTimeout(() => setLocation('Monrovia, Liberia'), 1200);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
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
      onComplete({ name: name || email.split('@')[0], email, interests: selectedInterests });
    }, 2000);
  };

  const glassCard = "bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]";

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center p-6 overflow-hidden select-none">
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-red-600/10 blur-[150px] rounded-full opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-green-600/10 blur-[150px] rounded-full opacity-60"></div>
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-gold/10 blur-[120px] rounded-full opacity-40"></div>
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse:60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className={`w-full max-w-md p-10 rounded-[4rem] ${glassCard} relative z-10 transition-all duration-700`}>
        {step === 'welcome' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <div className={`w-20 h-20 rounded-[2.5rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} flex items-center justify-center shadow-[0_15px_40px_rgba(206,17,38,0.3)] hover:scale-110 transition-transform duration-500`}>
                <span className="text-4xl font-black text-black tracking-tighter">E</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-5xl font-black tracking-tighter leading-[0.9] text-white">
                  EKAN<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-white">Social Connect</span>
                </h1>
                <p className="text-sm text-gray-400 font-medium tracking-wide flex items-center pt-2">
                  <Globe size={14} className="mr-2 text-green-500 animate-pulse" /> {location} Node Online
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={() => setStep('email')} className="group w-full py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-gold transition-all duration-300 shadow-xl active:scale-[0.98]">
                <Mail size={18} /> <span>Get Started</span>
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="py-5 bg-white/5 border border-white/10 rounded-[1.8rem] flex flex-col items-center justify-center space-y-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  <MessageCircle size={20} className="text-green-500" /> <span>WhatsApp</span>
                </button>
                <button className="py-5 bg-white/5 border border-white/10 rounded-[1.8rem] flex flex-col items-center justify-center space-y-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  <Globe size={20} className="text-blue-500" /> <span>WeChat</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center">
              <div className="flex items-center space-x-2 bg-white/[0.03] px-4 py-2 rounded-full border border-white/5">
                <ShieldCheck size={14} className="text-gold" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">Security Diagnostics: Optimal</span>
              </div>
            </div>
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <button onClick={() => setStep('welcome')} className="text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]">Go Back</button>
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter text-white">Digital ID</h2>
              <p className="text-sm text-gray-400 font-medium">Link your email to secure your global bridge.</p>
            </div>
            <div className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  type="email" 
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@bridge.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-700 uppercase"
                />
              </div>
              <button 
                onClick={() => setStep('otp')}
                disabled={!email.includes('@')}
                className={`w-full py-5 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-30 transition-all`}
              >
                <span>Authorize Access</span> <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <button onClick={() => setStep('email')} className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em]">Reset Channel</button>
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter text-white">Enter Token</h2>
              <p className="text-sm text-gray-400 font-medium">Verify the 6-digit bridge code sent to your terminal.</p>
            </div>
            <div className="space-y-8">
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
                    className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-center text-2xl font-black text-gold focus:outline-none focus:border-gold/50 transition-all"
                  />
                ))}
              </div>
              <button 
                onClick={verifyOtp}
                disabled={otp.join('').length < 6 || isVerifying}
                className={`w-full py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl disabled:opacity-30 transition-all flex items-center justify-center space-x-3`}
              >
                {isVerifying ? <span>Validating...</span> : <span>Confirm Terminal</span>}
              </button>
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter text-white">Identity Setup</h2>
              <p className="text-sm text-gray-400 font-medium">Craft your appearance on the grid.</p>
            </div>
            <div className="space-y-6">
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display Name"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-700"
                />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-4">Interests (Choose 3+)</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleInterest(opt)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        selectedInterests.includes(opt) 
                        ? 'bg-gold border-gold text-black' 
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
                className={`w-full py-5 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl disabled:opacity-30 transition-all`}
              >
                Launch Manifest
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-700 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative w-28 h-28 rounded-[2.5rem] bg-green-500/10 border-2 border-green-500 flex items-center justify-center text-green-500">
                <ShieldCheck size={56} />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter text-white">Node Initialized</h2>
              <p className="text-sm text-gray-400 font-medium px-4 tracking-wide uppercase">Bridging you to the Pan-African Grid...</p>
            </div>
            <div className="w-full max-w-[200px] h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
               <div className={`h-full bg-gradient-to-r ${EKAN_GRADIENT_CSS} w-full origin-left animate-[loading_2s_ease-in-out]`}></div>
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
