/**
 * Configuration centralisée pour tous les services API
 * Gère les URLs de base, timeout, retry, etc.
 */

export const API_CONFIG = {
  // URLs de base
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // Configuration des timeouts
  TIMEOUT: {
    DEFAULT: 30000, // 30 secondes
    UPLOAD: 120000, // 2 minutes pour les uploads
    ML_PREDICTION: 60000, // 1 minute pour les prédictions ML
  },

  // Configuration des retries
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 seconde
    BACKOFF_MULTIPLIER: 2,
  },

  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Endpoints
  ENDPOINTS: {
    // ML/Prédiction
    ML: {
      HEALTH: '/health',
      PREDICT: '/predict',
      BATCH_PREDICT: '/batch_predict',
      ENCODERS: '/encoders',
    },
    
    // Auth (via Supabase)
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
    },

    // Utilisateurs
    USERS: {
      LIST: '/users',
      DETAILS: '/users/:id',
      CREATE: '/users',
      UPDATE: '/users/:id',
      DELETE: '/users/:id',
    },

    // CSV/Data
    DATA: {
      UPLOAD: '/data/upload',
      HISTORY: '/data/history',
      EXPORT: '/data/export',
    },

    // Administration
    ADMIN: {
      STATS: '/admin/stats',
      LOGS: '/admin/logs',
      SETTINGS: '/admin/settings',
    },
  },
} as const;

/**
 * Configuration spécifique par environnement
 */
export const getEnvironmentConfig = () => {
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return {
        LOG_LEVEL: 'debug',
        CACHE_ENABLED: true,
        MOCK_API: false,
      };
    
    case 'staging':
      return {
        LOG_LEVEL: 'info',
        CACHE_ENABLED: true,
        MOCK_API: false,
      };
    
    case 'production':
      return {
        LOG_LEVEL: 'error',
        CACHE_ENABLED: true,
        MOCK_API: false,
      };
    
    default:
      return {
        LOG_LEVEL: 'debug',
        CACHE_ENABLED: false,
        MOCK_API: true,
      };
  }
};