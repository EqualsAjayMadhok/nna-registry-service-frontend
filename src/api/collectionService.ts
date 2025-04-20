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
} from '../types/asset.types';
import api from '../services/api/api';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * CollectionService
 * Handles all operations related to asset collections
 */
class CollectionService {
  // Mock collection data for development
  private mockCollections: Collection[] = [];
  private useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
    (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';

  constructor() {
    // Initialize with some mock collections if using mock data
    if (this.useMockData) {
      this.generateMockCollections();
    }
  }

  /**
   * Get all collections with optional filtering
   */
  async getCollections(params: CollectionSearchParams = {}): Promise<PaginatedResponse<Collection>> {
    try {
      if (this.useMockData) {
        return this.getMockCollections(params);
      }

      const response = await api.get<ApiResponse<PaginatedResponse<Collection>>>('/collections', { 
        params 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw new Error('Failed to fetch collections');
    }
  }

  /**
   * Get a single collection by ID
   */
  async getCollection(id: string): Promise<Collection> {
    try {
      if (this.useMockData) {
        const collection = this.mockCollections.find(c => c.id === id);
        if (!collection) {
          throw new Error(`Collection with ID ${id} not found`);
        }
        return collection;
      }

      const response = await api.get<ApiResponse<Collection>>(`/collections/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching collection with ID ${id}:`, error);
      throw new Error('Failed to fetch collection');
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(collection: CollectionCreateRequest): Promise<Collection> {
    try {
      if (this.useMockData) {
        const newCollection: Collection = {
          id: uuidv4(),
          name: collection.name,
          description: collection.description,
          type: collection.type,
          visibility: collection.visibility,
          coverImageUrl: collection.coverImageUrl,
          assetCount: collection.assetIds?.length || 0,
          assets: (collection.assetIds || []).map((assetId, index) => ({
            assetId,
            addedAt: new Date().toISOString(),
            addedBy: 'current-user',
            order: index
          })),
          tags: collection.tags || [],
          metadata: collection.metadata || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user',
          viewCount: 0,
          featured: false
        };
        this.mockCollections.push(newCollection);
        return newCollection;
      }

      const response = await api.post<ApiResponse<Collection>>('/collections', collection);
      return response.data.data;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw new Error('Failed to create collection');
    }
  }

  /**
   * Update an existing collection
   */
  async updateCollection(id: string, updates: CollectionUpdateRequest): Promise<Collection> {
    try {
      if (this.useMockData) {
        const collectionIndex = this.mockCollections.findIndex(c => c.id === id);
        if (collectionIndex === -1) {
          throw new Error(`Collection with ID ${id} not found`);
        }
        
        const updatedCollection = {
          ...this.mockCollections[collectionIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        this.mockCollections[collectionIndex] = updatedCollection;
        return updatedCollection;
      }

      const response = await api.put<ApiResponse<Collection>>(`/collections/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating collection with ID ${id}:`, error);
      throw new Error('Failed to update collection');
    }
  }

  /**
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<void> {
    try {
      if (this.useMockData) {
        const collectionIndex = this.mockCollections.findIndex(c => c.id === id);
        if (collectionIndex === -1) {
          throw new Error(`Collection with ID ${id} not found`);
        }
        this.mockCollections.splice(collectionIndex, 1);
        return;
      }

      await api.delete(`/collections/${id}`);
    } catch (error) {
      console.error(`Error deleting collection with ID ${id}:`, error);
      throw new Error('Failed to delete collection');
    }
  }

  /**
   * Add assets to a collection
   */
  async addAssetsToCollection(id: string, request: CollectionAddAssetRequest): Promise<Collection> {
    try {
      if (this.useMockData) {
        const collectionIndex = this.mockCollections.findIndex(c => c.id === id);
        if (collectionIndex === -1) {
          throw new Error(`Collection with ID ${id} not found`);
        }
        
        const collection = { ...this.mockCollections[collectionIndex] };
        const currentAssetIds = collection.assets.map(a => a.assetId);
        const now = new Date().toISOString();
        
        // Add only new assets that aren't already in the collection
        const newAssets = request.assetIds
          .filter(assetId => !currentAssetIds.includes(assetId))
          .map((assetId, index) => ({
            assetId,
            addedAt: now,
            addedBy: 'current-user',
            order: collection.assets.length + index,
            notes: request.notes
          }));
        
        if (newAssets.length > 0) {
          collection.assets = [...collection.assets, ...newAssets];
          collection.assetCount = collection.assets.length;
          collection.updatedAt = now;
          this.mockCollections[collectionIndex] = collection;
        }
        
        return collection;
      }

      const response = await api.post<ApiResponse<Collection>>(`/collections/${id}/assets`, request);
      return response.data.data;
    } catch (error) {
      console.error(`Error adding assets to collection with ID ${id}:`, error);
      throw new Error('Failed to add assets to collection');
    }
  }

  /**
   * Remove assets from a collection
   */
  async removeAssetsFromCollection(id: string, request: CollectionRemoveAssetRequest): Promise<Collection> {
    try {
      if (this.useMockData) {
        const collectionIndex = this.mockCollections.findIndex(c => c.id === id);
        if (collectionIndex === -1) {
          throw new Error(`Collection with ID ${id} not found`);
        }
        
        const collection = { ...this.mockCollections[collectionIndex] };
        collection.assets = collection.assets.filter(asset => !request.assetIds.includes(asset.assetId));
        collection.assetCount = collection.assets.length;
        collection.updatedAt = new Date().toISOString();
        
        // Reorder remaining assets
        collection.assets = collection.assets.map((asset, index) => ({
          ...asset,
          order: index
        }));
        
        this.mockCollections[collectionIndex] = collection;
        return collection;
      }

      const response = await api.post<ApiResponse<Collection>>(
        `/collections/${id}/assets/remove`,
        request
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error removing assets from collection with ID ${id}:`, error);
      throw new Error('Failed to remove assets from collection');
    }
  }

  /**
   * Reorder assets within a collection
   */
  async reorderCollectionAssets(id: string, request: CollectionReorderAssetsRequest): Promise<Collection> {
    try {
      if (this.useMockData) {
        const collectionIndex = this.mockCollections.findIndex(c => c.id === id);
        if (collectionIndex === -1) {
          throw new Error(`Collection with ID ${id} not found`);
        }
        
        const collection = { ...this.mockCollections[collectionIndex] };
        
        // Update orders for specified assets
        request.assets.forEach(item => {
          const assetIndex = collection.assets.findIndex(a => a.assetId === item.assetId);
          if (assetIndex !== -1) {
            collection.assets[assetIndex] = {
              ...collection.assets[assetIndex],
              order: item.order
            };
          }
        });
        
        // Sort assets by order
        collection.assets.sort((a, b) => a.order - b.order);
        collection.updatedAt = new Date().toISOString();
        
        this.mockCollections[collectionIndex] = collection;
        return collection;
      }

      const response = await api.put<ApiResponse<Collection>>(
        `/collections/${id}/assets/order`, 
        request
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error reordering assets in collection with ID ${id}:`, error);
      throw new Error('Failed to reorder collection assets');
    }
  }

  /**
   * Get collections that contain a specific asset
   */
  async getCollectionsForAsset(assetId: string): Promise<Collection[]> {
    try {
      if (this.useMockData) {
        return this.mockCollections.filter(collection => 
          collection.assets.some(asset => asset.assetId === assetId)
        );
      }

      const response = await api.get<ApiResponse<Collection[]>>(`/assets/${assetId}/collections`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching collections for asset with ID ${assetId}:`, error);
      throw new Error('Failed to fetch collections for asset');
    }
  }

  /**
   * Get featured collections
   */
  async getFeaturedCollections(limit: number = 5): Promise<Collection[]> {
    try {
      if (this.useMockData) {
        return this.mockCollections
          .filter(collection => collection.featured)
          .slice(0, limit);
      }

      const response = await api.get<ApiResponse<Collection[]>>('/collections/featured', {
        params: { limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching featured collections:', error);
      throw new Error('Failed to fetch featured collections');
    }
  }

  /**
   * Generate mock collections for development
   */
  private generateMockCollections(): void {
    // Personal collections
    this.mockCollections = [
      {
        id: '1',
        name: 'My Favorite Assets',
        description: 'A collection of my favorite assets for quick access',
        type: CollectionType.PERSONAL,
        visibility: CollectionVisibility.PRIVATE,
        coverImageUrl: 'https://picsum.photos/seed/collection1/400/300',
        assetCount: 12,
        assets: Array.from({ length: 12 }, (_, i) => ({
          assetId: `asset-${i + 1}`,
          addedAt: new Date(Date.now() - i * 86400000).toISOString(),
          addedBy: 'current-user',
          order: i
        })),
        tags: ['favorites', 'personal'],
        createdAt: '2023-01-15T12:00:00Z',
        updatedAt: '2023-05-20T14:30:00Z',
        createdBy: 'current-user',
        viewCount: 45,
        featured: false
      },
      {
        id: '2',
        name: 'Project X Assets',
        description: 'Assets collected for Project X',
        type: CollectionType.PROJECT,
        visibility: CollectionVisibility.SHARED,
        coverImageUrl: 'https://picsum.photos/seed/collection2/400/300',
        assetCount: 8,
        assets: Array.from({ length: 8 }, (_, i) => ({
          assetId: `asset-${i + 20}`,
          addedAt: new Date(Date.now() - i * 86400000).toISOString(),
          addedBy: 'current-user',
          order: i
        })),
        tags: ['project-x', 'work'],
        permissions: [
          {
            userId: 'user-2',
            role: 'viewer',
            addedAt: '2023-02-15T10:00:00Z',
            addedBy: 'current-user'
          },
          {
            userId: 'user-3',
            role: 'editor',
            addedAt: '2023-02-15T10:00:00Z',
            addedBy: 'current-user'
          }
        ],
        createdAt: '2023-02-15T10:00:00Z',
        updatedAt: '2023-06-10T09:45:00Z',
        createdBy: 'current-user',
        viewCount: 28,
        featured: false
      },
      {
        id: '3',
        name: 'Best Songs Collection',
        description: 'A curated collection of the best songs on the platform',
        type: CollectionType.CURATED,
        visibility: CollectionVisibility.PUBLIC,
        coverImageUrl: 'https://picsum.photos/seed/collection3/400/300',
        assetCount: 15,
        assets: Array.from({ length: 15 }, (_, i) => ({
          assetId: `asset-${i + 40}`,
          addedAt: new Date(Date.now() - i * 86400000).toISOString(),
          addedBy: 'current-user',
          order: i,
          notes: i % 3 === 0 ? 'Top-rated song with excellent composition' : undefined
        })),
        tags: ['songs', 'curated', 'music'],
        createdAt: '2023-03-05T15:30:00Z',
        updatedAt: '2023-07-01T11:20:00Z',
        createdBy: 'current-user',
        viewCount: 156,
        featured: true,
        slug: 'best-songs-collection'
      },
      {
        id: '4',
        name: 'Featured Looks',
        description: 'Editor-curated collection of the best looks',
        type: CollectionType.FEATURED,
        visibility: CollectionVisibility.PUBLIC,
        coverImageUrl: 'https://picsum.photos/seed/collection4/400/300',
        assetCount: 10,
        assets: Array.from({ length: 10 }, (_, i) => ({
          assetId: `asset-${i + 60}`,
          addedAt: new Date(Date.now() - i * 86400000).toISOString(),
          addedBy: 'admin-user',
          order: i
        })),
        tags: ['looks', 'featured', 'editor-choice'],
        createdAt: '2023-04-12T09:00:00Z',
        updatedAt: '2023-06-28T16:15:00Z',
        createdBy: 'admin-user',
        viewCount: 342,
        featured: true,
        slug: 'featured-looks'
      },
      {
        id: '5',
        name: 'Trending Worlds',
        description: 'Most popular world assets this month',
        type: CollectionType.SYSTEM,
        visibility: CollectionVisibility.PUBLIC,
        coverImageUrl: 'https://picsum.photos/seed/collection5/400/300',
        assetCount: 6,
        assets: Array.from({ length: 6 }, (_, i) => ({
          assetId: `asset-${i + 80}`,
          addedAt: new Date(Date.now() - i * 86400000).toISOString(),
          addedBy: 'system',
          order: i
        })),
        tags: ['worlds', 'trending', 'popular'],
        createdAt: '2023-05-01T00:00:00Z',
        updatedAt: '2023-07-01T00:00:00Z',
        createdBy: 'system',
        viewCount: 523,
        featured: true,
        slug: 'trending-worlds'
      }
    ];
  }

  /**
   * Get mock collections with pagination and filtering
   */
  private getMockCollections(params: CollectionSearchParams = {}): PaginatedResponse<Collection> {
    let filteredCollections = [...this.mockCollections];
    
    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredCollections = filteredCollections.filter(collection => 
        collection.name.toLowerCase().includes(query) || 
        (collection.description && collection.description.toLowerCase().includes(query))
      );
    }
    
    if (params.type) {
      filteredCollections = filteredCollections.filter(collection => 
        collection.type === params.type
      );
    }
    
    if (params.visibility) {
      filteredCollections = filteredCollections.filter(collection => 
        collection.visibility === params.visibility
      );
    }
    
    if (params.tags && params.tags.length > 0) {
      filteredCollections = filteredCollections.filter(collection => 
        collection.tags && params.tags?.some(tag => collection.tags?.includes(tag))
      );
    }
    
    if (params.createdBy) {
      filteredCollections = filteredCollections.filter(collection => 
        collection.createdBy === params.createdBy
      );
    }
    
    if (params.featured !== undefined) {
      filteredCollections = filteredCollections.filter(collection => 
        collection.featured === params.featured
      );
    }
    
    // Sort collections
    if (params.sortBy) {
      filteredCollections.sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        switch (params.sortBy) {
          case 'name':
            valueA = a.name;
            valueB = b.name;
            break;
          case 'createdAt':
            valueA = new Date(a.createdAt).getTime();
            valueB = new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
            valueA = new Date(a.updatedAt).getTime();
            valueB = new Date(b.updatedAt).getTime();
            break;
          case 'viewCount':
            valueA = a.viewCount || 0;
            valueB = b.viewCount || 0;
            break;
          case 'assetCount':
            valueA = a.assetCount;
            valueB = b.assetCount;
            break;
          default:
            valueA = a.updatedAt;
            valueB = b.updatedAt;
        }
        
        // Handle string comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return params.sortDirection === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        
        // Handle numeric comparison
        return params.sortDirection === 'asc' 
          ? (valueA - valueB) 
          : (valueB - valueA);
      });
    } else {
      // Default sort by updatedAt desc
      filteredCollections.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedCollections = filteredCollections.slice(startIndex, endIndex);
    
    return {
      items: paginatedCollections,
      total: filteredCollections.length,
      page,
      limit,
      totalPages: Math.ceil(filteredCollections.length / limit)
    };
  }
}

export default new CollectionService();