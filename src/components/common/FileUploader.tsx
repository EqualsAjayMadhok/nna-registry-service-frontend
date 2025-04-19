import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  IconButton,
  Grid,
  useTheme,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import { FileUpload, FileUploadOptions, FileUploadResponse } from '../../types/asset.types';
import assetService from '../../services/api/asset.service';
import FilePreview from './FilePreview';

const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  borderStyle: 'dashed',
  borderWidth: 2,
  borderColor: theme.palette.divider,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  transition: 'border-color 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
  },
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    transition: 'transform 0.1s linear',
  },
}));

// Define interface for imperative handle
export interface FileUploaderHandle {
  clearAll: () => void;
}

interface FileUploaderProps {
  /**
   * Accept specific file types (MIME types)
   * @example 'image/*' for all images
   * @example 'image/jpeg,image/png' for specific image types
   * @example 'audio/*,video/*,image/*' for multiple categories
   */
  accept?: string;

  options?: any;

  /**
   * Maximum file size in bytes
   * @default 10485760 (10MB)
   */
  maxSize?: number;

  /**
   * Maximum number of files allowed
   * @default 5
   */
  maxFiles?: number;

  /**
   * Files that are already uploaded
   */
  initialFiles?: File[];

  /**
   * Called when files are successfully uploaded
   */
  onFilesUploaded?: (files: FileUploadResponse[]) => void;

  /**
   * Called when files are added to the uploader
   */
  onFilesAdded?: (files: File[]) => void;

  /**
   * Called when files are removed from the uploader
   */
  onFileRemoved?: (file: File) => void;

  /**
   * Called when all uploads are complete
   */
  onAllUploadsComplete?: (responses: FileUploadResponse[]) => void;

  /**
   * Called when there's an upload error
   */
  onUploadError?: (file: File, error: string) => void;

  /**
   * Called when upload progress updates
   */
  onUploadProgress?: (fileId: string, progress: number) => void;

  /**
   * Called when a file upload completes
   */
  onUploadComplete?: (fileId: string, fileData: FileUploadResponse) => void;

  /**
   * Custom validation function for files
   */
  validateFile?: (file: File) => boolean | string;

  /**
   * Should files be uploaded immediately after drop/selection
   * @default true
   */
  uploadImmediately?: boolean;

  /**
   * Show previews for image files
   * @default true
   */
  showPreviews?: boolean;

  /**
   * ID to identify this uploader (useful when there are multiple uploaders on the same page)
   */
  uploaderId?: string;

  /**
   * Custom label for the upload area
   */
  uploadLabel?: string;

  /**
   * Disable the uploader
   */
  disabled?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadState {
  uploads: Map<
    string,
    {
      file: FileWithPreview;
      id: string;
      status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
      progress: number;
      response?: FileUploadResponse;
      error?: string;
      uploadId?: string;
    }
  >;
  responses: FileUploadResponse[];
}

const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(({
  accept = 'image/*,audio/*,video/*,application/pdf',
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  options,
  initialFiles = [],
  onFilesUploaded,
  onFilesAdded,
  onFileRemoved,
  onAllUploadsComplete,
  onUploadError,
  validateFile,
  uploadImmediately = true,
  showPreviews = true,
  uploaderId = 'default-uploader',
  uploadLabel = 'Drag and drop files, or click to select files',
  disabled = false,
}, ref) => {
  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    clearAll,
  }));
  
  const theme = useTheme();
  const [uploadState, setUploadState] = useState<UploadState>({
    uploads: new Map(),
    responses: [],
  });

  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert FileList to FileWithPreview array with unique IDs
  const prepareFiles = (fileList: File[]): { file: FileWithPreview; id: string }[] => {
    return fileList.map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return { file: fileWithPreview, id: `${uploaderId}-${file.name}-${Date.now()}` };
    });
  };

  // Validate files before adding them
  const validateFiles = (
    files: File[]
  ): { valid: File[]; invalid: { file: File; reason: string }[] } => {
    const valid: File[] = [];
    const invalid: { file: File; reason: string }[] = [];

    files.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        invalid.push({
          file,
          reason: `File size exceeds maximum size (${(maxSize / (1024 * 1024)).toFixed(1)}MB)`,
        });
        return;
      }

      // Check file type if accept is provided
      if (accept) {
        const acceptedTypes = accept.split(',');
        let isAccepted = false;

        for (const type of acceptedTypes) {
          if (type.includes('*')) {
            // Handle wildcards like 'image/*'
            const category = type.split('/')[0];
            if (file.type.startsWith(`${category}/`)) {
              isAccepted = true;
              break;
            }
          } else if (file.type === type) {
            isAccepted = true;
            break;
          }
        }

        if (!isAccepted) {
          invalid.push({
            file,
            reason: `File type '${file.type}' is not allowed`,
          });
          return;
        }
      }

      // Run custom validation if provided
      if (validateFile) {
        const result = validateFile(file);
        if (result !== true) {
          invalid.push({
            file,
            reason: typeof result === 'string' ? result : 'Failed custom validation',
          });
          return;
        }
      }

      // File is valid
      valid.push(file);
    });

    return { valid, invalid };
  };

  // Handle file drop and selection
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      // Check if there are too many files already
      const currentFiles = Array.from(uploadState.uploads.values()).filter(
        upload => upload.status !== 'error' && upload.status !== 'cancelled'
      );

      if (currentFiles.length + acceptedFiles.length > maxFiles) {
        setError(`You can upload a maximum of ${maxFiles} files`);
        return;
      }

      // Validate files
      const { valid, invalid } = validateFiles(acceptedFiles);

      if (invalid.length > 0) {
        setError(
          `${invalid.length} file(s) were rejected: ${invalid.map(i => i.reason).join(', ')}`
        );
      }

      if (valid.length === 0) {
        return;
      }

      // Add valid files to the state
      const preparedFiles = prepareFiles(valid);

      setUploadState(prevState => {
        const newUploads = new Map(prevState.uploads);

        // Add new files
        preparedFiles.forEach(({ file, id }) => {
          newUploads.set(id, {
            file,
            id,
            status: 'pending',
            progress: 0,
          });
        });

        return {
          ...prevState,
          uploads: newUploads,
        };
      });

      // Call the onFilesAdded callback if provided
      if (onFilesAdded) {
        onFilesAdded(valid);
      }

      // Upload immediately if configured
      // if (uploadImmediately) {
      //   preparedFiles.forEach(({ file, id }) => {
      //     uploadFile(file, id);
      //   });
      // }
    },
    [uploadState, maxFiles, uploadImmediately]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneIsDragActive,
  } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    disabled,
    noClick: false,
    noKeyboard: false
  });

  // Effect to update isDragActive state
  useEffect(() => {
    setIsDragActive(dropzoneIsDragActive);
  }, [dropzoneIsDragActive]);

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      // Revoke the object URLs to avoid memory leaks
      Array.from(uploadState.uploads.values()).forEach(upload => {
        if (upload.file.preview) {
          URL.revokeObjectURL(upload.file.preview);
        }
      });
    };
  }, []);

  // Initialize with initial files if provided
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      onDrop(initialFiles);
    }
  }, []);

  // Upload a file
  const uploadFile = (file: File, id: string) => {
    // Update status to uploading
    setUploadState(prevState => {
      const newUploads = new Map(prevState.uploads);
      const upload = newUploads.get(id);

      if (upload) {
        newUploads.set(id, {
          ...upload,
          status: 'uploading',
          progress: 0,
        });
      }

      return {
        ...prevState,
        uploads: newUploads,
      };
    });

    // Setup upload options
    const _options: FileUploadOptions = {
      onProgress: (fileId, progress) => {
        setUploadState(prevState => {
          const newUploads = new Map(prevState.uploads);
          const upload = newUploads.get(id);

          if (upload) {
            newUploads.set(id, {
              ...upload,
              progress,
              uploadId: fileId,
            });
          }

          return {
            ...prevState,
            uploads: newUploads,
          };
        });
      },
      onComplete: (fileId, fileData) => {
        setUploadState(prevState => {
          const newUploads = new Map(prevState.uploads);
          const upload = newUploads.get(id);

          if (upload) {
            newUploads.set(id, {
              ...upload,
              status: 'completed',
              progress: 100,
              response: fileData,
              uploadId: fileId,
            });
          }

          const newResponses = [...prevState.responses, fileData];

          // Check if all uploads are complete
          const allComplete = Array.from(newUploads.values()).every(
            u => u.status === 'completed' || u.status === 'error' || u.status === 'cancelled'
          );

          if (allComplete && onAllUploadsComplete) {
            onAllUploadsComplete(newResponses);
          }

          return {
            uploads: newUploads,
            responses: newResponses,
          };
        });

        // Call onFilesUploaded callback if provided
        if (onFilesUploaded) {
          onFilesUploaded([fileData]);
        }
      },
      onError: (fileId, error) => {
        setUploadState(prevState => {
          const newUploads = new Map(prevState.uploads);
          const upload = newUploads.get(id);

          if (upload) {
            newUploads.set(id, {
              ...upload,
              status: 'error',
              error,
              uploadId: fileId,
            });
          }

          return {
            ...prevState,
            uploads: newUploads,
          };
        });

        // Call onUploadError callback if provided
        if (onUploadError) {
          onUploadError(file, error);
        }
      },
      validateBeforeUpload: validateFile
        ? file => {
            const result = validateFile(file);
            return result === true;
          }
        : undefined,
      ...options,
    };

    // Start the upload
    const fileUpload = assetService.uploadFile(file, _options);

    // Update the uploadId in state for cancellation
    setUploadState(prevState => {
      const newUploads = new Map(prevState.uploads);
      const upload = newUploads.get(id);

      if (upload) {
        newUploads.set(id, {
          ...upload,
          uploadId: fileUpload.id,
        });
      }

      return {
        ...prevState,
        uploads: newUploads,
      };
    });
  };

  // Cancel an upload
  const cancelUpload = (id: string) => {
    const upload = uploadState.uploads.get(id);

    if (upload && upload.uploadId) {
      assetService.cancelUpload(upload.uploadId);

      setUploadState(prevState => {
        const newUploads = new Map(prevState.uploads);
        const upload = newUploads.get(id);

        if (upload) {
          newUploads.set(id, {
            ...upload,
            status: 'cancelled',
          });
        }

        return {
          ...prevState,
          uploads: newUploads,
        };
      });
    }
  };

  // Remove a file from the uploader
  const removeFile = (id: string) => {
    const upload = uploadState.uploads.get(id);

    if (upload) {
      // Cancel the upload if it's in progress
      if (upload.status === 'uploading' && upload.uploadId) {
        assetService.cancelUpload(upload.uploadId);
      }

      // Clean up preview URL
      if (upload.file.preview) {
        URL.revokeObjectURL(upload.file.preview);
      }

      // Call onFileRemoved callback if provided
      if (onFileRemoved) {
        onFileRemoved(upload.file);
      }

      // Remove the file from state
      setUploadState(prevState => {
        const newUploads = new Map(prevState.uploads);
        newUploads.delete(id);

        return {
          ...prevState,
          uploads: newUploads,
        };
      });
    }
  };

  // Upload all pending files
  const uploadAllPending = () => {
    Array.from(uploadState.uploads.entries()).forEach(([id, upload]) => {
      if (upload.status === 'pending') {
        uploadFile(upload.file, id);
      }
    });
  };

  // Cancel all in-progress uploads
  const cancelAllUploads = () => {
    Array.from(uploadState.uploads.entries()).forEach(([id, upload]) => {
      if (upload.status === 'uploading') {
        cancelUpload(id);
      }
    });
  };
  
  // Clear all files completely
  const clearAll = () => {
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear the upload state
    setUploadState({
      uploads: new Map(),
      responses: []
    });
    
    // Notify parent component
    if (onFilesAdded) {
      onFilesAdded([]);
    }
  };

  // Clear all error files
  const clearErrors = () => {
    setUploadState(prevState => {
      const newUploads = new Map(prevState.uploads);

      Array.from(newUploads.entries()).forEach(([id, upload]) => {
        if (upload.status === 'error') {
          newUploads.delete(id);
        }
      });

      return {
        ...prevState,
        uploads: newUploads,
      };
    });

    setError(null);
  };

  // Get counts of uploads by status
  const getUploadCounts = () => {
    const counts = {
      total: uploadState.uploads.size,
      pending: 0,
      uploading: 0,
      completed: 0,
      error: 0,
      cancelled: 0,
    };

    Array.from(uploadState.uploads.values()).forEach(upload => {
      counts[upload.status]++;
    });

    return counts;
  };

  const uploadCounts = getUploadCounts();
  const hasUploads = uploadCounts.total > 0;

  // Render the file uploader
  return (
    <Box>
      {/* Drop zone area */}
      <UploadBox
        {...getRootProps()}
        sx={{
          borderColor: isDragActive
            ? theme.palette.primary.main
            : error
            ? theme.palette.error.main
            : theme.palette.divider,
          backgroundColor: isDragActive
            ? theme.palette.mode === 'dark'
              ? 'rgba(25, 118, 210, 0.08)'
              : 'rgba(25, 118, 210, 0.04)'
            : undefined,
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {uploadLabel}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {`Maximum file size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {`Accepted file types: ${accept}`}
        </Typography>
      </UploadBox>

      {/* Error message */}
      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Upload statistics */}
      {hasUploads && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Grid container spacing={1}>
            {/* Calculate overall progress */}
            {(uploadCounts.uploading > 0 || uploadCounts.pending > 0) && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 2 }}>
                    <StyledLinearProgress
                      variant="determinate"
                      value={Array.from(uploadState.uploads.values())
                        .filter(u => u.status === 'uploading' || u.status === 'pending')
                        .reduce((acc, u) => acc + (u.progress || 0), 0) / 
                        Math.max(1, (uploadCounts.uploading + uploadCounts.pending))}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {uploadCounts.uploading > 0 
                      ? `Uploading ${uploadCounts.uploading} files...` 
                      : uploadCounts.pending > 0 
                        ? `${uploadCounts.pending} files ready to upload` 
                        : ''}
                  </Typography>
                </Box>
              </Grid>
            )}
            {uploadCounts.completed > 0 && (
              <Grid item>
                <Chip
                  label={`Completed: ${uploadCounts.completed}`}
                  color="success"
                  size="small"
                  icon={<CheckCircleIcon />}
                />
              </Grid>
            )}
            {uploadCounts.error > 0 && (
              <Grid item>
                <Chip
                  label={`Failed: ${uploadCounts.error}`}
                  color="error"
                  size="small"
                  icon={<ErrorIcon />}
                  onDelete={clearErrors}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Controls */}
      {(uploadCounts.pending > 0 || uploadCounts.uploading > 0) && (
        <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1 }}>
          {uploadCounts.pending > 0 && !uploadImmediately && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={uploadAllPending}
              startIcon={<CloudUploadIcon />}
            >
              Upload All Pending
            </Button>
          )}
          {uploadCounts.uploading > 0 && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={cancelAllUploads}
              startIcon={<CancelIcon />}
            >
              Cancel All Uploads
            </Button>
          )}
        </Box>
      )}

      {/* File previews and upload progress */}
      {hasUploads && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {Array.from(uploadState.uploads.entries()).map(([id, upload]) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    position: 'relative',
                    borderColor:
                      upload.status === 'error'
                        ? theme.palette.error.main
                        : upload.status === 'completed'
                        ? theme.palette.success.main
                        : undefined,
                    borderWidth: upload.status === 'error' || upload.status === 'completed' ? 1 : 0,
                    borderStyle: 'solid',
                  }}
                >
                  {/* Actions */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                    {upload.status === 'uploading' ? (
                      <IconButton
                        size="small"
                        onClick={() => cancelUpload(id)}
                        color="secondary"
                        aria-label="cancel upload"
                      >
                        <CancelIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => removeFile(id)}
                        color="default"
                        aria-label="remove file"
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Box>

                  {/* File preview */}
                  {showPreviews && (
                    <Box
                      sx={{
                        mb: 2,
                        height: 140,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <FilePreview file={upload.file} />
                    </Box>
                  )}

                  {/* File info */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" noWrap title={upload.file.name}>
                      {upload.file.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {`${(upload.file.size / 1024).toFixed(1)} KB • ${
                        upload.file.type || 'Unknown type'
                      }`}
                    </Typography>
                  </Box>

                  {/* Progress indicator */}
                  {upload.status === 'uploading' && (
                    <Box sx={{ mt: 1 }}>
                      <StyledLinearProgress
                        variant="determinate"
                        value={upload.progress}
                        color="primary"
                      />
                      <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                        {`${Math.round(upload.progress)}%`}
                      </Typography>
                    </Box>
                  )}

                  {/* Status indicators */}
                  {upload.status === 'completed' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="success.main">
                        Upload complete
                      </Typography>
                    </Box>
                  )}

                  {upload.status === 'error' && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="error">
                        {upload.error || 'Upload failed'}
                      </Typography>
                    </Box>
                  )}

                  {upload.status === 'cancelled' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CancelIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        Upload cancelled
                      </Typography>
                    </Box>
                  )}

                  {upload.status === 'pending' && !uploadImmediately && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => uploadFile(upload.file, id)}
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                      >
                        Upload
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
});

export default FileUploader;