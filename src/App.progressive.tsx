// App progressif pour identifier le problème
import { useState, useEffect } from 'react';

function App() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testImports = async () => {
      try {
        // Test 1: React Router
        if (step >= 1) {
          addLog('Test 1: Import React Router...');
          await import('react-router-dom');
          addLog('✅ React Router OK');
          setStep(2);
        }

        // Test 2: Framer Motion
        if (step >= 2) {
          addLog('Test 2: Import Framer Motion...');
          await import('framer-motion');
          addLog('✅ Framer Motion OK');
          setStep(3);
        }

        // Test 3: Composants de base
        if (step >= 3) {
          addLog('Test 3: Import composants de base...');
          await import('./components/base/Button');
          await import('./components/base/Card');
          addLog('✅ Composants de base OK');
          setStep(4);
        }

        // Test 4: Contexts
        if (step >= 4) {
          addLog('Test 4: Import contexts...');
          await import('./context/AuthContext');
          await import('./context/ThemeContext');
          addLog('✅ Contexts OK');
          setStep(5);
        }

        // Test 5: Router config
        if (step >= 5) {
          addLog('Test 5: Import router config...');
          await import('./router/config');
          addLog('✅ Router config OK');
          setStep(6);
        }

        // Test 6: Service ML
        if (step >= 6) {
          addLog('Test 6: Import service ML...');
          await import('./services/ml/predictionService');
          addLog('✅ Service ML OK');
          setStep(7);
        }

        // Test 7: Pages principales
        if (step >= 7) {
          addLog('Test 7: Import pages...');
          await import('./pages/dashboard/page');
          await import('./pages/prediction/page');
          addLog('✅ Pages principales OK');
          setStep(8);
        }

        if (step >= 8) {
          addLog('🎉 Tous les imports fonctionnent !');
        }

      } catch (err: any) {
        setError(`❌ Erreur à l'étape ${step}: ${err.message}`);
        addLog(`❌ ERREUR: ${err.message}`);
      }
    };

    testImports();
  }, [step]);

  return (
    <div style={{
      padding: '30px',
      fontFamily: 'monospace',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>
        🔍 Diagnostic des imports seentuDash
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Étape actuelle:</strong> {step}/8
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #f87171',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#fff', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h3>Logs des tests:</h3>
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto', 
          marginTop: '10px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ 
              padding: '2px 0',
              color: log.includes('✅') ? '#059669' : log.includes('❌') ? '#dc2626' : '#374151'
            }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
        <p>Ce test va identifier exactement quel import cause le problème.</p>
        <p>Une fois identifié, nous pourrons le corriger spécifiquement.</p>
      </div>
    </div>
  );
}

export default App;