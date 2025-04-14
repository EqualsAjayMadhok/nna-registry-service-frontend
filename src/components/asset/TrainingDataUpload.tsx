import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  LinearProgress,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Tooltip,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  TextSnippet as TextIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  InsertLink as LinkIcon,
  Audiotrack as AudioIcon,
  Description as FileIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import useFileUpload from '../../hooks/useFileUpload';
import { formatFileSize } from '../asset/MediaPlayer';
import MediaPlayer from '../asset/MediaPlayer';

// Define interfaces
export interface TrainingDataFile {
  id: string;
  file: File;
  type: 'prompt' | 'image' | 'video' | 'audio' | 'other';
  previewUrl?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
}

export interface TrainingDataVideo {
  id: string;
  url: string;
  title: string;
  type: 'youtube' | 'vimeo' | 'other';
  thumbnailUrl?: string;
}

export interface TrainingPrompt {
  id: string;
  text: string;
  category?: string; // Optional categorization
}

export interface TrainingData {
  prompts: TrainingPrompt[];
  images: TrainingDataFile[];
  videos: TrainingDataVideo[];
  otherFiles: TrainingDataFile[];
}

interface TrainingDataUploadProps {
  onChange: (data: TrainingData) => void;
  initialData?: TrainingData;
  isTrainable: boolean;
}

// Helper to generate a simple ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Helper to determine file type
const getFileType = (file: File): 'prompt' | 'image' | 'video' | 'audio' | 'other' => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else if (file.type.startsWith('audio/')) {
    return 'audio';
  } else if (file.type.startsWith('text/')) {
    return 'prompt';
  } else {
    return 'other';
  }
};

// Helper to extract video ID from YouTube or Vimeo URLs
const extractVideoInfo = (url: string): { type: 'youtube' | 'vimeo' | 'other', id: string, thumbnailUrl?: string } => {
  // YouTube regex patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      id: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };
  }
  
  // Vimeo regex patterns
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?))/i;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      id: vimeoMatch[1],
      // Vimeo requires API access for thumbnails, so we don't set it here
    };
  }
  
  // Other video URL
  return {
    type: 'other',
    id: generateId()
  };
};

/**
 * TabPanel Component for the tabbed interface
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`training-tabpanel-${index}`}
      aria-labelledby={`training-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * Main TrainingDataUpload Component
 */
const TrainingDataUpload: React.FC<TrainingDataUploadProps> = ({
  onChange,
  initialData,
  isTrainable
}) => {
  const theme = useTheme();
  
  // Default empty training data
  const defaultTrainingData: TrainingData = {
    prompts: [],
    images: [],
    videos: [],
    otherFiles: []
  };
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Training data state
  const [trainingData, setTrainingData] = useState<TrainingData>(initialData || defaultTrainingData);
  
  // New prompt input state
  const [newPrompt, setNewPrompt] = useState('');
  const [promptCategory, setPromptCategory] = useState('');
  
  // Video URL input state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  
  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  
  // File upload hook
  const { 
    uploadState, 
    addFiles, 
    removeFile, 
    clearUploadState 
  } = useFileUpload(false, file => {
    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = file.type.startsWith('image/') 
      ? 10 * 1024 * 1024 
      : file.type.startsWith('video/') 
        ? 50 * 1024 * 1024 
        : 20 * 1024 * 1024;
    
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      alert(`File ${file.name} exceeds the maximum size of ${maxSizeMB}MB`);
      return false;
    }
    
    return true;
  });
  
  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Add files to our state
    addFiles(acceptedFiles);
    
    // Create file preview URLs and add to training data
    const newFiles: TrainingDataFile[] = acceptedFiles.map(file => {
      const fileType = getFileType(file);
      const previewUrl = fileType === 'image' ? URL.createObjectURL(file) : undefined;
      
      return {
        id: generateId(),
        file,
        type: fileType,
        previewUrl,
        progress: 0,
        status: 'pending'
      };
    });
    
    // Update state based on file types
    setTrainingData(prev => {
      const newImages = [...prev.images, ...newFiles.filter(f => f.type === 'image')];
      const newOtherFiles = [...prev.otherFiles, ...newFiles.filter(f => f.type !== 'image')];
      
      return {
        ...prev,
        images: newImages,
        otherFiles: newOtherFiles
      };
    });
  }, [addFiles]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
      'text/*': [],
      'application/pdf': []
    }
  });
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle adding a new prompt
  const handleAddPrompt = () => {
    if (!newPrompt.trim()) return;
    
    const newPromptItem: TrainingPrompt = {
      id: generateId(),
      text: newPrompt.trim(),
      category: promptCategory.trim() || undefined
    };
    
    setTrainingData(prev => ({
      ...prev,
      prompts: [...prev.prompts, newPromptItem]
    }));
    
    setNewPrompt('');
    setPromptCategory('');
  };
  
  // Handle adding a video URL
  const handleAddVideoUrl = () => {
    if (!videoUrl.trim()) return;
    
    const videoInfo = extractVideoInfo(videoUrl.trim());
    const newVideo: TrainingDataVideo = {
      id: videoInfo.id,
      url: videoUrl.trim(),
      title: videoTitle.trim() || `Video ${trainingData.videos.length + 1}`,
      type: videoInfo.type,
      thumbnailUrl: videoInfo.thumbnailUrl
    };
    
    setTrainingData(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo]
    }));
    
    setVideoUrl('');
    setVideoTitle('');
  };
  
  // Handle removing a prompt
  const handleRemovePrompt = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      prompts: prev.prompts.filter(p => p.id !== id)
    }));
  };
  
  // Handle removing an image
  const handleRemoveImage = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };
  
  // Handle removing a video
  const handleRemoveVideo = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== id)
    }));
  };
  
  // Handle removing other files
  const handleRemoveFile = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      otherFiles: prev.otherFiles.filter(f => f.id !== id)
    }));
  };
  
  // Handle file preview
  const handlePreview = (item: any) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };
  
  // Close preview dialog
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };
  
  // Clear all training data
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all training data?')) {
      setTrainingData(defaultTrainingData);
      clearUploadState();
    }
  };
  
  // Notify parent component when training data changes
  useEffect(() => {
    onChange(trainingData);
  }, [trainingData, onChange]);
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      trainingData.images.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, [trainingData.images]);
  
  if (!isTrainable) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Enable "This asset can be used for training AI models" to add training data.
      </Alert>
    );
  }
  
  // Calculate stats for display
  const totalPrompts = trainingData.prompts.length;
  const totalImages = trainingData.images.length;
  const totalVideos = trainingData.videos.length;
  const totalOtherFiles = trainingData.otherFiles.length;
  const totalFiles = totalImages + totalOtherFiles;
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary / stats */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Training Data
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<TextIcon />} 
              label={`${totalPrompts} Prompt${totalPrompts !== 1 ? 's' : ''}`} 
              color={totalPrompts > 0 ? 'primary' : 'default'} 
              variant="outlined"
            />
            <Chip 
              icon={<ImageIcon />} 
              label={`${totalImages} Image${totalImages !== 1 ? 's' : ''}`} 
              color={totalImages > 0 ? 'primary' : 'default'}
              variant="outlined" 
            />
            <Chip 
              icon={<VideoIcon />} 
              label={`${totalVideos} Video${totalVideos !== 1 ? 's' : ''}`} 
              color={totalVideos > 0 ? 'primary' : 'default'}
              variant="outlined" 
            />
            <Chip 
              icon={<FileIcon />} 
              label={`${totalOtherFiles} Other File${totalOtherFiles !== 1 ? 's' : ''}`} 
              color={totalOtherFiles > 0 ? 'primary' : 'default'}
              variant="outlined" 
            />
          </Box>
        </Box>
        
        {(totalPrompts > 0 || totalFiles > 0 || totalVideos > 0) && (
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        )}
      </Box>
      
      {/* Tabs for different types of training data */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="training data tabs"
          variant="fullWidth"
        >
          <Tab label="Prompts" id="training-tab-0" aria-controls="training-tabpanel-0" />
          <Tab label="Images" id="training-tab-1" aria-controls="training-tabpanel-1" />
          <Tab label="Videos" id="training-tab-2" aria-controls="training-tabpanel-2" />
          <Tab label="Other Files" id="training-tab-3" aria-controls="training-tabpanel-3" />
        </Tabs>
        
        {/* Prompts Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Add Prompts
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enter the prompts that were used to generate or train this asset. These help others understand how to use this asset in AI systems.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Prompt Text"
                    placeholder="Enter a prompt used to generate or train this asset"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        handleAddPrompt();
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Category (Optional)"
                    placeholder="E.g., Style, Subject, Pose"
                    value={promptCategory}
                    onChange={(e) => setPromptCategory(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddPrompt}
                    disabled={!newPrompt.trim()}
                  >
                    Add Prompt
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    Press Ctrl+Enter to add quickly
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Saved Prompts ({trainingData.prompts.length})
              </Typography>
              
              {trainingData.prompts.length === 0 ? (
                <Alert severity="info">
                  No prompts added yet. Add prompts above to help others understand how to use this asset in AI systems.
                </Alert>
              ) : (
                <List>
                  {trainingData.prompts.map((prompt, index) => (
                    <ListItem 
                      key={prompt.id}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePrompt(prompt.id)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                      sx={{ 
                        bgcolor: 'background.paper', 
                        mb: 1, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={prompt.text}
                        secondary={prompt.category ? `Category: ${prompt.category}` : null}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Images Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Reference Images
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add reference images that were used to inspire or train this asset. Drag and drop images or click to select files.
              </Typography>
              
              <Paper 
                {...getRootProps()}
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select files (max 10MB per image)
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Uploaded Images ({trainingData.images.length})
              </Typography>
              
              {trainingData.images.length === 0 ? (
                <Alert severity="info">
                  No images uploaded yet. Add reference images to help train AI models or provide visual examples.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {trainingData.images.map((image) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={image.previewUrl}
                          alt={image.file.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ pt: 1, pb: 1 }}>
                          <Typography variant="body2" noWrap title={image.file.name}>
                            {image.file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(image.file.size)}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                          <IconButton size="small" onClick={() => handlePreview(image)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleRemoveImage(image.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Videos Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Add Video References
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add links to videos that relate to this asset. YouTube and Vimeo links are supported.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Video URL"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    InputProps={{
                      startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Title (Optional)"
                    placeholder="Video title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddVideoUrl}
                    disabled={!videoUrl.trim()}
                  >
                    Add Video
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Video References ({trainingData.videos.length})
              </Typography>
              
              {trainingData.videos.length === 0 ? (
                <Alert severity="info">
                  No video references added yet. Add video links to provide motion references or examples.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {trainingData.videos.map((video) => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                      <Card sx={{ height: '100%' }}>
                        {video.thumbnailUrl ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={video.thumbnailUrl}
                            alt={video.title}
                            sx={{ 
                              objectFit: 'cover',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.3)',
                                zIndex: 1
                              }
                            }}
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              height: 140, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              bgcolor: 'action.selected'
                            }}
                          >
                            <VideoIcon sx={{ fontSize: 60, opacity: 0.7 }} />
                          </Box>
                        )}
                        
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2
                          }}
                        >
                          <IconButton 
                            sx={{ 
                              bgcolor: 'rgba(0,0,0,0.6)', 
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.8)',
                              }
                            }}
                            onClick={() => window.open(video.url, '_blank')}
                          >
                            <PlayIcon />
                          </IconButton>
                        </Box>
                        
                        <CardContent>
                          <Typography variant="body2" noWrap title={video.title}>
                            {video.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {video.type === 'youtube' ? 'YouTube' : video.type === 'vimeo' ? 'Vimeo' : 'Video Link'}
                          </Typography>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between' }}>
                          <Tooltip title="Open in new window">
                            <IconButton 
                              size="small"
                              onClick={() => window.open(video.url, '_blank')}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveVideo(video.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Other Files Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Other Training Files
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add additional files such as PDFs, audio files, or other reference materials. Drag and drop files or click to select.
              </Typography>
              
              <Paper 
                {...getRootProps()}
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select files (max 20MB per file)
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Other Files ({trainingData.otherFiles.length})
              </Typography>
              
              {trainingData.otherFiles.length === 0 ? (
                <Alert severity="info">
                  No additional files uploaded yet. Add PDFs, audio, or other reference materials to enhance training data.
                </Alert>
              ) : (
                <List>
                  {trainingData.otherFiles.map((file) => (
                    <ListItem 
                      key={file.id}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(file.id)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                      sx={{ 
                        bgcolor: 'background.paper', 
                        mb: 1, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getFileIconColor(file.type) }}>
                          {getFileTypeIcon(file.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={file.file.name}
                        secondary={`${file.file.type || 'Unknown type'} • ${formatFileSize(file.file.size)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewItem?.file?.name || previewItem?.title || 'Preview'}
        </DialogTitle>
        <DialogContent>
          {previewItem && previewItem.type === 'image' && previewItem.previewUrl && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%', 
                maxHeight: '70vh',
                overflow: 'auto'
              }}
            >
              <img 
                src={previewItem.previewUrl} 
                alt={previewItem.file.name} 
                style={{ maxWidth: '100%', maxHeight: '70vh' }} 
              />
            </Box>
          )}
          
          {previewItem && previewItem.type === 'video' && (
            <Box sx={{ width: '100%' }}>
              <video 
                src={previewItem.previewUrl} 
                controls 
                style={{ width: '100%', maxHeight: '70vh' }} 
              />
            </Box>
          )}
          
          {previewItem && previewItem.type === 'audio' && (
            <Box sx={{ width: '100%', p: 2 }}>
              <audio src={previewItem.previewUrl} controls style={{ width: '100%' }} />
            </Box>
          )}
          
          {previewItem && previewItem.url && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="body1" paragraph>
                {previewItem.url}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<ViewIcon />}
                onClick={() => window.open(previewItem.url, '_blank')}
              >
                Open in New Window
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper function to determine icon color based on file type
const getFileIconColor = (fileType: string) => {
  switch (fileType) {
    case 'audio':
      return '#1976d2'; // blue
    case 'video':
      return '#e91e63'; // pink
    case 'prompt':
      return '#4caf50'; // green
    case 'other':
    default:
      return '#ff9800'; // orange
  }
};

// Helper function to get icon based on file type
const getFileTypeIcon = (fileType: string) => {
  switch (fileType) {
    case 'audio':
      return <AudioIcon />;
    case 'video':
      return <VideoIcon />;
    case 'prompt':
      return <TextIcon />;
    case 'other':
    default:
      return <FileIcon />;
  }
};

export default TrainingDataUpload;