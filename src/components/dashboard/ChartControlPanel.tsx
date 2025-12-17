import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../base/Card';
import Button from '../base/Button';
import { DynamicChart, ChartCustomizer } from '../charts/InteractiveCharts';
import type { ChartConfig } from '../charts/InteractiveCharts';
import { useCsvData } from '../../context/CsvDataContext';

interface ChartControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChartControlPanel: React.FC<ChartControlPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'charts' | 'filters' | 'export'>('charts');
  const [customCharts, setCustomCharts] = useState<ChartConfig[]>([
    {
      chartType: 'line',
      dataType: 'timeline',
      title: 'Évolution temporelle',
      showLegend: true,
      animationEnabled: true
    },
    {
      chartType: 'bar',
      dataType: 'location',
      title: 'Répartition par zone',
      showLegend: false,
      animationEnabled: true
    },
    {
      chartType: 'doughnut',
      dataType: 'type',
      title: 'Types d\'incidents',
      showLegend: true,
      animationEnabled: true
    }
  ]);
  
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  
  const { csvData, getIncidentsByType, getIncidentsByLocation, getIncidentsByStatus } = useCsvData();
  
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    locations: [] as string[],
    incidentTypes: [] as string[],
    statuses: [] as string[]
  });

  const availableLocations = React.useMemo(() => {
    const locations = new Set(csvData.map(row => row.location).filter(Boolean));
    return Array.from(locations);
  }, [csvData]);

  const availableTypes = React.useMemo(() => {
    return getIncidentsByType().map(item => item.label);
  }, [getIncidentsByType]);

  const availableStatuses = React.useMemo(() => {
    return getIncidentsByStatus().map(item => item.label);
  }, [getIncidentsByStatus]);

  const handleAddChart = () => {
    const newChart: ChartConfig = {
      chartType: 'bar',
      dataType: 'timeline',
      title: `Graphique ${customCharts.length + 1}`,
      showLegend: true,
      animationEnabled: true
    };
    setEditingChart(newChart);
    setShowCustomizer(true);
  };

  const handleEditChart = (index: number) => {
    setEditingChart(customCharts[index]);
    setShowCustomizer(true);
  };

  const handleSaveChart = (config: ChartConfig) => {
    if (editingChart) {
      const existingIndex = customCharts.findIndex(chart => chart === editingChart);
      if (existingIndex >= 0) {
        const newCharts = [...customCharts];
        newCharts[existingIndex] = config;
        setCustomCharts(newCharts);
      } else {
        setCustomCharts([...customCharts, config]);
      }
    }
    setEditingChart(null);
  };

  const handleDeleteChart = (index: number) => {
    setCustomCharts(customCharts.filter((_, i) => i !== index));
  };

  const handleExportData = () => {
    const csvContent = csvData.map(row => Object.values(row).join(',')).join('\n');
    const headers = Object.keys(csvData[0] || {}).join(',');
    const fullContent = headers + '\n' + csvContent;
    
    const blob = new Blob([fullContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-neuro-900 dark:text-white">
              Panneau de contrôle des graphiques
            </h2>
            <Button variant="neuro" size="sm" onClick={onClose}>
              <i className="ri-close-line"></i>
            </Button>
          </div>

          <div className="flex h-full max-h-[80vh]">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('charts')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'charts'
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-neuro-600 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-bar-chart-line mr-3"></i>
                  Graphiques
                </button>
                <button
                  onClick={() => setActiveTab('filters')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'filters'
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-neuro-600 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-filter-line mr-3"></i>
                  Filtres
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'export'
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-neuro-600 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-download-line mr-3"></i>
                  Export
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'charts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neuro-900">
                      Graphiques personnalisés
                    </h3>
                    <Button variant="primary" onClick={handleAddChart}>
                      <i className="ri-add-line mr-2"></i>
                      Ajouter un graphique
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {customCharts.map((chart, index) => (
                      <div key={index} className="relative">
                        <div className="absolute top-4 right-4 z-10 flex space-x-2">
                          <Button
                            variant="neuro"
                            size="sm"
                            onClick={() => handleEditChart(index)}
                          >
                            <i className="ri-edit-line"></i>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteChart(index)}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </Button>
                        </div>
                        <DynamicChart
                          chartType={chart.chartType}
                          dataType={chart.dataType}
                          title={chart.title}
                          className="h-64"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'filters' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-neuro-900">
                    Filtres de données
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">
                        Plage de dates
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) => setFilters({
                            ...filters,
                            dateRange: { ...filters.dateRange, start: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) => setFilters({
                            ...filters,
                            dateRange: { ...filters.dateRange, end: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">
                        Zones
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {availableLocations.map(location => (
                          <label key={location} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              checked={filters.locations.includes(location)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters({
                                    ...filters,
                                    locations: [...filters.locations, location]
                                  });
                                } else {
                                  setFilters({
                                    ...filters,
                                    locations: filters.locations.filter(l => l !== location)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-neuro-700">{location}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">
                        Types d'incidents
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {availableTypes.map(type => (
                          <label key={type} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              checked={filters.incidentTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters({
                                    ...filters,
                                    incidentTypes: [...filters.incidentTypes, type]
                                  });
                                } else {
                                  setFilters({
                                    ...filters,
                                    incidentTypes: filters.incidentTypes.filter(t => t !== type)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-neuro-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neuro-700 mb-2">
                        Statuts
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {availableStatuses.map(status => (
                          <label key={status} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              checked={filters.statuses.includes(status)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters({
                                    ...filters,
                                    statuses: [...filters.statuses, status]
                                  });
                                } else {
                                  setFilters({
                                    ...filters,
                                    statuses: filters.statuses.filter(s => s !== status)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-neuro-700">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="primary">
                      Appliquer les filtres
                    </Button>
                    <Button variant="neuro" onClick={() => setFilters({
                      dateRange: { start: '', end: '' },
                      locations: [],
                      incidentTypes: [],
                      statuses: []
                    })}>
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'export' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-neuro-900">
                    Exporter les données
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <h4 className="font-medium text-neuro-900 mb-4">
                        Données CSV
                      </h4>
                      <p className="text-sm text-neuro-600 mb-4">
                        Exportez tous les incidents en format CSV
                      </p>
                      <div className="text-sm text-neuro-500 mb-4">
                        <p>{csvData.length} incidents disponibles</p>
                      </div>
                      <Button variant="primary" onClick={handleExportData}>
                        <i className="ri-file-csv-line mr-2"></i>
                        Télécharger CSV
                      </Button>
                    </Card>

                    <Card>
                      <h4 className="font-medium text-neuro-900 mb-4">
                        Rapport PDF
                      </h4>
                      <p className="text-sm text-neuro-600 mb-4">
                        Générez un rapport PDF avec graphiques
                      </p>
                      <div className="space-y-2 mb-4">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-neuro-700">Inclure les graphiques</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-neuro-700">Inclure les tableaux</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm text-neuro-700">Données détaillées</span>
                        </label>
                      </div>
                      <Button variant="success">
                        <i className="ri-file-pdf-line mr-2"></i>
                        Générer PDF
                      </Button>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showCustomizer && editingChart && (
            <ChartCustomizer
              isOpen={showCustomizer}
              onClose={() => {
                setShowCustomizer(false);
                setEditingChart(null);
              }}
              onApply={handleSaveChart}
              currentConfig={editingChart}
            />
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChartControlPanel;