import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState({
        isAuthenticated: !!localStorage.getItem('token'),
        role: localStorage.getItem('role') || null
    });

    useEffect(() => {
        const updateUser = () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            setUser({
                isAuthenticated: !!token,
                role: role || null
            });
        };
        window.addEventListener('storage', updateUser);
        return () => window.removeEventListener('storage', updateUser);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await apiClient.post('/api/auth/login', { username, password });
            const { token, role, refreshToken, id } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', id);
            localStorage.setItem('refreshToken', refreshToken);
            setUser({ isAuthenticated: true, role });
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('refreshToken');
        setUser({ isAuthenticated: false, role: null });
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);