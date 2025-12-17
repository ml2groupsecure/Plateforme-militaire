
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  created_at: string;
  last_login?: string;
}

export interface CrimeData {
  id: string;
  type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  date: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'closed';
  description: string;
  evidence?: string[];
}

export interface Alert {
  id: string;
  type: 'security' | 'anomaly' | 'prediction' | 'system';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  user_id?: string;
}

export interface MLModel {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  last_trained: string;
  status: 'active' | 'training' | 'inactive';
  description: string;
}

export interface Prediction {
  id: string;
  model_id: string;
  input_data: any;
  prediction: any;
  confidence: number;
  timestamp: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'crime_analysis' | 'prediction' | 'resource_allocation' | 'security';
  generated_by: string;
  created_at: string;
  data: any;
  file_url?: string;
}
