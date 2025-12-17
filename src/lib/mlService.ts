import { useState } from 'react';
import { DataService } from './csvService';

export interface PredictionResult {
  location: string;
  probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  predicted_type: string;
  confidence: number;
  factors: string[];
  prediction_date: string;
}

export interface FeatureVector {
  hour: number;
  day_of_week: number;
  month: number;
  location_encoded: number;
  previous_incidents: number;
  population_density: number;
  economic_index: number;
  weather_risk: number;
}

// Service de Machine Learning pour les prédictions criminelles
export class MLService {
  
  // Modèle Random Forest simplifié (à remplacer par votre modèle pré-entraîné)
  private static model = {
    trees: [], // Vos arbres de décision pré-entraînés
    features: [
      'hour', 'day_of_week', 'month', 'location_encoded', 
      'previous_incidents', 'population_density', 'economic_index', 'weather_risk'
    ],
    classes: ['Vol', 'Agression', 'Fraude', 'Cambriolage', 'Autre'],
    locationMapping: new Map<string, number>()
  };

  // Initialiser le modèle avec les données historiques
  static async initializeModel() {
    console.log('🔄 Initialisation du modèle Random Forest...');
    
    try {
      // Charger les données historiques pour l'entraînement
      const incidents = await DataService.getIncidents(1000);
      
      // Pré-traiter les données
      const processedData = MLService.preprocessData(incidents);
      
      // Entraîner le modèle (simulation)
      await MLService.trainModel(processedData);
      
      console.log('✅ Modèle Random Forest initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du modèle:', error);
    }
  }

  // Pré-traitement des données pour le modèle
  static preprocessData(incidents: any[]): FeatureVector[] {
    const features: FeatureVector[] = [];
    
    // Créer un mapping des locations
    const locations = [...new Set(incidents.map(i => i.location))];
    locations.forEach((location, index) => {
      MLService.model.locationMapping.set(location, index);
    });

    incidents.forEach(incident => {
      const date = new Date(incident.reported_at);
      
      const featureVector: FeatureVector = {
        hour: date.getHours(),
        day_of_week: date.getDay(),
        month: date.getMonth(),
        location_encoded: MLService.model.locationMapping.get(incident.location) || 0,
        previous_incidents: MLService.countPreviousIncidents(incidents, incident.location, date),
        population_density: MLService.getLocationDensity(incident.location),
        economic_index: MLService.getEconomicIndex(incident.location),
        weather_risk: MLService.getWeatherRisk(date)
      };
      
      features.push(featureVector);
    });

    return features;
  }

  // Simulation d'entraînement du modèle
  private static async trainModel(data: FeatureVector[]): Promise<void> {
    // Ici vous intégrez votre code Random Forest existant
    console.log(`📊 Entraînement sur ${data.length} échantillons...`);
    
    // Simulation de l'entraînement
    return new Promise(resolve => {
      setTimeout(() => {
        MLService.model.trees = Array(100).fill(null).map(() => ({
          id: Math.random().toString(36),
          depth: Math.floor(Math.random() * 10) + 5,
          accuracy: 0.8 + Math.random() * 0.15
        }));
        resolve();
      }, 1000);
    });
  }

  // Faire des prédictions pour une zone donnée
  static async predictCrimeRisk(location: string, timeframe: Date = new Date()): Promise<PredictionResult> {
    const features: FeatureVector = {
      hour: timeframe.getHours(),
      day_of_week: timeframe.getDay(),
      month: timeframe.getMonth(),
      location_encoded: MLService.model.locationMapping.get(location) || 0,
      previous_incidents: await MLService.getRecentIncidents(location),
      population_density: MLService.getLocationDensity(location),
      economic_index: MLService.getEconomicIndex(location),
      weather_risk: MLService.getWeatherRisk(timeframe)
    };

    // Simulation de prédiction avec Random Forest
    const prediction = MLService.runRandomForestPrediction(features);
    
    return {
      location,
      probability: prediction.probability,
      risk_level: prediction.risk_level,
      predicted_type: prediction.predicted_type,
      confidence: prediction.confidence,
      factors: prediction.factors,
      prediction_date: new Date().toISOString()
    };
  }

  // Simulation du Random Forest (remplacez par votre implémentation)
  private static runRandomForestPrediction(features: FeatureVector) {
    // Facteurs de risque basés sur les caractéristiques
    let riskScore = 0;
    const factors: string[] = [];

    // Analyse temporelle
    if (features.hour >= 22 || features.hour <= 4) {
      riskScore += 0.3;
      factors.push('Heure nocturne à risque élevé');
    }

    if (features.day_of_week === 0 || features.day_of_week === 6) {
      riskScore += 0.2;
      factors.push('Weekend - activité accrue');
    }

    // Analyse géographique
    if (features.previous_incidents > 5) {
      riskScore += 0.4;
      factors.push('Historique élevé d\'incidents dans la zone');
    }

    if (features.population_density > 0.7) {
      riskScore += 0.2;
      factors.push('Zone densément peuplée');
    }

    if (features.economic_index < 0.3) {
      riskScore += 0.3;
      factors.push('Indicateurs socio-économiques défavorables');
    }

    // Normaliser le score
    const probability = Math.min(Math.max(riskScore + (Math.random() * 0.2 - 0.1), 0), 1);
    
    // Déterminer le niveau de risque
    let risk_level: 'low' | 'medium' | 'high' | 'critical';
    if (probability < 0.25) risk_level = 'low';
    else if (probability < 0.5) risk_level = 'medium';
    else if (probability < 0.75) risk_level = 'high';
    else risk_level = 'critical';

    // Prédire le type de crime le plus probable
    const crimeProbs = {
      'Vol': 0.35 + (features.economic_index < 0.4 ? 0.2 : 0),
      'Agression': 0.25 + (features.hour >= 22 ? 0.15 : 0),
      'Fraude': 0.15 + (features.population_density > 0.6 ? 0.1 : 0),
      'Cambriolage': 0.20 + (features.day_of_week === 0 ? 0.1 : 0),
      'Autre': 0.05
    };

    const predicted_type = Object.entries(crimeProbs).reduce((max, [type, prob]) => 
      prob > crimeProbs[max] ? type : max, 'Vol');

    return {
      probability,
      risk_level,
      predicted_type,
      confidence: 0.75 + Math.random() * 0.2,
      factors
    };
  }

  // Fonctions utilitaires pour les caractéristiques
  private static countPreviousIncidents(incidents: any[], location: string, date: Date): number {
    const thirtyDaysAgo = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
    return incidents.filter(i => 
      i.location === location && 
      new Date(i.reported_at) >= thirtyDaysAgo && 
      new Date(i.reported_at) < date
    ).length;
  }

  private static async getRecentIncidents(location: string): Promise<number> {
    try {
      const incidents = await DataService.getIncidentsByLocation(location);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return incidents.filter(i => new Date(i.created_at) >= thirtyDaysAgo).length;
    } catch {
      return 0;
    }
  }

  // Simuler la densité de population par zone
  private static getLocationDensity(location: string): number {
    const densityMap: Record<string, number> = {
      'Dakar': 0.9,
      'Plateau': 0.8,
      'Médina': 0.85,
      'Pikine': 0.95,
      'Guédiawaye': 0.9,
      'Parcelles Assainies': 0.7,
      'Rufisque': 0.6,
      'Keur Massar': 0.5
    };
    
    return densityMap[location] || 0.5;
  }

  // Simuler l'indice économique par zone
  private static getEconomicIndex(location: string): number {
    const economicMap: Record<string, number> = {
      'Plateau': 0.8,
      'Dakar': 0.7,
      'Parcelles Assainies': 0.6,
      'Médina': 0.5,
      'Rufisque': 0.4,
      'Pikine': 0.3,
      'Guédiawaye': 0.3,
      'Keur Massar': 0.35
    };
    
    return economicMap[location] || 0.5;
  }

  // Simuler le risque météorologique
  private static getWeatherRisk(date: Date): number {
    const month = date.getMonth();
    // Plus de risques pendant la saison sèche et les pics de chaleur
    if (month >= 2 && month <= 5) return 0.7; // Mars à Juin
    if (month >= 10 && month <= 1) return 0.3; // Nov à Feb
    return 0.5; // Saison des pluies
  }

  // Analyser les tendances criminelles
  static async analyzeCrimeTrends(): Promise<{
    trends: Array<{
      type: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      change_percentage: number;
      period: string;
    }>;
    hotspots: Array<{
      location: string;
      incident_count: number;
      risk_score: number;
    }>;
    recommendations: string[];
  }> {
    try {
      const incidents = await DataService.getIncidents(500);
      const now = new Date();
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Analyser les tendances par type
      const recentIncidents = incidents.filter(i => new Date(i.created_at) >= lastMonth);
      const previousIncidents = incidents.filter(i => {
        const date = new Date(i.created_at);
        return date >= twoMonthsAgo && date < lastMonth;
      });

      const trends = MLService.calculateTrends(recentIncidents, previousIncidents);
      const hotspots = MLService.identifyHotspots(recentIncidents);
      const recommendations = MLService.generateRecommendations(trends, hotspots);

      return { trends, hotspots, recommendations };
    } catch (error) {
      console.error('Erreur lors de l\'analyse des tendances:', error);
      return { trends: [], hotspots: [], recommendations: [] };
    }
  }

  private static calculateTrends(recent: any[], previous: any[]) {
    const types = [...new Set([...recent.map(i => i.type), ...previous.map(i => i.type)])];
    
    return types.map(type => {
      const recentCount = recent.filter(i => i.type === type).length;
      const previousCount = previous.filter(i => i.type === type).length;
      
      let trend: 'increasing' | 'decreasing' | 'stable';
      let change_percentage = 0;

      if (previousCount === 0 && recentCount > 0) {
        trend = 'increasing';
        change_percentage = 100;
      } else if (previousCount > 0) {
        change_percentage = ((recentCount - previousCount) / previousCount) * 100;
        if (change_percentage > 10) trend = 'increasing';
        else if (change_percentage < -10) trend = 'decreasing';
        else trend = 'stable';
      } else {
        trend = 'stable';
      }

      return {
        type,
        trend,
        change_percentage: Math.round(change_percentage),
        period: '30 derniers jours'
      };
    });
  }

  private static identifyHotspots(incidents: any[]) {
    const locationCounts = incidents.reduce((acc, incident) => {
      acc[incident.location] = (acc[incident.location] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        incident_count: count as number,
        risk_score: MLService.calculateLocationRisk(location, count as number)
      }))
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10);
  }

  private static calculateLocationRisk(location: string, incidentCount: number): number {
    const density = MLService.getLocationDensity(location);
    const economicIndex = MLService.getEconomicIndex(location);
    
    return (incidentCount * 0.4) + (density * 0.3) + ((1 - economicIndex) * 0.3);
  }

  private static generateRecommendations(trends: any[], hotspots: any[]): string[] {
    const recommendations: string[] = [];

    // Recommandations basées sur les tendances
    trends.forEach(trend => {
      if (trend.trend === 'increasing' && trend.change_percentage > 20) {
        recommendations.push(`Renforcer la surveillance pour les ${trend.type.toLowerCase()}s (hausse de ${trend.change_percentage}%)`);
      }
    });

    // Recommandations basées sur les zones chaudes
    if (hotspots.length > 0) {
      const topHotspot = hotspots[0];
      recommendations.push(`Déployer des patrouilles supplémentaires à ${topHotspot.location} (${topHotspot.incident_count} incidents récents)`);
    }

    // Recommandations générales
    recommendations.push('Mettre à jour les données d\'entraînement du modèle avec les derniers incidents');
    recommendations.push('Organiser des réunions de coordination entre les différents services');

    return recommendations.slice(0, 5);
  }
}

// Hook React pour utiliser les prédictions ML
export const useMLPredictions = () => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getPredictions = async (locations: string[]) => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        locations.map(location => MLService.predictCrimeRisk(location))
      );
      setPredictions(results);
    } catch (error) {
      console.error('Erreur lors des prédictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { predictions, isLoading, getPredictions };
};