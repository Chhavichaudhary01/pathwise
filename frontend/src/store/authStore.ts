import { create } from 'zustand';
import api from '@/lib/api';
import { signInWithGoogle, signOut, auth } from '@/lib/firebase';

interface User {
    id: string;
    email: string;
    photoUrl?: string;
    roles?: string[];
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
    login: (accessToken: string, refreshToken: string, user: User) => void;
    loginWithGoogle: () => Promise<{ isProfileComplete: boolean }>;
    loginDemo: () => Promise<void>;
    logout: () => void;
}

const getInitialUser = (): User | null => {
    try {
        const storedUser = localStorage.getItem('authUser');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
};

const getInitialAuth = (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: getInitialUser(),
    isAuthenticated: getInitialAuth(),
    setUser: (user) => {
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('authUser');
        }
        set({ user });
    },
    login: (accessToken, refreshToken, user) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('authUser', JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },
    loginWithGoogle: async () => {
        try {
            const { idToken, email, displayName, photoUrl, uid } = await signInWithGoogle();
            const res = await api.post('/auth/firebase', {
                email,
                displayName,
                photoUrl,
                idToken,
                uid
            });
            const { accessToken, refreshToken, id, email: userEmail, isProfileComplete } = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            const userObj: User = { 
                id, 
                email: userEmail || email || 'Learner',
                photoUrl: photoUrl || undefined
            };
            localStorage.setItem('authUser', JSON.stringify(userObj));
            set({ user: userObj, isAuthenticated: true });
            return { isProfileComplete: Boolean(isProfileComplete) };
        } catch (err: any) {
            console.error('Google Sign-In failed:', err);
            throw err;
        }
    },
    loginDemo: async () => {
        try {
            const res = await api.post('/auth/demo');
            const { accessToken, refreshToken, id, email } = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            const demoUser = { id, email: email || 'demo@pathwise.io' };
            localStorage.setItem('authUser', JSON.stringify(demoUser));
            set({ user: demoUser, isAuthenticated: true });
        } catch {
            const fallbackUser = { id: 'demo-user-id', email: 'demo@pathwise.io' };
            localStorage.setItem('accessToken', 'demo-token');
            localStorage.setItem('authUser', JSON.stringify(fallbackUser));
            set({ user: fallbackUser, isAuthenticated: true });
        }
    },
    logout: () => {
        signOut(auth).catch(() => {});
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        set({ user: null, isAuthenticated: false });
    },
}));
