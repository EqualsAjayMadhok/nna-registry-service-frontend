import api from './api';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  Asset, 
  AssetFile,
  AssetSearchParams, 
  AssetCreateRequest, 
  AssetUpdateRequest,
  FileUpload,
  FileUploadOptions,
  FileUploadResponse,
  AssetUploadResult
} from '../../types/asset.types';
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
      thumbnailUrl: `https://via.placeholder.com/100?text=Asset+${i + 1}`,
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

// Track ongoing uploads
const activeUploads: Map<string, FileUpload> = new Map();

class AssetService {
  // Utility function to check if we should use mock data
  private useMockData(): boolean {
    return process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
      (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
  }

  async getAssets(params: AssetSearchParams = {}): Promise<PaginatedResponse<Asset>> {
    try {
      console.log('Fetching assets with mock data flag:', process.env.REACT_APP_USE_MOCK_DATA, 
        'window flag:', (window as any).process?.env?.REACT_APP_USE_MOCK_DATA);
      
      if (this.useMockData()) {
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
      if (this.useMockData()) {
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
      if (this.useMockData()) {
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

  /**
   * Upload a single file with progress tracking
   * @param file The file to upload
   * @param options Options for tracking progress, completion, and errors
   * @returns FileUpload object with tracking information
   */
  uploadFile(file: File, options?: FileUploadOptions): FileUpload {
    const fileId = uuidv4();
    const abortController = new AbortController();

    // Create file upload object for tracking
    const fileUpload: FileUpload = {
      file,
      id: fileId,
      progress: 0,
      status: 'pending',
      abortController,
    };

    // Store in active uploads
    activeUploads.set(fileId, fileUpload);

    // Start the upload process asynchronously
    this.processFileUpload(fileUpload, options);

    return fileUpload;
  }

  /**
   * Process a file upload with progress tracking
   * @param fileUpload The FileUpload object
   * @param options Options for tracking progress, completion, and errors
   */
  private async processFileUpload(
    fileUpload: FileUpload, 
    options?: FileUploadOptions
  ): Promise<void> {
    const { file, id, abortController } = fileUpload;

    try {
      // Update status to uploading
      fileUpload.status = 'uploading';
      activeUploads.set(id, fileUpload);

      if (this.useMockData()) {
        // Simulate upload with mock data
        await this.simulateFileUpload(fileUpload, options);
        return;
      }

      // Create form data for the file
      const formData = new FormData();
      formData.append('file', file);

      // Set up the request with progress tracking
      const response = await api.post<ApiResponse<FileUploadResponse>>(
        '/assets/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: abortController.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              
              // Update progress in the tracking object
              fileUpload.progress = progress;
              activeUploads.set(id, fileUpload);
              
              // Call progress callback if provided
              options?.onProgress?.(id, progress);
            }
          },
        }
      );

      // Update status to completed
      fileUpload.status = 'completed';
      fileUpload.progress = 100;
      activeUploads.set(id, fileUpload);

      // Call completion callback if provided
      const fileData = response.data.data as FileUploadResponse;
      options?.onComplete?.(id, fileData);
    } catch (error) {
      // Skip aborting a request that was intentionally aborted
      if (axios.isCancel(error)) {
        console.log(`Upload ${id} was canceled`);
        return;
      }

      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'File upload failed';
      
      // Update status to error
      fileUpload.status = 'error';
      fileUpload.error = errorMessage;
      activeUploads.set(id, fileUpload);
      
      // Call error callback if provided
      options?.onError?.(id, errorMessage);
      
      console.error(`Error uploading file ${file.name}:`, error);
    }
  }

  /**
   * Simulate file upload with progress for mock data mode
   */
  private async simulateFileUpload(
    fileUpload: FileUpload, 
    options?: FileUploadOptions
  ): Promise<void> {
    const { file, id } = fileUpload;
    const totalSteps = 10;
    
    // Simulate upload progress
    for (let step = 1; step <= totalSteps; step++) {
      // Check if upload was cancelled
      if (fileUpload.status !== 'uploading') {
        return;
      }
      
      // Calculate and update progress
      const progress = Math.round((step / totalSteps) * 100);
      fileUpload.progress = progress;
      activeUploads.set(id, fileUpload);
      
      // Call progress callback
      options?.onProgress?.(id, progress);
      
      // Wait a bit to simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Create mock response data
    const responseData: FileUploadResponse = {
      id: uuidv4(),
      filename: file.name,
      contentType: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // Create local object URL for preview
      thumbnailUrl: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : `https://via.placeholder.com/100?text=${encodeURIComponent(file.name)}`,
      uploadedAt: new Date().toISOString(),
    };
    
    // Update status to completed
    fileUpload.status = 'completed';
    fileUpload.progress = 100;
    activeUploads.set(id, fileUpload);
    
    // Call completion callback
    options?.onComplete?.(id, responseData);
  }

  /**
   * Cancel an active file upload
   * @param fileId The ID of the file upload to cancel
   */
  cancelUpload(fileId: string): boolean {
    const upload = activeUploads.get(fileId);
    
    if (!upload) {
      return false;
    }
    
    // Abort the upload
    upload.abortController.abort();
    upload.status = 'error';
    upload.error = 'Upload cancelled';
    activeUploads.set(fileId, upload);
    
    return true;
  }

  /**
   * Get the current status of a file upload
   * @param fileId The ID of the file upload
   */
  getUploadStatus(fileId: string): FileUpload | undefined {
    return activeUploads.get(fileId);
  }

  /**
   * Create an asset with files and track upload progress
   * @param assetData The asset data to create
   * @param options Options for tracking upload progress
   */
  async createAssetWithFiles(
    assetData: AssetCreateRequest, 
    options?: FileUploadOptions
  ): Promise<AssetUploadResult> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset creation with files');
        
        // Create base asset without files first
        const baseAsset: Asset = {
          id: `asset-${mockAssets.length + 1}`,
          name: assetData.name,
          nnaAddress: `${assetData.layer}.${assetData.category || '001'}.${(mockAssets.length + 1).toString().padStart(3, '0')}`,
          layer: assetData.layer,
          category: assetData.category,
          subcategory: assetData.subcategory,
          description: assetData.description,
          tags: assetData.tags,
          metadata: assetData.metadata,
          files: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1',
        };
        
        // Track uploaded files and failures
        const uploadedFiles: FileUploadResponse[] = [];
        const failedFiles: { file: File; error: string }[] = [];
        
        // Process each file if any
        if (assetData.files && assetData.files.length > 0) {
          for (const file of assetData.files) {
            // Create a unique upload ID
            const uploadId = uuidv4();
            
            // Create file upload tracking
            const fileUpload: FileUpload = {
              file,
              id: uploadId,
              progress: 0,
              status: 'pending',
              abortController: new AbortController(),
            };
            
            try {
              // Simulate the upload
              await this.simulateFileUpload(fileUpload, {
                onProgress: options?.onProgress,
                onComplete: (fileId, fileData) => {
                  uploadedFiles.push(fileData);
                  options?.onComplete?.(fileId, fileData);
                },
                onError: options?.onError,
              });
            } catch (error) {
              failedFiles.push({ 
                file, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              });
            }
          }
        }
        
        // Add the uploaded files to the asset
        baseAsset.files = uploadedFiles.map(file => ({
          id: file.id,
          filename: file.filename,
          contentType: file.contentType,
          size: file.size,
          url: file.url,
          uploadedAt: file.uploadedAt,
          thumbnailUrl: file.thumbnailUrl,
        }));
        
        // Add the asset to mock data
        mockAssets.push(baseAsset);
        
        return {
          asset: baseAsset,
          uploadedFiles,
          failedFiles,
        };
      }
      
      // For real API implementation:
      // 1. Upload each file individually with progress tracking
      const uploadTasks: Promise<FileUploadResponse>[] = [];
      const uploadedFiles: FileUploadResponse[] = [];
      const failedFiles: { file: File; error: string }[] = [];
      
      // Process each file if any
      if (assetData.files && assetData.files.length > 0) {
        for (const file of assetData.files) {
          const fileUpload = this.uploadFile(file, {
            onProgress: options?.onProgress,
            onComplete: options?.onComplete,
            onError: options?.onError,
          });
          
          // Create a promise for this upload
          const uploadPromise = new Promise<FileUploadResponse>((resolve, reject) => {
            // Poll the upload status until completion or error
            const checkStatus = () => {
              const status = this.getUploadStatus(fileUpload.id);
              
              if (!status) {
                reject(new Error('Upload not found'));
                return;
              }
              
              if (status.status === 'completed') {
                // When completed, the API response is stored in options.onComplete callback
                // We need to reconstruct that here since we don't have direct access
                const response: FileUploadResponse = {
                  id: uuidv4(), // This would come from the server
                  filename: file.name,
                  contentType: file.type,
                  size: file.size,
                  url: URL.createObjectURL(file), // Temporary URL
                  uploadedAt: new Date().toISOString(),
                };
                resolve(response);
              } else if (status.status === 'error') {
                reject(new Error(status.error || 'Upload failed'));
              } else {
                // Still in progress, check again after a short delay
                setTimeout(checkStatus, 500);
              }
            };
            
            // Start checking status
            checkStatus();
          });
          
          // Handle success and failure for this upload
          uploadPromise
            .then(fileData => {
              uploadedFiles.push(fileData);
            })
            .catch(error => {
              failedFiles.push({
                file,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            });
          
          uploadTasks.push(uploadPromise);
        }
      }
      
      // Wait for all uploads to complete
      await Promise.allSettled(uploadTasks);
      
      // Create the asset with the uploaded file IDs
      const formData = new FormData();
      formData.append('name', assetData.name);
      formData.append('layer', assetData.layer);
      
      if (assetData.category) formData.append('category', assetData.category);
      if (assetData.subcategory) formData.append('subcategory', assetData.subcategory);
      if (assetData.description) formData.append('description', assetData.description);
      if (assetData.tags) formData.append('tags', JSON.stringify(assetData.tags));
      if (assetData.metadata) formData.append('metadata', JSON.stringify(assetData.metadata));
      
      // Add the IDs of successfully uploaded files
      if (uploadedFiles.length > 0) {
        formData.append('fileIds', JSON.stringify(uploadedFiles.map(file => file.id)));
      }
      
      // Create the asset with the uploaded files
      const response = await api.post<ApiResponse<Asset>>('/assets', formData);
      const asset = response.data.data as Asset;
      
      return {
        asset,
        uploadedFiles,
        failedFiles,
      };
    } catch (error) {
      console.error('Error creating asset with files:', error);
      throw new Error('Failed to create asset with files');
    }
  }

  /**
   * Create an asset with standard approach (no advanced upload tracking)
   */
  async createAsset(assetData: AssetCreateRequest): Promise<Asset> {
    try {
      if (this.useMockData()) {
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
      if (this.useMockData()) {
        console.log('Using mock data for asset update');
        const assetIndex = mockAssets.findIndex(a => a.id === id);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }
        
        // Handle files separately to ensure type compatibility
        const files = updateData.files 
          ? mockAssets[assetIndex].files || []
          : mockAssets[assetIndex].files;
        
        // Create updated asset with correct types
        const updatedAsset: Asset = {
          ...mockAssets[assetIndex],
          name: updateData.name || mockAssets[assetIndex].name,
          description: updateData.description || mockAssets[assetIndex].description,
          tags: updateData.tags || mockAssets[assetIndex].tags,
          metadata: updateData.metadata || mockAssets[assetIndex].metadata,
          files,
          updatedAt: new Date().toISOString(),
        };
        
        // If there are new files, add mock file entries for them
        if (updateData.files && updateData.files.length > 0) {
          if (!updatedAsset.files) {
            updatedAsset.files = [];
          }
          
          // Add mock entries for each new file
          updateData.files.forEach(file => {
            const newFile: AssetFile = {
              id: uuidv4(),
              filename: file.name,
              contentType: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
              uploadedAt: new Date().toISOString(),
              thumbnailUrl: file.type.startsWith('image/') 
                ? URL.createObjectURL(file) 
                : `https://via.placeholder.com/100?text=${encodeURIComponent(file.name)}`,
            };
            updatedAsset.files!.push(newFile);
          });
        }
        
        mockAssets[assetIndex] = updatedAsset;
        return updatedAsset;
      }

      // If files are included, use multipart form data
      if (updateData.files && updateData.files.length > 0) {
        const formData = new FormData();
        
        // Add non-file fields
        if (updateData.name) formData.append('name', updateData.name);
        if (updateData.description) formData.append('description', updateData.description);
        if (updateData.tags) formData.append('tags', JSON.stringify(updateData.tags));
        if (updateData.metadata) formData.append('metadata', JSON.stringify(updateData.metadata));
        
        // Add files
        updateData.files.forEach(file => {
          formData.append('files', file);
        });
        
        const response = await api.patch<ApiResponse<Asset>>(`/assets/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data.data as Asset;
      } else {
        // No files, use standard JSON request
        const response = await api.patch<ApiResponse<Asset>>(`/assets/${id}`, updateData);
        return response.data.data as Asset;
      }
    } catch (error) {
      console.error(`Error updating asset with ID ${id}:`, error);
      throw new Error('Failed to update asset');
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      if (this.useMockData()) {
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

  /**
   * Delete a file from an asset
   * @param assetId The ID of the asset
   * @param fileId The ID of the file to delete
   */
  async deleteAssetFile(assetId: string, fileId: string): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for file deletion');
        const assetIndex = mockAssets.findIndex(a => a.id === assetId);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }
        
        const asset = mockAssets[assetIndex];
        if (!asset.files) {
          throw new Error('Asset has no files');
        }
        
        const fileIndex = asset.files.findIndex(f => f.id === fileId);
        if (fileIndex === -1) {
          throw new Error('File not found');
        }
        
        // Remove the file
        asset.files.splice(fileIndex, 1);
        asset.updatedAt = new Date().toISOString();
        
        mockAssets[assetIndex] = asset;
        return asset;
      }

      const response = await api.delete<ApiResponse<Asset>>(`/assets/${assetId}/files/${fileId}`);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error deleting file ${fileId} from asset ${assetId}:`, error);
      throw new Error('Failed to delete file from asset');
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

// Create a singleton instance
const assetService = new AssetService();

// Export the singleton
export default assetService;