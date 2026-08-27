import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';

// Standard Firebase Configuration
// Environment variables override these if provided in .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAN_E57hpNEZIR73SvUsu6SEzb7NduHd9I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pathwise-27748.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pathwise-27748",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pathwise-27748.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "174923823762",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:174923823762:web:2a7c36eb96c3f9ae2b444b"
};

// Initialize Firebase singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * 1-Click Sign In with Google via Firebase OAuth Popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    return {
      user,
      idToken,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoURL,
      uid: user.uid
    };
  } catch (error: any) {
    console.error('Firebase Google Sign-In error:', error);
    throw error;
  }
}

export { 
  app, 
  auth, 
  googleProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  type FirebaseUser 
};
