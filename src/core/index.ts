/**
 * Export centralisé de tous les services, types et utilities
 * Point d'entrée unique pour l'architecture core
 */

// =====================================
// API & CLIENT HTTP
// =====================================
export { apiClient, ApiError, type ApiResponse } from './api/client';
export { API_CONFIG, getEnvironmentConfig } from './api/config';

// =====================================
// SERVICES
// =====================================
export { PredictionService, predictionService } from './services/prediction.service';
export { AuthService, authService } from './services/auth.service';

// =====================================
// TYPES
// =====================================
export type {
  // Types de base
  BaseEntity,
  PaginatedResponse,
  AsyncState,
  FormState,
  DeepPartial,
  Optional,
  RequiredFields,

  // Authentification
  User,
  UserRole,
  UserPreferences,
  AuthState,
  LoginCredentials,
  RegisterData,

  // Machine Learning
  CriminalProfile,
  PredictionResult,
  RiskLevel,
  PredictionHistory,
  MLModel,
  MLEncoders,

  // Données CSV
  CsvUpload,
  UploadStatus,
  ValidationError,
  DataExport,

  // Profilage
  ProfileAnalysis,
  AnalysisType,
  AnalysisStatus,
  AnalysisResults,
  RiskIndicator,
  DataQualityMetrics,

  // Administration
  SystemStats,
  AuditLog,
  LogSeverity,
  SystemSettings,
  SMTPSettings,
  PasswordPolicy,
  SessionSettings,

  // Notifications
  Notification,
  NotificationType,
  NotificationPriority,

  // UI
  ThemeConfig,
  LayoutConfig,
  TableColumn,
  FilterOptions
} from './types';

// =====================================
// HOOKS (imported from shared)
// =====================================
export { 
  usePrediction, 
  usePredictionFieldOptions, 
  usePredictionStats 
} from '../shared/hooks/usePrediction';

export {
  useAuth,
  useIsAuthenticated,
  useCurrentUser,
  usePermissions
} from '../shared/hooks/useAuth';
