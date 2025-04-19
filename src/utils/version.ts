/**
 * Application version information for cache busting and debugging
 */
export const APP_VERSION = '1.1.0';
export const BUILD_TIMESTAMP = new Date().toISOString();

/**
 * Release notes for each version
 */
export const RELEASE_NOTES = {
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