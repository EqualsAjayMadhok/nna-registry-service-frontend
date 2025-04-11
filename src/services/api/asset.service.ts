import api from './api';
import { Asset, AssetSearchParams, AssetCreateRequest, AssetUpdateRequest } from '../../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

// Mock data for development until the backend API is available
const mockAssets: Asset[] = Array.from({ length: 30 }, (_, i) => ({
  id: `asset-${i + 1}`,
  name: `Asset ${i + 1}`,
  nnaAddress: `G.001.${(i + 1).toString().padStart(3, '0')}`,
  layer: ['G', 'S', 'L', 'M', 'W'][Math.floor(Math.random() * 5)],
  category: '001',
  subcategory: '001',
  description: `This is a sample asset description for ${i + 1}. It showcases what the asset is about.`,
  tags: ['sample', 'mock', 'demo', 'test'].slice(0, Math.floor(Math.random() * 4) + 1),
  files: [
    {
      id: `file-${i + 1}`,
      filename: `asset-${i + 1}.jpg`,
      contentType: 'image/jpeg',
      size: 1024 * 1024 * (Math.random() * 5 + 1),
      url: `https://via.placeholder.com/300?text=Asset+${i + 1}`,
      uploadedAt: new Date().toISOString(),
    },
  ],
  metadata: {
    key: 'value',
    sample: 'data',
  },
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-1',
}));

class AssetService {
  async getAssets(params: AssetSearchParams = {}): Promise<PaginatedResponse<Asset>> {
    try {
      console.log('Fetching assets with mock data flag:', process.env.REACT_APP_USE_MOCK_DATA, 
        'window flag:', (window as any).process?.env?.REACT_APP_USE_MOCK_DATA);
      
      // For development or when explicitly requested, use mock data
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock asset data');
        return this.getMockAssets(params);
      }

      const response = await api.get<ApiResponse<PaginatedResponse<Asset>>>('/assets', { params });
      return response.data.data as PaginatedResponse<Asset>;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw new Error('Failed to fetch assets');
    }
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      // For development or when explicitly requested, use mock data
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock asset data for ID:', id);
        const asset = mockAssets.find(a => a.id === id);
        if (!asset) {
          // If not found by ID, return the first asset as a fallback for demo
          return mockAssets[0];
        }
        return asset;
      }

      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching asset with ID ${id}:`, error);
      throw new Error('Failed to fetch asset');
    }
  }

  async getAssetByNnaAddress(nnaAddress: string): Promise<Asset> {
    try {
      // For development or when explicitly requested, use mock data
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock asset data for NNA address:', nnaAddress);
        const asset = mockAssets.find(a => a.nnaAddress === nnaAddress);
        if (!asset) {
          // If not found by NNA address, return the first asset as a fallback for demo
          return mockAssets[0];
        }
        return asset;
      }

      const response = await api.get<ApiResponse<Asset>>(`/assets/nna/${nnaAddress}`);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching asset with NNA address ${nnaAddress}:`, error);
      throw new Error('Failed to fetch asset');
    }
  }

  async createAsset(assetData: AssetCreateRequest): Promise<Asset> {
    try {
      // For development or when explicitly requested, use mock data
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock data for asset creation');
        const newAsset: Asset = {
          id: `asset-${mockAssets.length + 1}`,
          name: assetData.name,
          nnaAddress: `${assetData.layer}.${assetData.category || '001'}.${(mockAssets.length + 1).toString().padStart(3, '0')}`,
          layer: assetData.layer,
          category: assetData.category,
          subcategory: assetData.subcategory,
          description: assetData.description,
          tags: assetData.tags,
          metadata: assetData.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1',
        };
        mockAssets.push(newAsset);
        return newAsset;
      }

      const formData = new FormData();
      formData.append('name', assetData.name);
      formData.append('layer', assetData.layer);
      
      if (assetData.category) formData.append('category', assetData.category);
      if (assetData.subcategory) formData.append('subcategory', assetData.subcategory);
      if (assetData.description) formData.append('description', assetData.description);
      if (assetData.tags) formData.append('tags', JSON.stringify(assetData.tags));
      if (assetData.metadata) formData.append('metadata', JSON.stringify(assetData.metadata));
      
      // Add files to form data
      if (assetData.files && assetData.files.length > 0) {
        assetData.files.forEach((file, index) => {
          formData.append(`files`, file);
        });
      }

      const response = await api.post<ApiResponse<Asset>>('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data as Asset;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw new Error('Failed to create asset');
    }
  }

  async updateAsset(id: string, updateData: AssetUpdateRequest): Promise<Asset> {
    try {
      // For development or when explicitly requested, use mock data
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock data for asset update');
        const assetIndex = mockAssets.findIndex(a => a.id === id);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }
        
        const updatedAsset = {
          ...mockAssets[assetIndex],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        
        mockAssets[assetIndex] = updatedAsset;
        return updatedAsset;
      }

      const response = await api.patch<ApiResponse<Asset>>(`/assets/${id}`, updateData);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error updating asset with ID ${id}:`, error);
      throw new Error('Failed to update asset');
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      // For development or when explicitly requested, use mock data
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock data for asset deletion');
        const assetIndex = mockAssets.findIndex(a => a.id === id);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }
        
        mockAssets.splice(assetIndex, 1);
        return;
      }

      await api.delete<ApiResponse<void>>(`/assets/${id}`);
    } catch (error) {
      console.error(`Error deleting asset with ID ${id}:`, error);
      throw new Error('Failed to delete asset');
    }
  }

  // Helper method for mock data
  private getMockAssets(params: AssetSearchParams): PaginatedResponse<Asset> {
    let filteredAssets = [...mockAssets];
    
    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredAssets = filteredAssets.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        (asset.description && asset.description.toLowerCase().includes(query))
      );
    }
    
    if (params.layer) {
      filteredAssets = filteredAssets.filter(asset => asset.layer === params.layer);
    }
    
    if (params.category) {
      filteredAssets = filteredAssets.filter(asset => asset.category === params.category);
    }
    
    if (params.subcategory) {
      filteredAssets = filteredAssets.filter(asset => asset.subcategory === params.subcategory);
    }
    
    if (params.tags && params.tags.length > 0) {
      filteredAssets = filteredAssets.filter(asset => 
        asset.tags && params.tags!.some(tag => asset.tags!.includes(tag))
      );
    }
    
    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);
    
    return {
      items: paginatedAssets,
      total: filteredAssets.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAssets.length / limit)
    };
  }
}

// Export a singleton instance
export default new AssetService();