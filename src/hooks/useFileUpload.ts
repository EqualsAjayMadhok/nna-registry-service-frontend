import { useState, useCallback, useEffect, useRef } from 'react';
import assetService from '../services/api/asset.service';
import { 
  FileUpload, 
  FileUploadOptions, 
  FileUploadResponse 
} from '../types/asset.types';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface FileUploadState {
  files: Map<string, FileUpload>;
  uploadedFiles: FileUploadResponse[];
  failedFiles: { file: File; error: string }[];
  overallProgress: number;
  overallStatus: UploadStatus;
  error: string | null;
  isUploading: boolean;
}

export interface FileUploadHookResult {
  // State
  uploadState: FileUploadState;
  
  // Methods
  uploadFiles: (
    files: File[], 
    options?: Omit<FileUploadOptions, 'onProgress' | 'onComplete' | 'onError' | 'onCancel'>
  ) => void;
  cancelUpload: (fileId: string) => void;
  cancelAllUploads: () => void;
  retryUpload: (fileId: string) => void;
  retryAllFailed: () => void;
  clearUploadState: () => void;
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
}

const initialState: FileUploadState = {
  files: new Map(),
  uploadedFiles: [],
  failedFiles: [],
  overallProgress: 0,
  overallStatus: 'idle',
  error: null,
  isUploading: false
};

/**
 * A custom hook to manage file uploads with progress tracking, cancellation, and error handling
 * @param autoUpload Whether to start upload automatically when files are added
 * @param validateFile Optional function to validate files before upload
 * @param maxConcurrentUploads Maximum number of concurrent uploads
 * @returns Object with upload state and control methods
 */
export function useFileUpload(
  autoUpload: boolean = true,
  validateFile?: (file: File) => boolean | Promise<boolean>,
  maxConcurrentUploads: number = 3
): FileUploadHookResult {
  // State to track all uploads
  const [uploadState, setUploadState] = useState<FileUploadState>(initialState);
  
  // Refs to keep track of pending files that haven't started uploading yet
  const pendingFilesRef = useRef<File[]>([]);
  
  // Ref to track active upload count for concurrent upload control
  const activeUploadsRef = useRef<number>(0);
  
  /**
   * Calculate the overall progress across all files
   */
  const calculateOverallProgress = useCallback((files: Map<string, FileUpload>): number => {
    if (!files.size) return 0;
    
    let totalProgress = 0;
    let completeCount = 0;
    
    files.forEach(fileUpload => {
      if (fileUpload.status === 'completed') {
        totalProgress += 100;
        completeCount++;
      } else if (fileUpload.status === 'error' || fileUpload.status === 'cancelled') {
        // Don't include failed or cancelled uploads in the calculation
      } else {
        totalProgress += fileUpload.progress;
      }
    });
    
    // Calculate progress based on active files only
    const activeCount = files.size - completeCount;
    return Math.round(totalProgress / (activeCount > 0 ? files.size : 1));
  }, []);
  
  /**
   * Determine the overall status based on all file statuses
   */
  const determineOverallStatus = useCallback((files: Map<string, FileUpload>): UploadStatus => {
    if (!files.size) return 'idle';
    
    let hasError = false;
    let hasUploading = false;
    let allCompleted = true;
    let allCancelled = true;
    
    files.forEach(fileUpload => {
      if (fileUpload.status === 'error') hasError = true;
      if (fileUpload.status === 'uploading' || fileUpload.status === 'pending') hasUploading = true;
      if (fileUpload.status !== 'completed') allCompleted = false;
      if (fileUpload.status !== 'cancelled') allCancelled = false;
    });
    
    if (hasUploading) return 'uploading';
    if (allCompleted) return 'success';
    if (allCancelled) return 'cancelled';
    if (hasError) return 'error';
    
    return 'idle';
  }, []);
  
  /**
   * Process any pending files if we have slots available for concurrent uploads
   */
  const processPendingFiles = useCallback((options?: Omit<FileUploadOptions, 'onProgress' | 'onComplete' | 'onError' | 'onCancel'>) => {
    const pendingFiles = pendingFilesRef.current;
    
    while (pendingFiles.length > 0 && activeUploadsRef.current < maxConcurrentUploads) {
      const file = pendingFiles.shift();
      if (file) {
        startFileUpload(file, options);
      }
    }
  }, [maxConcurrentUploads]);
  
  /**
   * Start uploading a specific file
   */
  const startFileUpload = useCallback((
    file: File, 
    options?: Omit<FileUploadOptions, 'onProgress' | 'onComplete' | 'onError' | 'onCancel'>
  ) => {
    // Increment active uploads count
    activeUploadsRef.current += 1;
    
    // Create a temporary ID for tracking before the actual upload starts
    const tempId = `temp-${file.name}-${Date.now()}`;
    
    // Add file to tracking state with temporary ID
    setUploadState(prevState => {
      const files = new Map(prevState.files);
      const fileUpload = {
        id: tempId,
        file,
        status: 'pending' as const,
        progress: 0,
        startTime: Date.now()
      };
      files.set(tempId, fileUpload);
      
      return {
        ...prevState,
        files,
        isUploading: true
      };
    });

    // Create options with our callbacks
    const uploadOptions: FileUploadOptions = {
      ...options,
      validateBeforeUpload: validateFile,
      
      // Track progress for this file
      onProgress: (fileId, progress) => {
        setUploadState(prevState => {
          // Update the specific file's progress
          const files = new Map(prevState.files);
          const fileUpload = files.get(tempId);
          
          if (fileUpload) {
            files.set(tempId, { ...fileUpload, progress });
            
            // Calculate overall progress
            const overallProgress = calculateOverallProgress(files);
            
            return {
              ...prevState,
              files,
              overallProgress,
              isUploading: true
            };
          }
          
          return prevState;
        });
      },
      
      // Handle completion
      onComplete: (fileId, fileData) => {
        setUploadState(prevState => {
          // Update the specific file's status
          const files = new Map(prevState.files);
          const fileUpload = files.get(tempId);
          
          if (fileUpload) {
            // Remove the temporary entry and add the final one
            files.delete(tempId);
            files.set(fileId, { 
              ...fileUpload,
              id: fileId,
              status: 'completed',
              progress: 100,
              endTime: Date.now(),
              estimatedTimeRemaining: 0
            });
            
            // Add to uploaded files
            const uploadedFiles = [...prevState.uploadedFiles, fileData];
            
            // Calculate new overall status and progress
            const overallStatus = determineOverallStatus(files);
            const overallProgress = calculateOverallProgress(files);
            
            const result = {
              ...prevState,
              files,
              uploadedFiles,
              overallStatus,
              overallProgress,
              isUploading: overallStatus === 'uploading'
            };
            
            // Decrement active uploads count
            activeUploadsRef.current -= 1;
            
            // Process any pending files
            processPendingFiles(options);
            
            return result;
          }
          
          return prevState;
        });
      },
      
      // Handle errors
      onError: (fileId, error, errorCode) => {
        setUploadState(prevState => {
          // Update the specific file's status
          const files = new Map(prevState.files);
          const fileUpload = files.get(tempId);
          
          if (fileUpload) {
            files.set(tempId, { 
              ...fileUpload,
              status: 'error',
              error,
              errorCode,
              endTime: Date.now()
            });
            
            // Add to failed files
            const failedFiles = [...prevState.failedFiles, { file: fileUpload.file, error }];
            
            // Calculate new overall status and progress
            const overallStatus = determineOverallStatus(files);
            const overallProgress = calculateOverallProgress(files);
            
            const result = {
              ...prevState,
              files,
              failedFiles,
              overallStatus,
              overallProgress,
              error: `Error uploading ${fileUpload.file.name}: ${error}`,
              isUploading: overallStatus === 'uploading'
            };
            
            // Decrement active uploads count
            activeUploadsRef.current -= 1;
            
            // Process any pending files
            processPendingFiles(options);
            
            return result;
          }
          
          return prevState;
        });
      }
    };
    
    // Start the actual upload
    assetService.uploadFile(file, uploadOptions);
  }, [calculateOverallProgress, determineOverallStatus, processPendingFiles, validateFile]);
  
  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback((
    files: File[], 
    options?: Omit<FileUploadOptions, 'onProgress' | 'onComplete' | 'onError' | 'onCancel'>
  ) => {
    if (!files.length) return;
    
    // Reset any existing error
    setUploadState(prevState => ({
      ...prevState,
      error: null
    }));
    
    // Add files to pending queue
    pendingFilesRef.current = [...pendingFilesRef.current, ...files];
    
    // Start processing pending files
    processPendingFiles(options);
  }, [processPendingFiles]);
  
  /**
   * Cancel a specific upload
   */
  const cancelUpload = useCallback((fileId: string) => {
    assetService.cancelUpload(fileId);
    
    setUploadState(prevState => {
      const files = new Map(prevState.files);
      const fileUpload = files.get(fileId);
      
      if (fileUpload) {
        files.set(fileId, {
          ...fileUpload,
          status: 'cancelled',
          endTime: Date.now()
        });
        
        // Calculate new overall status and progress
        const overallStatus = determineOverallStatus(files);
        const overallProgress = calculateOverallProgress(files);
        
        return {
          ...prevState,
          files,
          overallStatus,
          overallProgress,
          isUploading: overallStatus === 'uploading'
        };
      }
      
      return prevState;
    });
  }, [calculateOverallProgress, determineOverallStatus]);
  
  /**
   * Cancel all active uploads
   */
  const cancelAllUploads = useCallback(() => {
    setUploadState(prevState => {
      const files = new Map(prevState.files);
      let updated = false;
      
      files.forEach((fileUpload, fileId) => {
        if (fileUpload.status === 'uploading' || fileUpload.status === 'pending') {
          // Cancel the upload through the service
          assetService.cancelUpload(fileId);
          
          // Update our local state
          files.set(fileId, {
            ...fileUpload,
            status: 'cancelled',
            endTime: Date.now()
          });
          
          updated = true;
        }
      });
      
      if (updated) {
        // Clear pending files
        pendingFilesRef.current = [];
        
        // Reset active uploads count
        activeUploadsRef.current = 0;
        
        // Calculate new overall status and progress
        const overallStatus = 'cancelled';
        const overallProgress = calculateOverallProgress(files);
        
        return {
          ...prevState,
          files,
          overallStatus,
          overallProgress,
          isUploading: false
        };
      }
      
      return prevState;
    });
  }, [calculateOverallProgress]);
  
  /**
   * Retry a failed upload
   */
  const retryUpload = useCallback((fileId: string) => {
    setUploadState(prevState => {
      const files = new Map(prevState.files);
      const fileUpload = files.get(fileId);
      
      if (fileUpload && (fileUpload.status === 'error' || fileUpload.status === 'cancelled')) {
        // Remove from failed files if it's there
        const failedFiles = prevState.failedFiles.filter(
          item => item.file.name !== fileUpload.file.name
        );
        
        // Add to pending queue
        pendingFilesRef.current.push(fileUpload.file);
        
        // Remove from tracking to be re-added when upload starts
        files.delete(fileId);
        
        const result = {
          ...prevState,
          files,
          failedFiles,
          error: null
        };
        
        // Process pending files to start the upload
        processPendingFiles();
        
        return result;
      }
      
      return prevState;
    });
  }, [processPendingFiles]);
  
  /**
   * Retry all failed uploads
   */
  const retryAllFailed = useCallback(() => {
    setUploadState(prevState => {
      const files = new Map(prevState.files);
      const filesToRetry: File[] = [];
      
      // Find all failed or cancelled uploads
      files.forEach((fileUpload, fileId) => {
        if (fileUpload.status === 'error' || fileUpload.status === 'cancelled') {
          filesToRetry.push(fileUpload.file);
          files.delete(fileId);
        }
      });
      
      // If no files to retry, return unchanged state
      if (filesToRetry.length === 0) {
        return prevState;
      }
      
      // Add to pending queue
      pendingFilesRef.current = [...pendingFilesRef.current, ...filesToRetry];
      
      const result = {
        ...prevState,
        files,
        failedFiles: [],
        error: null
      };
      
      // Process pending files to start the uploads
      processPendingFiles();
      
      return result;
    });
  }, [processPendingFiles]);
  
  /**
   * Clear all upload state
   */
  const clearUploadState = useCallback(() => {
    // Cancel any active uploads first
    uploadState.files.forEach((fileUpload, fileId) => {
      if (fileUpload.status === 'uploading' || fileUpload.status === 'pending') {
        assetService.cancelUpload(fileId);
      }
    });
    
    // Clear pending files
    pendingFilesRef.current = [];
    
    // Reset active uploads count
    activeUploadsRef.current = 0;
    
    // Reset state
    setUploadState(initialState);
  }, [uploadState.files]);
  
  /**
   * Add files to the upload queue without starting upload
   */
  const addFiles = useCallback((files: File[]) => {
    // If auto-upload is enabled, this is the same as uploadFiles
    if (autoUpload) {
      uploadFiles(files);
      return;
    }
    
    // Otherwise, just add the files to our state without starting upload
    setUploadState(prevState => {
      const newFiles = new Map(prevState.files);
      
      // Create FileUpload objects for each file
      files.forEach(file => {
        const fileId = `pending-${file.name}-${Date.now()}`;
        newFiles.set(fileId, {
          file,
          id: fileId,
          progress: 0,
          status: 'pending',
          abortController: new AbortController()
        });
      });
      
      return {
        ...prevState,
        files: newFiles
      };
    });
  }, [autoUpload, uploadFiles]);
  
  /**
   * Remove a file from the state
   */
  const removeFile = useCallback((fileId: string) => {
    setUploadState(prevState => {
      const files = new Map(prevState.files);
      const fileUpload = files.get(fileId);
      
      if (!fileUpload) {
        return prevState;
      }
      
      // If file is uploading, cancel it first
      if (fileUpload.status === 'uploading') {
        assetService.cancelUpload(fileId);
      }
      
      // Remove the file from state
      files.delete(fileId);
      
      // Update failed files if needed
      const failedFiles = prevState.failedFiles.filter(
        item => item.file.name !== fileUpload.file.name
      );
      
      // Remove from uploaded files if needed
      const uploadedFiles = prevState.uploadedFiles.filter(
        item => item.filename !== fileUpload.file.name
      );
      
      // Calculate new overall status and progress
      const overallStatus = determineOverallStatus(files);
      const overallProgress = calculateOverallProgress(files);
      
      return {
        ...prevState,
        files,
        failedFiles,
        uploadedFiles,
        overallStatus,
        overallProgress,
        isUploading: overallStatus === 'uploading',
        error: files.size === 0 ? null : prevState.error
      };
    });
  }, [calculateOverallProgress, determineOverallStatus]);
  
  // Start auto-upload when files are added
  useEffect(() => {
    if (autoUpload && pendingFilesRef.current.length > 0) {
      processPendingFiles();
    }
  }, [autoUpload, processPendingFiles]);
  
  // Clean up any resources on unmount
  useEffect(() => {
    return () => {
      // Cancel any active uploads
      uploadState.files.forEach((fileUpload, fileId) => {
        if (fileUpload.status === 'uploading' || fileUpload.status === 'pending') {
          assetService.cancelUpload(fileId);
        }
      });
    };
  }, [uploadState.files]);
  
  return {
    uploadState,
    uploadFiles,
    cancelUpload,
    cancelAllUploads,
    retryUpload,
    retryAllFailed,
    clearUploadState,
    addFiles,
    removeFile
  };
}

export default useFileUpload;