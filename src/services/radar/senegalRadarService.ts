import { API_CONFIG } from '../../core/api/config';

export type SenegalRadarSeverity = 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'ELEVÉ';

export interface SenegalRadarAlert {
  place: string;
  type: string;
  info: string;
  severity: SenegalRadarSeverity;
}

export interface SenegalRadarResponse {
  generated_at: string;
  news_count: number;
  alerts: SenegalRadarAlert[];
  sources: string[];
}

export async function fetchSenegalRadarAlerts(refresh = false): Promise<SenegalRadarResponse> {
  const url = new URL(`${API_CONFIG.BASE_URL}/senegal-radar/alerts`);
  if (refresh) url.searchParams.set('refresh', 'true');

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: API_CONFIG.DEFAULT_HEADERS,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Erreur API Radar Sénégal (${res.status}): ${detail || res.statusText}`);
  }

  return (await res.json()) as SenegalRadarResponse;
}

export function getSenegalRadarMapUrl(options?: { cacheBust?: string | number }): string {
  const url = new URL(`${API_CONFIG.BASE_URL}/senegal-radar/map`);

  // Cache-buster côté navigateur (ne doit PAS forcer un refresh backend par défaut)
  if (options?.cacheBust !== undefined) {
    url.searchParams.set('t', String(options.cacheBust));
  }

  return url.toString();
}
