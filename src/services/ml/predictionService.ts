// Service de prédiction ML pour la récidive criminelle
// Utilise l'API Python FastAPI avec le modèle joblib

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
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  factors: {
    [key: string]: number;
  };
}

export class RecidivePredictionService {
  private static API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  private static encoders: Record<string, Record<string, number>> = {};
  private static isLoaded = false;

  // Encodeurs pour les variables catégorielles (à ajuster selon votre modèle)
  private static defaultEncoders = {
    Region_Name: {
      'Dakar': 0, 'Thiès': 1, 'Saint-Louis': 2, 'Diourbel': 3, 
      'Louga': 4, 'Tambacounda': 5, 'Kolda': 6, 'Ziguinchor': 7,
      'Fatick': 8, 'Kaolack': 9, 'Kaffrine': 10, 'Kédougou': 11,
      'Matam': 12, 'Sédhiou': 13
    },
    Ethnie: {
      'Wolof': 0, 'Pulaar': 1, 'Serer': 2, 'Diola': 3, 
      'Mandingue': 4, 'Soninke': 5, 'Autre': 6
    },
    Profession: {
      'Étudiant': 0, 'Commerçant': 1, 'Artisan': 2, 'Employé': 3,
      'Fonctionnaire': 4, 'Chômeur': 5, 'Retraité': 6, 'Autre': 7
    },
    Ville_Actuelle: {
      'Dakar': 0, 'Pikine': 1, 'Guédiawaye': 2, 'Rufisque': 3,
      'Thiès': 4, 'Saint-Louis': 5, 'Kaolack': 6, 'Ziguinchor': 7,
      'Autre': 8
    },
    Type_Crime_Initial: {
      'Vol': 0, 'Agression': 1, 'Escroquerie': 2, 'Trafic': 3,
      'Violence': 4, 'Cybercriminalité': 5, 'Autre': 6
    },
    Plateforme_Principale: {
      'Facebook': 0, 'WhatsApp': 1, 'Instagram': 2, 'Twitter': 3,
      'TikTok': 4, 'Telegram': 5, 'Autre': 6, 'Aucune': 7
    }
  };

  // Vérifier la disponibilité de l'API
  static async loadModel(): Promise<void> {
    try {
      console.log('🤖 Connexion à l\'API de prédiction...');
      
      // Vérifier la santé de l'API
      const healthResponse = await fetch(`${this.API_BASE_URL}/health`);
      if (!healthResponse.ok) {
        throw new Error('API non disponible');
      }
      
      const healthData = await healthResponse.json();
      console.log('✅ API connectée:', healthData);

      // Charger les encodeurs depuis l'API
      try {
        const encodersResponse = await fetch(`${this.API_BASE_URL}/encoders`);
        if (encodersResponse.ok) {
          const encodersData = await encodersResponse.json();
          this.encoders = encodersData.encoders || this.defaultEncoders;
          console.log('✅ Encodeurs chargés depuis l\'API');
        } else {
          this.encoders = this.defaultEncoders;
          console.log('📋 Utilisation des encodeurs par défaut');
        }
      } catch (encoderError) {
        console.warn('⚠️  Erreur encodeurs, utilisation des encodeurs par défaut');
        this.encoders = this.defaultEncoders;
      }

      this.isLoaded = true;
      console.log('🎯 Service de prédiction prêt !');
    } catch (error) {
      console.error('❌ Erreur lors de la connexion à l\'API:', error);
      console.warn('🔄 Utilisation du mode de démonstration local');
      this.encoders = this.defaultEncoders;
      this.isLoaded = true; // Continuer en mode démo
    }
  };


  // Faire une prédiction via l'API Python
  static async predict(profile: CriminalProfile): Promise<PredictionResult> {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    try {
      // Essayer l'API Python d'abord
      const apiResponse = await fetch(`${this.API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        console.log('✅ Prédiction depuis l\'API Python:', result);
        return result;
      } else {
        console.warn('⚠️  API Python non disponible, mode démonstration');
        throw new Error('API not available');
      }
    } catch (apiError) {
      console.warn('🔄 Utilisation du mode démonstration local');
      
      // Mode de démonstration local
      return this.predictDemo(profile);
    }
  }

  // Mode démonstration local (sans modèle)
  private static predictDemo(profile: CriminalProfile): PredictionResult {
    // Simulation basée sur des règles heuristiques
    let risk_score = 0.3; // Base

    // Facteurs d'âge
    if (profile.Age < 20 || profile.Age > 50) risk_score += 0.1;
    if (profile.Age >= 20 && profile.Age <= 30) risk_score += 0.2;

    // Facteurs professionnels
    if (profile.Profession === 'Chômeur') risk_score += 0.3;
    else if (profile.Profession === 'Étudiant') risk_score += 0.1;
    else if (profile.Profession === 'Fonctionnaire') risk_score -= 0.1;

    // Type de crime
    if (['Trafic', 'Violence'].includes(profile.Type_Crime_Initial)) risk_score += 0.25;
    else if (['Vol', 'Agression'].includes(profile.Type_Crime_Initial)) risk_score += 0.15;
    
    // Plateforme numérique
    if (['Facebook', 'Instagram', 'TikTok'].includes(profile.Plateforme_Principale)) risk_score += 0.1;

    // Normaliser le score
    const recidive_probability = Math.min(Math.max(risk_score + (Math.random() - 0.5) * 0.2, 0), 1);

    // Déterminer le niveau de risque
    let risk_level: 'low' | 'medium' | 'high' | 'critical';
    if (recidive_probability < 0.25) risk_level = 'low';
    else if (recidive_probability < 0.5) risk_level = 'medium';
    else if (recidive_probability < 0.75) risk_level = 'high';
    else risk_level = 'critical';

    const factors = {
      age: Math.min(Math.abs(profile.Age - 25) / 25.0, 1.0) * 0.2,
      profession: profile.Profession === 'Chômeur' ? 0.3 : 0.1,
      crime_type: ['Trafic', 'Violence'].includes(profile.Type_Crime_Initial) ? 0.25 : 0.15,
      platform: ['Facebook', 'Instagram', 'TikTok'].includes(profile.Plateforme_Principale) ? 0.2 : 0.1
    };

    return {
      recidive_probability: Math.round(recidive_probability * 100) / 100,
      risk_level,
      confidence: Math.random() * 0.15 + 0.75, // 75-90% en mode démo
      factors
    };
  }

  // Obtenir les options pour chaque champ
  static getFieldOptions() {
    return {
      regions: Object.keys(this.encoders.Region_Name || this.defaultEncoders.Region_Name),
      ethnies: Object.keys(this.encoders.Ethnie || this.defaultEncoders.Ethnie),
      professions: Object.keys(this.encoders.Profession || this.defaultEncoders.Profession),
      villes: Object.keys(this.encoders.Ville_Actuelle || this.defaultEncoders.Ville_Actuelle),
      crimes: Object.keys(this.encoders.Type_Crime_Initial || this.defaultEncoders.Type_Crime_Initial),
      plateformes: Object.keys(this.encoders.Plateforme_Principale || this.defaultEncoders.Plateforme_Principale)
    };
  }

  // Analyser plusieurs profils en lot
  static async batchPredict(profiles: CriminalProfile[]): Promise<PredictionResult[]> {
    try {
      // Essayer l'API Python pour le batch
      const apiResponse = await fetch(`${this.API_BASE_URL}/batch_predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profiles)
      });

      if (apiResponse.ok) {
        const batchResult = await apiResponse.json();
        console.log('✅ Prédiction batch depuis l\'API Python');
        return batchResult.results;
      } else {
        throw new Error('Batch API not available');
      }
    } catch (apiError) {
      console.warn('🔄 Batch prédiction en mode local');
      
      // Fallback : prédictions individuelles
      const results: PredictionResult[] = [];
      for (const profile of profiles) {
        try {
          const result = this.predictDemo(profile);
          results.push(result);
        } catch (error) {
          console.error(`Erreur prédiction pour profil:`, profile, error);
          results.push({
            recidive_probability: 0,
            risk_level: 'low',
            confidence: 0,
            factors: {}
          });
        }
      }
      return results;
    }
  }
}

// Hook React pour utiliser le service de prédiction
export const usePredictionService = () => {
  const predict = async (profile: CriminalProfile) => {
    return await RecidivePredictionService.predict(profile);
  };

  const batchPredict = async (profiles: CriminalProfile[]) => {
    return await RecidivePredictionService.batchPredict(profiles);
  };

  const getFieldOptions = () => {
    return RecidivePredictionService.getFieldOptions();
  };

  return {
    predict,
    batchPredict,
    getFieldOptions,
    loadModel: () => RecidivePredictionService.loadModel()
  };
};