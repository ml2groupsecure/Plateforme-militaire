/**
 * Hook React pour utiliser le service de prédiction ML
 * Gère l'état de chargement et les erreurs automatiquement
 */

import { useState, useEffect, useCallback } from 'react';
import { predictionService } from '../../core/services/prediction.service';
import { ApiError } from '../../core/api/client';
import type { 
  CriminalProfile, 
  PredictionResult, 
  AsyncState 
} from '../../core/types';

interface UsePredictionReturn {
  // États
  prediction: AsyncState<PredictionResult>;
  batchPrediction: AsyncState<PredictionResult[]>;
  serviceStatus: AsyncState<any>;
  
  // Actions
  predict: (profile: CriminalProfile) => Promise<void>;
  batchPredict: (profiles: CriminalProfile[]) => Promise<void>;
  validateProfile: (profile: Partial<CriminalProfile>) => string[];
  getFieldOptions: () => any;
  resetPrediction: () => void;
  resetBatchPrediction: () => void;
  initializeService: () => Promise<void>;
  
  // Helpers
  isServiceReady: boolean;
  lastPrediction: PredictionResult | null;
}

export const usePrediction = (): UsePredictionReturn => {
  // États pour prédiction individuelle
  const [prediction, setPrediction] = useState<AsyncState<PredictionResult>>({
    data: null,
    loading: false,
    error: null
  });

  // États pour prédiction en lot
  const [batchPrediction, setBatchPrediction] = useState<AsyncState<PredictionResult[]>>({
    data: null,
    loading: false,
    error: null
  });

  // État du service
  const [serviceStatus, setServiceStatus] = useState<AsyncState<any>>({
    data: null,
    loading: false,
    error: null
  });

  const [isServiceReady, setIsServiceReady] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<PredictionResult | null>(null);

  /**
   * Initialisation du service au montage du composant
   */
  useEffect(() => {
    initializeService();
  }, []);

  /**
   * Initialisation du service de prédiction
   */
  const initializeService = useCallback(async (): Promise<void> => {
    setServiceStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await predictionService.initialize();
      const stats = predictionService.getStats();
      
      setServiceStatus({
        data: stats,
        loading: false,
        error: null
      });
      
      setIsServiceReady(stats.isInitialized);
      console.log('🎯 Service de prédiction prêt via hook');
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur initialisation service';
        
      setServiceStatus({
        data: null,
        loading: false,
        error: errorMessage
      });
      
      setIsServiceReady(false);
      console.error('❌ Erreur initialisation service:', error);
    }
  }, []);

  /**
   * Prédiction individuelle
   */
  const predict = useCallback(async (profile: CriminalProfile): Promise<void> => {
    // Validation du profil
    const validationErrors = predictionService.validateProfile(profile);
    if (validationErrors.length > 0) {
      setPrediction({
        data: null,
        loading: false,
        error: validationErrors.join(', ')
      });
      return;
    }

    setPrediction(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await predictionService.predict(profile);
      
      setPrediction({
        data: result,
        loading: false,
        error: null
      });
      
      setLastPrediction(result);
      console.log('✅ Prédiction réussie via hook');
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur lors de la prédiction';
        
      setPrediction({
        data: null,
        loading: false,
        error: errorMessage
      });
      
      console.error('❌ Erreur prédiction:', error);
    }
  }, []);

  /**
   * Prédiction en lot
   */
  const batchPredict = useCallback(async (profiles: CriminalProfile[]): Promise<void> => {
    if (profiles.length === 0) {
      setBatchPrediction({
        data: null,
        loading: false,
        error: 'Aucun profil à analyser'
      });
      return;
    }

    // Validation de tous les profils
    const allErrors: string[] = [];
    profiles.forEach((profile, index) => {
      const errors = predictionService.validateProfile(profile);
      if (errors.length > 0) {
        allErrors.push(`Profil ${index + 1}: ${errors.join(', ')}`);
      }
    });

    if (allErrors.length > 0) {
      setBatchPrediction({
        data: null,
        loading: false,
        error: allErrors.join(' | ')
      });
      return;
    }

    setBatchPrediction(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const results = await predictionService.batchPredict(profiles);
      
      setBatchPrediction({
        data: results,
        loading: false,
        error: null
      });
      
      console.log(`✅ Prédiction batch réussie: ${results.length} profils`);
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Erreur lors de la prédiction en lot';
        
      setBatchPrediction({
        data: null,
        loading: false,
        error: errorMessage
      });
      
      console.error('❌ Erreur prédiction batch:', error);
    }
  }, []);

  /**
   * Validation d'un profil
   */
  const validateProfile = useCallback((profile: Partial<CriminalProfile>): string[] => {
    return predictionService.validateProfile(profile);
  }, []);

  /**
   * Options pour les champs de formulaire
   */
  const getFieldOptions = useCallback(() => {
    return predictionService.getFieldOptions();
  }, []);

  /**
   * Reset de la prédiction individuelle
   */
  const resetPrediction = useCallback(() => {
    setPrediction({
      data: null,
      loading: false,
      error: null
    });
    setLastPrediction(null);
  }, []);

  /**
   * Reset de la prédiction batch
   */
  const resetBatchPrediction = useCallback(() => {
    setBatchPrediction({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    // États
    prediction,
    batchPrediction,
    serviceStatus,
    
    // Actions
    predict,
    batchPredict,
    validateProfile,
    getFieldOptions,
    resetPrediction,
    resetBatchPrediction,
    initializeService,
    
    // Helpers
    isServiceReady,
    lastPrediction
  };
};

/**
 * Hook simplifié pour récupérer uniquement les options des champs
 */
export const usePredictionFieldOptions = () => {
  const [options, setOptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        await predictionService.initialize();
        setOptions(predictionService.getFieldOptions());
      } catch (error) {
        console.error('Erreur chargement options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading };
};

/**
 * Hook pour les statistiques du service ML
 */
export const usePredictionStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      await predictionService.initialize();
      setStats(predictionService.getStats());
    } catch (error) {
      console.error('Erreur statistiques:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return { stats, loading, refreshStats };
};