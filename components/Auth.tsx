
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
  MessageCircle,
  Smartphone,
  Languages,
  Phone
} from './Icons';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailLink, isSignInWithEmailLink, sendSignInLinkToEmail } from 'firebase/auth';

interface AuthProps {
  onComplete: (data: { 
    name: string; 
    email: string; 
    interests: string[]; 
    location: string;
    nativeLanguage: string;
    learningLanguages: string[];
  }) => void;
}

const INTEREST_OPTIONS = ['Fintech', 'Afrobeats', 'Agriculture', 'Tech Ed', 'Logistics', 'Art', 'Fashion', 'Trade'];
const LANGUAGE_OPTIONS = ['English', 'Mandarin', 'French', 'Spanish', 'Arabic', 'Portuguese', 'Swahili', 'Yoruba', 'Igbo', 'Twi', 'Wolof'];

const getLocInfo = (countryCode: string) => {
  const data: Record<string, { country: string; continent: string; lang: string; greeting: string }> = {
    'LR': { country: 'Liberia', continent: 'Africa', lang: 'English', greeting: 'Welcome' },
    'GH': { country: 'Ghana', continent: 'Africa', lang: 'English', greeting: 'Akwaaba' },
    'NG': { country: 'Nigeria', continent: 'Africa', lang: 'English', greeting: 'Welcome' },
    'CN': { country: 'China', continent: 'Asia', lang: 'Mandarin', greeting: '欢迎' },
    'US': { country: 'USA', continent: 'North America', lang: 'English', greeting: 'Welcome' },
    'FR': { country: 'France', continent: 'Europe', lang: 'French', greeting: 'Bienvenue' },
    'GB': { country: 'UK', continent: 'Europe', lang: 'English', greeting: 'Welcome' },
  };
  return data[countryCode] || { country: 'your country', continent: 'your continent', lang: 'English', greeting: 'Welcome' };
};

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'email' | 'phone' | 'wechat' | 'setup' | 'success'>('welcome');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [learningLanguages, setLearningLanguages] = useState<string[]>([]);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [locInfo, setLocInfo] = useState({ country: '...', continent: '...', lang: 'Detecting...', greeting: 'Hello' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectNode = async () => {
      // In a real app, we'd use a geolocation API
      setLocInfo(getLocInfo('GB')); 
    };
    detectNode();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setName(result.user.displayName || '');
        setEmail(result.user.email || '');
        setStep('setup');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }
      if (emailForSignIn) {
        setIsVerifying(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            if (result.user) {
              setEmail(result.user.email || '');
              setStep('setup');
            }
          })
          .catch((err) => {
            console.error("Email Link Error:", err);
            setError("The authentication link is invalid or has expired.");
          })
          .finally(() => setIsVerifying(false));
      }
    }
  }, []);

  const handleEmailLogin = async () => {
    if (!email.includes('@')) return;
    setIsVerifying(true);
    try {
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setError(null);
      setStep('success'); // Show success message that link was sent
    } catch (err: any) {
      console.error("Send Link Error:", err);
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneLogin = async () => {
    setStep('setup');
  };

  const handleWeChatLogin = async () => {
    setStep('setup');
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleLearningLanguage = (lang: string) => {
    setLearningLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const finalize = () => {
    setStep('success');
    setTimeout(() => {
      onComplete({ 
        name: name || email.split('@')[0] || phoneNumber, 
        email, 
        interests: selectedInterests,
        location: `${locInfo.country}, ${locInfo.continent}`,
        nativeLanguage,
        learningLanguages
      });
    }, 2500);
  };

  const glassCard = "bg-white/[0.03] backdrop-blur-[120px] border border-white/10 shadow-[0_50px_150px_rgba(0,0,0,1)]";

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center p-8 overflow-hidden select-none font-['Inter']">
      <div className="absolute top-[-20%] left-[-10%] w-[90%] h-[90%] bg-red-600/10 blur-[200px] rounded-full opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-600/10 blur-[200px] rounded-full opacity-40"></div>
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.01)_2px,transparent_2px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse:70%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className={`w-full max-w-xl p-16 rounded-[5rem] ${glassCard} relative z-10 transition-all duration-1000 transform overflow-y-auto max-h-[90vh] scrollbar-hide`}>
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {step === 'welcome' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className={`w-20 h-20 rounded-[2.2rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} flex items-center justify-center shadow-[0_20px_60px_rgba(206,17,38,0.4)]`}>
                  <span className="text-4xl font-black text-black">Y</span>
                </div>
                <div className="flex items-center space-x-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl">
                  <Globe size={18} className="text-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">{locInfo.lang} • {locInfo.country} Node</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl font-black tracking-tighter leading-[0.95] text-white">
                  Welcome to the Grid,<br/>
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${EKAN_GRADIENT_CSS}`}>
                    connecting {locInfo.country}, {locInfo.continent} and the world.
                  </span>
                </h1>
                <p className="text-xl text-gray-400 font-medium tracking-tight leading-relaxed max-w-sm">
                  The high-resonance protocol for cultural discovery and secure global asset bridge.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5">
                <button 
                  onClick={handleGoogleLogin} 
                  className="w-full py-7 bg-gradient-to-r from-[#FCD116] to-[#D4AF37] text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center space-x-4 hover:brightness-110 transition-all shadow-3xl active:scale-[0.98]"
                >
                  <Sparkles size={20} strokeWidth={3} /> 
                  <span>Manifest Identity</span>
                </button>
              </div>

              <div className="relative py-8 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <span className="relative bg-[#050505] px-8 text-[10px] font-black uppercase tracking-[0.8em] text-gray-800">Unified Bridge</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleGoogleLogin} className="py-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center space-x-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <Mail size={18} className="text-red-500 group-hover:scale-125 transition-transform" />
                  <span>Google</span>
                </button>
                <button onClick={() => setStep('email')} className="py-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center space-x-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <Mail size={18} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                  <span>Email</span>
                </button>
                <button onClick={() => setStep('phone')} className="py-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center space-x-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <Smartphone size={18} className="text-blue-500 group-hover:scale-125 transition-transform" />
                  <span>Phone</span>
                </button>
                <button onClick={handleWeChatLogin} className="py-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center space-x-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <MessageCircle size={18} className="text-green-500 group-hover:scale-125 transition-transform" />
                  <span>WeChat</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <div className="flex items-center space-x-4 bg-white/[0.01] px-8 py-4 rounded-full border border-white/5 shadow-inner">
                <ShieldCheck size={16} className="text-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-700">Encrypted Grid Handshake Active</span>
              </div>
            </div>
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-700">
            <button onClick={() => setStep('welcome')} className="text-gray-600 hover:text-white transition-colors text-[11px] font-black uppercase tracking-[0.4em] flex items-center space-x-3">
              <ArrowRight size={16} className="rotate-180" /> <span>Back to Nexus</span>
            </button>
            <div className="space-y-6">
              <h2 className="text-5xl font-black tracking-tighter text-white">Identify Node</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">Provide your primary node identifier to synchronize with the Pan-African Grid.</p>
            </div>
            <div className="space-y-8">
              <div className="relative group">
                <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={24} />
                <input 
                  type="email" 
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="IDENTITY@GRID.COM"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-10 text-base font-black tracking-widest focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-900 uppercase shadow-inner"
                />
              </div>
              <button 
                onClick={handleEmailLogin}
                disabled={!email.includes('@')}
                className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.8rem] font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center space-x-4 shadow-[0_25px_60px_rgba(206,17,38,0.3)] disabled:opacity-20 transition-all active:scale-95`}
              >
                <span>Authorize Transmission</span> <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'phone' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-700">
            <button onClick={() => setStep('welcome')} className="text-gray-600 hover:text-white transition-colors text-[11px] font-black uppercase tracking-[0.4em] flex items-center space-x-3">
              <ArrowRight size={16} className="rotate-180" /> <span>Back to Nexus</span>
            </button>
            <div className="space-y-6">
              <h2 className="text-5xl font-black tracking-tighter text-white">Phone Sync</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">Connect via WhatsApp, Line, or SMS protocol.</p>
            </div>
            <div className="space-y-8">
              <div className="relative group">
                <Phone className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={24} />
                <input 
                  type="tel" 
                  autoFocus
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+231 00 000 000"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-10 text-base font-black tracking-widest focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-900 uppercase shadow-inner"
                />
              </div>
              <button 
                onClick={handlePhoneLogin}
                disabled={phoneNumber.length < 8}
                className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.8rem] font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center space-x-4 shadow-[0_25px_60px_rgba(206,17,38,0.3)] disabled:opacity-20 transition-all active:scale-95`}
              >
                <span>Authorize Transmission</span> <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-1000 max-h-[80vh] overflow-y-auto pr-4 scrollbar-hide">
            <div className="space-y-6">
              <h2 className="text-5xl font-black tracking-tighter text-white">Core Manifest</h2>
              <p className="text-lg text-gray-500 font-medium">Define your manifestation parameters for the global discovery grid.</p>
            </div>
            <div className="space-y-10">
              <div className="relative group">
                <User className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="GRID IDENTIFIER"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-10 text-base font-black tracking-widest focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-900 shadow-inner"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 px-6">
                  <Languages size={18} className="text-gold" />
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600">Native Frequency</p>
                </div>
                <select 
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] py-4 px-8 text-[11px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
                >
                  {LANGUAGE_OPTIONS.map(lang => (
                    <option key={lang} value={lang} className="bg-[#111]">{lang}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 px-6">
                  <Sparkles size={18} className="text-gold" />
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600">Resonance Targets (Learning)</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleLearningLanguage(lang)}
                      className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest border transition-all duration-500 ${
                        learningLanguages.includes(lang) 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_15px_40px_rgba(37,99,235,0.3)]' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 px-6">
                  <Sparkles size={18} className="text-gold" />
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600">Core Interests</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {INTEREST_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleInterest(opt)}
                      className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest border transition-all duration-500 ${
                        selectedInterests.includes(opt) 
                        ? 'bg-gold border-gold text-black shadow-[0_15px_40px_rgba(252,209,22,0.3)]' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={finalize}
                disabled={!name || selectedInterests.length < 2 || learningLanguages.length < 1}
                className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[3rem] font-black text-xs uppercase tracking-[0.5em] shadow-[0_30px_70px_rgba(206,17,38,0.4)] disabled:opacity-20 transition-all flex items-center justify-center space-x-4 active:scale-95`}
              >
                <span>Execute Final Manifest</span> <Fingerprint size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-20 flex flex-col items-center space-y-16 animate-in zoom-in-95 duration-1000 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/40 blur-[80px] rounded-full animate-pulse"></div>
              <div className="relative w-48 h-48 rounded-[5.5rem] bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={100} strokeWidth={1.2} />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-6xl font-black tracking-tighter text-white">
                {email && !name ? 'Link Sent.' : 'Manifested.'}
              </h2>
              <p className="text-lg text-gray-500 font-black uppercase tracking-[0.6em] leading-relaxed">
                {email && !name 
                  ? `Check your node transmission at ${email}` 
                  : `Welcome to the Pan-African Grid, ${name}.`}
              </p>
            </div>
            {!name && (
              <button 
                onClick={() => setStep('welcome')}
                className="px-12 py-5 bg-white/5 border border-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-all"
              >
                Back to Nexus
              </button>
            )}
            {name && (
              <div className="w-full max-w-sm h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                 <div className={`h-full bg-gradient-to-r ${EKAN_GRADIENT_CSS} w-full origin-left animate-[loading_3s_ease-in-out] rounded-full shadow-[0_0_20px_rgba(252,209,22,0.5)]`}></div>
              </div>
            )}
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
