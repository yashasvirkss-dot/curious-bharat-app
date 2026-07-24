// @ts-ignore
import defaultLogoImage from '../assets/images/boy_girl_curious_bharat_1784813567963.jpg';

export const CURIOUS_BHARAT_DEFAULT_LOGO = defaultLogoImage;

export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return defaultLogoImage;
  
  // If it's already using our local build images or a transparent data URL, return it directly
  if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:') || url.includes('curious_bharat_')) {
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

