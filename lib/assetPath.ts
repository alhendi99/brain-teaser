// Utility to get correct asset path for both Next.js dev and Cordova production

const isProd = process.env.NODE_ENV === 'production';
const isCordova = typeof window !== 'undefined' && (window as any).cordova;

/**
 * Get the correct asset path based on environment
 * - In development: uses absolute paths (/assets/...)
 * - In Cordova production: uses relative paths (./assets/...)
 */
export function getAssetPath(path: string): string {
  // Remove leading ./ or / to normalize
  const normalizedPath = path.replace(/^\.?\//, '');
  
  // In Cordova or static export, use relative paths
  if (isCordova || (isProd && typeof window !== 'undefined')) {
    return `./${normalizedPath}`;
  }
  
  // In Next.js dev, use absolute paths
  return `/${normalizedPath}`;
}

/**
 * Get background image URL for CSS
 */
export function getBackgroundUrl(path: string): string {
  return `url(${getAssetPath(path)})`;
}

export default getAssetPath;
