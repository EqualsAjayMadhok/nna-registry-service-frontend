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
import api from './api';

type ProgressEvent = {
  loaded: number;
  total?: number;
};

interface UploadConfig {
  headers?: Record<string, string>;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

interface UploadProgress {
  loaded: number;
  total: number;
}

type UploadStatus = 'pending' | 'uploading' | 'completed' | 'cancelled' | 'error';

interface Upload {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  response?: Asset;
}

interface UploadCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: (asset: Asset) => void;
  onError?: (error: string) => void;
}

export interface AssetMetadata {
  layer: string;
  category: string;
  subcategory: string;
  name: string;
  description?: string;
}

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  startTime: number;
  endTime?: number;
  response?: Asset;
}

interface UploadOptions {
  onProgress?: (progress: number, total: number) => void;
  onComplete?: (response: Asset) => void;
  onError?: (error: string) => void;
  metadata?: Record<string, unknown>;
}

function isFileUploadOptions(callbacks: UploadCallbacks | FileUploadOptions): callbacks is FileUploadOptions {
  return 'onComplete' in callbacks && callbacks.onComplete?.length === 2;
}

export class AssetService {
  private uploads = new Map<string, Upload>();

  /**
   * Get the count of existing assets with the specified layer, category, and subcategory
   */
  async getExistingAssetsCount(params: { layer: string; category: string; subcategory: string }): Promise<number> {
    try {
      const response = await api.get<ApiResponse<number>>(
        `/assets/count?layer=${params.layer}&category=${params.category}&subcategory=${params.subcategory}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error getting assets count:', error);
      return 1;
    }
  }

  /**
   * Upload a new asset
   */
  async uploadFile(file: File, callbacks?: UploadCallbacks | FileUploadOptions): Promise<string> {
    const uploadId = uuidv4();
    const upload: Upload = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending'
    };

    this.uploads.set(uploadId, upload);
    this.processUpload(upload, callbacks);
    return uploadId;
  }

  /**
   * Advanced search with complex query conditions
   */
  async advancedSearch(params: AssetSearchParams = {}): Promise<PaginatedResponse<Asset>> {
    try {
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
      const response = await api.get<ApiResponse<PaginatedResponse<Asset>>>('/assets', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching asset ${id}:`, error);
      throw error;
    }
  }

  async getAssetVersion(id: string, versionNumber: string): Promise<Asset> {
    try {
      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}/versions/${versionNumber}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching asset ${id} version ${versionNumber}:`, error);
      throw error;
    }
  }

  async createVersion(request: CreateVersionRequest): Promise<Asset> {
    try {
      const response = await api.post<ApiResponse<Asset>>(`/assets/${request.assetId}/versions`, request);
      return response.data.data;
    } catch (error) {
      console.error(`Error creating version for asset ${request.assetId}:`, error);
      throw error;
    }
  }

  async createAsset(data: AssetCreateRequest): Promise<Asset> {
    try {
      const response = await api.post<ApiResponse<Asset>>('/assets', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  }

  async updateAsset(id: string, data: AssetUpdateRequest): Promise<Asset> {
    try {
      const response = await api.put<ApiResponse<Asset>>(`/assets/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating asset ${id}:`, error);
      throw error;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/assets/${id}`);
    } catch (error) {
      console.error(`Error deleting asset ${id}:`, error);
      throw error;
    }
  }

  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const response = await api.get<ApiResponse<SavedSearch[]>>('/assets/searches');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      throw error;
    }
  }

  async saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'userId'>): Promise<SavedSearch> {
    try {
      const response = await api.post<ApiResponse<SavedSearch>>('/assets/searches', search);
      return response.data.data;
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }

  async deleteSavedSearch(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/assets/searches/${id}`);
    } catch (error) {
      console.error('Error deleting saved search:', error);
      throw error;
    }
  }

  async setDefaultSavedSearch(id: string): Promise<SavedSearch> {
    try {
      const response = await api.put<ApiResponse<SavedSearch>>(`/assets/searches/${id}/default`);
      return response.data.data;
    } catch (error) {
      console.error('Error setting default saved search:', error);
      throw error;
    }
  }

  async revertToVersion(params: { assetId: string; versionNumber: string; message: string }): Promise<Asset> {
    try {
      const response = await api.post<ApiResponse<Asset>>(`/assets/${params.assetId}/versions/${params.versionNumber}/revert`, {
        message: params.message
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to revert to version');
      }
    } catch (error) {
      console.error('Error reverting to version:', error);
      throw error;
    }
  }

  private async processUpload(upload: Upload, callbacks?: UploadCallbacks | FileUploadOptions): Promise<void> {
    try {
      upload.status = 'uploading';
      const formData = new FormData();
      formData.append('file', upload.file);

      const response = await axios.post<ApiResponse<Asset>>('/assets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success && response.data.data) {
        const asset = response.data.data;
        upload.status = 'completed';
        upload.progress = 100;
        upload.response = asset;

        if (callbacks?.onComplete) {
          if ('onProgress' in callbacks) {
            const fileData: FileUploadResponse = {
              id: asset.id,
              filename: upload.file.name,
              contentType: upload.file.type,
              size: upload.file.size,
              url: asset.files?.[0]?.url || '',
              uploadedAt: new Date().toISOString()
            };
            (callbacks as FileUploadOptions).onComplete?.(fileData.id, fileData);
          } else {
            (callbacks as UploadCallbacks).onComplete?.(asset);
          }
        }
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      upload.status = 'error';
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      upload.error = errorMessage;
      if (callbacks?.onError) {
        if ('onProgress' in callbacks) {
          (callbacks as FileUploadOptions).onError?.(upload.id, errorMessage);
        } else {
          (callbacks as UploadCallbacks).onError?.(errorMessage);
        }
      }
    } finally {
      this.uploads.delete(upload.id);
    }
  }

  getUploadStatus(uploadId: string): Upload | undefined {
    return this.uploads.get(uploadId);
  }

  cancelUpload(uploadId: string): void {
    const upload = this.uploads.get(uploadId);
    if (upload && upload.status === 'uploading') {
      upload.status = 'cancelled';
      this.uploads.delete(uploadId);
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
      const fileUploads: FileUploadResponse[] = [];
      
      if (assetData.files && assetData.files.length > 0) {
        for (const file of assetData.files) {
          if (file instanceof File) {
            const uploadId = await this.uploadFile(file, options);
            const upload = this.getUploadStatus(uploadId);
            
            if (upload && upload.status !== 'completed') {
              throw new Error('File upload failed');
            }
          }
        }
      }
      
      const asset = await this.createAsset({
        ...assetData,
        files: undefined,
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
   * Get CSV template for batch uploads
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
        }
      ],
      example: 'filename,name,layer,category,subcategory,description,tags\n' +
        'song1.mp3,My Pop Song,S,POP,BAS,A basic pop song,pop;music;dance\n' +
        'star1.mp4,Pop Star #1,G,POP,BAS,A basic pop star,star;pop;performer\n' +
        'look1.jpg,Fashion Look,L,FAS,DRS,A fashionable dress,fashion;dress;outfit'
    };
  }

  /**
   * Parse CSV content for batch upload
   */
  parseCSVForBatchUpload(csvContent: string): BatchItemMetadata[] | { error: string } {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        return { error: 'CSV must contain a header row and at least one data row' };
      }
      
      const header = lines[0].split(',').map(col => col.trim());
      const requiredColumns = ['filename', 'name', 'layer', 'category', 'subcategory'];
      const missingColumns = requiredColumns.filter(col => !header.includes(col));
      
      if (missingColumns.length > 0) {
        return { error: `CSV is missing required columns: ${missingColumns.join(', ')}` };
      }
      
      const metadata: BatchItemMetadata[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(val => val.trim());
        const metadataItem: BatchItemMetadata = {
          filename: values[0],
          name: values[1],
          layer: values[2],
          category: values[3],
          subcategory: values[4],
          description: values[5],
          tags: values[6] ? values[6].split(';') : []
        };
        metadata.push(metadataItem);
      }
      
      return metadata;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return { error: 'Error parsing CSV' };
    }
  }

  batchUploadAssets(
    items: BatchUploadItem[],
    options: BatchUploadOptions
  ): Promise<BatchUploadResult> {
    const { maxConcurrentUploads = 3, onItemStart, onItemProgress, onItemComplete, onItemError } = options;
    
    let activeUploads = 0;
    const queue = [...items];
    const results: BatchUploadResult = {
      successful: [],
      failed: [],
      totalCount: items.length,
      successCount: 0,
      failureCount: 0
    };

    return new Promise((resolve) => {
      const processNext = async () => {
        if (queue.length === 0 && activeUploads === 0) {
          resolve(results);
          return;
        }

        while (queue.length > 0 && activeUploads < maxConcurrentUploads) {
          const item = queue.shift();
          if (!item) continue;

          activeUploads++;
          onItemStart?.(item.id);

          try {
            const uploadId = await this.uploadFile(item.file, {
              onProgress: (progressValue: number) => onItemProgress?.(item.id, progressValue),
              onComplete: (assetData: Asset) => {
                results.successful.push(assetData);
                results.successCount++;
                onItemComplete?.(item.id, assetData);
              },
              onError: (errorMessage: string) => {
                results.failed.push({
                  id: item.id,
                  file: item.file,
                  error: errorMessage
                });
                results.failureCount++;
                onItemError?.(item.id, errorMessage);
              }
            });
          } catch (error) {
            console.error(`Error uploading item ${item.id}:`, error);
            results.failed.push({
              id: item.id,
              file: item.file,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            results.failureCount++;
            onItemError?.(item.id, error instanceof Error ? error.message : 'Unknown error');
          }

          activeUploads--;
          processNext();
        }
      };

      processNext();
    });
  }

  cancelBatchUploadItem(id: string): void {
    const upload = Array.from(this.uploads.values()).find(u => u.id === id);
    if (upload) {
      this.cancelUpload(id);
    }
  }

  async getAssetsAnalytics(filters: AssetAnalyticsFilters): Promise<AssetsAnalyticsData> {
    try {
      const response = await api.get<ApiResponse<AssetsAnalyticsData>>('/assets/analytics', {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assets analytics:', error);
      throw error;
    }
  }
}

const assetService = new AssetService();
export default assetService;





