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
}