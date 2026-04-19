import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/services';

export interface User {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
  careerScore?: number;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dt_token');
    if (token) {
      authAPI.getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem('dt_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('dt_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('dt_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('dt_token');
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
