import type { SenegalRadarAlert, SenegalRadarResponse } from '../radar/senegalRadarService';

export type NotificationType = 'alert' | 'warning' | 'info';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  source: 'radar_senegal';
}

const STORAGE_KEY = 'seenpredyct.notifications.readIds.v1';

function safeWindow(): Window | null {
  try {
    return typeof window !== 'undefined' ? window : null;
  } catch {
    return null;
  }
}

export function buildRadarNotificationId(alert: SenegalRadarAlert): string {
  // ID stable (si l'alerte revient identique, elle sera considérée comme la même notif)
  return `${alert.place}|${alert.type}|${alert.info}|${alert.severity}`;
}

export function loadReadIds(): Set<string> {
  const w = safeWindow();
  if (!w) return new Set();

  try {
    const raw = w.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

export function saveReadIds(ids: Set<string>) {
  const w = safeWindow();
  if (!w) return;

  try {
    w.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

export function markAsRead(id: string) {
  const ids = loadReadIds();
  ids.add(id);
  saveReadIds(ids);
}

export function markManyAsRead(idsToMark: string[]) {
  const ids = loadReadIds();
  for (const id of idsToMark) ids.add(id);
  saveReadIds(ids);
}

export function clearReadState() {
  const w = safeWindow();
  if (!w) return;
  try {
    w.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function mapRadarSeverity(alert: SenegalRadarAlert): { type: NotificationType; priority: NotificationPriority } {
  const sev = (alert.severity || '').toUpperCase();
  if (sev === 'ÉLEVÉ' || sev === 'ELEVÉ') return { type: 'alert', priority: 'high' };
  if (sev === 'MOYEN') return { type: 'warning', priority: 'medium' };
  return { type: 'info', priority: 'low' };
}

export function radarToNotifications(radar: SenegalRadarResponse): AppNotification[] {
  const readIds = loadReadIds();
  const generatedAt = radar.generated_at ? new Date(radar.generated_at) : new Date();

  const notifs: AppNotification[] = (radar.alerts || []).map((a: SenegalRadarAlert) => {
    const id = buildRadarNotificationId(a);
    const mapped = mapRadarSeverity(a);

    const title = `Alerte: ${a.place}`;
    const msgParts = [a.type, a.info].filter(Boolean);

    return {
      id,
      source: 'radar_senegal' as const,
      type: mapped.type,
      priority: mapped.priority,
      title,
      message: msgParts.join(' - ') || 'Alerte détectée',
      timestamp: generatedAt,
      read: readIds.has(id),
    };
  });

  // Trier du plus récent au plus ancien
  notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return notifs;
}

export function countUnread(notifs: AppNotification[]): number {
  return notifs.filter((n) => !n.read).length;
}

export function timeAgoFr(from: Date): string {
  const diffMs = Date.now() - from.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'moins d\'1 min';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}
