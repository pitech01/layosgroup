import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type UserRole = 'student' | 'instructor' | 'admin' | null;

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    userRole: UserRole;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUserInfo: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [userRole, setUserRole] = useState<UserRole>(() => {
        return (localStorage.getItem('userRole') as UserRole) || null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    const login = (user: User, token: string) => {
        setUser(user);
        setUserRole(user.role as UserRole);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
    };

    const updateUserInfo = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, userRole, isAuthenticated, login, logout, updateUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
