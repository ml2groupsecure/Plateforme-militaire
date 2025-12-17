// Système intelligent de traitement CSV avec mapping automatique
import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from './supabase';
import { CsvHistoryService } from './csvHistoryService';

export interface CsvColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'coordinates' | 'category';
  examples: string[];
  confidence: number;
  suggestedMapping?: string;
}

export interface CsvAnalysis {
  totalRows: number;
  columns: CsvColumn[];
  preview: any[];
  encoding: string;
  delimiter: string;
  hasHeaders: boolean;
  qualityScore: number;
  issues: string[];
}

export interface MappingRule {
  csvColumn: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  validator?: (value: any) => boolean;
}

export interface ProcessingResult {
  success: boolean;
  processedRows: number;
  errors: string[];
  warnings: string[];
  insertedData: any[];
  skippedRows: number;
}

export class SmartCsvProcessor {
  private static readonly CRIME_FIELDS = {
    // Champs obligatoires
    incident_type: { required: true, aliases: ['type', 'crime_type', 'incident', 'nature', 'delit'] },
    location: { required: true, aliases: ['lieu', 'zone', 'quartier', 'address', 'adresse', 'position'] },
    date_occurred: { required: true, aliases: ['date', 'time', 'datetime', 'timestamp', 'heure', 'moment'] },
    
    // Champs optionnels
    description: { required: false, aliases: ['detail', 'commentaire', 'note', 'description', 'details'] },
    status: { required: false, aliases: ['statut', 'etat', 'state', 'situation'] },
    severity: { required: false, aliases: ['gravite', 'priorite', 'level', 'niveau', 'importance'] },
    latitude: { required: false, aliases: ['lat', 'y', 'coord_y'] },
    longitude: { required: false, aliases: ['lng', 'lon', 'x', 'coord_x'] },
    agent_name: { required: false, aliases: ['agent', 'officier', 'responsable', 'enqueteur'] },
    victim_count: { required: false, aliases: ['victimes', 'nb_victimes', 'victims'] },
    suspect_description: { required: false, aliases: ['suspect', 'auteur', 'prevenu'] }
  };

  // Analyse intelligente du fichier CSV
  static async analyzeCSV(file: File): Promise<CsvAnalysis> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const analysis = this.performAnalysis(text);
          resolve(analysis);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  private static performAnalysis(csvText: string): CsvAnalysis {
    // Détection du délimiteur
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxColumns = 0;

    for (const delimiter of delimiters) {
      const lines = csvText.split('\n').slice(0, 5);
      const avgColumns = lines.reduce((sum, line) => {
        return sum + line.split(delimiter).length;
      }, 0) / lines.length;

      if (avgColumns > maxColumns) {
        maxColumns = avgColumns;
        bestDelimiter = delimiter;
      }
    }

    // Parsing des lignes
    const lines = csvText.trim().split('\n');
    const hasHeaders = this.detectHeaders(lines[0], bestDelimiter);
    const headerRow = hasHeaders ? lines[0].split(bestDelimiter) : null;
    const dataStartIndex = hasHeaders ? 1 : 0;
    
    // Analyse des colonnes
    const columns: CsvColumn[] = [];
    const columnCount = lines[0].split(bestDelimiter).length;
    
    for (let i = 0; i < columnCount; i++) {
      const columnName = headerRow ? headerRow[i].trim().replace(/['"]/g, '') : `Colonne_${i + 1}`;
      const columnData = lines.slice(dataStartIndex, Math.min(dataStartIndex + 10, lines.length))
        .map(line => line.split(bestDelimiter)[i])
        .filter(value => value && value.trim());
      
      const column = this.analyzeColumn(columnName, columnData);
      columns.push(column);
    }

    // Génération des données d'aperçu
    const preview = lines.slice(dataStartIndex, Math.min(dataStartIndex + 5, lines.length))
      .map(line => {
        const values = line.split(bestDelimiter);
        const row: any = {};
        columns.forEach((col, index) => {
          row[col.name] = values[index] || '';
        });
        return row;
      });

    // Calcul du score de qualité
    const qualityScore = this.calculateQualityScore(columns, lines.length - dataStartIndex);
    
    // Détection des problèmes
    const issues = this.detectIssues(columns, lines);

    return {
      totalRows: lines.length - dataStartIndex,
      columns,
      preview,
      encoding: 'UTF-8',
      delimiter: bestDelimiter,
      hasHeaders,
      qualityScore,
      issues
    };
  }

  private static detectHeaders(firstLine: string, delimiter: string): boolean {
    const values = firstLine.split(delimiter);
    
    // Si plus de 50% des valeurs contiennent des lettres et pas que des chiffres
    const textCount = values.filter(value => 
      /[a-zA-Z]/.test(value) && !/^\d+$/.test(value.trim())
    ).length;
    
    return textCount / values.length > 0.5;
  }

  private static analyzeColumn(name: string, data: string[]): CsvColumn {
    if (data.length === 0) {
      return {
        name,
        type: 'string',
        examples: [],
        confidence: 0,
        suggestedMapping: undefined
      };
    }

    // Analyse du type de données
    let type: CsvColumn['type'] = 'string';
    let confidence = 0;

    // Test pour les nombres
    const numberCount = data.filter(value => !isNaN(Number(value))).length;
    if (numberCount / data.length > 0.8) {
      type = 'number';
      confidence = 0.8;
    }

    // Test pour les dates
    const dateCount = data.filter(value => !isNaN(Date.parse(value))).length;
    if (dateCount / data.length > 0.6) {
      type = 'date';
      confidence = 0.9;
    }

    // Test pour les coordonnées
    const coordPattern = /^-?\d+\.\d+$/;
    const coordCount = data.filter(value => coordPattern.test(value)).length;
    if (coordCount / data.length > 0.7) {
      type = 'coordinates';
      confidence = 0.85;
    }

    // Suggestion de mapping basée sur le nom de la colonne
    const suggestedMapping = this.suggestMapping(name.toLowerCase());

    return {
      name,
      type,
      examples: data.slice(0, 3),
      confidence,
      suggestedMapping
    };
  }

  private static suggestMapping(columnName: string): string | undefined {
    for (const [field, config] of Object.entries(this.CRIME_FIELDS)) {
      if (config.aliases.some(alias => columnName.includes(alias.toLowerCase()))) {
        return field;
      }
    }
    return undefined;
  }

  private static calculateQualityScore(columns: CsvColumn[], totalRows: number): number {
    let score = 100;
    
    // Pénalité pour les colonnes sans mapping
    const unmappedColumns = columns.filter(col => !col.suggestedMapping).length;
    score -= (unmappedColumns / columns.length) * 30;
    
    // Pénalité pour les colonnes avec faible confiance
    const lowConfidenceColumns = columns.filter(col => col.confidence < 0.5).length;
    score -= (lowConfidenceColumns / columns.length) * 20;
    
    // Bonus pour les champs obligatoires identifiés
    const requiredFields = Object.entries(this.CRIME_FIELDS)
      .filter(([_, config]) => config.required);
    const foundRequiredFields = columns.filter(col => 
      requiredFields.some(([field]) => col.suggestedMapping === field)
    ).length;
    score += (foundRequiredFields / requiredFields.length) * 20;

    return Math.max(0, Math.min(100, score));
  }

  private static detectIssues(columns: CsvColumn[], lines: string[]): string[] {
    const issues: string[] = [];
    
    // Vérification des champs obligatoires manquants
    const requiredFields = Object.entries(this.CRIME_FIELDS)
      .filter(([_, config]) => config.required)
      .map(([field]) => field);
    
    const mappedFields = columns
      .map(col => col.suggestedMapping)
      .filter(mapping => mapping);
    
    const missingRequired = requiredFields.filter(field => 
      !mappedFields.includes(field)
    );
    
    if (missingRequired.length > 0) {
      issues.push(`Champs obligatoires manquants: ${missingRequired.join(', ')}`);
    }

    // Vérification de la qualité des données
    if (lines.length < 10) {
      issues.push('Très peu de données (moins de 10 lignes)');
    }

    // Vérification des colonnes vides
    const emptyColumns = columns.filter(col => col.examples.length === 0);
    if (emptyColumns.length > 0) {
      issues.push(`${emptyColumns.length} colonne(s) vide(s) détectée(s)`);
    }

    return issues;
  }

  // Génération automatique des règles de mapping
  static generateMappingRules(analysis: CsvAnalysis): MappingRule[] {
    // IMPORTANT: on inclut toutes les colonnes pour permettre le mapping manuel,
    // sinon l'utilisateur ne peut pas mapper les champs requis si la détection échoue.
    return analysis.columns.map((column) => {
      const targetField = column.suggestedMapping || '';
      const fieldConfig = targetField
        ? this.CRIME_FIELDS[targetField as keyof typeof this.CRIME_FIELDS]
        : null;

      return {
        csvColumn: column.name,
        targetField,
        transformation: targetField ? this.getTransformation(column.type, targetField) : undefined,
        required: fieldConfig?.required || false,
        validator: targetField ? this.getValidator(targetField) : undefined
      };
    });
  }

  private static getTransformation(columnType: string, targetField: string): string | undefined {
    // Pour les champs cibles, on priorise des transformations fixes.
    if (targetField === 'date_occurred') return 'parseDate';
    if (targetField === 'latitude' || targetField === 'longitude') return 'parseFloat';
    if (targetField === 'victim_count') return 'parseInt';

    const transformations: Record<string, Record<string, string>> = {
      date: {
        date_occurred: 'parseDate'
      },
      coordinates: {
        latitude: 'parseFloat',
        longitude: 'parseFloat'
      },
      number: {
        victim_count: 'parseInt'
      }
    };

    return transformations[columnType]?.[targetField];
  }

  private static getValidator(targetField: string): ((value: any) => boolean) | undefined {
    const validators: Record<string, (value: any) => boolean> = {
      'latitude': (value) => !isNaN(value) && value >= -90 && value <= 90,
      'longitude': (value) => !isNaN(value) && value >= -180 && value <= 180,
      'date_occurred': (value) => !isNaN(Date.parse(value)),
      'victim_count': (value) => !isNaN(value) && value >= 0
    };
    
    return validators[targetField];
  }

  // Traitement et nettoyage des données
  static async processCSV(
    file: File,
    mappingRules: MappingRule[],
    analysis: CsvAnalysis
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      const csvText = await this.readFileAsText(file);

      const processedData: any[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];
      let skippedRows = 0;

      // Validation des champs requis avant traitement
      const requiredTargets = ['incident_type', 'location', 'date_occurred'];
      const mappedTargets = new Set(mappingRules.map(r => r.targetField).filter(Boolean));
      const missingTargets = requiredTargets.filter(t => !mappedTargets.has(t));
      if (missingTargets.length > 0) {
        return {
          success: false,
          processedRows: 0,
          errors: [`Champs obligatoires non mappés: ${missingTargets.join(', ')}`],
          warnings: [],
          insertedData: [],
          skippedRows: analysis.totalRows
        };
      }

      // Parsing robuste (gère les champs entre guillemets, délimiteurs dans le texte, etc.)
      const parseResult = Papa.parse(csvText, {
        delimiter: analysis.delimiter,
        header: analysis.hasHeaders,
        skipEmptyLines: true,
        // Pour matcher la logique de performAnalysis()
        transformHeader: (h) => (h || '').trim().replace(/["']/g, ''),
      });

      if (parseResult.errors?.length) {
        // On remonte quelques erreurs, mais on tente quand même de traiter
        warnings.push(
          ...parseResult.errors.slice(0, 5).map(e => `Parsing: ${e.message} (ligne ${e.row})`)
        );
      }

      const rows = (parseResult.data || []) as any[];

      for (let i = 0; i < rows.length; i++) {
        try {
          const rowValues = analysis.hasHeaders
            ? analysis.columns.map(col => (rows[i]?.[col.name] ?? '').toString())
            : (Array.isArray(rows[i]) ? rows[i].map(v => (v ?? '').toString()) : []);

          const processedRow = await this.processRow(
            rowValues,
            mappingRules,
            analysis.columns,
            // ligne lisible: +1 si headers, sinon index+1
            analysis.hasHeaders ? i + 2 : i + 1
          );

          if (processedRow) {
            processedData.push(processedRow);
          } else {
            skippedRows++;
          }
        } catch (error) {
          errors.push(`Ligne ${analysis.hasHeaders ? i + 2 : i + 1}: ${error}`);
          skippedRows++;
        }
      }

      // Insertion en base de données
      const insertResult = await this.insertData(processedData);

      if (insertResult.error) {
        errors.push(`Erreur insertion base de données: ${insertResult.error.message}`);
        console.error('❌ Échec insertion:', insertResult.error);
      }

      const processingTime = Date.now() - startTime;
      const actuallyInserted = insertResult.data || [];

      // IMPORTANT: on considère "success" dès qu'au moins 1 ligne est insérée.
      // Les erreurs restent affichées (import partiel).
      const result: ProcessingResult = {
        success: actuallyInserted.length > 0,
        processedRows: processedData.length,
        errors,
        warnings,
        insertedData: actuallyInserted,
        skippedRows: skippedRows + Math.max(0, processedData.length - actuallyInserted.length)
      };

      // Enregistrer dans l'historique
      try {
        await CsvHistoryService.recordUpload({
          filename: file.name,
          file_size: file.size,
          total_rows: analysis.totalRows,
          processed_rows: actuallyInserted.length,
          error_rows: result.skippedRows,
          quality_score: analysis.qualityScore,
          error_details: (errors.length > 0 || warnings.length > 0) ? { errors, warnings } : null,
          mapping_rules: mappingRules,
          processing_time_ms: processingTime,
          uploaded_by: 'Utilisateur' // TODO: brancher sur l'auth
        });
        console.log('✅ Historique CSV enregistré');
      } catch (historyError) {
        console.error('⚠️ Erreur enregistrement historique:', historyError);
        warnings.push("Impossible d'enregistrer dans l'historique");
      }

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ ERREUR GÉNÉRALE de traitement CSV:', error);

      const result: ProcessingResult = {
        success: false,
        processedRows: 0,
        errors: [`Erreur générale: ${error instanceof Error ? error.message : error}`],
        warnings: [],
        insertedData: [],
        skippedRows: analysis?.totalRows || 0
      };

      // Enregistrer même les erreurs dans l'historique
      try {
        await CsvHistoryService.recordUpload({
          filename: file.name,
          file_size: file.size,
          total_rows: analysis?.totalRows || 0,
          processed_rows: 0,
          error_rows: analysis?.totalRows || 1,
          quality_score: 0,
          error_details: { errors: [String(error)] },
          mapping_rules: mappingRules,
          processing_time_ms: processingTime,
          uploaded_by: 'Utilisateur'
        });
      } catch {
        // ignore
      }

      return result;
    }
  }

  private static async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  private static async processRow(
    row: string[],
    mappingRules: MappingRule[],
    columns: CsvColumn[],
    lineNumber: number
  ): Promise<any | null> {
    // Conserver des champs compatibles DB (voir GUIDE_SUPABASE_SETUP.md)
    // Table incidents: incident_type, location, date_occurred, ...
    const processedRow: any = {
      status: 'imported'
    };

    let hasRequiredFields = true;

    const requiredTargets = new Set(['incident_type', 'location', 'date_occurred']);

    for (const rule of mappingRules) {
      const columnIndex = columns.findIndex(col => col.name === rule.csvColumn);
      if (columnIndex === -1) continue;

      // Si aucune cible choisie, ignorer
      if (!rule.targetField) continue;

      let value = row[columnIndex]?.trim();

      const isRequired = rule.required || requiredTargets.has(rule.targetField);

      if (!value && isRequired) {
        hasRequiredFields = false;
        continue;
      }

      if (value) {
        const column = columns[columnIndex];
        const effectiveTransformation = rule.transformation || this.getTransformation(column.type, rule.targetField);
        const effectiveValidator = rule.validator || this.getValidator(rule.targetField);

        // Application des transformations
        value = this.applyTransformation(value, effectiveTransformation);

        // Validation
        if (effectiveValidator && !effectiveValidator(value)) {
          throw new Error(`Valeur invalide pour ${rule.targetField}: ${value}`);
        }

        processedRow[rule.targetField] = value;
      }
    }

    return hasRequiredFields ? processedRow : null;
  }

  private static applyTransformation(value: string, transformation?: string): any {
    if (!transformation) return value;

    switch (transformation) {
      case 'parseDate':
        return this.parseDateSmart(value);
      case 'parseFloat':
        return parseFloat(value);
      case 'parseInt':
        return parseInt(value);
      default:
        return value;
    }
  }

  // Parse date tolérant (ex: 2024-10-03, 03/10/2024, 03-10-2024)
  private static parseDateSmart(value: string): string {
    const raw = String(value).trim();

    // ISO / parse natif
    const d1 = new Date(raw);
    if (!isNaN(d1.getTime())) return d1.toISOString();

    // dd/mm/yyyy ou dd-mm-yyyy
    const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (m) {
      const dd = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      let yy = parseInt(m[3], 10);
      if (yy < 100) yy += 2000;
      const hh = m[4] ? parseInt(m[4], 10) : 0;
      const mi = m[5] ? parseInt(m[5], 10) : 0;
      const ss = m[6] ? parseInt(m[6], 10) : 0;

      const d2 = new Date(Date.UTC(yy, mm - 1, dd, hh, mi, ss));
      if (!isNaN(d2.getTime())) return d2.toISOString();
    }

    // Dernier recours: renvoyer tel quel
    return raw;
  }

  private static async insertData(data: any[]): Promise<any> {
    if (data.length === 0) return { data: [], error: null };

    try {
      console.log('📝 Insertion de', data.length, 'incidents...');
      
      // Nettoyer les données avant insertion (schéma Supabase)
      // incidents(
      //   incident_type TEXT NOT NULL,
      //   location TEXT NOT NULL,
      //   date_occurred TIMESTAMPTZ NOT NULL,
      //   ...
      // )
      const cleanedData = data.map((item) => {
        const incidentType = item.incident_type || item.type || item.crime_type || 'Incident';
        const location = item.location || item.zone || item.address || 'Non spécifié';
        const dateOccurred = item.date_occurred || item.reported_at || item.created_at || new Date().toISOString();

        return {
          incident_type: incidentType,
          location,
          date_occurred: dateOccurred,
          description: item.description || null,
          status: item.status || 'imported',
          severity: item.severity || null,
          latitude: item.latitude != null && item.latitude !== '' ? Number(item.latitude) : null,
          longitude: item.longitude != null && item.longitude !== '' ? Number(item.longitude) : null,
          agent_name: item.agent_name || null,
          victim_count: item.victim_count != null && item.victim_count !== '' ? Number(item.victim_count) : 0,
          suspect_description: item.suspect_description || null,
          source: item.source || 'csv_import'
        };
      });

      const { data: insertedData, error } = await supabase
        .from('incidents')
        .insert(cleanedData)
        .select();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw new Error(`Erreur d'insertion en base: ${error.message}`);
      }

      console.log('✅ Incidents insérés avec succès:', insertedData?.length || 0);
      return { data: insertedData, error: null };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      return { data: [], error };
    }
  }

  // Génération de rapport de traitement
  static generateProcessingReport(result: ProcessingResult): string {
    const report = `
RAPPORT DE TRAITEMENT CSV
========================

✅ Traitement terminé avec succès: ${result.success ? 'OUI' : 'NON'}
📊 Lignes traitées: ${result.processedRows}
⚠️  Lignes ignorées: ${result.skippedRows}
🔍 Erreurs détectées: ${result.errors.length}
⚡ Avertissements: ${result.warnings.length}

ERREURS DÉTECTÉES:
${result.errors.map(error => `- ${error}`).join('\n')}

AVERTISSEMENTS:
${result.warnings.map(warning => `- ${warning}`).join('\n')}

DONNÉES INSÉRÉES:
${result.insertedData.length} incidents criminels ont été ajoutés à la base de données.

Date de traitement: ${new Date().toLocaleString('fr-FR')}
    `.trim();

    return report;
  }
}

// Hook React pour utiliser le processeur CSV intelligent
export const useSmartCSV = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null);
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([]);

  const analyzeFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const analysisResult = await SmartCsvProcessor.analyzeCSV(file);
      setAnalysis(analysisResult);
      
      const autoRules = SmartCsvProcessor.generateMappingRules(analysisResult);
      setMappingRules(autoRules);
      
      return analysisResult;
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const processFile = async (file: File, customRules?: MappingRule[]) => {
    if (!analysis) throw new Error('Analyse requise avant traitement');
    
    setIsProcessing(true);
    try {
      const rules = customRules || mappingRules;
      const result = await SmartCsvProcessor.processCSV(file, rules, analysis);
      return result;
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    analyzeFile,
    processFile,
    analysis,
    mappingRules,
    setMappingRules,
    isProcessing
  };
};