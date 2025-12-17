/**
 * Hook React pour l'authentification
 * Utilise le nouveau service d'authentification refactorisé
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../../core/services/auth.service';
import { ApiError } from '../../core/api/client';
import type { 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  User, 
  UserRole 
} from '../../core/types';

interface UseAuthReturn extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // Helpers
  hasPermission: (role: UserRole) => boolean;
  isRole: (role: UserRole) => boolean;
  
  // États des opérations
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  isResettingPassword: boolean;
  isUpdatingProfile: boolean;
}

export const useAuth = (): UseAuthReturn => {
  // État principal de l'authentification
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // États des opérations spécifiques
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  /**
   * Initialisation et souscription aux changements d'auth
   */
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        // Initialiser le service
        await authService.initialize();

        // S'abonner aux changements
        unsubscribe = authService.subscribe((newAuthState) => {
          setAuthState(newAuthState);
        });

      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur initialisation auth'
        }));
      }
    };

    initAuth();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Connexion
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setIsLoggingIn(true);
    setAuthState(prev => ({ ...prev, error: null }));

    try {
      await authService.login(credentials);
      // L'état sera mis à jour via la souscription
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur lors de la connexion';
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  /**
   * Inscription
   */
  const register = useCallback(async (userData: RegisterData): Promise<void> => {
    setIsRegistering(true);
    setAuthState(prev => ({ ...prev, error: null }));

    try {
      await authService.register(userData);
      // L'état sera mis à jour via la souscription
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur lors de l\'inscription';
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      throw error;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  /**
   * Déconnexion
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoggingOut(true);
    setAuthState(prev => ({ ...prev, error: null }));

    try {
      await authService.logout();
      // L'état sera mis à jour via la souscription
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur lors de la déconnexion';
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  /**
   * Réinitialisation de mot de passe
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setIsResettingPassword(true);
    setAuthState(prev => ({ ...prev, error: null }));

    try {
      await authService.resetPassword(email);
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur lors de la réinitialisation';
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      throw error;
    } finally {
      setIsResettingPassword(false);
    }
  }, []);

  /**
   * Mise à jour du profil
   */
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<void> => {
    setIsUpdatingProfile(true);
    setAuthState(prev => ({ ...prev, error: null }));

    try {
      await authService.updateProfile(updates);
      // L'état sera mis à jour via la souscription
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur mise à jour profil';
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      throw error;
    } finally {
      setIsUpdatingProfile(false);
    }
  }, []);

  /**
   * Vérifier les permissions
   */
  const hasPermission = useCallback((requiredRole: UserRole): boolean => {
    return authService.hasPermission(requiredRole);
  }, []);

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  const isRole = useCallback((role: UserRole): boolean => {
    return authState.user?.role === role;
  }, [authState.user?.role]);

  return {
    // État d'authentification
    ...authState,
    
    // Actions
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    
    // Helpers
    hasPermission,
    isRole,
    
    // États des opérations
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    isResettingPassword,
    isUpdatingProfile
  };
};

/**
 * Hook pour vérifier si l'utilisateur est connecté
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

/**
 * Hook pour obtenir l'utilisateur actuel
 */
export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

/**
 * Hook pour vérifier les permissions
 */
export const usePermissions = () => {
  const { hasPermission, isRole, user } = useAuth();

  return {
    hasPermission,
    isRole,
    canViewAdminPanel: hasPermission('admin'),
    canManageUsers: hasPermission('admin'),
    canEditProfiles: hasPermission('agent'),
    canViewReports: hasPermission('analyst'),
    isAdmin: isRole('admin') || isRole('super_admin'),
    isSuperAdmin: isRole('super_admin'),
    currentRole: user?.role || 'viewer'
  };
};