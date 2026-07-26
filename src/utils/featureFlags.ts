import React from 'react';

export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  analytics_tab_enabled: true,
  new_dashboard_enabled: true,
  batch_reports_enabled: true,
  announcements_enabled: true,
  ai_assistant_enabled: true,
  practice_tab_enabled: true,
  batches_tab_enabled: true,
  science_games_enabled: true,
  flashcards_enabled: true,
  child_scientist_canvas_enabled: true,
  ashok_chakra_enabled: true,
  admin_portal_enabled: true,
  profile_hub_enabled: true,
  apk_version_control_enabled: true,
};

const FEATURE_FLAGS_CACHE_KEY = 'curious_feature_flags';

function loadCachedFlags(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(FEATURE_FLAGS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_FEATURE_FLAGS, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached feature flags:', err);
  }
  return { ...DEFAULT_FEATURE_FLAGS };
}

let featureFlagsStore: Record<string, boolean> = loadCachedFlags();
const listeners = new Set<() => void>();

export function isFeatureEnabled(key: string): boolean {
  if (key in featureFlagsStore) {
    return Boolean(featureFlagsStore[key]);
  }
  return true; // safe default fallback
}

export function subscribeFeatureFlags(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function loadFeatureFlags(): Promise<Record<string, boolean>> {
  const primaryUrl = '/features.json';
  const remoteBackupUrl = 'https://raw.githubusercontent.com/yashasvirkss-dot/curious-bharat-app/main/features.json';

  try {
    const res = await fetch(primaryUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      featureFlagsStore = { ...DEFAULT_FEATURE_FLAGS, ...data };
      localStorage.setItem(FEATURE_FLAGS_CACHE_KEY, JSON.stringify(featureFlagsStore));
    } else {
      const fallbackRes = await fetch(remoteBackupUrl, { cache: 'no-store' });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        featureFlagsStore = { ...DEFAULT_FEATURE_FLAGS, ...fallbackData };
        localStorage.setItem(FEATURE_FLAGS_CACHE_KEY, JSON.stringify(featureFlagsStore));
      }
    }
  } catch (err) {
    // Fail silently to local cached or safe defaults
  } finally {
    listeners.forEach((fn) => fn());
  }

  return featureFlagsStore;
}

export function useFeatureFlag(key: string): boolean {
  const [enabled, setEnabled] = React.useState<boolean>(() => isFeatureEnabled(key));

  React.useEffect(() => {
    const unsubscribe = subscribeFeatureFlags(() => {
      setEnabled(isFeatureEnabled(key));
    });
    return unsubscribe;
  }, [key]);

  return enabled;
}
