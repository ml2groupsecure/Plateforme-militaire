import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { DataService } from './csvService';
import { CsvHistoryService } from './csvHistoryService';
import { supabase } from './supabase';

// Types pour les données globales
export interface SiteData {
  incidents: any[];
  incidentStats: any;
  csvHistory: any[];
  csvStats: any;
  lastUpdate: Date;
  isLoading: boolean;
}

// Context pour partager les données
const SiteDataContext = createContext<{
  data: SiteData;
  refreshAllData: () => Promise<void>;
  refreshIncidents: () => Promise<void>;
  refreshCSVData: () => Promise<void>;
  isRefreshing: boolean;
} | null>(null);

// Hook principal pour utiliser la synchronisation
export const useSiteDataSync = () => {
  const [data, setData] = useState<SiteData>({
    incidents: [],
    incidentStats: null,
    csvHistory: [],
    csvStats: {
      totalUploads: 0,
      totalRowsProcessed: 0,
      successRate: 0,
      averageQualityScore: 0,
      recentUploads: []
    },
    lastUpdate: new Date(),
    isLoading: false
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction pour actualiser tous les incidents
  const refreshIncidents = useCallback(async () => {
    try {
      console.log('🔄 Actualisation des incidents...');
      
      const [incidents, stats] = await Promise.all([
        DataService.getIncidents(1000),
        DataService.getIncidentStats()
      ]);

      setData(prev => ({
        ...prev,
        incidents,
        incidentStats: stats,
        lastUpdate: new Date()
      }));

      console.log('✅ Incidents actualisés:', incidents.length);
      
      // Émettre un événement personnalisé pour notifier les composants
      window.dispatchEvent(new CustomEvent('incidents-updated', { 
        detail: { incidents, stats } 
      }));

    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation des incidents:', error);
    }
  }, []);

  // Fonction pour actualiser les données CSV
  const refreshCSVData = useCallback(async () => {
    try {
      console.log('🔄 Actualisation des données CSV...');
      
      const [history, stats] = await Promise.all([
        CsvHistoryService.getUploadHistory(50),
        CsvHistoryService.getUploadStats()
      ]);

      setData(prev => ({
        ...prev,
        csvHistory: history,
        csvStats: stats,
        lastUpdate: new Date()
      }));

      console.log('✅ Données CSV actualisées:', history.length, 'uploads');
      
      // Émettre un événement personnalisé
      window.dispatchEvent(new CustomEvent('csv-data-updated', { 
        detail: { history, stats } 
      }));

    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation des données CSV:', error);
    }
  }, []);

  // Fonction pour tout actualiser en une fois
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    setData(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🔄 Actualisation GLOBALE des données...');
      
      // Actualiser tout en parallèle
      await Promise.all([
        refreshIncidents(),
        refreshCSVData()
      ]);

      console.log('✅ TOUTES les données ont été actualisées !');
      
      // Émettre un événement global
      window.dispatchEvent(new CustomEvent('site-data-refreshed', { 
        detail: { timestamp: new Date() } 
      }));

    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation globale:', error);
      alert('⚠️ Erreur lors de la mise à jour des données. Veuillez réessayer.');
    } finally {
      setIsRefreshing(false);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshIncidents, refreshCSVData]);

  // Actualisation automatique au montage
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Écouter les changements en temps réel de Supabase
  useEffect(() => {
    console.log('🔗 Configuration des subscriptions temps réel...');
    
    // Subscription pour les nouveaux incidents
    const incidentsSubscription = supabase
      .channel('incidents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents'
        },
        (payload) => {
          console.log('🔄 Changement détecté dans incidents:', payload.eventType);
          refreshIncidents();
        }
      )
      .subscribe();

    // Subscription pour les uploads CSV
    const csvSubscription = supabase
      .channel('csv-uploads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'csv_uploads'
        },
        (payload) => {
          console.log('🔄 Changement détecté dans csv_uploads:', payload.eventType);
          refreshCSVData();
        }
      )
      .subscribe();

    // Nettoyage des subscriptions
    return () => {
      console.log('🔗 Nettoyage des subscriptions...');
      incidentsSubscription.unsubscribe();
      csvSubscription.unsubscribe();
    };
  }, [refreshIncidents, refreshCSVData]);

  return {
    data,
    refreshAllData,
    refreshIncidents,
    refreshCSVData,
    isRefreshing
  };
};

// Hook pour les composants qui ont besoin des données
export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  const localSync = useSiteDataSync();
  
  // Si pas de context, utiliser le hook local
  return context || localSync;
};

// Hook spécialisé pour les incidents
export const useIncidents = () => {
  const { data, refreshIncidents, isRefreshing } = useSiteDataSync();
  const [localIncidents, setLocalIncidents] = useState(data.incidents);

  // Écouter les mises à jour
  useEffect(() => {
    const handleIncidentsUpdate = (event: any) => {
      setLocalIncidents(event.detail.incidents);
    };

    window.addEventListener('incidents-updated', handleIncidentsUpdate);
    return () => window.removeEventListener('incidents-updated', handleIncidentsUpdate);
  }, []);

  // Synchroniser avec les données globales
  useEffect(() => {
    setLocalIncidents(data.incidents);
  }, [data.incidents]);

  return {
    incidents: localIncidents,
    stats: data.incidentStats,
    refresh: refreshIncidents,
    isLoading: isRefreshing,
    lastUpdate: data.lastUpdate
  };
};

// Hook spécialisé pour les données CSV
export const useCSVData = () => {
  const { data, refreshCSVData, isRefreshing } = useSiteDataSync();
  const [localCSVHistory, setLocalCSVHistory] = useState(data.csvHistory);

  // Écouter les mises à jour
  useEffect(() => {
    const handleCSVUpdate = (event: any) => {
      setLocalCSVHistory(event.detail.history);
    };

    window.addEventListener('csv-data-updated', handleCSVUpdate);
    return () => window.removeEventListener('csv-data-updated', handleCSVUpdate);
  }, []);

  // Synchroniser avec les données globales
  useEffect(() => {
    setLocalCSVHistory(data.csvHistory);
  }, [data.csvHistory]);

  return {
    history: localCSVHistory,
    stats: data.csvStats,
    refresh: refreshCSVData,
    isLoading: isRefreshing,
    lastUpdate: data.lastUpdate
  };
};

// Fonction utilitaire pour déclencher une actualisation depuis n'importe où
export const triggerGlobalRefresh = () => {
  window.dispatchEvent(new CustomEvent('trigger-global-refresh'));
};

// Fonction pour diagnostiquer les problèmes de données
export const diagnoseSiteData = async () => {
  console.log('🔍 DIAGNOSTIC DES DONNÉES');
  
  try {
    // Test connexion Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('incidents')
      .select('count')
      .limit(1);
      
    if (connectionError) {
      console.error('❌ Erreur connexion Supabase:', connectionError);
      return { success: false, error: 'Connexion Supabase échouée' };
    }

    // Test récupération incidents
    const incidents = await DataService.getIncidents(10);
    console.log('✅ Incidents récupérés:', incidents.length);

    // Test récupération CSV
    const csvHistory = await CsvHistoryService.getUploadHistory(5);
    console.log('✅ Historique CSV récupéré:', csvHistory.length);

    // Test statistiques
    const stats = await DataService.getIncidentStats();
    console.log('✅ Statistiques calculées:', stats);

    return { 
      success: true, 
      data: {
        incidentsCount: incidents.length,
        csvUploadsCount: csvHistory.length,
        stats
      }
    };

  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    return { success: false, error: error.message };
  }
};