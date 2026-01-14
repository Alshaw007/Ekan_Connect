
import React, { useState } from 'react';
import { Plus, ShieldCheck, QrCode, Scan, X, ArrowDownLeft, ArrowUpRight, Sparkles } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { Transaction, GroupVault } from '../types';

interface WalletProps {
  balance: number;
  onAddFunds: () => void;
}

const MOCK_VAULTS: GroupVault[] = [
  { id: 'v1', title: 'Community Water Project', targetAmount: 2000, currentAmount: 1450, contributors: 42, deadline: '12 days left' },
  { id: 'v2', title: 'StartUp Seed Fund (Monrovia)', targetAmount: 5000, currentAmount: 890, contributors: 12, deadline: '24 days left' }
];

const MOCK_TXS: Transaction[] = [
  { id: 't1', amount: 25.00, type: 'outbound', description: 'Contribution: Water Project', status: 'completed', timestamp: new Date() },
  { id: 't2', amount: 150.00, type: 'inbound', description: 'Payout: Tech Grant', status: 'completed', timestamp: new Date() }
];

const Wallet: React.FC<WalletProps> = ({ balance, onAddFunds }) => {
  const [showDeposit, setShowDeposit] = useState(false);
  const [activeTab, setActiveTab] = useState<'balance' | 'vaults'>('balance');

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
          <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 relative overflow-hidden shadow-2xl text-center">
            <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-red-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-green-600/10 blur-[120px] rounded-full"></div>
            
            <div className="relative z-10 flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-3 bg-black/40 border border-white/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-500">Bridge Secure</span>
              </div>
              <div className="text-8xl font-black tracking-tighter flex items-start text-white">
                <span className="text-2xl mt-5 mr-1 text-gold">$</span>
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="relative z-10 flex space-x-4 mt-12">
              <button className={`flex-1 bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 shadow-2xl active:scale-95 transition-all`}><Scan size={20} /> <span>Pay</span></button>
              <button onClick={() => setShowDeposit(true)} className="flex-1 bg-white/5 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 flex items-center justify-center space-x-2 hover:bg-white/10 transition-all"><Plus size={20} /> <span>Deposit</span></button>
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
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{t.status}</p>
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

      {showDeposit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-[3.5rem] p-10 shadow-2xl space-y-8">
             <button onClick={() => setShowDeposit(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white"><X size={24} /></button>
             <div className="text-center space-y-2">
               <h3 className="text-3xl font-black tracking-tighter text-white">Asset Rail</h3>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Initialize Local -> Global Bridge</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {['Orange Money', 'MTN MoMo'].map(method => (
                  <button key={method} onClick={() => { onAddFunds(); setShowDeposit(false); }} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center space-y-3 hover:bg-white/10 transition-all">
                     <span className="text-gold font-black text-2xl">{method[0]}</span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{method}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
