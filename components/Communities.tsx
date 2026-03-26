
import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, ShieldCheck, Sparkles, ChevronRight, MessageSquare, Loader2 } from './Icons';
import { Community, User as UserType } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useFirebase } from './FirebaseProvider';
import { EKAN_GRADIENT_CSS } from '../constants';
import { EKANPilotService } from '../services/gemini';

interface CommunitiesProps {
  onStartChat?: (community: Community) => void;
}

const Communities: React.FC<CommunitiesProps> = ({ onStartChat }) => {
  const { profile } = useFirebase();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const communitiesRef = collection(db, 'communities');
    const unsubscribe = onSnapshot(communitiesRef, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Community));
      setCommunities(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'communities');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] animate-in fade-in duration-500 overflow-y-auto scrollbar-hide">
      {/* Header Section */}
      <div className="px-4 py-6 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-100 dark:bg-[#202c33] rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-[#e9edef]">New Community</h2>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="p-2 text-brand-green hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
        
        <div className="bg-slate-50 dark:bg-[#202c33] p-4 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Communities bring members together in topic-based groups, and make it easy to get admin announcements. Any community you're added to will appear here.
          </p>
          <button className="mt-3 text-brand-green text-sm font-semibold hover:underline flex items-center">
            See example communities <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Community List */}
      <div className="flex-1">
        {communities.map((community) => (
          <div key={community.id} className="border-b border-slate-100 dark:border-slate-800/50">
            <button 
              className="w-full flex items-center px-4 py-4 hover:bg-slate-50 dark:hover:bg-[#202c33] transition-colors"
              onClick={() => onStartChat?.(community)}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                <img src={community.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 ml-4 text-left">
                <h3 className="font-bold text-[16px] text-slate-900 dark:text-[#e9edef]">{community.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{community.description}</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </button>
            
            {/* Announcement Group (Mock) */}
            <div className="pl-16 pr-4 py-3 flex items-center space-x-4 hover:bg-slate-50 dark:hover:bg-[#202c33] cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center">
                <MessageSquare size={18} />
              </div>
              <div className="flex-1 border-b border-slate-100 dark:border-slate-800/50 pb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-[#e9edef]">Announcements</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Welcome to the community!</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Communities;
