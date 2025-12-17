import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import Card from '../base/Card';
import Button from '../base/Button';
import { useCsvData } from '../../context/CsvDataContext';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, onRefresh, isLoading, className = "" }) => (
  <Card className={`relative ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
        {title}
      </h3>
      <div className="flex items-center space-x-2">
        {onRefresh && (
          <Button 
            variant="neuro" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <i className={`ri-refresh-line ${isLoading ? 'animate-spin' : ''}`}></i>
          </Button>
        )}
        <Button variant="neuro" size="sm">
          <i className="ri-more-line"></i>
        </Button>
      </div>
    </div>
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )}
    <div className="h-80">
      {children}
    </div>
  </Card>
);

export const TimeSeriesChart: React.FC = () => {
  const { getTimeSeriesData, refreshData, isLoading } = useCsvData();
  const [period, setPeriod] = useState(7);
  
  const chartData = useMemo(() => getTimeSeriesData(period), [getTimeSeriesData, period]);

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
          font: { size: 12, weight: 500 }
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
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: { size: 12 }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <ChartCard 
      title="Tendance des incidents" 
      onRefresh={refreshData}
      isLoading={isLoading}
    >
      <div className="mb-4">
        <select
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
          className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={7}>7 derniers jours</option>
          <option value={14}>14 derniers jours</option>
          <option value={30}>30 derniers jours</option>
        </select>
      </div>
      <Line data={chartData} options={chartOptions} />
    </ChartCard>
  );
};

export const LocationBarChart: React.FC = () => {
  const { getLocationBarData, refreshData, isLoading } = useCsvData();
  
  const chartData = useMemo(() => getLocationBarData(), [getLocationBarData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: { size: 12 }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <ChartCard 
      title="Incidents par zone" 
      onRefresh={refreshData}
      isLoading={isLoading}
    >
      <Bar data={chartData} options={chartOptions} />
    </ChartCard>
  );
};

export const TypeDoughnutChart: React.FC = () => {
  const { getTypeDoughnutData, refreshData, isLoading } = useCsvData();
  
  const chartData = useMemo(() => getTypeDoughnutData(), [getTypeDoughnutData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: { size: 12, weight: 500 }
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

  return (
    <ChartCard 
      title="Types d'incidents" 
      onRefresh={refreshData}
      isLoading={isLoading}
    >
      <Doughnut data={chartData} options={chartOptions} />
    </ChartCard>
  );
};

interface DynamicChartProps {
  chartType: 'line' | 'bar' | 'doughnut' | 'pie';
  dataType: 'timeline' | 'location' | 'type' | 'status';
  title?: string;
  className?: string;
}

export const DynamicChart: React.FC<DynamicChartProps> = ({ 
  chartType, 
  dataType, 
  title, 
  className 
}) => {
  const { 
    getTimeSeriesData, 
    getLocationBarData, 
    getTypeDoughnutData, 
    getIncidentsByStatus,
    refreshData,
    isLoading 
  } = useCsvData();

  const [period, setPeriod] = useState(7);

  const chartData = useMemo(() => {
    switch (dataType) {
      case 'timeline':
        return getTimeSeriesData(period);
      case 'location':
        return getLocationBarData();
      case 'type':
        return getTypeDoughnutData();
      case 'status': {
        const statusData = getIncidentsByStatus();
        return {
          labels: statusData.map(item => item.label),
          datasets: [{
            data: statusData.map(item => item.value),
            backgroundColor: statusData.map(item => item.color || '#3B82F6'),
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        };
      }
      default:
        return { labels: [], datasets: [] };
    }
  }, [dataType, period, getTimeSeriesData, getLocationBarData, getTypeDoughnutData, getIncidentsByStatus]);

  const renderChart = () => {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: chartType === 'doughnut' || chartType === 'pie' ? 'right' as const : 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            color: '#374151',
            font: { size: 12, weight: 500 }
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
      }
    };

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={commonOptions} />;
      case 'bar':
        return <Bar data={chartData} options={commonOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={{ ...commonOptions, cutout: '60%' }} />;
      case 'pie':
        return <Pie data={chartData} options={commonOptions} />;
      default:
        return <div>Type de graphique non supporté</div>;
    }
  };

  const defaultTitle = `${chartType} - ${dataType}`;

  return (
    <ChartCard 
      title={title || defaultTitle}
      onRefresh={refreshData}
      isLoading={isLoading}
      className={className}
    >
      {dataType === 'timeline' && (
        <div className="mb-4">
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={7}>7 derniers jours</option>
            <option value={14}>14 derniers jours</option>
            <option value={30}>30 derniers jours</option>
          </select>
        </div>
      )}
      {renderChart()}
    </ChartCard>
  );
};

interface ChartCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (config: ChartConfig) => void;
  currentConfig: ChartConfig;
}

export interface ChartConfig {
  chartType: 'line' | 'bar' | 'doughnut' | 'pie';
  dataType: 'timeline' | 'location' | 'type' | 'status';
  title: string;
  showLegend: boolean;
  animationEnabled: boolean;
}

export const ChartCustomizer: React.FC<ChartCustomizerProps> = ({ 
  isOpen, 
  onClose, 
  onApply, 
  currentConfig 
}) => {
  const [config, setConfig] = useState<ChartConfig>(currentConfig);

  const handleApply = () => {
    onApply(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <Card className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neuro-900 dark:text-white">
              Personnaliser le graphique
            </h3>
            <Button variant="neuro" size="sm" onClick={onClose}>
              <i className="ri-close-line"></i>
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                Titre
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                Type de graphique
              </label>
              <select
                value={config.chartType}
                onChange={(e) => setConfig({ ...config, chartType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="line">Ligne</option>
                <option value="bar">Barres</option>
                <option value="doughnut">Donut</option>
                <option value="pie">Secteurs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                Type de données
              </label>
              <select
                value={config.dataType}
                onChange={(e) => setConfig({ ...config, dataType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="timeline">Évolution temporelle</option>
                <option value="location">Par zone</option>
                <option value="type">Par type</option>
                <option value="status">Par statut</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neuro-700 dark:text-gray-300">
                Afficher la légende
              </span>
              <input
                type="checkbox"
                checked={config.showLegend}
                onChange={(e) => setConfig({ ...config, showLegend: e.target.checked })}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neuro-700 dark:text-gray-300">
                Animations activées
              </span>
              <input
                type="checkbox"
                checked={config.animationEnabled}
                onChange={(e) => setConfig({ ...config, animationEnabled: e.target.checked })}
                className="rounded"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button variant="primary" className="flex-1" onClick={handleApply}>
              Appliquer
            </Button>
            <Button variant="neuro" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};