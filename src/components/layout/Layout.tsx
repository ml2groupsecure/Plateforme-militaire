
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import SmartCSVUploader from '../upload/SmartCSVUploader';
import { useSiteDataSync } from '../../lib/siteDataSync';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const { refreshAllData, isRefreshing } = useSiteDataSync();

  const handleCSVUpload = () => {
    setShowCSVUploader(true);
  };

  const handleCSVUploadSuccess = async (result: any) => {
    console.log('✅ CSV traité avec succès:', result);
    setShowCSVUploader(false);
    
    // Actualiser TOUTES les données du site
    await refreshAllData();
    
    // Afficher le résultat à l'utilisateur
    alert(
      `🎉 Import réussi !\n\n` +
      `📊 ${result.processedRows} incidents ajoutés\n` +
      `⚠️ ${result.errors.length} erreurs\n` +
      `📁 ${result.skippedRows} lignes ignorées\n\n` +
      `✨ Le site a été mis à jour automatiquement !`
    );
  };

  return (
    <div className="flex h-screen bg-neuro-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          title={title} 
          subtitle={subtitle}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Smart CSV Uploader Modal */}
      <AnimatePresence>
        {showCSVUploader && (
          <SmartCSVUploader
            onSuccess={handleCSVUploadSuccess}
            onClose={() => setShowCSVUploader(false)}
          />
        )}
      </AnimatePresence>

      {/* Smart Upload Button */}
      <motion.button
        onClick={handleCSVUpload}
        disabled={isRefreshing}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-success-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 ${
          isRefreshing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        whileHover={!isRefreshing ? { scale: 1.05 } : {}}
        whileTap={!isRefreshing ? { scale: 0.95 } : {}}
        title={isRefreshing ? "Mise à jour en cours..." : "Upload CSV Intelligent"}
      >
        {isRefreshing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <i className="ri-upload-cloud-line text-xl"></i>
        )}
      </motion.button>
    </div>
  );
}
