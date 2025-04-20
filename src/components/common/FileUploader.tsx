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
import { FileUpload, FileUploadOptions, FileUploadResponse } from '../../types/asset.types';
import assetService from '../../services/api/asset.service';
import FilePreview from './FilePreview';
import { v4 as uuidv4 } from 'uuid';

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
    // ... existing code ...
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
      <Box {...getRootProps()} sx={{ /* styles */ }}>
        <input {...getInputProps()} />
        <Typography variant="body1">
          {dropzoneIsDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select files'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Accepted file types: {Object.keys(accept).join(', ')}
        </Typography>
      </Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {/* File list and upload progress UI */}
    </Box>
  );
});

FileUploader.displayName = 'FileUploader';

export default FileUploader;