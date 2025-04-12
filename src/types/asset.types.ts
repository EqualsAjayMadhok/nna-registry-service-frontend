export interface Asset {
  id: string;
  name: string;
  nnaAddress: string;
  layer: string;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  files?: AssetFile[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AssetFile {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  uploadedAt: string;
  thumbnailUrl?: string;
}

export interface AssetSearchParams {
  query?: string;
  layer?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface FileUpload {
  file: File;
  id: string; // Unique ID for this upload
  progress: number; // 0-100 percentage
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  abortController: AbortController;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface AssetCreateRequest {
  name: string;
  layer: string;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  files?: File[];
}

export interface AssetUpdateRequest {
  name?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  files?: File[]; // For adding additional files
}

export interface UploadProgressCallback {
  (fileId: string, progress: number): void;
}

export interface FileUploadOptions {
  onProgress?: UploadProgressCallback;
  onComplete?: (fileId: string, fileData: FileUploadResponse) => void;
  onError?: (fileId: string, error: string) => void;
}

export interface AssetUploadResult {
  asset: Asset;
  uploadedFiles: FileUploadResponse[];
  failedFiles: { file: File; error: string }[];
}