// @ts-ignore
import defaultBatchThumbnail from '../assets/images/curious_bharat_banner_1784624268246.jpg';

export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return defaultBatchThumbnail;
  
  // If it's already using our local build images or a transparent data URL, return it directly
  if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:') || url.includes('curious_bharat_banner_')) {
    return url;
  }
  
  // If it's already wrapped in our proxy-image, return as is
  if (url.startsWith('/api/proxy-image')) {
    return url;
  }
  
  // For web URLs, wrap in our server-side image resolver proxy to stream bytes without CORS/Referrer blocks
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  
  return url;
}
