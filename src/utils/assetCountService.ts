/**
 * Asset Count Service
 * 
 * A dedicated service for getting asset counts by layer, category, and subcategory.
 * This is used for generating sequential numbers in the NNA addressing system.
 */

import api from '../services/api/api';
import { APP_VERSION } from './version';

/**
 * Cache for asset counts to avoid excessive API calls
 * Keys are in format "layer.category.subcategory"
 */
interface CountCache {
  [key: string]: {
    count: number;
    timestamp: number;
  };
}

// In-memory cache with a 5-minute expiration
const countCache: CountCache = {};
const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

// Define mock data for testing when API is unavailable
const MOCK_COUNTS: Record<string, number> = {
  'S.POP.BAS': 1,  // Star.Pop.Base
  'G.POP.BAS': 2,  // Song.Pop.Base
  'L.FAS.DRS': 1,  // Look.Fashion.Dress
  'M.DNC.CHR': 3,  // Move.Dance.Choreography
};

/**
 * Get the count of existing assets for a specific layer, category, subcategory combination
 * @param layer Layer code (e.g. 'S', 'G', 'L')
 * @param category Category code (e.g. 'POP', '001')
 * @param subcategory Subcategory code (e.g. 'BAS', '001')
 * @returns Promise resolving to the count of matching assets
 */
export async function getExistingAssetsCount(
  layer: string,
  category: string,
  subcategory: string
): Promise<number> {
  if (!layer || !category || !subcategory) {
    console.error('[Asset Count] Missing required parameters');
    return 0;
  }

  const cacheKey = `${layer}.${category}.${subcategory}`;
  const now = Date.now();
  
  // Check if we have a valid cached value
  if (countCache[cacheKey] && (now - countCache[cacheKey].timestamp) < CACHE_EXPIRATION_MS) {
    console.log(`[Asset Count] Using cached count for ${cacheKey}: ${countCache[cacheKey].count}`);
    return countCache[cacheKey].count;
  }
  
  console.log(`[Asset Count] Getting count for ${cacheKey} (v${APP_VERSION})`);
  
  try {
    // Try to get the count from the backend API
    // NOTE: We are NOT including authentication headers for this endpoint
    const response = await api.get(`/assets/count`, { 
      params: {
        layer,
        category,
        subcategory
      }
    });
    
    console.log('[Asset Count] API response:', response.data);
    
    // Extract count from response
    if (response.data?.data?.count !== undefined) {
      const count = response.data.data.count;
      
      // Cache the result
      countCache[cacheKey] = {
        count,
        timestamp: now
      };
      
      return count;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.warn('[Asset Count] Error fetching from API, using fallback strategy:', error);
    
    // Use fallback strategies
    return getFallbackCount(cacheKey);
  }
}

/**
 * Get a fallback count when the API is unavailable
 * Uses several strategies to ensure consistent values
 */
function getFallbackCount(key: string): number {
  // Strategy 1: Use predefined mock data
  if (MOCK_COUNTS[key] !== undefined) {
    console.log(`[Asset Count] Using mock count for ${key}: ${MOCK_COUNTS[key]}`);
    
    // Cache mock data too
    countCache[key] = {
      count: MOCK_COUNTS[key],
      timestamp: Date.now()
    };
    
    return MOCK_COUNTS[key];
  }
  
  // Strategy 2: Generate a deterministic count based on the key
  // This ensures the same key always gets the same count across sessions
  const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const generatedCount = (hash % 3) + 1; // Generate a number between 1 and 3
  
  console.log(`[Asset Count] Generated count for ${key}: ${generatedCount}`);
  
  // Cache generated count too
  countCache[key] = {
    count: generatedCount,
    timestamp: Date.now()
  };
  
  return generatedCount;
}

/**
 * Clear the asset count cache
 * Useful after creating or updating assets
 */
export function clearAssetCountCache() {
  console.log('[Asset Count] Clearing cache');
  Object.keys(countCache).forEach(key => {
    delete countCache[key];
  });
}