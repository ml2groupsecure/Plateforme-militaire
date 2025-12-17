
import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

export default function SecurityPage() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const securityEvents = [
    { type: 'login', message: 'Connexion réussie depuis Dakar, Sénégal', time: '2h', ip: '192.168.1.100', status: 'success' },
    { type: 'password', message: 'Tentative de changement de mot de passe', time: '1j', ip: '192.168.1.100', status: 'info' },
    { type: 'failed', message: 'Tentative de connexion échouée', time: '3j', ip: '45.123.45.67', status: 'warning' },
    { type: 'login', message: 'Connexion réussie depuis Thiès, Sénégal', time: '5j', ip: '192.168.2.50', status: 'success' }
  ];

  const connectedDevices = [
    { name: 'Chrome sur Windows', location: 'Dakar, Sénégal', lastActive: '2h', current: true },
    { name: 'Safari sur iPhone', location: 'Dakar, Sénégal', lastActive: '1j', current: false },
    { name: 'Firefox sur Ubuntu', location: 'Thiès, Sénégal', lastActive: '3j', current: false }
  ];

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de changement de mot de passe
    setShowChangePassword(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <Layout title="Sécurité" subtitle="Gérez la sécurité de votre compte et surveillez l'activité">
      <div className="space-y-6">
        {/* Statut de sécurité */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <i className="ri-shield-check-line text-xl text-success-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neuro-900">Compte sécurisé</h3>
                <p className="text-sm text-neuro-600">Votre compte respecte toutes les bonnes pratiques de sécurité</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-success-600">95%</div>
              <div className="text-sm text-neuro-500">Score de sécurité</div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentification */}
          <Card>
            <h3 className="text-lg font-semibold text-neuro-900 mb-6">Authentification</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg">
                <div>
                  <p className="font-medium text-neuro-900">Mot de passe</p>
                  <p className="text-sm text-neuro-600">Dernière modification il y a 30 jours</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowChangePassword(true)}
                >
                  Modifier
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg">
                <div>
                  <p className="font-medium text-neuro-900">Authentification à deux facteurs</p>
                  <p className="text-sm text-neuro-600">Protection supplémentaire activée</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-success-600 font-medium">Activé</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                    <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg">
                <div>
                  <p className="font-medium text-neuro-900">Notifications de connexion</p>
                  <p className="text-sm text-neuro-600">Recevoir un email à chaque connexion</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                  <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </Card>

          {/* Appareils connectés */}
          <Card>
            <h3 className="text-lg font-semibold text-neuro-900 mb-6">Appareils connectés</h3>
            <div className="space-y-3">
              {connectedDevices.map((device, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border border-neuro-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <i className="ri-computer-line text-primary-600"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neuro-900">
                        {device.name}
                        {device.current && (
                          <span className="ml-2 text-xs bg-success-100 text-success-800 px-2 py-1 rounded-full">
                            Actuel
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-neuro-500">{device.location} • Actif il y a {device.lastActive}</p>
                    </div>
                  </div>
                  {!device.current && (
                    <Button variant="danger" size="sm">
                      <i className="ri-logout-circle-line"></i>
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
            <Button variant="danger" className="w-full mt-4">
              <i className="ri-logout-circle-line mr-2"></i>
              Déconnecter tous les autres appareils
            </Button>
          </Card>
        </div>

        {/* Activité de sécurité */}
        <Card>
          <h3 className="text-lg font-semibold text-neuro-900 mb-6">Activité de sécurité récente</h3>
          <div className="space-y-3">
            {securityEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    event.status === 'success' ? 'bg-success-500' :
                    event.status === 'warning' ? 'bg-warning-500' :
                    event.status === 'info' ? 'bg-primary-500' : 'bg-danger-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-neuro-900">{event.message}</p>
                    <p className="text-xs text-neuro-500">IP: {event.ip} • Il y a {event.time}</p>
                  </div>
                </div>
                <Button variant="neuro" size="sm">
                  <i className="ri-more-2-line"></i>
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Paramètres de sécurité avancés */}
        <Card>
          <h3 className="text-lg font-semibold text-neuro-900 mb-6">Paramètres avancés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-neuro-900 mb-4">Restrictions d'accès</h4>
              <div className="space-y-3">
                {[
                  { label: 'Limiter l\'accès par IP', enabled: false },
                  { label: 'Verrouillage automatique', enabled: true },
                  { label: 'Expiration de session', enabled: true }
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-neuro-700">{setting.label}</span>
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
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-neuro-900 mb-4">Actions rapides</h4>
              <div className="space-y-2">
                <Button variant="warning" className="w-full">
                  <i className="ri-download-line mr-2"></i>
                  Télécharger les logs de sécurité
                </Button>
                <Button variant="danger" className="w-full">
                  <i className="ri-alarm-warning-line mr-2"></i>
                  Signaler une activité suspecte
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de changement de mot de passe */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-neuro-900 mb-4">Changer le mot de passe</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neuro-700 mb-2">
                  Mot de passe actuel
                </label>
                <Input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neuro-700 mb-2">
                  Nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neuro-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  Changer le mot de passe
                </Button>
                <Button
                  type="button"
                  variant="neuro"
                  onClick={() => setShowChangePassword(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
