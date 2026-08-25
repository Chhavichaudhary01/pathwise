import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    roles?: string[];
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
    login: (accessToken: string, refreshToken: string, user: User) => void;
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
    if (!token || token === 'demo-access-token') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        return false;
    }
    return true;
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
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        set({ user: null, isAuthenticated: false });
    },
}));
