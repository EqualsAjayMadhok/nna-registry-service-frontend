import { CollectionService } from '../../../services/api/collection.service';
import api from '../../../services/api/api';
import { Collection, CollectionType, CollectionVisibility } from '../../../types/asset.types';

// Mock the api module
jest.mock('../../../services/api/api');

describe('CollectionService', () => {
  let collectionService: CollectionService;
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    collectionService = new CollectionService();
    jest.clearAllMocks();
  });

  const mockCollection: Collection = {
    id: '1',
    name: 'Test Collection',
    description: 'Test Description',
    type: CollectionType.PERSONAL,
    visibility: CollectionVisibility.PRIVATE,
    assetCount: 0,
    assets: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user1'
  };

  const createMockResponse = <T>(data: T) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  });

  describe('getCollections', () => {
    it('should fetch collections with pagination', async () => {
      const mockResponse = createMockResponse({
        success: true,
        data: {
          items: [mockCollection],
          total: 1,
          page: 1,
          limit: 10,
          hasMore: false,
          totalPages: 1
        }
      });
      mockApi.get.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.getCollections({ page: 1, limit: 10 });

      expect(mockApi.get).toHaveBeenCalledWith('/collections', { params: { page: 1, limit: 10 } });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getCollectionById', () => {
    it('should fetch a collection by id', async () => {
      const mockResponse = createMockResponse({
        success: true,
        data: mockCollection
      });
      mockApi.get.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.getCollectionById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/collections/1');
      expect(result).toEqual(mockCollection);
    });
  });

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      const createRequest = {
        name: 'New Collection',
        type: CollectionType.PERSONAL,
        visibility: CollectionVisibility.PRIVATE
      };
      const mockResponse = createMockResponse({
        success: true,
        data: { ...mockCollection, ...createRequest }
      });
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.createCollection(createRequest);

      expect(mockApi.post).toHaveBeenCalledWith('/collections', createRequest);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('updateCollection', () => {
    it('should update an existing collection', async () => {
      const updateRequest = {
        name: 'Updated Collection',
        description: 'Updated Description'
      };
      const mockResponse = createMockResponse({
        success: true,
        data: { ...mockCollection, ...updateRequest }
      });
      mockApi.patch.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.updateCollection('1', updateRequest);

      expect(mockApi.patch).toHaveBeenCalledWith('/collections/1', updateRequest);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('deleteCollection', () => {
    it('should delete a collection', async () => {
      const mockResponse = createMockResponse({});
      mockApi.delete.mockResolvedValueOnce(mockResponse);

      await collectionService.deleteCollection('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/collections/1');
    });
  });

  describe('addAssetsToCollection', () => {
    it('should add assets to a collection', async () => {
      const addRequest = {
        assetIds: ['asset1', 'asset2']
      };
      const mockResponse = createMockResponse({
        success: true,
        data: { ...mockCollection, assets: addRequest.assetIds.map(id => ({ assetId: id })) }
      });
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.addAssetsToCollection('1', addRequest);

      expect(mockApi.post).toHaveBeenCalledWith('/collections/1/assets', addRequest);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('removeAssetsFromCollection', () => {
    it('should remove assets from a collection', async () => {
      const removeRequest = {
        assetIds: ['asset1', 'asset2']
      };
      const mockResponse = createMockResponse({
        success: true,
        data: { ...mockCollection, assets: [] }
      });
      mockApi.delete.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.removeAssetsFromCollection('1', removeRequest);

      expect(mockApi.delete).toHaveBeenCalledWith('/collections/1/assets', {
        params: { assetIds: 'asset1,asset2' }
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('reorderCollectionAssets', () => {
    it('should reorder assets in a collection', async () => {
      const reorderRequest = {
        assets: [
          { assetId: 'asset1', order: 1 },
          { assetId: 'asset2', order: 2 }
        ]
      };
      const mockResponse = createMockResponse({
        success: true,
        data: { ...mockCollection, assets: reorderRequest.assets }
      });
      mockApi.patch.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.reorderCollectionAssets('1', reorderRequest);

      expect(mockApi.patch).toHaveBeenCalledWith('/collections/1/assets/reorder', reorderRequest);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getCollectionsByType', () => {
    it('should fetch collections by type', async () => {
      const mockResponse = createMockResponse({
        success: true,
        data: [mockCollection]
      });
      mockApi.get.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.getCollectionsByType(CollectionType.PERSONAL);

      expect(mockApi.get).toHaveBeenCalledWith('/collections/type/personal');
      expect(result).toEqual([mockCollection]);
    });
  });

  describe('getCollectionsByVisibility', () => {
    it('should fetch collections by visibility', async () => {
      const mockResponse = createMockResponse({
        success: true,
        data: [mockCollection]
      });
      mockApi.get.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.getCollectionsByVisibility(CollectionVisibility.PRIVATE);

      expect(mockApi.get).toHaveBeenCalledWith('/collections/visibility/private');
      expect(result).toEqual([mockCollection]);
    });
  });

  describe('getFeaturedCollections', () => {
    it('should fetch featured collections', async () => {
      const mockResponse = createMockResponse({
        success: true,
        data: [mockCollection]
      });
      mockApi.get.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.getFeaturedCollections();

      expect(mockApi.get).toHaveBeenCalledWith('/collections/featured');
      expect(result).toEqual([mockCollection]);
    });
  });

  describe('getUserCollections', () => {
    it('should fetch collections by user id', async () => {
      const mockResponse = createMockResponse({
        success: true,
        data: [mockCollection]
      });
      mockApi.get.mockResolvedValueOnce(mockResponse);

      const result = await collectionService.getUserCollections('user1');

      expect(mockApi.get).toHaveBeenCalledWith('/collections/user/user1');
      expect(result).toEqual([mockCollection]);
    });
  });
}); 