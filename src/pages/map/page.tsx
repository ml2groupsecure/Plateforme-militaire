
import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { DataService } from '../../lib/csvService';
import SmartCSVUploader from '../../components/upload/SmartCSVUploader';

import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';

interface Incident {
  id: string;
  type: string;
  location: { lat: number; lng: number };
  zone: string;
  status: 'active' | 'resolved' | 'investigating';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  assignedAgent?: string;
}

type MapView = 'light' | 'street' | 'satellite';

export default function MapPage() {
  const mapRef = useRef<LeafletMap | null>(null);

  const [showAllIncidents, setShowAllIncidents] = useState(false);
  const [showMapSettings, setShowMapSettings] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [mapView, setMapView] = useState<MapView>('light');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPatrols, setShowPatrols] = useState(true);
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const [realIncidents, setRealIncidents] = useState<any[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);

  const [incidents] = useState<Incident[]>([
    {
      id: '1',
      type: 'Vol à main armée',
      location: { lat: 14.6937, lng: -17.4441 }, // Sandaga
      zone: 'Sandaga',
      status: 'active',
      severity: 'critical',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      description: 'Vol à main armée signalé au marché Sandaga',
      assignedAgent: 'Agent Diop'
    },
    {
      id: '2',
      type: 'Agression',
      location: { lat: 14.6848, lng: -17.4536 }, // UCAD
      zone: 'UCAD',
      status: 'investigating',
      severity: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'Agression signalée près du campus universitaire',
      assignedAgent: 'Agent Fall'
    },
    {
      id: '3',
      type: 'Cambriolage',
      location: { lat: 14.6928, lng: -17.4467 }, // Plateau
      zone: 'Plateau',
      status: 'resolved',
      severity: 'medium',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      description: 'Tentative de cambriolage dans un bureau',
      assignedAgent: 'Agent Ndiaye'
    },
    {
      id: '4',
      type: 'Fraude',
      location: { lat: 14.7645, lng: -17.3660 }, // Pikine
      zone: 'Pikine',
      status: 'active',
      severity: 'medium',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      description: 'Fraude bancaire signalée',
      assignedAgent: 'Agent Sow'
    },
    {
      id: '5',
      type: 'Vol de véhicule',
      location: { lat: 14.7167, lng: -17.3833 }, // Guédiawaye
      zone: 'Guédiawaye',
      status: 'investigating',
      severity: 'high',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      description: 'Vol de véhicule dans un parking',
      assignedAgent: 'Agent Ba'
    }
  ]);

  const [patrols] = useState([
    {
      id: '1',
      agent: 'Patrouille Alpha',
      location: { lat: 14.6937, lng: -17.4441 },
      status: 'active',
      route: 'Sandaga - Plateau'
    },
    {
      id: '2',
      agent: 'Patrouille Beta',
      location: { lat: 14.6848, lng: -17.4536 },
      status: 'active',
      route: 'UCAD - Liberté'
    },
    {
      id: '3',
      agent: 'Patrouille Gamma',
      location: { lat: 14.7645, lng: -17.3660 },
      status: 'break',
      route: 'Pikine - Guédiawaye'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-danger-500';
      case 'medium': return 'bg-warning-500';
      case 'low': return 'bg-success-500';
      default: return 'bg-neuro-500';
    }
  };

  const getSeverityHex = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  // fallback coords (si CSV sans latitude/longitude)
  const ZONE_COORDS: Record<string, [number, number]> = {
    Dakar: [14.7167, -17.4677],
    Sandaga: [14.6728, -17.4431],
    UCAD: [14.6928, -17.4616],
    Plateau: [14.6708, -17.4381],
    Pikine: [14.7554, -17.3946],
    'Guédiawaye': [14.7734, -17.3891],
    Rufisque: [14.7167, -17.2667],
    'Keur Massar': [14.7828, -17.3117],
  };

  const resolveCoords = (incident: any): { lat: number; lng: number; approx: boolean } => {
    const lat = Number(incident.latitude ?? incident.location?.lat);
    const lng = Number(incident.longitude ?? incident.location?.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && Math.abs(lat) > 0.001 && Math.abs(lng) > 0.001) {
      return { lat, lng, approx: false };
    }

    const zone = String(incident.location || incident.zone || 'Dakar');
    const hit = Object.entries(ZONE_COORDS).find(([k]) => zone.toLowerCase().includes(k.toLowerCase()));
    const base = hit ? hit[1] : ZONE_COORDS.Dakar;

    // petit jitter pour éviter superposition
    const jitterLat = base[0] + (Math.random() - 0.5) * 0.01;
    const jitterLng = base[1] + (Math.random() - 0.5) * 0.01;
    return { lat: jitterLat, lng: jitterLng, approx: true };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-danger-600 bg-danger-100';
      case 'investigating': return 'text-warning-600 bg-warning-100';
      case 'resolved': return 'text-success-600 bg-success-100';
      default: return 'text-neuro-600 bg-neuro-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'investigating': return 'En cours';
      case 'resolved': return 'Résolu';
      default: return status;
    }
  };

  const handleViewAllIncidents = () => {
    setShowAllIncidents(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'patrol':
        alert('Patrouille d\'urgence déployée!\n\nAgent: Patrouille Delta\nZone: Sandaga\nETA: 5 minutes');
        break;
      case 'backup':
        alert('Renforts demandés!\n\n2 unités supplémentaires en route\nETA: 8 minutes');
        break;
      case 'alert':
        alert('Alerte générale diffusée!\n\nToutes les unités alertées\nNiveau: Critique');
        break;
    }
  };

  const handleMapSettings = () => {
    setShowMapSettings(false);
    alert('Paramètres de carte sauvegardés!');
  };
  
  const handleCSVUploadSuccess = async () => {
    setShowCSVUploader(false);
    // Recharger les incidents après un nouvel import
    setIsLoadingIncidents(true);
    try {
      const data = await DataService.getIncidents(100);
      const transformedIncidents = data.map((incident, index) => ({
        id: incident.id || `incident-${index}`,
        type: incident.type || 'Incident',
        location: {
          lat: incident.latitude || (14.6937 + (Math.random() - 0.5) * 0.1),
          lng: incident.longitude || (-17.4441 + (Math.random() - 0.5) * 0.1)
        },
        zone: incident.location || 'Zone inconnue',
        status: incident.status === 'resolved' ? 'resolved' : 
               incident.status === 'investigating' ? 'investigating' : 'active',
        severity: incident.severity || 'medium',
        timestamp: new Date(incident.reported_at || incident.created_at || Date.now()),
        description: incident.description || `${incident.type} signalé`,
        assignedAgent: `Agent ${Math.floor(Math.random() * 100) + 1}`
      }));
      setRealIncidents(transformedIncidents);
      alert('✅ Données de la carte mises à jour!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  // Charger les vrais incidents
  useEffect(() => {
    const loadIncidents = async () => {
      setIsLoadingIncidents(true);
      try {
        const data = await DataService.getIncidents(100);
        
        // Transformer les données pour le format attendu
        const transformedIncidents = data.map((incident, index) => ({
          id: incident.id || `incident-${index}`,
          type: incident.type || 'Incident',
          location: {
            lat: incident.latitude || (14.6937 + (Math.random() - 0.5) * 0.1),
            lng: incident.longitude || (-17.4441 + (Math.random() - 0.5) * 0.1)
          },
          zone: incident.location || 'Zone inconnue',
          status: incident.status === 'resolved' ? 'resolved' : 
                 incident.status === 'investigating' ? 'investigating' : 'active',
          severity: incident.severity || 'medium',
          timestamp: new Date(incident.reported_at || incident.created_at || Date.now()),
          description: incident.description || `${incident.type} signalé`,
          assignedAgent: `Agent ${Math.floor(Math.random() * 100) + 1}`
        }));
        
        setRealIncidents(transformedIncidents);
      } catch (error) {
        console.error('Erreur lors du chargement des incidents:', error);
        // Garder les données par défaut en cas d'erreur
      } finally {
        setIsLoadingIncidents(false);
      }
    };
    
    loadIncidents();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      console.log('Mise à jour des positions en temps réel...');
      loadIncidents(); // Recharger les incidents
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout title="Cartographie" subtitle="Visualisation géographique">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neuro-900 dark:text-white">Carte interactive</h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Visualisation géographique des incidents et patrouilles
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="success" size="sm" onClick={() => setShowCSVUploader(true)}>
              <i className="ri-upload-cloud-line mr-2"></i>
              Importer données
            </Button>
            <Button variant="neuro" size="sm" onClick={() => setShowMapSettings(true)}>
              <i className="ri-settings-3-line mr-2"></i>
              Paramètres carte
            </Button>
            <Button variant="primary" size="sm" onClick={handleViewAllIncidents}>
              <i className="ri-eye-line mr-2"></i>
              Voir tous les incidents
            </Button>
          </div>
        </div>

        {/* Map Controls */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-neuro-700 dark:text-gray-300">Vue:</label>
                <select
                  value={mapView}
                  onChange={(e) => setMapView(e.target.value as MapView)}
                  className="px-3 py-1 bg-white dark:bg-gray-700 border border-neuro-200 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="light">Clair</option>
                  <option value="street">Plan</option>
                  <option value="satellite">Satellite</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-neuro-700 dark:text-gray-300">Carte de chaleur</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showPatrols}
                    onChange={(e) => setShowPatrols(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-neuro-700 dark:text-gray-300">Patrouilles</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-neuro-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span>Temps réel</span>
            </div>
          </div>
        </Card>

        {/* Map Container */}
        <Card className="h-96" animate={false} hover={false}>
          <div className="relative w-full h-full bg-neuro-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {isLoadingIncidents && (
              <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg z-10">
                <div className="flex items-center space-x-2 text-sm text-neuro-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  <span>Chargement incidents...</span>
                </div>
              </div>
            )}

            {(() => {
              const current = (realIncidents.length > 0 ? realIncidents : incidents) as any[];
              const fallbackCenter: LatLngExpression = [14.7167, -17.4677];
              const center: LatLngExpression = current.length > 0
                ? [resolveCoords(current[0]).lat, resolveCoords(current[0]).lng]
                : fallbackCenter;

              const tiles = {
                light: {
                  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                  attribution: '&copy; OpenStreetMap &copy; CARTO'
                },
                street: {
                  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                  attribution: '&copy; OpenStreetMap'
                },
                satellite: {
                  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                  attribution: 'Tiles &copy; Esri'
                }
              } as const;

              const tile = tiles[mapView];

              return (
                <MapContainer
                  ref={mapRef}
                  center={center}
                  zoom={11}
                  scrollWheelZoom
                  className="w-full h-full"
                  style={{ height: '100%', width: '100%' }}
                  whenReady={() => {
                    // Fix classique: Leaflet peut mesurer trop tôt si le layout vient de changer
                    setTimeout(() => {
                      mapRef.current?.invalidateSize();
                    }, 0);
                  }}
                >
                  <TileLayer attribution={tile.attribution} url={tile.url} />

                  <LayersControl position="topright">
                    <LayersControl.Overlay checked name="Incidents">
                      <LayerGroup>
                        {current.map((incident: any) => {
                          const coords = resolveCoords(incident);
                          const color = getSeverityHex(incident.severity || 'medium');

                          // "Heat" léger: on augmente le rayon selon la sévérité
                          const baseRadius = (incident.severity === 'critical') ? 14 :
                            (incident.severity === 'high') ? 12 :
                            (incident.severity === 'medium') ? 10 : 8;

                          return (
                            <CircleMarker
                              key={incident.id}
                              center={[coords.lat, coords.lng]}
                              radius={showHeatmap ? baseRadius : 9}
                              pathOptions={{
                                color,
                                fillColor: color,
                                fillOpacity: showHeatmap ? 0.35 : 0.7,
                                weight: 2
                              }}
                              eventHandlers={{
                                click: () => setSelectedIncident(incident)
                              }}
                            >
                              <Popup>
                                <div className="text-sm">
                                  <div className="font-semibold">{incident.type || incident.incident_type || 'Incident'}</div>
                                  <div>Zone: {incident.zone || incident.location || '—'}</div>
                                  <div>Sévérité: {incident.severity || '—'}</div>
                                  {coords.approx && (
                                    <div className="text-xs text-neuro-500 mt-1">
                                      Position approximative (CSV sans coordonnées)
                                    </div>
                                  )}
                                </div>
                              </Popup>
                            </CircleMarker>
                          );
                        })}
                      </LayerGroup>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay checked={showPatrols} name="Patrouilles">
                      <LayerGroup>
                        {showPatrols && patrols.map((p: any) => (
                          <CircleMarker
                            key={p.id}
                            center={[p.location.lat, p.location.lng]}
                            radius={7}
                            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.7, weight: 2 }}
                          >
                            <Popup>
                              <div className="text-sm">
                                <div className="font-semibold">{p.agent}</div>
                                <div>Statut: {p.status}</div>
                                <div>Route: {p.route}</div>
                              </div>
                            </Popup>
                          </CircleMarker>
                        ))}
                      </LayerGroup>
                    </LayersControl.Overlay>
                  </LayersControl>
                </MapContainer>
              );
            })()}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg z-10">
              <h4 className="text-sm font-medium text-neuro-900 dark:text-white mb-2">Légende</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-neuro-700 dark:text-gray-300">Critique</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                  <span className="text-neuro-700 dark:text-gray-300">Élevé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                  <span className="text-neuro-700 dark:text-gray-300">Moyen</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <span className="text-neuro-700 dark:text-gray-300">Faible</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neuro-900 dark:text-white">Actions rapides</h2>
            <div className="flex items-center space-x-2 text-sm text-neuro-600 dark:text-gray-400">
              <i className="ri-time-line"></i>
              <span>Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="danger" 
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => handleQuickAction('patrol')}
            >
              <i className="ri-car-line text-xl"></i>
              <span className="text-sm">Patrouille d'urgence</span>
            </Button>
            
            <Button 
              variant="warning" 
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => handleQuickAction('backup')}
            >
              <i className="ri-team-line text-xl"></i>
              <span className="text-sm">Demander renforts</span>
            </Button>
            
            <Button 
              variant="primary" 
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => handleQuickAction('alert')}
            >
              <i className="ri-alarm-line text-xl"></i>
              <span className="text-sm">Alerte générale</span>
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Incidents actifs</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {(realIncidents.length > 0 ? realIncidents : incidents).filter(i => i.status === 'active').length}
                </p>
                <p className="text-xs text-danger-600 mt-1">
                  Sur {(realIncidents.length > 0 ? realIncidents : incidents).length} incidents
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-error-warning-line text-xl text-danger-600 dark:text-red-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Patrouilles actives</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">
                  {patrols.filter(p => p.status === 'active').length}
                </p>
                <p className="text-xs text-success-600 mt-1">
                  Sur {patrols.length} patrouilles
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-car-line text-xl text-success-600 dark:text-success-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Zones surveillées</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">12</p>
                <p className="text-xs text-primary-600 mt-1">
                  Couverture: 87%
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-map-2-line text-xl text-primary-600 dark:text-primary-400"></i>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neuro-600 dark:text-gray-400">Temps de réponse</p>
                <p className="text-2xl font-bold text-neuro-900 dark:text-white">3.8min</p>
                <p className="text-xs text-success-600 mt-1">
                  -12% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <i className="ri-timer-line text-xl text-warning-600 dark:text-warning-400"></i>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Incidents */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neuro-900 dark:text-white">
              Incidents récents sur la carte
            </h2>
            <Button variant="primary" size="sm" onClick={handleViewAllIncidents}>
              <i className="ri-list-check mr-2"></i>
              Liste complète
            </Button>
          </div>

          <div className="space-y-4">
            {(realIncidents.length > 0 ? realIncidents : incidents).slice(0, 3).map((incident, index) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-neuro-50 dark:bg-gray-700 rounded-lg border border-neuro-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${getSeverityColor(incident.severity)}`}></div>
                  <div>
                    <h3 className="font-medium text-neuro-900 dark:text-white">{incident.type}</h3>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">
                      {incident.zone} • {incident.timestamp.toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                    {getStatusLabel(incident.status)}
                  </span>
                  <Button variant="neuro" size="sm" onClick={() => setSelectedIncident(incident)}>
                    <i className="ri-eye-line"></i>
                  </Button>
                  <Button variant="neuro" size="sm">
                    <i className="ri-map-pin-line"></i>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* All Incidents Modal */}
        <AnimatePresence>
          {showAllIncidents && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Tous les incidents ({(realIncidents.length > 0 ? realIncidents : incidents).length})
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowAllIncidents(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neuro-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Type</th>
                        <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Zone</th>
                        <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Gravité</th>
                        <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Statut</th>
                        <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Heure</th>
                        <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Agent</th>
                        <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(realIncidents.length > 0 ? realIncidents : incidents).map((incident) => (
                        <tr key={incident.id} className="border-t border-neuro-100 dark:border-gray-600 hover:bg-neuro-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-neuro-900 dark:text-white font-medium">{incident.type}</td>
                          <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{incident.zone}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${getSeverityColor(incident.severity)}`}></div>
                              <span className="text-neuro-700 dark:text-gray-300 capitalize">{incident.severity}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                              {getStatusLabel(incident.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                            {incident.timestamp.toLocaleTimeString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                            {incident.assignedAgent || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-1">
                              <Button variant="neuro" size="sm" onClick={() => setSelectedIncident(incident)}>
                                <i className="ri-eye-line"></i>
                              </Button>
                              <Button variant="neuro" size="sm">
                                <i className="ri-map-pin-line"></i>
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

        {/* Map Settings Modal */}
        <AnimatePresence>
          {showMapSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neuro-900 dark:text-white">
                    Paramètres de la carte
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setShowMapSettings(false)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-neuro-900 dark:text-white mb-4">Affichage</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Incidents en temps réel</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Patrouilles actives</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Zones de danger</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Carte de chaleur</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neuro-900 dark:text-white mb-4">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Nouveaux incidents</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Changements de statut</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neuro-700 dark:text-gray-300">Alertes critiques</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">
                      Fréquence de mise à jour (secondes)
                    </label>
                    <Input type="number" min="10" max="300" defaultValue="30" />
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="primary" className="flex-1" onClick={handleMapSettings}>
                      <i className="ri-save-line mr-2"></i>
                      Sauvegarder
                    </Button>
                    <Button variant="neuro" onClick={() => setShowMapSettings(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Incident Details Modal */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                    Détails de l'incident
                  </h3>
                  <Button variant="neuro" size="sm" onClick={() => setSelectedIncident(null)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-neuro-900 dark:text-white mb-3">Informations générales</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neuro-600 dark:text-gray-400">Type:</span>
                          <span className="text-neuro-900 dark:text-white font-medium">{selectedIncident.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neuro-600 dark:text-gray-400">Zone:</span>
                          <span className="text-neuro-900 dark:text-white font-medium">{selectedIncident.zone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neuro-600 dark:text-gray-400">Gravité:</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(selectedIncident.severity)}`}></div>
                            <span className="text-neuro-900 dark:text-white font-medium capitalize">{selectedIncident.severity}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neuro-600 dark:text-gray-400">Statut:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIncident.status)}`}>
                            {getStatusLabel(selectedIncident.status)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neuro-600 dark:text-gray-400">Heure:</span>
                          <span className="text-neuro-900 dark:text-white font-medium">
                            {selectedIncident.timestamp.toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neuro-600 dark:text-gray-400">Agent assigné:</span>
                          <span className="text-neuro-900 dark:text-white font-medium">
                            {selectedIncident.assignedAgent || 'Non assigné'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-neuro-900 dark:text-white mb-3">Localisation</h4>
                      <div className="bg-neuro-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-neuro-600 dark:text-gray-400">Latitude:</span>
                            <span className="text-neuro-900 dark:text-white font-mono">{selectedIncident.location.lat.toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neuro-600 dark:text-gray-400">Longitude:</span>
                            <span className="text-neuro-900 dark:text-white font-mono">{selectedIncident.location.lng.toFixed(6)}</span>
                          </div>
                        </div>
                        <Button variant="primary" size="sm" className="w-full mt-3">
                          <i className="ri-map-pin-line mr-2"></i>
                          Voir sur la carte
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neuro-900 dark:text-white mb-3">Description</h4>
                    <p className="text-neuro-700 dark:text-gray-300 text-sm bg-neuro-50 dark:bg-gray-700 rounded-lg p-4">
                      {selectedIncident.description}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="primary" className="flex-1">
                      <i className="ri-edit-line mr-2"></i>
                      Modifier
                    </Button>
                    <Button variant="success">
                      <i className="ri-phone-line mr-2"></i>
                      Contacter agent
                    </Button>
                    <Button variant="warning">
                      <i className="ri-car-line mr-2"></i>
                      Envoyer renfort
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* CSV Uploader Modal */}
        <AnimatePresence>
          {showCSVUploader && (
            <SmartCSVUploader
              onClose={() => setShowCSVUploader(false)}
              onSuccess={handleCSVUploadSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
