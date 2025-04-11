import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  IconButton,
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
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  TextSnippet as TextIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  layerCode?: string;
  initialFiles?: File[];
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
  initialFiles = []
}) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use layer-specific file types if none provided
  const fileTypes = acceptedFileTypes || getAcceptedFileTypesByLayer(layerCode);

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
    } catch (err) {
      setError('An error occurred while processing the files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [files, loading, maxFiles, onFilesChange, preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    disabled: loading || files.length >= maxFiles
  });

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    
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
    
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    // Notify parent component
    onFilesChange(newFiles);
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
              {files.map((file, index) => (
                <ListItem
                  key={`${file.name}-${index}`}
                  onClick={() => handlePreviewFile(file, index)}
                  sx={{ 
                    cursor: 'pointer',
                    backgroundColor: preview && files.indexOf(file) === 0 ? 'action.selected' : 'inherit'
                  }}
                >
                  <ListItemIcon>
                    {getFileIcon(file.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${formatFileSize(file.size)} • ${file.type}`}
                    primaryTypographyProps={{ 
                      noWrap: true,
                      style: { maxWidth: '200px' }
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
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
    </Paper>
  );
};

export default FileUpload;