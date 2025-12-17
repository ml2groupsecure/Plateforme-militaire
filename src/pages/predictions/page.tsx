
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AIModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'neural_network';
  status: 'active' | 'inactive' | 'training' | 'error';
  accuracy: number;
  lastTrained: string;
  description: string;
  apiEndpoint?: string;
}

interface Prediction {
  id: string;
  type: string;
  zone: string;
  probability: number;
  timeframe: string;
  confidence: number;
  factors: string[];
  timestamp: Date;
}

export default function PredictionsPage() {
  const [showAISettings, setShowAISettings] = useState(false);
  const [showModelManager, setShowModelManager] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [isRunningPrediction, setIsRunningPrediction] = useState(false);

  const [aiSettings, setAiSettings] = useState({
    openaiApiKey: '',
    anthropicApiKey: '',
    customModelUrl: '',
    predictionInterval: 60,
    confidenceThreshold: 0.75,
    enableRealTime: true
  });

  const [models] = useState<AIModel[]>([
    {
      id: '1',
      name: 'Prédicteur de criminalité spatiale',
      type: 'neural_network',
      status: 'active',
      accuracy: 87.5,
      lastTrained: '2024-01-15',
      description: 'Modèle de deep learning pour prédire les zones à risque criminel élevé',
      apiEndpoint: 'https://api.seenpredyct.com/models/spatial-crime'
    },
    {
      id: '2',
      name: 'Classificateur de types de crimes',
      type: 'classification',
      status: 'active',
      accuracy: 92.3,
      lastTrained: '2024-01-12',
      description: 'Modèle de classification pour identifier les types de crimes probables',
      apiEndpoint: 'https://api.seenpredyct.com/models/crime-classifier'
    },
    {
      id: '3',
      name: 'Analyseur de patterns temporels',
      type: 'regression',
      status: 'training',
      accuracy: 78.9,
      lastTrained: '2024-01-10',
      description: 'Modèle de régression pour analyser les tendances temporelles',
      apiEndpoint: 'https://api.seenpredyct.com/models/temporal-analysis'
    },
    {
      id: '4',
      name: 'Détecteur d\'anomalies',
      type: 'clustering',
      status: 'inactive',
      accuracy: 84.2,
      lastTrained: '2024-01-08',
      description: 'Modèle de clustering pour détecter les comportements anormaux'
    }
  ]);

  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      type: 'Vol à main armée',
      zone: 'Sandaga',
      probability: 0.89,
      timeframe: 'Prochaines 24h',
      confidence: 0.92,
      factors: ['Densité de population élevée', 'Historique criminel', 'Événement commercial'],
      timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'Agression',
      zone: 'UCAD',
      probability: 0.76,
      timeframe: 'Prochaines 48h',
      confidence: 0.84,
      factors: ['Période d\'examens', 'Faible éclairage', 'Affluence étudiante'],
      timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'Fraude',
      zone: 'Plateau',
      probability: 0.82,
      timeframe: 'Prochaines 72h',
      confidence: 0.88,
      factors: ['Zone d\'affaires', 'Fin de mois', 'Activité bancaire intense'],
      timestamp: new Date(Date.now() + 12 * 60 * 60 * 1000)
    }
  ]);

  const [realTimeAlerts] = useState([
    {
      id: '1',
      type: 'Prédiction critique',
      message: 'Risque élevé de vol à Sandaga dans les 2 prochaines heures',
      probability: 0.94,
      zone: 'Sandaga',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '2',
      type: 'Anomalie détectée',
      message: 'Pattern inhabituel d\'activité criminelle à Pikine',
      probability: 0.78,
      zone: 'Pikine',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    }
  ]);

  const predictionData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Prédictions réalisées',
        data: [23, 19, 31, 28, 35, 42, 38],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Incidents réels',
        data: [21, 18, 29, 26, 33, 39, 35],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const accuracyData = {
    labels: ['Spatial', 'Classification', 'Temporel', 'Anomalies'],
    datasets: [
      {
        label: 'Précision (%)',
        data: [87.5, 92.3, 78.9, 84.2],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12,
            weight: 500,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600,
        },
        bodyFont: {
          size: 13,
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-600 bg-success-100';
      case 'training': return 'text-warning-600 bg-warning-100';
      case 'inactive': return 'text-neuro-600 bg-neuro-100';
      case 'error': return 'text-danger-600 bg-danger-100';
      default: return 'text-neuro-600 bg-neuro-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'training': return 'Entraînement';
      case 'inactive': return 'Inactif';
      case 'error': return 'Erreur';
      default: return status;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'text-danger-600 bg-danger-100';
    if (probability >= 0.6) return 'text-warning-600 bg-warning-100';
    return 'text-success-600 bg-success-100';
  };

  const handleRunPrediction = async () => {
    setIsRunningPrediction(true);
    // Simulate AI prediction process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRunningPrediction(false);
    alert('Prédiction terminée!\n\n3 nouvelles prédictions générées\n2 alertes critiques créées\nPrécision moyenne: 89.2%');
  };

  const handleExportResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      predictions: predictions,
      models: models.filter(m => m.status === 'active'),
      accuracy: {
        overall: 87.2,
        byModel: models.map(m => ({ name: m.name, accuracy: m.accuracy }))
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions-ia-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveAISettings = () => {
    // Simulate saving AI settings
    console.log('Paramètres IA sauvegardés:', aiSettings);
    setShowAISettings(false);
    alert('Paramètres IA sauvegardés avec succès!');
  };

  const handleTestConnection = (model: AIModel) => {
    // Simulate API connection test
    alert(`Test de connexion pour ${model.name}:\n\n✅ Connexion réussie\n✅ API accessible\n✅ Modèle opérationnel\n\nLatence: 245ms\nStatut: Actif`);
  };

  const handleToggleModel = (modelId: string, activate: boolean) => {
    // Simulate model activation/deactivation
    const action = activate ? 'activé' : 'désactivé';
    alert(`Modèle ${action} avec succès!`);
  };

  const handleCreateAlert = () => {
    setShowCreateAlert(false);
    alert('Alerte créée avec succès!\n\nType: Prédiction critique\nZone: Sandaga\nSeuil: 85%\nNotifications: Email + SMS');
  };

  return (
    <Layout title="Prédictions" subtitle="Modèles prédictifs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neuro-900 dark:text-white">Prédictions IA</h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Intelligence artificielle pour la prédiction criminelle
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="neuro" size="sm" onClick={() => setShowAISettings(true)}>
              <i className="ri-settings-3-line mr-2"></i>
              Paramètres IA
            </Button>
            <Button variant="neuro" size="sm" onClick={() => setShowModelManager(true)}>
              <i className="ri-brain-line mr-2"></i>
              Gestion des modèles
            </Button>
            <Button variant="primary" size="sm" onClick={handleRunPrediction} disabled={isRunningPrediction}>
              {isRunningPrediction ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <i className="ri-play-line mr-2"></i>
                  Lancer prédiction
                </>
              )}
            </Button>
          </div>
        </div>

        {/* AI Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Modèles actifs</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {models.filter(m => m.status === 'active').length}
                </p>
                <p className="text-xs text-success-600 mt-1">
                  Sur {models.length} modèles
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-brain-line text-xl text-success-600 dark:text-success-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Précision moyenne</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">87.2%</p>
                <p className="text-xs text-success-600 mt-1">
                  +2.1% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-target-line text-xl text-primary-600 dark:text-primary-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Prédictions/jour</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">156</p>
                <p className="text-xs text-warning-600 mt-1">
                  +8% cette semaine
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-line-chart-line text-xl text-warning-600 dark:text-warning-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Alertes critiques</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {predictions.filter(p => p.probability >= 0.8).length}
                </p>
                <p className="text-xs text-danger-600 mt-1">
                  Dernières 24h
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-error-warning-line text-xl text-danger-600 dark:text-red-400"></i>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-time Predictions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-neuro-900 dark:text-white">Prédictions en temps réel</h2>
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex space-x-2">
              <Button variant="neuro" size="sm" onClick={() => setShowCreateAlert(true)}>
                <i className="ri-add-line mr-2"></i>
                Créer alerte
              </Button>
              <Button variant="primary" size="sm">
                <i className="ri-eye-line mr-2"></i>
                Voir tout
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {realTimeAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-danger-50 dark:bg-red-900/20 rounded-lg border-l-4 border-l-danger-500"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="ri-error-warning-line text-danger-600 text-lg"></i>
                    <div>
                      <p className="font-medium text-neuro-900 dark:text-white">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-neuro-600 dark:text-gray-400">
                        <span>Zone: {alert.zone}</span>
                        <span>Probabilité: {(alert.probability * 100).toFixed(1)}%</span>
                        <span>Il y a {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="danger" size="sm">
                      <i className="ri-alarm-line mr-1"></i>
                      Alerter
                    </Button>
                    <Button variant="neuro" size="sm">
                      <i className="ri-eye-line"></i>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Predictions List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neuro-900 dark:text-white">
              Prédictions actives ({predictions.length})
            </h2>
            <div className="flex space-x-2">
              <Button variant="neuro" size="sm">
                <i className="ri-filter-line mr-2"></i>
                Filtrer
              </Button>
              <Button variant="primary" size="sm" onClick={handleExportResults}>
                <i className="ri-download-line mr-2"></i>
                Exporter résultats
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neuro-50 dark:bg-gray-700 rounded-xl p-6 border border-neuro-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-neuro-900 dark:text-white">{prediction.type}</h3>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">{prediction.zone}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(prediction.probability)}`}>
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neuro-600 dark:text-gray-400">Période:</span>
                    <span className="text-neuro-900 dark:text-white font-medium">{prediction.timeframe}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neuro-600 dark:text-gray-400">Confiance:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-neuro-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${prediction.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-neuro-900 dark:text-white font-medium">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-neuro-600 dark:text-gray-400 block mb-2">Facteurs:</span>
                    <div className="flex flex-wrap gap-1">
                      {prediction.factors.slice(0, 2).map((factor, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary-100 dark:bg-blue-900/30 text-primary-700 dark:text-blue-400 rounded text-xs"
                        >
                          {factor}
                        </span>
                      ))}
                      {prediction.factors.length > 2 && (
                        <span className="px-2 py-1 bg-neuro-100 dark:bg-gray-600 text-neuro-600 dark:text-gray-400 rounded text-xs">
                          +{prediction.factors.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedPrediction(prediction)}
                    >
                      <i className="ri-eye-line mr-1"></i>
                      Détails
                    </Button>
                    <Button variant="neuro" size="sm">
                      <i className="ri-alarm-line"></i>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Précision des prédictions
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <div className="h-80">
              <Line data={predictionData} options={chartOptions} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Performance des modèles
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <div className="h-80">
              <Bar data={accuracyData} options={barOptions} />
            </div>
          </Card>
        </div>

        {/* AI Settings Modal */}
        <AnimatePresence>
          {showAISettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Paramètres IA
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowAISettings(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-neuro-900 dark:text-white mb-4">Configuration API externes</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                          Clé API OpenAI
                        </label>
                        <Input
                          type="password"
                          value={aiSettings.openaiApiKey}
                          onChange={(e) => setAiSettings({...aiSettings, openaiApiKey: e.target.value})}
                          placeholder="sk-..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                          Clé API Anthropic
                        </label>
                        <Input
                          type="password"
                          value={aiSettings.anthropicApiKey}
                          onChange={(e) => setAiSettings({...aiSettings, anthropicApiKey: e.target.value})}
                          placeholder="sk-ant-..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                          URL modèle personnalisé
                        </label>
                        <Input
                          type="url"
                          value={aiSettings.customModelUrl}
                          onChange={(e) => setAiSettings({...aiSettings, customModelUrl: e.target.value})}
                          placeholder="https://votre-modele.com/api"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neuro-900 dark:text-white mb-4">Paramètres de prédiction</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                          Intervalle de prédiction (minutes)
                        </label>
                        <Input
                          type="number"
                          value={aiSettings.predictionInterval}
                          onChange={(e) => setAiSettings({...aiSettings, predictionInterval: parseInt(e.target.value)})}
                          min="15"
                          max="1440"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                          Seuil de confiance
                        </label>
                        <Input
                          type="number"
                          step="0.05"
                          min="0.5"
                          max="1"
                          value={aiSettings.confidenceThreshold}
                          onChange={(e) => setAiSettings({...aiSettings, confidenceThreshold: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-neuro-900 dark:text-white">Prédictions en temps réel</h4>
                        <p className="text-sm text-neuro-600 dark:text-gray-400">
                          Activer les prédictions automatiques continues
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={aiSettings.enableRealTime}
                        onChange={(e) => setAiSettings({...aiSettings, enableRealTime: e.target.checked})}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="primary" className="flex-1" onClick={handleSaveAISettings}>
                      <i className="ri-save-line mr-2"></i>
                      Sauvegarder
                    </Button>
                    <Button variant="neuro" onClick={() => setShowAISettings(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Model Manager Modal */}
        <AnimatePresence>
          {showModelManager && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Gestion des modèles IA
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowModelManager(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="space-y-6">
                  {models.map((model) => (
                    <div key={model.id} className="bg-neuro-50 dark:bg-gray-700 rounded-lg p-6 border border-neuro-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-neuro-900 dark:text-white">{model.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                              {getStatusLabel(model.status)}
                            </span>
                          </div>
                          <p className="text-sm text-neuro-600 dark:text-gray-400 mb-3">{model.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-neuro-600 dark:text-gray-400">Type:</span>
                              <p className="font-medium text-neuro-900 dark:text-white capitalize">
                                {model.type.replace('_', ' ')}
                              </p>
                            </div>
                            <div>
                              <span className="text-neuro-600 dark:text-gray-400">Précision:</span>
                              <p className="font-medium text-neuro-900 dark:text-white">{model.accuracy}%</p>
                            </div>
                            <div>
                              <span className="text-neuro-600 dark:text-gray-400">Dernier entraînement:</span>
                              <p className="font-medium text-neuro-900 dark:text-white">
                                {new Date(model.lastTrained).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div>
                              <span className="text-neuro-600 dark:text-gray-400">Endpoint:</span>
                              <p className="font-medium text-neuro-900 dark:text-white text-xs truncate">
                                {model.apiEndpoint ? '✅ Configuré' : '❌ Non configuré'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleTestConnection(model)}
                        >
                          <i className="ri-wifi-line mr-2"></i>
                          Tester la connexion
                        </Button>
                        {model.status === 'active' ? (
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => handleToggleModel(model.id, false)}
                          >
                            <i className="ri-pause-line mr-2"></i>
                            Désactiver
                          </Button>
                        ) : (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleToggleModel(model.id, true)}
                          >
                            <i className="ri-play-line mr-2"></i>
                            Activer
                          </Button>
                        )}
                        <Button variant="neuro" size="sm">
                          <i className="ri-settings-3-line mr-2"></i>
                          Configurer
                        </Button>
                        <Button variant="neuro" size="sm">
                          <i className="ri-refresh-line mr-2"></i>
                          Réentraîner
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button variant="primary">
                    <i className="ri-add-line mr-2"></i>
                    Ajouter un modèle
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Alert Modal */}
        <AnimatePresence>
          {showCreateAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neuro-900 dark:text-white">
                    Créer une alerte
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowCreateAlert(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                      Type d'alerte
                    </label>
                    <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="prediction">Prédiction critique</option>
                      <option value="anomaly">Anomalie détectée</option>
                      <option value="threshold">Seuil dépassé</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                      Zone de surveillance
                    </label>
                    <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="sandaga">Sandaga</option>
                      <option value="ucad">UCAD</option>
                      <option value="plateau">Plateau</option>
                      <option value="pikine">Pikine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                      Seuil de probabilité (%)
                    </label>
                    <Input type="number" min="50" max="100" defaultValue="85" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300">
                      Notifications
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Email</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-neuro-700 dark:text-gray-300">SMS</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Notification push</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button variant="primary" className="flex-1" onClick={handleCreateAlert}>
                    <i className="ri-alarm-line mr-2"></i>
                    Créer l'alerte
                  </Button>
                  <Button variant="neuro" onClick={() => setShowCreateAlert(false)}>
                    Annuler
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
