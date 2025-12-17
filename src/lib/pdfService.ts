// Vous devrez installer: npm install jspdf html2canvas chart.js
import { useState } from 'react';

export interface ReportData {
  title: string;
  period: string;
  generated_by: string;
  generated_at: string;
  summary: {
    total_incidents: number;
    resolved_incidents: number;
    pending_incidents: number;
    critical_incidents: number;
  };
  charts: {
    incidents_by_type: any;
    incidents_by_location: any;
    trend_analysis: any;
  };
  predictions: any[];
  recommendations: string[];
  hotspots: any[];
}

export class PDFReportService {
  
  // Générer un rapport complet en PDF
  static async generateCompleteReport(data: ReportData): Promise<Blob> {
    // Import dynamique pour éviter les erreurs de chargement
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPosition = 20;

    // En-tête du rapport
    yPosition = PDFReportService.addHeader(doc, data, yPosition);
    
    // Résumé exécutif
    yPosition = PDFReportService.addExecutiveSummary(doc, data, yPosition);
    
    // Graphiques (conversion des charts en images)
    yPosition = await PDFReportService.addCharts(doc, data, yPosition);
    
    // Zones à risque
    yPosition = PDFReportService.addHotspots(doc, data, yPosition);
    
    // Prédictions IA
    yPosition = PDFReportService.addPredictions(doc, data, yPosition);
    
    // Recommandations
    yPosition = PDFReportService.addRecommendations(doc, data, yPosition);
    
    // Pied de page
    PDFReportService.addFooter(doc, data);
    
    return doc.output('blob');
  }

  private static addHeader(doc: any, data: ReportData, yPos: number): number {
    // Logo et titre
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text('SEENTU KAARANGE', 20, yPos);
    
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text('Système de Sécurité Prédictive Intelligent', 20, yPos + 8);
    
    // Ligne de séparation
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 12, 190, yPos + 12);
    
    // Informations du rapport
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(data.title, 20, yPos + 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Période: ${data.period}`, 20, yPos + 28);
    doc.text(`Généré le: ${new Date(data.generated_at).toLocaleDateString('fr-FR')}`, 20, yPos + 33);
    doc.text(`Par: ${data.generated_by}`, 20, yPos + 38);
    
    return yPos + 50;
  }

  private static addExecutiveSummary(doc: any, data: ReportData, yPos: number): number {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('RÉSUMÉ EXÉCUTIF', 20, yPos);
    
    // Cadre pour les métriques
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.rect(20, yPos + 5, 170, 35);
    
    // Métriques en colonnes
    const metrics = [
      { label: 'Total incidents', value: data.summary.total_incidents, color: [59, 130, 246] },
      { label: 'Incidents résolus', value: data.summary.resolved_incidents, color: [16, 185, 129] },
      { label: 'En attente', value: data.summary.pending_incidents, color: [245, 158, 11] },
      { label: 'Critiques', value: data.summary.critical_incidents, color: [239, 68, 68] }
    ];
    
    let xStart = 25;
    metrics.forEach((metric, index) => {
      doc.setFontSize(12);
      doc.setTextColor(...metric.color);
      doc.text(metric.value.toString(), xStart, yPos + 15);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(metric.label, xStart, yPos + 22);
      
      xStart += 42;
    });
    
    // Taux de résolution
    const resolutionRate = ((data.summary.resolved_incidents / data.summary.total_incidents) * 100).toFixed(1);
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text(`Taux de résolution: ${resolutionRate}%`, 25, yPos + 32);
    
    return yPos + 50;
  }

  private static async addCharts(doc: any, data: ReportData, yPos: number): Promise<number> {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('ANALYSES GRAPHIQUES', 20, yPos);
    
    yPos += 10;
    
    try {
      // Créer des canvas temporaires pour les graphiques
      const chartCanvas = document.createElement('canvas');
      chartCanvas.width = 400;
      chartCanvas.height = 200;
      const ctx = chartCanvas.getContext('2d');
      
      if (ctx) {
        // Exemple de graphique simple (à remplacer par vos vrais graphiques)
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(0, 0, 100, 150);
        ctx.fillStyle = '#10B981';
        ctx.fillRect(120, 50, 100, 100);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(240, 80, 100, 70);
        
        // Convertir le canvas en image
        const imgData = chartCanvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 20, yPos, 170, 60);
        yPos += 70;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout des graphiques:', error);
      // Fallback: texte simple
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Graphiques non disponibles dans ce rapport', 20, yPos + 10);
      yPos += 30;
    }
    
    return yPos;
  }

  private static addHotspots(doc: any, data: ReportData, yPos: number): number {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('ZONES À RISQUE ÉLEVÉ', 20, yPos);
    
    yPos += 8;
    
    // Tableau des hotspots
    data.hotspots.slice(0, 5).forEach((hotspot, index) => {
      const riskColor = hotspot.risk_score > 0.7 ? [239, 68, 68] : 
                       hotspot.risk_score > 0.5 ? [245, 158, 11] : [16, 185, 129];
      
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(`${index + 1}. ${hotspot.location}`, 25, yPos + (index * 8));
      
      doc.setTextColor(...riskColor);
      doc.text(`${hotspot.incident_count} incidents`, 120, yPos + (index * 8));
      doc.text(`Risque: ${(hotspot.risk_score * 100).toFixed(0)}%`, 160, yPos + (index * 8));
    });
    
    return yPos + (data.hotspots.length * 8) + 10;
  }

  private static addPredictions(doc: any, data: ReportData, yPos: number): number {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('PRÉDICTIONS IA', 20, yPos);
    
    yPos += 8;
    
    data.predictions.slice(0, 3).forEach((prediction, index) => {
      const riskColors = {
        low: [16, 185, 129],
        medium: [245, 158, 11],
        high: [239, 68, 68],
        critical: [153, 27, 27]
      };
      
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(prediction.location, 25, yPos + (index * 12));
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Type prédit: ${prediction.predicted_type}`, 25, yPos + (index * 12) + 4);
      
      const color = riskColors[prediction.risk_level] || [100, 100, 100];
      doc.setTextColor(...color);
      doc.text(`Niveau: ${prediction.risk_level.toUpperCase()}`, 120, yPos + (index * 12));
      doc.text(`Confiance: ${(prediction.confidence * 100).toFixed(0)}%`, 120, yPos + (index * 12) + 4);
    });
    
    return yPos + (data.predictions.length * 12) + 10;
  }

  private static addRecommendations(doc: any, data: ReportData, yPos: number): number {
    if (yPos > 180) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('RECOMMANDATIONS', 20, yPos);
    
    yPos += 8;
    
    data.recommendations.forEach((recommendation, index) => {
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      const lines = doc.splitTextToSize(`• ${recommendation}`, 165);
      doc.text(lines, 25, yPos + (index * 10));
    });
    
    return yPos + (data.recommendations.length * 10) + 10;
  }

  private static addFooter(doc: any, data: ReportData): void {
    const pageHeight = doc.internal.pageSize.height;
    
    // Ligne de séparation
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(20, pageHeight - 20, 190, pageHeight - 20);
    
    // Texte du pied de page
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Seentu Kaarange - Système de Sécurité Prédictive', 20, pageHeight - 12);
    doc.text(`Rapport confidentiel - Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, pageHeight - 8);
    
    // Numéro de page
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, 180, pageHeight - 8);
  }

  // Générer un rapport spécifique par zone
  static async generateLocationReport(location: string, incidents: any[], predictions: any[]): Promise<Blob> {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    
    let yPos = 20;
    
    // En-tête spécifique à la zone
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(`RAPPORT - ${location.toUpperCase()}`, 20, yPos);
    
    yPos += 15;
    
    // Statistiques de la zone
    doc.setFontSize(12);
    doc.text(`Nombre d'incidents: ${incidents.length}`, 20, yPos);
    doc.text(`Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPos + 8);
    
    yPos += 25;
    
    // Liste des incidents récents
    doc.setFontSize(14);
    doc.text('INCIDENTS RÉCENTS', 20, yPos);
    yPos += 10;
    
    incidents.slice(0, 10).forEach((incident, index) => {
      doc.setFontSize(9);
      doc.text(`${index + 1}. ${incident.type} - ${incident.status}`, 20, yPos + (index * 6));
      doc.text(new Date(incident.created_at).toLocaleDateString('fr-FR'), 150, yPos + (index * 6));
    });
    
    return doc.output('blob');
  }

  // Télécharger le rapport
  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Envoyer le rapport par email (nécessite une API backend)
  static async sendReportByEmail(
    blob: Blob, 
    email: string, 
    subject: string = 'Rapport Seentu Kaarange'
  ): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('report', blob, 'rapport.pdf');
      formData.append('email', email);
      formData.append('subject', subject);
      
      // Remplacez par votre endpoint API
      const response = await fetch('/api/send-report', {
        method: 'POST',
        body: formData
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport:', error);
      return false;
    }
  }
}

// Hook React pour utiliser le service PDF
export const usePDFReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (reportData: ReportData) => {
    setIsGenerating(true);
    try {
      const blob = await PDFReportService.generateCompleteReport(reportData);
      const filename = `rapport_${reportData.period.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      PDFReportService.downloadPDF(blob, filename);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocationReport = async (location: string, incidents: any[], predictions: any[]) => {
    setIsGenerating(true);
    try {
      const blob = await PDFReportService.generateLocationReport(location, incidents, predictions);
      const filename = `rapport_${location.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      PDFReportService.downloadPDF(blob, filename);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport de zone:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    generateLocationReport,
    isGenerating
  };
};