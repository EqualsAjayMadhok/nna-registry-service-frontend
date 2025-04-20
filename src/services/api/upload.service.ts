import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload status enum
 */
export enum UploadStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR'
}

/**
 * Upload response interface
 */
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * Upload tracking interface
 */
export interface Upload {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  cancel: () => void;
}

// Map to track active uploads
export const activeUploads = new Map<string, Upload>();

/**
 * Upload a file with progress tracking
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  let upload: Upload | undefined;
  
  try {
    // Create an upload object to track this upload
    upload = {
      id: uuidv4(),
      file,
      progress: 0,
      status: UploadStatus.PENDING,
      cancel: () => {}
    };

    // Add to active uploads
    activeUploads.set(upload.id, upload);

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Make the upload request
    const response = await axios.post<UploadResponse>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Update status and return response
    if (upload) {
      upload.status = UploadStatus.COMPLETED;
    }
    return response.data;
  } catch (error) {
    if (upload) {
      upload.status = UploadStatus.ERROR;
    }
    throw error;
  } finally {
    if (upload) {
      activeUploads.delete(upload.id);
    }
  }
} 