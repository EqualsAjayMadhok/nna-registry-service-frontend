import api, { apiConfig } from './api';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { 
  Asset, 
  AssetFile,
  AssetSearchParams, 
  SavedSearch,
  SearchGroup,
  SearchCondition,
  SearchOperator,
  SearchConditionType,
  SearchComparisonOperator,
  AssetCreateRequest, 
  AssetUpdateRequest,
  FileUpload,
  FileUploadOptions,
  FileUploadResponse,
  AssetUploadResult,
  BatchUploadItem,
  BatchItemMetadata,
  BatchUploadOptions,
  BatchUploadResult,
  CSVTemplate,
  CSVTemplateField,
  VersionInfo,
  VersionChanges,
  FieldChange,
  FileChange,
  MetadataChange,
  CreateVersionRequest,
  RevertVersionRequest,
  AssetAnalyticsFilters,
  AssetsAnalyticsData,
  AssetUsageData,
  TopAssetData,
  UserActivityData,
  PlatformUsageData,
  AssetsByCategoryData,
  AssetTimeseriesDataPoint,
  AssetUsageMetrics,
  RightsVerificationRequest,
  RightsUpdateRequest,
  RightsClearanceRequest,
  AssetRights,
  RightsStatus,
  RightsType,
  RightsLimitation,
  RightsVerificationMethod,
  RightsVerification,
  RightsLimitationDetail,
  RightsClearance,
  RightsUsage
} from '../../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

// Mock data for development until the backend API is available
const mockAssets: Asset[] = Array.from({ length: 30 }, (_, i) => ({
  id: `asset-${i + 1}`,
  name: `Asset ${i + 1}`,
  nna_address: `G.001.${(i + 1).toString().padStart(3, '0')}`,
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
      thumbnailUrl: `https://via.placeholder.com/100?text=Asset+${i + 1}`,
    },
  ],
  metadata: {
    key: 'value',
    sample: 'data',
  },
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  updatedAt: new Date().toISOString(),
  registeredBy: 'user-1',
}));

// Track ongoing uploads
const activeUploads: Map<string, FileUpload> = new Map();

class AssetService {
  // Use the centralized config for mock data
  private useMockData(): boolean {
    return apiConfig.useMockData;
  }
  
  /**
   * Get the count of existing assets with the specified layer, category, and subcategory
   * This is used to generate sequential numbers for new assets
   * @param params Layer, category, subcategory filters
   * @returns Number of existing assets matching the criteria
   */
  async getExistingAssetsCount(params: {
    layer: string;
    category: string;
    subcategory: string;
  }): Promise<number> {
    try {
      if (this.useMockData()) {
        // Mock implementation with some variation for testing
        const mockCounts: Record<string, number> = {
          'G.POP.BAS': 3,
          'S.POP.BAS': 2,
          'L.FAS.DRS': 1
        };
        
        const key = `${params.layer}.${params.category}.${params.subcategory}`;
        return Promise.resolve(mockCounts[key] || 0);
      }

      // Get count from backend
      const response = await api.get<ApiResponse<{count: number}>>('/assets/count', { 
        params: {
          layer: params.layer,
          category: params.category,
          subcategory: params.subcategory
        }
      });
      
      return response.data.data.count;
    } catch (error) {
      console.error('Error getting existing assets count:', error);
      return 0;
    }
  }

  /**
   * Advanced search with complex query conditions
   */
  async advancedSearch(params: AssetSearchParams = {}): Promise<PaginatedResponse<Asset>> {
    try {
      if (this.useMockData()) {
        // For mock data, we'll just use the regular getAssets method
        // In a real implementation, this would use more sophisticated filtering
        return this.getMockAssets(params);
      }
      
      // Real API implementation
      const response = await api.post<ApiResponse<PaginatedResponse<Asset>>>('/assets/search', params);
      return response.data.data;
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  }
  
  /**
   * Get assets with basic filtering
   */
  async getAssets(params: AssetSearchParams = {}): Promise<PaginatedResponse<Asset>> {
    try {
      console.log('Fetching assets with mock data:', apiConfig.useMockData);
      
      if (this.useMockData()) {
        console.log('Using mock asset data');
        return this.getMockAssets(params);
      }
      
      // Real API implementation
      const response = await api.get<ApiResponse<PaginatedResponse<Asset>>>('/assets', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      if (this.useMockData()) {
        // Find the asset in the mock data
        const asset = mockAssets.find(a => a.id === id);
        if (!asset) {
          throw new Error(`Asset with ID ${id} not found`);
        }
        return Promise.resolve({ ...asset });
      }
      
      // Real API implementation
      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching asset ${id}:`, error);
      throw error;
    }
  }

  async createAsset(data: AssetCreateRequest): Promise<Asset> {
    try {
      // Always register the NNA address even in mock mode
      // This ensures the sequential number logic is consistent
      const registeredAddress = await this.registerNNAAddress(
        data.layer,
        data.category,
        data.subcategory,
        data.sequentialNumber
      );
      
      if (this.useMockData()) {
        // Create a new mock asset
        const newAsset: Asset = {
          id: `asset-${mockAssets.length + 1}`,
          name: data.name,
          nna_address: registeredAddress.humanFriendlyName,
          layer: data.layer,
          category: data.category,
          subcategory: data.subcategory,
          description: data.description || '',
          tags: data.tags || [],
          files: data.files ? data.files.map(file => ({
            id: `file-${Math.floor(Math.random() * 10000)}`,
            filename: file.name,
            contentType: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
            thumbnailUrl: file.type.startsWith('image/') 
              ? URL.createObjectURL(file) 
              : undefined
          })) : [],
          metadata: data.metadata || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          registeredBy: 'user-1',
        };
        
        // Add to mock assets
        mockAssets.push(newAsset);
        
        return Promise.resolve(newAsset);
      }
      
      // Real API implementation
      const response = await api.post<ApiResponse<Asset>>('/assets', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  }

  async updateAsset(id: string, data: AssetUpdateRequest): Promise<Asset> {
    try {
      if (this.useMockData()) {
        // Find the asset in the mock data
        const index = mockAssets.findIndex(a => a.id === id);
        if (index === -1) {
          throw new Error(`Asset with ID ${id} not found`);
        }
        
        // Update the asset - ensuring files are properly converted
        const updatedAsset: Asset = {
          ...mockAssets[index],
          name: data.name || mockAssets[index].name,
          description: data.description || mockAssets[index].description,
          layer: data.layer || mockAssets[index].layer,
          category: data.category || mockAssets[index].category,
          subcategory: data.subcategory || mockAssets[index].subcategory,
          tags: data.tags || mockAssets[index].tags,
          metadata: data.metadata ? { ...mockAssets[index].metadata, ...data.metadata } : mockAssets[index].metadata,
          // Handle files by converting if provided
          files: data.files 
            ? [...(mockAssets[index].files || []), ...data.files.map(file => ({
                id: `file-${Math.floor(Math.random() * 10000)}`,
                filename: file.name,
                contentType: file.type,
                size: file.size,
                url: URL.createObjectURL(file),
                uploadedAt: new Date().toISOString(),
                thumbnailUrl: file.type.startsWith('image/') 
                  ? URL.createObjectURL(file) 
                  : undefined
              }))] 
            : mockAssets[index].files,
          updatedAt: new Date().toISOString(),
        };
        
        // Update the mock assets array
        mockAssets[index] = updatedAsset;
        
        return Promise.resolve(updatedAsset);
      }
      
      // Real API implementation
      const response = await api.put<ApiResponse<Asset>>(`/assets/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating asset ${id}:`, error);
      throw error;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      if (this.useMockData()) {
        // Find the asset in the mock data
        const index = mockAssets.findIndex(a => a.id === id);
        if (index === -1) {
          throw new Error(`Asset with ID ${id} not found`);
        }
        
        // Remove the asset from the mock data
        mockAssets.splice(index, 1);
        
        return Promise.resolve();
      }
      
      // Real API implementation
      await api.delete<ApiResponse<void>>(`/assets/${id}`);
    } catch (error) {
      console.error(`Error deleting asset ${id}:`, error);
      throw error;
    }
  }

  uploadFile(file: File, options?: FileUploadOptions): FileUpload {
    // Generate a unique ID for this upload
    const uploadId = uuidv4();
    
    // Create a new upload object
    const upload: FileUpload = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending',
      cancel: () => {
        // Update status
        upload.status = 'cancelled';
        
        // Remove from active uploads
        activeUploads.delete(uploadId);
        
        // Call the onCancel callback if provided
        if (options?.onCancel) {
          options.onCancel(uploadId);
        }
      }
    };
    
    // Add to active uploads
    activeUploads.set(uploadId, upload);
    
    // Start the upload process
    setTimeout(() => {
      this.processFileUpload(upload, options);
    }, 0);
    
    return upload;
  }

  private async processFileUpload(upload: FileUpload, options?: FileUploadOptions): Promise<void> {
    try {
      // Update status
      upload.status = 'uploading';
      
      // Call the onProgress callback with 0% progress
      if (options?.onProgress) {
        options.onProgress(upload.id, 0);
      }
      
      // If mock data, use a simulated upload with progress
      if (this.useMockData()) {
        await this.simulateFileUpload(upload, options);
        return;
      }
      
      // Create a FormData object for the file
      const formData = new FormData();
      formData.append('file', upload.file);
      
      // Create a cancellation token source
      const source = axios.CancelToken.source();
      
      // Update the upload object with the cancellation function
      upload.cancel = () => {
        source.cancel('Upload cancelled by user');
        upload.status = 'cancelled';
        activeUploads.delete(upload.id);
        
        // Call the onCancel callback if provided
        if (options?.onCancel) {
          options.onCancel(upload.id);
        }
      };
      
      // Make the upload request
      const response = await api.post<ApiResponse<FileUploadResponse>>(
        '/assets/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          cancelToken: source.token,
          onUploadProgress: (progressEvent) => {
            // Calculate the progress percentage
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            
            // Update the upload object
            upload.progress = progress;
            
            // Call the onProgress callback if provided
            if (options?.onProgress) {
              options.onProgress(upload.id, progress);
            }
          },
        }
      );
      
      // Update the upload object with the response data
      upload.status = 'completed';
      upload.progress = 100;
      upload.response = response.data.data;
      
      // Call the onComplete callback if provided
      if (options?.onComplete) {
        options.onComplete(upload.id, response.data.data);
      }
      
      // Remove from active uploads
      activeUploads.delete(upload.id);
    } catch (error) {
      // Handle cancellation separately
      if (axios.isCancel(error)) {
        console.log('Upload cancelled:', error.message);
        return;
      }
      
      // Update the upload object with the error
      upload.status = 'error';
      upload.error = error.message || 'Upload failed';
      
      // Call the onError callback if provided
      if (options?.onError) {
        options.onError(upload.id, upload.error);
      }
      
      // Remove from active uploads
      activeUploads.delete(upload.id);
      
      console.error('Error uploading file:', error);
    }
  }

  private async simulateFileUpload(upload: FileUpload, options?: FileUploadOptions): Promise<void> {
    console.log('Simulating file upload for', upload.file.name);
    
    // Simulate an upload with progress updates
    const totalSteps = 10;
    for (let step = 1; step <= totalSteps; step++) {
      // Check if the upload has been cancelled
      if (upload.status === 'cancelled') {
        console.log('Upload simulation cancelled');
        return;
      }
      
      // Calculate progress
      const progress = Math.round((step / totalSteps) * 100);
      
      // Update the upload object
      upload.progress = progress;
      
      // Call the onProgress callback if provided
      if (options?.onProgress) {
        options.onProgress(upload.id, progress);
      }
      
      // Wait a bit before the next update
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
    }
    
    // Generate a mock response
    const thumbnailUrl = upload.file.type.startsWith('image/')
      ? URL.createObjectURL(upload.file)
      : undefined;
    
    const response: FileUploadResponse = {
      id: upload.id,
      filename: upload.file.name,
      contentType: upload.file.type,
      size: upload.file.size,
      url: URL.createObjectURL(upload.file),
      uploadedAt: new Date().toISOString(),
      thumbnailUrl,
    };
    
    // Update the upload object with the response data
    upload.status = 'completed';
    upload.progress = 100;
    upload.response = response;
    
    // Call the onComplete callback if provided
    if (options?.onComplete) {
      options.onComplete(upload.id, response);
    }
    
    // Remove from active uploads
    activeUploads.delete(upload.id);
    
    console.log('Upload simulation completed for', upload.file.name);
  }

  async cancelUpload(uploadId: string): Promise<void> {
    // Get the upload object
    const upload = activeUploads.get(uploadId);
    
    // If the upload exists, cancel it
    if (upload) {
      upload.cancel();
    }
  }
  
  /**
   * Register an NNA address with the backend
   * This ensures sequential numbers are allocated correctly
   */
  async registerNNAAddress(
    layer: string,
    category: string,
    subcategory: string,
    sequentialNumber?: number
  ): Promise<{ humanFriendlyName: string; machineFriendlyAddress: string }> {
    try {
      // If we have a specific sequential number, use it,
      // otherwise get the next available one from the count
      let nextSequential = sequentialNumber;
      
      if (!nextSequential) {
        // Get the count of existing assets
        const count = await this.getExistingAssetsCount({
          layer,
          category,
          subcategory
        });
        
        // Next sequential number is count + 1
        nextSequential = count + 1;
      }
      
      // Use the natural sequential number
      const effectiveSequential = nextSequential || 1;
      console.log(`Using sequential number: ${effectiveSequential} for NNA address registration`);
      
      if (this.useMockData()) {
        // For mock implementation, generate the addresses locally
        
        // Generate the human-friendly name
        // Format: Layer.Category.Subcategory.Sequential
        // Example: G.POP.BAS.001
        const humanFriendlyName = `${layer}.${category}.${subcategory}.${effectiveSequential.toString().padStart(3, '0')}`;
        
        // Generate the machine-friendly address
        // Format: Layer.CategoryNumeric.SubcategoryNumeric.Sequential
        // Example: G.001.001.001
        const machineFriendlyAddress = `${layer}.${category.padStart(3, '0')}.${subcategory.padStart(3, '0')}.${effectiveSequential.toString().padStart(3, '0')}`;
        
        console.log('Registered mock NNA address:', { humanFriendlyName, machineFriendlyAddress });
        
        return Promise.resolve({
          humanFriendlyName,
          machineFriendlyAddress
        });
      }
      
      // Real API implementation
      const response = await api.post<ApiResponse<{
        humanFriendlyName: string;
        machineFriendlyAddress: string;
      }>>('/nna/register', {
        layer,
        category,
        subcategory,
        sequentialNumber: effectiveSequential
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error registering NNA address:', error);
      
      // Fallback to generating it locally
      const humanFriendlyName = `${layer}.${category}.${subcategory}.${(sequentialNumber || 1).toString().padStart(3, '0')}`;
      const machineFriendlyAddress = `${layer}.${category.padStart(3, '0')}.${subcategory.padStart(3, '0')}.${(sequentialNumber || 1).toString().padStart(3, '0')}`;
      
      return {
        humanFriendlyName,
        machineFriendlyAddress
      };
    }
  }
  
  /**
   * Create an asset with file uploads
   */
  async createAssetWithFiles(
    assetData: AssetCreateRequest, 
    options?: FileUploadOptions
  ): Promise<AssetUploadResult> {
    try {
      // First, upload any files
      const fileUploads: FileUploadResponse[] = [];
      
      if (assetData.files && assetData.files.length > 0) {
        for (const file of assetData.files) {
          if (file instanceof File) {
            // Upload the file
            const upload = this.uploadFile(file, options);
            
            // Wait for the upload to complete
            await new Promise<void>((resolve) => {
              const checkStatus = () => {
                if (upload.status === 'completed' || upload.status === 'error' || upload.status === 'cancelled') {
                  resolve();
                } else {
                  setTimeout(checkStatus, 500);
                }
              };
              checkStatus();
            });
            
            // If the upload was successful, add the response to the list
            if (upload.status === 'completed' && upload.response) {
              fileUploads.push(upload.response);
            } else if (upload.status === 'error') {
              throw new Error(upload.error || 'File upload failed');
            } else if (upload.status === 'cancelled') {
              throw new Error('File upload was cancelled');
            }
          } else {
            // File is already a FileUploadResponse, just add it to the list
            fileUploads.push(file as FileUploadResponse);
          }
        }
      }
      
      // Create the asset with the uploaded files
      // Since FileUploadResponse isn't the same as File, we need to handle this differently
      // For mock data, we'll just create the asset directly using the file info we have
      const asset = await this.createAsset({
        ...assetData,
        // We omit files here because they've already been uploaded and will be attached in the Asset object
        files: undefined,
        // Add additional metadata to help track the files
        metadata: {
          ...assetData.metadata,
          uploadedFiles: fileUploads.map(f => f.id)
        }
      });
      
      return {
        asset,
        files: fileUploads,
      };
    } catch (error) {
      console.error('Error creating asset with files:', error);
      throw error;
    }
  }
  
  /**
   * Get mock assets with filtering, sorting, and pagination
   */
  private getMockAssets(params: AssetSearchParams = {}): PaginatedResponse<Asset> {
    const {
      page = 1,
      limit = 10,
      sort,
      sortDirection,
      search,
      layer,
      category,
      subcategory,
      tags,
    } = params;
    
    // Filter assets
    let filtered = [...mockAssets];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        asset => 
          asset.name.toLowerCase().includes(searchLower) ||
          asset.description.toLowerCase().includes(searchLower) ||
          asset.nna_address.toLowerCase().includes(searchLower) ||
          asset.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by layer
    if (layer) {
      filtered = filtered.filter(asset => asset.layer === layer);
    }
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(asset => asset.category === category);
    }
    
    // Filter by subcategory
    if (subcategory) {
      filtered = filtered.filter(asset => asset.subcategory === subcategory);
    }
    
    // Filter by tags
    if (tags && tags.length > 0) {
      filtered = filtered.filter(asset => 
        tags.every(tag => asset.tags.includes(tag))
      );
    }
    
    // Sort assets
    if (sort) {
      filtered.sort((a, b) => {
        const aValue = a[sort as keyof Asset];
        const bValue = b[sort as keyof Asset];
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'desc'
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        // Handle date comparison
        if (
          (sort === 'createdAt' || sort === 'updatedAt') &&
          typeof aValue === 'string' && 
          typeof bValue === 'string'
        ) {
          return sortDirection === 'desc'
            ? new Date(bValue).getTime() - new Date(aValue).getTime()
            : new Date(aValue).getTime() - new Date(bValue).getTime();
        }
        
        // Default comparison
        return sortDirection === 'desc'
          ? (bValue as any) - (aValue as any)
          : (aValue as any) - (bValue as any);
      });
    }
    
    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filtered.slice(startIndex, endIndex);
    
    return {
      items: items,
      data: items,
      total,
      page,
      limit,
      totalPages,
      pages: totalPages
    };
  }
  
  // MOCK SAVED SEARCHES
  private mockSavedSearches: SavedSearch[] = [
    {
      id: '1',
      name: 'Recent Pop Music',
      description: 'Recently added pop music assets',
      query: {
        operator: 'AND',
        conditions: [
          {
            type: 'field',
            field: 'layer',
            operator: '=',
            value: 'G'
          },
          {
            type: 'field',
            field: 'category',
            operator: '=',
            value: 'POP'
          }
        ]
      },
      sort: 'createdAt',
      sortDirection: 'desc',
      isDefault: true,
      createdAt: '2023-01-15T00:00:00Z',
      userId: 'user-1'
    },
    {
      id: '2',
      name: 'Pop Stars',
      description: 'All pop star assets',
      query: {
        operator: 'AND',
        conditions: [
          {
            type: 'field',
            field: 'layer',
            operator: '=',
            value: 'S'
          },
          {
            type: 'field',
            field: 'category',
            operator: '=',
            value: 'POP'
          }
        ]
      },
      sort: 'name',
      sortDirection: 'asc',
      isDefault: false,
      createdAt: '2023-01-20T00:00:00Z',
      userId: 'user-1'
    }
  ];
  
  /**
   * Get saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    if (this.useMockData()) {
      return Promise.resolve([...this.mockSavedSearches]);
    }
    
    // Real API implementation
    const response = await api.get<ApiResponse<SavedSearch[]>>('/assets/saved-searches');
    return response.data.data;
  }
  
  /**
   * Save a new search
   */
  async saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'userId'>): Promise<SavedSearch> {
    if (this.useMockData()) {
      return this.addMockSavedSearch(search);
    }
    
    // Real API implementation
    const response = await api.post<ApiResponse<SavedSearch>>('/assets/saved-searches', search);
    return response.data.data;
  }
  
  /**
   * Add a mock saved search
   */
  private addMockSavedSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'userId'>): SavedSearch {
    const newSearch: SavedSearch = {
      ...search,
      id: `${this.mockSavedSearches.length + 1}`,
      createdAt: new Date().toISOString(),
      userId: 'user-1'
    };
    
    // If this is set as default, update other searches
    if (newSearch.isDefault) {
      this.mockSavedSearches.forEach(s => {
        s.isDefault = false;
      });
    }
    
    this.mockSavedSearches.push(newSearch);
    return newSearch;
  }
  
  /**
   * Update a mock saved search
   */
  private updateMockSavedSearch(
    id: string, 
    search: Partial<Omit<SavedSearch, 'id' | 'createdAt' | 'userId'>>
  ): SavedSearch {
    const index = this.mockSavedSearches.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Saved search with ID ${id} not found`);
    }
    
    // If this is set as default, update other searches
    if (search.isDefault) {
      this.mockSavedSearches.forEach(s => {
        s.isDefault = false;
      });
    }
    
    const updatedSearch = {
      ...this.mockSavedSearches[index],
      ...search
    };
    
    this.mockSavedSearches[index] = updatedSearch;
    return updatedSearch;
  }
  
  /**
   * Delete a saved search
   */
  async deleteSavedSearch(id: string): Promise<void> {
    if (this.useMockData()) {
      this.deleteMockSavedSearch(id);
      return Promise.resolve();
    }
    
    // Real API implementation
    await api.delete<ApiResponse<void>>(`/assets/saved-searches/${id}`);
  }
  
  /**
   * Delete a mock saved search
   */
  private deleteMockSavedSearch(id: string): void {
    const index = this.mockSavedSearches.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Saved search with ID ${id} not found`);
    }
    
    this.mockSavedSearches.splice(index, 1);
  }
  
  /**
   * Get a specific version of an asset
   */
  async getAssetVersion(assetId: string, versionNumber: string): Promise<Asset> {
    try {
      if (this.useMockData()) {
        // Find the asset in the mock data
        const asset = mockAssets.find(a => a.id === assetId);
        if (!asset) {
          throw new Error(`Asset with ID ${assetId} not found`);
        }
        
        // In a mock environment, just return the current asset
        // In a real implementation, we'd fetch the specific version
        return Promise.resolve({ ...asset });
      }
      
      // Real API implementation
      const response = await api.get<ApiResponse<Asset>>(`/assets/${assetId}/versions/${versionNumber}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching asset version ${assetId}/${versionNumber}:`, error);
      throw error;
    }
  }
  
  /**
   * Get CSV template for batch uploads
   * Returns the template with field definitions and an example
   */
  getCSVTemplate(): CSVTemplate {
    return {
      fields: [
        {
          name: 'filename',
          required: true,
          description: 'The filename of the asset file (must match exactly)'
        },
        {
          name: 'name',
          required: true,
          description: 'A human-readable name for the asset'
        },
        {
          name: 'layer',
          required: true,
          description: 'Asset layer (S=Song, G=Star, L=Look, M=Move, W=World, C=Component)'
        },
        {
          name: 'category',
          required: true,
          description: 'Category within layer (e.g., POP, HIP, ROC)'
        },
        {
          name: 'subcategory',
          required: true,
          description: 'Subcategory within category (e.g., BAS, DRM, VOX)'
        },
        {
          name: 'description',
          required: false,
          description: 'A detailed description of the asset'
        },
        {
          name: 'tags',
          required: false,
          description: 'Comma-separated tags for the asset'
        },
        {
          name: 'source',
          required: false,
          description: 'Source of the asset (e.g., original, licensed)'
        },
        {
          name: 'license',
          required: false,
          description: 'License type (e.g., CC-BY, CC0)'
        },
        {
          name: 'attributionRequired',
          required: false,
          description: 'Whether attribution is required (true/false)'
        },
        {
          name: 'attributionText',
          required: false,
          description: 'Text to use for attribution'
        },
        {
          name: 'commercialUse',
          required: false,
          description: 'Whether commercial use is allowed (true/false)'
        }
      ],
      example: 'filename,name,layer,category,subcategory,description,tags,source,license,attributionRequired,attributionText,commercialUse\n' +
        'song1.mp3,My Pop Song,S,POP,BAS,A basic pop song,pop;music;dance,ReViz,CC-BY,true,Created by ReViz,true\n' +
        'star1.mp4,Pop Star #1,G,POP,BAS,A basic pop star,star;pop;performer,ReViz,CC-BY,false,,true\n' +
        'look1.jpg,Fashion Look,L,FAS,DRS,A fashionable dress,fashion;dress;outfit,ReViz,CC-BY,true,Fashion by ReViz,true'
    };
  }
  
  /**
   * Parse CSV content for batch upload
   * Returns an array of batch item metadata or an error
   */
  parseCSVForBatchUpload(csvContent: string): BatchItemMetadata[] | { error: string } {
    try {
      // Split into lines
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        return { error: 'CSV must contain a header row and at least one data row' };
      }
      
      // Parse header
      const header = lines[0].split(',').map(col => col.trim());
      
      // Validate required columns
      const requiredColumns = ['filename', 'name', 'layer', 'category', 'subcategory'];
      const missingColumns = requiredColumns.filter(col => !header.includes(col));
      
      if (missingColumns.length > 0) {
        return { error: `Missing required columns: ${missingColumns.join(', ')}` };
      }
      
      // Parse data rows
      const items: BatchItemMetadata[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(',').map(val => val.trim());
        
        // Skip if row is empty
        if (values.length < header.length) {
          continue;
        }
        
        // Create metadata object
        const metadata: Record<string, any> = {};
        
        header.forEach((col, index) => {
          metadata[col] = values[index] || '';
        });
        
        // Validate required fields
        const missingFields = requiredColumns.filter(col => !metadata[col]);
        
        if (missingFields.length > 0) {
          continue; // Skip invalid rows
        }
        
        // Convert certain fields to appropriate types
        if (metadata.tags && typeof metadata.tags === 'string') {
          metadata.tags = metadata.tags.split(';').map((tag: string) => tag.trim()).filter(Boolean);
        }
        
        if (metadata.attributionRequired) {
          metadata.attributionRequired = metadata.attributionRequired.toLowerCase() === 'true';
        }
        
        if (metadata.commercialUse) {
          metadata.commercialUse = metadata.commercialUse.toLowerCase() === 'true';
        }
        
        items.push(metadata);
      }
      
      if (items.length === 0) {
        return { error: 'No valid data rows found in CSV' };
      }
      
      return items;
    } catch (error) {
      return { error: `Error parsing CSV: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  
  /**
   * Batch upload assets with progress tracking
   */
  async batchUploadAssets(
    items: BatchUploadItem[], 
    options?: {
      maxConcurrentUploads?: number;
      onItemStart?: (itemId: string) => void;
      onItemProgress?: (itemId: string, progress: number) => void;
      onItemComplete?: (itemId: string, asset: Asset) => void;
      onItemError?: (itemId: string, error: string) => void;
      onBatchProgress?: (completedItems: number, totalItems: number) => void;
      onBatchComplete?: (results: BatchUploadResult) => void;
    }
  ): Promise<BatchUploadResult> {
    // Track overall results
    const result: BatchUploadResult = {
      totalCount: items.length,
      successCount: 0,
      failureCount: 0,
      cancelCount: 0,
      successful: [],
      failed: []
    };
    
    // Use a queue for processing items
    const queue = [...items];
    let activeUploads = 0;
    let completedItems = 0;
    
    // Limit concurrent uploads
    const maxConcurrent = options?.maxConcurrentUploads || 3;
    
    // Process a batch item
    const processItem = async (item: BatchUploadItem) => {
      // Skip if not pending
      if (item.status !== 'pending' && item.status !== 'uploading') {
        completedItems++;
        return;
      }
      
      // Notify start
      if (options?.onItemStart) {
        options.onItemStart(item.id);
      }
      
      // Start time
      item.startTime = Date.now();
      
      try {
        // Create asset data from metadata
        const assetData = {
          name: item.metadata.name,
          layer: item.metadata.layer,
          category: item.metadata.category,
          subcategory: item.metadata.subcategory,
          description: item.metadata.description,
          tags: item.metadata.tags,
          files: [item.file],
          metadata: {
            // Extract standard metadata fields
            source: item.metadata.source || 'ReViz',
            license: item.metadata.license || 'CC-BY',
            attributionRequired: item.metadata.attributionRequired !== false,
            attributionText: item.metadata.attributionText || '',
            commercialUse: item.metadata.commercialUse !== false,
            
            // Any other fields from metadata
            ...Object.entries(item.metadata)
              .filter(([key]) => !['name', 'layer', 'category', 'subcategory', 'description', 'tags', 
                'source', 'license', 'attributionRequired', 'attributionText', 'commercialUse', 'filename'].includes(key))
              .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
          }
        };
        
        if (this.useMockData()) {
          // For mock mode, simulate upload with delays
          let progress = 0;
          const totalSteps = 10;
          
          for (let step = 1; step <= totalSteps; step++) {
            // Check if operation was cancelled
            if (item.status !== 'uploading') {
              throw new Error('Upload cancelled or no longer in progress');
            }
            
            // Update progress
            progress = Math.round((step / totalSteps) * 100);
            item.progress = progress;
            options?.onItemProgress?.(item.id, progress);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          // Create mock asset
          const mockAsset: Asset = {
            id: `asset-${Math.floor(Math.random() * 10000)}`,
            name: assetData.name || item.file.name,
            nna_address: `${assetData.layer}.${assetData.category || '001'}.${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            layer: assetData.layer,
            category: assetData.category,
            subcategory: assetData.subcategory,
            description: assetData.description,
            tags: assetData.tags,
            files: [{
              id: `file-${Math.floor(Math.random() * 10000)}`,
              filename: item.file.name,
              contentType: item.file.type,
              size: item.file.size,
              url: URL.createObjectURL(item.file),
              uploadedAt: new Date().toISOString(),
              thumbnailUrl: item.file.type.startsWith('image/') 
                ? URL.createObjectURL(item.file) 
                : `https://via.placeholder.com/100?text=${encodeURIComponent(item.file.name)}`
            }],
            metadata: assetData.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registeredBy: 'user-1'
          };
          
          // Add to mock data
          mockAssets.push(mockAsset);
          
          // Update item status
          item.status = 'completed';
          item.asset = mockAsset;
          item.endTime = Date.now();
          item.progress = 100;
          
          // Track success
          result.successful.push(mockAsset);
          result.successCount++;
          
          // Notify
          options?.onItemComplete?.(item.id, mockAsset);
        } else {
          // For real implementation, use createAssetWithFiles with progress tracking
          const uploadResult = await this.createAssetWithFiles(assetData, {
            onProgress: (fileId, progress) => {
              item.progress = progress;
              options?.onItemProgress?.(item.id, progress);
            },
            onComplete: () => {
              // Progress callback only, actual completion is handled below
            },
            onError: (fileId, error) => {
              console.error(`Error uploading file for asset ${item.id}:`, error);
              // Continue with process, final error will be caught in the catch block
            }
          });
          
          // Update item status
          item.status = 'completed';
          item.asset = uploadResult.asset;
          item.endTime = Date.now();
          item.progress = 100;
          
          // Track success
          result.successful.push(uploadResult.asset);
          result.successCount++;
          
          // Notify
          options?.onItemComplete?.(item.id, uploadResult.asset);
        }
      } catch (error) {
        // Update item status
        item.status = 'error';
        item.error = error instanceof Error ? error.message : 'Unknown error occurred';
        item.endTime = Date.now();
        
        // Track failure
        result.failed.push({
          id: item.id,
          file: item.file,
          error: item.error
        });
        result.failureCount++;
        
        // Notify
        options?.onItemError?.(item.id, item.error);
        console.error(`Error uploading asset ${item.id}:`, error);
      } finally {
        // Update batch progress
        completedItems++;
        activeUploads--;
        options?.onBatchProgress?.(completedItems, items.length);
        
        // Process next item from queue if available
        if (queue.length > 0) {
          const nextItem = queue.shift();
          if (nextItem) {
            activeUploads++;
            await processItem(nextItem);
          }
        } else if (activeUploads === 0) {
          // All items processed, complete the batch
          options?.onBatchComplete?.(result);
        }
      }
    };
    
    // Start initial batch of uploads up to max concurrent limit
    const initialBatch = queue.splice(0, maxConcurrent);
    
    if (initialBatch.length === 0) {
      // No items to process
      options?.onBatchComplete?.(result);
      return result;
    }
    
    // Process initial batch in parallel
    activeUploads = initialBatch.length;
    await Promise.all(initialBatch.map(item => processItem(item)));
    
    // Return final result
    return result;
  }
  
  /**
   * Cancel a batch upload item
   * @param itemId ID of the item to cancel
   * @returns True if successfully cancelled
   */
  cancelBatchUploadItem(itemId: string): boolean {
    // In a real implementation, this would cancel the upload for this item
    // For now, we'll just return true
    return true;
  }
  
  /**
   * Get assets analytics data
   * @param filters Filters to apply to analytics
   */
  async getAssetsAnalytics(filters: AssetAnalyticsFilters): Promise<AssetsAnalyticsData> {
    try {
      if (this.useMockData()) {
        // Mock implementation
        return this.getMockAnalyticsData(filters);
      }
      
      // Real API implementation
      const response = await api.get<ApiResponse<AssetsAnalyticsData>>('/analytics/assets', { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching asset analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get mock analytics data
   * @param filters Filters to apply to analytics
   */
  private getMockAnalyticsData(filters: AssetAnalyticsFilters): AssetsAnalyticsData {
    // Generate random data for analytics
    const startDate = filters.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate || new Date();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    // Generate time series data
    const timeseriesData: AssetTimeseriesDataPoint[] = [];
    let totalViews = 0;
    let totalDownloads = 0;
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const views = Math.floor(Math.random() * 100) + 50;
      const downloads = Math.floor(Math.random() * 30) + 10;
      const uniqueUsers = Math.floor(Math.random() * 40) + 20;
      
      totalViews += views;
      totalDownloads += downloads;
      
      timeseriesData.push({
        date: format(date, 'yyyy-MM-dd'),
        views,
        downloads,
        uniqueUsers
      });
    }
    
    // Create usage metrics
    const usageMetrics: AssetUsageMetrics = {
      totalAssets: mockAssets.length,
      totalViews,
      totalDownloads,
      uniqueUsers: Math.floor(totalViews * 0.3),
      averageDailyViews: Math.floor(totalViews / daysDiff),
      popularLayer: 'G',
      popularCategory: 'POP'
    };
    
    // Generate user activity data
    const userActivity: UserActivityData[] = timeseriesData.map(item => ({
      date: item.date,
      activeUsers: item.uniqueUsers,
      newUsers: Math.floor(item.uniqueUsers * 0.4),
      returningUsers: Math.floor(item.uniqueUsers * 0.6)
    }));
    
    // Generate platform usage data
    const platformUsage: PlatformUsageData[] = [
      {
        platform: 'Web',
        views: Math.floor(totalViews * 0.6),
        downloads: Math.floor(totalDownloads * 0.4),
        percentage: 60
      },
      {
        platform: 'Mobile',
        views: Math.floor(totalViews * 0.3),
        downloads: Math.floor(totalDownloads * 0.5),
        percentage: 30
      },
      {
        platform: 'Desktop',
        views: Math.floor(totalViews * 0.1),
        downloads: Math.floor(totalDownloads * 0.1),
        percentage: 10
      }
    ];
    
    // Assets by layer
    const assetsByLayer: Record<string, number> = {
      G: Math.floor(mockAssets.length * 0.35),
      S: Math.floor(mockAssets.length * 0.25),
      L: Math.floor(mockAssets.length * 0.15),
      M: Math.floor(mockAssets.length * 0.15),
      W: Math.floor(mockAssets.length * 0.10)
    };
    
    // Assets by category
    const assetsByCategory: AssetsByCategoryData[] = [
      {
        category: 'POP',
        count: Math.floor(mockAssets.length * 0.3),
        percentage: 30
      },
      {
        category: 'ROC',
        count: Math.floor(mockAssets.length * 0.2),
        percentage: 20
      },
      {
        category: 'HIP',
        count: Math.floor(mockAssets.length * 0.15),
        percentage: 15
      },
      {
        category: 'DNC',
        count: Math.floor(mockAssets.length * 0.15),
        percentage: 15
      },
      {
        category: 'FAS',
        count: Math.floor(mockAssets.length * 0.1),
        percentage: 10
      },
      {
        category: 'SCI',
        count: Math.floor(mockAssets.length * 0.1),
        percentage: 10
      }
    ];
    
    // Top assets
    const topAssets: TopAssetData[] = mockAssets.slice(0, 10).map((asset, index) => ({
      id: asset.id,
      name: asset.name,
      nna_address: asset.nna_address,
      layer: asset.layer,
      views: Math.floor(Math.random() * 1000) + 500 - (index * 50),
      downloads: Math.floor(Math.random() * 300) + 100 - (index * 20),
      createdAt: asset.createdAt
    }));
    
    // Sort top assets by views
    topAssets.sort((a, b) => b.views - a.views);
    
    return {
      usageData: {
        timeseriesData,
        metrics: usageMetrics
      },
      userActivity,
      platformUsage,
      assetsByLayer,
      assetsByCategory,
      topAssets,
      totalAssets: mockAssets.length
    };
  }

  /**
   * Set a saved search as default
   */
  async setDefaultSavedSearch(id: string): Promise<SavedSearch> {
    if (this.useMockData()) {
      return this.setMockDefaultSavedSearch(id);
    }
    
    // Real API implementation
    const response = await api.put<ApiResponse<SavedSearch>>(`/assets/saved-searches/${id}/default`);
    return response.data.data;
  }
  
  /**
   * Set a mock saved search as default
   */
  private setMockDefaultSavedSearch(id: string): SavedSearch {
    // Set all to not default
    this.mockSavedSearches.forEach(s => {
      s.isDefault = false;
    });
    
    // Set the specified one to default
    const index = this.mockSavedSearches.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Saved search with ID ${id} not found`);
    }
    
    this.mockSavedSearches[index].isDefault = true;
    return this.mockSavedSearches[index];
  }
  
  /**
   * Create a new version of an asset
   * @param request The version creation request
   * @returns The updated asset
   */
  async createVersion(request: CreateVersionRequest): Promise<Asset> {
    try {
      if (this.useMockData()) {
        // Find the asset in the mock data
        const index = mockAssets.findIndex(a => a.id === request.assetId);
        if (index === -1) {
          throw new Error(`Asset with ID ${request.assetId} not found`);
        }
        
        // Update the asset with a new version
        const versionNumber = '2'; // In a real implementation, this would be incremented
        const updatedAsset = {
          ...mockAssets[index],
          version: {
            number: versionNumber,
            createdAt: new Date().toISOString(),
            message: request.message,
          },
          updatedAt: new Date().toISOString(),
        };
        
        // Update in the mock data
        mockAssets[index] = updatedAsset;
        
        return Promise.resolve(updatedAsset);
      }
      
      // Create FormData if we have files to upload
      let requestData: FormData | CreateVersionRequest = request;
      
      if (request.files && request.files.length > 0) {
        const formData = new FormData();
        formData.append('assetId', request.assetId);
        formData.append('message', request.message);
        
        // Append each file
        request.files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
        
        requestData = formData;
      }
      
      // Real API implementation
      const response = await api.post<ApiResponse<Asset>>(
        `/assets/${request.assetId}/versions`,
        requestData,
        {
          headers: request.files 
            ? { 'Content-Type': 'multipart/form-data' }
            : undefined
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating version:', error);
      throw error;
    }
  }
  
  /**
   * Revert an asset to a specific version
   * @param params The revert parameters
   * @returns The updated asset
   */
  async revertToVersion(params: RevertVersionRequest): Promise<Asset> {
    try {
      if (this.useMockData()) {
        // Find the asset in the mock data
        const index = mockAssets.findIndex(a => a.id === params.assetId);
        if (index === -1) {
          throw new Error(`Asset with ID ${params.assetId} not found`);
        }
        
        // In a mock environment, just update the updatedAt field
        const updatedAsset = {
          ...mockAssets[index],
          updatedAt: new Date().toISOString(),
        };
        
        // Update in the mock data
        mockAssets[index] = updatedAsset;
        
        return Promise.resolve(updatedAsset);
      }
      
      // Real API implementation
      const response = await api.post<ApiResponse<Asset>>(`/assets/${params.assetId}/revert`, params);
      return response.data.data;
    } catch (error) {
      console.error('Error reverting to version:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const assetService = new AssetService();

// Export the singleton
export default assetService;