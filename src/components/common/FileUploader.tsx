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
import { useDropzone, FileRejection, DropEvent, Accept } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import { FileUpload, FileUploadOptions, FileUploadResponse, Asset } from '../../types/asset.types';
import { ApiResponse } from '../../types/api.types';
import assetService from '../../services/api/asset.service';
import FilePreview from './FilePreview';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

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
  uploadAll: () => void;
  cancelAll: () => void;
}

interface FileWithPreview extends File {
  preview?: string;
}

interface SingleUploadState {
  id: string;
  file: FileWithPreview;
  status: 'pending' | 'uploading' | 'completed' | 'cancelled' | 'error';
  progress: number;
  response?: any;
  error?: string;
  startTime?: number;
  cancel?: () => void;
}

interface UploadsState {
  uploads: Map<string, SingleUploadState>;
}

interface FileUploaderProps {
  /**
   * Accept specific file types (MIME types)
   * @example 'image/*' for all images
   * @example 'image/jpeg,image/png' for specific image types
   * @example 'audio/*,video/*,image/*' for multiple categories
   */
  accept: Accept;

  options?: any;

  /**
   * Maximum file size in bytes
   * @default 10485760 (10MB)
   */
  maxSize: number;

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
  onUploadError?: (file: File, error: Error) => void;

  /**
   * Called when upload progress updates
   */
  onUploadProgress?: (fileId: string, progress: number) => void;

  /**
   * Called when a file upload completes
   */
  onUploadComplete?: (uploadId: string, response: any) => void;

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

const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>((props, ref) => {
  const {
    accept,
    maxSize,
    maxFiles = 5,
    options,
    onUploadComplete,
    onUploadError,
    onAllUploadsComplete,
    initialFiles,
    disabled = false,
    uploadImmediately = false,
  } = props;

  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadsState>({
    uploads: new Map(),
  });

  const onDropCallback = (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => {
    // Handle file rejections
    if (fileRejections.length > 0) {
      const errors = fileRejections.map(rejection => {
        const error = rejection.errors[0];
        return `${rejection.file.name}: ${error.message}`;
      });
      setError(errors.join('\n'));
      return;
    }

    // Clear any existing errors
    setError(null);

    // Create upload states for each file
    const newUploads = new Map(uploadState.uploads);
    acceptedFiles.forEach(file => {
      const id = uuidv4();
      const upload: SingleUploadState = {
        id,
        file,
        status: 'pending',
        progress: 0,
        startTime: Date.now()
      };
      newUploads.set(id, upload);

      // Start upload if uploadImmediately is true
      if (uploadImmediately) {
        upload.status = 'uploading';
        
        // Use AssetService for upload
        assetService.uploadFile(file, {
          onProgress: (progress: number) => {
            newUploads.set(id, {
              ...upload,
              progress
            });
            setUploadState({ uploads: new Map(newUploads) });

            if (props.onUploadProgress) {
              props.onUploadProgress(id, progress);
            }
          },
          onComplete: (asset: Asset) => {
            newUploads.set(id, {
              ...upload,
              status: 'completed',
              progress: 100,
              response: asset
            });
            setUploadState({ uploads: new Map(newUploads) });

            if (props.onUploadComplete) {
              props.onUploadComplete(id, asset);
            }
          },
          onError: (error: string) => {
            newUploads.set(id, {
              ...upload,
              status: 'error',
              error: error
            });
            handleUploadError(file, error);
            setUploadState({ uploads: new Map(newUploads) });
          }
        });
      }
    });

    setUploadState({ uploads: newUploads });

    // Notify parent component
    if (props.onFilesAdded) {
      props.onFilesAdded(acceptedFiles);
    }
  };

  const { getRootProps, getInputProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    accept,
    maxSize,
    onDrop: onDropCallback as <T extends File>(
      acceptedFiles: T[],
      fileRejections: FileRejection[],
      event: DropEvent
    ) => void,
    disabled,
    multiple: true,
    maxFiles,
  });

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      onDropCallback(initialFiles, [], { type: 'drop' } as DropEvent);
    }
    return () => {
      uploadState.uploads.forEach(upload => {
        if ('preview' in upload.file && upload.file.preview) {
          URL.revokeObjectURL(upload.file.preview);
        }
      });
    };
  }, [initialFiles]);

  const handleUploadError = (file: File, error: Error | string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    if (onUploadError) {
      onUploadError(file, new Error(errorMessage));
    }
    setError(errorMessage);
  };

  const handleUploadComplete = (uploadId: string, response: any) => {
    if (onUploadComplete) {
      onUploadComplete(uploadId, response);
    }
  };

  return (
    <Box>
      <UploadBox {...getRootProps()}>
        <input {...getInputProps()} />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {props.uploadLabel || (dropzoneIsDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select files')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Accepted file types: {Object.keys(accept).join(', ')}
          </Typography>
        </Box>
      </UploadBox>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* File list and upload progress UI */}
      {Array.from(uploadState.uploads.values()).map((upload) => (
        <Paper key={upload.id} sx={{ mt: 2, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachFileIcon sx={{ mr: 1 }} />
                <Typography variant="body2" noWrap>
                  {upload.file.name}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <StyledLinearProgress
                    variant="determinate"
                    value={upload.progress}
                    color={
                      upload.status === 'completed' ? 'success' :
                      upload.status === 'error' ? 'error' :
                      upload.status === 'cancelled' ? 'warning' : 'primary'
                    }
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="textSecondary">
                    {upload.progress}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {upload.status === 'uploading' && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (upload.cancel) {
                        upload.cancel();
                      }
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
                )}
                {upload.status === 'completed' && (
                  <CheckCircleIcon color="success" />
                )}
                {upload.status === 'error' && (
                  <ErrorIcon color="error" />
                )}
                {upload.status === 'cancelled' && (
                  <CloseIcon color="warning" />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
});

FileUploader.displayName = 'FileUploader';

export default FileUploader;