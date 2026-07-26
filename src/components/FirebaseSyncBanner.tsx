import React, { useEffect } from 'react';
import { autoSyncWithFirebase } from '../utils/localPersistence';

export default function FirebaseSyncBanner() {
  useEffect(() => {
    autoSyncWithFirebase();
  }, []);

  return null;
}
