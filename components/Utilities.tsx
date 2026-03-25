import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Droplets, 
  Bus, 
  Plane, 
  Train, 
  ChevronRight, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  DollarSign, 
  Globe,
  Search
} from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { useFirebase } from './FirebaseProvider';

interface UtilityItem {
  name: string;
  type: string;
}

interface UtilityData {
  electricity: UtilityItem[];
  water: UtilityItem[];
  transport: UtilityItem[];
}

interface UtilitiesProps {
  balance: number;
  onProcessPayment: (amount: number, description: string) => void;
}

const Utilities: React.FC<UtilitiesProps> = ({ balance, onProcessPayment }) => {
  const { profile } = useFirebase();
  const [data, setData] = useState<UtilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ item: UtilityItem; category: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const country = profile?.location?.split(',').pop()?.trim() || "Liberia";
    fetch(`/api/utilities?country=${encodeURIComponent(country)}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [profile]);

  const handlePayment = () => {
    const amt = parseFloat(amount);
    if (!selectedItem || isNaN(amt) || amt <= 0 || amt > balance || !accountNumber) return;

    setIsProcessing(true);
    setTimeout(() => {
      onProcessPayment(amt, `Utility: ${selectedItem.item.name} (${accountNumber})`);
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedItem(null);
        setAmount('');
        setAccountNumber('');
      }, 3000);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-1000 pb-28 h-full overflow-y-auto scrollbar-hide">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-white">Grid Utilities</h1>
        <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.5em]">Global Infrastructure Interface</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Electricity */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4 px-4">
            <Zap size={24} className="text-gold" />
            <h3 className="text-[13px] font-black uppercase tracking-[0.4em] text-white">Power Grid</h3>
          </div>
          <div className="space-y-4">
            {data?.electricity.map(item => (
              <button 
                key={item.name}
                onClick={() => setSelectedItem({ item, category: 'Electricity' })}
                className="w-full flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all group"
              >
                <div className="text-left">
                  <p className="font-black text-xl tracking-tight text-white">{item.name}</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{item.type}</p>
                </div>
                <ChevronRight size={24} className="text-gray-700 group-hover:text-gold transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Water */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4 px-4">
            <Droplets size={24} className="text-blue-400" />
            <h3 className="text-[13px] font-black uppercase tracking-[0.4em] text-white">Water Supply</h3>
          </div>
          <div className="space-y-4">
            {data?.water.map(item => (
              <button 
                key={item.name}
                onClick={() => setSelectedItem({ item, category: 'Water' })}
                className="w-full flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all group"
              >
                <div className="text-left">
                  <p className="font-black text-xl tracking-tight text-white">{item.name}</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{item.type}</p>
                </div>
                <ChevronRight size={24} className="text-gray-700 group-hover:text-gold transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Transport */}
        <div className="space-y-6 md:col-span-2">
          <div className="flex items-center space-x-4 px-4">
            <Bus size={24} className="text-emerald-500" />
            <h3 className="text-[13px] font-black uppercase tracking-[0.4em] text-white">Mobility & Transit</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.transport.map(item => (
              <button 
                key={item.name}
                onClick={() => setSelectedItem({ item, category: 'Transport' })}
                className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center space-x-6">
                   <div className="p-4 bg-white/5 rounded-2xl text-emerald-500">
                     {item.type.includes('Rail') ? <Train size={28} /> : item.type.includes('Airline') ? <Plane size={28} /> : <Bus size={28} />}
                   </div>
                   <div className="text-left">
                     <p className="font-black text-xl tracking-tight text-white">{item.name}</p>
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{item.type}</p>
                   </div>
                </div>
                <ChevronRight size={24} className="text-gray-700 group-hover:text-gold transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[5rem] p-12 shadow-3xl space-y-12">
            <button onClick={() => setSelectedItem(null)} className="absolute top-12 right-12 p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={32} /></button>
            
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gold/10 rounded-[2.5rem] mx-auto flex items-center justify-center text-gold shadow-2xl border border-gold/20">
                <DollarSign size={48} />
              </div>
              <h3 className="text-4xl font-black tracking-tighter text-white">{selectedItem.category} Payment</h3>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.4em]">{selectedItem.item.name}</p>
            </div>

            {success ? (
              <div className="py-12 flex flex-col items-center space-y-6 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 size={48} />
                </div>
                <p className="text-center text-sm font-black uppercase tracking-widest text-emerald-400 leading-loose">Transmission Successful</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600 px-6">Account / Meter Number</label>
                  <div className="relative">
                    <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-700" />
                    <input 
                      type="text" 
                      placeholder="ENTER ID..."
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] py-7 pl-18 pr-8 text-xl font-black tracking-[0.2em] focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-900 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600 px-6">Transmission Value</label>
                  <div className="relative">
                    <DollarSign size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-gold" />
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] py-8 pl-18 pr-8 text-4xl font-black text-white focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-900 tracking-tighter"
                    />
                  </div>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing || !amount || !accountNumber || parseFloat(amount) > balance}
                  className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.8rem] font-black text-xs uppercase tracking-[0.4em] shadow-3xl active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center space-x-3`}
                >
                  {isProcessing ? <span>Bridging Protocol...</span> : <span>Authorize Payment</span>}
                  {!isProcessing && <ChevronRight size={24} />}
                </button>
              </div>
            )}
            
            <div className="flex justify-center">
              <div className="flex items-center space-x-3 bg-white/[0.01] px-6 py-3 rounded-full border border-white/5">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">Safe-Grid Protocol Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilities;
