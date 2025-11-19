// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { login, getCurrentUser, logout as apiLogout, isAuthenticated } from '../api/auth';
import { LoginResponse, User } from '../types/api';
import { handleApiError } from '../api/client';

// Email especial que ativa modo demo
export const DEMO_USER_EMAIL = 'demo@walletai.app';

/**
 * Verifica se o email é do usuário demo
 */
export function isDemoUser(email?: string | null): boolean {
  return email === DEMO_USER_EMAIL;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        // Token inválido ou expirado
        setUser(null);
        apiLogout();
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setError(null);
      const response = await login(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = () => {
    apiLogout();
    setUser(null);
    setError(null);
  };

  // Verificar se está em modo demo
  const isDemoMode = isDemoUser(user?.email);

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isDemoMode, // Nova flag para verificar modo demo
  };
};

