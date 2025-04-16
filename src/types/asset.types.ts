export interface Asset {
  id: string;
  name: string;
  nnaAddress?: string;
  address?: string; // Alternative property used in some components
  layer: string;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  files?: AssetFile[];
  metadata?: Record<string, any>;
  order?: number;
  version?: VersionInfo;
  versionHistory?: VersionInfo[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  collectionIds?: string[]; // Collections this asset belongs to
  featured?: boolean; // Whether this asset is featured
  rights?: AssetRights; // Rights management information
  status?: string; // Asset status - pending, processing, complete, error, etc.
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

export type SearchOperator = 'AND' | 'OR';

export type SearchConditionType = 
  | 'text' 
  | 'date' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'tags';

export type SearchComparisonOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'notContains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'greaterThanOrEqual' 
  | 'lessThanOrEqual' 
  | 'between' 
  | 'in' 
  | 'exists';

export interface SearchCondition {
  field: string;
  type: SearchConditionType;
  operator: SearchComparisonOperator;
  value: any;
  label?: string; // Display label for the field
}

export interface SearchGroup {
  operator: SearchOperator;
  conditions: (SearchCondition | SearchGroup)[];
}

export interface AssetSearchParams {
  search?: string; // Simple search query
  layer?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  
  // Advanced search capabilities
  searchGroup?: SearchGroup; // Complex search query structure
  createdAfter?: string | Date; // ISO string or Date object
  createdBefore?: string | Date;
  updatedAfter?: string | Date;
  updatedBefore?: string | Date;
  createdBy?: string;
  fileTypes?: string[]; // MIME types or extensions
  fileCount?: number; // Number of files
  minFileSize?: number; // In bytes
  maxFileSize?: number; // In bytes
  hasFiles?: boolean;
  
  // Metadata field search
  metadata?: Record<string, any>;
  
  // Pagination & sorting
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  params: AssetSearchParams;
  createdAt: string;
  userId: string;
  isDefault?: boolean;
  icon?: string;
}

export interface FileUpload {
  file: File;
  id: string; // Unique ID for this upload
  progress: number; // 0-100 percentage
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  errorCode?: string; // Optional error code from server
  abortController: AbortController;
  startTime?: number; // Timestamp when upload started
  endTime?: number; // Timestamp when upload completed or failed
  estimatedTimeRemaining?: number; // Estimated seconds remaining
  uploadSpeed?: number; // Upload speed in bytes/second
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
  layer?: string;  // Allow changing taxonomy
  category?: string;
  subcategory?: string;
  metadata?: Record<string, any>;
  files?: File[]; // For adding additional files
}

export interface UploadProgressCallback {
  (fileId: string, progress: number): void;
}

export interface FileUploadOptions {
  onProgress?: UploadProgressCallback;
  onComplete?: (fileId: string, fileData: FileUploadResponse) => void;
  onError?: (fileId: string, error: string, errorCode?: string) => void;
  onCancel?: (fileId: string) => void;
  onStart?: (fileId: string, file: File) => void;
  maxConcurrentUploads?: number;
  chunkSize?: number; // For chunked uploads (in bytes)
  retryCount?: number; // Number of retries on failure
  retryDelay?: number; // Delay between retries (ms)
  timeout?: number; // Timeout in milliseconds
  maxSize?: number; // Maximum file size in bytes
  metadata?: Record<string, unknown>; // Additional metadata to send with the file
  validateBeforeUpload?: (file: File) => boolean | Promise<boolean>;
}

export interface AssetUploadResult {
  asset: Asset;
  uploadedFiles: FileUploadResponse[];
  failedFiles: { file: File; error: string }[];
}

export interface BatchUploadItem {
  id: string;
  file: File;
  metadata: BatchItemMetadata;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  progress: number;
  asset?: Asset;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface BatchItemMetadata {
  name?: string;
  layer: string;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  source?: string;
  license?: string;
  attributionRequired?: boolean;
  attributionText?: string;
  commercialUse?: boolean;
  [key: string]: any; // Additional layer-specific fields
}

export interface BatchUploadOptions {
  onItemStart?: (itemId: string) => void;
  onItemProgress?: (itemId: string, progress: number) => void;
  onItemComplete?: (itemId: string, asset: Asset) => void;
  onItemError?: (itemId: string, error: string) => void;
  onBatchProgress?: (completedItems: number, totalItems: number) => void;
  onBatchComplete?: (results: BatchUploadResult) => void;
  maxConcurrentUploads?: number;
}

export interface BatchUploadResult {
  successful: Asset[];
  failed: { id: string; file: File; error: string }[];
  totalCount: number;
  successCount: number;
  failureCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CSVTemplateField {
  name: string;
  description: string;
  required: boolean;
  example: string;
}

export interface CSVTemplate {
  fields: CSVTemplateField[];
  example: string;
}

/**
 * Version information for an asset
 */
export interface VersionInfo {
  number: string;
  createdAt: string;
  createdBy: string;
  message: string;
  changes?: VersionChanges;
  hash?: string; // Unique hash for this version
}

/**
 * Changes made in a version compared to the previous version
 */
export interface VersionChanges {
  fields?: FieldChange[];
  filesAdded?: AssetFile[];
  filesRemoved?: AssetFile[];
  filesModified?: FileChange[];
  metadataChanges?: MetadataChange[];
}

/**
 * Change to a basic field in an asset
 */
export interface FieldChange {
  field: keyof Asset;
  oldValue: any;
  newValue: any;
}

/**
 * Change to a file in an asset
 */
export interface FileChange {
  file: AssetFile;
  changedProperties: string[];
}

/**
 * Change to metadata in an asset
 */
export interface MetadataChange {
  key: string;
  oldValue: any;
  newValue: any;
}

/**
 * Request to create a new version of an asset
 */
export interface CreateVersionRequest {
  assetId: string;
  message: string;
  files?: File[];
  metadata?: Record<string, any>;
  changes?: Partial<Asset>;
}

/**
 * Request to revert to a previous version
 */
export interface RevertVersionRequest {
  assetId: string;
  versionNumber: string;
  message?: string;
}

/**
 * Asset analytics types
 */

export interface AssetAnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  layer?: string;
  category?: string;
  subcategory?: string;
  createdBy?: string;
  timeFrame?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
}

export interface AssetUsageMetrics {
  totalViews: number;
  totalDownloads: number;
  totalUniquePlatforms: number;
  totalUniqueUsers: number;
  viewsChange: number; // percentage change from previous period
  downloadsChange: number; // percentage change from previous period
  uniqueUsersChange: number; // percentage change from previous period
}

export interface AssetTimeseriesDataPoint {
  date: string;
  views: number;
  downloads: number;
  uniqueUsers?: number;
}

export interface AssetUsageData {
  timeseriesData: AssetTimeseriesDataPoint[];
  metrics: AssetUsageMetrics;
}

export interface TopAssetData {
  id: string;
  name: string;
  nnaAddress: string;
  layer: string;
  category?: string;
  subcategory?: string;
  views: number;
  downloads: number;
  thumbnailUrl?: string;
  createdBy: string;
  createdAt: string;
  lastViewedAt?: string;
}

export interface PlatformUsageData {
  platform: string;
  views: number;
  downloads: number;
  percentage: number;
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
}

export interface AssetsByCategoryData {
  category: string;
  count: number;
  percentage: number;
}

export interface AssetsAnalyticsData {
  usageData: AssetUsageData;
  topAssets: TopAssetData[];
  platformUsage: PlatformUsageData[];
  userActivity: UserActivityData[];
  assetsByCategory: AssetsByCategoryData[];
  assetsByLayer: Record<string, number>;
  totalAssets: number;
  newAssetsThisPeriod: number;
  newAssetsPercentageChange: number;
}

/**
 * Asset Collection types
 */

export enum CollectionType {
  PERSONAL = 'personal',
  PUBLIC = 'public',
  CURATED = 'curated',
  PROJECT = 'project',
  FEATURED = 'featured',
  SYSTEM = 'system'
}

export enum CollectionVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  SHARED = 'shared'
}

export interface CollectionPermission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin'; // Permission level
  addedAt: string;
  addedBy: string;
}

export interface CollectionAsset {
  assetId: string;
  asset?: Asset; // Populated asset data when needed
  addedAt: string;
  addedBy: string;
  order: number;
  notes?: string; // Optional notes about this asset in the collection
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  type: CollectionType;
  visibility: CollectionVisibility;
  coverImageUrl?: string;
  assetCount: number;
  assets: CollectionAsset[];
  tags?: string[];
  metadata?: Record<string, any>;
  permissions?: CollectionPermission[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastViewedAt?: string;
  viewCount?: number;
  featured?: boolean;
  slug?: string; // URL-friendly identifier
}

export interface CollectionCreateRequest {
  name: string;
  description?: string;
  type: CollectionType;
  visibility: CollectionVisibility;
  tags?: string[];
  metadata?: Record<string, any>;
  assetIds?: string[]; // Optional initial assets
  coverImageUrl?: string;
}

export interface CollectionUpdateRequest {
  name?: string;
  description?: string;
  type?: CollectionType;
  visibility?: CollectionVisibility;
  tags?: string[];
  metadata?: Record<string, any>;
  coverImageUrl?: string;
}

export interface CollectionAddAssetRequest {
  assetIds: string[];
  notes?: string;
}

export interface CollectionRemoveAssetRequest {
  assetIds: string[];
}

export interface CollectionReorderAssetsRequest {
  assets: {
    assetId: string;
    order: number;
  }[];
}

export interface CollectionSearchParams {
  query?: string;
  type?: CollectionType;
  visibility?: CollectionVisibility;
  tags?: string[];
  createdBy?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Asset Rights Management types
 */

export enum RightsStatus {
  VERIFIED = 'verified',         // All rights are verified and cleared
  PARTIAL = 'partial',           // Some rights are verified, others pending
  PENDING = 'pending',           // Rights verification in progress
  UNVERIFIED = 'unverified',     // Rights not yet submitted for verification
  REJECTED = 'rejected',         // Rights verification failed
  EXPIRED = 'expired'            // Previously verified rights have expired
}

export enum RightsType {
  COPYRIGHT = 'copyright',       // Copyright ownership or license
  TRADEMARK = 'trademark',       // Trademark usage rights
  PATENT = 'patent',             // Patent rights
  PERSONALITY = 'personality',   // Personality/publicity rights
  MUSIC = 'music',               // Music synchronization rights
  PERFORMANCE = 'performance',   // Performance rights
  MECHANICAL = 'mechanical',     // Mechanical reproduction rights
  SYNC = 'sync',                 // Synchronization rights
  MASTER = 'master',             // Master recording rights
  ATTRIBUTION = 'attribution'    // Attribution requirements
}

export enum RightsLimitation {
  TIME = 'time',                 // Time-limited usage
  TERRITORY = 'territory',       // Geographic limitations
  PLATFORM = 'platform',         // Platform-specific usage
  PURPOSE = 'purpose',           // Purpose-specific usage
  MODIFICATION = 'modification', // Modification limitations
  DISTRIBUTION = 'distribution', // Distribution limitations
  COMBINATION = 'combination'    // Combination with other works
}

export enum RightsVerificationMethod {
  BLOCKCHAIN = 'blockchain',     // Blockchain verification
  CONTRACT = 'contract',         // Contract evidence
  LICENSE = 'license',           // License agreement
  DECLARATION = 'declaration',   // Declaration of rights
  REGISTRY = 'registry',         // Registry lookup
  LEGAL = 'legal'                // Legal documentation
}

export interface RightsVerification {
  id: string;                    // Verification ID
  method: RightsVerificationMethod; // Verification method
  status: RightsStatus;          // Verification status
  verifiedBy?: string;           // Entity that performed verification
  verifiedAt?: string;           // Timestamp of verification
  expiresAt?: string;            // Expiration date of verification
  evidenceIds?: string[];        // IDs of evidence documents
  evidenceUrls?: string[];       // URLs to evidence
  notes?: string;                // Notes about verification
  transactionId?: string;        // Blockchain transaction ID if applicable
  contractId?: string;           // Contract ID if applicable
}

export interface RightsLimitationDetail {
  type: RightsLimitation;        // Type of limitation
  description: string;           // Description of limitation
  value?: any;                   // Value of limitation (e.g., date, territory code)
  startDate?: string;            // Start date if time-based
  endDate?: string;              // End date if time-based
  territories?: string[];        // Territory codes if territory-based
  platforms?: string[];          // Platform identifiers if platform-based
}

export interface RightsClearance {
  id: string;                    // Clearance record ID
  rightType: RightsType;         // Type of right being cleared
  status: RightsStatus;          // Clearance status
  source: string;                // Source of rights (e.g., license, ownership)
  holder: string;                // Rights holder
  obtainedAt: string;            // When rights were obtained
  expiresAt?: string;            // When rights expire (if applicable)
  limitations?: RightsLimitationDetail[]; // Usage limitations
  verification?: RightsVerification; // Verification details
  clearanceDocUrl?: string;      // URL to clearance document
  licenseType?: string;          // Type of license (e.g., CC BY 4.0)
  termsUrl?: string;             // URL to terms
  paymentRequired?: boolean;     // Whether payment is required
  paymentDetails?: string;       // Payment details
  notes?: string;                // Additional notes
}

export interface RightsUsage {
  id: string;                    // Usage record ID
  assetId: string;               // Asset ID
  usedBy: string;                // User ID using the asset
  usedAt: string;                // When the asset was used
  purpose: string;               // Purpose of usage
  platform: string;              // Platform where asset was used
  projectId?: string;            // Project ID if applicable
  contentId?: string;            // Content ID where asset was used
  contentUrl?: string;           // URL to content where asset was used
  usageType: string;             // Type of usage (e.g., inclusion, derivative)
  status: 'active' | 'completed' | 'terminated'; // Usage status
  reportedAt?: string;           // When usage was reported
  notes?: string;                // Additional notes
}

export interface AssetRights {
  status: RightsStatus;          // Overall rights status
  clearances: RightsClearance[]; // Rights clearance records
  usages?: RightsUsage[];        // Asset usage records
  updateHistory?: {              // History of rights updates
    updatedAt: string;           // Update timestamp
    updatedBy: string;           // User who made update
    changedFields: string[];     // Fields that were changed
    previousStatus?: RightsStatus; // Previous status
    notes?: string;              // Notes about update
  }[];
  attributionText?: string;      // Required attribution text
  attributionRequired: boolean;  // Whether attribution is required
  commercialUse: boolean;        // Whether commercial use is allowed
  derivativeWorks: boolean;      // Whether derivative works are allowed
  pendingVerification: boolean;  // Whether verification is pending
  clarityJobId?: string;         // Clearity service job ID
  clarityLastChecked?: string;   // When Clearity last checked rights
}

export interface RightsVerificationRequest {
  assetId: string;               // Asset ID
  rightTypes: RightsType[];      // Types of rights to verify
  evidenceFiles?: File[];        // Evidence files
  evidenceUrls?: string[];       // URLs to evidence
  notes?: string;                // Additional notes
  contactEmail?: string;         // Contact email for verification
}

export interface RightsUpdateRequest {
  assetId: string;               // Asset ID
  attributionText?: string;      // Attribution text
  attributionRequired?: boolean; // Whether attribution is required
  commercialUse?: boolean;       // Whether commercial use is allowed
  derivativeWorks?: boolean;     // Whether derivative works are allowed
  rightsClearances?: Partial<RightsClearance>[]; // Clearances to add/update
  clearanceIdsToRemove?: string[]; // Clearance IDs to remove
  notes?: string;                // Notes about update
}

export interface RightsClearanceRequest {
  assetId: string;               // Asset ID
  rightType: RightsType;         // Type of right being cleared
  source: string;                // Source of rights
  holder: string;                // Rights holder
  expiresAt?: string;            // Expiration date
  limitations?: RightsLimitationDetail[]; // Usage limitations
  clearanceDoc?: File;           // Clearance document
  licenseType?: string;          // License type
  termsUrl?: string;             // Terms URL
  paymentRequired?: boolean;     // Whether payment is required
  paymentDetails?: string;       // Payment details
  notes?: string;                // Additional notes
}