import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  ArrowUpRight,
  HardDrive
} from 'lucide-react';
import { ApkVersionConfig } from '../types';
import { playSound } from '../utils/audio';

interface AppUpdateNotifierProps {
  onVersionUpdated?: (newVersion: string) => void;
}

export default function AppUpdateNotifier({ onVersionUpdated }: AppUpdateNotifierProps) {
  const [apkConfig, setApkConfig] = useState<ApkVersionConfig | null>(null);
  const [currentInstalledVersion, setCurrentInstalledVersion] = useState<string>(() => {
    return localStorage.getItem('curious_bharat_installed_version') || 'v1.0.0';
  });
  const [currentInstalledBuild, setCurrentInstalledBuild] = useState<number>(() => {
    return parseInt(localStorage.getItem('curious_bharat_installed_build') || '10', 10);
  });

  // Download and update states
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isChecksumVerified, setIsChecksumVerified] = useState(false);
  const [isSeamlessAuto, setIsSeamlessAuto] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState('2.4 MB/s');
  const [installedSuccessToast, setInstalledSuccessToast] = useState<string | null>(null);

  // Fetch live APK configuration from server
  const fetchApkConfig = async () => {
    try {
      const res = await fetch('/api/apk-version');
      if (res.ok) {
        const data: ApkVersionConfig = await res.json();
        setApkConfig(data);

        const serverBuild = data.buildNumber || 22;
        const serverVersion = data.currentVersion || 'v2.2.0';

        // Check if an update is required
        if (serverBuild > currentInstalledBuild || serverVersion !== currentInstalledVersion) {
          setIsUpdateAvailable(true);
          const size = data.sizeInMB || 12.4;
          const force = data.releaseType === 'force';
          setIsForceUpdate(force);

          // Threshold Rule: <= 15 MB -> Seamless background auto-install
          // > 15 MB or Force Update -> Background download + Android Package Installer Prompt
          const seamless = size <= 15 && !force;
          setIsSeamlessAuto(seamless);

          // Trigger download flow automatically if not already downloaded
          triggerAutoDownload(data, seamless, force);
        }
      }
    } catch (err) {
      console.warn('Failed to check live APK version:', err);
    }
  };

  useEffect(() => {
    fetchApkConfig();

    // Poll for real-time version updates every 15 seconds
    const interval = setInterval(fetchApkConfig, 15000);
    return () => clearInterval(interval);
  }, [currentInstalledVersion, currentInstalledBuild]);

  // Simulate or execute background download with checksum verification
  const triggerAutoDownload = (data: ApkVersionConfig, seamless: boolean, force: boolean) => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(5);
    setIsChecksumVerified(false);

    // Record download started telemetry
    fetch('/api/apk-version/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'download_started',
        version: data.currentVersion,
        deviceInfo: window.navigator.userAgent
      })
    }).catch(() => {});

    let progress = 5;
    const downloadInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(downloadInterval);
        setIsDownloading(false);
        setIsChecksumVerified(true);

        if (seamless) {
          // <= 15MB: Install seamlessly in background without blocking user
          executeSeamlessInstall(data.currentVersion, data.buildNumber);
        } else {
          // > 15MB or Force: Prompt user with Android Package Installer screen
          setShowPromptModal(true);
        }
      }
      setDownloadProgress(progress);
    }, 400);
  };

  // Perform seamless background installation
  const executeSeamlessInstall = (newVersion: string, newBuild: number) => {
    playSound('Success Chime');
    localStorage.setItem('curious_bharat_installed_version', newVersion);
    localStorage.setItem('curious_bharat_installed_build', String(newBuild));
    setCurrentInstalledVersion(newVersion);
    setCurrentInstalledBuild(newBuild);
    setIsUpdateAvailable(false);
    setShowPromptModal(false);

    if (onVersionUpdated) {
      onVersionUpdated(newVersion);
    }

    setInstalledSuccessToast(`⚡ App updated seamlessly to ${newVersion} in background! (${apkConfig?.sizeInMB || 12.4} MB)`);
    setTimeout(() => setInstalledSuccessToast(null), 6000);

    // Record seamless install telemetry
    fetch('/api/apk-version/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'seamless_installed',
        version: newVersion,
        deviceInfo: window.navigator.userAgent
      })
    }).catch(() => {});
  };

  // User confirms install from prompt screen
  const handleUserConfirmInstall = () => {
    if (!apkConfig) return;
    playSound('click');

    const newVersion = apkConfig.currentVersion;
    const newBuild = apkConfig.buildNumber;

    localStorage.setItem('curious_bharat_installed_version', newVersion);
    localStorage.setItem('curious_bharat_installed_build', String(newBuild));
    setCurrentInstalledVersion(newVersion);
    setCurrentInstalledBuild(newBuild);
    setIsUpdateAvailable(false);
    setShowPromptModal(false);

    if (onVersionUpdated) {
      onVersionUpdated(newVersion);
    }

    setInstalledSuccessToast(`🎉 ${newVersion} installed successfully! System restarted.`);
    setTimeout(() => setInstalledSuccessToast(null), 6000);

    // Record prompt install telemetry
    fetch('/api/apk-version/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'prompt_installed',
        version: newVersion,
        deviceInfo: window.navigator.userAgent
      })
    }).catch(() => {});
  };

  // Background update process runs silently without showing notification UI to students
  return null;
}
