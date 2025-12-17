
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { fetchSenegalRadarAlerts } from '../../services/radar/senegalRadarService';
import {
  countUnread,
  markManyAsRead,
  markAsRead,
  radarToNotifications,
  timeAgoFr,
  type AppNotification,
} from '../../services/notifications/radarNotificationService';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const radar = await fetchSenegalRadarAlerts(false);
      setNotifications(radarToNotifications(radar));
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // polling (le backend a un cache, donc ce n'est pas coûteux)
    const interval = setInterval(() => {
      loadNotifications();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return 'ri-error-warning-line';
      case 'warning': return 'ri-alert-line';
      case 'info': return 'ri-information-line';
      case 'success': return 'ri-check-circle-line';
      default: return 'ri-notification-3-line';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'text-danger-600 bg-danger-100';
      case 'warning': return 'text-warning-600 bg-warning-100';
      case 'info': return 'text-primary-600 bg-primary-100';
      case 'success': return 'text-success-600 bg-success-100';
      default: return 'text-neuro-600 bg-neuro-100';
    }
  };

  const unreadCount = useMemo(() => countUnread(notifications), [notifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleMarkAllRead = () => {
    const ids = notifications.map((n) => n.id);
    markManyAsRead(ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkOneRead = (id: string) => {
    markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <Layout title="Notifications" subtitle="Alertes et messages">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neuro-900 dark:text-white">Notifications</h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Gérez toutes vos notifications système
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="neuro" size="sm" onClick={loadNotifications} disabled={loading}>
              <i className="ri-refresh-line mr-2"></i>
              {loading ? 'Chargement…' : 'Rafraîchir'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleMarkAllRead} disabled={notifications.length === 0 || unreadCount === 0}>
              <i className="ri-check-double-line mr-2"></i>
              Tout marquer comme lu
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap gap-2">
              {[
              { key: 'all', label: `Toutes (${notifications.length})`, icon: 'ri-notification-3-line' },
              { key: 'unread', label: `Non lues (${unreadCount})`, icon: 'ri-notification-badge-line' },
              { key: 'alert', label: 'Alertes', icon: 'ri-error-warning-line' },
              { key: 'warning', label: 'Avertissements', icon: 'ri-alert-line' },
              { key: 'info', label: 'Informations', icon: 'ri-information-line' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  filter === key
                    ? 'bg-primary-500 text-white'
                    : 'bg-neuro-100 dark:bg-gray-700 text-neuro-600 dark:text-gray-300 hover:bg-neuro-200 dark:hover:bg-gray-600'
                }`}
              >
                <i className={icon}></i>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all duration-200 hover:shadow-lg ${
                !notification.read ? 'border-l-4 border-l-primary-500' : ''
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                    <i className={`${getTypeIcon(notification.type)} text-lg`}></i>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neuro-900 dark:text-white">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full inline-block"></span>
                          )}
                        </h3>
                        <p className="text-neuro-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-neuro-500 dark:text-gray-500">
                          <span>Il y a {timeAgoFr(notification.timestamp)}</span>
                          <span>•</span>
                          <span>{notification.timestamp.toLocaleString('fr-FR')}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            notification.priority === 'high' ? 'bg-danger-100 text-danger-600' :
                            notification.priority === 'medium' ? 'bg-warning-100 text-warning-600' :
                            'bg-neuro-100 text-neuro-600'
                          }`}>
                            {notification.priority === 'high' ? 'Priorité élevée' :
                             notification.priority === 'medium' ? 'Priorité moyenne' : 'Priorité faible'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="neuro" size="sm" onClick={() => handleMarkOneRead(notification.id)}>
                          <i className="ri-eye-line"></i>
                        </Button>
                        <Button variant="neuro" size="sm">
                          <i className="ri-more-2-line"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <Card className="text-center py-12">
            <i className="ri-notification-off-line text-4xl text-neuro-400 dark:text-gray-500 mb-4"></i>
            <h3 className="text-lg font-medium text-neuro-900 dark:text-white mb-2">
              Aucune notification
            </h3>
            <p className="text-neuro-600 dark:text-gray-400">
              {error ? `Erreur de chargement: ${error}` : 'Aucune notification ne correspond aux filtres sélectionnés.'}
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
