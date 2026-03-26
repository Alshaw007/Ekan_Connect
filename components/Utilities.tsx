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
  Search,
  Smartphone
} from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { useFirebase } from './FirebaseProvider';

interface UtilityItem {
  id: string;
  name: string;
  provider: string;
  category: string;
}

interface UtilitiesProps {
  balance: number;
  onProcessPayment: (amount: number, description: string) => void;
}

const UTILITY_CATEGORIES = [
  { id: 'electricity', name: 'Electricity', icon: <Zap size={24} /> },
  { id: 'water', name: 'Water', icon: <Droplets size={24} /> },
  { id: 'transport', name: 'Transport', icon: <Bus size={24} /> },
  { id: 'airtime', name: 'Airtime', icon: <Smartphone size={24} /> },
];

const MOCK_SERVICES: UtilityItem[] = [
  { id: '1', name: 'LEC Prepaid', provider: 'Liberia Electricity Corp', category: 'electricity' },
  { id: '2', name: 'LWSC Bill', provider: 'Liberia Water & Sewer Corp', category: 'water' },
  { id: '3', name: 'Orange Airtime', provider: 'Orange Liberia', category: 'airtime' },
  { id: '4', name: 'Lonestar Airtime', provider: 'Lonestar MTN', category: 'airtime' },
  { id: '5', name: 'National Transit', provider: 'NTA Liberia', category: 'transport' },
];

const Utilities: React.FC<UtilitiesProps> = ({ balance, onProcessPayment }) => {
  const { profile } = useFirebase();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<UtilityItem | null>(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = () => {
    const amt = parseFloat(amount);
    if (!selectedService || isNaN(amt) || amt <= 0 || amt > balance || !accountNumber) return;

    setIsProcessing(true);
    setTimeout(() => {
      onProcessPayment(amt, `Utility: ${selectedService.name} (${accountNumber})`);
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedService(null);
        setAmount('');
        setAccountNumber('');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] dark:bg-[#111b21] overflow-hidden pb-20">
      {/* Header */}
      <div className="bg-brand-navy p-6 text-white">
        <h1 className="text-2xl font-bold">Utilities</h1>
        <p className="text-xs text-brand-green font-bold uppercase tracking-widest mt-1">Pay bills & services</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Categories Grid */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {UTILITY_CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-brand-green text-white shadow-lg' : 'bg-white dark:bg-[#202c33] text-slate-600 dark:text-[#e9edef] hover:bg-slate-50 dark:hover:bg-[#182229]'}`}
            >
              <div className="mb-1">{cat.icon}</div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-center">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="mt-2 bg-white dark:bg-[#202c33] border-y border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-500 dark:text-[#8696a0] uppercase tracking-widest">
              {selectedCategory ? UTILITY_CATEGORIES.find(c => c.id === selectedCategory)?.name : 'All Services'}
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {MOCK_SERVICES
              .filter(s => !selectedCategory || s.category === selectedCategory)
              .map(service => (
                <div 
                  key={service.id} 
                  onClick={() => setSelectedService(service)}
                  className="flex items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-[#182229] cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#2a3942] flex items-center justify-center text-brand-navy dark:text-brand-green">
                    {UTILITY_CATEGORIES.find(c => c.id === service.category)?.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-bold dark:text-[#e9edef]">{service.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-[#8696a0] uppercase tracking-widest mt-0.5">{service.provider}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-green transition-colors" />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#233138] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-brand-navy text-white">
              <h3 className="font-bold">Pay {selectedService.name}</h3>
              <button onClick={() => setSelectedService(null)}><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {success ? (
                <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-sm font-bold text-emerald-600">Payment Successful</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                    <input 
                      type="text"
                      placeholder="Enter ID or Account #"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#2a3942] border-none rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-brand-green dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#2a3942] border-none rounded-xl py-4 px-4 text-2xl font-bold focus:ring-2 focus:ring-brand-green dark:text-white"
                    />
                  </div>
                  <button 
                    onClick={handlePayment}
                    disabled={isProcessing || !accountNumber || !amount || parseFloat(amount) > balance}
                    className="w-full py-4 bg-brand-green text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilities;
