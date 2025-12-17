
import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', icon: 'ri-settings-3-line' },
    { id: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
    { id: 'privacy', label: 'Confidentialité', icon: 'ri-shield-user-line' },
    { id: 'integrations', label: 'Intégrations', icon: 'ri-plug-line' }
  ];

  return (
    <Layout title="Paramètres" subtitle="Configurez vos préférences et paramètres système">
      <div className="space-y-6">
        {/* Onglets */}
        <div className="flex space-x-1 bg-neuro-100 p-1 rounded-lg">
          {tabs.map((tab) => (
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

        {/* Paramètres généraux */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-6">Paramètres généraux</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Langue de l'interface
                  </label>
                  <select className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Français</option>
                    <option>Wolof</option>
                    <option>Anglais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Fuseau horaire
                  </label>
                  <select className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Africa/Dakar (GMT+0)</option>
                    <option>Europe/Paris (GMT+1)</option>
                    <option>UTC (GMT+0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Format de date
                  </label>
                  <select className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Format d'heure
                  </label>
                  <select className="w-full px-3 py-2 border border-neuro-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>24 heures</option>
                    <option>12 heures (AM/PM)</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-6">Préférences d'affichage</h3>
              <div className="space-y-4">
                {[
                  { label: 'Affichage compact des tableaux', enabled: false },
                  { label: 'Animations d\'interface', enabled: true },
                  { label: 'Sons de notification', enabled: true },
                  { label: 'Aperçu des graphiques', enabled: true }
                ].map((pref, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neuro-900">{pref.label}</p>
                      <p className="text-sm text-neuro-600">
                        {pref.label === 'Affichage compact des tableaux' && 'Réduire l\'espacement dans les listes'}
                        {pref.label === 'Animations d\'interface' && 'Activer les transitions et animations'}
                        {pref.label === 'Sons de notification' && 'Jouer un son lors des alertes'}
                        {pref.label === 'Aperçu des graphiques' && 'Afficher les graphiques en temps réel'}
                      </p>
                    </div>
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
            </Card>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-6">Notifications par email</h3>
              <div className="space-y-4">
                {[
                  { label: 'Alertes critiques', desc: 'Incidents de haute priorité', enabled: true },
                  { label: 'Rapports quotidiens', desc: 'Résumé des activités du jour', enabled: true },
                  { label: 'Mises à jour système', desc: 'Nouvelles fonctionnalités et corrections', enabled: false },
                  { label: 'Rappels de tâches', desc: 'Tâches en attente et échéances', enabled: true }
                ].map((notif, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neuro-900">{notif.label}</p>
                      <p className="text-sm text-neuro-600">{notif.desc}</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notif.enabled ? 'bg-primary-600' : 'bg-neuro-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notif.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-6">Notifications SMS</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <Input
                    type="tel"
                    defaultValue="+221 77 123 45 67"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Alertes d\'urgence uniquement', enabled: true },
                    { label: 'Confirmations d\'actions importantes', enabled: false }
                  ].map((sms, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neuro-700">{sms.label}</span>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          sms.enabled ? 'bg-primary-600' : 'bg-neuro-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sms.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Confidentialité */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-6">Paramètres de confidentialité</h3>
              <div className="space-y-4">
                {[
                  { label: 'Partage des données d\'activité', desc: 'Permettre l\'analyse des données d\'utilisation', enabled: true },
                  { label: 'Géolocalisation', desc: 'Utiliser votre position pour les fonctionnalités de carte', enabled: true },
                  { label: 'Cookies analytiques', desc: 'Collecter des données pour améliorer l\'expérience', enabled: false },
                  { label: 'Historique des recherches', desc: 'Conserver l\'historique pour suggestions', enabled: true }
                ].map((privacy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neuro-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neuro-900">{privacy.label}</p>
                      <p className="text-sm text-neuro-600">{privacy.desc}</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacy.enabled ? 'bg-primary-600' : 'bg-neuro-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacy.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-6">Gestion des données</h3>
              <div className="space-y-4">
                <Button variant="primary">
                  <i className="ri-download-line mr-2"></i>
                  Télécharger mes données
                </Button>
                <Button variant="warning">
                  <i className="ri-delete-bin-line mr-2"></i>
                  Supprimer l'historique
                </Button>
                <Button variant="danger">
                  <i className="ri-user-unfollow-line mr-2"></i>
                  Supprimer mon compte
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Intégrations */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-6">Services connectés</h3>
              <div className="space-y-4">
                {[
                  { name: 'Google Maps', desc: 'Cartographie et géolocalisation', connected: true, icon: 'ri-map-2-line' },
                  { name: 'Twilio SMS', desc: 'Envoi de notifications SMS', connected: false, icon: 'ri-message-3-line' },
                  { name: 'Microsoft Teams', desc: 'Notifications d\'équipe', connected: true, icon: 'ri-team-line' },
                  { name: 'Slack', desc: 'Intégration chat d\'équipe', connected: false, icon: 'ri-slack-line' }
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-neuro-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-neuro-100 rounded-lg flex items-center justify-center">
                        <i className={`${service.icon} text-neuro-600`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-neuro-900">{service.name}</p>
                        <p className="text-sm text-neuro-600">{service.desc}</p>
                      </div>
                    </div>
                    <Button
                      variant={service.connected ? 'danger' : 'primary'}
                      size="sm"
                    >
                      {service.connected ? 'Déconnecter' : 'Connecter'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-6">API et webhooks</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Clé API personnelle
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      defaultValue="sk-1234567890abcdef"
                      className="flex-1"
                      readOnly
                    />
                    <Button variant="neuro" size="sm">
                      <i className="ri-file-copy-line"></i>
                    </Button>
                    <Button variant="warning" size="sm">
                      <i className="ri-refresh-line"></i>
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    URL Webhook
                  </label>
                  <Input
                    type="url"
                    placeholder="https://votre-serveur.com/webhook"
                  />
                </div>
                <Button variant="success">
                  <i className="ri-check-line mr-2"></i>
                  Tester la connexion
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <Button variant="neuro">
            Annuler
          </Button>
          <Button variant="primary">
            <i className="ri-save-line mr-2"></i>
            Sauvegarder les modifications
          </Button>
        </div>
      </div>
    </Layout>
  );
}
