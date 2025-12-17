/**
 * Fichier de compatibilité temporaire
 * Évite les erreurs pendant la migration
 */

// Re-export des types existants pour compatibilité
export type { CriminalProfile, PredictionResult } from '../services/ml/predictionService';
import { usePredictionService } from '../services/ml/predictionService';
export { usePredictionService as usePrediction } from '../services/ml/predictionService';

// Hook temporaire pour les stats (mode démo)
export const usePredictionStats = () => {
  return {
    stats: {
      isInitialized: true,
      hasModel: false,
      modelInfo: null,
      encodersCount: 6,
      fieldsAvailable: {
        regions: ['Dakar', 'Thiès', 'Saint-Louis'],
        ethnies: ['Wolof', 'Pulaar', 'Serer'],
        professions: ['Étudiant', 'Commerçant', 'Artisan'],
        villes: ['Dakar', 'Pikine', 'Thiès'],
        crimes: ['Vol', 'Agression', 'Escroquerie'],
        plateformes: ['Facebook', 'WhatsApp', 'Instagram']
      }
    },
    loading: false,
    refreshStats: () => Promise.resolve()
  };
};

// Hook temporaire pour les options des champs
export const usePredictionFieldOptions = () => {
  return {
    options: {
      regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga'],
      ethnies: ['Wolof', 'Pulaar', 'Serer', 'Diola', 'Mandingue'],
      professions: ['Étudiant', 'Commerçant', 'Artisan', 'Employé', 'Fonctionnaire'],
      villes: ['Dakar', 'Pikine', 'Thiès', 'Saint-Louis', 'Kaolack'],
      crimes: ['Vol', 'Agression', 'Escroquerie', 'Trafic', 'Violence'],
      plateformes: ['Facebook', 'WhatsApp', 'Instagram', 'Twitter', 'TikTok']
    },
    loading: false
  };
};

export default {
  usePrediction: usePredictionService,
  usePredictionStats,
  usePredictionFieldOptions
};
