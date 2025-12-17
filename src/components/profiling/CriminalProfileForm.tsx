import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../base/Button';
import Input from '../base/Input';
import Card from '../base/Card';
import { usePredictionService } from '../../services/ml/predictionService';
import type { CriminalProfile, PredictionResult } from '../../services/ml/predictionService';

interface CriminalProfileFormProps {
  onPredictionResult?: (result: PredictionResult, profile: CriminalProfile) => void;
  initialProfile?: Partial<CriminalProfile>;
}

export default function CriminalProfileForm({ onPredictionResult, initialProfile }: CriminalProfileFormProps) {
  const [profile, setProfile] = useState<CriminalProfile>({
    Region_Name: initialProfile?.Region_Name || '',
    Age: initialProfile?.Age || 25,
    Ethnie: initialProfile?.Ethnie || '',
    Profession: initialProfile?.Profession || '',
    Ville_Actuelle: initialProfile?.Ville_Actuelle || '',
    Type_Crime_Initial: initialProfile?.Type_Crime_Initial || '',
    Plateforme_Principale: initialProfile?.Plateforme_Principale || ''
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { predict, getFieldOptions } = usePredictionService();
  const fieldOptions = getFieldOptions();

  const handleInputChange = (field: keyof CriminalProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Reset prediction when profile changes
    setPrediction(null);
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validation
      if (!profile.Region_Name || !profile.Ethnie || !profile.Profession || 
          !profile.Ville_Actuelle || !profile.Type_Crime_Initial || 
          !profile.Plateforme_Principale) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const result = await predict(profile);
      setPrediction(result);
      
      if (onPredictionResult) {
        onPredictionResult(result, profile);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la prédiction');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'ri-shield-check-line';
      case 'medium': return 'ri-alert-line';
      case 'high': return 'ri-error-warning-line';
      case 'critical': return 'ri-alarm-warning-line';
      default: return 'ri-question-line';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'Risque Faible';
      case 'medium': return 'Risque Modéré';
      case 'high': return 'Risque Élevé';
      case 'critical': return 'Risque Critique';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neuro-900 dark:text-white mb-2">
            Profil Criminel & Prédiction de Récidive
          </h2>
          <p className="text-neuro-600 dark:text-gray-400">
            Analysez le profil d'un individu et prédisez le risque de récidive grâce à l'intelligence artificielle
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <i className="ri-error-warning-line mr-2"></i>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Région */}
          <div>
            <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
              Région <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.Region_Name}
              onChange={(e) => handleInputChange('Region_Name', e.target.value)}
              className="w-full px-4 py-3 border border-neuro-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sélectionner une région</option>
              {fieldOptions.regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Âge */}
          <div>
            <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
              Âge <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={profile.Age}
              onChange={(e) => handleInputChange('Age', parseInt(e.target.value) || 0)}
              placeholder="Âge en années"
              min={10}
              max={100}
              className="w-full"
            />
          </div>

          {/* Ethnie */}
          <div>
            <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
              Ethnie <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.Ethnie}
              onChange={(e) => handleInputChange('Ethnie', e.target.value)}
              className="w-full px-4 py-3 border border-neuro-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sélectionner une ethnie</option>
              {fieldOptions.ethnies.map(ethnie => (
                <option key={ethnie} value={ethnie}>{ethnie}</option>
              ))}
            </select>
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
              Profession <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.Profession}
              onChange={(e) => handleInputChange('Profession', e.target.value)}
              className="w-full px-4 py-3 border border-neuro-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sélectionner une profession</option>
              {fieldOptions.professions.map(profession => (
                <option key={profession} value={profession}>{profession}</option>
              ))}
            </select>
          </div>

          {/* Ville Actuelle */}
          <div>
            <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
              Ville Actuelle <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.Ville_Actuelle}
              onChange={(e) => handleInputChange('Ville_Actuelle', e.target.value)}
              className="w-full px-4 py-3 border border-neuro-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sélectionner une ville</option>
              {fieldOptions.villes.map(ville => (
                <option key={ville} value={ville}>{ville}</option>
              ))}
            </select>
          </div>

          {/* Type Crime Initial */}
          <div>
            <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
              Type de Crime Initial <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.Type_Crime_Initial}
              onChange={(e) => handleInputChange('Type_Crime_Initial', e.target.value)}
              className="w-full px-4 py-3 border border-neuro-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sélectionner un type de crime</option>
              {fieldOptions.crimes.map(crime => (
                <option key={crime} value={crime}>{crime}</option>
              ))}
            </select>
          </div>

          {/* Plateforme Principale */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
              Plateforme Numérique Principale <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.Plateforme_Principale}
              onChange={(e) => handleInputChange('Plateforme_Principale', e.target.value)}
              className="w-full px-4 py-3 border border-neuro-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sélectionner une plateforme</option>
              {fieldOptions.plateformes.map(plateforme => (
                <option key={plateforme} value={plateforme}>{plateforme}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            variant="primary"
            onClick={handlePredict}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyse en cours...
              </>
            ) : (
              <>
                <i className="ri-brain-line mr-2"></i>
                Prédire la Récidive
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Résultats de prédiction */}
      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Risque principal */}
          <Card className={`border-2 ${getRiskColor(prediction.risk_level).replace('text-', 'border-').replace('bg-', '').replace('border-', 'border-').split(' ')[2]}`}>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${getRiskColor(prediction.risk_level)}`}>
                <i className={`${getRiskIcon(prediction.risk_level)} text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-bold text-neuro-900 dark:text-white mb-2">
                {getRiskLabel(prediction.risk_level)}
              </h3>
              <p className="text-4xl font-bold mb-2" style={{
                color: prediction.risk_level === 'critical' ? '#dc2626' :
                       prediction.risk_level === 'high' ? '#ea580c' :
                       prediction.risk_level === 'medium' ? '#d97706' : '#059669'
              }}>
                {Math.round(prediction.recidive_probability * 100)}%
              </p>
              <p className="text-neuro-600 dark:text-gray-400">
                Probabilité de récidive
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-neuro-500">
                  <i className="ri-shield-check-line"></i>
                  <span>Confiance: {Math.round(prediction.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Facteurs d'influence */}
          <Card>
            <h4 className="text-lg font-semibold text-neuro-900 dark:text-white mb-4">
              Facteurs d'influence
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(prediction.factors).map(([factor, influence]) => (
                <div key={factor} className="text-center">
                  <div className="bg-neuro-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-lg font-bold text-primary-600 mb-1">
                      {Math.round(influence * 100)}%
                    </div>
                    <div className="text-xs text-neuro-600 dark:text-gray-400 capitalize">
                      {factor.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommandations */}
          <Card className="bg-blue-50 border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">
              <i className="ri-lightbulb-line mr-2"></i>
              Recommandations
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              {prediction.risk_level === 'critical' && (
                <>
                  <p>• Surveillance renforcée et suivi rapproché requis</p>
                  <p>• Intervention immédiate des services sociaux</p>
                  <p>• Programme de réinsertion intensif recommandé</p>
                </>
              )}
              {prediction.risk_level === 'high' && (
                <>
                  <p>• Surveillance régulière recommandée</p>
                  <p>• Accompagnement social et professionnel</p>
                  <p>• Suivi psychologique si nécessaire</p>
                </>
              )}
              {prediction.risk_level === 'medium' && (
                <>
                  <p>• Suivi périodique conseillé</p>
                  <p>• Support à la réinsertion professionnelle</p>
                  <p>• Activités communautaires encouragées</p>
                </>
              )}
              {prediction.risk_level === 'low' && (
                <>
                  <p>• Suivi standard suffisant</p>
                  <p>• Encourager les activités positives</p>
                  <p>• Maintenir les liens sociaux sains</p>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}