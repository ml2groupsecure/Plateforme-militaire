import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import CriminalProfileForm from '../../components/profiling/CriminalProfileForm';
import type { CriminalProfile, PredictionResult } from '../../services/ml/predictionService';

export default function PredictionPage() {
  const [savedPredictions, setSavedPredictions] = useState<Array<{
    id: string;
    profile: CriminalProfile;
    result: PredictionResult;
    timestamp: Date;
  }>>([]);

  const handlePredictionResult = (result: PredictionResult, profile: CriminalProfile) => {
    const newPrediction = {
      id: crypto.randomUUID(),
      profile,
      result,
      timestamp: new Date()
    };
    
    setSavedPredictions(prev => [newPrediction, ...prev.slice(0, 9)]); // Garder les 10 dernières
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'ri-alarm-warning-line';
      case 'high': return 'ri-error-warning-line';
      case 'medium': return 'ri-alert-line';
      case 'low': return 'ri-shield-check-line';
      default: return 'ri-question-line';
    }
  };

  const exportPredictions = () => {
    const data = savedPredictions.map(pred => ({
      ...pred.profile,
      recidive_probability: pred.result.recidive_probability,
      risk_level: pred.result.risk_level,
      confidence: pred.result.confidence,
      timestamp: pred.timestamp.toISOString()
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `predictions_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Prédictions IA" subtitle="Prédiction de récidive par intelligence artificielle">
      <div className="space-y-8">
        {/* Header avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Prédictions totales
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {savedPredictions.length}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-brain-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">
                      Risque critique
                    </p>
                    <p className="text-3xl font-bold text-red-900">
                      {savedPredictions.filter(p => p.result.risk_level === 'critical').length}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-alarm-warning-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      Risque faible
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {savedPredictions.filter(p => p.result.risk_level === 'low').length}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-shield-check-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">
                      Confiance moyenne
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {savedPredictions.length > 0 
                        ? Math.round(savedPredictions.reduce((sum, p) => sum + p.result.confidence, 0) / savedPredictions.length * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-award-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Formulaire de prédiction - NOUVEAU COMPOSANT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <CriminalProfileForm onPredictionResult={handlePredictionResult} />
        </motion.div>

        {/* Historique des prédictions récentes */}
        {savedPredictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neuro-900 dark:text-white">
                  Prédictions récentes
                </h2>
                <div className="flex space-x-3">
                  <Button
                    variant="neuro"
                    size="sm"
                    onClick={exportPredictions}
                  >
                    <i className="ri-download-line mr-2"></i>
                    Exporter
                  </Button>
                  <Button
                    variant="neuro"
                    size="sm"
                    onClick={() => setSavedPredictions([])}
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Vider
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {savedPredictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-neuro-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Profil de base */}
                        <div>
                          <h4 className="font-semibold text-neuro-900 dark:text-white mb-1">
                            Profil
                          </h4>
                          <p className="text-sm text-neuro-600 dark:text-gray-400">
                            Âge: {prediction.profile.Age} ans
                          </p>
                          <p className="text-sm text-neuro-600 dark:text-gray-400">
                            {prediction.profile.Profession}
                          </p>
                          <p className="text-sm text-neuro-600 dark:text-gray-400">
                            {prediction.profile.Region_Name}
                          </p>
                        </div>

                        {/* Crime */}
                        <div>
                          <h4 className="font-semibold text-neuro-900 dark:text-white mb-1">
                            Crime initial
                          </h4>
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            {prediction.profile.Type_Crime_Initial}
                          </span>
                        </div>

                        {/* Résultat */}
                        <div>
                          <h4 className="font-semibold text-neuro-900 dark:text-white mb-1">
                            Résultat
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(prediction.result.risk_level)}`}>
                              <i className={`${getRiskIcon(prediction.result.risk_level)} mr-1`}></i>
                              {Math.round(prediction.result.recidive_probability * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-neuro-500 dark:text-gray-500 mt-1">
                            Confiance: {Math.round(prediction.result.confidence * 100)}%
                          </p>
                        </div>

                        {/* Horodatage */}
                        <div>
                          <h4 className="font-semibold text-neuro-900 dark:text-white mb-1">
                            Date
                          </h4>
                          <p className="text-sm text-neuro-600 dark:text-gray-400">
                            {prediction.timestamp.toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-neuro-500 dark:text-gray-500">
                            {prediction.timestamp.toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Guide d'utilisation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-information-line text-xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Comment utiliser la prédiction de récidive
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• <strong>Remplissez tous les champs requis</strong> - Plus les informations sont précises, plus la prédiction sera fiable</p>
                  <p>• <strong>Interprétez les résultats</strong> - Un score élevé indique un risque accru de récidive</p>
                  <p>• <strong>Utilisez les recommandations</strong> - Suivez les suggestions d'intervention basées sur le niveau de risque</p>
                  <p>• <strong>Contextualisez les résultats</strong> - La prédiction IA doit compléter, non remplacer, l'évaluation humaine</p>
                  <p>• <strong>Respectez l'éthique</strong> - Utilisez ces outils de manière équitable et transparente</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}