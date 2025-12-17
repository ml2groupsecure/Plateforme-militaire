import { supabase } from './supabase';
import { DataService } from './csvService';
import { CsvHistoryService } from './csvHistoryService';

export interface DiagnosticResult {
  success: boolean;
  component: string;
  message: string;
  details?: any;
  error?: string;
}

export class SystemDiagnostics {
  
  // Diagnostic complet du système
  static async runFullDiagnostic(): Promise<DiagnosticResult[]> {
    console.log('🔍 DÉBUT DU DIAGNOSTIC SYSTÈME COMPLET');
    const results: DiagnosticResult[] = [];

    // 1. Test connexion Supabase
    results.push(await this.testSupabaseConnection());

    // 2. Test tables existantes
    results.push(await this.testDatabaseTables());

    // 3. Test permissions
    results.push(await this.testDatabasePermissions());

    // 4. Test insertion
    results.push(await this.testDataInsertion());

    // 5. Test services
    results.push(await this.testDataServices());

    // 6. Test variables d'environnement
    results.push(await this.testEnvironmentVariables());

    // 7. Résumé
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`📊 RÉSUMÉ: ${successCount}/${totalCount} tests réussis`);
    
    if (successCount < totalCount) {
      console.error('❌ Des problèmes ont été détectés. Voir les détails ci-dessous:');
      results.filter(r => !r.success).forEach(r => {
        console.error(`  - ${r.component}: ${r.message}`);
      });
    } else {
      console.log('✅ Tous les tests sont passés avec succès !');
    }

    return results;
  }

  // Test 1: Connexion Supabase
  private static async testSupabaseConnection(): Promise<DiagnosticResult> {
    try {
      const { data, error } = await supabase.from('incidents').select('count').limit(1);
      
      if (error) {
        return {
          success: false,
          component: 'Supabase Connection',
          message: 'Impossible de se connecter à Supabase',
          error: error.message,
          details: error
        };
      }

      return {
        success: true,
        component: 'Supabase Connection',
        message: 'Connexion Supabase réussie',
        details: { connected: true }
      };
    } catch (error) {
      return {
        success: false,
        component: 'Supabase Connection',
        message: 'Erreur de connexion Supabase',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Test 2: Tables de base de données
  private static async testDatabaseTables(): Promise<DiagnosticResult> {
    try {
      const tables = ['incidents', 'csv_uploads'];
      const results: Record<string, string> = {};

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
            
          results[table] = error ? `❌ ${error.message}` : '✅ OK';
        } catch (err) {
          results[table] = `❌ ${err}`;
        }
      }

      const allTablesOk = Object.values(results).every(result => result.includes('✅'));

      return {
        success: allTablesOk,
        component: 'Database Tables',
        message: allTablesOk ? 'Toutes les tables sont accessibles' : 'Certaines tables sont inaccessibles',
        details: results
      };
    } catch (error) {
      return {
        success: false,
        component: 'Database Tables',
        message: 'Erreur lors du test des tables',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Test 3: Permissions de base de données
  private static async testDatabasePermissions(): Promise<DiagnosticResult> {
    try {
      const permissions: Record<string, string> = {};

      // Test lecture incidents
      try {
        const { data, error } = await supabase.from('incidents').select('*').limit(1);
        permissions['incidents_read'] = error ? `❌ ${error.message}` : '✅ OK';
      } catch (err) {
        permissions['incidents_read'] = `❌ ${err}`;
      }

      // Test écriture incidents (avec rollback)
      try {
        const testData = {
          type: 'TEST_DIAGNOSTIC',
          location: 'TEST_LOCATION',
          severity: 'low',
          status: 'imported',
          reported_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('incidents')
          .insert([testData])
          .select();

        if (error) {
          permissions['incidents_write'] = `❌ ${error.message}`;
        } else {
          permissions['incidents_write'] = '✅ OK';
          
          // Nettoyer le test
          if (data && data[0]) {
            await supabase.from('incidents').delete().eq('id', data[0].id);
          }
        }
      } catch (err) {
        permissions['incidents_write'] = `❌ ${err}`;
      }

      // Test csv_uploads
      try {
        const { data, error } = await supabase.from('csv_uploads').select('*').limit(1);
        permissions['csv_uploads_read'] = error ? `❌ ${error.message}` : '✅ OK';
      } catch (err) {
        permissions['csv_uploads_read'] = `❌ ${err}`;
      }

      const allPermissionsOk = Object.values(permissions).every(result => result.includes('✅'));

      return {
        success: allPermissionsOk,
        component: 'Database Permissions',
        message: allPermissionsOk ? 'Toutes les permissions sont OK' : 'Problèmes de permissions détectés',
        details: permissions
      };
    } catch (error) {
      return {
        success: false,
        component: 'Database Permissions',
        message: 'Erreur lors du test des permissions',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Test 4: Insertion de données
  private static async testDataInsertion(): Promise<DiagnosticResult> {
    try {
      const testData = {
        type: 'TEST_DIAGNOSTIC_INSERTION',
        location: 'TEST_LOCATION',
        severity: 'low' as const,
        status: 'imported' as const,
        reported_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: 'Test d\'insertion pour diagnostic'
      };

      // Insertion
      const { data, error } = await supabase
        .from('incidents')
        .insert([testData])
        .select();

      if (error) {
        return {
          success: false,
          component: 'Data Insertion',
          message: 'Échec de l\'insertion de test',
          error: error.message,
          details: error
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          component: 'Data Insertion',
          message: 'Insertion réussie mais aucune donnée retournée',
          details: { data }
        };
      }

      // Nettoyage
      await supabase.from('incidents').delete().eq('id', data[0].id);

      return {
        success: true,
        component: 'Data Insertion',
        message: 'Insertion et suppression de test réussies',
        details: { inserted_id: data[0].id }
      };

    } catch (error) {
      return {
        success: false,
        component: 'Data Insertion',
        message: 'Erreur lors du test d\'insertion',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Test 5: Services de données
  private static async testDataServices(): Promise<DiagnosticResult> {
    try {
      const services: Record<string, string> = {};

      // Test DataService
      try {
        const incidents = await DataService.getIncidents(5);
        services['DataService.getIncidents'] = `✅ ${incidents.length} incidents récupérés`;
      } catch (err) {
        services['DataService.getIncidents'] = `❌ ${err}`;
      }

      // Test CsvHistoryService
      try {
        const history = await CsvHistoryService.getUploadHistory(5);
        services['CsvHistoryService.getUploadHistory'] = `✅ ${history.length} uploads récupérés`;
      } catch (err) {
        services['CsvHistoryService.getUploadHistory'] = `❌ ${err}`;
      }

      // Test statistiques
      try {
        const stats = await DataService.getIncidentStats();
        services['DataService.getIncidentStats'] = `✅ Stats: ${stats.total} incidents total`;
      } catch (err) {
        services['DataService.getIncidentStats'] = `❌ ${err}`;
      }

      const allServicesOk = Object.values(services).every(result => result.includes('✅'));

      return {
        success: allServicesOk,
        component: 'Data Services',
        message: allServicesOk ? 'Tous les services fonctionnent' : 'Problèmes détectés dans les services',
        details: services
      };
    } catch (error) {
      return {
        success: false,
        component: 'Data Services',
        message: 'Erreur lors du test des services',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Test 6: Variables d'environnement
  private static async testEnvironmentVariables(): Promise<DiagnosticResult> {
    try {
      const envVars = {
        VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      };

      const allEnvVarsPresent = Object.values(envVars).every(present => present);

      return {
        success: allEnvVarsPresent,
        component: 'Environment Variables',
        message: allEnvVarsPresent ? 'Variables d\'environnement OK' : 'Variables d\'environnement manquantes',
        details: envVars
      };
    } catch (error) {
      return {
        success: false,
        component: 'Environment Variables',
        message: 'Erreur lors du test des variables d\'environnement',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Diagnostic rapide pour CSV
  static async quickCSVDiagnostic(): Promise<DiagnosticResult> {
    console.log('🔍 DIAGNOSTIC RAPIDE CSV');

    try {
      // Test simple d'insertion CSV
      const testCSVData = {
        type: 'TEST_CSV',
        location: 'TEST_LOCATION',
        severity: 'low',
        status: 'imported',
        reported_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert([testCSVData])
        .select();

      if (error) {
        return {
          success: false,
          component: 'CSV Import',
          message: 'Problème détecté avec l\'import CSV',
          error: error.message,
          details: {
            error_code: error.code,
            error_hint: error.hint,
            error_details: error.details
          }
        };
      }

      // Nettoyer
      if (data && data[0]) {
        await supabase.from('incidents').delete().eq('id', data[0].id);
      }

      return {
        success: true,
        component: 'CSV Import',
        message: 'Import CSV fonctionnel',
        details: { test_passed: true }
      };

    } catch (error) {
      return {
        success: false,
        component: 'CSV Import',
        message: 'Erreur lors du diagnostic CSV',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Créer les tables manquantes
  static async createMissingTables(): Promise<DiagnosticResult[]> {
    console.log('🔧 CRÉATION DES TABLES MANQUANTES');
    const results: DiagnosticResult[] = [];

    // Cette fonction nécessiterait des permissions admin
    // Pour l'instant, on retourne les instructions SQL
    const sqlInstructions = {
      incidents: `
        CREATE TABLE IF NOT EXISTS incidents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          type TEXT NOT NULL,
          description TEXT,
          location TEXT NOT NULL,
          latitude DECIMAL,
          longitude DECIMAL,
          severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
          status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'imported')) DEFAULT 'open',
          reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          resolved_at TIMESTAMPTZ,
          assigned_agent_id UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
      csv_uploads: `
        CREATE TABLE IF NOT EXISTS csv_uploads (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          filename TEXT NOT NULL,
          file_size INTEGER,
          total_rows INTEGER DEFAULT 0,
          processed_rows INTEGER DEFAULT 0,
          error_rows INTEGER DEFAULT 0,
          upload_date TIMESTAMPTZ DEFAULT NOW(),
          uploaded_by TEXT,
          processing_status TEXT CHECK (processing_status IN ('pending', 'success', 'error', 'partial')) DEFAULT 'pending',
          quality_score DECIMAL,
          error_details JSONB,
          mapping_rules JSONB,
          processing_time_ms INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    };

    results.push({
      success: true,
      component: 'SQL Instructions',
      message: 'Instructions SQL pour créer les tables',
      details: sqlInstructions
    });

    return results;
  }
}

// Fonction utilitaire pour exécuter un diagnostic depuis la console
export const runDiagnostic = () => {
  return SystemDiagnostics.runFullDiagnostic();
};

// Fonction utilitaire pour diagnostic CSV rapide
export const checkCSV = () => {
  return SystemDiagnostics.quickCSVDiagnostic();
};