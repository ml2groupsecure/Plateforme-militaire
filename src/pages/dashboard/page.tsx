
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import SmartCSVUploader from '../../components/upload/SmartCSVUploader';
import { usePDFReports, type ReportData } from '../../lib/pdfService';
import { useCsvHistory } from '../../lib/csvHistoryService';
import { supabase } from '../../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TimeSeriesChart, LocationBarChart, TypeDoughnutChart } from '../../components/charts/InteractiveCharts';
import { useCsvData } from '../../context/CsvDataContext';
import ChartControlPanel from '../../components/dashboard/ChartControlPanel';
import type { SenegalRadarAlert, SenegalRadarResponse } from '../../services/radar/senegalRadarService';
import { fetchSenegalRadarAlerts } from '../../services/radar/senegalRadarService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

type DashboardAlertType = 'critical' | 'warning' | 'info';
type DashboardAlertSeverity = 'high' | 'medium' | 'low';

interface DashboardRealtimeAlert {
  id: string;
  type: DashboardAlertType;
  zone: string;
  message: string;
  time: Date;
  severity: DashboardAlertSeverity;
}

function mapRadarSeverityToDashboard(alert: SenegalRadarAlert): { type: DashboardAlertType; severity: DashboardAlertSeverity } {
  const sev = (alert.severity || '').toUpperCase();
  if (sev === 'ÉLEVÉ' || sev === 'ELEVÉ') return { type: 'critical', severity: 'high' };
  if (sev === 'MOYEN') return { type: 'warning', severity: 'medium' };
  return { type: 'info', severity: 'low' };
}

function radarToDashboardAlerts(radar: SenegalRadarResponse): DashboardRealtimeAlert[] {
  const generatedAt = radar.generated_at ? new Date(radar.generated_at) : new Date();
  return (radar.alerts || []).map((a: SenegalRadarAlert) => {
    const mapped = mapRadarSeverityToDashboard(a);
    const id = `${a.place}|${a.type}|${a.info}|${a.severity}`;
    const msgParts = [a.type, a.info].filter(Boolean);

    return {
      id,
      type: mapped.type,
      severity: mapped.severity,
      zone: a.place || 'Sénégal',
      message: msgParts.join(' - ') || 'Alerte détectée',
      time: generatedAt,
    };
  });
}

export default function DashboardPage() {
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [period, setPeriod] = useState('7d');
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [showIncidentFilters, setShowIncidentFilters] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showAllIncidents, setShowAllIncidents] = useState(false);
  const [showChartControlPanel, setShowChartControlPanel] = useState(false);
  
  // Hook pour accéder aux données CSV
  const { 
    getTotalIncidents, 
    getResolutionRate, 
    getActiveAgents, 
    getRiskZones,
    getTimeSeriesData,
    getLocationBarData,
    getTypeDoughnutData,
    refreshData: refreshCsvData,
    csvData,
    isLoading: csvIsLoading
  } = useCsvData();
  const [recentIncidents, setRecentIncidents] = useState([
    {
      id: 1,
      type: 'Vol à main armée',
      zone: 'Sandaga',
      time: '14:30',
      status: 'En cours',
      priority: 'high',
      agent: 'Agent Diop'
    },
    {
      id: 2,
      type: 'Agression',
      zone: 'UCAD',
      time: '13:45',
      status: 'Résolu',
      priority: 'medium',
      agent: 'Agent Fall'
    },
    {
      id: 3,
      type: 'Fraude',
      zone: 'Plateau',
      time: '12:20',
      status: 'En cours',
      priority: 'low',
      agent: 'Agent Ndiaye'
    },
    {
      id: 4,
      type: 'Vol de véhicule',
      zone: 'Pikine',
      time: '11:15',
      status: 'Classé',
      priority: 'high',
      agent: 'Agent Sow'
    },
    {
      id: 5,
      type: 'Cambriolage',
      zone: 'Guédiawaye',
      time: '10:30',
      status: 'Résolu',
      priority: 'medium',
      agent: 'Agent Ba'
    }
  ]);
  const { generateReport, generateLocationReport, isGenerating } = usePDFReports();
  const { stats: csvStats, refresh: refreshCsvHistory } = useCsvHistory();

  // Données pour les graphiques animés
  const crimeData = [
    { day: '1', crimes: 23 },
    { day: '5', crimes: 31 },
    { day: '10', crimes: 18 },
    { day: '15', crimes: 42 },
    { day: '20', crimes: 35 },
    { day: '25', crimes: 28 },
    { day: '30', crimes: 39 }
  ];

  const crimeTypes = [
    { name: 'Vols', percentage: 35, color: 'bg-red-500' },
    { name: 'Agressions', percentage: 25, color: 'bg-orange-500' },
    { name: 'Fraudes', percentage: 20, color: 'bg-blue-500' },
    { name: 'Cambriolages', percentage: 15, color: 'bg-green-500' },
    { name: 'Autres', percentage: 5, color: 'bg-purple-500' }
  ];

  const [realTimeAlerts, setRealTimeAlerts] = useState<DashboardRealtimeAlert[]>([]);
  const [radarLastError, setRadarLastError] = useState<string | null>(null);

  // KPIs dynamiques basés sur les données CSV
  const kpis = useMemo(() => ({
    totalIncidents: getTotalIncidents(),
    resolutionRate: getResolutionRate(),
    activeAgents: getActiveAgents(),
    riskZones: getRiskZones()
  }), [getTotalIncidents, getResolutionRate, getActiveAgents, getRiskZones]);

  // Fonction pour charger les incidents depuis Supabase
  const loadRecentIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && !error) {
        const formattedIncidents = data.map((incident, index) => ({
          id: index + 1,
          type: incident.incident_type || 'Incident',
          zone: incident.location || 'Zone inconnue',
          time: new Date(incident.date_occurred).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          status: incident.status === 'imported' ? 'Nouveau' : incident.status || 'En cours',
          priority: incident.severity === 'high' ? 'high' : incident.severity === 'medium' ? 'medium' : 'low',
          agent: incident.agent_name || 'Agent assigné'
        }));
        setRecentIncidents(formattedIncidents);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des incidents:', error);
    }
  };

  const loadRadarAlerts = async () => {
    try {
      const resp = await fetchSenegalRadarAlerts(false);
      const mapped = radarToDashboardAlerts(resp);

      // Limiter pour le dashboard (évite de surcharger l'UI)
      setRealTimeAlerts(mapped.slice(0, 6));
      setRadarLastError(null);
    } catch (e: any) {
      console.warn('Radar Sénégal indisponible:', e);
      setRadarLastError(String(e?.message || e));
      // On garde les alertes existantes si une erreur survient, pour éviter un dashboard vide.
    }
  };

  // Chargement initial des données
  useEffect(() => {
    loadRecentIncidents();
    loadRadarAlerts();

    // Polling: le cache backend est ~10min, mais on peut rafraîchir l'UI régulièrement.
    const interval = setInterval(() => {
      loadRadarAlerts();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const [unusedRecentIncidents] = useState([
    {
      id: 1,
      type: 'Vol à main armée',
      zone: 'Sandaga',
      time: '14:30',
      status: 'En cours',
      priority: 'high',
      agent: 'Agent Diop'
    },
    {
      id: 2,
      type: 'Agression',
      zone: 'UCAD',
      time: '13:45',
      status: 'Résolu',
      priority: 'medium',
      agent: 'Agent Fall'
    },
    {
      id: 3,
      type: 'Fraude',
      zone: 'Plateau',
      time: '12:20',
      status: 'En cours',
      priority: 'low',
      agent: 'Agent Ndiaye'
    },
    {
      id: 4,
      type: 'Vol de véhicule',
      zone: 'Pikine',
      time: '11:15',
      status: 'Classé',
      priority: 'high',
      agent: 'Agent Sow'
    },
    {
      id: 5,
      type: 'Cambriolage',
      zone: 'Guédiawaye',
      time: '10:30',
      status: 'Résolu',
      priority: 'medium',
      agent: 'Agent Ba'
    }
  ]);

  // Auto‑refresh data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setLastUpdate(new Date());

      } catch (error) {
        console.error('Error updating KPIs:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLastUpdate(new Date());
    // Recharger les vraies données
    await Promise.all([
      loadRecentIncidents(),
      refreshCsvHistory(),
      refreshCsvData(), // Rafraîchir les données CSV pour mettre à jour les KPIs et graphiques
      loadRadarAlerts(),
    ]);
    // Les KPIs sont maintenant calculés dynamiquement depuis les données CSV
  };

  const handleGenerateDashboardReport = async () => {
    const reportData: ReportData = {
      title: `Rapport de Surveillance - Tableau de Bord`,
      period: period,
      generated_by: 'Système SEENTU KAARANGE',
      generated_at: new Date().toISOString(),
      summary: {
        total_incidents: kpis.totalIncidents,
        resolved_incidents: Math.floor(kpis.totalIncidents * (kpis.resolutionRate / 100)),
        pending_incidents: Math.floor(kpis.totalIncidents * (1 - kpis.resolutionRate / 100)),
        critical_incidents: realTimeAlerts.filter(a => a.type === 'critical').length
      },
      charts: {
        incidents_by_type: doughnutData,
        incidents_by_location: barChartData,
        trend_analysis: lineChartData
      },
      predictions: [
        {
          location: 'Sandaga',
          predicted_type: 'Vol à main armée',
          risk_level: 'critical',
          confidence: 0.94,
          timeframe: '2h'
        },
        {
          location: 'UCAD',
          predicted_type: 'Agression',
          risk_level: 'medium',
          confidence: 0.78,
          timeframe: '24h'
        },
        {
          location: 'Plateau',
          predicted_type: 'Fraude',
          risk_level: 'medium',
          confidence: 0.71,
          timeframe: '48h'
        }
      ],
      recommendations: [
        'Renforcer immédiatement les patrouilles à Sandaga',
        'Activer le protocole d\'alerte pour les commerçants',
        'Déployer des agents supplémentaires dans les zones à risque',
        'Améliorer la coordination entre les équipes de terrain',
        'Mettre en place un système de communication d\'urgence'
      ],
      hotspots: [
        {
          location: 'Sandaga',
          incident_count: 245,
          risk_score: 0.95,
          crime_types: ['Vol à main armée', 'Agression']
        },
        {
          location: 'UCAD',
          incident_count: 189,
          risk_score: 0.78,
          crime_types: ['Agression', 'Vol']
        },
        {
          location: 'Plateau',
          incident_count: 167,
          risk_score: 0.71,
          crime_types: ['Fraude', 'Escroquerie']
        },
        {
          location: 'Pikine',
          incident_count: 134,
          risk_score: 0.68,
          crime_types: ['Cambriolage', 'Vol de véhicule']
        }
      ]
    };

    await generateReport(reportData);
  };


  // Graphiques dynamiques basés sur les données CSV (maj après import)
  const chartDays = useMemo(() => {
    switch (period) {
      case '24h':
        return 1;
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      default:
        return 7;
    }
  }, [period]);

  const lineChartData = useMemo(() => getTimeSeriesData(chartDays), [getTimeSeriesData, chartDays, csvData]);
  const barChartData = useMemo(() => getLocationBarData(), [getLocationBarData, csvData]);
  const doughnutData = useMemo(() => getTypeDoughnutData(), [getTypeDoughnutData, csvData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        border: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    cutout: '60%'
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-danger-600 bg-danger-100';
      case 'medium':
        return 'text-warning-600 bg-warning-100';
      case 'low':
        return 'text-success-600 bg-success-100';
      default:
        return 'text-neuro-600 bg-neuro-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours':
        return 'text-warning-600 bg-warning-100';
      case 'Résolu':
        return 'text-success-600 bg-success-100';
      case 'Classé':
        return 'text-neuro-600 bg-neuro-100';
      default:
        return 'text-neuro-600 bg-neuro-100';
    }
  };

  return (
    <Layout title="Tableau de Bord" subtitle="Surveillance en temps réel">
      <div className="space-y-8">
        {/* Header with real-time status */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neuro-900 dark:text-white mb-2">
              Tableau de bord
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-neuro-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span>Système opérationnel</span>
              </div>
              <div className="text-sm text-neuro-500 dark:text-gray-500">
                Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
              </div>
              <Button variant="neuro" size="sm" onClick={handleRefresh}>
                <i className="ri-refresh-line mr-2"></i>
                Actualiser
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-777 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-soft"
            >
              <option value="24h">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
            </select>
            <Button variant="neuro" size="sm" onClick={() => setShowCSVUploader(true)}>
              <i className="ri-upload-2-line mr-2"></i>
              Importer données
            </Button>
            <Button variant="neuro" size="sm" onClick={() => setShowChartControlPanel(true)}>
              <i className="ri-settings-3-line mr-2"></i>
              Personnaliser
            </Button>
            <Button variant="primary" size="sm" onClick={handleGenerateDashboardReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <i className="ri-file-pdf-line mr-2"></i>
                  Rapport PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-700 mb-1">
                      Total Incidents
                    </p>
                    <p className="text-3xl font-bold text-primary-900">
                      {kpis.totalIncidents.toLocaleString()}
                    </p>
                    <p className="text-xs text-success-600 mt-2 flex items-center">
                      <i className="ri-arrow-up-line mr-1"></i> +12% ce mois
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-alert-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-success-50 to-success-100 border-success-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-success-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-success-700 mb-1">
                      Taux de résolution
                    </p>
                    <p className="text-3xl font-bold text-success-900">
                      {kpis.resolutionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-success-600 mt-2 flex items-center">
                      <i className="ri-arrow-up-line mr-1"></i> +3.2% ce mois
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-success-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-check-circle-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-warning-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-warning-700 mb-1">
                      Agents actifs
                    </p>
                    <p className="text-3xl font-bold text-warning-900">
                      {kpis.activeAgents}
                    </p>
                    <p className="text-xs text-warning-600 mt-2 flex items-center">
                      <i className="ri-arrow-down-line mr-1"></i> -2 aujourd'hui
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-warning-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-team-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-danger-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-danger-700 mb-1">
                      Zones à risque
                    </p>
                    <p className="text-3xl font-bold text-danger-900">
                      {kpis.riskZones}
                    </p>
                    <p className="text-xs text-danger-600 mt-2 flex items-center">
                      <i className="ri-arrow-up-line mr-1"></i> +1 cette semaine
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-danger-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-map-pin-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Real-time Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Alertes en temps réel
              </h2>
              <div className="w-2 h-2 bg-danger-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex space-x-2">
              <Button variant="neuro" size="sm" onClick={() => setShowAlertSettings(true)}>
                <i className="ri-settings-3-line"></i>
              </Button>
              <Button variant="neuro" size="sm">
                <i className="ri-arrow-up-line"></i>
              </Button>
              <Button variant="neuro" size="sm">
                <i className="ri-arrow-down-line"></i>
              </Button>
            </div>
          </div>

          {radarLastError && (
            <div className="mb-4 text-sm text-warning-700 bg-warning-50 border border-warning-200 rounded-xl p-3">
              <i className="ri-alert-line mr-2"></i>
              Radar Sénégal indisponible (dernière erreur): {radarLastError}
            </div>
          )}

          <div className="space-y-4">
            {realTimeAlerts.length === 0 ? (
              <div className="text-center py-6">
                <i className="ri-shield-check-line text-4xl text-neuro-300 mb-2"></i>
                <p className="text-sm text-neuro-600 dark:text-gray-400">Aucune alerte Radar pour le moment</p>
              </div>
            ) : (
              realTimeAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-l-4 ${
                  alert.type === 'critical'
                    ? 'border-l-danger-500 bg-danger-50 dark:bg-red-900/20'
                    : alert.type === 'warning'
                    ? 'border-l-warning-500 bg-warning-50 dark:bg-yellow-900/20'
                    : 'border-l-primary-500 bg-primary-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i
                      className={`${
                        alert.type === 'critical'
                          ? 'ri-error-warning-line text-danger-600'
                          : alert.type === 'warning'
                          ? 'ri-alert-line text-warning-600'
                          : 'ri-information-line text-primary-600'
                      } text-lg`}
                    ></i>
                    <div>
                      <p className="font-medium text-neuro-900 dark:text-white">
                        {alert.zone} - {alert.message}
                      </p>
                      <p className="text-sm text-neuro-600 dark:text-gray-400">
                        Il y a{' '}
                        {Math.floor((Date.now() - alert.time.getTime()) / 60000)} minutes
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="neuro" size="sm">
                      <i className="ri-eye-line"></i>
                    </Button>
                    <Button variant="neuro" size="sm">
                      <i className="ri-close-line"></i>
                    </Button>
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Tendance des incidents
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <TimeSeriesChart />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Incidents par zone
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <LocationBarChart />
          </Card>
        </div>

        {/* Graphiques avec animations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-4">
                Évolution des crimes (30 derniers jours)
              </h3>
              <div className="h-64 flex items-end justify-between space-x-2 p-4">
                {crimeData.map((item, index) => (
                  <motion.div
                    key={item.day}
                    className="flex flex-col items-center flex-1"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: index * 0.1 + 0.8, duration: 0.8 }}
                  >
                    <motion.div
                      className="bg-primary-500 rounded-t w-full"
                      initial={{ height: 0 }}
                      animate={{
                        height: `${
                          (item.crimes / Math.max(...crimeData.map(d => d.crimes))) *
                          200
                        }px`
                      }}
                      transition={{
                        delay: index * 0.1 + 0.8,
                        duration: 0.8,
                        ease: 'easeOut'
                      }}
                    />
                    <span className="text-xs text-neuro-600 mt-2">{item.day}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-neuro-900 mb-4">
                Répartition par type de crime
              </h3>
              <div className="space-y-4">
                {crimeTypes.map((type, index) => (
                  <motion.div
                    key={type.name}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.9 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                      <span className="text-sm text-neuro-700">{type.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 h-2 bg-neuro-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${type.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${type.percentage}%` }}
                          transition={{
                            delay: index * 0.1 + 1.2,
                            duration: 1
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neuro-900 w-8">
                        {type.percentage}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Types d'incidents
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <div className="h-80">
              <TypeDoughnutChart />
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                  Incidents récents
                </h3>
                <div className="flex space-x-2">
                  <Button variant="neuro" size="sm" onClick={() => setShowIncidentFilters(true)}>
                    <i className="ri-filter-line mr-2"></i>
                    Filtrer
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setShowAllIncidents(true)}>
                    <i className="ri-eye-line mr-2"></i>
                    Voir tout
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                        Zone
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                        Heure
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                        Agent
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map(incident => (
                      <tr
                        key={incident.id}
                        className="border-t border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2 h-2 rounded-full ${getPriorityColor(
                                incident.priority
                              ).split(' ')[1]}`}
                            ></span>
                            <span className="text-neuro-900 dark:text-white font-medium">
                              {incident.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                          {incident.zone}
                        </td>
                        <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                          {incident.time}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              incident.status
                            )}`}
                          >
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                          {incident.agent}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            <Button variant="neuro" size="sm">
                              <i className="ri-eye-line"></i>
                            </Button>
                            <Button variant="neuro" size="sm">
                              <i className="ri-edit-line"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* CSV Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Statistiques d'import CSV
              </h3>
              <Button variant="primary" size="sm" onClick={() => window.location.href = '/csv-history'}>
                <i className="ri-history-line mr-2"></i>
                Voir l'historique
              </Button>
            </div>
            
            {csvStats.totalUploads > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {csvStats.totalUploads}
                    </p>
                    <p className="text-sm text-primary-700 dark:text-primary-300">Fichiers uploadés</p>
                  </div>
                  <div className="text-center p-3 bg-success-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                      {csvStats.totalRowsProcessed.toLocaleString()}
                    </p>
                    <p className="text-sm text-success-700 dark:text-success-300">Lignes traitées</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      csvStats.successRate >= 80 ? 'bg-success-500' :
                      csvStats.successRate >= 60 ? 'bg-warning-500' : 'bg-danger-500'
                    }`}></div>
                    <span className="text-sm font-medium text-neuro-700 dark:text-gray-300">
                      Taux de succès: {csvStats.successRate.toFixed(1)}%
                    </span>
                  </div>
                  {csvStats.lastUploadDate && (
                    <p className="text-xs text-neuro-500 dark:text-gray-400 mt-2">
                      Dernier import: {new Date(csvStats.lastUploadDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <i className="ri-file-csv-line text-4xl text-neuro-300 mb-2"></i>
                <p className="text-sm text-neuro-500 dark:text-gray-400">
                  Aucun fichier CSV importé pour le moment
                </p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => setShowCSVUploader(true)}
                  className="mt-3"
                >
                  <i className="ri-upload-2-line mr-2"></i>
                  Importer votre premier fichier
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Notifications récentes
              </h3>
              <Button variant="primary" size="sm" onClick={() => setShowAllNotifications(true)}>
                <i className="ri-notification-line mr-2"></i>
                Voir toutes les notifications
              </Button>
            </div>

            <div className="space-y-3">
              {csvStats.totalUploads > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
                  <i className="ri-file-csv-line text-success-600"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-success-900">
                      Dernier fichier CSV traité avec succès
                    </p>
                    <p className="text-xs text-success-700">
                      {csvStats.recentUploads[0] ? 
                        new Date(csvStats.recentUploads[0].upload_date).toLocaleString('fr-FR') :
                        'Récemment'
                      }
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <i className="ri-information-line text-blue-600"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Nouveau rapport d'analyse disponible
                  </p>
                  <p className="text-xs text-blue-700">Il y a 5 minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <i className="ri-check-circle-line text-green-600"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Incident résolu à Plateau</p>
                  <p className="text-xs text-green-700">Il y a 12 minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <i className="ri-alert-line text-yellow-600"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Alerte de sécurité activée</p>
                  <p className="text-xs text-yellow-700">Il y a 18 minutes</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showCSVUploader && (
            <SmartCSVUploader
              onClose={() => setShowCSVUploader(false)}
              onSuccess={async result => {
                console.log('Traitement CSV réussi:', result);
                setShowCSVUploader(false);
                
                // Actualiser immédiatement les données
                await handleRefresh();
                // Rafraîchir aussi les données CSV pour mettre à jour les graphiques
                try { (window as any).dispatchEvent(new Event('csv-data-updated')); } catch {}
                
                // Afficher le résultat avec bouton vers l'historique
                const viewHistory = confirm(
                  `✅ Succès!\n\n` +
                  `📊 ${result.processedRows} incidents ajoutés\n` +
                  `⚠️ ${result.errors.length} erreurs détectées\n` +
                  `📁 ${result.skippedRows} lignes ignorées\n\n` +
                  `Voulez-vous consulter l'historique détaillé ?`
                );
                
                if (viewHistory) {
                  window.location.href = '/csv-history';
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Alert Settings Modal */}
        <AnimatePresence>
          {showAlertSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neuro-900 dark:text-white">
                    Paramètres des alertes
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowAlertSettings(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neuro-700 dark:text-gray-300">Alertes critiques</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neuro-700 dark:text-gray-300">Notifications sonores</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neuro-700 dark:text-gray-300">Alertes par email</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button variant="primary" className="flex-1">
                    Sauvegarder
                  </Button>
                  <Button variant="neuro" onClick={() => setShowAlertSettings(false)}>
                    Annuler
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Notifications Modal */}
        <AnimatePresence>
          {showAllNotifications && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Toutes les notifications
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowAllNotifications(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <i className="ri-notification-line text-blue-600"></i>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Notification {i + 1}
                        </p>
                        <p className="text-xs text-gray-600">
                          Il y a {i * 5 + 5} minutes
                        </p>
                      </div>
                      <Button variant="neuro" size="sm">
                        <i className="ri-eye-line"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Incidents Modal */}
        <AnimatePresence>
          {showAllIncidents && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Tous les incidents
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowAllIncidents(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">ID</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Zone</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Statut</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 15 }, (_, i) => (
                        <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">#{1000 + i}</td>
                          <td className="px-4 py-3 text-gray-900">Vol à main armée</td>
                          <td className="px-4 py-3 text-gray-700">Sandaga</td>
                          <td className="px-4 py-3 text-gray-700">2024-01-{15 + i}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-600">
                              Résolu
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-1">
                              <Button variant="neuro" size="sm">
                                <i className="ri-eye-line"></i>
                              </Button>
                              <Button variant="neuro" size="sm">
                                <i className="ri-edit-line"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart Control Panel */}
        <ChartControlPanel 
          isOpen={showChartControlPanel} 
          onClose={() => setShowChartControlPanel(false)} 
        />
      </div>
    </Layout>
  );
}
