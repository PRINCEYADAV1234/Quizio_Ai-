import { create } from 'zustand';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';

interface UserProfile {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
}

interface UserAnalytics {
  totalQuizzes: number;
  averageScore: number;
  studyTime: number;
  streak: number;
  weakTopics: string[];
}

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  analytics: UserAnalytics | null;
  loading: boolean;
  token: string | null;
  setUser: (user: FirebaseUser | null) => void;
  syncWithBackend: (token: string, firebaseUser: FirebaseUser, customName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  analytics: null,
  loading: true,
  token: null,

  setUser: (user) => set({ user }),

  syncWithBackend: async (token, firebaseUser, customName) => {
    try {
      // 1. Sync User to DB
      const syncRes = await axios.post(
        `${BACKEND_URL}/api/users/sync`,
        {
          name: customName || firebaseUser.displayName || 'Quizio Scholar',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
          provider: firebaseUser.providerData[0]?.providerId || 'email',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 2. Fetch User Profile and Analytics
      const profileRes = await axios.get(`${BACKEND_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        profile: profileRes.data.user,
        analytics: profileRes.data.analytics,
        token,
      });
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
    }
  },

  logout: async () => {
    await auth.signOut();
    set({ user: null, profile: null, analytics: null, token: null });
  },
}));

// Set up Auth state observer
onAuthStateChanged(auth, async (firebaseUser) => {
  useAuthStore.setState({ loading: true });
  if (firebaseUser) {
    const token = await firebaseUser.getIdToken();
    useAuthStore.setState({ user: firebaseUser, token });
    await useAuthStore.getState().syncWithBackend(token, firebaseUser);
  } else {
    useAuthStore.setState({ user: null, profile: null, analytics: null, token: null });
  }
  useAuthStore.setState({ loading: false });
});
