import { dbService } from '../lib/firebase';

const LAST_SYNC_KEY = 'curious_last_synced_time';
const LAST_MODIFIED_PREFIX = 'curious_last_modified_';

export interface SyncStatus {
  lastSyncedTimestamp: string | null;
  formattedLastSynced: string;
  isSyncing: boolean;
  error: string | null;
  syncCount: number;
}

export function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`curious_${key}`);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Error reading local key curious_${key}:`, err);
  }
  return defaultValue;
}

export function saveLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`curious_${key}`, JSON.stringify(data));
    localStorage.setItem(`${LAST_MODIFIED_PREFIX}${key}`, new Date().toISOString());
  } catch (err) {
    console.warn(`Error saving local key curious_${key}:`, err);
  }
}

export function getLastSyncedTimestamp(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function getFormattedLastSynced(): string {
  const ts = getLastSyncedTimestamp();
  if (!ts) return 'Never synced';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return 'Never synced';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return 'Never synced';
  }
}

export async function syncWithFirebasePermission(userConfirmed: boolean = true): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
}> {
  if (!navigator.onLine) {
    return {
      success: false,
      message: 'Device is offline.',
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Collect local data to sync
    const localCourses = getLocalData('courses', null);
    const localCustom = getLocalData('customization', null);
    const localAnalysis = getLocalData('student_analysis', null);
    const localEvents = getLocalData('analytics_events', []);

    let syncedItemsCount = 0;

    if (localCourses && Array.isArray(localCourses)) {
      await dbService.saveCoursesToFirebase(localCourses);
      syncedItemsCount += localCourses.length;
    }

    if (localCustom) {
      await dbService.saveCustomizationToFirebase(localCustom);
      syncedItemsCount += 1;
    }

    if (localEvents && Array.isArray(localEvents) && localEvents.length > 0) {
      await dbService.syncAnalyticsEventsToFirebase(localEvents);
      syncedItemsCount += localEvents.length;
    }

    const nowIso = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, nowIso);

    return {
      success: true,
      message: `Synced ${syncedItemsCount} records in background.`,
      timestamp: nowIso
    };
  } catch (err) {
    console.warn('Background sync warning:', err);
    return {
      success: false,
      message: `Sync failed: ${err instanceof Error ? err.message : String(err)}`,
      timestamp: new Date().toISOString()
    };
  }
}

export function autoSyncWithFirebase(): void {
  syncWithFirebasePermission(true).catch(() => {});
}
