import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type UserRole = 'student' | 'instructor' | 'admin' | null;

interface AuthContextType {
    userRole: UserRole;
    isAuthenticated: boolean;
    login: (role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userRole, setUserRole] = useState<UserRole>(() => {
        return (localStorage.getItem('userRole') as UserRole) || null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    const login = (role: UserRole) => {
        setUserRole(role);
        setIsAuthenticated(true);
        localStorage.setItem('userRole', role || '');
        localStorage.setItem('isAuthenticated', 'true');
    };

    const logout = () => {
        setUserRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
    };

    return (
        <AuthContext.Provider value={{ userRole, isAuthenticated, login, logout }}>
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
