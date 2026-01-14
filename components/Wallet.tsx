
import React, { useState } from 'react';
import { Plus, ShieldCheck, QrCode, Scan, X, ArrowDownLeft, ArrowUpRight, Sparkles, Smartphone, Globe, DollarSign, ChevronRight } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Transaction, GroupVault } from '../types';

interface WalletProps {
  balance: number;
  onAddFunds: (amount?: number) => void;
}

const MOCK_VAULTS: GroupVault[] = [
  { id: 'v1', title: 'Community Water Project', targetAmount: 2000, currentAmount: 1450, contributors: 42, deadline: '12 days left' },
  { id: 'v2', title: 'StartUp Seed Fund (Monrovia)', targetAmount: 5000, currentAmount: 890, contributors: 12, deadline: '24 days left' }
];

const MOCK_TXS: Transaction[] = [
  { id: 't1', amount: 25.00, type: 'outbound', description: 'Contribution: Water Project', status: 'completed', timestamp: new Date() },
  { id: 't2', amount: 150.00, type: 'inbound', description: 'Payout: Tech Grant', status: 'completed', timestamp: new Date() }
];

const GLOBAL_PAYMENTS = [
  { region: 'Africa', methods: ['Orange Money', 'MTN MoMo', 'M-Pesa', 'Wave'] },
  { region: 'Asia', methods: ['Alipay', 'WeChat Pay', 'GrabPay', 'PayTM'] },
  { region: 'Europe', methods: ['SEPA Transfer', 'Revolut', 'Klarna', 'iDEAL'] },
  { region: 'Americas', methods: ['Apple Pay', 'Google Pay', 'Cash App', 'Pix', 'Mercado Pago'] },
  { region: 'Oceania', methods: ['POLi', 'Afterpay', 'Westpac'] }
];

const Wallet: React.FC<WalletProps> = ({ balance, onAddFunds }) => {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showAirtime, setShowAirtime] = useState(false);
  const [activeTab, setActiveTab] = useState<'balance' | 'vaults'>('balance');
  const [airtimeForm, setAirtimeForm] = useState({ phone: '', amount: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAirtimeSubmit = () => {
    const amt = parseFloat(airtimeForm.amount);
    if (!airtimeForm.phone || isNaN(amt) || amt <= 0 || amt > balance) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onAddFunds(-amt); // Subtracting from balance
      setIsProcessing(false);
      setShowAirtime(false);
      setAirtimeForm({ phone: '', amount: '' });
      alert(`Successfully recharged ${airtimeForm.phone} with $${amt}`);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 pb-24 h-full overflow-y-auto scrollbar-hide">
      {/* Header Tabs */}
      <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-fit mx-auto mb-4 shadow-inner">
         {['Personal Assets', 'Group Vaults'].map((tab, i) => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(i === 0 ? 'balance' : 'vaults')}
             className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
               (activeTab === 'balance' && i === 0) || (activeTab === 'vaults' && i === 1) 
               ? 'bg-white/10 text-white shadow-lg' 
               : 'text-gray-600'
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      {activeTab === 'balance' ? (
        <div className="space-y-10 animate-in slide-in-from-left-4 duration-500">
          <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 relative overflow-hidden shadow-2xl text-center">
            <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-red-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-green-600/10 blur-[120px] rounded-full"></div>
            
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3 bg-black/40 border border-white/10 px-4 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] uppercase tracking-[0.4em] font-black text-gray-500">Bridge Secure Assets</span>
              </div>
              <div className="text-7xl font-black tracking-tighter flex items-start text-white">
                <span className="text-2xl mt-4 mr-1 text-gold">$</span>
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3 mt-10">
              <button className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group active:scale-95">
                <Scan size={24} className="text-gold mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Pay</span>
              </button>
              <button onClick={() => setShowDeposit(true)} className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group active:scale-95">
                <Plus size={24} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Deposit</span>
              </button>
              <button onClick={() => setShowAirtime(true)} className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group active:scale-95">
                <Smartphone size={24} className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Airtime</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 px-4">Ledger Stream</h3>
            {MOCK_TXS.map(t => (
              <div key={t.id} className="bg-white/5 backdrop-blur-xl p-6 rounded-[3rem] border border-white/10 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-4">
                   <div className={`p-4 rounded-2xl ${t.type === 'inbound' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {t.type === 'inbound' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                   </div>
                   <div>
                      <p className="font-black text-sm tracking-tight">{t.description}</p>
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{t.status} • {t.timestamp.toLocaleDateString()}</p>
                   </div>
                </div>
                <p className={`font-black text-xl tracking-tighter ${t.type === 'inbound' ? 'text-green-500' : 'text-white'}`}>{t.type === 'inbound' ? '+' : '-'}${t.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-indigo-900/20 p-8 rounded-[3rem] border border-indigo-500/20 text-center space-y-4">
              <Sparkles size={32} className="text-indigo-400 mx-auto" />
              <h4 className="text-2xl font-black tracking-tighter">Bridge Collaboration</h4>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">Pool funds for community goals with transparent ledger audits.</p>
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Start New Vault</button>
           </div>
           
           {MOCK_VAULTS.map(vault => (
             <div key={vault.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white/10 space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><QrCode size={120} /></div>
                <div className="flex justify-between items-start">
                   <div>
                      <h5 className="text-xl font-black tracking-tighter">{vault.title}</h5>
                      <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-1">{vault.deadline}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Active contributors</p>
                      <p className="text-lg font-black text-white">{vault.contributors}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>${vault.currentAmount}</span>
                      <span>Goal: ${vault.targetAmount}</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: `${(vault.currentAmount / vault.targetAmount) * 100}%` }}></div>
                   </div>
                </div>
                
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Contribute Assets</button>
             </div>
           ))}
        </div>
      )}

      {/* Global Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[4rem] p-8 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
             <button onClick={() => setShowDeposit(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={20} /></button>
             <div className="text-center space-y-3 pt-4">
               <div className="flex justify-center"><Globe size={40} className="text-gold animate-pulse" /></div>
               <h3 className="text-3xl font-black tracking-tighter text-white uppercase">Global Asset Bridge</h3>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Initialize Universal Liquidity Rail</p>
             </div>
             
             <div className="space-y-8">
                {GLOBAL_PAYMENTS.map(region => (
                  <div key={region.region} className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-gold/60 border-b border-white/5 pb-2">{region.region}</h4>
                    <div className="grid grid-cols-2 gap-3">
                       {region.methods.map(method => (
                         <button 
                           key={method} 
                           onClick={() => { onAddFunds(500); setShowDeposit(false); }} 
                           className="flex items-center space-x-3 p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-gold/30 transition-all group"
                         >
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold font-black group-hover:scale-110 transition-transform">{method[0]}</div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{method}</span>
                         </button>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Airtime Top Up Modal */}
      {showAirtime && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[4rem] p-10 shadow-2xl space-y-10">
             <button onClick={() => setShowAirtime(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={20} /></button>
             
             <div className="text-center space-y-3">
               <div className="flex justify-center"><Smartphone size={40} className="text-indigo-400" /></div>
               <h3 className="text-3xl font-black tracking-tighter text-white">Top Up Airtime</h3>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Recharge Any Grid Identifier</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 px-4">Mobile Number</label>
                  <div className="relative">
                    <Smartphone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
                    <input 
                      type="tel" 
                      placeholder="+231 00 000 000"
                      value={airtimeForm.phone}
                      onChange={(e) => setAirtimeForm({ ...airtimeForm, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-lg font-black tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 px-4">Top Up Amount</label>
                  <div className="relative">
                    <DollarSign size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gold" />
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={airtimeForm.amount}
                      onChange={(e) => setAirtimeForm({ ...airtimeForm, amount: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-3xl font-black tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 px-2">
                  {[5, 10, 20, 50].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAirtimeForm({ ...airtimeForm, amount: val.toString() })}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${airtimeForm.amount === val.toString() ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
             </div>

             <button 
               onClick={handleAirtimeSubmit}
               disabled={isProcessing || !airtimeForm.phone || !airtimeForm.amount || parseFloat(airtimeForm.amount) > balance}
               className={`w-full py-6 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center space-x-3`}
             >
                {isProcessing ? <span>Processing Sync...</span> : <span>Authorize Recharge</span>}
                {!isProcessing && <ChevronRight size={18} />}
             </button>
             
             <div className="flex justify-center">
                <div className="flex items-center space-x-2 bg-white/[0.01] px-4 py-2 rounded-full">
                  <ShieldCheck size={12} className="text-green-500" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Secure Protocol Verified</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
