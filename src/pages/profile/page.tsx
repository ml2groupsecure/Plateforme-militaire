
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+221 77 123 45 67',
    department: 'Police Criminelle',
    badge: 'PC-2024-001',
    location: 'Dakar, Sénégal'
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Mise à jour des métadonnées utilisateur
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          badge: formData.badge,
          location: formData.location
        }
      });

      if (error) throw error;

      // Sauvegarde dans une table de profils si elle existe
      try {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: user?.id,
            name: formData.name,
            phone: formData.phone,
            department: formData.department,
            badge: formData.badge,
            location: formData.location,
            updated_at: new Date().toISOString()
          });
      } catch (profileError) {
        // Si la table n'existe pas, on continue sans erreur
        console.log('Table user_profiles non trouvée, sauvegarde dans les métadonnées uniquement');
      }

      setSaveMessage('Profil sauvegardé avec succès !');
      setIsEditing(false);
      
      // Effacer le message après 3 secondes
      setTimeout(() => setSaveMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveMessage('Erreur lors de la sauvegarde. Veuillez réessayer.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { label: 'Affaires traitées', value: '127', icon: 'ri-file-list-3-line', color: 'primary' },
    { label: 'Taux de résolution', value: '89%', icon: 'ri-check-double-line', color: 'success' },
    { label: 'Années d\'expérience', value: '8', icon: 'ri-time-line', color: 'warning' },
    { label: 'Formations suivies', value: '12', icon: 'ri-graduation-cap-line', color: 'info' }
  ];

  const recentActivity = [
    { action: 'Analyse d\'incident', case: 'INC-2024-0156', time: '2h', status: 'completed' },
    { action: 'Rapport de patrouille', case: 'PAT-2024-0089', time: '4h', status: 'pending' },
    { action: 'Mise à jour profil suspect', case: 'SUS-2024-0234', time: '1j', status: 'completed' },
    { action: 'Formation IA prédictive', case: 'FORM-2024-003', time: '2j', status: 'in-progress' }
  ];

  return (
    <Layout title="Mon Profil" subtitle="Gérez vos informations personnelles et professionnelles">
      <div className="space-y-6">
        {/* Message de sauvegarde */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              saveMessage.includes('succès') 
                ? 'bg-success-100 text-success-800 border border-success-200' 
                : 'bg-danger-100 text-danger-800 border border-danger-200'
            }`}
          >
            <div className="flex items-center">
              <i className={`${saveMessage.includes('succès') ? 'ri-check-circle-line' : 'ri-error-warning-line'} mr-2`}></i>
              {saveMessage}
            </div>
          </motion.div>
        )}

        {/* En-tête du profil */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neuro-900">{user?.name}</h2>
                <p className="text-neuro-600 capitalize">{user?.role}</p>
                <p className="text-sm text-neuro-500 mt-1">{formData.department}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                    En service
                  </span>
                  <span className="text-sm text-neuro-500">Badge: {formData.badge}</span>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? 'success' : 'primary'}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <i className={`ri-${isEditing ? 'save' : 'edit'}-line mr-2`}></i>
                  {isEditing ? 'Sauvegarder' : 'Modifier'}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Affaires traitées', value: '127', icon: 'ri-file-list-3-line', color: 'primary' },
            { label: 'Taux de résolution', value: '89%', icon: 'ri-check-double-line', color: 'success' },
            { label: 'Années d\'expérience', value: '8', icon: 'ri-time-line', color: 'warning' },
            { label: 'Formations suivies', value: '12', icon: 'ri-graduation-cap-line', color: 'info' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mr-4`}>
                    <i className={`${stat.icon} text-xl text-${stat.color}-600`}></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neuro-900">{stat.value}</p>
                    <p className="text-sm text-neuro-600">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <Card>
            <h3 className="text-lg font-semibold text-neuro-900 mb-6">Informations personnelles</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neuro-700 mb-2">Nom complet</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neuro-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neuro-700 mb-2">Téléphone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neuro-700 mb-2">Localisation</label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>

          {/* Activité récente */}
          <Card>
            <h3 className="text-lg font-semibold text-neuro-900 mb-6">Activité récente</h3>
            <div className="space-y-4">
              {[
                { action: 'Analyse d\'incident', case: 'INC-2024-0156', time: '2h', status: 'completed' },
                { action: 'Rapport de patrouille', case: 'PAT-2024-0089', time: '4h', status: 'pending' },
                { action: 'Mise à jour profil suspect', case: 'SUS-2024-0234', time: '1j', status: 'completed' },
                { action: 'Formation IA prédictive', case: 'FORM-2024-003', time: '2j', status: 'in-progress' }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-neuro-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-success-500' :
                      activity.status === 'pending' ? 'bg-warning-500' : 'bg-primary-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-neuro-900">{activity.action}</p>
                      <p className="text-xs text-neuro-500">{activity.case}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neuro-500">Il y a {activity.time}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Préférences */}
        <Card>
          <h3 className="text-lg font-semibold text-neuro-900 mb-6">Préférences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-neuro-900 mb-4">Notifications</h4>
              <div className="space-y-3">
                {[
                  { label: 'Alertes en temps réel', enabled: true },
                  { label: 'Rapports quotidiens', enabled: true },
                  { label: 'Notifications SMS', enabled: false },
                  { label: 'Mises à jour système', enabled: true }
                ].map((pref, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-neuro-700">{pref.label}</span>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pref.enabled ? 'bg-primary-600' : 'bg-neuro-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pref.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-neuro-900 mb-4">Interface</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">Langue</label>
                  <select className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8">
                    <option>Français</option>
                    <option>Wolof</option>
                    <option>Anglais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">Fuseau horaire</label>
                  <select className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8">
                    <option>Africa/Dakar (GMT+0)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
