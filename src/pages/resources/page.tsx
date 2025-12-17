
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

interface Agent {
  id: string;
  name: string;
  badge: string;
  status: 'available' | 'busy' | 'patrol' | 'offline';
  location: string;
  phone: string;
  specialization: string;
  experience: number;
  currentAssignment?: string;
}

interface Vehicle {
  id: string;
  type: string;
  plate: string;
  status: 'available' | 'in_use' | 'maintenance';
  location: string;
  fuel: number;
  assignedAgent?: string;
}

export default function ResourcesPage() {
  const [selectedRegion, setSelectedRegion] = useState('dakar');
  const [showNewAllocation, setShowNewAllocation] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState({
    priority: 'response_time',
    maxDistance: 10,
    minAgents: 2
  });

  const [agents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Commissaire Diop',
      badge: 'SN001',
      status: 'available',
      location: 'Sandaga',
      phone: '+221 77 123 4567',
      specialization: 'Enquêtes criminelles',
      experience: 15,
      currentAssignment: undefined
    },
    {
      id: '2',
      name: 'Inspecteur Fall',
      badge: 'SN002',
      status: 'patrol',
      location: 'UCAD',
      phone: '+221 77 234 5678',
      specialization: 'Patrouille urbaine',
      experience: 8,
      currentAssignment: 'Patrouille secteur UCAD'
    },
    {
      id: '3',
      name: 'Agent Ndiaye',
      badge: 'SN003',
      status: 'busy',
      location: 'Plateau',
      phone: '+221 77 345 6789',
      specialization: 'Circulation',
      experience: 5,
      currentAssignment: 'Intervention vol à main armée'
    },
    {
      id: '4',
      name: 'Lieutenant Sow',
      badge: 'SN004',
      status: 'available',
      location: 'Pikine',
      phone: '+221 77 456 7890',
      specialization: 'Stupéfiants',
      experience: 12,
      currentAssignment: undefined
    }
  ]);

  const [vehicles] = useState<Vehicle[]>([
    {
      id: '1',
      type: 'Voiture de patrouille',
      plate: 'DK-001-SN',
      status: 'available',
      location: 'Commissariat Central',
      fuel: 85,
      assignedAgent: undefined
    },
    {
      id: '2',
      type: 'Moto de police',
      plate: 'DK-002-SN',
      status: 'in_use',
      location: 'UCAD',
      fuel: 60,
      assignedAgent: 'Inspecteur Fall'
    },
    {
      id: '3',
      type: 'Fourgon',
      plate: 'DK-003-SN',
      status: 'maintenance',
      location: 'Garage central',
      fuel: 40,
      assignedAgent: undefined
    }
  ]);

  const regions = [
    { value: 'dakar', label: 'Dakar' },
    { value: 'pikine', label: 'Pikine' },
    { value: 'guediawaye', label: 'Guédiawaye' },
    { value: 'rufisque', label: 'Rufisque' },
    { value: 'keur_massar', label: 'Keur Massar' },
    { value: 'thies', label: 'Thiès' },
    { value: 'saint_louis', label: 'Saint-Louis' },
    { value: 'kaolack', label: 'Kaolack' },
    { value: 'ziguinchor', label: 'Ziguinchor' },
    { value: 'tambacounda', label: 'Tambacounda' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-success-600 bg-success-100';
      case 'busy': return 'text-danger-600 bg-danger-100';
      case 'patrol': return 'text-warning-600 bg-warning-100';
      case 'offline': return 'text-neuro-600 bg-neuro-100';
      case 'in_use': return 'text-warning-600 bg-warning-100';
      case 'maintenance': return 'text-danger-600 bg-danger-100';
      default: return 'text-neuro-600 bg-neuro-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'patrol': return 'En patrouille';
      case 'offline': return 'Hors service';
      case 'in_use': return 'En service';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const handleLocateAgent = (agent: Agent) => {
    // Simulate GPS tracking
    alert(`Localisation de ${agent.name}: ${agent.location}\nTéléphone: ${agent.phone}`);
  };

  const handleCallAgent = (agent: Agent) => {
    // Simulate phone call
    window.open(`tel:${agent.phone}`, '_self');
  };

  const handleApplyOptimization = () => {
    // Simulate optimization algorithm
    alert('Optimisation appliquée avec succès!\n\nNouvelles allocations:\n- 3 agents redéployés\n- Temps de réponse amélioré de 15%\n- Couverture territoriale optimisée');
  };

  const handleScheduleOptimization = () => {
    // Simulate scheduling
    alert('Planification programmée pour demain à 06h00');
  };

  const handleCreateAllocation = () => {
    // Simulate new allocation creation
    setShowNewAllocation(false);
    alert('Nouvelle allocation créée avec succès!');
  };

  return (
    <Layout title="Ressources" subtitle="Gestion des ressources">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neuro-900 dark:text-white">Gestion des ressources</h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Allocation et optimisation du personnel et des véhicules
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="neuro" size="sm">
              <i className="ri-settings-3-line mr-2"></i>
              Paramètres
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowNewAllocation(true)}>
              <i className="ri-add-line mr-2"></i>
              Nouvelle allocation
            </Button>
          </div>
        </div>

        {/* Region Selector */}
        <Card>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-neuro-700 dark:text-gray-300">
              Région:
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {regions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2 text-sm text-neuro-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span>Système opérationnel</span>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Agents disponibles</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {agents.filter(a => a.status === 'available').length}
                </p>
                <p className="text-xs text-success-600 mt-1">
                  Sur {agents.length} agents
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-user-line text-xl text-success-600 dark:text-success-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Véhicules actifs</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {vehicles.filter(v => v.status === 'in_use').length}
                </p>
                <p className="text-xs text-warning-600 mt-1">
                  Sur {vehicles.length} véhicules
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-car-line text-xl text-warning-600 dark:text-warning-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Temps de réponse</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">4.2min</p>
                <p className="text-xs text-success-600 mt-1">
                  -15% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-timer-line text-xl text-primary-600 dark:text-primary-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Couverture zone</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">87%</p>
                <p className="text-xs text-success-600 mt-1">
                  +5% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-map-2-line text-xl text-success-600 dark:text-success-400"></i>
              </div>
            </div>
          </Card>
        </div>

        {/* Personnel Management */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neuro-900 dark:text-white">
              Personnel ({agents.length} agents)
            </h2>
            <div className="flex space-x-2">
              <Button variant="neuro" size="sm">
                <i className="ri-filter-line mr-2"></i>
                Filtrer
              </Button>
              <Button variant="neuro" size="sm">
                <i className="ri-download-line mr-2"></i>
                Exporter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neuro-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Agent</th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Badge</th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Localisation</th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Spécialisation</th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Mission actuelle</th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-t border-neuro-100 dark:border-gray-600 hover:bg-neuro-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-neuro-900 dark:text-white">{agent.name}</p>
                          <p className="text-xs text-neuro-500 dark:text-gray-400">{agent.experience} ans d'expérience</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300 font-mono">{agent.badge}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {getStatusLabel(agent.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{agent.location}</td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{agent.specialization}</td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                      {agent.currentAssignment || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <Button 
                          variant="neuro" 
                          size="sm"
                          onClick={() => handleLocateAgent(agent)}
                          title="Localiser"
                        >
                          <i className="ri-map-pin-line"></i>
                        </Button>
                        <Button 
                          variant="neuro" 
                          size="sm"
                          onClick={() => handleCallAgent(agent)}
                          title="Appeler"
                        >
                          <i className="ri-phone-line"></i>
                        </Button>
                        <Button variant="neuro" size="sm" title="Assigner">
                          <i className="ri-user-settings-line"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Vehicle Management */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neuro-900 dark:text-white">
              Véhicules ({vehicles.length} unités)
            </h2>
            <div className="flex space-x-2">
              <Button variant="neuro" size="sm">
                <i className="ri-gas-station-line mr-2"></i>
                Carburant
              </Button>
              <Button variant="neuro" size="sm">
                <i className="ri-tools-line mr-2"></i>
                Maintenance
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-neuro-50 dark:bg-gray-700 rounded-xl p-6 border border-neuro-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <i className={`${
                        vehicle.type.includes('Moto') ? 'ri-motorbike-line' :
                        vehicle.type.includes('Fourgon') ? 'ri-truck-line' : 'ri-car-line'
                      } text-xl text-primary-600 dark:text-primary-400`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neuro-900 dark:text-white">{vehicle.type}</h3>
                      <p className="text-sm text-neuro-600 dark:text-gray-400 font-mono">{vehicle.plate}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {getStatusLabel(vehicle.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neuro-600 dark:text-gray-400">Localisation:</span>
                    <span className="text-neuro-900 dark:text-white font-medium">{vehicle.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neuro-600 dark:text-gray-400">Carburant:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-neuro-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            vehicle.fuel > 50 ? 'bg-success-500' :
                            vehicle.fuel > 25 ? 'bg-warning-500' : 'bg-danger-500'
                          }`}
                          style={{ width: `${vehicle.fuel}%` }}
                        ></div>
                      </div>
                      <span className="text-neuro-900 dark:text-white font-medium">{vehicle.fuel}%</span>
                    </div>
                  </div>

                  {vehicle.assignedAgent && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neuro-600 dark:text-gray-400">Assigné à:</span>
                      <span className="text-neuro-900 dark:text-white font-medium">{vehicle.assignedAgent}</span>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-4">
                    <Button variant="primary" size="sm" className="flex-1">
                      <i className="ri-map-pin-line mr-1"></i>
                      Localiser
                    </Button>
                    <Button variant="neuro" size="sm">
                      <i className="ri-settings-3-line"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Optimization */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neuro-900 dark:text-white">
              Optimisation des ressources
            </h2>
            <div className="flex space-x-2">
              <Button variant="neuro" size="sm">
                <i className="ri-history-line mr-2"></i>
                Historique
              </Button>
              <Button variant="neuro" size="sm">
                <i className="ri-bar-chart-line mr-2"></i>
                Rapports
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-neuro-900 dark:text-white">Paramètres d'optimisation</h3>
              
              <div>
                <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                  Priorité d'optimisation
                </label>
                <select
                  value={optimizationSettings.priority}
                  onChange={(e) => setOptimizationSettings({...optimizationSettings, priority: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="response_time">Temps de réponse</option>
                  <option value="coverage">Couverture territoriale</option>
                  <option value="efficiency">Efficacité énergétique</option>
                  <option value="cost">Réduction des coûts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                  Distance maximale (km)
                </label>
                <Input
                  type="number"
                  value={optimizationSettings.maxDistance}
                  onChange={(e) => setOptimizationSettings({...optimizationSettings, maxDistance: parseInt(e.target.value)})}
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                  Nombre minimum d'agents par zone
                </label>
                <Input
                  type="number"
                  value={optimizationSettings.minAgents}
                  onChange={(e) => setOptimizationSettings({...optimizationSettings, minAgents: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                />
              </div>

              <div className="flex space-x-3">
                <Button variant="primary" className="flex-1" onClick={handleApplyOptimization}>
                  <i className="ri-play-line mr-2"></i>
                  Appliquer
                </Button>
                <Button variant="neuro" onClick={handleScheduleOptimization}>
                  <i className="ri-calendar-line mr-2"></i>
                  Planifier
                </Button>
              </div>
            </div>

            <div className="bg-neuro-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="font-medium text-neuro-900 dark:text-white mb-4">Résultats de simulation</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neuro-600 dark:text-gray-400">Temps de réponse moyen:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neuro-900 dark:text-white font-medium">3.8 min</span>
                    <span className="text-xs text-success-600">-15%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neuro-600 dark:text-gray-400">Couverture territoriale:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neuro-900 dark:text-white font-medium">92%</span>
                    <span className="text-xs text-success-600">+5%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neuro-600 dark:text-gray-400">Efficacité énergétique:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neuro-900 dark:text-white font-medium">78%</span>
                    <span className="text-xs text-success-600">+8%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neuro-600 dark:text-gray-400">Économies estimées:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neuro-900 dark:text-white font-medium">2.3M FCFA</span>
                    <span className="text-xs text-success-600">par mois</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-success-50 dark:bg-green-900/20 rounded-lg border border-success-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="ri-check-circle-line text-success-600"></i>
                  <span className="text-sm font-medium text-success-800 dark:text-green-400">Recommandation</span>
                </div>
                <p className="text-xs text-success-700 dark:text-green-300">
                  Redéployer 3 agents vers les zones à forte densité criminelle pour optimiser la couverture.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* New Allocation Modal */}
        <AnimatePresence>
          {showNewAllocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Nouvelle allocation de ressources
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowNewAllocation(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Type d'allocation
                      </label>
                      <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="patrol">Patrouille</option>
                        <option value="investigation">Enquête</option>
                        <option value="emergency">Urgence</option>
                        <option value="event">Événement spécial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Zone d'intervention
                      </label>
                      <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="sandaga">Sandaga</option>
                        <option value="ucad">UCAD</option>
                        <option value="plateau">Plateau</option>
                        <option value="pikine">Pikine</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Agent assigné
                      </label>
                      <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {agents.filter(a => a.status === 'available').map(agent => (
                          <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Véhicule assigné
                      </label>
                      <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {vehicles.filter(v => v.status === 'available').map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.type} - {vehicle.plate}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Heure de début
                      </label>
                      <Input type="time" defaultValue="08:00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Durée (heures)
                      </label>
                      <Input type="number" defaultValue="8" min="1" max="24" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                      Instructions spéciales
                    </label>
                    <textarea
                      placeholder="Instructions particulières pour cette allocation..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none text-sm"
                      maxLength={500}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="primary" className="flex-1" onClick={handleCreateAllocation}>
                      <i className="ri-save-line mr-2"></i>
                      Créer l'allocation
                    </Button>
                    <Button variant="neuro" onClick={() => setShowNewAllocation(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
