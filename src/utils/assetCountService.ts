/**
 * Asset Count Service
 * 
 * A dedicated service for getting asset counts by layer, category, and subcategory.
 * This is used for generating sequential numbers in the NNA addressing system.
 */

import api from '../services/api/api';
import { APP_VERSION } from './version';

// Define mock data for testing when API is unavailable
const MOCK_COUNTS: Record<string, number> = {
  'S.POP.BAS': 2,  // Star.Pop.Base
  'G.POP.BAS': 3,  // Song.Pop.Base
  'L.FAS.DRS': 1,  // Look.Fashion.Dress
  'M.DNC.CHR': 4,  // Move.Dance.Choreography
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
  console.log(`[Asset Count] Getting count for ${layer}.${category}.${subcategory} (v${APP_VERSION})`);
  
  try {
    // Try to get the count from the backend API
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
      return response.data.data.count;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.warn('[Asset Count] Error fetching from API, using mock data:', error);
    
    // Use mock data as fallback
    const key = `${layer}.${category}.${subcategory}`;
    
    // Return the mock count if available, or an auto-generated count
    if (MOCK_COUNTS[key] !== undefined) {
      console.log(`[Asset Count] Using mock count for ${key}: ${MOCK_COUNTS[key]}`);
      return MOCK_COUNTS[key];
    }
    
    // Generate a random but consistent count based on the key
    // This ensures the same key always gets the same count during a session
    const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const generatedCount = (hash % 5) + 1; // Generate a number between the range of 1 to 5
    
    console.log(`[Asset Count] Generated count for ${key}: ${generatedCount}`);
    return generatedCount;
  }
}