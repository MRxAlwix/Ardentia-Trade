import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyAihdmcxTJKV_GORo2VC6YtVgd-Vve85l8",
  authDomain: "ardentia-exchange.firebaseapp.com",
  projectId: "ardentia-exchange",
  storageBucket: "ardentia-exchange.firebasestorage.app",
  messagingSenderId: "912304483201",
  appId: "1:912304483201:web:a1d60382c8552ca9299680"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;