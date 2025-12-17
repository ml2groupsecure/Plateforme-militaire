/**
 * 🚀 NOUVEAU - Composant de prédiction utilisant la nouvelle architecture
 * Remplace l'ancien CriminalProfileForm avec des améliorations
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../base/Button';
import Input from '../base/Input';
import Card from '../base/Card';
import { 
  usePrediction, 
  usePredictionFieldOptions 
} from '../../core';
import type { 
  CriminalProfile, 
  PredictionResult 
} from '../../core';

interface EnhancedCriminalProfileFormProps {
  onPredictionResult?: (result: PredictionResult, profile: CriminalProfile) => void;
  initialProfile?: Partial<CriminalProfile>;
  showHistory?: boolean;
}

export default function EnhancedCriminalProfileForm({ 
  onPredictionResult, 
  initialProfile, 
  showHistory = false 
}: EnhancedCriminalProfileFormProps) {
  // 🎯 Utilisation de la nouvelle architecture
  const {
    prediction,
    predict,
    validateProfile,
    isServiceReady,
    resetPrediction
  } = usePrediction();

  const { options, loading: optionsLoading } = usePredictionFieldOptions();

  // État local du formulaire
  const [profile, setProfile] = useState<Partial<CriminalProfile>>({
    Region_Name: initialProfile?.Region_Name || '',
    Age: initialProfile?.Age || 25,
    Ethnie: initialProfile?.Ethnie || '',
    Profession: initialProfile?.Profession || '',
    Ville_Actuelle: initialProfile?.Ville_Actuelle || '',
    Type_Crime_Initial: initialProfile?.Type_Crime_Initial || '',
    Plateforme_Principale: initialProfile?.Plateforme_Principale || ''
  });

  const [showDetails, setShowDetails] = useState(false);

  // Validation en temps réel
  const validationErrors = validateProfile(profile);
  const isValid = validationErrors.length === 0 && isServiceReady;

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !profile) return;

    await predict(profile as CriminalProfile);
  };

  // Callback quand une prédiction est terminée
  useEffect(() => {
    if (prediction.data && onPredictionResult && profile) {
      onPredictionResult(prediction.data, profile as CriminalProfile);
    }
  }, [prediction.data, onPredictionResult, profile]);

  // Gestion des changements de champs
  const handleFieldChange = (field: keyof CriminalProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    resetPrediction(); // Reset prédiction précédente
  };

  // Reset du formulaire
  const handleReset = () => {
    setProfile({
      Region_Name: '',
      Age: 25,
      Ethnie: '',
      Profession: '',
      Ville_Actuelle: '',
      Type_Crime_Initial: '',
      Plateforme_Principale: ''
    });
    resetPrediction();
    setShowDetails(false);
  };

  // Couleurs de risque
  const getRiskStyling = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return {
          color: 'text-green-700',
          bg: 'bg-green-100',
          border: 'border-green-300',
          icon: 'ri-shield-check-line',
          label: 'Risque Faible'
        };
      case 'medium':
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          icon: 'ri-alert-line',
          label: 'Risque Modéré'
        };
      case 'high':
        return {
          color: 'text-orange-700',
          bg: 'bg-orange-100',
          border: 'border-orange-300',
          icon: 'ri-error-warning-line',
          label: 'Risque Élevé'
        };
      case 'critical':
        return {
          color: 'text-red-700',
          bg: 'bg-red-100',
          border: 'border-red-300',
          icon: 'ri-alarm-warning-line',
          label: 'Risque Critique'
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          icon: 'ri-question-line',
          label: 'Inconnu'
        };
    }
  };

  if (optionsLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des options...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!isServiceReady) {
    return (
      <Card>
        <div className="text-center py-12">
          <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Service non disponible</h3>
          <p className="text-gray-600">Le service de prédiction est actuellement indisponible.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Formulaire */}
      <Card>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🤖 Prédiction de Récidive IA
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Analysez un profil et prédisez le risque de récidive avec l'intelligence artificielle
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isServiceReady && (
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Service actif
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Région */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Région <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.Region_Name || ''}
                onChange={(e) => handleFieldChange('Region_Name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionner une région</option>
                {options?.regions?.map((region: string) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Âge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Âge <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={profile.Age || ''}
                onChange={(e) => handleFieldChange('Age', parseInt(e.target.value) || 0)}
                placeholder="Âge en années"
                min={0}
                max={120}
                className="w-full"
              />
            </div>

            {/* Ethnie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ethnie <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.Ethnie || ''}
                onChange={(e) => handleFieldChange('Ethnie', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionner une ethnie</option>
                {options?.ethnies?.map((ethnie: string) => (
                  <option key={ethnie} value={ethnie}>{ethnie}</option>
                ))}
              </select>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profession <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.Profession || ''}
                onChange={(e) => handleFieldChange('Profession', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionner une profession</option>
                {options?.professions?.map((profession: string) => (
                  <option key={profession} value={profession}>{profession}</option>
                ))}
              </select>
            </div>

            {/* Ville actuelle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ville actuelle <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.Ville_Actuelle || ''}
                onChange={(e) => handleFieldChange('Ville_Actuelle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionner une ville</option>
                {options?.villes?.map((ville: string) => (
                  <option key={ville} value={ville}>{ville}</option>
                ))}
              </select>
            </div>

            {/* Type de crime */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de crime initial <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.Type_Crime_Initial || ''}
                onChange={(e) => handleFieldChange('Type_Crime_Initial', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionner un type de crime</option>
                {options?.crimes?.map((crime: string) => (
                  <option key={crime} value={crime}>{crime}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Plateforme principale (span 2 colonnes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plateforme numérique principale <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.Plateforme_Principale || ''}
              onChange={(e) => handleFieldChange('Plateforme_Principale', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="">Sélectionner une plateforme</option>
              {options?.plateformes?.map((plateforme: string) => (
                <option key={plateforme} value={plateforme}>{plateforme}</option>
              ))}
            </select>
          </div>

          {/* Erreurs de validation */}
          {validationErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <h4 className="text-sm font-medium text-red-800 mb-2">Erreurs de validation :</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Erreur de prédiction */}
          {prediction.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-500 mr-2"></i>
                <span className="text-red-700">{prediction.error}</span>
              </div>
            </motion.div>
          )}

          {/* Boutons */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isValid || prediction.loading}
              className="flex-1"
            >
              {prediction.loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <i className="ri-brain-line mr-2"></i>
                  Prédire le risque
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="neuro"
              size="lg"
              onClick={handleReset}
            >
              <i className="ri-refresh-line mr-2"></i>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Résultat de la prédiction */}
      <AnimatePresence>
        {prediction.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-primary-200">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    🎯 Résultat de la Prédiction
                  </h3>
                  <Button
                    variant="neuro"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <i className={`ri-${showDetails ? 'eye-off' : 'eye'}-line mr-2`}></i>
                    {showDetails ? 'Masquer' : 'Détails'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Probabilité principale */}
                <div className="text-center">
                  <div className="mb-4">
                    <div className="text-5xl font-bold text-primary-600 mb-2">
                      {Math.round(prediction.data.recidive_probability * 100)}%
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Probabilité de récidive
                    </div>
                  </div>

                  {/* Niveau de risque */}
                  {(() => {
                    const styling = getRiskStyling(prediction.data.risk_level);
                    return (
                      <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${styling.bg} ${styling.border} ${styling.color}`}>
                        <i className={`${styling.icon} text-lg mr-2`}></i>
                        <span className="font-semibold">{styling.label}</span>
                      </div>
                    );
                  })()}

                  <div className="mt-4 text-sm text-gray-600">
                    Confiance: {Math.round(prediction.data.confidence * 100)}%
                  </div>
                </div>

                {/* Facteurs d'influence */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Facteurs d'influence :
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(prediction.data.factors).map(([factor, value]) => (
                      <div key={factor} className="flex items-center justify-between">
                        <span className="text-sm capitalize text-gray-700">
                          {factor.replace('_', ' ')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
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
              </div>

              {/* Détails avancés */}
              <AnimatePresence>
                {showDetails && prediction.data.metadata && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Métadonnées de prédiction :
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {prediction.data.metadata.model_version && (
                        <div>
                          <span className="text-gray-600">Modèle :</span>
                          <div className="font-mono text-gray-900">
                            v{prediction.data.metadata.model_version}
                          </div>
                        </div>
                      )}
                      {prediction.data.metadata.algorithm && (
                        <div>
                          <span className="text-gray-600">Algorithme :</span>
                          <div className="font-mono text-gray-900">
                            {prediction.data.metadata.algorithm}
                          </div>
                        </div>
                      )}
                      {prediction.data.metadata.prediction_time && (
                        <div>
                          <span className="text-gray-600">Calculé le :</span>
                          <div className="font-mono text-gray-900">
                            {new Date(prediction.data.metadata.prediction_time).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}