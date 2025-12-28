import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, type User } from '../services/auth';
import { api } from '../lib/axios';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Clean up axios header
        delete api.defaults.headers.common['Authorization'];
    };

    const login = (token: string) => {
        localStorage.setItem('token', token);
        // Set axios header immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUser();
    };

    const fetchUser = async () => {
        try {
            const userData = await authService.getMe();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ensure header is set before fetching
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
