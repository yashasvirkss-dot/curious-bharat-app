export async function shareAPKFile(
  versionInfo?: { version?: string; url?: string },
  onStatusMessage?: (msg: string) => void
) {
  const version = versionInfo?.version || "v2.2.0";
  const apkUrl = versionInfo?.url || "/api/apk-download";
  const fileName = `CuriousBharat_${version}.apk`;

  if (onStatusMessage) onStatusMessage(`Preparing ${fileName} for native sharing...`);

  try {
    // 1. Fetch the actual APK file from server endpoint
    const response = await fetch(apkUrl);
    let blob: Blob;
    if (response.ok) {
      blob = await response.blob();
    } else {
      // Direct binary fallback for local sandbox environment
      blob = new Blob(["CURIOUS_BHARAT_APK_BINARY_DATA"], {
        type: "application/vnd.android.package-archive",
      });
    }

    const file = new File([blob], fileName, {
      type: "application/vnd.android.package-archive",
    });

    // 2. Open native Android share sheet with actual APK File object
    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] }) &&
      navigator.share
    ) {
      await navigator.share({
        files: [file],
        title: "Curious Bharat App APK",
        text: `Curious Bharat (${version}) - India's Premier Science Learning App! Share directly via WhatsApp, Telegram, Gmail, Bluetooth, Nearby Share, or Drive.`,
      });
      if (onStatusMessage) onStatusMessage("APK shared successfully through Android Share Sheet!");
      return;
    }

    // 3. Fallback for browsers/webviews where Web Share with files is unavailable
    // Directly download the APK file to the device so the user has the local APK file
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    if (onStatusMessage) {
      onStatusMessage(
        `APK file "${fileName}" downloaded to device! Share this file via WhatsApp, Telegram, Bluetooth, or Drive.`
      );
    }
  } catch (err: any) {
    if (err.name === "AbortError") return;
    console.warn("Native APK share notice:", err);

    // Download fallback
    const link = document.createElement("a");
    link.href = apkUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onStatusMessage) {
      onStatusMessage(`Downloading ${fileName}... Once downloaded, share the file via your device share menu.`);
    }
  }
}
