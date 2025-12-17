/**
 * Composant de diagnostic pour identifier les problèmes
 */

import { useState, useEffect } from 'react';

const DiagnosticTest = () => {
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Initialisation...');

  useEffect(() => {
    const runDiagnostic = async () => {
      const errorList: string[] = [];
      
      try {
        // Test 1: Import du service ML
        setStatus('Test des imports...');
        const { usePredictionService } = await import('../services/ml/predictionService');
        
        // Test 2: Utilisation du service
        setStatus('Test du service ML...');
        const { getFieldOptions } = usePredictionService();
        const options = getFieldOptions();
        
        if (!options.regions || options.regions.length === 0) {
          errorList.push('Options de régions manquantes');
        }
        
        setStatus('✅ Diagnostic terminé');
        
      } catch (error) {
        errorList.push(`Erreur import/service: ${error.message}`);
        setStatus('❌ Erreurs détectées');
      }
      
      setErrors(errorList);
    };

    runDiagnostic();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '2px solid #e2e8f0', 
      borderRadius: '8px',
      backgroundColor: '#f8fafc'
    }}>
      <h2 style={{ color: '#1e293b', marginBottom: '16px' }}>
        🔍 Diagnostic seentuDash
      </h2>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Status:</strong> {status}
      </div>
      
      <div>
        <strong>Erreurs détectées:</strong>
        {errors.length === 0 ? (
          <div style={{ color: '#059669' }}>✅ Aucune erreur</div>
        ) : (
          <ul style={{ color: '#dc2626', marginTop: '8px' }}>
            {errors.map((error, index) => (
              <li key={index}>❌ {error}</li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
        <p>Routes disponibles:</p>
        <ul>
          <li>http://localhost:3001/ (redirect vers dashboard)</li>
          <li>http://localhost:3001/dashboard</li>
          <li>http://localhost:3001/predictions (page ML)</li>
          <li>http://localhost:3001/login</li>
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticTest;