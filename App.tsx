
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Feed from './components/Feed';
import Chat from './components/Chat';
import Gathering from './components/Gathering';
import Wallet from './components/Wallet';
import Pilot from './components/Pilot';
import Profile from './components/Profile';
import Scanner from './components/Scanner';
import Utilities from './components/Utilities';
import Communities from './components/Communities';
import Stories from './components/Stories';
import VoiceRooms from './components/VoiceRooms';
import LiveStream from './components/LiveStream';
import Auth from './components/Auth';
import { FirebaseProvider, useFirebase, ErrorBoundary } from './components/FirebaseProvider';
import { Module, User as UserType, UserProfile, Post, Message, Community } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, setDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';

const INITIAL_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  handle: '',
  avatar: 'https://picsum.photos/seed/ekan_user/200/200',
  location: 'Syncing Node...',
  bio: 'Digital Native on the Pan-African Grid.',
  interests: [],
  balance: 0.00,
  joinedAt: new Date().toISOString(),
  isVerified: true,
  trustScore: 99,
  role: 'user'
};

const AppContent: React.FC = () => {
  const { user: authUser, profile, loading, isAuthReady } = useFirebase();
  const [activeModule, setActiveModule] = useState<Module>('feed');
  const [activeChatPartner, setActiveChatPartner] = useState<UserType | Community | null>(null);

  // Real-time Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<UserType[]>([]);

  // Sync Posts from Firestore
  useEffect(() => {
    if (!isAuthReady || !authUser) return;

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Post));
      setPosts(fetchedPosts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, [isAuthReady, authUser]);

  // Sync Friends (Users) from Firestore
  useEffect(() => {
    if (!isAuthReady || !authUser) return;

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as UserType))
        .filter(u => u.id !== authUser.uid);
      setFriends(fetchedUsers);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, [isAuthReady, authUser]);

  const handleOnboardingComplete = async (data: { 
    name: string; 
    email: string; 
    interests: string[]; 
    location: string;
    nativeLanguage: string;
    learningLanguages: string[];
  }) => {
    if (!authUser) return;

    const newUser: UserProfile = {
      ...INITIAL_USER,
      id: authUser.uid,
      name: data.name,
      email: data.email,
      location: data.location,
      handle: `@${data.name.toLowerCase().replace(/\s+/g, '_')}`,
      interests: data.interests,
      nativeLanguage: data.nativeLanguage,
      learningLanguages: data.learningLanguages,
      following: [],
      followers: [],
      balance: 5000.00, // Production Promo Credit for New Node Launch
      joinedAt: new Date().toISOString(),
      role: 'user'
    };

    try {
      await setDoc(doc(db, 'users', authUser.uid), newUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${authUser.uid}`);
    }
  };

  const toggleFollow = async (targetUid: string) => {
    if (!profile || !authUser) return;

    const isFollowing = profile.following?.includes(targetUid);
    const userRef = doc(db, 'users', authUser.uid);
    const targetRef = doc(db, 'users', targetUid);

    try {
      if (isFollowing) {
        await updateDoc(userRef, {
          following: arrayRemove(targetUid)
        });
        await updateDoc(targetRef, {
          followers: arrayRemove(authUser.uid)
        });
      } else {
        await updateDoc(userRef, {
          following: arrayUnion(targetUid)
        });
        await updateDoc(targetRef, {
          followers: arrayUnion(authUser.uid)
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${authUser.uid}`);
    }
  };

  const updateBalance = async (amount: number, description?: string) => {
    if (!authUser || !profile) return;
    try {
      const newBalance = Math.max(0, profile.balance + amount);
      await updateDoc(doc(db, 'users', authUser.uid), { balance: newBalance });
      
      // Record transaction
      await addDoc(collection(db, 'users', authUser.uid, 'transactions'), {
        id: Date.now().toString(),
        userId: authUser.uid,
        amount: Math.abs(amount),
        type: amount > 0 ? 'inbound' : 'outbound',
        description: description || (amount > 0 ? 'Grid Reward' : 'Grid Payment'),
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${authUser.uid}`);
    }
  };

  const handleAddPost = async (content: string) => {
    if (!authUser || !profile) return;
    const newPost: Omit<Post, 'id'> = {
      authorId: authUser.uid,
      authorName: profile.name,
      content,
      thumbnail: `https://picsum.photos/seed/${Math.random()}/1200/800`,
      likes: 0,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'posts'), newPost);
      // Reward for active grid manifestation
      await updateBalance(5.00);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const handleAddFriend = async (friend: UserType) => {
    if (!authUser || !profile) return;
    try {
      // For now, we'll just record the connection in a subcollection
      await setDoc(doc(db, 'users', authUser.uid, 'friends', friend.id), friend);
      // Also add current user to friend's list
      await setDoc(doc(db, 'users', friend.id, 'friends', authUser.uid), {
        id: authUser.uid,
        name: profile.name,
        avatar: profile.avatar,
        location: profile.location
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${authUser.uid}/friends/${friend.id}`);
    }
  };

  const handleSendMessage = async (threadId: string, msg: Message) => {
    if (!authUser) return;
    try {
      await addDoc(collection(db, 'chats', threadId, 'messages'), msg);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${threadId}/messages`);
    }
  };

  const handleBlockUser = async (targetUid: string) => {
    if (!profile || !authUser) return;
    try {
      await updateDoc(doc(db, 'users', authUser.uid), {
        blockedUsers: arrayUnion(targetUid)
      });
      // Also unfollow if following
      if (profile.following?.includes(targetUid)) {
        await toggleFollow(targetUid);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${authUser.uid}`);
    }
  };

  const renderModule = () => {
    if (!profile) return null;

    switch (activeModule) {
      case 'feed':
        return (
          <Feed 
            externalPosts={posts} 
            onAddPost={handleAddPost} 
            onToggleFollow={toggleFollow} 
            onBlockUser={handleBlockUser}
          />
        );
      case 'chat':
        return (
          <Chat 
            activePartner={activeChatPartner} 
            onUpdateBalance={updateBalance}
          />
        );
      case 'gathering':
        return (
          <Gathering 
            users={friends}
            onStartChat={(partner) => { setActiveChatPartner(partner); setActiveModule('chat'); }} 
          />
        );
      case 'wallet':
        return <Wallet balance={profile.balance} onAddFunds={updateBalance} />;
      case 'utilities':
        return <Utilities balance={profile.balance} onProcessPayment={(amt, desc) => updateBalance(-amt, desc)} />;
      case 'communities':
        return <Communities onStartChat={(partner) => { setActiveChatPartner(partner); setActiveModule('chat'); }} />;
      case 'stories':
        return <Stories />;
      case 'voice':
        return <VoiceRooms profile={profile} />;
      case 'live':
        return <LiveStream profile={profile} />;
      case 'pilot':
        return <Pilot />;
      case 'profile':
        return (
          <Profile 
            user={profile} 
            posts={posts.filter(p => p.authorId === authUser.uid)}
            onLogout={() => auth.signOut()} 
          />
        );
      case 'scanner':
        return (
          <Scanner 
            onAddFriend={handleAddFriend} 
            onProcessPayment={(amt) => updateBalance(-amt)} 
          />
        );
      default:
        return (
          <Feed 
            externalPosts={posts} 
            onAddPost={handleAddPost} 
            onToggleFollow={toggleFollow}
            onBlockUser={handleBlockUser}
          />
        );
    }
  };

  useEffect(() => {
    if (!profile?.theme) return;
    const root = window.document.documentElement;
    if (profile.theme === 'dark') {
      root.classList.add('dark');
    } else if (profile.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [profile?.theme]);

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_30px_rgba(252,209,22,0.3)]"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-600">Synchronizing Grid Node...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!authUser || !profile ? (
        <Auth onComplete={handleOnboardingComplete} />
      ) : (
        <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
          <div className="max-w-5xl mx-auto h-full border-x border-white/5 bg-[#050505]/60 backdrop-blur-[80px] shadow-[0_50px_150px_rgba(0,0,0,1)] relative overflow-hidden">
            {renderModule()}
            {/* Real-time Grid Status HUD */}
            <div className="absolute top-8 right-10 pointer-events-none z-[100] hidden lg:block">
              <div className="bg-black/60 border border-white/10 backdrop-blur-3xl px-6 py-3 rounded-full flex items-center space-x-4 shadow-3xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Grid Active</span>
                </div>
                <div className="h-4 w-[1px] bg-white/10"></div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{profile.location.split(',')[0]} NODE</span>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  </ErrorBoundary>
);

export default App;
