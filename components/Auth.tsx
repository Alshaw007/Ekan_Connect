
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

const INTEREST_OPTIONS = [
  'Fintech', 'Afrobeats', 'Agriculture', 'Tech Ed', 'Logistics', 'Art', 'Fashion', 'Trade',
  'Blockchain', 'AI', 'Renewable Energy', 'Health Tech', 'E-commerce', 'Mining', 'Tourism',
  'Gaming', 'Sports', 'Cooking', 'Photography', 'Writing', 'Music Production', 'Dance',
  'Philosophy', 'Politics', 'History', 'Science', 'Astronomy', 'Gardening', 'DIY', 'Fitness',
  'Yoga', 'Meditation', 'Travel', 'Languages', 'Coding', 'Robotics', 'Design', 'Architecture'
];

const LANGUAGE_OPTIONS = [
  'English', 'Mandarin', 'French', 'Spanish', 'Arabic', 'Portuguese', 'Swahili', 'Yoruba', 
  'Igbo', 'Twi', 'Wolof', 'Hausa', 'Zulu', 'Amharic', 'Oromo', 'Somali', 'Afrikaans',
  'Hindi', 'Bengali', 'Russian', 'Japanese', 'German', 'Korean', 'Italian', 'Turkish',
  'Vietnamese', 'Thai', 'Dutch', 'Greek', 'Hebrew', 'Indonesian', 'Malay', 'Persian'
];

const CONTINENT_DATA: Record<string, { countries: string[]; languages: string[] }> = {
  'Africa': {
    countries: [
      'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
    ],
    languages: ['English', 'French', 'Arabic', 'Portuguese', 'Swahili', 'Yoruba', 'Igbo', 'Hausa', 'Zulu', 'Amharic', 'Oromo', 'Somali', 'Afrikaans', 'Wolof', 'Twi', 'Lingala', 'Kinyarwanda', 'Shona', 'Ndebele']
  },
  'Asia': {
    countries: [
      'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'UAE', 'Uzbekistan', 'Vietnam', 'Yemen'
    ],
    languages: ['Mandarin', 'Hindi', 'Japanese', 'Korean', 'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Bengali', 'Arabic', 'Persian', 'Turkish', 'Hebrew', 'Urdu', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi']
  },
  'Europe': {
    countries: [
      'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'UK', 'Vatican City'
    ],
    languages: ['English', 'French', 'German', 'Italian', 'Spanish', 'Dutch', 'Swedish', 'Polish', 'Russian', 'Greek', 'Portuguese', 'Danish', 'Finnish', 'Norwegian', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Serbian', 'Croatian', 'Slovak', 'Slovenian']
  },
  'North America': {
    countries: [
      'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'USA'
    ],
    languages: ['English', 'French', 'Spanish', 'Haitian Creole']
  },
  'South America': {
    countries: [
      'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'
    ],
    languages: ['Portuguese', 'Spanish', 'Quechua', 'Aymara', 'Guarani']
  },
  'Oceania': {
    countries: [
      'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
    ],
    languages: ['English', 'Maori', 'Fijian', 'Tok Pisin', 'Hiri Motu']
  },
  'Antarctica': {
    countries: ['Research Station'],
    languages: ['English', 'Various']
  }
};

const getLocInfo = (countryCode: string) => {
  const data: Record<string, { country: string; continent: string; lang: string; greeting: string }> = {
    'LR': { country: 'Liberia', continent: 'Africa', lang: 'English', greeting: 'Welcome' },
    'GH': { country: 'Ghana', continent: 'Africa', lang: 'English', greeting: 'Akwaaba' },
    'NG': { country: 'Nigeria', continent: 'Africa', lang: 'English', greeting: 'Welcome' },
    'CN': { country: 'China', continent: 'Asia', lang: 'Mandarin', greeting: '欢迎' },
    'US': { country: 'USA', continent: 'North America', lang: 'English', greeting: 'Welcome' },
    'FR': { country: 'France', continent: 'Europe', lang: 'French', greeting: 'Bienvenue' },
    'GB': { country: 'UK', continent: 'Europe', lang: 'English', greeting: 'Welcome' },
    'ZA': { country: 'South Africa', continent: 'Africa', lang: 'English', greeting: 'Sawubona' },
    'KE': { country: 'Kenya', continent: 'Africa', lang: 'Swahili', greeting: 'Jambo' },
    'EG': { country: 'Egypt', continent: 'Africa', lang: 'Arabic', greeting: 'Ahlan' },
    'BR': { country: 'Brazil', continent: 'South America', lang: 'Portuguese', greeting: 'Bem-vindo' },
    'IN': { country: 'India', continent: 'Asia', lang: 'Hindi', greeting: 'Namaste' },
    'AU': { country: 'Australia', continent: 'Oceania', lang: 'English', greeting: 'G\'day' },
  };
  return data[countryCode] || { country: 'your country', continent: 'your continent', lang: 'English', greeting: 'Welcome' };
};

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'email' | 'phone' | 'otp' | 'setup' | 'success'>('welcome');
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
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            // Using a free reverse geocoding API or just simulating based on coords for now
            // In a real production app, you'd use a service like ipstack or google maps geocoding
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
            const data = await res.json();
            const countryCode = data.countryCode;
            setLocInfo(getLocInfo(countryCode));
          } catch (e) {
            setLocInfo(getLocInfo('GB')); // Fallback
          }
        }, () => {
          setLocInfo(getLocInfo('GB')); // Fallback if denied
        });
      } else {
        setLocInfo(getLocInfo('GB')); 
      }
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
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email Link authentication is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method > Email/Password > Email link (passwordless sign-in).");
      } else {
        setError(err.message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (phoneNumber.length < 8) return;
    setIsVerifying(true);
    try {
      // In a real app, we'd use signInWithPhoneNumber with Recaptcha
      // For this environment, we'll simulate the OTP step
      setTimeout(() => {
        setStep('otp');
        setIsVerifying(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setIsVerifying(true);
    try {
      // Simulate verification
      setTimeout(() => {
        setStep('setup');
        setIsVerifying(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setIsVerifying(false);
    }
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

  const [selectedContinent, setSelectedContinent] = useState('Africa');
  const [selectedCountry, setSelectedCountry] = useState('Nigeria');

  useEffect(() => {
    if (locInfo.continent && CONTINENT_DATA[locInfo.continent]) {
      setSelectedContinent(locInfo.continent);
      setSelectedCountry(locInfo.country);
    }
  }, [locInfo]);

  const finalize = () => {
    setStep('success');
    setTimeout(() => {
      onComplete({ 
        name: name || email.split('@')[0] || phoneNumber, 
        email, 
        interests: selectedInterests,
        location: `${selectedCountry}, ${selectedContinent}`,
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
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => setStep('phone')} className="py-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center space-x-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <Smartphone size={18} className="text-blue-500 group-hover:scale-125 transition-transform" />
                  <span>Phone</span>
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
                disabled={!email.includes('@') || isVerifying}
                className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.8rem] font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center space-x-4 shadow-[0_25px_60px_rgba(206,17,38,0.3)] disabled:opacity-20 transition-all active:scale-95`}
              >
                {isVerifying ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><span>Authorize Transmission</span> <ArrowRight size={20} /></>
                )}
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
                disabled={phoneNumber.length < 8 || isVerifying}
                className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.8rem] font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center space-x-4 shadow-[0_25px_60px_rgba(206,17,38,0.3)] disabled:opacity-20 transition-all active:scale-95`}
              >
                {isVerifying ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><span>Authorize Transmission</span> <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-700">
            <button onClick={() => setStep('phone')} className="text-gray-600 hover:text-white transition-colors text-[11px] font-black uppercase tracking-[0.4em] flex items-center space-x-3">
              <ArrowRight size={16} className="rotate-180" /> <span>Back to Phone</span>
            </button>
            <div className="space-y-6">
              <h2 className="text-5xl font-black tracking-tighter text-white">Verification</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">Enter the 6-digit resonance code sent to your node.</p>
            </div>
            <div className="space-y-10">
              <div className="flex justify-between gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-14 h-20 bg-white/[0.02] border border-white/10 rounded-2xl text-center text-2xl font-black text-white focus:outline-none focus:border-gold/50 transition-all shadow-inner"
                  />
                ))}
              </div>
              <button 
                onClick={handleOtpSubmit}
                disabled={otp.join('').length < 6 || isVerifying}
                className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.8rem] font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center space-x-4 shadow-[0_25px_60px_rgba(206,17,38,0.3)] disabled:opacity-20 transition-all active:scale-95`}
              >
                {isVerifying ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><span>Verify Resonance</span> <ShieldCheck size={20} /></>
                )}
              </button>
              <div className="text-center">
                <button onClick={handlePhoneLogin} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gold transition-colors">Resend Code</button>
              </div>
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
                  <Globe size={18} className="text-gold" />
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600">Grid Node (Continent)</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(CONTINENT_DATA).map(cont => (
                    <button
                      key={cont}
                      onClick={() => {
                        setSelectedContinent(cont);
                        setSelectedCountry(CONTINENT_DATA[cont].countries[0]);
                      }}
                      className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest border transition-all duration-500 ${
                        selectedContinent === cont 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-[0_15px_40px_rgba(16,185,129,0.3)]' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                      }`}
                    >
                      {cont}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 px-6">
                  <ShieldCheck size={18} className="text-gold" />
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600">Specific Node (Country)</p>
                </div>
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] py-4 px-8 text-[11px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
                >
                  {CONTINENT_DATA[selectedContinent].countries.map(country => (
                    <option key={country} value={country} className="bg-[#111]">{country}</option>
                  ))}
                </select>
                <div className="px-6 flex items-center space-x-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700">Primary Frequencies:</span>
                  <div className="flex flex-wrap gap-2">
                    {CONTINENT_DATA[selectedContinent].languages.slice(0, 5).map(l => (
                      <span key={l} className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">{l}</span>
                    ))}
                  </div>
                </div>
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
