import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface CsvUploadHistory {
  id: string;
  filename: string;
  file_size: number;
  total_rows: number;
  processed_rows: number;
  error_rows: number;
  upload_date: string;
  uploaded_by?: string;
  processing_status: 'pending' | 'success' | 'error' | 'partial';
  quality_score?: number;
  error_details?: any;
  mapping_rules?: any;
  processing_time_ms?: number;
  created_at: string;
}

export interface CsvStats {
  totalUploads: number;
  totalRowsProcessed: number;
  successRate: number;
  averageQualityScore: number;
  recentUploads: CsvUploadHistory[];
  lastUploadDate?: string;
}

export class CsvHistoryService {
  // Enregistrer un nouvel upload CSV
  static async recordUpload(uploadData: {
    filename: string;
    file_size: number;
    total_rows: number;
    processed_rows: number;
    error_rows: number;
    quality_score?: number;
    error_details?: any;
    mapping_rules?: any;
    processing_time_ms?: number;
    uploaded_by?: string;
  }): Promise<CsvUploadHistory | null> {
    try {
      const processing_status = uploadData.error_rows === 0 
        ? 'success' 
        : uploadData.processed_rows > 0 
          ? 'partial' 
          : 'error';

      const { data, error } = await supabase
        .from('csv_uploads')
        .insert([{
          ...uploadData,
          processing_status,
          upload_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'enregistrement de l\'upload:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur service historique CSV:', error);
      return null;
    }
  }

  // Récupérer l'historique des uploads
  static async getUploadHistory(limit: number = 50): Promise<CsvUploadHistory[]> {
    try {
      const { data, error } = await supabase
        .from('csv_uploads')
        .select('*')
        .order('upload_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service historique CSV:', error);
      return [];
    }
  }

  // Récupérer les statistiques générales
  static async getUploadStats(): Promise<CsvStats> {
    try {
      const { data, error } = await supabase
        .from('csv_uploads')
        .select('*');

      if (error || !data) {
        console.error('Erreur lors de la récupération des stats:', error);
        return {
          totalUploads: 0,
          totalRowsProcessed: 0,
          successRate: 0,
          averageQualityScore: 0,
          recentUploads: []
        };
      }

      const totalUploads = data.length;
      const totalRowsProcessed = data.reduce((sum, upload) => sum + (upload.processed_rows || 0), 0);
      const successfulUploads = data.filter(upload => upload.processing_status === 'success').length;
      const successRate = totalUploads > 0 ? (successfulUploads / totalUploads) * 100 : 0;
      
      const qualityScores = data.filter(upload => upload.quality_score != null);
      const averageQualityScore = qualityScores.length > 0 
        ? qualityScores.reduce((sum, upload) => sum + upload.quality_score, 0) / qualityScores.length 
        : 0;

      const recentUploads = data
        .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
        .slice(0, 5);

      const lastUploadDate = data.length > 0 
        ? data.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())[0].upload_date
        : undefined;

      return {
        totalUploads,
        totalRowsProcessed,
        successRate,
        averageQualityScore,
        recentUploads,
        lastUploadDate
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalUploads: 0,
        totalRowsProcessed: 0,
        successRate: 0,
        averageQualityScore: 0,
        recentUploads: []
      };
    }
  }

  // Supprimer un upload de l'historique
  static async deleteUploadRecord(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('csv_uploads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service historique CSV:', error);
      return false;
    }
  }

  // Marquer un upload comme ré-traité
  static async retryUpload(id: string, newResults: {
    processed_rows: number;
    error_rows: number;
    quality_score?: number;
    error_details?: any;
  }): Promise<boolean> {
    try {
      const processing_status = newResults.error_rows === 0 
        ? 'success' 
        : newResults.processed_rows > 0 
          ? 'partial' 
          : 'error';

      const { error } = await supabase
        .from('csv_uploads')
        .update({
          ...newResults,
          processing_status,
          upload_date: new Date().toISOString() // Nouvelle date de traitement
        })
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service historique CSV:', error);
      return false;
    }
  }

  // Nettoyer l'historique ancien (garder les N derniers)
  static async cleanupOldRecords(keepRecords: number = 100): Promise<number> {
    try {
      // Récupérer les IDs des anciens enregistrements
      const { data, error } = await supabase
        .from('csv_uploads')
        .select('id')
        .order('upload_date', { ascending: false })
        .range(keepRecords, 1000); // Prendre les enregistrements après les N premiers

      if (error || !data || data.length === 0) {
        return 0;
      }

      const idsToDelete = data.map(record => record.id);

      const { error: deleteError } = await supabase
        .from('csv_uploads')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Erreur lors du nettoyage:', deleteError);
        return 0;
      }

      return idsToDelete.length;
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      return 0;
    }
  }
}

// Hook React pour utiliser l'historique CSV
export const useCsvHistory = () => {
  const [history, setHistory] = useState<CsvUploadHistory[]>([]);
  const [stats, setStats] = useState<CsvStats>({
    totalUploads: 0,
    totalRowsProcessed: 0,
    successRate: 0,
    averageQualityScore: 0,
    recentUploads: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Charger l'historique
  const loadHistory = async (limit: number = 50) => {
    setIsLoading(true);
    try {
      const data = await CsvHistoryService.getUploadHistory(limit);
      setHistory(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const data = await CsvHistoryService.getUploadStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  // Enregistrer un nouvel upload
  const recordUpload = async (uploadData: Parameters<typeof CsvHistoryService.recordUpload>[0]) => {
    const result = await CsvHistoryService.recordUpload(uploadData);
    if (result) {
      // Recharger l'historique et les stats
      await Promise.all([loadHistory(), loadStats()]);
    }
    return result;
  };

  // Supprimer un enregistrement
  const deleteRecord = async (id: string) => {
    const success = await CsvHistoryService.deleteUploadRecord(id);
    if (success) {
      await Promise.all([loadHistory(), loadStats()]);
    }
    return success;
  };

  // Nettoyer les anciens enregistrements
  const cleanupOld = async (keepRecords: number = 100) => {
    const deletedCount = await CsvHistoryService.cleanupOldRecords(keepRecords);
    if (deletedCount > 0) {
      await Promise.all([loadHistory(), loadStats()]);
    }
    return deletedCount;
  };

  // Charger les données au montage
  useEffect(() => {
    Promise.all([loadHistory(), loadStats()]);
  }, []);

  return {
    history,
    stats,
    isLoading,
    loadHistory,
    loadStats,
    recordUpload,
    deleteRecord,
    cleanupOld,
    refresh: () => Promise.all([loadHistory(), loadStats()])
  };
};