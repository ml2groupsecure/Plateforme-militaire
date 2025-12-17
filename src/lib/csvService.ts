import { supabase } from './supabase';
import Papa from 'papaparse';

export interface CSVData {
  headers: string[];
  rows: any[][];
  summary: {
    totalRows: number;
    duplicates: number;
    missingValues: number;
    cleanRows: number;
  };
  metadata: {
    filename: string;
    size: number;
    uploadDate: string;
  };
}

export interface ProcessedIncident {
  id?: string;
  type: string;
  description?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reported_at: string;
  resolved_at?: string;
  assigned_agent_id?: string;
}

// Fonction de nettoyage et normalisation des données
export class CSVProcessor {
  
  static async processFile(file: File, userId: string): Promise<CSVData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
        complete: async (results) => {
          try {
            const processedData = await CSVProcessor.cleanAndValidateData(results.data as any[], file);
            
            // Sauvegarder dans Supabase
            await CSVProcessor.saveToSupabase(processedData, userId);
            
            resolve(processedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  private static async cleanAndValidateData(rawData: any[], file: File): Promise<CSVData> {
    const headers = Object.keys(rawData[0] || {});
    const cleanRows: any[][] = [];
    const duplicateSet = new Set<string>();
    let duplicatesCount = 0;
    let missingValuesCount = 0;

    for (const row of rawData) {
      const rowValues = headers.map(header => {
        let value = row[header];
        
        // Nettoyer les valeurs vides
        if (value === null || value === undefined || value === '') {
          missingValuesCount++;
          return null;
        }
        
        // Nettoyer les chaînes
        if (typeof value === 'string') {
          value = value.trim();
        }
        
        // Détecter et convertir les nombres
        if (typeof value === 'string' && !isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
          return parseFloat(value);
        }
        
        // Détecter et convertir les dates
        if (typeof value === 'string' && CSVProcessor.isDate(value)) {
          return new Date(value).toISOString();
        }
        
        // Normaliser les valeurs de gravité
        if (headers.includes('severity') || headers.includes('gravite') || headers.includes('niveau')) {
          value = CSVProcessor.normalizeSeverity(value);
        }
        
        // Normaliser les statuts
        if (headers.includes('status') || headers.includes('statut') || headers.includes('etat')) {
          value = CSVProcessor.normalizeStatus(value);
        }
        
        return value;
      });

      // Vérifier les doublons
      const rowKey = rowValues.join('|');
      if (duplicateSet.has(rowKey)) {
        duplicatesCount++;
        continue;
      }
      
      duplicateSet.add(rowKey);
      cleanRows.push(rowValues);
    }

    return {
      headers,
      rows: cleanRows,
      summary: {
        totalRows: rawData.length,
        duplicates: duplicatesCount,
        missingValues: missingValuesCount,
        cleanRows: cleanRows.length
      },
      metadata: {
        filename: file.name,
        size: file.size,
        uploadDate: new Date().toISOString()
      }
    };
  }

  private static isDate(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  private static normalizeSeverity(value: any): 'low' | 'medium' | 'high' | 'critical' {
    if (typeof value === 'number') {
      if (value <= 2) return 'low';
      if (value <= 3) return 'medium';
      if (value <= 4) return 'high';
      return 'critical';
    }
    
    const str = String(value).toLowerCase();
    if (str.includes('faible') || str.includes('low') || str.includes('bas')) return 'low';
    if (str.includes('moyen') || str.includes('medium') || str.includes('moderate')) return 'medium';
    if (str.includes('élevé') || str.includes('eleve') || str.includes('high') || str.includes('haut')) return 'high';
    if (str.includes('critique') || str.includes('critical') || str.includes('urgent')) return 'critical';
    
    return 'medium'; // Par défaut
  }

  private static normalizeStatus(value: any): 'open' | 'investigating' | 'resolved' | 'closed' {
    const str = String(value).toLowerCase();
    if (str.includes('ouvert') || str.includes('open') || str.includes('nouveau')) return 'open';
    if (str.includes('enquete') || str.includes('investigating') || str.includes('en cours')) return 'investigating';
    if (str.includes('resolu') || str.includes('resolved') || str.includes('ferme')) return 'resolved';
    if (str.includes('classe') || str.includes('closed') || str.includes('termine')) return 'closed';
    
    return 'open'; // Par défaut
  }

  // Sauvegarder les données traitées dans Supabase
  private static async saveToSupabase(csvData: CSVData, userId: string): Promise<void> {
    try {
      // 1. Sauvegarder l'enregistrement de l'upload
      const { data: uploadRecord, error: uploadError } = await supabase
        .from('csv_uploads')
        .insert({
          filename: csvData.metadata.filename,
          original_rows: csvData.summary.totalRows,
          processed_rows: csvData.summary.cleanRows,
          duplicates_removed: csvData.summary.duplicates,
          errors_count: csvData.summary.missingValues,
          upload_date: csvData.metadata.uploadDate,
          uploaded_by: userId,
          status: 'processed'
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      // 2. Convertir et sauvegarder les incidents
      const incidents = CSVProcessor.convertToIncidents(csvData);
      
      if (incidents.length > 0) {
        const { error: incidentsError } = await supabase
          .from('incidents')
          .insert(incidents);

        if (incidentsError) throw incidentsError;
      }

      console.log(`✅ ${incidents.length} incidents sauvegardés avec succès`);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  // Convertir les données CSV en format incident
  private static convertToIncidents(csvData: CSVData): ProcessedIncident[] {
    const incidents: ProcessedIncident[] = [];
    
    csvData.rows.forEach(row => {
      try {
        const incident: ProcessedIncident = {
          type: CSVProcessor.getColumnValue(row, csvData.headers, ['type', 'crime_type', 'incident_type']) || 'Incident',
          description: CSVProcessor.getColumnValue(row, csvData.headers, ['description', 'details', 'notes']),
          location: CSVProcessor.getColumnValue(row, csvData.headers, ['location', 'lieu', 'zone', 'address']) || 'Non spécifié',
          latitude: CSVProcessor.getColumnValue(row, csvData.headers, ['latitude', 'lat', 'coord_lat']),
          longitude: CSVProcessor.getColumnValue(row, csvData.headers, ['longitude', 'lng', 'lon', 'coord_lng']),
          severity: CSVProcessor.getColumnValue(row, csvData.headers, ['severity', 'gravite', 'niveau']) || 'medium',
          status: CSVProcessor.getColumnValue(row, csvData.headers, ['status', 'statut', 'etat']) || 'open',
          reported_at: CSVProcessor.getColumnValue(row, csvData.headers, ['date', 'reported_at', 'created_at', 'timestamp']) || new Date().toISOString(),
          resolved_at: CSVProcessor.getColumnValue(row, csvData.headers, ['resolved_at', 'closed_at', 'date_resolution']),
        };
        
        incidents.push(incident);
      } catch (error) {
        console.warn('⚠️  Erreur lors de la conversion d\'une ligne:', error);
      }
    });
    
    return incidents;
  }

  private static getColumnValue(row: any[], headers: string[], possibleNames: string[]): any {
    for (const name of possibleNames) {
      const index = headers.findIndex(header => header.includes(name) || name.includes(header));
      if (index !== -1 && row[index] !== null && row[index] !== undefined) {
        return row[index];
      }
    }
    return null;
  }
}

// Fonctions pour récupérer les données depuis Supabase
export class DataService {
  
  static async getIncidents(limit = 100) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Normaliser pour compatibilité UI (beaucoup d'écrans attendent `type`)
    return (data || []).map((row: any) => ({
      ...row,
      type: row.type ?? row.incident_type,
      reported_at: row.reported_at ?? row.date_occurred,
    }));
  }

  static async getIncidentsByLocation(location: string) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .ilike('location', `%${location}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getIncidentStats() {
    const { data, error } = await supabase
      .from('incidents')
      .select('severity, status, incident_type, created_at');

    if (error) throw error;
    
    // Calculer les statistiques
    const stats = {
      total: data.length,
      bySeverity: data.reduce((acc: any, incident: any) => {
        acc[incident.severity] = (acc[incident.severity] || 0) + 1;
        return acc;
      }, {}),
      byStatus: data.reduce((acc: any, incident: any) => {
        acc[incident.status] = (acc[incident.status] || 0) + 1;
        return acc;
      }, {}),
      byType: data.reduce((acc: any, incident: any) => {
        const t = incident.incident_type || 'Non spécifié';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {}),
      recent: data.filter((incident: any) => {
        const date = new Date(incident.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length
    };

    return stats;
  }
}