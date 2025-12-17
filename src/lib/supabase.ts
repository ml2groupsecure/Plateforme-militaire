
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Incident {
  id: string;
  type: string;
  description?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reported_at: string;
  resolved_at?: string;
  assigned_agent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Suspect {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  description?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'arrested' | 'cleared';
  last_known_location?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  type: 'personnel' | 'vehicle' | 'equipment';
  name: string;
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  location?: string;
  latitude?: number;
  longitude?: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Signalement {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string | null;
  anonymous: boolean;
  source: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface CSVUpload {
  id: string;
  filename: string;
  original_rows: number;
  processed_rows: number;
  duplicates_removed: number;
  errors_count: number;
  upload_date: string;
  uploaded_by: string;
  status: 'processing' | 'processed' | 'error';
  file_data?: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  user_id: string;
  read_at?: string;
  created_at: string;
}
