import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, removeToken, saveToken, registerAuthFailureHandler, apiGet } from '../api/client';
import { loadHistory, clearMemoryHistory } from '../store/historyStore';

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

async function fetchProfile(): Promise<{ isAdmin: boolean; email: string | null }> {
  try {
    const profile = await apiGet<{ role: string; email: string }>('/api/users/me');
    return { isAdmin: profile.role === 'ADMIN', email: profile.email };
  } catch {
    return { isAdmin: false, email: null };
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken().then(async (t) => {
      setToken(t);
      if (t) {
        const { isAdmin: admin, email } = await fetchProfile();
        setIsAdmin(admin);
        if (email) await loadHistory(email);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const signIn = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
    const { isAdmin: admin, email } = await fetchProfile();
    setIsAdmin(admin);
    if (email) await loadHistory(email);
  };

  const signOut = async () => {
    clearMemoryHistory();
    await removeToken();
    setToken(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    registerAuthFailureHandler(() => { signOut(); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
