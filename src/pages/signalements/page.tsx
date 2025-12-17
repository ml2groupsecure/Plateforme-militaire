import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { supabase, type Signalement } from '../../lib/supabase';

function formatReference(id: string) {
  return `SR-${id.replace(/-/g, '').slice(-8).toUpperCase()}`;
}

export default function SignalementsPage() {
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Signalement | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const total = useMemo(() => signalements.length, [signalements]);
  const anonymousCount = useMemo(() => signalements.filter(s => s.anonymous).length, [signalements]);

  const filteredSignalements = useMemo(() => {
    if (!activeZone) return signalements;
    const zoneNorm = activeZone.trim();
    return signalements.filter(s => {
      const z = (s.location || 'Zone inconnue').trim() || 'Zone inconnue';
      return z === zoneNorm;
    });
  }, [signalements, activeZone]);

  const filteredTotal = useMemo(() => filteredSignalements.length, [filteredSignalements]);

  const zones = useMemo(() => {
    const map = new Map<string, { zone: string; count: number; lastAt: string | null }>();

    for (const s of signalements) {
      const zone = (s.location || 'Zone inconnue').trim() || 'Zone inconnue';
      const prev = map.get(zone);
      if (!prev) {
        map.set(zone, { zone, count: 1, lastAt: s.created_at });
      } else {
        prev.count += 1;
        if (!prev.lastAt || new Date(s.created_at) > new Date(prev.lastAt)) {
          prev.lastAt = s.created_at;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [signalements]);

  const loadSignalements = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('id,type,title,description,location,anonymous,source,ip_address,user_agent,created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setSignalements((data || []) as Signalement[]);
    } catch (e: any) {
      setError(e?.message || 'Erreur lors du chargement des signalements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSignalements();

    // Realtime (optionnel) : si Realtime est activé pour la table.
    const channel = supabase
      .channel('signalements-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'signalements' },
        () => {
          // Recharger pour garder l'UI simple et cohérente
          loadSignalements();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout title="Signalements" subtitle="Signalements citoyens depuis la plateforme civile">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neuro-600 dark:text-gray-400">
            Total: <span className="font-semibold">{total}</span>
            {activeZone ? (
              <>
                {' '}· Filtre zone: <span className="font-semibold">{activeZone}</span>
                {' '}· Affichés: <span className="font-semibold">{filteredTotal}</span>
              </>
            ) : (
              <> · Anonymes: <span className="font-semibold">{anonymousCount}</span></>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeZone && (
              <Button variant="neuro" size="sm" onClick={() => setActiveZone(null)}>
                <i className="ri-close-line mr-2"></i>
                Retirer filtre
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={loadSignalements} disabled={isLoading}>
              <i className="ri-refresh-line mr-2"></i>
              Actualiser
            </Button>
          </div>
        </div>

        {/* Vue "zones" (mise à jour en temps réel car la liste est rafraîchie sur postgres_changes) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">

        {error && (
          <Card className="border border-danger-200 bg-danger-50">
            <div className="text-danger-700 text-sm">
              <i className="ri-error-warning-line mr-2"></i>
              {error}
            </div>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Référence</th>
                <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Type</th>
                <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Titre</th>
                <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Région</th>
                <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Anonyme</th>
                <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Source</th>
                <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Date</th>
                <th className="px-4 py-3 text-left font-medium text-neuro-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-neuro-600 dark:text-gray-300" colSpan={8}>
                    Chargement...
                  </td>
                </tr>
              ) : signalements.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-neuro-600 dark:text-gray-300" colSpan={8}>
                    Aucun signalement pour le moment.
                  </td>
                </tr>
              ) : (
                filteredSignalements.map(s => (
                  <tr
                    key={s.id}
                    className="border-t border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 text-neuro-900 dark:text-white font-medium">{formatReference(s.id)}</td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{s.type}</td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">
                      <div className="max-w-[460px] truncate" title={s.title}>
                        {s.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{s.location || '-'}</td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{s.anonymous ? 'Oui' : 'Non'}</td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{s.source || '-'}</td>
                    <td className="px-4 py-3 text-neuro-700 dark:text-gray-300">{new Date(s.created_at).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <Button variant="neuro" size="sm" onClick={() => setSelected(s)}>
                        <i className="ri-eye-line mr-2"></i>
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-neuro-900 dark:text-white">Zones</h3>
                <p className="text-xs text-neuro-500 dark:text-gray-400">Top zones (temps réel)</p>
              </div>
              <div className="text-xs text-neuro-500 dark:text-gray-400">
                {zones.length} zone(s)
              </div>
            </div>

            {zones.length === 0 ? (
              <div className="text-sm text-neuro-600 dark:text-gray-300">Aucune donnée.</div>
            ) : (
              <div className="space-y-2">
                {zones.slice(0, 10).map(z => {
                  const isActive = activeZone === z.zone;
                  return (
                    <button
                      key={z.zone}
                      type="button"
                      onClick={() => setActiveZone(prev => (prev === z.zone ? null : z.zone))}
                      className={`w-full text-left flex items-center justify-between p-2 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-primary-50 border-primary-200 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-666'
                      }`}
                      title={isActive ? 'Clique pour retirer le filtre' : 'Clique pour filtrer le tableau sur cette zone'}
                    >
                      <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          isActive ? 'text-primary-700 dark:text-blue-300' : 'text-neuro-900 dark:text-white'
                        }`}>{z.zone}</div>
                        {z.lastAt && (
                          <div className="text-xs text-neuro-500 dark:text-gray-400">
                            Dernier: {new Date(z.lastAt).toLocaleString('fr-FR')}
                          </div>
                        )}
                      </div>
                      <div className={`text-sm font-semibold ${
                        isActive ? 'text-primary-800 dark:text-blue-200' : 'text-neuro-900 dark:text-white'
                      }`}>{z.count}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Modal détails */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-3xl">
              <Card className="max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-neuro-900 dark:text-white">Détails du signalement</h3>
                    <p className="text-sm text-neuro-500 dark:text-gray-400">{formatReference(selected.id)}</p>
                  </div>
                  <Button variant="neuro" size="sm" onClick={() => setSelected(null)}>
                    <i className="ri-close-line"></i>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">Type</div>
                    <div className="text-sm font-medium text-neuro-900 dark:text-white">{selected.type}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">Zone / Région</div>
                    <div className="text-sm font-medium text-neuro-900 dark:text-white">{selected.location || 'Zone inconnue'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">Anonyme</div>
                    <div className="text-sm font-medium text-neuro-900 dark:text-white">{selected.anonymous ? 'Oui' : 'Non'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">Source</div>
                    <div className="text-sm font-medium text-neuro-900 dark:text-white">{selected.source || '-'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">Date</div>
                    <div className="text-sm font-medium text-neuro-900 dark:text-white">{new Date(selected.created_at).toLocaleString('fr-FR')}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">IP</div>
                    <div className="text-sm font-medium text-neuro-900 dark:text-white break-all">{selected.ip_address || '-'}</div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">Titre</div>
                  <div className="text-sm font-medium text-neuro-900 dark:text-white">{selected.title}</div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">Description</div>
                  <div className="text-sm text-neuro-900 dark:text-white whitespace-pre-wrap">{selected.description}</div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <div className="text-xs text-neuro-500 dark:text-gray-400 mb-1">User-Agent</div>
                  <div className="text-xs text-neuro-700 dark:text-gray-300 break-all">{selected.user_agent || '-'}</div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
