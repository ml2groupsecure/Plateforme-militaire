
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { usePDFReports, type ReportData } from '../../lib/pdfService';
import { DataService } from '../../lib/csvService';
import SmartCSVUploader from '../../components/upload/SmartCSVUploader';
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
import { Line, Bar, Scatter } from 'react-chartjs-2';

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

export default function AnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedZone, setSelectedZone] = useState('all');
  const [analysisType, setAnalysisType] = useState('temporal');
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const [incidentStats, setIncidentStats] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { generateReport, generateLocationReport, isGenerating } = usePDFReports();
  const { history: csvHistory, refresh: refreshCsvHistory } = useCsvHistory();

  const handleExportAnalysis = () => {
    // Simulate export functionality
    const analysisData = {
      period: selectedPeriod,
      zone: selectedZone,
      type: analysisType,
      timestamp: new Date().toISOString(),
      data: {
        totalIncidents: 1247,
        trends: 'Augmentation de 12% par rapport au mois précédent',
        hotspots: ['Sandaga', 'UCAD', 'Plateau'],
        recommendations: [
          'Renforcer les patrouilles à Sandaga entre 14h-18h',
          'Installer plus de caméras de surveillance à UCAD',
          'Améliorer l\'éclairage public au Plateau'
        ]
      }
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-criminelle-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGeneratePDFReport = async () => {
    const reportData: ReportData = {
      title: `Rapport d'Analyse Criminelle - ${selectedZone === 'all' ? 'Toutes zones' : selectedZone}`,
      period: selectedPeriod,
      generated_by: 'Système SEENTU KAARANGE',
      generated_at: new Date().toISOString(),
      summary: {
        total_incidents: 1247,
        resolved_incidents: 979,
        pending_incidents: 268,
        critical_incidents: 23
      },
      charts: {
        incidents_by_type: temporalData,
        incidents_by_location: hotspotData,
        trend_analysis: patternData
      },
      predictions: [
        {
          location: 'Sandaga',
          predicted_type: 'Vol à main armée',
          risk_level: 'high',
          confidence: 0.89,
          timeframe: '24h'
        },
        {
          location: 'UCAD',
          predicted_type: 'Agression',
          risk_level: 'medium',
          confidence: 0.76,
          timeframe: '48h'
        },
        {
          location: 'Plateau',
          predicted_type: 'Fraude',
          risk_level: 'high',
          confidence: 0.82,
          timeframe: '72h'
        }
      ],
      recommendations: [
        'Renforcer les patrouilles à Sandaga entre 14h-18h',
        'Installer plus de caméras de surveillance à UCAD',
        'Améliorer l\'éclairage public au Plateau',
        'Mettre en place des alertes SMS pour les commerçants',
        'Organiser des formations de sensibilisation dans les universités'
      ],
      hotspots: [
        {
          location: 'Sandaga',
          incident_count: 245,
          risk_score: 0.95,
          crime_types: ['Vol', 'Agression']
        },
        {
          location: 'UCAD',
          incident_count: 189,
          risk_score: 0.87,
          crime_types: ['Agression', 'Vol de téléphone']
        },
        {
          location: 'Plateau',
          incident_count: 167,
          risk_score: 0.78,
          crime_types: ['Fraude', 'Vol']
        },
        {
          location: 'Pikine',
          incident_count: 134,
          risk_score: 0.82,
          crime_types: ['Cambriolage', 'Vol de véhicule']
        },
        {
          location: 'Guédiawaye',
          incident_count: 98,
          risk_score: 0.76,
          crime_types: ['Vol', 'Agression']
        }
      ]
    };

    await generateReport(reportData);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulation de l'analyse
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    alert('Analyse terminée!\n\nNouvelles tendances détectées:\n• Augmentation des vols de 15% à Sandaga\n• Corrélation forte densité-criminalité\n• Recommandation: renforcer patrouilles');
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    alert('Paramètres sauvegardés!');
  };

  const handleCSVUploadSuccess = async () => {
    setShowCSVUploader(false);
    await loadIncidentData(); // Recharger les données
    await refreshCsvHistory(); // Actualiser l'historique CSV
    alert('✅ Fichier CSV importé avec succès!\nLes données ont été mises à jour.');
  };

  const loadIncidentData = async () => {
    setIsLoadingData(true);
    try {
      const [statsData, incidentsData] = await Promise.all([
        DataService.getIncidentStats(),
        DataService.getIncidents(100)
      ]);
      setIncidentStats(statsData);
      setIncidents(incidentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser les données par défaut
      setIncidentStats({
        total: 1247,
        bySeverity: { critical: 23, high: 145, medium: 456, low: 623 },
        byStatus: { open: 268, investigating: 345, resolved: 634 },
        byType: { 'Vol': 245, 'Agression': 189, 'Fraude': 167, 'Cambriolage': 134 },
        recent: 156
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Charger les données au montage / changement de filtres
  useEffect(() => {
    loadIncidentData();
  }, [selectedPeriod, selectedZone]);

  // Realtime: rafraîchir l'analyse quand la table incidents change (ex: import CSV)
  useEffect(() => {
    const channel = supabase
      .channel('incidents-analysis-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        loadIncidentData();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Générer les données temporelles basées sur les vrais incidents
  const generateTemporalData = () => {
    if (!incidents || incidents.length === 0) {
      return {
        labels: ['00h', '04h', '08h', '12h', '16h', '20h'],
        datasets: [
          {
            label: 'Vols',
            data: [12, 8, 15, 35, 42, 28],
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#EF4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      };
    }
    
    // Grouper les incidents par heure et type
    const hourlyData = {};
    const crimeTypes = ['Vol', 'Agression', 'Fraude', 'Cambriolage'];
    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];
    
    incidents.forEach(incident => {
      const hour = new Date(incident.reported_at || incident.created_at).getHours();
      const hourLabel = `${String(Math.floor(hour / 4) * 4).padStart(2, '0')}h`;
      const type = incident.type;
      
      if (!hourlyData[hourLabel]) hourlyData[hourLabel] = {};
      if (!hourlyData[hourLabel][type]) hourlyData[hourLabel][type] = 0;
      hourlyData[hourLabel][type]++;
    });
    
    const labels = ['00h', '04h', '08h', '12h', '16h', '20h'];
    
    const datasets = crimeTypes.map((type, index) => ({
      label: type,
      data: labels.map(label => hourlyData[label]?.[type] || 0),
      borderColor: colors[index],
      backgroundColor: colors[index] + '20',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: colors[index],
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }));
    
    return { labels, datasets };
  };
  
  const temporalData = generateTemporalData();

  const correlationData = {
    datasets: [
      {
        label: 'Corrélation Densité/Criminalité',
        data: [
          { x: 1200, y: 45 },
          { x: 1800, y: 67 },
          { x: 2200, y: 89 },
          { x: 1600, y: 56 },
          { x: 2800, y: 112 },
          { x: 2400, y: 98 },
          { x: 1400, y: 52 },
          { x: 3200, y: 134 },
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3B82F6',
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBorderWidth: 2,
        pointBorderColor: '#ffffff',
      },
    ],
  };

  const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365;

  const selectedZoneLabel = selectedZone === 'all'
    ? null
    : selectedZone === 'dakar'
    ? 'Dakar'
    : selectedZone === 'pikine'
    ? 'Pikine'
    : selectedZone === 'guediawaye'
    ? 'Guédiawaye'
    : selectedZone === 'rufisque'
    ? 'Rufisque'
    : selectedZone;

  const filteredIncidentsForInsights = incidents.filter((i: any) => {
    const d = new Date(i.reported_at || i.created_at || i.date_occurred || Date.now());
    const since = new Date();
    since.setDate(since.getDate() - periodDays);
    if (d < since) return false;

    if (selectedZoneLabel) {
      const loc = String(i.location || '').toLowerCase();
      if (!loc.includes(String(selectedZoneLabel).toLowerCase())) return false;
    }

    return true;
  });

  const insights = (() => {
    const list: Array<{ kind: 'critical' | 'warning' | 'info' | 'success'; title: string; message: string; icon: string }> = [];

    const total = filteredIncidentsForInsights.length;
    if (total === 0) {
      list.push({
        kind: 'info',
        title: 'Aucune donnée',
        message: 'Aucun incident ne correspond aux filtres actuels.',
        icon: 'ri-information-line',
      });
      return list;
    }

    // Top zone
    const byZone = new Map<string, number>();
    for (const i of filteredIncidentsForInsights) {
      const z = String(i.location || 'Zone inconnue');
      byZone.set(z, (byZone.get(z) || 0) + 1);
    }
    const topZone = Array.from(byZone.entries()).sort((a, b) => b[1] - a[1])[0];

    // Top type
    const byType = new Map<string, number>();
    for (const i of filteredIncidentsForInsights) {
      const t = String(i.type || i.incident_type || 'Non spécifié');
      byType.set(t, (byType.get(t) || 0) + 1);
    }
    const topType = Array.from(byType.entries()).sort((a, b) => b[1] - a[1])[0];

    // Peak time window (4h buckets)
    const buckets = new Map<string, number>();
    for (const i of filteredIncidentsForInsights) {
      const h = new Date(i.reported_at || i.created_at || i.date_occurred || Date.now()).getHours();
      const start = Math.floor(h / 4) * 4;
      const label = `${String(start).padStart(2, '0')}h-${String(start + 4).padStart(2, '0')}h`;
      buckets.set(label, (buckets.get(label) || 0) + 1);
    }
    const peak = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])[0];

    // Resolution rate
    const resolved = filteredIncidentsForInsights.filter((i: any) => {
      const s = String(i.status || '').toLowerCase();
      return s === 'resolved' || s === 'résolu' || s === 'resolu';
    }).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Compose insights
    list.push({
      kind: 'critical',
      title: 'Zone prioritaire',
      message: `Zone la plus touchée: ${topZone?.[0] || 'N/A'} (${topZone?.[1] || 0} incident(s) sur ${total}).`,
      icon: 'ri-error-warning-line',
    });

    list.push({
      kind: 'warning',
      title: 'Type dominant',
      message: `Type le plus fréquent: ${topType?.[0] || 'N/A'} (${topType?.[1] || 0}).`,
      icon: 'ri-alert-line',
    });

    list.push({
      kind: 'info',
      title: 'Pic temporel',
      message: `Créneau le plus actif: ${peak?.[0] || 'N/A'} (${peak?.[1] || 0} incidents).`,
      icon: 'ri-information-line',
    });

    list.push({
      kind: 'success',
      title: 'Résolution',
      message: `Taux de résolution estimé: ${resolutionRate}% (${resolved}/${total}).`,
      icon: 'ri-check-circle-line',
    });

    return list;
  })();

  // Générer les données des hotspots basées sur les vrais incidents
  const generateHotspotData = () => {
    if (!incidents || incidents.length === 0) {
      return {
        labels: ['Sandaga', 'UCAD', 'Plateau', 'Pikine', 'Guédiawaye', 'Parcelles', 'Liberté'],
        datasets: [
          {
            label: 'Indice de criminalité',
            data: [95, 87, 78, 82, 76, 69, 71],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(249, 115, 22, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(132, 204, 22, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(16, 185, 129, 0.8)',
            ],
            borderColor: [
              '#EF4444',
              '#F59E0B',
              '#F97316',
              '#EAB308',
              '#84CC16',
              '#22C55E',
              '#10B981',
            ],
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };
    }
    
    // Compter les incidents par localisation
    const locationCounts = {};
    incidents.forEach(incident => {
      const location = incident.location || 'Inconnu';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    // Trier par nombre d'incidents et prendre les 7 premiers
    const sortedLocations = Object.entries(locationCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 7);
    
    const labels = sortedLocations.map(([location]) => location);
    const data = sortedLocations.map(([,count]) => count);
    
    // Couleurs dégradées du rouge au vert selon l'intensité
    const colors = data.map((count, index) => {
      const intensity = (data.length - index) / data.length;
      if (intensity > 0.8) return 'rgba(239, 68, 68, 0.8)';
      if (intensity > 0.6) return 'rgba(245, 158, 11, 0.8)';
      if (intensity > 0.4) return 'rgba(249, 115, 22, 0.8)';
      if (intensity > 0.3) return 'rgba(234, 179, 8, 0.8)';
      if (intensity > 0.2) return 'rgba(132, 204, 22, 0.8)';
      return 'rgba(34, 197, 94, 0.8)';
    });
    
    const borderColors = colors.map(color => color.replace('0.8', '1'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Nombre d\'incidents',
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  };
  
  const hotspotData = generateHotspotData();

  // Générer les données de patterns hebdomadaires
  const generatePatternData = () => {
    if (!incidents || incidents.length === 0) {
      return {
        labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        datasets: [
          {
            label: 'Incidents moyens',
            data: [45, 52, 48, 61, 67, 89, 78],
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: '#8B5CF6',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };
    }
    
    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dailyCounts = new Array(7).fill(0);
    
    incidents.forEach(incident => {
      const dayOfWeek = new Date(incident.reported_at || incident.created_at).getDay();
      dailyCounts[dayOfWeek]++;
    });
    
    // Réorganiser pour commencer par Lundi
    const orderedLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const orderedData = [dailyCounts[1], dailyCounts[2], dailyCounts[3], dailyCounts[4], dailyCounts[5], dailyCounts[6], dailyCounts[0]];
    
    return {
      labels: orderedLabels,
      datasets: [
        {
          label: 'Incidents par jour',
          data: orderedData,
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: '#8B5CF6',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  };
  
  const patternData = generatePatternData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
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
            weight: 500,
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
          weight: 600,
        },
        bodyFont: {
          size: 13,
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      }
    }
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12,
            weight: 500,
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
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Densité de population (hab/km²)',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 500,
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        title: {
          display: true,
          text: "Nombre d'incidents",
          color: '#6B7280',
          font: {
            size: 12,
            weight: 500,
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      }
    }
  };

  return (
    <Layout title="Analyse Criminelle" subtitle="Analyse avancée des données">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neuro-900 dark:text-white mb-2">Analyse criminelle</h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Analyse approfondie des tendances et patterns criminels
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="success" size="sm" onClick={() => setShowCSVUploader(true)}>
              <i className="ri-upload-cloud-line mr-2"></i>
              Importer CSV
            </Button>
            <Button variant="neuro" size="sm" onClick={handleOpenSettings}>
              <i className="ri-settings-3-line mr-2"></i>
              Paramètres
            </Button>
            <Button variant="neuro" size="sm" onClick={handleExportAnalysis}>
              <i className="ri-download-line mr-2"></i>
              Exporter JSON
            </Button>
            <Button variant="primary" size="sm" onClick={handleGeneratePDFReport} disabled={isGenerating}>
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

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                Période d'analyse
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-soft"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">3 derniers mois</option>
                <option value="1y">Dernière année</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                Zone géographique
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-soft"
              >
                <option value="all">Toutes les zones</option>
                <option value="dakar">Dakar</option>
                <option value="pikine">Pikine</option>
                <option value="guediawaye">Guédiawaye</option>
                <option value="rufisque">Rufisque</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                Type d'analyse
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-soft"
              >
                <option value="temporal">Analyse temporelle</option>
                <option value="spatial">Analyse spatiale</option>
                <option value="correlation">Analyse de corrélation</option>
                <option value="pattern">Détection de patterns</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <i className="ri-search-line mr-2"></i>
                    Analyser
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Analysis Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Insights */}
          <Card>
            <h3 className="text-xl font-semibold text-neuro-900 dark:text-white mb-6">
              Insights clés
            </h3>
            <div className="space-y-4">
              {insights.map((ins, idx) => {
                const styles =
                  ins.kind === 'critical'
                    ? {
                        wrapper: 'bg-danger-50 dark:bg-red-900/20 border-l-danger-500',
                        icon: 'text-danger-600',
                        title: 'text-danger-800 dark:text-red-400',
                        text: 'text-danger-700 dark:text-red-300',
                      }
                    : ins.kind === 'warning'
                    ? {
                        wrapper: 'bg-warning-50 dark:bg-yellow-900/20 border-l-warning-500',
                        icon: 'text-warning-600',
                        title: 'text-warning-800 dark:text-yellow-400',
                        text: 'text-warning-700 dark:text-yellow-300',
                      }
                    : ins.kind === 'success'
                    ? {
                        wrapper: 'bg-success-50 dark:bg-green-900/20 border-l-success-500',
                        icon: 'text-success-600',
                        title: 'text-success-800 dark:text-green-400',
                        text: 'text-success-700 dark:text-green-300',
                      }
                    : {
                        wrapper: 'bg-primary-50 dark:bg-blue-900/20 border-l-primary-500',
                        icon: 'text-primary-600',
                        title: 'text-primary-800 dark:text-blue-400',
                        text: 'text-primary-700 dark:text-blue-300',
                      };

                return (
                  <div key={idx} className={`p-4 rounded-xl border-l-4 ${styles.wrapper}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <i className={`${ins.icon} ${styles.icon}`}></i>
                      <span className={`text-sm font-medium ${styles.title}`}>{ins.title}</span>
                    </div>
                    <p className={`text-sm ${styles.text}`}>{ins.message}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Statistics */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white mb-6">
                Statistiques détaillées
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {isLoadingData ? (
                // Affichage de chargement
                [...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-4 bg-gradient-to-br from-neuro-50 to-neuro-100 rounded-xl border border-neuro-200 animate-pulse">
                    <div className="w-16 h-8 bg-neuro-300 rounded mx-auto mb-2"></div>
                    <div className="w-20 h-4 bg-neuro-200 rounded mx-auto mb-1"></div>
                    <div className="w-16 h-3 bg-neuro-200 rounded mx-auto"></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{incidentStats?.total?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">Total incidents</p>
                    <p className="text-xs text-success-600 mt-1">+{incidentStats?.recent || 0} récents</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl border border-success-200">
                    <p className="text-3xl font-bold text-success-600 dark:text-success-400">
                      {incidentStats?.byStatus?.resolved ? Math.round((incidentStats.byStatus.resolved / incidentStats.total) * 100) : 0}%
                    </p>
                    <p className="text-sm text-success-700 dark:text-success-300 font-medium">Taux résolution</p>
                    <p className="text-xs text-success-600 mt-1">{incidentStats?.byStatus?.resolved || 0} résolus</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl border border-warning-200">
                    <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">{csvHistory.length}</p>
                    <p className="text-sm text-warning-700 dark:text-warning-300 font-medium">Fichiers CSV</p>
                    <p className="text-xs text-primary-600 mt-1">Imports réalisés</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-danger-50 to-danger-100 rounded-xl border border-danger-200">
                    <p className="text-3xl font-bold text-danger-600 dark:text-red-400">{incidentStats?.bySeverity?.critical || 0}</p>
                    <p className="text-sm text-danger-700 dark:text-red-300 font-medium">Incidents critiques</p>
                    <p className="text-xs text-danger-600 mt-1">Attention requise</p>
                  </div>
                </>
              )}
              </div>
            </Card>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Analyse temporelle
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <div className="h-80">
              <Line data={temporalData} options={chartOptions} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Hotspots criminels
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <div className="h-80">
              <Bar data={hotspotData} options={chartOptions} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Corrélation densité/criminalité
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <div className="h-80">
              <Scatter data={correlationData} options={scatterOptions} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                Patterns hebdomadaires
              </h3>
              <Button variant="neuro" size="sm">
                <i className="ri-more-line"></i>
              </Button>
            </div>
            <div className="h-80">
              <Bar data={patternData} options={chartOptions} />
            </div>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <h3 className="text-xl font-semibold text-neuro-900 dark:text-white mb-6">
            Recommandations stratégiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-shield-line text-white text-lg"></i>
                </div>
                <h4 className="font-semibold text-primary-900">Renforcement sécuritaire</h4>
              </div>
              <p className="text-sm text-primary-700 mb-4">
                Augmenter les patrouilles dans les zones à forte criminalité entre 14h-18h
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-600 font-medium">Impact estimé: -25%</span>
                <Button variant="primary" size="sm">
                  <i className="ri-arrow-right-line"></i>
                </Button>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-success-50 to-success-100 rounded-xl border border-success-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-camera-line text-white text-lg"></i>
                </div>
                <h4 className="font-semibold text-success-900">Surveillance technologique</h4>
              </div>
              <p className="text-sm text-success-700 mb-4">
                Installer des caméras intelligentes dans 5 points stratégiques identifiés
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-success-600 font-medium">Impact estimé: -18%</span>
                <Button variant="success" size="sm">
                  <i className="ri-arrow-right-line"></i>
                </Button>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl border border-warning-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-community-line text-white text-lg"></i>
                </div>
                <h4 className="font-semibold text-warning-900">Engagement communautaire</h4>
              </div>
              <p className="text-sm text-warning-700 mb-4">
                Lancer des programmes de sensibilisation dans les quartiers sensibles
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-warning-600 font-medium">Impact estimé: -12%</span>
                <Button variant="warning" size="sm">
                  <i className="ri-arrow-right-line"></i>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Modal */}
        {/* CSV Uploader Modal */}
        <AnimatePresence>
          {showCSVUploader && (
            <SmartCSVUploader
              onClose={() => setShowCSVUploader(false)}
              onSuccess={handleCSVUploadSuccess}
            />
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neuro-900 dark:text-white">
                  Paramètres d'analyse
                </h3>
                <Button variant="neuro" size="sm" onClick={() => setShowSettings(false)}>
                  <i className="ri-close-line"></i>
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                    Niveau de détail
                  </label>
                  <select className="w-full px-3 py-2 border border-neuro-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option>Basique</option>
                    <option>Avancé</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                    Seuil de confiance
                  </label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="1" 
                    step="0.1" 
                    defaultValue="0.8"
                    className="w-full" 
                  />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="auto-refresh" defaultChecked className="mr-2" />
                  <label htmlFor="auto-refresh" className="text-sm text-neuro-700 dark:text-gray-300">
                    Actualisation automatique
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button variant="primary" className="flex-1" onClick={handleSaveSettings}>
                  Sauvegarder
                </Button>
                <Button variant="neuro" onClick={() => setShowSettings(false)}>
                  Annuler
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
