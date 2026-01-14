
import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Settings, Globe, Scan, QrCode, X } from './Icons';
import { COLORS, EKAN_GRADIENT_CSS } from '../constants';
import { Transaction } from '../types';

interface WalletProps {
  balance: number;
  onAddFunds: () => void;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 50.00, type: 'outbound', description: 'Orange Money Transfer', status: 'completed', timestamp: new Date() },
  { id: '2', amount: 500.00, type: 'inbound', description: 'Stripe Deposit', status: 'completed', timestamp: new Date() },
  { id: '3', amount: 15.00, type: 'outbound', description: 'Event Escrow: Tech Summit', status: 'pending', isEscrow: true, timestamp: new Date() },
];

const Wallet: React.FC<WalletProps> = ({ balance, onAddFunds }) => {
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700 pb-20 overflow-y-auto h-full scrollbar-hide">
      <div className={`bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 relative overflow-hidden shadow-2xl`}>
        <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-red-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-green-600/10 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-3 bg-black/40 border border-white/10 px-5 py-2.5 rounded-full">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
            <span className="text-[11px] uppercase tracking-[0.5em] font-black text-gray-400">Node Secure</span>
          </div>
          
          <div className="text-8xl font-black tracking-tighter flex items-start text-white animate-in slide-in-from-bottom-2">
            <span className="text-2xl mt-5 mr-1.5 text-gold">$</span>
            {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          
          <div className="flex items-center text-[11px] bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-gray-300 font-black uppercase tracking-widest">
            <ShieldCheck size={16} className="mr-3 text-gold" /> Bridge Guard Active
          </div>
        </div>

        <div className="relative z-10 flex justify-center space-x-4 mt-16">
          <button className={`flex-1 bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center space-x-3 shadow-2xl active:scale-95 transition-all`}>
            <Scan size={22} /> <span>Pay</span>
          </button>
          <button 
            onClick={() => setShowDeposit(true)}
            className="flex-1 bg-white/5 backdrop-blur-3xl text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] border border-white/10 flex items-center justify-center space-x-3 hover:bg-white/10 active:scale-95 transition-all"
          >
            <Plus size={22} /> <span>Deposit</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-6">
        <button className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] flex flex-col items-center space-y-4 group hover:border-gold/50 transition-all shadow-xl">
            <div className="p-4 bg-gold/10 rounded-2xl text-gold group-hover:scale-110 transition-transform">
                <QrCode size={28} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-gold transition-colors">My Bridge</span>
        </button>
        <button className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] flex flex-col items-center space-y-4 group hover:border-indigo-500/50 transition-all shadow-xl">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                <ArrowDownLeft size={28} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-indigo-400 transition-colors">Request</span>
        </button>
      </div>

      <div className="space-y-6 pb-24">
        <div className="flex items-center justify-between px-6">
          <h2 className="text-[11px] uppercase tracking-[0.6em] font-black text-gray-600">Secure Activity</h2>
          <button className="text-[11px] text-gold font-black uppercase tracking-[0.4em]">Audit Logs</button>
        </div>
        <div className="space-y-4">
          {MOCK_TRANSACTIONS.map((t) => (
            <div key={t.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all shadow-lg">
              <div className="flex items-center space-x-6">
                <div className={`p-5 rounded-3xl ${t.type === 'inbound' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} border border-white/5`}>
                  {t.type === 'inbound' ? <ArrowDownLeft size={28} /> : <ArrowUpRight size={28} />}
                </div>
                <div>
                  <div className="font-black text-lg tracking-tighter text-white/90">{t.description}</div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{t.status}</div>
                    {t.isEscrow && (
                        <div className="text-[8px] bg-indigo-900/40 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 uppercase font-black animate-pulse">Protected</div>
                    )}
                  </div>
                </div>
              </div>
              <div className={`font-black text-3xl tracking-tighter ${t.type === 'inbound' ? 'text-green-500' : 'text-white'}`}>
                {t.type === 'inbound' ? '+' : '-'}${t.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeposit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-[3.5rem] p-10 shadow-2xl">
             <button onClick={() => setShowDeposit(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white"><X size={24} /></button>
             <div className="space-y-8">
               <div className="text-center">
                 <h3 className="text-3xl font-black tracking-tighter text-white">Bridge Deposit</h3>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Initialize Local -> Global Rail</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => { onAddFunds(); setShowDeposit(false); }} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center space-y-3 hover:bg-white/10 transition-all">
                    <span className="text-orange-500 font-black text-2xl">O</span>
                    <span className="text-[9px] font-black uppercase">Orange Money</span>
                 </button>
                 <button onClick={() => { onAddFunds(); setShowDeposit(false); }} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center space-y-3 hover:bg-white/10 transition-all">
                    <span className="text-yellow-400 font-black text-2xl">M</span>
                    <span className="text-[9px] font-black uppercase">MTN MoMo</span>
                 </button>
               </div>
               <p className="text-center text-[9px] text-gray-600 font-medium">Standard $50.00 diagnostic credit will be initialized.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
