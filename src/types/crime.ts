export interface CrimeData {
  id: string;
  type: 'vol' | 'agression' | 'cambriolage' | 'fraude' | 'trafic' | 'autre';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    region: string;
  };
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  description: string;
  evidence?: string[];
  suspects?: Suspect[];
  officers_assigned?: string[];
}

export interface Suspect {
  id: string;
  name: string;
  age?: number;
  description: string;
  criminal_history: string[];
  risk_score: number;
}

export interface Alert {
  id: string;
  type: 'security' | 'crime' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string;
  timestamp: string;
  read: boolean;
  action_required: boolean;
}

export interface Prediction {
  id: string;
  type: 'crime_risk' | 'recidivism' | 'resource_allocation';
  location: string;
  probability: number;
  factors: string[];
  date_predicted: string;
  confidence_score: number;
}