import axios from 'axios';
import { Asset } from '../types/asset.types';
import assetService from '../services/api/asset.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Recommendation types supported by the AlgoRhythm service
 */
export enum RecommendationType {
  SIMILAR = 'similar',
  USED_TOGETHER = 'usedTogether',
  TRENDING = 'trending',
  POPULAR = 'popular',
  PERSONALIZED = 'personalized',
  COMPLEMENTARY = 'complementary'
}

/**
 * Recommendation reason type
 */
export interface RecommendationReason {
  type: string;
  description: string;
  score?: number;
  metadata?: Record<string, any>;
}

/**
 * Recommendation item with asset and reason
 */
export interface RecommendationItem {
  asset: Asset;
  reason: RecommendationReason;
}

/**
 * Recommendation options for filtering and configuration
 */
export interface RecommendationOptions {
  limit?: number;
  types?: RecommendationType[];
  layer?: string;
  userId?: string;
  context?: Record<string, any>;
}

/**
 * Service class to interact with the AlgoRhythm recommendation service
 */
class RecommendationService {
  private baseUrl: string;
  
  constructor() {
    // In a real environment, this would come from environment variables
    this.baseUrl = process.env.REACT_APP_ALGORHYTHM_API_URL || 'https://api.algorhythm.reviz.io';
  }
  
  /**
   * Check if we should use mock data instead of real API
   */
  private useMockData(): boolean {
    return process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
      (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
  }
  
  /**
   * Get recommendations similar to a specific asset
   * @param assetId ID of the asset to get recommendations for
   * @param options Additional options to filter recommendations
   * @returns Promise with recommendation items
   */
  public async getSimilarAssets(
    assetId: string, 
    options: RecommendationOptions = {}
  ): Promise<RecommendationItem[]> {
    try {
      if (this.useMockData()) {
        return this.getMockSimilarAssets(assetId, options);
      }
      
      const response = await axios.get(
        `${this.baseUrl}/recommendations/similar/${assetId}`,
        {
          params: {
            limit: options.limit || 5,
            layer: options.layer,
            ...options.context
          }
        }
      );
      
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching similar assets:', error);
      throw new Error('Failed to fetch similar assets recommendations');
    }
  }
  
  /**
   * Get assets frequently used together with a specific asset
   * @param assetId ID of the asset to get recommendations for
   * @param options Additional options to filter recommendations
   * @returns Promise with recommendation items
   */
  public async getAssetsUsedTogether(
    assetId: string, 
    options: RecommendationOptions = {}
  ): Promise<RecommendationItem[]> {
    try {
      if (this.useMockData()) {
        return this.getMockAssetsUsedTogether(assetId, options);
      }
      
      const response = await axios.get(
        `${this.baseUrl}/recommendations/used-together/${assetId}`,
        {
          params: {
            limit: options.limit || 5,
            layer: options.layer,
            ...options.context
          }
        }
      );
      
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching assets used together:', error);
      throw new Error('Failed to fetch assets used together recommendations');
    }
  }
  
  /**
   * Get personalized recommendations for a user
   * @param userId ID of the user to get recommendations for
   * @param options Additional options to filter recommendations
   * @returns Promise with recommendation items
   */
  public async getPersonalizedRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): Promise<RecommendationItem[]> {
    try {
      if (this.useMockData()) {
        return this.getMockPersonalizedRecommendations(userId, options);
      }
      
      const response = await axios.get(
        `${this.baseUrl}/recommendations/personalized/${userId}`,
        {
          params: {
            limit: options.limit || 5,
            layer: options.layer,
            ...options.context
          }
        }
      );
      
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      throw new Error('Failed to fetch personalized recommendations');
    }
  }
  
  /**
   * Get trending assets within a specific time period
   * @param options Additional options to filter recommendations
   * @returns Promise with recommendation items
   */
  public async getTrendingAssets(
    options: RecommendationOptions = {}
  ): Promise<RecommendationItem[]> {
    try {
      if (this.useMockData()) {
        return this.getMockTrendingAssets(options);
      }
      
      const response = await axios.get(
        `${this.baseUrl}/recommendations/trending`,
        {
          params: {
            limit: options.limit || 5,
            layer: options.layer,
            ...options.context
          }
        }
      );
      
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching trending assets:', error);
      throw new Error('Failed to fetch trending assets recommendations');
    }
  }
  
  /**
   * Get recommendations of assets that complement a specific asset
   * @param assetId ID of the asset to get complementary recommendations for
   * @param options Additional options to filter recommendations
   * @returns Promise with recommendation items
   */
  public async getComplementaryAssets(
    assetId: string,
    options: RecommendationOptions = {}
  ): Promise<RecommendationItem[]> {
    try {
      if (this.useMockData()) {
        return this.getMockComplementaryAssets(assetId, options);
      }
      
      const response = await axios.get(
        `${this.baseUrl}/recommendations/complementary/${assetId}`,
        {
          params: {
            limit: options.limit || 5,
            layer: options.layer,
            ...options.context
          }
        }
      );
      
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching complementary assets:', error);
      throw new Error('Failed to fetch complementary assets recommendations');
    }
  }
  
  /**
   * Get batch recommendations for multiple recommendation types at once
   * @param assetId ID of the asset to get recommendations for
   * @param types Array of recommendation types to fetch
   * @param options Additional options to filter recommendations
   * @returns Promise with object mapping recommendation types to items
   */
  public async getBatchRecommendations(
    assetId: string,
    types: RecommendationType[],
    options: RecommendationOptions = {}
  ): Promise<Record<RecommendationType, RecommendationItem[]>> {
    try {
      if (this.useMockData()) {
        return this.getMockBatchRecommendations(assetId, types, options);
      }
      
      const response = await axios.post(
        `${this.baseUrl}/recommendations/batch`,
        {
          assetId,
          types,
          limit: options.limit || 5,
          layer: options.layer,
          context: options.context
        }
      );
      
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching batch recommendations:', error);
      throw new Error('Failed to fetch batch recommendations');
    }
  }
  
  // MOCK DATA IMPLEMENTATION
  
  /**
   * Generate mock similar assets for development
   */
  private async getMockSimilarAssets(
    assetId: string,
    options: RecommendationOptions
  ): Promise<RecommendationItem[]> {
    // First get all assets
    try {
      const assets = await assetService.getAssets({ limit: 20 });
      
      // Filter out the current asset
      let filteredAssets = assets.items.filter(asset => asset.id !== assetId);
      
      // Filter by layer if specified
      if (options.layer) {
        filteredAssets = filteredAssets.filter(asset => asset.layer === options.layer);
      }
      
      // Get the current asset for similarity context
      const currentAsset = await assetService.getAssetById(assetId);
      
      // Generate similarity scores and reasons
      const recommendations: RecommendationItem[] = filteredAssets
        .slice(0, options.limit || 5)
        .map(asset => {
          // Generate a similarity score between 0.6 and 0.99
          const similarityScore = 0.6 + Math.random() * 0.39;
          
          // Generate a reason based on attributes
          let reasonText = "";
          let reasonType = "";
          
          if (asset.layer === currentAsset.layer) {
            reasonType = "layer";
            reasonText = `Same layer as "${currentAsset.name}"`;
          } else if (asset.category === currentAsset.category) {
            reasonType = "category";
            reasonText = `Same category as "${currentAsset.name}"`;
          } else if (
            currentAsset.tags && 
            asset.tags && 
            currentAsset.tags.some(tag => asset.tags?.includes(tag))
          ) {
            reasonType = "tags";
            // Find matching tags
            const matchingTags = currentAsset.tags
              .filter(tag => asset.tags?.includes(tag))
              .join(", ");
            reasonText = `Matching tags: ${matchingTags}`;
          } else {
            reasonType = "content";
            reasonText = `Similar content to "${currentAsset.name}"`;
          }
          
          return {
            asset,
            reason: {
              type: reasonType,
              description: reasonText,
              score: similarityScore,
              metadata: {
                matchingAttributes: {
                  layer: asset.layer === currentAsset.layer,
                  category: asset.category === currentAsset.category,
                  subcategory: asset.subcategory === currentAsset.subcategory
                }
              }
            }
          };
        });
      
      // Sort by score descending
      recommendations.sort((a, b) => 
        (b.reason.score || 0) - (a.reason.score || 0)
      );
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return recommendations;
    } catch (error) {
      console.error('Error generating mock similar assets:', error);
      return [];
    }
  }
  
  /**
   * Generate mock assets used together
   */
  private async getMockAssetsUsedTogether(
    assetId: string,
    options: RecommendationOptions
  ): Promise<RecommendationItem[]> {
    try {
      const assets = await assetService.getAssets({ limit: 20 });
      
      // Filter out the current asset
      let filteredAssets = assets.items.filter(asset => asset.id !== assetId);
      
      // Filter by layer if specified (for used together, we often want different layers)
      if (options.layer) {
        filteredAssets = filteredAssets.filter(asset => asset.layer === options.layer);
      }
      
      // Get the current asset for context
      const currentAsset = await assetService.getAssetById(assetId);
      
      // Generate usage patterns and reasons
      const recommendations: RecommendationItem[] = filteredAssets
        .slice(0, options.limit || 5)
        .map(asset => {
          // Generate a co-occurrence score between 0.5 and 0.95
          const coOccurrenceScore = 0.5 + Math.random() * 0.45;
          
          // Generate a reason
          const reasonText = `Often used with "${currentAsset.name}" in ${Math.floor(Math.random() * 20 + 10)} compositions`;
          
          return {
            asset,
            reason: {
              type: "co-occurrence",
              description: reasonText,
              score: coOccurrenceScore,
              metadata: {
                coOccurrenceCount: Math.floor(Math.random() * 20 + 10),
                lastUsedTogether: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
              }
            }
          };
        });
      
      // Sort by score descending
      recommendations.sort((a, b) => 
        (b.reason.score || 0) - (a.reason.score || 0)
      );
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return recommendations;
    } catch (error) {
      console.error('Error generating mock assets used together:', error);
      return [];
    }
  }
  
  /**
   * Generate mock personalized recommendations
   */
  private async getMockPersonalizedRecommendations(
    userId: string,
    options: RecommendationOptions
  ): Promise<RecommendationItem[]> {
    try {
      const assets = await assetService.getAssets({ limit: 20 });
      
      // Filter by layer if specified
      let filteredAssets = [...assets.items];
      if (options.layer) {
        filteredAssets = filteredAssets.filter(asset => asset.layer === options.layer);
      }
      
      // Generate recommendations with personal reasons
      const recommendations: RecommendationItem[] = filteredAssets
        .slice(0, options.limit || 5)
        .map(asset => {
          // Generate a personalization score between 0.7 and 0.99
          const personalizationScore = 0.7 + Math.random() * 0.29;
          
          // Generate a reason from a list of personalized reasons
          const personalReasons = [
            `Based on your usage history`,
            `Similar to assets you've recently used`,
            `Matches your style preferences`,
            `Popular among creators with similar taste`,
            `You might like this based on your recent activity`
          ];
          
          const randomReasonIndex = Math.floor(Math.random() * personalReasons.length);
          
          return {
            asset,
            reason: {
              type: "personalized",
              description: personalReasons[randomReasonIndex],
              score: personalizationScore,
              metadata: {
                userInteractionHistory: Math.floor(Math.random() * 10),
                userPreferenceMatch: Math.round(personalizationScore * 100) / 100
              }
            }
          };
        });
      
      // Sort by score descending
      recommendations.sort((a, b) => 
        (b.reason.score || 0) - (a.reason.score || 0)
      );
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return recommendations;
    } catch (error) {
      console.error('Error generating mock personalized recommendations:', error);
      return [];
    }
  }
  
  /**
   * Generate mock trending assets
   */
  private async getMockTrendingAssets(
    options: RecommendationOptions
  ): Promise<RecommendationItem[]> {
    try {
      const assets = await assetService.getAssets({ limit: 20 });
      
      // Filter by layer if specified
      let filteredAssets = [...assets.items];
      if (options.layer) {
        filteredAssets = filteredAssets.filter(asset => asset.layer === options.layer);
      }
      
      // Generate recommendations with trending reasons
      const recommendations: RecommendationItem[] = filteredAssets
        .slice(0, options.limit || 5)
        .map(asset => {
          // Generate a trending score between 0.6 and 0.99
          const trendingScore = 0.6 + Math.random() * 0.39;
          
          // Generate usage growth percentage between 20% and 120%
          const usageGrowth = 20 + Math.floor(Math.random() * 100);
          
          // Generate a reason
          const reasonText = `${usageGrowth}% increase in usage over the last 7 days`;
          
          return {
            asset,
            reason: {
              type: "trending",
              description: reasonText,
              score: trendingScore,
              metadata: {
                trendingIndex: Math.round(trendingScore * 100) / 100,
                usageGrowth: usageGrowth,
                trendingPeriod: "7 days"
              }
            }
          };
        });
      
      // Sort by score descending
      recommendations.sort((a, b) => 
        (b.reason.score || 0) - (a.reason.score || 0)
      );
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return recommendations;
    } catch (error) {
      console.error('Error generating mock trending assets:', error);
      return [];
    }
  }
  
  /**
   * Generate mock complementary assets
   */
  private async getMockComplementaryAssets(
    assetId: string,
    options: RecommendationOptions
  ): Promise<RecommendationItem[]> {
    try {
      const assets = await assetService.getAssets({ limit: 20 });
      
      // Filter out the current asset
      let filteredAssets = assets.items.filter(asset => asset.id !== assetId);
      
      // For complementary assets, we usually want different layers
      const currentAsset = await assetService.getAssetById(assetId);
      
      // Filter by specified layer, or if not specified, prefer different layers than the current asset
      if (options.layer) {
        filteredAssets = filteredAssets.filter(asset => asset.layer === options.layer);
      } else {
        // Prioritize different layers for complementary assets
        filteredAssets.sort((a, b) => {
          const aIsSameLayer = a.layer === currentAsset.layer ? 1 : 0;
          const bIsSameLayer = b.layer === currentAsset.layer ? 1 : 0;
          return aIsSameLayer - bIsSameLayer;
        });
      }
      
      // Generate complementary reasons
      const recommendations: RecommendationItem[] = filteredAssets
        .slice(0, options.limit || 5)
        .map(asset => {
          // Generate a compatibility score between 0.7 and 0.99
          const compatibilityScore = 0.7 + Math.random() * 0.29;
          
          let reasonText = "";
          
          // Recommend different layer assets when possible
          if (asset.layer !== currentAsset.layer) {
            reasonText = `Complements "${currentAsset.name}" (${currentAsset.layer}) as a ${asset.layer}`;
          } else {
            reasonText = `Complements "${currentAsset.name}" with similar style`;
          }
          
          return {
            asset,
            reason: {
              type: "complementary",
              description: reasonText,
              score: compatibilityScore,
              metadata: {
                compatibilityIndex: Math.round(compatibilityScore * 100) / 100,
                layerMatch: asset.layer !== currentAsset.layer,
                styleMatch: 0.8 + Math.random() * 0.2 // Random style match between 0.8 and 1.0
              }
            }
          };
        });
      
      // Sort by score descending
      recommendations.sort((a, b) => 
        (b.reason.score || 0) - (a.reason.score || 0)
      );
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return recommendations;
    } catch (error) {
      console.error('Error generating mock complementary assets:', error);
      return [];
    }
  }
  
  /**
   * Generate mock batch recommendations
   */
  private async getMockBatchRecommendations(
    assetId: string,
    types: RecommendationType[],
    options: RecommendationOptions
  ): Promise<Record<RecommendationType, RecommendationItem[]>> {
    try {
      const results: Record<RecommendationType, RecommendationItem[]> = {} as Record<RecommendationType, RecommendationItem[]>;
      
      // Generate recommendations for each requested type
      await Promise.all(types.map(async (type) => {
        switch (type) {
          case RecommendationType.SIMILAR:
            results[type] = await this.getMockSimilarAssets(assetId, options);
            break;
          case RecommendationType.USED_TOGETHER:
            results[type] = await this.getMockAssetsUsedTogether(assetId, options);
            break;
          case RecommendationType.TRENDING:
            results[type] = await this.getMockTrendingAssets(options);
            break;
          case RecommendationType.PERSONALIZED:
            results[type] = await this.getMockPersonalizedRecommendations(options.userId || 'user-1', options);
            break;
          case RecommendationType.COMPLEMENTARY:
            results[type] = await this.getMockComplementaryAssets(assetId, options);
            break;
          default:
            results[type] = [];
        }
      }));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return results;
    } catch (error) {
      console.error('Error generating mock batch recommendations:', error);
      return {} as Record<RecommendationType, RecommendationItem[]>;
    }
  }
}

// Export singleton instance
const recommendationService = new RecommendationService();
export default recommendationService;