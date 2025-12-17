import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import type { SenegalRadarAlert, SenegalRadarSeverity, SenegalRadarResponse } from '../../services/radar/senegalRadarService';
import { fetchSenegalRadarAlerts, getSenegalRadarMapUrl } from '../../services/radar/senegalRadarService';

function severityStyles(severity: SenegalRadarSeverity) {
  switch (severity) {
    case 'ÉLEVÉ':
    case 'ELEVÉ':
      return {
        badge: 'bg-red-100 text-red-800 border-red-200',
        icon: 'ri-error-warning-line text-red-600',
      };
    case 'MOYEN':
      return {
        badge: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: 'ri-alert-line text-orange-600',
      };
    case 'FAIBLE':
    default:
      return {
        badge: 'bg-green-100 text-green-800 border-green-200',
        icon: 'ri-shield-check-line text-green-600',
      };
  }
}

export default function SenegalRadarPage() {
  const [data, setData] = useState<SenegalRadarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sert aussi de cache-buster pour l'iframe de la carte
  const [refreshToken, setRefreshToken] = useState<number>(Date.now());

  const load = async (refresh: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchSenegalRadarAlerts(refresh);
      setData(resp);
      if (refresh) setRefreshToken(Date.now());
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alerts = data?.alerts || [];

  const stats = useMemo(() => {
    const counts: Record<string, number> = { FAIBLE: 0, MOYEN: 0, 'ÉLEVÉ': 0, ELEVÉ: 0 };
    for (const a of alerts) counts[a.severity] = (counts[a.severity] || 0) + 1;

    // regrouper ÉLEVÉ/ELEVÉ
    const high = (counts['ÉLEVÉ'] || 0) + (counts.ELEVÉ || 0);

    return {
      total: alerts.length,
      low: counts.FAIBLE || 0,
      medium: counts.MOYEN || 0,
      high,
    };
  }, [alerts]);

  const mapUrl = useMemo(() => getSenegalRadarMapUrl({ cacheBust: refreshToken }), [refreshToken]);

  return (
    <Layout title="Radar Sénégal" subtitle="Détection automatique des zones sensibles (scraping + IA Groq)">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neuro-900 dark:text-white mb-1">Radar Sénégal</h1>
            <p className="text-neuro-600 dark:text-gray-400">
              Dernière génération: {data?.generated_at ? new Date(data.generated_at).toLocaleString('fr-FR') : '—'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="neuro" size="sm" onClick={() => load(false)} disabled={loading}>
              <i className="ri-refresh-line mr-2"></i>
              Recharger (cache)
            </Button>
            <Button variant="primary" size="sm" onClick={() => load(true)} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyse...
                </>
              ) : (
                <>
                  <i className="ri-flashlight-line mr-2"></i>
                  Forcer analyse
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border border-red-200 bg-red-50">
            <div className="flex items-start space-x-3">
              <i className="ri-close-circle-line text-red-600 text-xl"></i>
              <div>
                <p className="font-semibold text-red-900">Erreur Radar Sénégal</p>
                <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
                <p className="text-xs text-red-700 mt-2">
                  Astuce: vérifiez que l'API FastAPI tourne et que GROQ_API_KEY est défini dans `python_api/.env`.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <p className="text-sm font-medium text-blue-700">Articles analysés</p>
              <p className="text-3xl font-bold text-blue-900">{data?.news_count ?? '—'}</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <p className="text-sm font-medium text-green-700">Alertes faibles</p>
              <p className="text-3xl font-bold text-green-900">{stats.low}</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <p className="text-sm font-medium text-orange-700">Alertes moyennes</p>
              <p className="text-3xl font-bold text-orange-900">{stats.medium}</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <p className="text-sm font-medium text-red-700">Alertes élevées</p>
              <p className="text-3xl font-bold text-red-900">{stats.high}</p>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neuro-900 dark:text-white">Alertes</h2>
                <span className="text-sm text-neuro-600 dark:text-gray-400">{stats.total} total</span>
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-map-pin-line text-4xl text-neuro-300 mb-2"></i>
                  <p className="text-sm text-neuro-600 dark:text-gray-400">Aucune alerte pour le moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert: SenegalRadarAlert, idx: number) => {
                    const styles = severityStyles(alert.severity);
                    return (
                      <div
                        key={`${alert.place}-${idx}`}
                        className="p-3 rounded-xl border border-neuro-200 dark:border-gray-600 hover:shadow-soft transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <i className={`${styles.icon} text-lg mt-0.5`}></i>
                            <div>
                              <p className="font-semibold text-neuro-900 dark:text-white">{alert.place}</p>
                              <p className="text-sm text-neuro-700 dark:text-gray-300">{alert.type}</p>
                              <p className="text-xs text-neuro-600 dark:text-gray-400 mt-1">{alert.info}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles.badge}`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {data?.sources?.length ? (
                <div className="mt-6 pt-4 border-t border-neuro-200">
                  <p className="text-xs text-neuro-500 mb-2">Sources utilisées</p>
                  <div className="flex flex-wrap gap-2">
                    {data.sources.map((s) => (
                      <span key={s} className="px-2 py-1 rounded-full bg-neuro-100 text-neuro-700 text-xs">
                        {s.replace(/^https?:\/\//, '')}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neuro-900 dark:text-white">Carte</h2>
                <Button variant="neuro" size="sm" onClick={() => setRefreshToken(Date.now())}>
                  <i className="ri-restart-line mr-2"></i>
                  Rafraîchir carte
                </Button>
              </div>

              <div className="w-full h-[650px] rounded-xl overflow-hidden border border-neuro-200">
                <iframe title="Carte Radar Sénégal" src={mapUrl} className="w-full h-full" />
              </div>

              <p className="text-xs text-neuro-500 mt-3">
                Note: la carte est générée côté backend (Folium) et affichée ici via iframe.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
