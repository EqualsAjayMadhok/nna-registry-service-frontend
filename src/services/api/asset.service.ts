import axios, { AxiosProgressEvent } from 'axios';
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
import { Upload, UploadStatus } from './upload.service';
import api from './api';

type UploadStatus = 'pending' | 'uploading' | 'completed' | 'cancelled' | 'error';

export interface AssetMetadata {
  layer: string;
  category: string;
  subcategory: string;
  name: string;
  description?: string;
}

export interface UploadType {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  cancel: () => void;
  metadata?: AssetMetadata;
  abortController?: AbortController;
  startTime?: number;
  endTime?: number;
  uploadSpeed?: number;
  estimatedTimeRemaining?: number;
  error?: string;
  response?: any;
}

export const activeUploads = new Map<string, UploadType>();

export const createUpload = (file: File, metadata?: AssetMetadata): UploadType => {
  const upload: UploadType = {
    id: uuidv4(),
    file,
    progress: 0,
    status: 'pending',
    cancel: () => {},
    metadata
  };
  activeUploads.set(upload.id, upload);
  return upload;
};

class AssetService {
  /**
   * Get the count of existing assets with the specified layer, category, and subcategory
   */
  async getExistingAssetsCount(
    layer: string,
    category: string,
    subcategory: string
  ): Promise<number> {
    try {
      const response = await api.get<ApiResponse<number>>(
        `/assets/count?layer=${layer}&category=${category}&subcategory=${subcategory}`
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
  async uploadAsset(file: File, metadata: AssetMetadata): Promise<UploadType> {
    const uploadId = uuidv4();
    const abortController = new AbortController();

    const upload: UploadType = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending',
      abortController,
      cancel: () => {
        abortController.abort();
        upload.status = 'cancelled';
        activeUploads.delete(uploadId);
      },
      metadata
    };

    activeUploads.set(uploadId, upload);
    return upload;
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

  uploadFile(file: File, options?: FileUploadOptions): UploadType {
    const uploadId = uuidv4();
    const abortController = new AbortController();
    
    const upload: UploadType = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending',
      abortController,
      cancel: () => {
        abortController.abort();
        upload.status = 'cancelled';
        activeUploads.delete(uploadId);
        options?.onCancel?.(uploadId);
      },
      metadata: options?.metadata ? {
        layer: options.metadata.layer as string,
        category: options.metadata.category as string,
        subcategory: options.metadata.subcategory as string,
        name: options.metadata.name as string,
        description: options.metadata.description as string | undefined
      } : undefined
    };
    
    activeUploads.set(uploadId, upload);
    
    setTimeout(() => {
      this.processFileUpload(upload, options);
    }, 0);
    
    return upload;
  }

  private async processFileUpload(upload: UploadType, options?: FileUploadOptions): Promise<void> {
    try {
      upload.status = 'uploading';
      upload.startTime = Date.now();
      options?.onProgress?.(upload.id, 0);
      
      const formData = new FormData();
      formData.append('file', upload.file);
      
      const response = await api.post<ApiResponse<FileUploadResponse>>(
        '/assets/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            upload.progress = progress;
            
            // Calculate upload speed and estimated time remaining
            const currentTime = Date.now();
            const elapsedTime = (currentTime - (upload.startTime || currentTime)) / 1000; // in seconds
            const uploadSpeed = progressEvent.loaded / elapsedTime; // bytes per second
            const remainingBytes = (progressEvent.total || 0) - progressEvent.loaded;
            const estimatedTimeRemaining = remainingBytes / uploadSpeed;
            
            upload.uploadSpeed = uploadSpeed;
            upload.estimatedTimeRemaining = estimatedTimeRemaining;
            
            options?.onProgress?.(upload.id, progress);
          },
        }
      );
      
      upload.status = 'completed';
      upload.progress = 100;
      upload.endTime = Date.now();
      upload.response = response.data.data;
      options?.onComplete?.(upload.id, response.data.data);
      
      activeUploads.delete(upload.id);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Upload cancelled:', error.message);
        return;
      }
      
      upload.status = 'error';
      upload.endTime = Date.now();
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      upload.error = errorMessage;
      options?.onError?.(upload.id, errorMessage);
      
      activeUploads.delete(upload.id);
      console.error('Error uploading file:', error);
    }
  }

  async cancelUpload(uploadId: string): Promise<boolean> {
    const upload = activeUploads.get(uploadId);
    if (upload) {
      upload.cancel();
      activeUploads.delete(uploadId);
      return true;
    }
    return false;
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
            const upload = this.uploadFile(file, options);
            
            await new Promise<void>((resolve) => {
              const checkStatus = () => {
                if ([UploadStatus.COMPLETED, UploadStatus.ERROR, UploadStatus.CANCELLED].includes(upload.status)) {
                  resolve();
                } else {
                  setTimeout(checkStatus, 500);
                }
              };
              checkStatus();
            });
            
            if (upload.status === UploadStatus.ERROR) {
              throw new Error('File upload failed');
            } else if (upload.status === UploadStatus.CANCELLED) {
              throw new Error('File upload was cancelled');
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
          tags: values[6]
        };
        metadata.push(metadataItem);
      }
      
      return metadata;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return { error: 'Error parsing CSV' };
    }
  }
}
