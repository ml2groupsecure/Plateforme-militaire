/**
 * Service d'authentification refactorisé
 * Utilise Supabase et la nouvelle architecture HTTP
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, AuthSession, User as SupabaseUser } from '@supabase/supabase-js';
import { apiClient, ApiError } from '../api/client';
import { API_CONFIG } from '../api/config';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthState, 
  UserRole 
} from '../types';

export class AuthService {
  private static instance: AuthService;
  private supabase: SupabaseClient;
  private currentUser: User | null = null;
  private listeners: ((authState: AuthState) => void)[] = [];

  private constructor() {
    this.supabase = createClient(
      API_CONFIG.SUPABASE_URL,
      API_CONFIG.SUPABASE_ANON_KEY
    );

    // Écoute des changements d'auth
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(event, session);
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Gestion des changements d'état d'authentification
   */
  private async handleAuthStateChange(event: string, session: AuthSession | null) {
    console.log('🔐 Auth state change:', event, session?.user?.id);

    if (session?.user) {
      // Récupérer les données utilisateur complètes
      await this.loadUserProfile(session.user);
      
      // Configurer le token pour les autres services
      if (session.access_token) {
        apiClient.setAuthToken(session.access_token);
      }
    } else {
      this.currentUser = null;
      apiClient.removeAuthToken();
    }

    // Notifier les listeners
    this.notifyListeners();
  }

  /**
   * Charger le profil utilisateur complet
   */
  private async loadUserProfile(supabaseUser: SupabaseUser): Promise<void> {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // Construire l'objet User
      this.currentUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: profile?.username || supabaseUser.email?.split('@')[0] || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        role: profile?.role || 'viewer',
        avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
        is_active: profile?.is_active !== false,
        last_login: new Date().toISOString(),
        preferences: profile?.preferences || {
          theme: 'light',
          language: 'fr',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          dashboard: {
            layout: 'grid',
            widgets: []
          }
        },
        created_at: profile?.created_at || supabaseUser.created_at,
        updated_at: profile?.updated_at || new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur chargement profil:', error);
      
      // Créer un utilisateur basique si le profil n'existe pas
      this.currentUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: supabaseUser.email?.split('@')[0] || '',
        first_name: '',
        last_name: '',
        role: 'viewer',
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        is_active: true,
        last_login: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'fr',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          dashboard: {
            layout: 'grid',
            widgets: []
          }
        },
        created_at: supabaseUser.created_at,
        updated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Connexion avec email/mot de passe
   */
  public async login(credentials: LoginCredentials): Promise<User> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw new ApiError(
          this.getErrorMessage(error.message),
          400,
          error.name
        );
      }

      if (!data.user) {
        throw new ApiError('Erreur lors de la connexion', 400);
      }

      // L'utilisateur sera chargé automatiquement via onAuthStateChange
      return this.currentUser!;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur lors de la connexion', 500, 'AUTH_ERROR', error);
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  public async register(userData: RegisterData): Promise<User> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            first_name: userData.first_name,
            last_name: userData.last_name
          }
        }
      });

      if (error) {
        throw new ApiError(
          this.getErrorMessage(error.message),
          400,
          error.name
        );
      }

      if (!data.user) {
        throw new ApiError('Erreur lors de l\'inscription', 400);
      }

      // Créer le profil utilisateur
      if (data.session) {
        await this.createUserProfile(data.user.id, userData);
      }

      return this.currentUser!;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur lors de l\'inscription', 500, 'AUTH_ERROR', error);
    }
  }

  /**
   * Créer le profil utilisateur dans la base
   */
  private async createUserProfile(userId: string, userData: RegisterData): Promise<void> {
    try {
      const { error } = await this.supabase.from('profiles').insert({
        id: userId,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: 'viewer', // Rôle par défaut
        is_active: true,
        preferences: {
          theme: 'light',
          language: 'fr',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          dashboard: {
            layout: 'grid',
            widgets: []
          }
        }
      });

      if (error) {
        console.error('Erreur création profil:', error);
      }
    } catch (error) {
      console.error('Erreur création profil:', error);
    }
  }

  /**
   * Déconnexion
   */
  public async logout(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        throw new ApiError('Erreur lors de la déconnexion', 400);
      }

      // Le nettoyage sera fait via onAuthStateChange
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur lors de la déconnexion', 500, 'AUTH_ERROR', error);
    }
  }

  /**
   * Réinitialisation de mot de passe
   */
  public async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw new ApiError(
          this.getErrorMessage(error.message),
          400
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur lors de la réinitialisation', 500, 'AUTH_ERROR', error);
    }
  }

  /**
   * Mise à jour du profil utilisateur
   */
  public async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw new ApiError('Utilisateur non connecté', 401);
    }

    try {
      // Mise à jour dans Supabase Auth si nécessaire
      if (updates.email && updates.email !== this.currentUser.email) {
        const { error } = await this.supabase.auth.updateUser({
          email: updates.email
        });
        if (error) throw error;
      }

      // Mise à jour dans la table profiles
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          username: updates.username,
          first_name: updates.first_name,
          last_name: updates.last_name,
          avatar_url: updates.avatar_url,
          preferences: updates.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) {
        throw new ApiError('Erreur mise à jour profil', 400);
      }

      // Recharger l'utilisateur
      await this.loadUserProfile({ id: this.currentUser.id } as SupabaseUser);
      this.notifyListeners();

      return this.currentUser!;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur mise à jour profil', 500, 'AUTH_ERROR', error);
    }
  }

  /**
   * Vérification des permissions
   */
  public hasPermission(requiredRole: UserRole): boolean {
    if (!this.currentUser) return false;

    const roleHierarchy: Record<UserRole, number> = {
      'super_admin': 5,
      'admin': 4,
      'agent': 3,
      'analyst': 2,
      'viewer': 1
    };

    const userRoleLevel = roleHierarchy[this.currentUser.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Obtenir l'état d'authentification
   */
  public getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: !!this.currentUser,
      isLoading: false,
      error: null
    };
  }

  /**
   * S'abonner aux changements d'authentification
   */
  public subscribe(listener: (authState: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Envoyer l'état actuel immédiatement
    listener(this.getAuthState());

    // Retourner la fonction de désabonnement
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifier tous les listeners
   */
  private notifyListeners(): void {
    const authState = this.getAuthState();
    this.listeners.forEach(listener => listener(authState));
  }

  /**
   * Traduction des messages d'erreur
   */
  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Email non confirmé',
      'User not found': 'Utilisateur non trouvé',
      'Invalid email': 'Email invalide',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'User already registered': 'Utilisateur déjà enregistré',
      'Signup requires a valid password': 'Inscription nécessite un mot de passe valide'
    };

    return errorMessages[error] || error;
  }

  /**
   * Initialisation du service (à appeler au démarrage de l'app)
   */
  public async initialize(): Promise<void> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        await this.handleAuthStateChange('SIGNED_IN', session);
      }
      
      console.log('🔐 Service d\'authentification initialisé');
    } catch (error) {
      console.error('Erreur initialisation auth:', error);
    }
  }
}

// Export de l'instance singleton
export const authService = AuthService.getInstance();