import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

const ADMIN_KEY = 'ARDENTIA_ADMIN_2024_SECURE_KEY';

export const authService = {
  // Register new user
  async register(email: string, password: string, username: string, adminKey?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const role = adminKey === ADMIN_KEY ? 'admin' : 'player';
      const rank = role === 'admin' ? 'Server Owner' : 'Member';
      
      const userData: User = {
        id: firebaseUser.uid,
        username,
        email,
        balance: role === 'admin' ? 1000000 : 10000, // Admin gets more starting balance
        role,
        rank,
        createdAt: Date.now(),
        lastLogin: Date.now()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Login user
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update last login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLogin: Date.now()
      });

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get current user data
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as User;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};