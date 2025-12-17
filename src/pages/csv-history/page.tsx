import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { useCsvHistory, type CsvUploadHistory } from '../../lib/csvHistoryService';
import { DataService } from '../../lib/csvService';
import SmartCSVUploader from '../../components/upload/SmartCSVUploader';

export default function CsvHistoryPage() {
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CsvUploadHistory | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [isLoadingFileData, setIsLoadingFileData] = useState(false);
  const { 
    history, 
    stats, 
    isLoading, 
    deleteRecord, 
    cleanupOld, 
    refresh 
  } = useCsvHistory();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success-600 bg-success-100';
      case 'partial': return 'text-warning-600 bg-warning-100';
      case 'error': return 'text-danger-600 bg-danger-100';
      default: return 'text-neuro-600 bg-neuro-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCSVUploadSuccess = async () => {
    setShowCSVUploader(false);
    await refresh();
    alert('✅ Fichier CSV importé avec succès!');
  };

  const handleViewFileData = async (uploadRecord: CsvUploadHistory) => {
    setSelectedFile(uploadRecord);
    setIsLoadingFileData(true);
    
    try {
      // Récupérer les incidents liés à ce fichier (approximation par date)
      const incidents = await DataService.getIncidents(1000);
      const uploadDate = new Date(uploadRecord.upload_date);
      const dayBefore = new Date(uploadDate.getTime() - 24 * 60 * 60 * 1000);
      const dayAfter = new Date(uploadDate.getTime() + 24 * 60 * 60 * 1000);
      
      const relatedIncidents = incidents.filter(incident => {
        const incidentDate = new Date(incident.created_at);
        return incidentDate >= dayBefore && incidentDate <= dayAfter;
      });
      
      setFileData(relatedIncidents.slice(0, 50)); // Limiter à 50 pour la démo
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setFileData([]);
    } finally {
      setIsLoadingFileData(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      const success = await deleteRecord(id);
      if (success) {
        alert('✅ Enregistrement supprimé avec succès!');
      } else {
        alert('❌ Erreur lors de la suppression');
      }
    }
  };

  return (
    <Layout title="Historique CSV" subtitle="Gestion des imports de fichiers">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neuro-900 dark:text-white mb-2">
              Historique des imports CSV
            </h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Suivi et gestion des fichiers importés
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="success" size="sm" onClick={() => setShowCSVUploader(true)}>
              <i className="ri-upload-cloud-line mr-2"></i>
              Nouveau CSV
            </Button>
            <Button variant="primary" size="sm" onClick={refresh}>
              <i className="ri-refresh-line mr-2"></i>
              Actualiser
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      Total Uploads
                    </p>
                    <p className="text-3xl font-bold text-primary-900">
                      {stats.totalUploads}
                    </p>
                    {stats.lastUploadDate && (
                      <p className="text-xs text-primary-600 mt-2">
                        <i className="ri-time-line mr-1"></i>
                        Dernier: {new Date(stats.lastUploadDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-upload-line text-xl text-white"></i>
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
                      Lignes traitées
                    </p>
                    <p className="text-3xl font-bold text-success-900">
                      {stats.totalRowsProcessed.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-success-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-file-list-line text-xl text-white"></i>
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
                      Taux de succès
                    </p>
                    <p className="text-3xl font-bold text-warning-900">
                      {stats.successRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-warning-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-pie-chart-line text-xl text-white"></i>
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
            <Card className="relative overflow-hidden bg-gradient-to-br from-info-50 to-info-100 border-info-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-info-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-info-700 mb-1">
                      Qualité moyenne
                    </p>
                    <p className="text-3xl font-bold text-info-900">
                      {stats.averageQualityScore.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-info-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-award-line text-xl text-white"></i>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* History Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neuro-900 dark:text-white">
              Historique des uploads ({history.length})
            </h2>
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-neuro-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span>Chargement...</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neuro-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Fichier
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Taille
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                    Lignes
                  </th>
                    <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                      Actions
                    </th>
                </tr>
              </thead>
              <tbody>
                {history.map((upload, index) => (
                  <motion.tr
                    key={upload.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-neuro-100 dark:border-gray-600 hover:bg-neuro-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <i className="ri-file-csv-line text-primary-600"></i>
                        <div>
                          <p className="font-medium text-neuro-900 dark:text-white truncate max-w-[200px]">
                            {upload.filename}
                          </p>
                          <p className="text-xs text-neuro-500 dark:text-gray-400">
                            {upload.uploaded_by || 'Utilisateur'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                      <div>
                        <p>{new Date(upload.upload_date).toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-neuro-500">
                          {new Date(upload.upload_date).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                      {formatFileSize(upload.file_size)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-neuro-900 dark:text-white font-medium">
                          {upload.total_rows} total
                        </p>
                        <p className="text-success-600">
                          {upload.processed_rows} traitées
                        </p>
                        {upload.error_rows > 0 && (
                          <p className="text-danger-600">
                            {upload.error_rows} erreurs
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.processing_status)}`}>
                        {upload.processing_status === 'success' ? 'Succès' :
                         upload.processing_status === 'partial' ? 'Partiel' :
                         upload.processing_status === 'error' ? 'Erreur' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <Button 
                          variant="neuro" 
                          size="sm" 
                          onClick={() => handleViewFileData(upload)}
                          title="Voir les données"
                        >
                          <i className="ri-eye-line"></i>
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteRecord(upload.id)}
                          title="Supprimer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {history.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <i className="ri-inbox-line text-6xl text-neuro-400 mb-4"></i>
                <p className="text-lg text-neuro-600 dark:text-gray-400">Aucun upload CSV trouvé</p>
                <p className="text-sm text-neuro-500 dark:text-gray-500 mt-2">
                  Importez votre premier fichier CSV pour voir l'historique
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* CSV Uploader Modal */}
        <AnimatePresence>
          {showCSVUploader && (
            <SmartCSVUploader
              onClose={() => setShowCSVUploader(false)}
              onSuccess={handleCSVUploadSuccess}
            />
          )}
        </AnimatePresence>

        {/* File Data Viewer Modal */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">
                      Données du fichier: {selectedFile.filename}
                    </h3>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">
                      Importé le {new Date(selectedFile.upload_date).toLocaleDateString('fr-FR')} à {new Date(selectedFile.upload_date).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                  <Button variant="neuro" size="sm" onClick={() => setSelectedFile(null)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                {/* File Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{selectedFile.total_rows}</p>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">Lignes totales</p>
                  </div>
                  <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">{selectedFile.processed_rows}</p>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">Traitées</p>
                  </div>
                  <div className="bg-danger-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-danger-600 dark:text-red-400">{selectedFile.error_rows}</p>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">Erreurs</p>
                  </div>
                  <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">{selectedFile.quality_score || 85}%</p>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">Qualité</p>
                  </div>
                </div>

                {/* Data Table */}
                <div className="border border-neuro-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-neuro-50 dark:bg-gray-700 px-4 py-3 border-b border-neuro-200 dark:border-gray-600">
                    <h4 className="font-medium text-neuro-900 dark:text-white">
                      Aperçu des données importées ({fileData.length} incidents)
                    </h4>
                  </div>
                  
                  {isLoadingFileData ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                      <p className="text-neuro-600 dark:text-gray-400">Chargement des données...</p>
                    </div>
                  ) : fileData.length > 0 ? (
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-neuro-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Type</th>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Lieu</th>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Date</th>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Gravité</th>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fileData.map((incident, index) => (
                            <tr key={index} className="border-t border-neuro-100 dark:border-gray-600 hover:bg-neuro-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-3 text-neuro-900 dark:text-white font-medium">{incident.type || 'N/A'}</td>
                              <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{incident.location || 'N/A'}</td>
                              <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                                {incident.reported_at ? new Date(incident.reported_at).toLocaleDateString('fr-FR') : 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  incident.severity === 'critical' ? 'text-red-700 bg-red-100' :
                                  incident.severity === 'high' ? 'text-orange-700 bg-orange-100' :
                                  incident.severity === 'medium' ? 'text-yellow-700 bg-yellow-100' :
                                  'text-green-700 bg-green-100'
                                }`}>
                                  {incident.severity || 'N/A'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  incident.status === 'resolved' ? 'text-green-700 bg-green-100' :
                                  incident.status === 'investigating' ? 'text-blue-700 bg-blue-100' :
                                  'text-gray-700 bg-gray-100'
                                }`}>
                                  {incident.status || 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <i className="ri-inbox-line text-4xl text-neuro-400 mb-4"></i>
                      <p className="text-neuro-600 dark:text-gray-400">Aucune donnée trouvée pour ce fichier</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button variant="primary" onClick={() => setSelectedFile(null)}>
                    <i className="ri-check-line mr-2"></i>
                    Fermer
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
