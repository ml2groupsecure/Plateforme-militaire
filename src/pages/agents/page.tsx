
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

type Agent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  badge: string;
  department: string;
  role: string;
  specialization: string;
  location: string;
  status: string;
  lastActive: string;
  casesAssigned: number;
  casesResolved: number;
  performance: number;
  avatar: null;
};

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [showAgentDetails, setShowAgentDetails] = useState<Agent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    badge: '',
    department: '',
    role: 'agent',
    specialization: '',
    location: ''
  });

  const [agents] = useState([
    {
      id: '1',
      name: 'Commissaire Diop',
      email: 'diop@police.sn',
      phone: '+221 77 123 4567',
      badge: 'P001',
      department: 'Commissariat Central',
      role: 'commissaire',
      specialization: 'Crimes économiques',
      location: 'Dakar-Plateau',
      status: 'active',
      lastActive: '2024-01-15T14:30:00Z',
      casesAssigned: 12,
      casesResolved: 8,
      performance: 85,
      avatar: null
    },
    {
      id: '2',
      name: 'Inspecteur Fall',
      email: 'fall@police.sn',
      phone: '+221 77 234 5678',
      badge: 'P002',
      department: 'Brigade Criminelle',
      role: 'inspecteur',
      specialization: 'Homicides',
      location: 'Pikine',
      status: 'active',
      lastActive: '2024-01-15T13:45:00Z',
      casesAssigned: 8,
      casesResolved: 6,
      performance: 92,
      avatar: null
    },
    {
      id: '3',
      name: 'Agent Ndiaye',
      email: 'ndiaye@police.sn',
      phone: '+221 77 345 6789',
      badge: 'P003',
      department: 'Patrouille',
      role: 'agent',
      specialization: 'Sécurité publique',
      location: 'Guédiawaye',
      status: 'active',
      lastActive: '2024-01-15T12:20:00Z',
      casesAssigned: 15,
      casesResolved: 12,
      performance: 78,
      avatar: null
    },
    {
      id: '4',
      name: 'Lieutenant Sow',
      email: 'sow@police.sn',
      phone: '+221 77 456 7890',
      badge: 'P004',
      department: 'Cybercriminalité',
      role: 'lieutenant',
      specialization: 'Crimes informatiques',
      location: 'Dakar-Plateau',
      status: 'inactive',
      lastActive: '2024-01-10T16:15:00Z',
      casesAssigned: 5,
      casesResolved: 4,
      performance: 88,
      avatar: null
    },
    {
      id: '5',
      name: 'Sergent Ba',
      email: 'ba@police.sn',
      phone: '+221 77 567 8901',
      badge: 'P005',
      department: 'Circulation',
      role: 'sergent',
      specialization: 'Sécurité routière',
      location: 'Rufisque',
      status: 'active',
      lastActive: '2024-01-15T11:30:00Z',
      casesAssigned: 20,
      casesResolved: 18,
      performance: 95,
      avatar: null
    }
  ]);

  const departments = [
    'Commissariat Central',
    'Brigade Criminelle',
    'Patrouille',
    'Cybercriminalité',
    'Circulation',
    'Stupéfiants',
    'Police Judiciaire'
  ];

  const specializations = [
    'Crimes économiques',
    'Homicides',
    'Sécurité publique',
    'Crimes informatiques',
    'Sécurité routière',
    'Trafic de drogue',
    'Violence domestique',
    'Fraude',
    'Vol organisé'
  ];

  const locations = [
    'Dakar-Plateau',
    'Pikine',
    'Guédiawaye',
    'Rufisque',
    'Keur Massar',
    'Parcelles Assainies',
    'Liberté',
    'Médina'
  ];

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvel agent:', newAgent);
    setNewAgent({
      name: '',
      email: '',
      phone: '',
      badge: '',
      department: '',
      role: 'agent',
      specialization: '',
      location: ''
    });
    setShowAddAgent(false);
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.badge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    const matchesRole = filterRole === 'all' || agent.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'commissaire': return 'bg-purple-100 text-purple-800';
      case 'lieutenant': return 'bg-blue-100 text-blue-800';
      case 'inspecteur': return 'bg-green-100 text-green-800';
      case 'sergent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-success-600';
    if (performance >= 75) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <Layout title="Gestion des Agents" subtitle="Administration et suivi des agents de terrain">
      <div className="space-y-6">
        {/* Header avec bouton d'ajout proéminent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestion des Agents de Terrain</h2>
              <p className="text-primary-100">Administrez et suivez vos équipes sur le terrain</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="neuro" 
                onClick={() => setShowAddAgent(true)}
                className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg"
              >
                <i className="ri-add-line mr-2"></i>
                Ajouter un Agent
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-neuro-100 p-1 rounded-lg">
          {[
            { id: 'list', label: 'Liste des agents', icon: 'ri-team-line' },
            { id: 'performance', label: 'Performance', icon: 'ri-bar-chart-line' },
            { id: 'assignments', label: 'Affectations', icon: 'ri-map-pin-line' },
            { id: 'schedule', label: 'Planning', icon: 'ri-calendar-line' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neuro-600 hover:text-neuro-800'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Liste des agents */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Filtres et recherche */}
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Rechercher un agent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8"
                  >
                    <option value="all">Tous les grades</option>
                    <option value="commissaire">Commissaire</option>
                    <option value="lieutenant">Lieutenant</option>
                    <option value="inspecteur">Inspecteur</option>
                    <option value="sergent">Sergent</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div>
                  <Button variant="primary" onClick={() => setShowAddAgent(true)} className="w-full">
                    <i className="ri-add-line mr-2"></i>
                    Nouvel Agent
                  </Button>
                </div>
              </div>
            </Card>

            {/* Statistiques rapides avec animations */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-700">Total Agents</p>
                      <motion.p 
                        className="text-2xl font-bold text-primary-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        {agents.length}
                      </motion.p>
                    </div>
                    <motion.div 
                      className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <i className="ri-team-line text-white text-lg"></i>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-success-700">Agents Actifs</p>
                      <motion.p 
                        className="text-2xl font-bold text-success-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                      >
                        {agents.filter(a => a.status === 'active').length}
                      </motion.p>
                    </div>
                    <motion.div 
                      className="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <i className="ri-check-circle-line text-white text-lg"></i>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-warning-700">Performance Moy.</p>
                      <motion.p 
                        className="text-2xl font-bold text-warning-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        {Math.round(agents.reduce((acc, a) => acc + a.performance, 0) / agents.length)}%
                      </motion.p>
                    </div>
                    <motion.div 
                      className="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center"
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <i className="ri-bar-chart-line text-white text-lg"></i>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-danger-700">Affaires en cours</p>
                      <motion.p 
                        className="text-2xl font-bold text-danger-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        {agents.reduce((acc, a) => acc + a.casesAssigned, 0)}
                      </motion.p>
                    </div>
                    <motion.div 
                      className="w-12 h-12 bg-danger-500 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <i className="ri-file-list-line text-white text-lg"></i>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Liste des agents */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neuro-200">
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Agent</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Grade</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Département</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Localisation</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Performance</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent, index) => (
                      <motion.tr
                        key={agent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-neuro-100 hover:bg-neuro-50 cursor-pointer"
                        onClick={() => setShowAgentDetails(agent)}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <span className="text-primary-600 font-medium">
                                {agent.name.split(' ').map(n => n.charAt(0)).join('')}
                              </span>
                            </motion.div>
                            <div>
                              <p className="font-medium text-neuro-900">{agent.name}</p>
                              <p className="text-sm text-neuro-600">{agent.badge}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(agent.role)}`}>
                            {agent.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neuro-700">{agent.department}</td>
                        <td className="py-3 px-4 text-neuro-700">{agent.location}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                            {agent.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getPerformanceColor(agent.performance)}`}>
                              {agent.performance}%
                            </span>
                            <div className="w-16 h-2 bg-neuro-200 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full rounded-full ${
                                  agent.performance >= 90 ? 'bg-success-500' :
                                  agent.performance >= 75 ? 'bg-warning-500' : 'bg-danger-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${agent.performance}%` }}
                                transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="neuro" size="sm" onClick={(e) => { e.stopPropagation(); setShowAgentDetails(agent); }}>
                              <i className="ri-eye-line"></i>
                            </Button>
                            <Button variant="neuro" size="sm">
                              <i className="ri-edit-line"></i>
                            </Button>
                            <Button variant="neuro" size="sm">
                              <i className="ri-message-line"></i>
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Performance avec graphiques animés */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-4">Tableau de performance</h3>
              <div className="space-y-4">
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg hover:bg-neuro-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="text-primary-600 font-medium">
                          {agent.name.split(' ').map(n => n.charAt(0)).join('')}
                        </span>
                      </motion.div>
                      <div>
                        <p className="font-medium text-neuro-900">{agent.name}</p>
                        <p className="text-sm text-neuro-600">{agent.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <motion.div 
                        className="text-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        <p className="text-sm text-neuro-600">Affaires assignées</p>
                        <p className="text-lg font-semibold text-neuro-900">{agent.casesAssigned}</p>
                      </motion.div>
                      <motion.div 
                        className="text-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                      >
                        <p className="text-sm text-neuro-600">Affaires résolues</p>
                        <p className="text-lg font-semibold text-success-600">{agent.casesResolved}</p>
                      </motion.div>
                      <motion.div 
                        className="text-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        <p className="text-sm text-neuro-600">Performance</p>
                        <p className={`text-lg font-semibold ${getPerformanceColor(agent.performance)}`}>
                          {agent.performance}%
                        </p>
                        <div className="w-20 h-2 bg-neuro-200 rounded-full mt-1 overflow-hidden">
                          <motion.div 
                            className={`h-full rounded-full ${
                              agent.performance >= 90 ? 'bg-success-500' :
                              agent.performance >= 75 ? 'bg-warning-500' : 'bg-danger-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${agent.performance}%` }}
                            transition={{ delay: index * 0.1 + 0.7, duration: 1.5 }}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {showAddAgent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900">Ajouter un nouvel agent</h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowAddAgent(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>
                
                <form onSubmit={handleAddAgent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">Nom complet</label>
                      <Input
                        type="text"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">Email</label>
                      <Input
                        type="email"
                        value={newAgent.email}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="jean.dupont@police.sn"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">Téléphone</label>
                      <Input
                        type="tel"
                        value={newAgent.phone}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+221 77 123 4567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">Matricule</label>
                      <Input
                        type="text"
                        value={newAgent.badge}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, badge: e.target.value }))}
                        placeholder="P006"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">Département</label>
                      <select
                        value={newAgent.department}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8"
                        required
                      >
                        <option value="">Sélectionner un département</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">Grade</label>
                      <select
                        value={newAgent.role}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8"
                        required
                      >
                        <option value="agent">Agent</option>
                        <option value="sergent">Sergent</option>
                        <option value="inspecteur">Inspecteur</option>
                        <option value="lieutenant">Lieutenant</option>
                        <option value="commissaire">Commissaire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">Spécialisation</label>
                      <select
                        value={newAgent.specialization}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, specialization: e.target.value }))}
                        className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8"
                        required
                      >
                        <option value="">Sélectionner une spécialisation</option>
                        {specializations.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">Localisation</label>
                      <select
                        value={newAgent.location}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8"
                        required
                      >
                        <option value="">Sélectionner une localisation</option>
                        {locations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" variant="primary" className="flex-1">
                      <i className="ri-save-line mr-2"></i>
                      Créer l'agent
                    </Button>
                    <Button type="button" variant="neuro" onClick={() => setShowAddAgent(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Détails de l'agent */}
        <AnimatePresence>
          {showAgentDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900">Profil de l'agent</h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowAgentDetails(null)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-xl">
                        {showAgentDetails.name.split(' ').map(n => n.charAt(0)).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-neuro-900">{showAgentDetails.name}</h4>
                      <p className="text-neuro-600">{showAgentDetails.email}</p>
                      <p className="text-neuro-600">{showAgentDetails.phone}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(showAgentDetails.role)}`}>
                          {showAgentDetails.role}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(showAgentDetails.status)}`}>
                          {showAgentDetails.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informations professionnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-neuro-900 mb-3">Informations professionnelles</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neuro-600">Matricule:</span>
                          <span className="font-medium">{showAgentDetails.badge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neuro-600">Département:</span>
                          <span className="font-medium">{showAgentDetails.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neuro-600">Spécialisation:</span>
                          <span className="font-medium">{showAgentDetails.specialization}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neuro-600">Localisation:</span>
                          <span className="font-medium">{showAgentDetails.location}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-neuro-900 mb-3">Performance</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-neuro-600">Performance globale</span>
                            <span className={`font-medium ${getPerformanceColor(showAgentDetails.performance)}`}>
                              {showAgentDetails.performance}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-neuro-200 rounded-full">
                            <div 
                              className={`h-full rounded-full ${
                                showAgentDetails.performance >= 90 ? 'bg-success-500' :
                                showAgentDetails.performance >= 75 ? 'bg-warning-500' : 'bg-danger-500'
                              }`}
                              style={{ width: `${showAgentDetails.performance}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-primary-50 rounded-lg">
                            <p className="text-2xl font-bold text-primary-600">{showAgentDetails.casesAssigned}</p>
                            <p className="text-primary-700">Affaires assignées</p>
                          </div>
                          <div className="text-center p-3 bg-success-50 rounded-lg">
                            <p className="text-2xl font-bold text-success-600">{showAgentDetails.casesResolved}</p>
                            <p className="text-success-700">Affaires résolues</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-neuro-200">
                    <Button variant="primary">
                      <i className="ri-edit-line mr-2"></i>
                      Modifier
                    </Button>
                    <Button variant="neuro">
                      <i className="ri-message-line mr-2"></i>
                      Contacter
                    </Button>
                    <Button variant="neuro">
                      <i className="ri-file-list-line mr-2"></i>
                      Voir les affaires
                    </Button>
                    <Button variant="warning">
                      <i className="ri-calendar-line mr-2"></i>
                      Planning
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
