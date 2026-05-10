import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  home_city?: string;
  photo_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  login: () => {}, 
  logout: () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('traveloop_token');
      if (token) {
        try {
          const { data } = await authApi.me();
          setUser(data);
        } catch (err) {
          localStorage.removeItem('traveloop_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    if (!token || token === 'undefined' || token === 'null') {
      console.error("Invalid token received:", token);
      return;
    }
    localStorage.setItem('traveloop_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('traveloop_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
