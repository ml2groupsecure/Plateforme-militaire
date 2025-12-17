
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../base/Card';
import Button from '../base/Button';

interface CSVData {
  headers: string[];
  rows: any[][];
  summary: {
    totalRows: number;
    duplicates: number;
    missingValues: number;
    cleanRows: number;
  };
}

interface CSVUploaderProps {
  onDataProcessed?: (data: CSVData) => void;
  onClose?: () => void;
}

export default function CSVUploader({ onDataProcessed, onClose }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const processCSVFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('idle');
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('Le fichier CSV est vide');
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Parse rows
      const rawRows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      );

      // Data cleaning
      const duplicateRows = new Set();
      const cleanRows: any[][] = [];
      let duplicatesCount = 0;
      let missingValuesCount = 0;

      rawRows.forEach((row, index) => {
        const rowString = row.join('|');
        
        // Count missing values
        const missingInRow = row.filter(cell => !cell || cell === '').length;
        missingValuesCount += missingInRow;

        // Remove duplicates
        if (duplicateRows.has(rowString)) {
          duplicatesCount++;
        } else {
          duplicateRows.add(rowString);
          
          // Clean row data
          const cleanRow = row.map(cell => {
            if (!cell || cell === '') return null;
            
            // Try to parse numbers
            const num = parseFloat(cell);
            if (!isNaN(num) && isFinite(num)) return num;
            
            // Try to parse dates
            const date = new Date(cell);
            if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
            
            return cell;
          });
          
          cleanRows.push(cleanRow);
        }
      });

      const processedData: CSVData = {
        headers,
        rows: cleanRows,
        summary: {
          totalRows: rawRows.length,
          duplicates: duplicatesCount,
          missingValues: missingValuesCount,
          cleanRows: cleanRows.length
        }
      };

      setCsvData(processedData);
      setUploadStatus('success');
      onDataProcessed?.(processedData);
      
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors du traitement du fichier');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, [onDataProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      processCSVFile(csvFile);
    } else {
      setErrorMessage('Veuillez sélectionner un fichier CSV valide');
      setUploadStatus('error');
    }
  }, [processCSVFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCSVFile(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success-600 bg-success-100';
      case 'error': return 'text-danger-600 bg-danger-100';
      default: return 'text-primary-600 bg-primary-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neuro-900 dark:text-white">Upload et traitement CSV</h2>
            <p className="text-sm text-neuro-600 dark:text-gray-400">
              Importez vos données criminelles pour analyse automatique
            </p>
          </div>
          <Button variant="neuro" size="sm" onClick={onClose}>
            <i className="ri-close-line"></i>
          </Button>
        </div>

        {!csvData ? (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                isDragging
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neuro-300 dark:border-gray-600 hover:border-primary-400 hover:bg-neuro-50 dark:hover:bg-gray-700'
              }`}
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-neuro-900 dark:text-white">Traitement en cours...</p>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">
                      Nettoyage automatique des données (doublons, valeurs manquantes)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <i className="ri-file-upload-line text-2xl text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-neuro-900 dark:text-white">
                      Glissez votre fichier CSV ici
                    </p>
                    <p className="text-sm text-neuro-600 dark:text-gray-400">
                      ou cliquez pour parcourir vos fichiers
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <Button variant="primary" size="sm">
                      <i className="ri-folder-open-line mr-2"></i>
                      Parcourir
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>
                    <Button variant="neuro" size="sm">
                      <i className="ri-download-line mr-2"></i>
                      Modèle CSV
                    </Button>
                  </div>
                  <div className="text-xs text-neuro-500 dark:text-gray-500">
                    Formats supportés: .csv (max 50MB)
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {uploadStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg ${
                    uploadStatus === 'success' ? 'bg-success-50 dark:bg-success-900/20' : 'bg-danger-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${
                      uploadStatus === 'success' ? 'ri-check-circle-line text-success-600' : 'ri-error-warning-line text-danger-600'
                    } text-lg`}></i>
                    <p className={`text-sm font-medium ${
                      uploadStatus === 'success' ? 'text-success-800 dark:text-success-400' : 'text-danger-800 dark:text-red-400'
                    }`}>
                      {uploadStatus === 'success' ? 'Fichier traité avec succès!' : errorMessage}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expected Format */}
            <div className="bg-neuro-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-neuro-900 dark:text-white mb-2">Format CSV attendu :</h4>
              <div className="text-sm text-neuro-600 dark:text-gray-400 space-y-1">
                <p>• <strong>Date</strong> : Format YYYY-MM-DD ou DD/MM/YYYY</p>
                <p>• <strong>Type</strong> : Vol, Agression, Fraude, etc.</p>
                <p>• <strong>Zone</strong> : Dakar, Pikine, Guédiawaye, etc.</p>
                <p>• <strong>Gravité</strong> : 1-5 ou Faible/Moyenne/Élevée</p>
                <p>• <strong>Statut</strong> : En cours, Résolu, Classé</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Processing Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{csvData.summary.totalRows}</p>
                <p className="text-sm text-neuro-600 dark:text-gray-400">Lignes totales</p>
              </div>
              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-success-600 dark:text-success-400">{csvData.summary.cleanRows}</p>
                <p className="text-sm text-neuro-600 dark:text-gray-400">Lignes nettoyées</p>
              </div>
              <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">{csvData.summary.duplicates}</p>
                <p className="text-sm text-neuro-600 dark:text-gray-400">Doublons supprimés</p>
              </div>
              <div className="bg-danger-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-danger-600 dark:text-red-400">{csvData.summary.missingValues}</p>
                <p className="text-sm text-neuro-600 dark:text-gray-400">Valeurs manquantes</p>
              </div>
            </div>

            {/* Data Preview */}
            <div>
              <h4 className="font-medium text-neuro-900 dark:text-white mb-3">Aperçu des données nettoyées :</h4>
              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-neuro-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-neuro-50 dark:bg-gray-700">
                    <tr>
                      {csvData.headers.map((header, index) => (
                        <th key={index} className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.rows.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-neuro-100 dark:border-gray-600">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                            {cell === null ? (
                              <span className="text-neuro-400 dark:text-gray-500 italic">-</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.rows.length > 5 && (
                <p className="text-sm text-neuro-500 dark:text-gray-400 mt-2">
                  ... et {csvData.rows.length - 5} autres lignes
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button variant="primary" className="flex-1">
                <i className="ri-check-line mr-2"></i>
                Ajouter au dashboard
              </Button>
              <Button variant="success" className="flex-1">
                <i className="ri-download-line mr-2"></i>
                Télécharger données nettoyées
              </Button>
              <Button variant="neuro" onClick={() => setCsvData(null)}>
                <i className="ri-upload-line mr-2"></i>
                Nouveau fichier
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
