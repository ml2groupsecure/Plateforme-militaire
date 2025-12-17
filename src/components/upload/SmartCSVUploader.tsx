import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../base/Button';
import Card from '../base/Card';
import { useSmartCSV, type CsvAnalysis, type MappingRule, type ProcessingResult } from '../../lib/smartCsvProcessor';

interface SmartCSVUploaderProps {
  onClose: () => void;
  onSuccess: (result: ProcessingResult) => void;
}

type UploadStep = 'upload' | 'analysis' | 'mapping' | 'processing' | 'results';

export default function SmartCSVUploader({ onClose, onSuccess }: SmartCSVUploaderProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);

  const {
    analyzeFile,
    processFile,
    analysis,
    mappingRules,
    setMappingRules,
    isProcessing
  } = useSmartCSV();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setCurrentStep('analysis');
    
    // Lancer l'analyse automatiquement
    analyzeFile(file).catch(error => {
      console.error('Erreur d\'analyse:', error);
      setCurrentStep('upload');
    });
  }, [analyzeFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));

    if (csvFile) {
      handleFileSelect(csvFile);
    } else {
      alert('Veuillez sélectionner un fichier CSV');
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setCurrentStep('processing');
    try {
      const result = await processFile(selectedFile);
      setProcessingResult(result);
      setCurrentStep('results');
      
      // Rafraîchir même en import partiel (au moins 1 ligne insérée)
      if (result.success || result.insertedData.length > 0) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Erreur de traitement:', error);
      setCurrentStep('mapping');
    }
  };

  const updateMappingRule = (index: number, field: keyof MappingRule, value: any) => {
    const newRules = [...mappingRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setMappingRules(newRules);
  };

  const getStepIcon = (step: UploadStep) => {
    const icons = {
      upload: 'ri-upload-2-line',
      analysis: 'ri-search-line',
      mapping: 'ri-settings-3-line',
      processing: 'ri-loader-line',
      results: 'ri-check-circle-line'
    };
    return icons[step];
  };

  const getStepTitle = (step: UploadStep) => {
    const titles = {
      upload: 'Sélection du fichier',
      analysis: 'Analyse du fichier',
      mapping: 'Configuration des champs',
      processing: 'Traitement en cours',
      results: 'Résultats'
    };
    return titles[step];
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-100';
    if (score >= 60) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-success-500';
    if (confidence >= 0.6) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className={`${getStepIcon(currentStep)} text-2xl text-primary-600`}></i>
              <h2 className="text-2xl font-bold text-neuro-900">
                {getStepTitle(currentStep)}
              </h2>
            </div>
            {selectedFile && (
              <div className="text-sm text-neuro-600">
                <i className="ri-file-line mr-1"></i>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
          <Button variant="neuro" size="sm" onClick={onClose}>
            <i className="ri-close-line"></i>
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {(['upload', 'analysis', 'mapping', 'processing', 'results'] as UploadStep[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-primary-500 text-white'
                      : index <= ['upload', 'analysis', 'mapping', 'processing', 'results'].indexOf(currentStep)
                      ? 'bg-success-500 text-white'
                      : 'bg-neuro-200 text-neuro-500'
                  }`}
                >
                  {index < ['upload', 'analysis', 'mapping', 'processing', 'results'].indexOf(currentStep) ? (
                    <i className="ri-check-line"></i>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 4 && (
                  <div
                    className={`w-12 h-1 ml-2 ${
                      index < ['upload', 'analysis', 'mapping', 'processing', 'results'].indexOf(currentStep)
                        ? 'bg-success-500'
                        : 'bg-neuro-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragging
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neuro-300 hover:border-primary-400 hover:bg-neuro-50'
                }`}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="ri-file-csv-line text-2xl text-primary-600"></i>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-neuro-900 mb-2">
                      Glissez votre fichier CSV ici
                    </p>
                    <p className="text-sm text-neuro-600 mb-4">
                      ou cliquez pour sélectionner un fichier
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleInputChange}
                      className="hidden"
                      id="csv-file-input"
                    />
                    <Button
                      variant="primary"
                      className="cursor-pointer"
                      onClick={() => {
                        const el = document.getElementById('csv-file-input') as HTMLInputElement | null;
                        el?.click();
                      }}
                    >
                      <i className="ri-upload-2-line mr-2"></i>
                      Sélectionner un fichier
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  <i className="ri-information-line mr-2"></i>
                  Le système intelligent détectera automatiquement :
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• La structure et le délimiteur du fichier</li>
                  <li>• Les types de données dans chaque colonne</li>
                  <li>• Les correspondances avec les champs de la base</li>
                  <li>• La qualité des données et les problèmes potentiels</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Step 2: Analysis */}
          {currentStep === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {isProcessing ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-neuro-900">Analyse du fichier en cours...</p>
                  <p className="text-sm text-neuro-600 mt-2">
                    Détection de la structure et des types de données
                  </p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Quality Score */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                      <p className="text-2xl font-bold text-primary-600">{analysis.totalRows}</p>
                      <p className="text-sm text-primary-700">Lignes détectées</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl">
                      <p className="text-2xl font-bold text-success-600">{analysis.columns.length}</p>
                      <p className="text-sm text-success-700">Colonnes trouvées</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(analysis.qualityScore)}`}>
                          {analysis.qualityScore.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm text-warning-700">Score de qualité</p>
                    </div>
                  </div>

                  {/* Columns Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-neuro-900 mb-4">Aperçu des colonnes</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-neuro-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900">Colonne</th>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900">Type détecté</th>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900">Exemples</th>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900">Mapping suggéré</th>
                            <th className="px-4 py-3 text-left font-medium text-neuro-900">Confiance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.columns.map((column, index) => (
                            <tr key={index} className="border-t border-neuro-100">
                              <td className="px-4 py-3 font-medium text-neuro-900">{column.name}</td>
                              <td className="px-4 py-3 text-neuro-700">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  column.type === 'date' ? 'bg-blue-100 text-blue-700' :
                                  column.type === 'number' ? 'bg-green-100 text-green-700' :
                                  column.type === 'coordinates' ? 'bg-purple-100 text-purple-700' :
                                  'bg-neuro-100 text-neuro-700'
                                }`}>
                                  {column.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-neuro-600 text-xs">
                                {column.examples.slice(0, 2).join(', ')}
                              </td>
                              <td className="px-4 py-3">
                                {column.suggestedMapping ? (
                                  <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs font-medium">
                                    {column.suggestedMapping}
                                  </span>
                                ) : (
                                  <span className="text-neuro-400 text-xs">Non mappé</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-12 h-2 bg-neuro-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${getConfidenceColor(column.confidence)}`}
                                      style={{ width: `${column.confidence * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-neuro-600">
                                    {(column.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Issues */}
                  {analysis.issues.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h3 className="font-medium text-yellow-800 mb-2">
                        <i className="ri-alert-line mr-2"></i>
                        Problèmes détectés
                      </h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {analysis.issues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Data Preview */}
                  {analysis.preview.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-neuro-900 mb-4">Aperçu des données</h3>
                      <div className="overflow-x-auto bg-neuro-50 rounded-lg p-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              {Object.keys(analysis.preview[0]).map((key) => (
                                <th key={key} className="px-3 py-2 text-left font-medium text-neuro-700 border-b">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.preview.map((row, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-neuro-25'}>
                                {Object.values(row).map((value: any, cellIndex) => (
                                  <td key={cellIndex} className="px-3 py-2 text-neuro-600 border-b text-xs">
                                    {String(value).substring(0, 50)}
                                    {String(value).length > 50 && '...'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button variant="neuro" onClick={() => setCurrentStep('upload')}>
                      <i className="ri-arrow-left-line mr-2"></i>
                      Retour
                    </Button>
                    <Button variant="primary" onClick={() => setCurrentStep('mapping')}>
                      Configurer les champs
                      <i className="ri-arrow-right-line ml-2"></i>
                    </Button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Step 3: Mapping */}
          {currentStep === 'mapping' && analysis && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <i className="ri-information-line mr-2"></i>
                  Vérifiez et ajustez les correspondances entre vos colonnes CSV et les champs de la base de données.
                  Les champs obligatoires sont marqués d'un astérisque (*).
                </p>
              </div>

              <div className="space-y-4">
                {mappingRules.map((rule, index) => (
                  <div key={index} className="border border-neuro-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-1">
                          Colonne CSV
                        </label>
                        <div className="px-3 py-2 bg-neuro-100 border border-neuro-200 rounded text-sm text-neuro-900">
                          {rule.csvColumn}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-1">
                          Champ cible {rule.required && <span className="text-danger-600">*</span>}
                        </label>
                        <select
                          value={rule.targetField}
                          onChange={(e) => updateMappingRule(index, 'targetField', e.target.value)}
                          className="w-full px-3 py-2 border border-neuro-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">-- Sélectionner --</option>
                          <optgroup label="Champs obligatoires">
                            <option value="incident_type">Type d'incident</option>
                            <option value="location">Lieu</option>
                            <option value="date_occurred">Date d'occurrence</option>
                          </optgroup>
                          <optgroup label="Champs optionnels">
                            <option value="description">Description</option>
                            <option value="status">Statut</option>
                            <option value="severity">Gravité</option>
                            <option value="latitude">Latitude</option>
                            <option value="longitude">Longitude</option>
                            <option value="agent_name">Nom de l'agent</option>
                            <option value="victim_count">Nombre de victimes</option>
                            <option value="suspect_description">Description du suspect</option>
                          </optgroup>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neuro-700 mb-1">
                          Transformation
                        </label>
                        <div className="px-3 py-2 bg-neuro-50 border border-neuro-200 rounded text-xs text-neuro-600">
                          {rule.transformation || 'Aucune'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="neuro" onClick={() => setCurrentStep('analysis')}>
                  <i className="ri-arrow-left-line mr-2"></i>
                  Retour à l'analyse
                </Button>
                <Button variant="primary" onClick={handleProcessFile}>
                  Traiter le fichier
                  <i className="ri-play-line ml-2"></i>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Processing */}
          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="animate-pulse">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <i className="ri-loader-line text-2xl text-primary-600 animate-spin"></i>
                </div>
                <p className="text-lg font-medium text-neuro-900">Traitement des données...</p>
                <p className="text-sm text-neuro-600 mt-2">
                  Nettoyage, validation et insertion en base de données
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Results */}
          {currentStep === 'results' && processingResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`text-center p-6 rounded-xl ${
                processingResult.success ? 'bg-success-50' : 'bg-danger-50'
              }`}>
                <i className={`text-4xl mb-4 ${
                  processingResult.success ? 'ri-check-circle-line text-success-600' : 'ri-error-warning-line text-danger-600'
                }`}></i>
                <h3 className={`text-xl font-semibold mb-2 ${
                  processingResult.success ? 'text-success-900' : 'text-danger-900'
                }`}>
                  {processingResult.success ? 'Traitement réussi !' : 'Erreurs de traitement'}
                </h3>
                <p className={`${
                  processingResult.success ? 'text-success-700' : 'text-danger-700'
                }`}>
                  {processingResult.success 
                    ? `${processingResult.processedRows} lignes ont été traitées et ajoutées à la base.`
                    : 'Des erreurs ont été détectées lors du traitement.'
                  }
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">{processingResult.processedRows}</p>
                  <p className="text-sm text-primary-700">Lignes traitées</p>
                </div>
                <div className="text-center p-4 bg-warning-50 rounded-lg">
                  <p className="text-2xl font-bold text-warning-600">{processingResult.skippedRows}</p>
                  <p className="text-sm text-warning-700">Lignes ignorées</p>
                </div>
                <div className="text-center p-4 bg-danger-50 rounded-lg">
                  <p className="text-2xl font-bold text-danger-600">{processingResult.errors.length}</p>
                  <p className="text-sm text-danger-700">Erreurs</p>
                </div>
                <div className="text-center p-4 bg-success-50 rounded-lg">
                  <p className="text-2xl font-bold text-success-600">{processingResult.insertedData.length}</p>
                  <p className="text-sm text-success-700">Incidents ajoutés</p>
                </div>
              </div>

              {/* Errors */}
              {processingResult.errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-red-800 mb-2">
                    <i className="ri-error-warning-line mr-2"></i>
                    Erreurs détectées
                  </h3>
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="text-sm text-red-700 space-y-1">
                      {processingResult.errors.map((error, index) => (
                        <li key={index} className="font-mono text-xs">• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-3">
                <Button variant="neuro" onClick={() => {
                  setCurrentStep('upload');
                  setSelectedFile(null);
                  setProcessingResult(null);
                }}>
                  <i className="ri-upload-2-line mr-2"></i>
                  Nouveau fichier
                </Button>
                <Button variant="primary" onClick={onClose}>
                  <i className="ri-check-line mr-2"></i>
                  Terminer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}