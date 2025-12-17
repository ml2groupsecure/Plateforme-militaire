/**
 * EXEMPLE d'utilisation du nouveau service de prédiction
 * Ce fichier montre comment utiliser la nouvelle architecture
 * 
 * ⚠️ Ce fichier est à titre d'exemple uniquement
 */

import React, { useState } from 'react';
import { 
  usePrediction, 
  usePredictionFieldOptions
} from '../core';
import type {
  CriminalProfile,
  PredictionResult
} from '../core';

const PredictionExample: React.FC = () => {
  const [profile, setProfile] = useState<Partial<CriminalProfile>>({
    Region_Name: '',
    Age: 25,
    Ethnie: '',
    Profession: '',
    Ville_Actuelle: '',
    Type_Crime_Initial: '',
    Plateforme_Principale: ''
  });

  // Utilisation du hook principal
  const {
    prediction,
    predict,
    validateProfile,
    isServiceReady,
    resetPrediction
  } = usePrediction();

  // Hook pour les options des champs
  const { options, loading: optionsLoading } = usePredictionFieldOptions();

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile as CriminalProfile) {
      await predict(profile as CriminalProfile);
    }
  };

  // Validation en temps réel
  const validationErrors = validateProfile(profile);
  const isValid = validationErrors.length === 0;

  if (optionsLoading) {
    return <div>🔄 Chargement des options...</div>;
  }

  if (!isServiceReady) {
    return <div>⚠️ Service de prédiction non disponible</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        🤖 Nouvelle Architecture - Service de Prédiction
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Profil à analyser</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Région */}
            <div>
              <label className="block text-sm font-medium mb-1">Région</label>
              <select
                value={profile.Region_Name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, Region_Name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sélectionner une région</option>
                {options?.regions?.map((region: string) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Âge */}
            <div>
              <label className="block text-sm font-medium mb-1">Âge</label>
              <input
                type="number"
                min="0"
                max="120"
                value={profile.Age || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, Age: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Ethnie */}
            <div>
              <label className="block text-sm font-medium mb-1">Ethnie</label>
              <select
                value={profile.Ethnie || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, Ethnie: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sélectionner une ethnie</option>
                {options?.ethnies?.map((ethnie: string) => (
                  <option key={ethnie} value={ethnie}>{ethnie}</option>
                ))}
              </select>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium mb-1">Profession</label>
              <select
                value={profile.Profession || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, Profession: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sélectionner une profession</option>
                {options?.professions?.map((prof: string) => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            {/* Validation en temps réel */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-sm text-red-600 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!isValid || prediction.loading}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {prediction.loading ? '🔄 Analyse...' : '🎯 Prédire'}
              </button>
              
              <button
                type="button"
                onClick={resetPrediction}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Résultat de la prédiction</h2>
          
          {prediction.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">❌ {prediction.error}</p>
            </div>
          )}

          {prediction.data && (
            <PredictionResultDisplay result={prediction.data} />
          )}

          {!prediction.data && !prediction.error && !prediction.loading && (
            <div className="text-gray-500 text-center py-8">
              Remplissez le formulaire pour obtenir une prédiction
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher le résultat
const PredictionResultDisplay: React.FC<{ result: PredictionResult }> = ({ result }) => {
  const riskColors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div className="space-y-4">
      {/* Probabilité principale */}
      <div className="text-center">
        <div className="text-4xl font-bold text-primary-600 mb-2">
          {Math.round(result.recidive_probability * 100)}%
        </div>
        <div className="text-gray-600">Probabilité de récidive</div>
      </div>

      {/* Niveau de risque */}
      <div className={`border rounded-lg p-3 ${riskColors[result.risk_level]}`}>
        <div className="font-semibold">
          Niveau de risque: {result.risk_level.toUpperCase()}
        </div>
        <div className="text-sm mt-1">
          Confiance: {Math.round(result.confidence * 100)}%
        </div>
      </div>

      {/* Facteurs d'influence */}
      {Object.keys(result.factors).length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Facteurs d'influence:</h3>
          <div className="space-y-2">
            {Object.entries(result.factors).map(([factor, value]) => (
              <div key={factor} className="flex justify-between items-center">
                <span className="text-sm capitalize">{factor.replace('_', ' ')}</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.round((value as number) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8">
                    {Math.round((value as number) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métadonnées */}
      {result.metadata && (
        <div className="text-xs text-gray-500 border-t pt-3 space-y-1">
          {result.metadata.model_version && (
            <div>Modèle: v{result.metadata.model_version}</div>
          )}
          {result.metadata.algorithm && (
            <div>Algorithme: {result.metadata.algorithm}</div>
          )}
          {result.metadata.prediction_time && (
            <div>
              Calculé le: {new Date(result.metadata.prediction_time).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionExample;