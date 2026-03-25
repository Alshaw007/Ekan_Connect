
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
  const [activeTab, setActiveTab] = useState<'balance' | 'vaults'>('balance');
  const [airtimeForm, setAirtimeForm] = useState({ operator: '', phone: '', amount: '' });
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

  const handleAirtimeSubmit = () => {
    const amt = parseFloat(airtimeForm.amount);
    if (!airtimeForm.phone || isNaN(amt) || amt <= 0 || amt > balance) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onAddFunds(-amt, `Airtime: ${airtimeForm.operator} (${airtimeForm.phone})`);
      setIsProcessing(false);
      setSuccessMsg(`Successfully transmitted $${amt} airtime to ${airtimeForm.phone}`);
      setTimeout(() => {
        setSuccessMsg('');
        setShowAirtime(false);
        setAirtimeForm({ operator: '', phone: '', amount: '' });
      }, 3000);
    }, 2500);
  };

  const handleDeposit = (amt: number, method: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onAddFunds(amt, `Bridge In: ${method}`);
      setIsProcessing(false);
      setShowDeposit(false);
    }, 1500);
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-1000 pb-28 h-full overflow-y-auto scrollbar-hide">
      {/* Universal Tab Controller */}
      <div className="flex bg-white/5 backdrop-blur-3xl p-1.5 rounded-[2.5rem] border border-white/10 w-fit mx-auto shadow-2xl">
         {['Personal Assets', 'Community Vaults'].map((tab, i) => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(i === 0 ? 'balance' : 'vaults')}
             className={`px-8 py-3.5 rounded-[2.2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-700 ${
               (activeTab === 'balance' && i === 0) || (activeTab === 'vaults' && i === 1) 
               ? 'bg-white/10 text-white shadow-xl' 
               : 'text-gray-600 hover:text-gray-400'
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      {activeTab === 'balance' ? (
        <div className="space-y-12 animate-in slide-in-from-left-8 duration-700">
          <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[5rem] border border-white/10 relative overflow-hidden shadow-2xl text-center group">
            <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-red-600/10 blur-[150px] rounded-full group-hover:scale-110 transition-transform duration-[3s]"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[400px] h-[400px] bg-emerald-600/10 blur-[150px] rounded-full group-hover:scale-110 transition-transform duration-[3s]"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center space-x-3 bg-black/40 border border-white/10 px-5 py-2 rounded-full">
                <ShieldCheck size={14} className="text-gold" />
                <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gray-500">Safe-Grid Asset Ledger</span>
              </div>
              <div className="text-8xl font-black tracking-tighter flex items-start justify-center text-white">
                <span className="text-2xl mt-6 mr-1.5 text-gold opacity-60">$</span>
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4 mt-12">
              <button className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-95 group/btn">
                <Scan size={28} className="text-gold mb-3 group-hover/btn:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Transmit</span>
              </button>
              <button onClick={() => setShowDeposit(true)} className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-95 group/btn">
                <Plus size={28} className="text-emerald-500 mb-3 group-hover/btn:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bridge In</span>
              </button>
              <button onClick={() => setShowAirtime(true)} className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-95 group/btn">
                <Smartphone size={28} className="text-indigo-400 mb-3 group-hover/btn:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Top Up</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-gray-600 px-6">Grid Ledger Activity</h3>
            <div className="space-y-4">
              {transactions.length === 0 && (
                <div className="py-12 text-center opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest">No ledger activity detected...</p>
                </div>
              )}
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white/10 flex items-center justify-between shadow-xl">
                  <div className="flex items-center space-x-6">
                     <div className={`p-4 rounded-[1.5rem] ${tx.type === 'inbound' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                       {tx.type === 'inbound' ? <ArrowDownLeft size={28} /> : <ArrowUpRight size={28} />}
                     </div>
                     <div>
                        <p className="font-black text-lg tracking-tight text-white">{tx.description}</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                          {tx.status.toUpperCase()} • {new Date(tx.timestamp).toLocaleString()}
                        </p>
                     </div>
                  </div>
                  <p className={`font-black text-3xl tracking-tighter ${tx.type === 'inbound' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.type === 'inbound' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
           <div className="bg-indigo-900/10 p-12 rounded-[4rem] border border-indigo-500/20 text-center space-y-6 relative overflow-hidden">
              <Sparkles size={48} className="text-indigo-400 mx-auto" />
              <div className="space-y-2">
                <h4 className="text-3xl font-black tracking-tighter text-white">Community Vaults</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">Pool assets with your local node for collective development and Susu savings.</p>
              </div>
              <button className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Start New Project</button>
           </div>
        </div>
      )}

      {/* Global Asset Bridge Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-[5rem] p-12 shadow-3xl space-y-12 max-h-[90vh] overflow-y-auto scrollbar-hide">
             <button onClick={() => setShowDeposit(false)} className="absolute top-12 right-12 p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={32} /></button>
             
             <div className="text-center space-y-4">
               <Globe size={48} className="text-gold mx-auto animate-pulse" />
               <h3 className="text-4xl font-black tracking-tighter text-white">Global Rail Manifest</h3>
               <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.5em]">Syncing World Liquidity to the Grid</p>
             </div>
             
             <div className="space-y-12 pb-10">
                {GLOBAL_RAILS.map(region => (
                  <div key={region.region} className="space-y-6">
                    <h4 className="text-[13px] font-black uppercase tracking-[0.6em] text-gold/80 border-b border-white/10 pb-4">{region.region}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                       {region.methods.map(method => (
                         <button 
                           key={method} 
                           onClick={() => handleDeposit(1000, method)} 
                           disabled={isProcessing}
                           className="flex items-center space-x-4 p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] hover:bg-white/[0.08] hover:border-gold/30 transition-all group disabled:opacity-20"
                         >
                            <div className="w-14 h-14 rounded-[1.4rem] bg-white/5 flex items-center justify-center text-gold font-black text-2xl group-hover:scale-110 transition-transform">{method[0]}</div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{method}</span>
                         </button>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Airtime Sync Modal */}
      {showAirtime && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[5rem] p-12 shadow-3xl space-y-12">
             <button onClick={() => setShowAirtime(false)} className="absolute top-12 right-12 p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={32} /></button>
             
             <div className="text-center space-y-4">
               <Smartphone size={48} className="text-indigo-400 mx-auto" />
               <h3 className="text-4xl font-black tracking-tighter text-white">Airtime Sync</h3>
               <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.4em]">Bridging Assets to Regional Networks</p>
             </div>

             {successMsg ? (
               <div className="py-12 flex flex-col items-center space-y-6 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 size={48} />
                  </div>
                  <p className="text-center text-sm font-black uppercase tracking-widest text-emerald-400 leading-loose">{successMsg}</p>
               </div>
             ) : (
               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600 px-6">Network Provider</label>
                    <select 
                      value={airtimeForm.operator}
                      onChange={(e) => setAirtimeForm({ ...airtimeForm, operator: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] py-6 px-8 text-sm font-black text-gray-400 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>SELECT PROVIDER</option>
                      {TELCOS.map(country => (
                        <optgroup key={country.country} label={country.country.toUpperCase()} className="bg-[#111]">
                          {country.operators.map(op => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-600 px-6">Node Identifier (Phone)</label>
                    <div className="relative">
                      <Smartphone size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-700" />
                      <input 
                        type="tel" 
                        placeholder="+231..."
                        value={airtimeForm.phone}
                        onChange={(e) => setAirtimeForm({ ...airtimeForm, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] py-7 pl-18 pr-8 text-xl font-black tracking-[0.2em] focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-900 text-white"
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
                        value={airtimeForm.amount}
                        onChange={(e) => setAirtimeForm({ ...airtimeForm, amount: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-[2.2rem] py-8 pl-18 pr-8 text-4xl font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-900 tracking-tighter"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleAirtimeSubmit}
                    disabled={isProcessing || !airtimeForm.phone || !airtimeForm.amount || parseFloat(airtimeForm.amount) > balance}
                    className={`w-full py-8 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.8rem] font-black text-xs uppercase tracking-[0.4em] shadow-3xl active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center space-x-3`}
                  >
                    {isProcessing ? <span>Bridging Protocol...</span> : <span>Authorize Transmission</span>}
                    {!isProcessing && <ChevronRight size={24} />}
                  </button>
               </div>
             )}
             
             <div className="flex justify-center">
                <div className="flex items-center space-x-3 bg-white/[0.01] px-6 py-3 rounded-full border border-white/5">
                   <ShieldCheck size={16} className="text-emerald-500" />
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">Protocol Confirmed: Zero-Loss Handshake</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
