import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface CsvDataRow {
  id?: string;
  incident_type: string;
  location: string;
  date_occurred: string;
  description?: string;
  status?: string;
  severity?: string;
  latitude?: number;
  longitude?: number;
  agent_name?: string;
  victim_count?: number;
  suspect_description?: string;
  [key: string]: any;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface CsvDataContextType {
  csvData: CsvDataRow[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getIncidentsByType: () => ChartDataPoint[];
  getIncidentsByLocation: () => ChartDataPoint[];
  getIncidentsByDate: (period?: 'week' | 'month' | 'year') => ChartDataPoint[];
  getIncidentsByStatus: () => ChartDataPoint[];
  getTotalIncidents: () => number;
  getResolutionRate: () => number;
  getActiveAgents: () => number;
  getRiskZones: () => number;
  getTimeSeriesData: (days?: number) => { labels: string[]; datasets: any[] };
  getLocationBarData: () => { labels: string[]; datasets: any[] };
  getTypeDoughnutData: () => { labels: string[]; datasets: any[] };
}

const CsvDataContext = createContext<CsvDataContextType | undefined>(undefined);

export const useCsvData = () => {
  const context = useContext(CsvDataContext);
  if (!context) {
    throw new Error('useCsvData must be used within a CsvDataProvider');
  }
  return context;
};

interface CsvDataProviderProps {
  children: ReactNode;
}

export const CsvDataProvider: React.FC<CsvDataProviderProps> = ({ children }) => {
  const [csvData, setCsvData] = useState<CsvDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('date_occurred', { ascending: false });
      
      if (error) {
        console.error('Erreur lors du chargement des données CSV:', error);
        return;
      }
      
      setCsvData(data || []);
    } catch (error) {
      console.error('Erreur lors du refresh des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    refreshData();
  }, []);

  const getIncidentsByType = (): ChartDataPoint[] => {
    const typeCount: Record<string, number> = {};
    
    csvData.forEach(row => {
      const type = row.incident_type || 'Non spécifié';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#6B7280'];
    
    return Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .map(([label, value], index) => ({
        label,
        value,
        color: colors[index % colors.length]
      }));
  };

  const getIncidentsByLocation = (): ChartDataPoint[] => {
    const locationCount: Record<string, number> = {};
    
    csvData.forEach(row => {
      const location = row.location || 'Non spécifié';
      locationCount[location] = (locationCount[location] || 0) + 1;
    });

    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#6B7280'];
    
    return Object.entries(locationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 locations
      .map(([label, value], index) => ({
        label,
        value,
        color: colors[index % colors.length]
      }));
  };

  const getIncidentsByDate = (period: 'week' | 'month' | 'year' = 'week'): ChartDataPoint[] => {
    const now = new Date();
    const dateCount: Record<string, number> = {};
    
    csvData.forEach(row => {
      if (!row.date_occurred) return;
      
      const date = new Date(row.date_occurred);
      let key: string;
      
      switch (period) {
        case 'week':
          // Grouper par jour
          key = date.toLocaleDateString('fr-FR');
          break;
        case 'month':
          // Grouper par semaine
          const weekNumber = Math.ceil(date.getDate() / 7);
          key = `Semaine ${weekNumber}`;
          break;
        case 'year':
          // Grouper par mois
          key = date.toLocaleDateString('fr-FR', { month: 'long' });
          break;
        default:
          key = date.toLocaleDateString('fr-FR');
      }
      
      dateCount[key] = (dateCount[key] || 0) + 1;
    });

    return Object.entries(dateCount)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([label, value]) => ({
        label,
        value
      }));
  };

  const getIncidentsByStatus = (): ChartDataPoint[] => {
    const statusCount: Record<string, number> = {};
    
    csvData.forEach(row => {
      const status = row.status || 'Non spécifié';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const statusColors: Record<string, string> = {
      'Résolu': '#10B981',
      'En cours': '#F59E0B',
      'Nouveau': '#3B82F6',
      'Classé': '#6B7280',
      'Non spécifié': '#9CA3AF'
    };

    return Object.entries(statusCount).map(([label, value]) => ({
      label,
      value,
      color: statusColors[label] || '#6B7280'
    }));
  };

  const getTotalIncidents = (): number => csvData.length;

  const getResolutionRate = (): number => {
    // La colonne status peut être en FR ("Résolu") ou en EN ("resolved") ou autre.
    const resolved = csvData.filter(row => {
      const s = String(row.status || '').toLowerCase();
      return s === 'résolu' || s === 'resolu' || s === 'resolved';
    }).length;
    return csvData.length > 0 ? (resolved / csvData.length) * 100 : 0;
  };

  const getActiveAgents = (): number => {
    const uniqueAgents = new Set(csvData.map(row => row.agent_name).filter(Boolean));
    return uniqueAgents.size;
  };

  const getRiskZones = (): number => {
    const locationCounts = getIncidentsByLocation();
    const avgIncidents = locationCounts.reduce((acc, loc) => acc + loc.value, 0) / locationCounts.length;
    return locationCounts.filter(loc => loc.value > avgIncidents * 1.5).length;
  };

  const getTimeSeriesData = (days: number = 7) => {
    const now = new Date();
    const labels: string[] = [];
    const incidentData: number[] = [];
    const resolvedData: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      labels.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
      
      const dayIncidents = csvData.filter(row => 
        row.date_occurred && row.date_occurred.startsWith(dateStr)
      );
      
      const dayResolved = dayIncidents.filter(row => {
        const s = String(row.status || '').toLowerCase();
        return s === 'résolu' || s === 'resolu' || s === 'resolved';
      });
      
      incidentData.push(dayIncidents.length);
      resolvedData.push(dayResolved.length);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Incidents signalés',
          data: incidentData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Incidents résolus',
          data: resolvedData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  };

  const getLocationBarData = () => {
    const locationData = getIncidentsByLocation();
    
    return {
      labels: locationData.map(item => item.label),
      datasets: [
        {
          label: 'Incidents par zone',
          data: locationData.map(item => item.value),
          backgroundColor: locationData.map(item => item.color || '#3B82F6').map(color => color + '80'), // Add transparency
          borderColor: locationData.map(item => item.color || '#3B82F6'),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };
  };

  const getTypeDoughnutData = () => {
    const typeData = getIncidentsByType();
    
    return {
      labels: typeData.map(item => item.label),
      datasets: [
        {
          data: typeData.map(item => item.value),
          backgroundColor: typeData.map(item => item.color || '#3B82F6'),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverOffset: 8
        }
      ]
    };
  };

  const contextValue: CsvDataContextType = {
    csvData,
    isLoading,
    refreshData,
    getIncidentsByType,
    getIncidentsByLocation,
    getIncidentsByDate,
    getIncidentsByStatus,
    getTotalIncidents,
    getResolutionRate,
    getActiveAgents,
    getRiskZones,
    getTimeSeriesData,
    getLocationBarData,
    getTypeDoughnutData
  };

  return (
    <CsvDataContext.Provider value={contextValue}>
      {children}
    </CsvDataContext.Provider>
  );
};