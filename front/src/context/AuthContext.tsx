import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, isBandRole } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isBand: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authPromptReason?: string;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register', reason?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, promptReason?: string) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authPromptReason, setAuthPromptReason] = useState<string | undefined>();

  useEffect(() => {
    const savedToken = localStorage.getItem('@palcolivre:token');
    if (!savedToken || savedToken === 'mock-jwt-token') {
      localStorage.removeItem('@palcolivre:user');
      localStorage.removeItem('@palcolivre:token');
      setIsLoading(false);
      return;
    }

    ApiService.getCurrentUser()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('@palcolivre:user', JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('@palcolivre:user');
        localStorage.removeItem('@palcolivre:token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await ApiService.login({ email, password: pass });
    setUser(res.data.user);
    localStorage.setItem('@palcolivre:user', JSON.stringify(res.data.user));
    localStorage.setItem('@palcolivre:token', res.data.token);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, pass: string, role: string) => {
    const res = await ApiService.register({ name, email, password: pass, role });
    setUser(res.data.user);
    localStorage.setItem('@palcolivre:user', JSON.stringify(res.data.user));
    localStorage.setItem('@palcolivre:token', res.data.token);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@palcolivre:user');
    localStorage.removeItem('@palcolivre:token');
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login', reason?: string) => {
    setAuthModalMode(mode);
    setAuthPromptReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptReason(undefined);
  };

  /**
   * Regra de Engajamento PalcoLivre:
   * Se logado, executa a ação. Se visitante, interrompe e abre o modal convidando a entrar.
   */
  const requireAuth = (action: () => void, promptReason = 'Crie sua conta para curtir, salvar playlists e apoiar a cena independente!') => {
    if (user) {
      action();
    } else {
      openAuthModal('register', promptReason);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isBand: isBandRole(user?.role),
        isLoading,
        isAuthModalOpen,
        authModalMode,
        authPromptReason,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
