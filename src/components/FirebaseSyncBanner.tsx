import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { syncWithFirebasePermission, getFormattedLastSynced } from '../utils/localPersistence';

interface FirebaseSyncBannerProps {
  onSyncCompleted?: () => void;
  compact?: boolean;
}

export default function FirebaseSyncBanner({ onSyncCompleted, compact = false }: FirebaseSyncBannerProps) {
  const [lastSyncedText, setLastSyncedText] = useState<string>(() => getFormattedLastSynced());
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const handleSyncStatusUpdate = () => {
      setLastSyncedText(getFormattedLastSynced());
    };
    window.addEventListener('curious_sync_status_updated', handleSyncStatusUpdate);
    return () => {
      window.removeEventListener('curious_sync_status_updated', handleSyncStatusUpdate);
    };
  }, []);

  const handleExecuteSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    const result = await syncWithFirebasePermission(true);

    setIsSyncing(false);
    setShowPermissionModal(false);

    if (result.success) {
      setLastSyncedText(getFormattedLastSynced());
      setSyncStatusMsg({
        text: result.message,
        type: 'success'
      });
      if (onSyncCompleted) onSyncCompleted();
    } else {
      setSyncStatusMsg({
        text: result.message,
        type: 'error'
      });
    }

    // Clear alert message after 5 seconds
    setTimeout(() => {
      setSyncStatusMsg(null);
    }, 5000);
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPermissionModal(true)}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer border border-sky-400/30"
          title="Explicit user permission required before syncing local data with Firebase"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>SYNC WITH FIREBASE</span>
        </button>
        <span className="text-[10px] text-zinc-400 font-mono font-bold bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800 whitespace-nowrap">
          Last synced: {lastSyncedText}
        </span>

        {/* Permission Confirmation Modal */}
        {showPermissionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left font-sans">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-950/80 border border-sky-800/80 rounded-xl text-sky-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Permission Required for Firebase Sync</h3>
                  <p className="text-xs text-zinc-400">Local-First Persistence & Permission Control</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/90 p-3.5 rounded-xl border border-zinc-850">
                Grant explicit permission to synchronize your local student data, quiz submissions, and analytics with the Firebase cloud database?
              </p>

              <div className="text-[11px] text-zinc-400 space-y-1 font-mono">
                <div>• Local Data: Protected on device storage</div>
                <div>• Status: Last synced: <span className="text-white font-bold">{lastSyncedText}</span></div>
                <div>• Action: Sync changed records with timestamps</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSync}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  {isSyncing ? 'Syncing...' : 'Grant Permission & Sync Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-sans shadow-lg">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="p-3 bg-sky-950/60 border border-sky-850 rounded-xl text-sky-400 shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-white">Local-First Storage Engine</h4>
            <span className="text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
              100% Offline Capable
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Student data is loaded locally on startup. Cloud sync requires explicit user permission.
          </p>
          <div className="text-[11px] font-mono text-zinc-400 mt-1">
            Last synced: <span className="text-teal-300 font-bold">{lastSyncedText}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0">
        <button
          type="button"
          onClick={() => setShowPermissionModal(true)}
          disabled={isSyncing}
          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-sky-400/30"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>SYNC WITH FIREBASE</span>
        </button>
      </div>

      {/* Sync Status Banner Toast */}
      {syncStatusMsg && (
        <div className={`col-span-full w-full p-3 rounded-xl border text-xs font-medium flex items-center gap-2 mt-2 ${
          syncStatusMsg.type === 'success'
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            : 'bg-rose-950/80 text-rose-300 border-rose-800'
        }`}>
          {syncStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{syncStatusMsg.text}</span>
        </div>
      )}

      {/* Permission Confirmation Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left font-sans">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-950/80 border border-sky-800/80 rounded-xl text-sky-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Permission Required for Firebase Sync</h3>
                <p className="text-xs text-zinc-400">Local-First Persistence & Permission Control</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/90 p-3.5 rounded-xl border border-zinc-850">
              Grant explicit permission to synchronize your local student data, quiz submissions, and analytics with the Firebase cloud database?
            </p>

            <div className="text-[11px] text-zinc-400 space-y-1 font-mono">
              <div>• Local Data: Protected on device storage</div>
              <div>• Status: Last synced: <span className="text-white font-bold">{lastSyncedText}</span></div>
              <div>• Action: Sync changed records with timestamps</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                {isSyncing ? 'Syncing...' : 'Grant Permission & Sync Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
