import { 
  Collection,
  CollectionCreateRequest,
  CollectionUpdateRequest,
  CollectionAddAssetRequest,
  CollectionRemoveAssetRequest,
  CollectionReorderAssetsRequest,
  CollectionSearchParams,
  CollectionType,
  CollectionVisibility
} from '../../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';
import api from './api';

export class CollectionService {
  /**
   * Get all collections with optional filtering and pagination
   */
  async getCollections(params: CollectionSearchParams = {}): Promise<PaginatedResponse<Collection>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Collection>>>('/collections', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  }

  /**
   * Get a collection by ID
   */
  async getCollectionById(id: string): Promise<Collection> {
    try {
      const response = await api.get<ApiResponse<Collection>>(`/collections/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching collection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(data: CollectionCreateRequest): Promise<Collection> {
    try {
      const response = await api.post<ApiResponse<Collection>>('/collections', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Update an existing collection
   */
  async updateCollection(id: string, data: CollectionUpdateRequest): Promise<Collection> {
    try {
      const response = await api.patch<ApiResponse<Collection>>(`/collections/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating collection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<void> {
    try {
      await api.delete(`/collections/${id}`);
    } catch (error) {
      console.error(`Error deleting collection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add assets to a collection
   */
  async addAssetsToCollection(id: string, data: CollectionAddAssetRequest): Promise<Collection> {
    try {
      const response = await api.post<ApiResponse<Collection>>(`/collections/${id}/assets`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error adding assets to collection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove assets from a collection
   */
  async removeAssetsFromCollection(id: string, data: CollectionRemoveAssetRequest): Promise<Collection> {
    try {
      const response = await api.delete<ApiResponse<Collection>>(`/collections/${id}/assets`, {
        params: { assetIds: data.assetIds.join(',') }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error removing assets from collection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reorder assets in a collection
   */
  async reorderCollectionAssets(id: string, data: CollectionReorderAssetsRequest): Promise<Collection> {
    try {
      const response = await api.patch<ApiResponse<Collection>>(`/collections/${id}/assets/reorder`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error reordering assets in collection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get collections by type
   */
  async getCollectionsByType(type: CollectionType): Promise<Collection[]> {
    try {
      const response = await api.get<ApiResponse<Collection[]>>(`/collections/type/${type}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching collections of type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Get collections by visibility
   */
  async getCollectionsByVisibility(visibility: CollectionVisibility): Promise<Collection[]> {
    try {
      const response = await api.get<ApiResponse<Collection[]>>(`/collections/visibility/${visibility}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching collections with visibility ${visibility}:`, error);
      throw error;
    }
  }

  /**
   * Get featured collections
   */
  async getFeaturedCollections(): Promise<Collection[]> {
    try {
      const response = await api.get<ApiResponse<Collection[]>>('/collections/featured');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching featured collections:', error);
      throw error;
    }
  }

  /**
   * Get collections created by a user
   */
  async getUserCollections(userId: string): Promise<Collection[]> {
    try {
      const response = await api.get<ApiResponse<Collection[]>>(`/collections/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching collections for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const collectionService = new CollectionService(); 