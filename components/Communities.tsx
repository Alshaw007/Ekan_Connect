
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCommunity, setNewCommunity] = useState<{
    name: string;
    description: string;
    category: string;
    type: 'public' | 'private';
    managedByPilot: boolean;
  }>({ 
    name: '', 
    description: '', 
    category: 'General', 
    type: 'public', 
    managedByPilot: false 
  });

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

  const handleJoin = async (communityId: string) => {
    if (!auth.currentUser) return;
    try {
      const ref = doc(db, 'communities', communityId);
      await updateDoc(ref, {
        members: arrayUnion(auth.currentUser.uid)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `communities/${communityId}`);
    }
  };

  const handleLeave = async (communityId: string) => {
    if (!auth.currentUser) return;
    try {
      const ref = doc(db, 'communities', communityId);
      await updateDoc(ref, {
        members: arrayRemove(auth.currentUser.uid)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `communities/${communityId}`);
    }
  };

  const handleCreate = async () => {
    if (!auth.currentUser || !newCommunity.name) return;
    try {
      const communityData: Omit<Community, 'id'> = {
        name: newCommunity.name,
        description: newCommunity.description,
        category: newCommunity.category,
        type: newCommunity.type,
        avatar: `https://picsum.photos/seed/${newCommunity.name}/200/200`,
        members: [auth.currentUser.uid],
        admins: [auth.currentUser.uid],
        createdAt: new Date().toISOString(),
        managedByPilot: newCommunity.managedByPilot
      };
      await addDoc(collection(db, 'communities'), communityData);
      setShowCreate(false);
      setNewCommunity({ name: '', description: '', category: 'General', type: 'public', managedByPilot: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'communities');
    }
  };

  const handlePilotGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = "Generate a unique and trending community name, description (max 100 chars), and category (one of: Tech, Art, Music, Business, Culture, General) for a global social platform. Return as JSON: { name, description, category }";
      const response = await EKANPilotService.getResponse(prompt, profile || undefined);
      
      // Basic JSON extraction from response text
      const jsonMatch = response.match(/\{.*\}/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setNewCommunity({
          ...newCommunity,
          name: data.name,
          description: data.description,
          category: data.category,
          managedByPilot: true
        });
      }
    } catch (error) {
      console.error("Pilot generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (auth.currentUser && c.members.includes(auth.currentUser.uid));
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-1000 pb-28 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Communities</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Connect with the Global Grid</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className={`p-4 rounded-2xl bg-gradient-to-br ${EKAN_GRADIENT_CSS} text-black shadow-2xl hover:scale-105 active:scale-95 transition-all`}
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search communities, topics, tribes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-4 pl-14 pr-8 text-sm font-semibold focus:outline-none focus:border-gold/50 focus:bg-white/[0.06] transition-all placeholder:text-gray-700"
          />
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/10">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
          >
            Discover
          </button>
          <button 
            onClick={() => setActiveTab('my')}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'my' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
          >
            My Tribes
          </button>
        </div>
      </div>

      {/* Community Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCommunities.map((community) => (
          <div key={community.id} className="group relative bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            {community.managedByPilot && (
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-gold/20 text-gold p-2 rounded-xl backdrop-blur-md border border-gold/30">
                  <Sparkles size={16} />
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <img src={community.avatar} className="relative w-20 h-20 rounded-3xl object-cover border-2 border-white/10 group-hover:border-gold/50 transition-all duration-700" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-gold transition-colors">{community.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">{community.category}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold/80">{community.members.length} Members</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
              {community.description}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-white/10 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/50/50`} className="w-full h-full object-cover grayscale" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#050505] bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500">
                  +{community.members.length > 3 ? community.members.length - 3 : 0}
                </div>
              </div>

              {auth.currentUser && community.members.includes(auth.currentUser.uid) ? (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => onStartChat?.(community)}
                    className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
                  >
                    <MessageSquare size={20} />
                  </button>
                  <button 
                    onClick={() => handleLeave(community.id)}
                    className="px-6 py-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Leave
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleJoin(community.id)}
                  className="px-8 py-3.5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-xl"
                >
                  Join Tribe
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Community Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-[0_0_100px_rgba(252,209,22,0.1)]">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Found a Tribe</h2>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handlePilotGenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-gold text-[10px] font-black uppercase tracking-widest hover:bg-gold/20 transition-all disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>Pilot Auto-Gen</span>
                </button>
                <button onClick={() => setShowCreate(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 ml-2">Tribe Name</label>
                <input 
                  type="text" 
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold focus:outline-none focus:border-gold/50 transition-all"
                  placeholder="e.g. Lagos Tech Collective"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 ml-2">Manifesto</label>
                <textarea 
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold focus:outline-none focus:border-gold/50 transition-all h-32 resize-none"
                  placeholder="What is the purpose of this tribe?"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 ml-2">Category</label>
                  <select 
                    value={newCommunity.category}
                    onChange={(e) => setNewCommunity({...newCommunity, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold focus:outline-none focus:border-gold/50 transition-all appearance-none"
                  >
                    <option value="General">General</option>
                    <option value="Tech">Tech</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Business">Business</option>
                    <option value="Culture">Culture</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 ml-2">Privacy</label>
                  <select 
                    value={newCommunity.type}
                    onChange={(e) => setNewCommunity({...newCommunity, type: e.target.value as 'public' | 'private'})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold focus:outline-none focus:border-gold/50 transition-all appearance-none"
                  >
                    <option value="public">Public Grid</option>
                    <option value="private">Private Node</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCreate}
              className={`w-full py-6 bg-gradient-to-r ${EKAN_GRADIENT_CSS} rounded-2xl text-black font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all`}
            >
              Initialize Tribe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;
