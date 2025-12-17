
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Button from '../base/Button';

const navigation = [
  { name: 'Tableau de Bord', href: '/dashboard', icon: 'ri-dashboard-3-line' },
  { name: 'Signalements', href: '/signalements', icon: 'ri-flag-line' },
  { name: 'Analyse Criminelle', href: '/analysis', icon: 'ri-bar-chart-box-line' },
  { name: 'Profilage Criminel', href: '/profiling', icon: 'ri-user-search-line' },
  { name: 'Allocation Ressources', href: '/resources', icon: 'ri-team-line' },
  { name: 'Prédictions IA', href: '/predictions', icon: 'ri-brain-line' },
  { name: 'Radar Sénégal', href: '/senegal-radar', icon: 'ri-map-pin-time-line' },
  { name: 'Historique CSV', href: '/csv-history', icon: 'ri-file-list-3-line' },
  { name: 'Notifications', href: '/notifications', icon: 'ri-notification-3-line' },
  { name: 'Documentation', href: '/documentation', icon: 'ri-book-open-line' },
];

const adminNavigation = [
  { name: 'Administration', href: '/admin', icon: 'ri-admin-line' },
  { name: 'Gestion Agents', href: '/agents', icon: 'ri-user-settings-line' },
  { name: 'Gestion Utilisateurs', href: '/users', icon: 'ri-team-line' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className={`bg-white border-r border-neuro-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-neuro-200">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <i className="ri-shield-check-line text-white"></i>
              </div>
              <span className="text-xl font-bold text-neuro-900" style={{ fontFamily: '"Pacifico", serif' }}>
                SeenPredyct
              </span>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-neuro-100 transition-colors"
          >
            <i className={`ri-${isCollapsed ? 'menu-unfold' : 'menu-fold'}-line text-neuro-600`}></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neuro-600 hover:bg-neuro-100 hover:text-neuro-900'
                }`
              }
            >
              <i className={`${item.icon} ${isCollapsed ? 'text-lg' : 'mr-3'}`}></i>
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}

          {/* Navigation admin */}
          {user?.role === 'admin' && (
            <>
              <div className={`border-t border-neuro-200 ${isCollapsed ? 'mt-4 pt-4' : 'my-4'}`}></div>
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neuro-600 hover:bg-neuro-100 hover:text-neuro-900'
                    }`
                  }
                >
                  <i className={`${item.icon} ${isCollapsed ? 'text-lg' : 'mr-3'}`}></i>
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Bouton de déconnexion */}
        <div className="p-4 border-t border-neuro-200">
          <Button
            variant="danger"
            onClick={handleLogout}
            className={`w-full ${isCollapsed ? 'px-2' : ''}`}
          >
            <i className={`ri-logout-circle-line ${isCollapsed ? '' : 'mr-2'}`}></i>
            {!isCollapsed && 'Se déconnecter'}
          </Button>
        </div>
      </div>
    </div>
  );
}
