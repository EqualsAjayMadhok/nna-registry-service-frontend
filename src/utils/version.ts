/**
 * Application version information for cache busting and debugging
 */
export const APP_VERSION = '1.2.0';
export const BUILD_TIMESTAMP = new Date().toISOString();
export const BUILD_ID = `NNA_${APP_VERSION}_${Date.now()}`;

// Log build info on startup to help with debugging
console.log(`NNA Registry Service - Frontend
Version: ${APP_VERSION}
Build ID: ${BUILD_ID}
Build Time: ${BUILD_TIMESTAMP}
`);

/**
 * Release notes for each version
 */
export const RELEASE_NOTES = {
  '1.2.0': [
    'Enhanced sequential numbering fixes - now using 011 minimum',
    'Added multi-layered solution for sequential number issue',
    'Improved DOM manipulation emergency fix for deployment issues',
    'Added version and build ID for cache busting',
    'Implemented timestamp-based cache invalidation'
  ],
  '1.1.0': [
    'Fixed sequential numbering in NNA addresses',
    'Added forced sequential number demo page',
    'Improved debugging with detailed logging',
    'Added toggle for force higher sequential numbers',
  ],
  '1.0.1': [
    'Initial setup of NNA Registry Service',
    'Basic asset registration workflow',
    'NNA addressing system implementation',
  ],
};

/**
 * Current version release notes
 */
export const CURRENT_RELEASE_NOTES = RELEASE_NOTES[APP_VERSION] || [];

/**
 * Force a browser refresh, clearing caches
 * This helps with fixing stubborn deployment issues
 */
export function forceRefresh() {
  console.log('Forcing page refresh to clear caches...');
  
  // Clear application cache if possible
  if (window.caches) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
  
  // Force reload from server, bypassing cache
  window.location.reload();
}