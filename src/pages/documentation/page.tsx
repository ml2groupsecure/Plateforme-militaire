import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

export default function Documentation() {
  const [selectedSection, setSelectedSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      id: 'overview',
      title: 'Vue d\'ensemble',
      icon: 'ri-home-line',
      content: {
        title: 'CriminalytiX - Système d\'analyse criminelle',
        description: 'Plateforme intelligente d\'analyse de données criminelles et de cybersécurité pour les forces de l\'ordre.',
        features: [
          'Analyse prédictive des crimes',
          'Profilage criminel avancé',
          'Optimisation des ressources policières',
          'Cartes interactives en temps réel',
          'Intelligence artificielle intégrée',
          'Système d\'alertes automatisées'
        ]
      }
    },
    {
      id: 'analysis',
      title: 'Module d\'analyse',
      icon: 'ri-bar-chart-line',
      content: {
        title: 'Analyse des modèles de criminalité',
        description: 'Identification des tendances et patterns criminels à travers des analyses statistiques avancées.',
        objectives: [
          'Détecter les schémas récurrents dans les données criminelles',
          'Identifier les zones et périodes à risque élevé',
          'Analyser les corrélations entre facteurs socio-économiques et criminalité',
          'Générer des insights actionables pour les forces de l\'ordre'
        ],
        methods: [
          'Analyse temporelle des séries de données',
          'Analyse spatiale et géostatistique',
          'Modélisation de corrélations multivariées',
          'Clustering et segmentation des incidents'
        ],
        limitations: [
          'Dépendance à la qualité des données d\'entrée',
          'Nécessité de mise à jour régulière des modèles',
          'Facteurs externes non mesurables peuvent affecter les résultats'
        ]
      }
    },
    {
      id: 'profiling',
      title: 'Profilage criminel',
      icon: 'ri-user-search-line',
      content: {
        title: 'Système de profilage comportemental',
        description: 'Évaluation des risques et analyse comportementale des suspects et délinquants.',
        objectives: [
          'Évaluer le risque de récidive individuel',
          'Identifier les profils à haut risque',
          'Optimiser les stratégies d\'intervention',
          'Prédire les comportements criminels futurs'
        ],
        methods: [
          'Analyse des antécédents criminels',
          'Évaluation des facteurs de risque psychosociaux',
          'Modélisation comportementale prédictive',
          'Scoring de risque multi-critères'
        ],
        ethics: [
          'Respect de la vie privée et des droits individuels',
          'Utilisation équitable et non discriminatoire',
          'Transparence des algorithmes de scoring',
          'Révision régulière des critères d\'évaluation'
        ]
      }
    },
    {
      id: 'predictions',
      title: 'Modélisation prédictive',
      icon: 'ri-brain-line',
      content: {
        title: 'Intelligence artificielle prédictive',
        description: 'Système d\'IA pour la prévention et la prédiction des activités criminelles.',
        models: [
          {
            name: 'Prédiction criminelle spatiale',
            type: 'Random Forest + Neural Networks',
            accuracy: '89%',
            features: 'Localisation, historique, facteurs socio-économiques',
            training_data: '50,000+ incidents sur 5 ans'
          },
          {
            name: 'Risque de récidive',
            type: 'Gradient Boosting',
            accuracy: '85%',
            features: 'Antécédents, profil psychosocial, environnement',
            training_data: '15,000+ profils individuels'
          },
          {
            name: 'Optimisation des ressources',
            type: 'Optimisation linéaire + ML',
            accuracy: '92%',
            features: 'Demande prédite, disponibilité, contraintes',
            training_data: 'Données opérationnelles temps réel'
          }
        ],
        performance: [
          'Précision moyenne: 88.7%',
          'Temps de réponse: < 2.5 secondes',
          'Mise à jour: Temps réel',
          'Capacité: 10,000+ prédictions/heure'
        ]
      }
    },
    {
      id: 'security',
      title: 'Cybersécurité',
      icon: 'ri-shield-check-line',
      content: {
        title: 'Agent IA de cybersécurité',
        description: 'Système de surveillance et de détection d\'anomalies en temps réel.',
        capabilities: [
          'Surveillance des connexions utilisateurs',
          'Détection d\'intrusions et d\'anomalies',
          'Analyse comportementale des accès',
          'Alertes automatisées en temps réel'
        ],
        algorithms: [
          'Détection d\'anomalies par isolation forest',
          'Analyse de patterns de connexion',
          'Machine learning pour la détection de fraudes',
          'Scoring de risque comportemental'
        ],
        alerts: [
          'Tentatives de connexion multiples échouées',
          'Accès depuis des locations géographiques suspectes',
          'Patterns d\'utilisation inhabituels',
          'Modifications non autorisées de données'
        ]
      }
    },
    {
      id: 'api',
      title: 'API et Intégrations',
      icon: 'ri-code-line',
      content: {
        title: 'Documentation technique API',
        description: 'Guide d\'intégration et d\'utilisation des APIs CriminalytiX.',
        endpoints: [
          {
            method: 'GET',
            path: '/api/v1/crimes',
            description: 'Récupérer la liste des crimes',
            auth: 'Bearer Token requis'
          },
          {
            method: 'POST',
            path: '/api/v1/predictions',
            description: 'Demander une prédiction IA',
            auth: 'Bearer Token requis'
          },
          {
            method: 'GET',
            path: '/api/v1/profiles/{id}',
            description: 'Obtenir un profil criminel',
            auth: 'Bearer Token + Role Admin'
          }
        ],
        authentication: [
          'JWT Bearer Token obligatoire',
          'Expiration: 24 heures',
          'Renouvellement automatique',
          'Rôles: admin, agent'
        ]
      }
    }
  ];

  const currentSection = sections.find(s => s.id === selectedSection);

  return (
    <Layout title="Documentation" subtitle="Guide d'utilisation et documentation technique">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Menu latéral */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <Card className="sticky top-6">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    selectedSection === section.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-neuro-600 hover:bg-neuro-100 hover:text-neuro-800'
                  }`}
                >
                  <i className={`${section.icon} mr-3`}></i>
                  <span className="text-sm">{section.title}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-neuro-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <i className="ri-customer-service-2-line text-primary-600 text-xl"></i>
                </div>
                <h4 className="font-medium text-neuro-900 mb-1">Besoin d'aide ?</h4>
                <p className="text-xs text-neuro-600 mb-3">Contactez notre support technique</p>
                <Button variant="primary" size="sm" className="w-full">
                  <i className="ri-phone-line mr-2"></i>
                  Support
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          <motion.div
            key={selectedSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-neuro-900 mb-2">
                    {currentSection?.content.title}
                  </h1>
                  <p className="text-neuro-600">{currentSection?.content.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="neuro" size="sm">
                    <i className="ri-bookmark-line mr-2"></i>
                    Marquer
                  </Button>
                  <Button variant="neuro" size="sm">
                    <i className="ri-share-line mr-2"></i>
                    Partager
                  </Button>
                </div>
              </div>

              {/* Contenu spécifique par section */}
              {selectedSection === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-3">Fonctionnalités principales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSection.content.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-neuro-50 rounded-lg">
                          <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                            <i className="ri-check-line text-success-600"></i>
                          </div>
                          <span className="text-neuro-900">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary-50 to-success-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-neuro-900 mb-3">Architecture système</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                          <i className="ri-reactjs-line text-primary-600 text-2xl"></i>
                        </div>
                        <h4 className="font-medium text-neuro-900">Frontend</h4>
                        <p className="text-sm text-neuro-600">React + TypeScript</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-success-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                          <i className="ri-database-2-line text-success-600 text-2xl"></i>
                        </div>
                        <h4 className="font-medium text-neuro-900">Backend</h4>
                        <p className="text-sm text-neuro-600">Supabase + PostgreSQL</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-warning-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                          <i className="ri-brain-line text-warning-600 text-2xl"></i>
                        </div>
                        <h4 className="font-medium text-neuro-900">IA</h4>
                        <p className="text-sm text-neuro-600">Python + ML Models</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedSection === 'analysis' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-3">Objectifs</h3>
                    <ul className="space-y-2">
                      {currentSection.content.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                            <i className="ri-target-line text-primary-600 text-sm"></i>
                          </div>
                          <span className="text-neuro-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-3">Méthodes utilisées</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSection.content.methods.map((method, index) => (
                        <div key={index} className="p-4 border border-neuro-200 rounded-lg">
                          <h4 className="font-medium text-neuro-900 mb-2">{method.split(' ')[0]} {method.split(' ')[1]}</h4>
                          <p className="text-sm text-neuro-600">{method}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-warning-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neuro-900 mb-3">
                      <i className="ri-alert-line text-warning-600 mr-2"></i>
                      Limitations
                    </h3>
                    <ul className="space-y-1">
                      {currentSection.content.limitations.map((limitation, index) => (
                        <li key={index} className="text-sm text-neuro-700">• {limitation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedSection === 'predictions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Modèles IA déployés</h3>
                    <div className="space-y-4">
                      {currentSection.content.models.map((model, index) => (
                        <div key={index} className="border border-neuro-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-neuro-900">{model.name}</h4>
                              <p className="text-sm text-neuro-600">{model.type}</p>
                            </div>
                            <div className="text-right">
                              <span className="bg-success-100 text-success-800 px-2 py-1 rounded-full text-xs font-medium">
                                {model.accuracy}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-neuro-700">Caractéristiques :</span>
                              <p className="text-neuro-600">{model.features}</p>
                            </div>
                            <div>
                              <span className="font-medium text-neuro-700">Données d'entraînement :</span>
                              <p className="text-neuro-600">{model.training_data}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neuro-900 mb-3">Performance globale</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentSection.content.performance.map((perf, index) => (
                        <div key={index} className="text-center">
                          <p className="text-sm text-neuro-600 mb-1">{perf.split(':')[0]}</p>
                          <p className="font-semibold text-neuro-900">{perf.split(':')[1]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedSection === 'api' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Endpoints disponibles</h3>
                    <div className="space-y-3">
                      {currentSection.content.endpoints.map((endpoint, index) => (
                        <div key={index} className="border border-neuro-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              endpoint.method === 'GET' ? 'bg-success-100 text-success-800' :
                              endpoint.method === 'POST' ? 'bg-primary-100 text-primary-800' :
                              'bg-warning-100 text-warning-800'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="bg-neuro-100 px-2 py-1 rounded text-sm">{endpoint.path}</code>
                          </div>
                          <p className="text-sm text-neuro-700 mb-2">{endpoint.description}</p>
                          <p className="text-xs text-neuro-500">{endpoint.auth}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neuro-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neuro-900 mb-3">Authentification</h3>
                    <ul className="space-y-1 text-sm">
                      {currentSection.content.authentication.map((auth, index) => (
                        <li key={index} className="text-neuro-700">• {auth}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>

            {/* Sections additionnelles par type */}
            {(selectedSection === 'profiling' || selectedSection === 'security') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSection.content.objectives && (
                  <Card>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Objectifs</h3>
                    <ul className="space-y-2">
                      {currentSection.content.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                            <i className="ri-check-line text-primary-600 text-sm"></i>
                          </div>
                          <span className="text-sm text-neuro-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {currentSection.content.capabilities && (
                  <Card>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Capacités</h3>
                    <ul className="space-y-2">
                      {currentSection.content.capabilities.map((capability, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center mt-0.5">
                            <i className="ri-shield-check-line text-success-600 text-sm"></i>
                          </div>
                          <span className="text-sm text-neuro-700">{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {currentSection.content.methods && (
                  <Card>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Méthodes</h3>
                    <ul className="space-y-2">
                      {currentSection.content.methods.map((method, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-warning-100 rounded-full flex items-center justify-center mt-0.5">
                            <i className="ri-settings-3-line text-warning-600 text-sm"></i>
                          </div>
                          <span className="text-sm text-neuro-700">{method}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {currentSection.content.algorithms && (
                  <Card>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Algorithmes</h3>
                    <ul className="space-y-2">
                      {currentSection.content.algorithms.map((algorithm, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                            <i className="ri-cpu-line text-primary-600 text-sm"></i>
                          </div>
                          <span className="text-sm text-neuro-700">{algorithm}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {currentSection.content.ethics && (
                  <Card>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Considérations éthiques</h3>
                    <ul className="space-y-2">
                      {currentSection.content.ethics.map((ethic, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center mt-0.5">
                            <i className="ri-shield-user-line text-success-600 text-sm"></i>
                          </div>
                          <span className="text-sm text-neuro-700">{ethic}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {currentSection.content.alerts && (
                  <Card>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Types d'alertes</h3>
                    <ul className="space-y-2">
                      {currentSection.content.alerts.map((alert, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-danger-100 rounded-full flex items-center justify-center mt-0.5">
                            <i className="ri-alarm-warning-line text-danger-600 text-sm"></i>
                          </div>
                          <span className="text-sm text-neuro-700">{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}