import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  IconButton,
  LinearProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  InsertDriveFile as FileIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  TextSnippet as TextIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { FileUpload as FileUploadType, FileUploadResponse } from '../../types/asset.types';
import assetService from '../../services/api/asset.service';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  layerCode?: string;
  initialFiles?: File[];
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadComplete?: (fileId: string, fileData: FileUploadResponse) => void;
  onUploadError?: (fileId: string, error: string) => void;
}

// File type icons mapping
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon />;
  if (fileType.startsWith('audio/')) return <AudioIcon />;
  if (fileType.startsWith('video/')) return <VideoIcon />;
  if (fileType.startsWith('text/')) return <TextIcon />;
  if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('xml')) return <CodeIcon />;
  return <FileIcon />;
};

// Get layer-specific accepted file types
const getAcceptedFileTypesByLayer = (layerCode?: string): string[] => {
  switch (layerCode) {
    case 'G': // Songs
      return ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'];
    case 'S': // Stars
      return ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    case 'L': // Looks
      return ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    case 'M': // Moves
      return ['video/mp4', 'video/webm', 'video/quicktime', 'application/json'];
    case 'W': // Worlds
      return ['application/json', 'model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
    case 'V': // Videos
      return ['video/mp4', 'video/webm', 'video/quicktime'];
    default:
      return [
        'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'video/mp4', 'video/webm',
        'application/json', 'text/plain',
        'model/gltf-binary', 'model/gltf+json',
        'application/octet-stream'
      ];
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  acceptedFileTypes,
  maxFiles = 5,
  maxSize = 104857600, // 100MB default
  layerCode,
  initialFiles = [],
  onUploadProgress,
  onUploadComplete,
  onUploadError
}) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, FileUploadType>>({});
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Use layer-specific file types if none provided
  const fileTypes = acceptedFileTypes || getAcceptedFileTypesByLayer(layerCode);

  // Calculate overall upload progress
  const calculateOverallProgress = () => {
    const uploads = Object.values(uploadStatus);
    if (uploads.length === 0) return 0;
    
    const totalProgress = uploads.reduce((sum, upload) => sum + upload.progress, 0);
    return Math.round(totalProgress / uploads.length);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if adding these files would exceed the max
      if (files.length + acceptedFiles.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files`);
        setLoading(false);
        return;
      }
      
      // Add new files
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      
      // Notify parent component
      onFilesChange(newFiles);
      
      // Create preview URL for the first file if none exists
      if (!preview && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPreviewType(file.type);
        const fileUrl = URL.createObjectURL(file);
        setPreview(fileUrl);
      }

      // Start upload process for each file
      acceptedFiles.forEach(file => {
        uploadFile(file);
      });
    } catch (err) {
      setError('An error occurred while processing the files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [files, loading, maxFiles, onFilesChange, preview]);

  // Upload a file with progress tracking
  const uploadFile = (file: File) => {
    const upload = assetService.uploadFile(file, {
      onProgress: (fileId, progress) => {
        setUploadStatus(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], progress }
        }));
        if (onUploadProgress) {
          onUploadProgress(fileId, progress);
        }
      },
      onComplete: (fileId, fileData) => {
        setUploadStatus(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], progress: 100, status: 'completed' }
        }));
        if (onUploadComplete) {
          onUploadComplete(fileId, fileData);
        }
      },
      onError: (fileId, errorMsg) => {
        setUploadStatus(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], status: 'error', error: errorMsg }
        }));
        setError(errorMsg);
        if (onUploadError) {
          onUploadError(fileId, errorMsg);
        }
      }
    });
    
    setUploadStatus(prev => ({
      ...prev,
      [upload.id]: upload
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    disabled: loading || files.length >= maxFiles
  });

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    const removedFile = newFiles[index];
    
    // If removing the file being previewed, clear the preview
    if (preview && index === 0) {
      URL.revokeObjectURL(preview);
      setPreview(null);
      setPreviewType('');
      
      // Set preview to the next file if available
      if (newFiles.length > 1) {
        const nextFile = newFiles[1];
        setPreviewType(nextFile.type);
        const fileUrl = URL.createObjectURL(nextFile);
        setPreview(fileUrl);
      }
    }
    
    // Cancel any ongoing upload for this file
    Object.entries(uploadStatus).forEach(([id, upload]) => {
      if (upload.file === removedFile) {
        if (upload.status === 'uploading') {
          assetService.cancelUpload(id);
        }
        // Remove from upload status
        setUploadStatus(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    });
    
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    // Notify parent component
    onFilesChange(newFiles);
  };
  
  // Cancel file upload
  const cancelUpload = (fileId: string) => {
    assetService.cancelUpload(fileId);
  };

  const handlePreviewFile = (file: File, index: number) => {
    // Clear previous preview if any
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    
    setPreviewType(file.type);
    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);
  };
  
  // Open file preview dialog
  const openPreview = (file: File) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  // Render file preview dialog
  const renderPreviewDialog = () => {
    if (!previewFile) return null;
    
    const fileType = previewFile.type.split('/')[0];
    const fileUrl = URL.createObjectURL(previewFile);
    
    return (
      <Dialog
        open={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          URL.revokeObjectURL(fileUrl);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{previewFile.name}</DialogTitle>
        <DialogContent>
          {fileType === 'image' && (
            <img 
              src={fileUrl} 
              alt={previewFile.name} 
              style={{ maxWidth: '100%', maxHeight: '500px', display: 'block', margin: '0 auto' }} 
            />
          )}
          {fileType === 'video' && (
            <video 
              src={fileUrl} 
              controls 
              style={{ maxWidth: '100%', maxHeight: '500px', display: 'block', margin: '0 auto' }} 
            />
          )}
          {fileType === 'audio' && (
            <audio 
              src={fileUrl} 
              controls 
              style={{ width: '100%', margin: '20px 0' }} 
            />
          )}
          {(fileType !== 'image' && fileType !== 'video' && fileType !== 'audio') && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FileIcon sx={{ fontSize: 80, color: 'action.active', mb: 2 }} />
              <Typography variant="body2">
                Preview not available for this file type ({previewFile.type || 'unknown'})
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsPreviewOpen(false);
            URL.revokeObjectURL(fileUrl);
          }}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Get status icon based on upload status
  const getFileStatusIcon = (file: File, index: number) => {
    const fileUpload = Object.values(uploadStatus).find(upload => upload.file === file);
    
    if (!fileUpload) return null;
    
    switch (fileUpload.status) {
      case 'pending':
        return <CircularProgress size={16} />;
      case 'uploading':
        return (
          <IconButton edge="end" size="small" onClick={() => cancelUpload(fileUpload.id)}>
            <CancelIcon />
          </IconButton>
        );
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  // Render file preview
  const renderPreview = () => {
    if (!preview) return null;
    
    if (previewType.startsWith('image/')) {
      return (
        <CardMedia
          component="img"
          height="200"
          image={preview}
          alt="File preview"
          sx={{ objectFit: 'contain' }}
        />
      );
    }
    
    if (previewType.startsWith('video/')) {
      return (
        <Box p={2}>
          <video width="100%" height="auto" controls>
            <source src={preview} type={previewType} />
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    }
    
    if (previewType.startsWith('audio/')) {
      return (
        <Box p={2} display="flex" flexDirection="column" alignItems="center">
          <AudioIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <audio controls>
            <source src={preview} type={previewType} />
            Your browser does not support the audio tag.
          </audio>
        </Box>
      );
    }
    
    // Default for other file types
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center">
        {getFileIcon(previewType)}
        <Typography variant="body2" color="text.secondary" ml={1}>
          Preview not available for this file type
        </Typography>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Upload Files
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload one or more files for your asset. {maxFiles > 1 ? `You can upload up to ${maxFiles} files.` : ''}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Overall progress */}
      {Object.keys(uploadStatus).length > 0 && (
        <Box sx={{ mt: 1, mb: 3, position: 'relative' }}>
          <Typography variant="body2" gutterBottom>Overall Upload Progress</Typography>
          <LinearProgress 
            variant="determinate" 
            value={calculateOverallProgress()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              right: 8, 
              bottom: 0,
              fontWeight: 'bold'
            }}
          >
            {calculateOverallProgress()}%
          </Typography>
        </Box>
      )}

      <div style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          {/* Dropzone */}
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.400',
              borderRadius: 1,
              p: 3,
              mb: 2,
              cursor: 'pointer',
              height: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              },
              opacity: (loading || files.length >= maxFiles) ? 0.5 : 1
            }}
          >
            <input {...getInputProps()} />
            {loading ? (
              <CircularProgress size={40} />
            ) : (
              <>
                <UploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                {isDragActive ? (
                  <Typography align="center">Drop the files here...</Typography>
                ) : (
                  <Typography align="center">
                    {files.length >= maxFiles 
                      ? `Maximum number of files (${maxFiles}) reached` 
                      : `Drag & drop files here, or click to select files`}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  Accepted file types: {fileTypes.join(', ')}
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center">
                  Max size: {formatFileSize(maxSize)}
                </Typography>
              </>
            )}
          </Box>

          {/* File List */}
          {files.length > 0 && (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {files.map((file, index) => {
                const fileUpload = Object.values(uploadStatus).find(upload => upload.file === file);
                const isUploading = fileUpload?.status === 'uploading';
                const progress = fileUpload?.progress || 0;
                const hasError = fileUpload?.status === 'error';
                const isComplete = fileUpload?.status === 'completed';
                
                return (
                  <ListItem
                    key={`${file.name}-${index}`}
                    onClick={() => handlePreviewFile(file, index)}
                    sx={{ 
                      cursor: 'pointer',
                      backgroundColor: preview && files.indexOf(file) === 0 ? 'action.selected' : 'inherit',
                      ...(hasError && { backgroundColor: 'error.light' }),
                      ...(isComplete && { opacity: 0.8 }),
                      position: 'relative',
                    }}
                  >
                    <ListItemIcon>
                      {getFileIcon(file.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            noWrap 
                            sx={{ maxWidth: '150px' }}
                          >
                            {file.name}
                          </Typography>
                          {getFileStatusIcon(file, index)}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {formatFileSize(file.size)} • {file.type.split('/')[1]}
                          </Typography>
                          {isUploading && (
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ mt: 1, height: 4, borderRadius: 2 }} 
                            />
                          )}
                          {hasError && (
                            <Typography color="error" variant="caption" display="block">
                              {fileUpload.error}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {file.type.startsWith('image/') && (
                        <IconButton 
                          edge="end" 
                          aria-label="preview"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(file);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <ViewIcon />
                        </IconButton>
                      )}
                      {isUploading ? (
                        <IconButton 
                          edge="end" 
                          aria-label="cancel" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (fileUpload) cancelUpload(fileUpload.id);
                          }}
                          color="warning"
                        >
                          <CancelIcon />
                        </IconButton>
                      ) : (
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {/* Preview Card */}
          <Card sx={{ mb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {files.length > 0 ? (
                preview ? (
                  renderPreview()
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <FileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Select a file to preview
                    </Typography>
                  </Box>
                )
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                  <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No files uploaded yet
                  </Typography>
                </Box>
              )}
            </CardContent>
            {files.length > 0 && (
              <CardActions>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    // Clear all files
                    if (preview) {
                      URL.revokeObjectURL(preview);
                      setPreview(null);
                      setPreviewType('');
                    }
                    // Cancel any ongoing uploads
                    Object.entries(uploadStatus).forEach(([id, upload]) => {
                      if (upload.status === 'uploading') {
                        cancelUpload(id);
                      }
                    });
                    setUploadStatus({});
                    setFiles([]);
                    onFilesChange([]);
                  }}
                >
                  Remove All
                </Button>
              </CardActions>
            )}
          </Card>
        </div>
      </div>
      
      {/* Preview Dialog */}
      {renderPreviewDialog()}
    </Paper>
  );
};

export default FileUpload;