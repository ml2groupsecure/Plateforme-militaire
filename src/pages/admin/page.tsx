
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

export default function AdminPage() {
  const { user, register } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent' as 'admin' | 'agent',
    phone: '',
    department: '',
    badge: '',
    location: ''
  });

  const [users] = useState([
    {
      id: '1',
      name: 'Administrateur Principal',
      email: 'admin@criminalytix.sn',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Agent Dupont',
      email: 'agent@criminalytix.sn',
      role: 'agent',
      status: 'active',
      lastLogin: '2024-01-15T09:15:00Z',
      created_at: '2024-01-05T00:00:00Z',
    },
    {
      id: '3',
      name: 'Agent Martin',
      email: 'martin@criminalytix.sn',
      role: 'agent',
      status: 'inactive',
      lastLogin: '2024-01-10T14:20:00Z',
      created_at: '2024-01-08T00:00:00Z',
    },
  ]);

  const systemLogs = [
    {
      id: '1',
      timestamp: '2024-01-15T11:30:00Z',
      user: 'admin@criminalytix.sn',
      action: 'Connexion réussie',
      ip: '192.168.1.100',
      severity: 'info',
    },
    {
      id: '2',
      timestamp: '2024-01-15T11:25:00Z',
      user: 'agent@criminalytix.sn',
      action: 'Tentative de connexion échouée',
      ip: '192.168.1.105',
      severity: 'warning',
    },
    {
      id: '3',
      timestamp: '2024-01-15T11:20:00Z',
      user: 'system',
      action: 'Sauvegarde automatique effectuée',
      ip: 'localhost',
      severity: 'success',
    },
    {
      id: '4',
      timestamp: '2024-01-15T11:15:00Z',
      user: 'martin@criminalytix.sn',
      action: 'Accès refusé - permissions insuffisantes',
      ip: '192.168.1.110',
      severity: 'error',
    },
  ];

  const securitySettings = [
    {
      name: 'Authentification à deux facteurs',
      description: 'Exiger une authentification à deux facteurs pour tous les utilisateurs',
      enabled: true,
    },
    {
      name: 'Verrouillage de compte',
      description: 'Verrouiller les comptes après 5 tentatives de connexion échouées',
      enabled: true,
    },
    {
      name: 'Session timeout',
      description: "Déconnecter automatiquement après 30 minutes d'inactivité",
      enabled: true,
    },
    {
      name: 'Audit des actions',
      description: "Enregistrer toutes les actions des utilisateurs dans les logs",
      enabled: true,
    },
    {
      name: 'Chiffrement des données',
      description: 'Chiffrer toutes les données sensibles en base',
      enabled: true,
    },
  ];

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateMessage('');
    
    try {
      // Vérifier les permissions admin
      if (user?.role !== 'admin') {
        throw new Error('Seuls les administrateurs peuvent créer des utilisateurs');
      }

      // Créer l'utilisateur avec Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        user_metadata: {
          name: newUser.name,
          role: newUser.role,
          phone: newUser.phone,
          department: newUser.department,
          badge: newUser.badge,
          location: newUser.location
        },
        email_confirm: true
      });

      if (error) throw error;

      // Optionnel: Sauvegarder dans une table de profils
      try {
        await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            department: newUser.department,
            badge: newUser.badge,
            location: newUser.location,
            created_at: new Date().toISOString()
          });
      } catch (profileError) {
        console.log('Table user_profiles non trouvée, utilisateur créé avec métadonnées uniquement');
      }

      setCreateMessage(`${newUser.role === 'admin' ? 'Administrateur' : 'Agent'} créé avec succès !`);
      setNewUser({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'agent',
        phone: '',
        department: '',
        badge: '',
        location: ''
      });
      setShowAddUser(false);
      
      setTimeout(() => setCreateMessage(''), 3000);
      
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
      setCreateMessage(error.message || "Erreur lors de la création de l'utilisateur");
      setTimeout(() => setCreateMessage(''), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-danger-100 text-danger-800' : 'bg-primary-100 text-primary-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-success-100 text-success-800' : 'bg-neuro-100 text-neuro-800';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-danger-100 text-danger-800';
      case 'warning':
        return 'bg-warning-100 text-warning-800';
      case 'success':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  // Vérifier les permissions admin
  if (user?.role !== 'admin') {
    return (
      <Layout title="Administration" subtitle="Accès refusé">
        <Card className="text-center py-12">
          <i className="ri-shield-cross-line text-4xl text-danger-500 mb-4"></i>
          <h3 className="text-lg font-medium text-neuro-900 mb-2">
            Accès refusé
          </h3>
          <p className="text-neuro-600">
            Seuls les administrateurs peuvent accéder à cette page.
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Administration" subtitle="Gestion des utilisateurs et configuration système">
      <div className="space-y-6">
        {/* Message de création */}
        {createMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              createMessage.includes('succès') 
                ? 'bg-success-100 text-success-800 border border-success-200' 
                : 'bg-danger-100 text-danger-800 border border-danger-200'
            }`}
          >
            <div className="flex items-center">
              <i className={`${createMessage.includes('succès') ? 'ri-check-circle-line' : 'ri-error-warning-line'} mr-2`}></i>
              {createMessage}
            </div>
          </motion.div>
        )}

        {/* Header avec bouton de création proéminent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Administration Système</h2>
              <p className="text-primary-100">Gérez les utilisateurs et la configuration du système</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="neuro" 
                onClick={() => setShowAddUser(true)}
                className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg"
              >
                <i className="ri-user-add-line mr-2"></i>
                Créer Utilisateur
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-neuro-100 p-1 rounded-lg">
          {[
            { id: 'users', label: 'Utilisateurs', icon: 'ri-team-line' },
            { id: 'security', label: 'Sécurité', icon: 'ri-shield-check-line' },
            { id: 'logs', label: 'Logs système', icon: 'ri-file-list-3-line' },
            { id: 'settings', label: 'Paramètres', icon: 'ri-settings-3-line' },
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

        {/* Gestion des utilisateurs */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neuro-900">
                  Gestion des utilisateurs
                </h3>
                <p className="text-sm text-neuro-600">{users.length} utilisateurs enregistrés</p>
              </div>
              <Button variant="primary" onClick={() => setShowAddUser(true)}>
                <i className="ri-add-line mr-2"></i>
                Ajouter un utilisateur
              </Button>
            </div>

            {/* Formulaire d'ajout d'utilisateur */}
            {showAddUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <h4 className="text-lg font-semibold text-neuro-900 mb-4">
                    Nouveau utilisateur
                  </h4>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-2">
                          Nom complet *
                        </label>
                        <Input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Jean Dupont"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="jean.dupont@criminalytix.sn"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-2">
                          Mot de passe *
                        </label>
                        <Input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-2">
                          Rôle *
                        </label>
                        <select
                          value={newUser.role}
                          onChange={(e) =>
                            setNewUser((prev) => ({
                              ...prev,
                              role: e.target.value as 'admin' | 'agent',
                            }))
                          }
                          className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8"
                          required
                        >
                          <option value="agent">Agent</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-2">
                          Téléphone
                        </label>
                        <Input
                          type="tel"
                          value={newUser.phone}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="+221 77 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-2">
                          Département
                        </label>
                        <Input
                          type="text"
                          value={newUser.department}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, department: e.target.value }))}
                          placeholder="Police Criminelle"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-2">
                          Badge/Matricule
                        </label>
                        <Input
                          type="text"
                          value={newUser.badge}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, badge: e.target.value }))}
                          placeholder="PC-2024-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-2">
                          Localisation
                        </label>
                        <Input
                          type="text"
                          value={newUser.location}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="Dakar, Sénégal"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={isCreating}
                        className="flex-1"
                      >
                        {isCreating ? (
                          <>
                            <i className="ri-loader-4-line mr-2 animate-spin"></i>
                            Création en cours...
                          </>
                        ) : (
                          <>
                            <i className="ri-save-line mr-2"></i>
                            Créer l'utilisateur
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="neuro" 
                        onClick={() => setShowAddUser(false)}
                        disabled={isCreating}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Liste des utilisateurs */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neuro-200">
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Nom</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Rôle</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Dernière connexion</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-neuro-100 hover:bg-neuro-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-neuro-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neuro-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role === 'admin' ? 'Administrateur' : 'Agent'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neuro-600">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="neuro" size="sm">
                              <i className="ri-edit-line"></i>
                            </Button>
                            <Button variant="danger" size="sm">
                              <i className="ri-delete-bin-line"></i>
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

        {/* Paramètres de sécurité */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neuro-900">Paramètres de sécurité</h3>
              <p className="text-sm text-neuro-600">Configuration des mesures de sécurité du système</p>
            </div>

            <Card>
              <div className="space-y-6">
                {securitySettings.map((setting, index) => (
                  <motion.div
                    key={setting.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-neuro-900">{setting.name}</h4>
                      <p className="text-sm text-neuro-600 mt-1">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? 'bg-primary-600' : 'bg-neuro-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Alertes de sécurité */}
            <Card>
              <h4 className="text-lg font-semibold text-neuro-900 mb-4">Alertes de sécurité récentes</h4>
              <div className="space-y-3">
                {[
                  { type: 'warning', message: "3 tentatives de connexion échouées détectées", time: '5 min' },
                  { type: 'info', message: 'Mise à jour de sécurité appliquée avec succès', time: '2h' },
                  { type: 'error', message: "Tentative d'accès non autorisé bloquée", time: '4h' },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-neuro-50 rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        alert.type === 'error'
                          ? 'bg-danger-500'
                          : alert.type === 'warning'
                          ? 'bg-warning-500'
                          : 'bg-primary-500'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-neuro-900">{alert.message}</p>
                      <p className="text-xs text-neuro-500">Il y a {alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Logs système */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neuro-900">Logs système</h3>
                <p className="text-sm text-neuro-600">Historique des actions et événements système</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="neuro" size="sm">
                  <i className="ri-filter-line mr-2"></i>
                  Filtrer
                </Button>
                <Button variant="success" size="sm">
                  <i className="ri-download-line mr-2"></i>
                  Exporter
                </Button>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neuro-200">
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Horodatage</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Utilisateur</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Action</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">IP</th>
                      <th className="text-left py-3 px-4 font-medium text-neuro-900">Sévérité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-neuro-100 hover:bg-neuro-50"
                      >
                        <td className="py-3 px-4 text-sm text-neuro-600">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-neuro-900">{log.user}</td>
                        <td className="py-3 px-4 text-sm text-neuro-900">{log.action}</td>
                        <td className="py-3 px-4 text-sm text-neuro-600">{log.ip}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Paramètres généraux */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neuro-900">Paramètres système</h3>
              <p className="text-sm text-neuro-600">Configuration générale de l'application</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h4 className="font-semibold text-neuro-900 mb-4">Configuration générale</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      Nom de l'organisation
                    </label>
                    <Input type="text" defaultValue="Police Nationale du Sénégal" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      Fuseau horaire
                    </label>
                    <select className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8">
                      <option>Africa/Dakar (GMT+0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      Langue par défaut
                    </label>
                    <select className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8">
                      <option>Français</option>
                      <option>Wolof</option>
                      <option>Anglais</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="font-semibold text-neuro-900 mb-4">Notifications</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      Email SMTP
                    </label>
                    <Input type="email" defaultValue="notifications@criminalytix.sn" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      API SMS (Twilio)
                    </label>
                    <Input type="password" placeholder="Clé API Twilio" className="w-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neuro-700">Alertes en temps réel</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                      <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <h4 className="font-semibold text-neuro-900 mb-4">Sauvegarde et maintenance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="primary">
                  <i className="ri-download-cloud-line mr-2"></i>
                  Sauvegarder maintenant
                </Button>
                <Button variant="warning">
                  <i className="ri-refresh-line mr-2"></i>
                  Vider le cache
                </Button>
                <Button variant="danger">
                  <i className="ri-restart-line mr-2"></i>
                  Redémarrer le système
                </Button>
              </div>
              <div className="mt-4 p-4 bg-neuro-50 rounded-lg">
                <p className="text-sm text-neuro-600">
                  <strong>Dernière sauvegarde :</strong> 15 janvier 2024 à 10:30<br />
                  <strong>Prochaine sauvegarde automatique :</strong> 16 janvier 2024 à 02:00
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
