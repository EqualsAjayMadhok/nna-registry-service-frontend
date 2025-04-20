import { Asset, AssetFile, AssetCreateRequest, AssetUpdateRequest, AssetSearchParams } from '../../../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../../../types/api.types';
import assetService from '../../../services/api/asset.service';
import { AxiosInstance } from 'axios';

// Mock the API module
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
  }
} as unknown as AxiosInstance;

jest.mock('../../../services/api/api', () => ({
  __esModule: true,
  default: mockApi
}));

describe('AssetService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Mock data
  const mockAssetFile: AssetFile = {
    id: 'file1',
    filename: 'test.jpg',
    contentType: 'image/jpeg',
    size: 1024,
    url: 'https://example.com/test.jpg',
    uploadedAt: '2024-03-20T12:00:00Z',
    thumbnailUrl: 'https://example.com/test-thumb.jpg',
  };

  const mockAsset: Asset = {
    id: 'asset1',
    name: 'Test Asset',
    layer: 'SONG',
    description: 'Test description',
    tags: ['test', 'mock'],
    files: [mockAssetFile],
    metadata: { key: 'value' },
    createdAt: '2024-03-20T12:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
    registeredBy: 'user1',
  };

  describe('getAssets', () => {
    it('should fetch assets with pagination', async () => {
      const mockResponse: ApiResponse<PaginatedResponse<Asset>> = {
        success: true,
        data: {
          items: [mockAsset],
          total: 1,
          page: 1,
          limit: 10,
          hasMore: false,
          totalPages: 1
        },
      };

      (mockApi.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const params: AssetSearchParams = { page: 1, limit: 10 };
      const result = await assetService.getAssets(params);

      expect(mockApi.get).toHaveBeenCalledWith('/assets', { params });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors when fetching assets', async () => {
      const error = new Error('Network error');
      (mockApi.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(assetService.getAssets()).rejects.toThrow(error);
    });
  });

  describe('getAssetById', () => {
    it('should fetch a single asset by id', async () => {
      const mockResponse: ApiResponse<Asset> = {
        success: true,
        data: mockAsset,
      };

      (mockApi.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await assetService.getAssetById('asset1');

      expect(mockApi.get).toHaveBeenCalledWith('/assets/asset1');
      expect(result).toEqual(mockAsset);
    });

    it('should handle errors when fetching a single asset', async () => {
      const error = new Error('Asset not found');
      (mockApi.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(assetService.getAssetById('invalid')).rejects.toThrow(error);
    });
  });

  describe('createAsset', () => {
    it('should create a new asset', async () => {
      const mockResponse: ApiResponse<Asset> = {
        success: true,
        data: mockAsset,
      };

      (mockApi.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const createRequest: AssetCreateRequest = {
        name: 'Test Asset',
        layer: 'SONG',
        description: 'Test description',
        tags: ['test', 'mock'],
      };

      const result = await assetService.createAsset(createRequest);

      expect(mockApi.post).toHaveBeenCalledWith('/assets', createRequest);
      expect(result).toEqual(mockAsset);
    });

    it('should handle errors when creating an asset', async () => {
      const error = new Error('Invalid data');
      (mockApi.post as jest.Mock).mockRejectedValueOnce(error);

      const createRequest: AssetCreateRequest = {
        name: 'Test Asset',
        layer: 'INVALID',
      };

      await expect(assetService.createAsset(createRequest)).rejects.toThrow(error);
    });
  });

  describe('updateAsset', () => {
    it('should update an existing asset', async () => {
      const updatedAsset = { ...mockAsset, name: 'Updated Asset' };
      const mockResponse: ApiResponse<Asset> = {
        success: true,
        data: updatedAsset,
      };

      (mockApi.put as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const updateRequest: AssetUpdateRequest = {
        name: 'Updated Asset',
      };

      const result = await assetService.updateAsset('asset1', updateRequest);

      expect(mockApi.put).toHaveBeenCalledWith('/assets/asset1', updateRequest);
      expect(result).toEqual(updatedAsset);
    });

    it('should handle errors when updating an asset', async () => {
      const error = new Error('Asset not found');
      (mockApi.put as jest.Mock).mockRejectedValueOnce(error);

      const updateRequest: AssetUpdateRequest = {
        name: 'Updated Asset',
      };

      await expect(assetService.updateAsset('invalid', updateRequest)).rejects.toThrow(error);
    });
  });

  describe('createAssetWithFiles', () => {
    it('should create an asset with file uploads', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadId = 'upload1';
      
      // Mock the upload methods
      const uploadFileSpy = jest.spyOn(assetService, 'uploadFile').mockResolvedValueOnce(mockUploadId);
      const getUploadStatusSpy = jest.spyOn(assetService, 'getUploadStatus').mockReturnValueOnce({
        id: mockUploadId,
        status: 'completed',
        file: mockFile,
        progress: 100,
      });

      const mockResponse: ApiResponse<Asset> = {
        success: true,
        data: mockAsset,
      };

      (mockApi.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const createRequest: AssetCreateRequest = {
        name: 'Test Asset',
        layer: 'SONG',
        files: [mockFile],
      };

      const result = await assetService.createAssetWithFiles(createRequest);

      expect(uploadFileSpy).toHaveBeenCalledWith(mockFile, undefined);
      expect(getUploadStatusSpy).toHaveBeenCalledWith(mockUploadId);
      expect(mockApi.post).toHaveBeenCalled();
      expect(result.asset).toEqual(mockAsset);

      // Clean up spies
      uploadFileSpy.mockRestore();
      getUploadStatusSpy.mockRestore();
    });

    it('should handle errors during file upload', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const uploadFileSpy = jest.spyOn(assetService, 'uploadFile').mockRejectedValueOnce(new Error('Upload failed'));

      const createRequest: AssetCreateRequest = {
        name: 'Test Asset',
        layer: 'SONG',
        files: [mockFile],
      };

      await expect(assetService.createAssetWithFiles(createRequest)).rejects.toThrow('Upload failed');

      // Clean up spy
      uploadFileSpy.mockRestore();
    });
  });
}); 