
import React, { useState, useEffect } from 'react';
import { Plus, ShieldCheck, QrCode, Scan, X, ArrowDownLeft, ArrowUpRight, Sparkles, Smartphone, Globe, DollarSign, ChevronRight, CheckCircle2 } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Transaction, GroupVault } from '../types';
import { useFirebase } from './FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

interface WalletProps {
  balance: number;
  onAddFunds: (amount: number, description?: string) => void;
}

const TELCOS = [
  { country: 'Liberia', operators: ['Orange LR', 'Lonestar MTN'] },
  { country: 'Ghana', operators: ['MTN GH', 'Telecel', 'AirtelTigo'] },
  { country: 'Nigeria', operators: ['MTN NG', 'Glo', 'Airtel', '9mobile'] },
  { country: 'Kenya', operators: ['Safaricom M-Pesa', 'Airtel'] },
  { country: 'South Africa', operators: ['Vodacom', 'MTN SA', 'Telkom'] },
  { country: 'USA', operators: ['Verizon', 'AT&T', 'T-Mobile'] },
  { country: 'UK', operators: ['EE', 'O2', 'Vodafone', 'Three'] },
  { country: 'China', operators: ['China Mobile', 'China Unicom', 'China Telecom'] },
  { country: 'India', operators: ['Jio', 'Airtel India', 'VI'] },
  { country: 'Brazil', operators: ['Vivo', 'Claro', 'TIM'] },
  { country: 'Australia', operators: ['Telstra', 'Optus', 'Vodafone AU'] }
];

const GLOBAL_RAILS = [
  { region: 'Africa', methods: ['Orange Money', 'MTN MoMo', 'M-Pesa', 'Wave', 'Airtel Money', 'Flutterwave'] },
  { region: 'Asia', methods: ['Alipay', 'WeChat Pay', 'GrabPay', 'PayTM', 'GoPay', 'Line Pay'] },
  { region: 'Europe', methods: ['SEPA Direct', 'Revolut', 'Klarna', 'iDEAL', 'Monzo', 'Wise'] },
  { region: 'North America', methods: ['Stripe', 'Venmo', 'Cash App', 'Zelle', 'Apple Pay', 'Google Pay'] },
  { region: 'South America', methods: ['Pix (Brazil)', 'Mercado Pago', 'Ualá', 'Nequi'] },
  { region: 'Oceania', methods: ['POLi', 'Afterpay', 'BPAY', 'Zip'] },
  { region: 'Antarctica', methods: ['Satellite Bridge', 'McMurdo Node', 'Grid-Sync'] }
];
const Wallet: React.FC<WalletProps> = ({ balance, onAddFunds }) => {
  const { user: authUser } = useFirebase();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showAirtime, setShowAirtime] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Sync Transactions from Firestore
  useEffect(() => {
    if (!authUser) return;

    const transactionsRef = collection(db, 'users', authUser.uid, 'transactions');
    const q = query(transactionsRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Transaction));
      setTransactions(fetchedTransactions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${authUser.uid}/transactions`);
    });

    return () => unsubscribe();
  }, [authUser]);

  const handleDeposit = (amt: number, method: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onAddFunds(amt, `Bridge In: ${method}`);
      setIsProcessing(false);
      setShowDeposit(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] dark:bg-[#111b21] overflow-y-auto scrollbar-hide pb-20">
      {/* Wallet Header */}
      <div className="bg-brand-navy p-8 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 to-transparent opacity-50"></div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green/80 mb-2">Available Balance</p>
          <h1 className="text-5xl font-black tracking-tighter">
            <span className="text-2xl align-top mr-1">$</span>
            {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <div className="flex justify-center space-x-4 mt-8">
            <button 
              onClick={() => setShowDeposit(true)}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Plus size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Add Funds</span>
            </button>
            <button className="flex flex-col items-center space-y-2 group">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                <ArrowUpRight size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Send</span>
            </button>
            <button 
              onClick={() => setShowAirtime(true)}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Smartphone size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Top Up</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 mt-4 bg-white dark:bg-[#202c33] border-y border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
          <h3 className="text-sm font-bold text-slate-500 dark:text-[#8696a0] uppercase tracking-widest">Recent Activity</h3>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 dark:text-slate-600 text-sm italic">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-[#182229] transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'inbound' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'inbound' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-[#e9edef]">{tx.description}</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#8696a0] uppercase tracking-widest mt-0.5">
                    {new Date(tx.timestamp).toLocaleDateString()} • {tx.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${tx.type === 'inbound' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.type === 'inbound' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals (Simplified) */}
      {showDeposit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#233138] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-brand-navy text-white">
              <h3 className="font-bold">Add Funds</h3>
              <button onClick={() => setShowDeposit(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {GLOBAL_RAILS.slice(0, 3).map(region => (
                <div key={region.region} className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{region.region}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {region.methods.slice(0, 4).map(method => (
                      <button 
                        key={method}
                        onClick={() => handleDeposit(100, method)}
                        className="p-3 bg-slate-100 dark:bg-[#2a3942] rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-green hover:text-white transition-all"
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
