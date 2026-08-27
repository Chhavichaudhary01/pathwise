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
// Users can provide these in frontend/.env (VITE_FIREBASE_API_KEY, etc.)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo-PathWise-MockKeyForOAuth",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pathwise-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pathwise-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pathwise-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "103948572019",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:103948572019:web:a938d9f10928374a"
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
