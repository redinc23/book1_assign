import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ user: AuthUser | null }>('/auth/me')
      .then(({ user }) => setUser(user))
      .catch((err) => {
        console.error('Failed to get session:', err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { user } = await api.post<{ user: AuthUser }>('/auth/signup', { email, password });
      setUser(user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await api.post<{ user: AuthUser }>('/auth/signin', { email, password });
      setUser(user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' };
    }
  };

  const signOut = async () => {
    await api.post('/auth/signout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
