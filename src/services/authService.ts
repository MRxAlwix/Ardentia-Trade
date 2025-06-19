import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
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
  // Register new user with improved error handling
  async register(email: string, password: string, username: string, adminKey?: string): Promise<User> {
    try {
      // Validate inputs
      if (!email || !password || !username) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      // Check if username contains only valid characters
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: username
      });
      
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
      console.error('Registration error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection');
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login user with improved error handling
  async login(email: string, password: string): Promise<User> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        // Create default user document if it doesn't exist
        const defaultUserData: User = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          balance: 10000,
          role: 'player',
          rank: 'Member',
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), defaultUserData);
        return defaultUserData;
      }

      const userData = userDoc.data() as User;

      // Update last login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLogin: Date.now()
      });

      return { ...userData, lastLogin: Date.now() };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  },

  // Get current user data
  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        // Create default user document if it doesn't exist
        const defaultUserData: User = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          balance: 10000,
          role: 'player',
          rank: 'Member',
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), defaultUserData);
        return defaultUserData;
      }

      return userDoc.data() as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Listen to auth state changes with better error handling
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data() as User);
          } else {
            // Create default user document if it doesn't exist
            console.log('Creating default user document for authenticated user');
            const defaultUserData: User = {
              id: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              balance: 10000,
              role: 'player',
              rank: 'Member',
              createdAt: Date.now(),
              lastLogin: Date.now()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), defaultUserData);
            callback(defaultUserData);
          }
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        callback(null);
      }
    });
  },

  // Update user balance (for internal use)
  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        balance: newBalance
      });
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw new Error('Failed to update balance');
    }
  }
};