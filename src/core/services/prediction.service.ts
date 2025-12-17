/**
 * Service de prédiction ML refactorisé
 * Utilise la nouvelle architecture avec client HTTP centralisé
 */

import { apiClient, ApiError } from '../api/client';
import { API_CONFIG } from '../api/config';
import type { 
  CriminalProfile, 
  PredictionResult, 
  MLEncoders, 
  MLModel,
  PredictionHistory 
} from '../types';

export class PredictionService {
  private static instance: PredictionService;
  private encoders: MLEncoders = {};
  private isInitialized = false;
  private model: MLModel | null = null;

  // Encodeurs par défaut (fallback)
  private readonly defaultEncoders: MLEncoders = {
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

  private constructor() {}

  public static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
    }
    return PredictionService.instance;
  }

  /**
   * Initialisation du service avec chargement des encodeurs et modèle
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🤖 Initialisation du service de prédiction...');

      // Vérification de la santé de l'API
      await this.checkAPIHealth();

      // Chargement des encodeurs
      await this.loadEncoders();

      // Informations sur le modèle (optionnel)
      await this.loadModelInfo();

      this.isInitialized = true;
      console.log('✅ Service de prédiction initialisé avec succès');

    } catch (error) {
      console.warn('⚠️ API ML non disponible, mode démonstration activé');
      this.encoders = { ...this.defaultEncoders };
      this.isInitialized = true; // Continuer en mode démo
    }
  }

  /**
   * Vérification de la santé de l'API
   */
  private async checkAPIHealth(): Promise<void> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ML.HEALTH);
    console.log('🩺 État API:', response.data);
  }

  /**
   * Chargement des encodeurs depuis l'API
   */
  private async loadEncoders(): Promise<void> {
    try {
      const response = await apiClient.get<{ encoders: MLEncoders }>(
        API_CONFIG.ENDPOINTS.ML.ENCODERS
      );
      
      this.encoders = response.data.encoders || this.defaultEncoders;
      console.log('📊 Encodeurs chargés depuis l\'API');
      
    } catch (error) {
      console.warn('📋 Utilisation des encodeurs par défaut');
      this.encoders = { ...this.defaultEncoders };
    }
  }

  /**
   * Chargement des informations sur le modèle
   */
  private async loadModelInfo(): Promise<void> {
    try {
      // Endpoint hypothétique pour les infos du modèle
      const response = await apiClient.get<MLModel>('/model/info');
      this.model = response.data;
      console.log('🧠 Modèle:', this.model.name, 'v' + this.model.version);
    } catch (error) {
      // Non critique, continuer sans info modèle
      console.debug('ℹ️ Informations modèle non disponibles');
    }
  }

  /**
   * Prédiction individuelle
   */
  public async predict(profile: CriminalProfile): Promise<PredictionResult> {
    await this.ensureInitialized();

    try {
      // Tentative via l'API Python
      const response = await apiClient.post<PredictionResult>(
        API_CONFIG.ENDPOINTS.ML.PREDICT,
        profile,
        API_CONFIG.TIMEOUT.ML_PREDICTION
      );

      const result = {
        ...response.data,
        metadata: {
          ...response.data.metadata,
          prediction_time: new Date().toISOString(),
          model_version: this.model?.version
        }
      };

      console.log('✅ Prédiction via API:', result);
      return result;

    } catch (error) {
      if (error instanceof ApiError) {
        console.warn('🔄 API non disponible, mode démonstration');
        return this.predictDemo(profile);
      }
      throw error;
    }
  }

  /**
   * Prédiction en lot
   */
  public async batchPredict(profiles: CriminalProfile[]): Promise<PredictionResult[]> {
    await this.ensureInitialized();

    try {
      const response = await apiClient.post<{ results: PredictionResult[] }>(
        API_CONFIG.ENDPOINTS.ML.BATCH_PREDICT,
        { profiles },
        API_CONFIG.TIMEOUT.ML_PREDICTION * profiles.length / 10 // Ajustement du timeout
      );

      console.log('✅ Prédiction batch via API');
      return response.data.results.map(result => ({
        ...result,
        metadata: {
          ...result.metadata,
          prediction_time: new Date().toISOString(),
          model_version: this.model?.version
        }
      }));

    } catch (error) {
      console.warn('🔄 Batch API non disponible, mode local');
      
      // Fallback : prédictions individuelles en mode démo
      const results: PredictionResult[] = [];
      for (const profile of profiles) {
        try {
          results.push(this.predictDemo(profile));
        } catch (err) {
          console.error('Erreur prédiction profil:', profile, err);
          results.push(this.getErrorResult());
        }
      }
      return results;
    }
  }

  /**
   * Mode démonstration avec règles heuristiques
   */
  private predictDemo(profile: CriminalProfile): PredictionResult {
    let riskScore = 0.3; // Base de risque

    // Facteurs d'âge (courbe en U)
    if (profile.Age < 20 || profile.Age > 50) riskScore += 0.1;
    if (profile.Age >= 20 && profile.Age <= 30) riskScore += 0.2;

    // Facteurs socio-économiques
    switch (profile.Profession) {
      case 'Chômeur':
        riskScore += 0.3;
        break;
      case 'Étudiant':
        riskScore += 0.1;
        break;
      case 'Fonctionnaire':
        riskScore -= 0.1;
        break;
    }

    // Type de crime initial
    const highRiskCrimes = ['Trafic', 'Violence'];
    const mediumRiskCrimes = ['Vol', 'Agression'];
    
    if (highRiskCrimes.includes(profile.Type_Crime_Initial)) {
      riskScore += 0.25;
    } else if (mediumRiskCrimes.includes(profile.Type_Crime_Initial)) {
      riskScore += 0.15;
    }

    // Impact des réseaux sociaux
    const highRiskPlatforms = ['Facebook', 'Instagram', 'TikTok'];
    if (highRiskPlatforms.includes(profile.Plateforme_Principale)) {
      riskScore += 0.1;
    }

    // Facteur régional (exemple)
    const urbanAreas = ['Dakar', 'Thiès', 'Saint-Louis'];
    if (urbanAreas.includes(profile.Region_Name)) {
      riskScore += 0.05;
    }

    // Normalisation et ajout d'un peu de randomness
    const probability = Math.min(
      Math.max(riskScore + (Math.random() - 0.5) * 0.1, 0), 
      1
    );

    // Calcul du niveau de risque
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (probability < 0.25) riskLevel = 'low';
    else if (probability < 0.5) riskLevel = 'medium';
    else if (probability < 0.75) riskLevel = 'high';
    else riskLevel = 'critical';

    // Facteurs d'influence
    const factors = {
      age: Math.min(Math.abs(profile.Age - 25) / 25.0, 1.0) * 0.2,
      profession: profile.Profession === 'Chômeur' ? 0.3 : 0.1,
      crime_type: highRiskCrimes.includes(profile.Type_Crime_Initial) ? 0.25 : 0.15,
      platform: highRiskPlatforms.includes(profile.Plateforme_Principale) ? 0.2 : 0.1,
      region: urbanAreas.includes(profile.Region_Name) ? 0.15 : 0.1
    };

    return {
      recidive_probability: Math.round(probability * 100) / 100,
      risk_level: riskLevel,
      confidence: Math.random() * 0.15 + 0.75, // 75-90% en mode démo
      factors,
      metadata: {
        prediction_time: new Date().toISOString(),
        algorithm: 'demo_heuristic',
        model_version: 'demo-1.0'
      }
    };
  }

  /**
   * Résultat d'erreur par défaut
   */
  private getErrorResult(): PredictionResult {
    return {
      recidive_probability: 0,
      risk_level: 'low',
      confidence: 0,
      factors: {},
      metadata: {
        prediction_time: new Date().toISOString(),
        algorithm: 'error',
        model_version: 'unknown'
      }
    };
  }

  /**
   * Obtenir les options pour les champs de formulaire
   */
  public getFieldOptions() {
    return {
      regions: Object.keys(this.encoders.Region_Name || this.defaultEncoders.Region_Name),
      ethnies: Object.keys(this.encoders.Ethnie || this.defaultEncoders.Ethnie),
      professions: Object.keys(this.encoders.Profession || this.defaultEncoders.Profession),
      villes: Object.keys(this.encoders.Ville_Actuelle || this.defaultEncoders.Ville_Actuelle),
      crimes: Object.keys(this.encoders.Type_Crime_Initial || this.defaultEncoders.Type_Crime_Initial),
      plateformes: Object.keys(this.encoders.Plateforme_Principale || this.defaultEncoders.Plateforme_Principale)
    };
  }

  /**
   * Validation d'un profil
   */
  public validateProfile(profile: Partial<CriminalProfile>): string[] {
    const errors: string[] = [];

    if (!profile.Region_Name) errors.push('Région requise');
    if (!profile.Age || profile.Age < 0 || profile.Age > 120) errors.push('Âge invalide (0-120)');
    if (!profile.Ethnie) errors.push('Ethnie requise');
    if (!profile.Profession) errors.push('Profession requise');
    if (!profile.Ville_Actuelle) errors.push('Ville actuelle requise');
    if (!profile.Type_Crime_Initial) errors.push('Type de crime initial requis');
    if (!profile.Plateforme_Principale) errors.push('Plateforme principale requise');

    return errors;
  }

  /**
   * Obtenir les statistiques du service
   */
  public getStats() {
    return {
      isInitialized: this.isInitialized,
      hasModel: !!this.model,
      modelInfo: this.model,
      encodersCount: Object.keys(this.encoders).length,
      fieldsAvailable: this.getFieldOptions()
    };
  }

  /**
   * S'assurer que le service est initialisé
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Réinitialiser le service (utile pour les tests)
   */
  public reset(): void {
    this.isInitialized = false;
    this.encoders = {};
    this.model = null;
  }
}

// Export de l'instance singleton
export const predictionService = PredictionService.getInstance();