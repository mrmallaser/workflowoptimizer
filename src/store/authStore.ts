import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Set up auth state listener
  onAuthStateChanged(auth, (user) => {
    set({ user, loading: false });
  });

  return {
    user: null,
    loading: true,
    error: null,
    signUp: async (email: string, password: string) => {
      try {
        set({ loading: true, error: null });
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        set({ user: userCredential.user });
        toast.success('Account created! Please check your email to verify your account');
      } catch (error: any) {
        const errorMessage = error.message.replace('Firebase: ', '');
        set({ error: errorMessage });
        toast.error(errorMessage);
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    signIn: async (email: string, password: string) => {
      try {
        set({ loading: true, error: null });
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          await firebaseSignOut(auth);
          throw new Error('Please verify your email before signing in');
        }
        set({ user: userCredential.user });
        toast.success('Successfully signed in!');
      } catch (error: any) {
        const errorMessage = error.message.replace('Firebase: ', '');
        set({ error: errorMessage });
        toast.error(errorMessage);
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    signOut: async () => {
      try {
        set({ loading: true });
        await firebaseSignOut(auth);
        set({ user: null });
        toast.success('Successfully signed out');
      } catch (error: any) {
        const errorMessage = error.message.replace('Firebase: ', '');
        set({ error: errorMessage });
        toast.error(errorMessage);
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    setUser: (user) => set({ user }),
  };
});