
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../base/Button';
import { runDiagnostic, checkCSV } from '../../lib/diagnostics';
import { fetchSenegalRadarAlerts } from '../../services/radar/senegalRadarService';
import { countUnread, radarToNotifications } from '../../services/notifications/radarNotificationService';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleMenuClick = (path: string) => {
    setShowUserMenu(false);
    navigate(path);
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const loadUnreadNotifications = async () => {
    try {
      const radar = await fetchSenegalRadarAlerts(false);
      const notifs = radarToNotifications(radar);
      setUnreadNotificationsCount(countUnread(notifs));
    } catch {
      // Ne pas casser le header si l'API n'est pas dispo.
      setUnreadNotificationsCount(0);
    }
  };

  useEffect(() => {
    loadUnreadNotifications();

    const interval = setInterval(() => {
      loadUnreadNotifications();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleDiagnostic = async () => {
    console.log('🔍 Démarrage du diagnostic...');
    alert('🔍 Diagnostic en cours...\nConsultez la console (F12) pour les détails.');
    
    try {
      const results = await runDiagnostic();
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      const message = `📊 Résultats du diagnostic:\n\n` +
        `✅ ${successCount}/${totalCount} tests réussis\n\n` +
        results.map(r => `${r.success ? '✅' : '❌'} ${r.component}: ${r.message}`).join('\n') +
        `\n\n🔍 Détails complets dans la console`;
      
      alert(message);
    } catch (error) {
      console.error('Erreur diagnostic:', error);
      alert('❌ Erreur lors du diagnostic. Voir la console.');
    }
  };
  
  const handleQuickCSVCheck = async () => {
    console.log('📊 Vérification CSV rapide...');
    
    try {
      const result = await checkCSV();
      const message = `${result.success ? '✅' : '❌'} ${result.component}\n\n${result.message}`;
      alert(message);
    } catch (error) {
      console.error('Erreur vérification CSV:', error);
      alert('❌ Erreur lors de la vérification CSV.');
    }
  };

  return (
    <header className="bg-white border-b border-neuro-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neuro-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neuro-600 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Diagnostic Tools */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="neuro" 
              size="sm" 
              className="hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={handleDiagnostic}
              title="Diagnostic complet du système"
            >
              <i className="ri-stethoscope-line text-lg text-blue-600"></i>
            </Button>
            <Button 
              variant="neuro" 
              size="sm" 
              className="hover:bg-green-50 transition-colors cursor-pointer"
              onClick={handleQuickCSVCheck}
              title="Vérification rapide CSV"
            >
              <i className="ri-file-csv-line text-lg text-green-600"></i>
            </Button>
          </div>
          
          {/* Notifications */}
          <Button 
            variant="neuro" 
            size="sm" 
            className="relative hover:bg-neuro-100 transition-colors cursor-pointer"
            onClick={handleNotificationClick}
            title={unreadNotificationsCount > 0 ? `${unreadNotificationsCount} notification(s) non lue(s)` : 'Aucune notification non lue'}
          >
            <i className="ri-notification-3-line text-lg"></i>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-danger-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </span>
            )}
          </Button>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neuro-50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-neuro-900">{user?.name}</p>
                <p className="text-xs text-neuro-500 capitalize">{user?.role}</p>
              </div>
              <i className={`ri-arrow-down-s-line text-neuro-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu déroulant */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neuro-200 py-2 z-50"
                >
                  <button
                    onClick={() => handleMenuClick('/profile')}
                    className="w-full text-left px-4 py-2 text-sm text-neuro-700 hover:bg-neuro-50 flex items-center"
                  >
                    <i className="ri-user-line mr-3"></i>
                    Mon profil
                  </button>
                  <button
                    onClick={() => handleMenuClick('/settings')}
                    className="w-full text-left px-4 py-2 text-sm text-neuro-700 hover:bg-neuro-50 flex items-center"
                  >
                    <i className="ri-settings-3-line mr-3"></i>
                    Paramètres
                  </button>
                  <button
                    onClick={() => handleMenuClick('/security')}
                    className="w-full text-left px-4 py-2 text-sm text-neuro-700 hover:bg-neuro-50 flex items-center"
                  >
                    <i className="ri-shield-check-line mr-3"></i>
                    Sécurité
                  </button>
                  <hr className="my-2 border-neuro-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 flex items-center"
                  >
                    <i className="ri-logout-circle-line mr-3"></i>
                    Se déconnecter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
