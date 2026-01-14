
import React, { useState, useEffect } from 'react';
import { X, Scan, ShieldCheck, User, Wallet, Sparkles, CheckCheck } from './Icons';
import { EKAN_GRADIENT_CSS } from '../constants';
import { User as UserType } from '../types';

interface ScannerProps {
  onAddFriend: (user: UserType) => void;
  onProcessPayment: (amount: number) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onAddFriend, onProcessPayment }) => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [protocolStage, setProtocolStage] = useState(0);

  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        const isSocial = Math.random() > 0.5;
        setResult(isSocial ? {
          type: 'social',
          name: 'Marie T.',
          userId: 'm123',
          location: 'Monrovia, LR',
          interests: ['Fashion', 'Fintech'],
          avatar: 'M'
        } : {
          type: 'payment',
          merchant: 'Sinkor Marketplace Vendor',
          amount: 15.00,
          id: 'txn_992'
        });
        setScanning(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  const handleAction = () => {
    setProtocolStage(1);
    setTimeout(() => {
      if (result.type === 'social') {
        onAddFriend({ id: result.userId, name: result.name, avatar: result.avatar, location: result.location });
      } else {
        onProcessPayment(result.amount);
      }
      setProtocolStage(2);
      setTimeout(reset, 2000);
    }, 1500);
  };

  const reset = () => {
    setResult(null);
    setScanning(true);
    setProtocolStage(0);
  };

  return (
    <div className="h-full flex flex-col bg-black relative pb-24">
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
                  <div className="absolute inset-0 flex items-center justify-center"><Scan size={64} className="text-white/10" /></div>
               </div>
            </div>
            <div className="mt-16 text-center z-10 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gold">Grid Protocol Search</span>
              </div>
              <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase px-8 leading-loose">Aligning Frequencies...</p>
            </div>
          </>
        ) : (
          <div className="z-10 w-full max-w-sm animate-in zoom-in-95 duration-500">
            {protocolStage === 0 ? (
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[4rem] space-y-8 shadow-2xl text-center">
                  <div className="flex justify-center">
                    <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${EKAN_GRADIENT_CSS} p-1 shadow-2xl shadow-red-600/20`}>
                      <div className="w-full h-full bg-black rounded-[2.2rem] flex items-center justify-center text-4xl font-black text-white">
                        {result.type === 'social' ? result.avatar : '$'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black tracking-tighter">{result.type === 'social' ? result.name : result.merchant}</h3>
                    <p className="text-[11px] text-gold font-black uppercase tracking-[0.4em]">
                      {result.type === 'social' ? result.location : `$${result.amount.toFixed(2)} Protocol`}
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <button onClick={handleAction} className={`w-full py-5 bg-gradient-to-r ${EKAN_GRADIENT_CSS} text-black rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-2xl shadow-red-600/20`}>
                       {result.type === 'social' ? 'Connect Identity' : 'Execute Payment'}
                    </button>
                    <button onClick={reset} className="w-full py-4 text-center text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] hover:text-white transition-colors">Abort</button>
                  </div>
               </div>
            ) : protocolStage === 1 ? (
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] space-y-8 shadow-2xl text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 border-t-gold animate-spin"></div>
                  <p className="text-[10px] text-gold font-black uppercase tracking-[0.5em] animate-pulse">Syncing Grid Nodes...</p>
               </div>
            ) : (
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] space-y-8 shadow-2xl text-center">
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                     <CheckCheck size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tighter text-white">Protocol Manifested</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Bridging success...</p>
                  </div>
               </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes scanLine { 0% { top: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
    </div>
  );
};

export default Scanner;
