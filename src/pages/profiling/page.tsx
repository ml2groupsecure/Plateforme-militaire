
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

interface Suspect {
  id: string;
  name: string;
  age: number;
  photo: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastSeen: string;
  location: string;
  crimes: string[];
  status: 'active' | 'inactive' | 'arrested';
  description: string;
  aliases: string[];
  contacts: string[];
}

export default function ProfilingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [suspects] = useState<Suspect[]>([
    {
      id: '1',
      name: 'Mamadou Diallo',
      age: 28,
      photo: 'https://readdy.ai/api/search-image?query=African%20man%20portrait%20criminal%20suspect%20photo%20realistic%20police%20mugshot%20style%20simple%20background&width=150&height=150&seq=suspect1&orientation=squarish',
      riskLevel: 'high',
      lastSeen: '2024-01-15',
      location: 'Sandaga',
      crimes: ['Vol à main armée', 'Agression', 'Recel'],
      status: 'active',
      description: 'Suspect récidiviste spécialisé dans les vols à main armée. Opère principalement dans les marchés.',
      aliases: ['Momo', 'Le Rapide'],
      contacts: ['Ibrahima Sow', 'Fatou Ndiaye']
    },
    {
      id: '2',
      name: 'Aminata Fall',
      age: 24,
      photo: 'https://readdy.ai/api/search-image?query=African%20woman%20portrait%20criminal%20suspect%20photo%20realistic%20police%20mugshot%20style%20simple%20background&width=150&height=150&seq=suspect2&orientation=squarish',
      riskLevel: 'medium',
      lastSeen: '2024-01-12',
      location: 'UCAD',
      crimes: ['Fraude', 'Escroquerie'],
      status: 'active',
      description: 'Spécialisée dans les fraudes en ligne et les escroqueries téléphoniques.',
      aliases: ['Ami', 'La Technicienne'],
      contacts: ['Ousmane Ba', 'Khadija Diop']
    },
    {
      id: '3',
      name: 'Ibrahima Sarr',
      age: 35,
      photo: 'https://readdy.ai/api/search-image?query=African%20man%20portrait%20criminal%20suspect%20photo%20realistic%20police%20mugshot%20style%20simple%20background&width=150&height=150&seq=suspect3&orientation=squarish',
      riskLevel: 'critical',
      lastSeen: '2024-01-10',
      location: 'Pikine',
      crimes: ['Trafic de drogue', 'Violence', 'Association de malfaiteurs'],
      status: 'active',
      description: 'Chef présumé d\'un réseau de trafic de drogue. Extrêmement dangereux.',
      aliases: ['Ibou', 'Le Boss'],
      contacts: ['Moussa Diagne', 'Awa Thiam']
    },
    {
      id: '4',
      name: 'Fatou Sow',
      age: 31,
      photo: 'https://readdy.ai/api/search-image?query=African%20woman%20portrait%20criminal%20suspect%20photo%20realistic%20police%20mugshot%20style%20simple%20background&width=150&height=150&seq=suspect4&orientation=squarish',
      riskLevel: 'low',
      lastSeen: '2024-01-08',
      location: 'Plateau',
      crimes: ['Vol simple', 'Recel'],
      status: 'inactive',
      description: 'Petite délinquante occasionnelle. Pas de violence rapportée.',
      aliases: ['Faty'],
      contacts: ['Seynabou Diallo']
    }
  ]);

  const [newProfile, setNewProfile] = useState({
    name: '',
    age: '',
    riskLevel: 'low' as const,
    location: '',
    crimes: '',
    description: '',
    aliases: '',
    contacts: ''
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-danger-600 bg-danger-100 border-danger-200';
      case 'medium': return 'text-warning-600 bg-warning-100 border-warning-200';
      case 'low': return 'text-success-600 bg-success-100 border-success-100';
      default: return 'text-neuro-600 bg-neuro-100 border-neuro-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-danger-600 bg-danger-100';
      case 'inactive': return 'text-neuro-600 bg-neuro-100';
      case 'arrested': return 'text-success-600 bg-success-100';
      default: return 'text-neuro-600 bg-neuro-100';
    }
  };

  const handleSearch = () => {
    // Simulate search functionality
    console.log('Recherche:', searchQuery);
  };

  const handleCreateProfile = () => {
    // Simulate profile creation
    console.log('Nouveau profil:', newProfile);
    setShowNewProfile(false);
    setNewProfile({
      name: '',
      age: '',
      riskLevel: 'low',
      location: '',
      crimes: '',
      description: '',
      aliases: '',
      contacts: ''
    });
  };

  const handleViewDetails = (suspect: Suspect) => {
    setSelectedSuspect(suspect);
  };

  const handleEditSuspect = (suspect: Suspect) => {
    setSelectedSuspect(suspect);
    setShowEditModal(true);
  };

  const filteredSuspects = suspects.filter(suspect =>
    suspect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suspect.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suspect.crimes.some(crime => crime.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout title="Profilage Criminel" subtitle="Analyse comportementale">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neuro-900 dark:text-white">Profilage criminel</h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Gestion et analyse des profils de suspects
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="neuro" size="sm">
              <i className="ri-settings-3-line mr-2"></i>
              Paramètres
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowNewProfile(true)}>
              <i className="ri-add-line mr-2"></i>
              Nouveau profil
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Rechercher un suspect par nom, lieu, type de crime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="primary" onClick={handleSearch}>
              <i className="ri-search-line mr-2"></i>
              Rechercher
            </Button>
            <Button variant="neuro">
              <i className="ri-filter-line mr-2"></i>
              Filtres avancés
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Profils actifs</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {suspects.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-user-search-line text-xl text-danger-600 dark:text-red-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Risque critique</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {suspects.filter(s => s.riskLevel === 'critical').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-error-warning-line text-xl text-red-600 dark:text-red-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Arrestations</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {suspects.filter(s => s.status === 'arrested').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-shield-check-line text-xl text-success-600 dark:text-success-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Récidivistes</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {suspects.filter(s => s.crimes.length > 2).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-repeat-line text-xl text-warning-600 dark:text-warning-400"></i>
              </div>
            </div>
          </Card>
        </div>

        {/* Suspects List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neuro-900 dark:text-white">
              Profils de suspects actifs ({filteredSuspects.length})
            </h2>
            <div className="flex space-x-2">
              <Button variant="neuro" size="sm">
                <i className="ri-sort-desc mr-2"></i>
                Trier
              </Button>
              <Button variant="neuro" size="sm">
                <i className="ri-download-line mr-2"></i>
                Exporter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuspects.map((suspect, index) => (
              <motion.div
                key={suspect.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neuro-50 dark:bg-gray-700 rounded-xl p-6 border border-neuro-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={suspect.photo}
                    alt={suspect.name}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-neuro-200 dark:border-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-neuro-900 dark:text-white truncate">
                          {suspect.name}
                        </h3>
                        <p className="text-sm text-neuro-600 dark:text-gray-400">
                          {suspect.age} ans • {suspect.location}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="neuro" 
                          size="sm"
                          onClick={() => handleViewDetails(suspect)}
                          title="Voir détails"
                        >
                          <i className="ri-eye-line"></i>
                        </Button>
                        <Button 
                          variant="neuro" 
                          size="sm"
                          onClick={() => handleEditSuspect(suspect)}
                          title="Modifier"
                        >
                          <i className="ri-edit-line"></i>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(suspect.riskLevel)}`}>
                          {suspect.riskLevel === 'critical' ? 'Critique' :
                           suspect.riskLevel === 'high' ? 'Élevé' :
                           suspect.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suspect.status)}`}>
                          {suspect.status === 'active' ? 'Actif' :
                           suspect.status === 'arrested' ? 'Arrêté' : 'Inactif'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-neuro-500 dark:text-gray-500">
                        <p>Dernière activité: {new Date(suspect.lastSeen).toLocaleDateString('fr-FR')}</p>
                        <p className="truncate">Crimes: {suspect.crimes.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredSuspects.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-user-search-line text-4xl text-neuro-400 dark:text-gray-500 mb-4"></i>
              <h3 className="text-lg font-medium text-neuro-900 dark:text-white mb-2">
                Aucun suspect trouvé
              </h3>
              <p className="text-neuro-600 dark:text-gray-400">
                Aucun profil ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </Card>

        {/* New Profile Modal */}
        <AnimatePresence>
          {showNewProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Nouveau profil de suspect
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowNewProfile(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Nom complet *
                      </label>
                      <Input
                        type="text"
                        value={newProfile.name}
                        onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                        placeholder="Nom et prénom"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Âge
                      </label>
                      <Input
                        type="number"
                        value={newProfile.age}
                        onChange={(e) => setNewProfile({...newProfile, age: e.target.value})}
                        placeholder="Âge"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Niveau de risque
                      </label>
                      <select
                        value={newProfile.riskLevel}
                        onChange={(e) => setNewProfile({...newProfile, riskLevel: e.target.value as any})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyen</option>
                        <option value="high">Élevé</option>
                        <option value="critical">Critique</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Localisation
                      </label>
                      <Input
                        type="text"
                        value={newProfile.location}
                        onChange={(e) => setNewProfile({...newProfile, location: e.target.value})}
                        placeholder="Zone ou quartier"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                      Types de crimes (séparés par des virgules)
                    </label>
                    <Input
                      type="text"
                      value={newProfile.crimes}
                      onChange={(e) => setNewProfile({...newProfile, crimes: e.target.value})}
                      placeholder="Vol, Agression, Fraude..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                      Description détaillée
                    </label>
                    <textarea
                      value={newProfile.description}
                      onChange={(e) => setNewProfile({...newProfile, description: e.target.value})}
                      placeholder="Description physique, modus operandi, particularités..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                      maxLength={500}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Alias (séparés par des virgules)
                      </label>
                      <Input
                        type="text"
                        value={newProfile.aliases}
                        onChange={(e) => setNewProfile({...newProfile, aliases: e.target.value})}
                        placeholder="Surnoms, pseudonymes..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                        Contacts connus (séparés par des virgules)
                      </label>
                      <Input
                        type="text"
                        value={newProfile.contacts}
                        onChange={(e) => setNewProfile({...newProfile, contacts: e.target.value})}
                        placeholder="Complices, associés..."
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="primary" className="flex-1" onClick={handleCreateProfile}>
                      <i className="ri-save-line mr-2"></i>
                      Créer le profil
                    </Button>
                    <Button variant="neuro" onClick={() => setShowNewProfile(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suspect Details Modal */}
        <AnimatePresence>
          {selectedSuspect && !showEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Détails du suspect
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setSelectedSuspect(null)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img
                      src={selectedSuspect.photo}
                      alt={selectedSuspect.name}
                      className="w-full h-64 object-cover rounded-lg border border-neuro-200 dark:border-gray-600"
                    />
                    <div className="mt-4 space-y-2">
                      <div className={`px-3 py-2 rounded-lg text-center border ${getRiskColor(selectedSuspect.riskLevel)}`}>
                        <span className="font-medium">
                          Risque {selectedSuspect.riskLevel === 'critical' ? 'Critique' :
                                 selectedSuspect.riskLevel === 'high' ? 'Élevé' :
                                 selectedSuspect.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-center ${getStatusColor(selectedSuspect.status)}`}>
                        <span className="font-medium">
                          {selectedSuspect.status === 'active' ? 'Actif' :
                           selectedSuspect.status === 'arrested' ? 'Arrêté' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h4 className="font-semibold text-neuro-900 dark:text-white mb-2">Informations personnelles</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-neuro-600 dark:text-gray-400">Nom:</span>
                          <p className="font-medium text-neuro-900 dark:text-white">{selectedSuspect.name}</p>
                        </div>
                        <div>
                          <span className="text-neuro-600 dark:text-gray-400">Âge:</span>
                          <p className="font-medium text-neuro-900 dark:text-white">{selectedSuspect.age} ans</p>
                        </div>
                        <div>
                          <span className="text-neuro-600 dark:text-gray-400">Dernière localisation:</span>
                          <p className="font-medium text-neuro-900 dark:text-white">{selectedSuspect.location}</p>
                        </div>
                        <div>
                          <span className="text-neuro-600 dark:text-gray-400">Dernière activité:</span>
                          <p className="font-medium text-neuro-900 dark:text-white">
                            {new Date(selectedSuspect.lastSeen).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-neuro-900 dark:text-white mb-2">Crimes associés</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSuspect.crimes.map((crime, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-danger-100 dark:bg-red-900/30 text-danger-700 dark:text-red-400 rounded-full text-sm"
                          >
                            {crime}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-neuro-900 dark:text-white mb-2">Description</h4>
                      <p className="text-neuro-700 dark:text-gray-300 text-sm leading-relaxed">
                        {selectedSuspect.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-neuro-900 dark:text-white mb-2">Alias</h4>
                        <div className="space-y-1">
                          {selectedSuspect.aliases.map((alias, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-neuro-100 dark:bg-gray-700 text-neuro-700 dark:text-gray-300 rounded text-sm mr-2"
                            >
                              {alias}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neuro-900 dark:text-white mb-2">Contacts connus</h4>
                        <div className="space-y-1">
                          {selectedSuspect.contacts.map((contact, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-warning-100 dark:bg-yellow-900/30 text-warning-700 dark:text-yellow-400 rounded text-sm mr-2"
                            >
                              {contact}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button variant="primary" className="flex-1">
                        <i className="ri-edit-line mr-2"></i>
                        Modifier le profil
                      </Button>
                      <Button variant="warning">
                        <i className="ri-alert-line mr-2"></i>
                        Créer une alerte
                      </Button>
                      <Button variant="success">
                        <i className="ri-phone-line mr-2"></i>
                        Signaler
                      </Button>
                    </div>
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
