/**
 * Types centralisés pour toute l'application
 * Organisés par domaine métier
 */

// =====================================
// TYPES DE BASE
// =====================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  errors?: string[];
}

// =====================================
// AUTHENTIFICATION
// =====================================

export interface User extends BaseEntity {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  preferences: UserPreferences;
}

export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'agent' 
  | 'analyst' 
  | 'viewer';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  first_name?: string;
  last_name?: string;
}

// =====================================
// MACHINE LEARNING / PRÉDICTION
// =====================================

export interface CriminalProfile {
  Region_Name: string;
  Age: number;
  Ethnie: string;
  Profession: string;
  Ville_Actuelle: string;
  Type_Crime_Initial: string;
  Plateforme_Principale: string;
}

export interface PredictionResult {
  recidive_probability: number;
  risk_level: RiskLevel;
  confidence: number;
  factors: Record<string, number>;
  metadata?: {
    model_version?: string;
    prediction_time?: string;
    algorithm?: string;
  };
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PredictionHistory extends BaseEntity {
  user_id: string;
  profile: CriminalProfile;
  result: PredictionResult;
  notes?: string;
  session_id?: string;
}

export interface MLModel {
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'training';
  accuracy: number;
  last_trained: string;
  features: string[];
}

export interface MLEncoders {
  [key: string]: Record<string, number>;
}

// =====================================
// DONNÉES / CSV
// =====================================

export interface CsvUpload extends BaseEntity {
  filename: string;
  original_filename: string;
  file_size: number;
  rows_count: number;
  columns: string[];
  status: UploadStatus;
  user_id: string;
  validation_errors?: ValidationError[];
  processed_at?: string;
}

export type UploadStatus = 
  | 'pending'
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface ValidationError {
  row: number;
  column: string;
  error: string;
  value: any;
}

export interface DataExport {
  format: 'csv' | 'json' | 'excel' | 'pdf';
  filters?: Record<string, any>;
  columns?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

// =====================================
// PROFILAGE UTILISATEUR
// =====================================

export interface ProfileAnalysis extends BaseEntity {
  user_id: string;
  analysis_type: AnalysisType;
  data_source: string;
  results: AnalysisResults;
  confidence_score: number;
  status: AnalysisStatus;
}

export type AnalysisType = 
  | 'behavioral' 
  | 'demographic' 
  | 'criminal_history' 
  | 'social_network' 
  | 'digital_footprint';

export type AnalysisStatus = 
  | 'queued' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface AnalysisResults {
  summary: string;
  risk_indicators: RiskIndicator[];
  recommendations: string[];
  data_quality: DataQualityMetrics;
}

export interface RiskIndicator {
  category: string;
  level: RiskLevel;
  description: string;
  weight: number;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
}

// =====================================
// ADMINISTRATION
// =====================================

export interface SystemStats {
  users: {
    total: number;
    active_today: number;
    new_this_month: number;
  };
  predictions: {
    total: number;
    today: number;
    this_month: number;
    accuracy_rate: number;
  };
  uploads: {
    total: number;
    today: number;
    total_size: number;
    processing: number;
  };
  system: {
    uptime: number;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    api_response_time: number;
  };
}

export interface AuditLog extends BaseEntity {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  severity: LogSeverity;
}

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface SystemSettings {
  general: {
    app_name: string;
    maintenance_mode: boolean;
    max_upload_size: number;
    session_timeout: number;
  };
  ml: {
    model_update_frequency: number;
    min_confidence_threshold: number;
    batch_size: number;
  };
  notifications: {
    email_enabled: boolean;
    smtp_settings?: SMTPSettings;
  };
  security: {
    password_policy: PasswordPolicy;
    session_settings: SessionSettings;
  };
}

export interface SMTPSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  use_tls: boolean;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  max_age_days: number;
}

export interface SessionSettings {
  timeout_minutes: number;
  max_concurrent_sessions: number;
  require_2fa: boolean;
}

// =====================================
// NOTIFICATIONS
// =====================================

export interface Notification extends BaseEntity {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  read_at?: string;
  priority: NotificationPriority;
}

export type NotificationType = 
  | 'prediction_complete'
  | 'upload_complete' 
  | 'system_alert'
  | 'user_action'
  | 'security_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// =====================================
// UI / INTERFACE
// =====================================

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontFamily: string;
  borderRadius: number;
}

export interface LayoutConfig {
  sidebar: {
    collapsed: boolean;
    width: number;
  };
  header: {
    height: number;
    sticky: boolean;
  };
  content: {
    padding: number;
    maxWidth: number;
  };
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface FilterOptions {
  search?: string;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filters?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
  };
}

// =====================================
// UTILITAIRES
// =====================================

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;