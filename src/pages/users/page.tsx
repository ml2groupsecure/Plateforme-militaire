import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export default function UsersPage() {
  const { user: currentUser, register } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent' as 'admin' | 'agent'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Pour maintenant, affichons juste l'utilisateur actuel
      // En production, il faudrait une table 'profiles' ou utiliser la service key
      const mockUsers: User[] = [
        {
          id: currentUser?.id || '1',
          email: currentUser?.email || 'admin@example.com',
          name: currentUser?.name || 'Administrateur',
          role: currentUser?.role || 'admin',
          created_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString()
        }
      ];
      
      setUsers(mockUsers);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newUser.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await register(newUser.name, newUser.email, newUser.password, newUser.role);
      
      setSuccess(`Utilisateur ${newUser.name} créé avec succès !`);
      setNewUser({ name: '', email: '', password: '', role: 'agent' });
      setShowAddUser(false);
      
      // Recharger la liste
      setTimeout(() => {
        loadUsers();
        setSuccess('');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      return;
    }

    try {
      // Pour maintenant, simulons la suppression
      // En production, il faudrait utiliser la service key
      setSuccess('Utilisateur supprimé avec succès');
      
      // Retirer de la liste locale
      setUsers(users.filter(user => user.id !== userId));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erreur lors de la suppression: ' + err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? 'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium'
      : 'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium';
  };

  const getStatusBadge = (user: User) => {
    if (!user.email_confirmed_at) {
      return 'px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium';
    }
    return 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium';
  };

  const getStatusText = (user: User) => {
    if (!user.email_confirmed_at) return 'Non confirmé';
    return 'Actif';
  };

  if (currentUser?.role !== 'admin') {
    return (
      <Layout title="Accès refusé" subtitle="Cette page est réservée aux administrateurs">
        <Card className="text-center py-12">
          <i className="ri-shield-cross-line text-6xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-neuro-900 mb-2">Accès refusé</h2>
          <p className="text-neuro-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des utilisateurs" subtitle="Administration des comptes utilisateurs">
      <div className="space-y-6">
        {/* Header avec bouton d'ajout */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neuro-900 dark:text-white mb-2">
              Gestion des utilisateurs
            </h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Gérer les comptes et permissions des utilisateurs
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowAddUser(true)}
            className="flex items-center"
          >
            <i className="ri-user-add-line mr-2"></i>
            Ajouter un utilisateur
          </Button>
        </div>

        {/* Messages de succès/erreur */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg"
            >
              <i className="ri-check-circle-line mr-2"></i>
              {success}
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-lg"
            >
              <i className="ri-error-warning-line mr-2"></i>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des utilisateurs */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neuro-900 dark:text-white">
              Utilisateurs ({users.length})
            </h2>
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-neuro-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span>Chargement...</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neuro-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Rôle
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Créé le
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-neuro-100 dark:border-gray-600 hover:bg-neuro-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <i className="ri-user-line text-primary-600"></i>
                        </div>
                        <span className="font-medium text-neuro-900 dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getRoleBadge(user.role)}>
                        {user.role === 'admin' ? 'Administrateur' : 'Agent'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(user)}>
                        {getStatusText(user)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer l'utilisateur"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <i className="ri-user-line text-6xl text-neuro-400 mb-4"></i>
                <p className="text-lg text-neuro-600 dark:text-gray-400">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </Card>

        {/* Modal d'ajout d'utilisateur */}
        <AnimatePresence>
          {showAddUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-neuro-900">
                    Ajouter un utilisateur
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddUser(false);
                      setError('');
                      setNewUser({ name: '', email: '', password: '', role: 'agent' });
                    }}
                    className="p-2 hover:bg-neuro-100 rounded-lg transition-colors"
                  >
                    <i className="ri-close-line text-xl text-neuro-600"></i>
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      Nom complet
                    </label>
                    <Input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Nom de l'utilisateur"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="email@exemple.com"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      Rôle
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'agent' })}
                      className="w-full px-4 py-3 border border-neuro-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    >
                      <option value="agent">Agent</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neuro-700 mb-2">
                      Mot de passe temporaire
                    </label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-neuro-500 mt-1">
                      L'utilisateur devra changer ce mot de passe à sa première connexion
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="neuro"
                      onClick={() => {
                        setShowAddUser(false);
                        setError('');
                        setNewUser({ name: '', email: '', password: '', role: 'agent' });
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" variant="primary">
                      <i className="ri-user-add-line mr-2"></i>
                      Créer l'utilisateur
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}