
import React, { useState, useEffect } from 'react';
import { X, Scan, ShieldCheck, User, Wallet, Sparkles } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';

interface ScannerProps {
  onAddFriend: () => void;
  onProcessPayment: (amount: number) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onAddFriend, onProcessPayment }) => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const isSocial = Math.random() > 0.5;
      setResult(isSocial ? {
        type: 'social',
        name: 'Marie T.',
        userId: 'm123',
        location: 'Monrovia, LR',
        interests: ['Fashion', 'Fintech']
      } : {
        type: 'payment',
        merchant: 'Sinkor Market Vendor',
        amount: 25.00,
        id: 'txn_992'
      });
      setScanning(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const reset = () => {
    setResult(null);
    setScanning(true);
  };

  return (
    <div className="h-full flex flex-col bg-black relative">
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {scanning ? (
          <>
            <div className="absolute inset-0 bg-black/60 z-0"></div>
            <div className="w-72 h-72 relative z-10">
               <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gold rounded-tl-3xl"></div>
               <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-red-500 rounded-tr-3xl"></div>
               <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-500 rounded-bl-3xl"></div>
               <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl"></div>
               
               <div className="absolute inset-4 border border-white/5 rounded-[2rem] overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${EKAN_GRADIENT_CSS} animate-[scanLine_2.5s_infinite] shadow-[0_0_20px_rgba(252,209,22,0.8)]`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scan size={64} className="text-white/5 animate-pulse" />
                  </div>
               </div>
            </div>
            
            <div className="mt-16 text-center z-10 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                 <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gold">Universal Scan Engine</span>
              </div>
              <p className="text-xs text-gray-500 font-bold tracking-widest uppercase px-8 leading-loose">
                Identifying Bridge Protocols...
              </p>
            </div>
          </>
        ) : (
          <div className="z-10 w-full max-w-sm animate-in zoom-in-95 duration-500">
            {result.type === 'social' ? (
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[4rem] space-y-8 shadow-2xl">
                <div className="flex justify-center">
                   <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-2xl shadow-red-600/20`}>
                      <div className="w-full h-full bg-black rounded-[2.2rem] flex items-center justify-center text-4xl font-black text-white">
                        {result.name[0]}
                      </div>
                   </div>
                </div>
                <div className="text-center space-y-3">
                    <h3 className="text-3xl font-black tracking-tighter">{result.name}</h3>
                    <p className="text-[11px] text-gold font-black uppercase tracking-[0.4em]">{result.location}</p>
                </div>
                <div className="flex flex-wrap gap-2.5 justify-center">
                    {result.interests.map((int: string) => (
                        <span key={int} className="text-[10px] bg-white/5 border border-white/10 px-4 py-2 rounded-full uppercase font-black text-gray-400 tracking-widest">{int}</span>
                    ))}
                </div>
                <div className="space-y-3 pt-2">
                  <button onClick={() => { onAddFriend(); reset(); }} className={`w-full py-5 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all`}>
                    Connect Node
                  </button>
                  <button onClick={reset} className="w-full py-4 text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] hover:text-white transition-colors">Abort Bridge</button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[4rem] space-y-8 shadow-2xl">
                 <div className="flex justify-center">
                   <div className={`w-24 h-24 rounded-[2.2rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shadow-inner`}>
                      <Wallet size={40} />
                   </div>
                </div>
                <div className="text-center space-y-4">
                    <div className="inline-block bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Fintech Request</div>
                    <h3 className="text-3xl font-black tracking-tighter">{result.merchant}</h3>
                    <div className="text-5xl font-black tracking-tighter text-white">
                      <span className="text-gold text-xl mr-1">$</span>{result.amount.toFixed(2)}
                    </div>
                </div>
                <div className="space-y-3">
                  <button onClick={() => { onProcessPayment(result.amount); reset(); }} className={`w-full py-5 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center active:scale-95 transition-all`}>
                    <ShieldCheck size={20} className="mr-3" /> Confirm & Pay
                  </button>
                  <button onClick={reset} className="w-full py-4 text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] hover:text-white transition-colors">Reject Protocol</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
