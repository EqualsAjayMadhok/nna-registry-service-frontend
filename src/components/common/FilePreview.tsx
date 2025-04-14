import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  styled,
  Paper,
  LinearProgress,
  Slider,
  CircularProgress,
  Skeleton,
  Collapse,
  ButtonGroup,
  Button
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeMuteIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Delete as DeleteIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon
} from '@mui/icons-material';

export interface FilePreviewProps {
  /**
   * The file to preview
   */
  file: File;
  
  /**
   * File URL (if already uploaded)
   */
  fileUrl?: string;
  
  /**
   * Optional thumbnail URL (for video files)
   */
  thumbnailUrl?: string;
  
  /**
   * Height of the preview container
   * @default '200px'
   */
  height?: string | number;
  
  /**
   * Width of the preview container
   * @default '100%'
   */
  width?: string | number;
  
  /**
   * Show file information
   * @default true
   */
  showInfo?: boolean;
  
  /**
   * Show playback controls for audio/video
   * @default true
   */
  showControls?: boolean;
  
  /**
   * Allow deletion of the file
   * @default false
   */
  allowDelete?: boolean;
  
  /**
   * Called when delete button is clicked
   */
  onDelete?: () => void;
  
  /**
   * Allow downloading the file
   * @default true
   */
  allowDownload?: boolean;
  
  /**
   * Called when the preview is clicked
   */
  onClick?: () => void;
}

// Styled components
const StyledMediaContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
  '&:hover .media-controls': {
    opacity: 1,
  },
}));

const MediaControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2,
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: 2,
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
}));

const FileIcon = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
}));

// Helper function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

// Helper function to get file icon based on type
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon sx={{ fontSize: 48 }} color="primary" />;
  } else if (fileType.startsWith('audio/')) {
    return <AudioIcon sx={{ fontSize: 48 }} color="primary" />;
  } else if (fileType.startsWith('video/')) {
    return <VideoIcon sx={{ fontSize: 48 }} color="primary" />;
  } else if (fileType === 'application/pdf') {
    return <PdfIcon sx={{ fontSize: 48 }} color="primary" />;
  } else {
    return <DocumentIcon sx={{ fontSize: 48 }} color="primary" />;
  }
};

// Main component
const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  fileUrl,
  thumbnailUrl,
  height = '200px',
  width = '100%',
  showInfo = true,
  showControls = true,
  allowDelete = false,
  onDelete,
  allowDownload = true,
  onClick,
}) => {
  const theme = useTheme();
  
  // Extract file information
  const { name, size, type } = file;
  
  // Create a local URL for the file if not provided
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  
  // Media state for audio/video
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVolumeControlVisible, setIsVolumeControlVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determine preview type
  const isImage = type.startsWith('image/');
  const isAudio = type.startsWith('audio/');
  const isVideo = type.startsWith('video/');
  const isPdf = type === 'application/pdf';
  const isMediaFile = isAudio || isVideo;
  
  // Effect to create object URL for the file
  useEffect(() => {
    if (!fileUrl) {
      const objectUrl = URL.createObjectURL(file);
      setLocalUrl(objectUrl);
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }
  }, [file, fileUrl]);
  
  const previewUrl = fileUrl || localUrl;
  const previewThumbnail = thumbnailUrl || (isImage ? previewUrl : null);
  
  // Media event handlers
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
      setIsLoading(false);
    }
  };
  
  const handleMediaError = (e: React.SyntheticEvent) => {
    setError('Failed to load media');
    setIsLoading(false);
  };
  
  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const volumeValue = newValue as number;
    setVolume(volumeValue);
    if (mediaRef.current) {
      mediaRef.current.volume = volumeValue;
    }
    setIsMuted(volumeValue === 0);
  };
  
  const handleMuteToggle = () => {
    if (mediaRef.current) {
      const newMuteState = !isMuted;
      mediaRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
    }
  };
  
  const handleSeek = (event: Event, newValue: number | number[]) => {
    const seekValue = newValue as number;
    if (mediaRef.current) {
      mediaRef.current.currentTime = (seekValue / 100) * duration;
    }
  };
  
  const handleFullscreenToggle = () => {
    if (mediaRef.current) {
      if (!document.fullscreenElement) {
        mediaRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };
  
  // Effect to listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Render appropriate preview based on file type
  const renderPreview = () => {
    if (!previewUrl) {
      return (
        <FileIcon>
          {getFileIcon(type)}
        </FileIcon>
      );
    }
    
    if (isImage) {
      return (
        <StyledMediaContainer
          sx={{ 
            height, 
            width, 
            cursor: onClick ? 'pointer' : 'default'
          }}
          onClick={onClick}
        >
          <Box
            component="img"
            src={previewUrl}
            alt={name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            onError={() => setError('Failed to load image')}
          />
          {allowDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </StyledMediaContainer>
      );
    }
    
    if (isAudio) {
      return (
        <StyledMediaContainer sx={{ height, width }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
              padding: 2,
            }}
          >
            <AudioIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
            
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <audio
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={previewUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={handleMediaError}
                  style={{ display: 'none' }}
                />
                
                {showControls && (
                  <Box sx={{ width: '100%' }}>
                    <ProgressBar
                      variant="determinate"
                      value={(currentTime / duration) * 100 || 0}
                      onClick={(e) => {
                        if (mediaRef.current && duration) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percentage = (e.clientX - rect.left) / rect.width;
                          mediaRef.current.currentTime = percentage * duration;
                        }
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption">
                        {formatTime(currentTime)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={handlePlayPause}>
                          {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </IconButton>
                        
                        <Box sx={{ position: 'relative', ml: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => setIsVolumeControlVisible(!isVolumeControlVisible)}
                          >
                            {isMuted ? <VolumeMuteIcon /> : <VolumeIcon />}
                          </IconButton>
                          
                          <Collapse
                            in={isVolumeControlVisible}
                            sx={{
                              position: 'absolute',
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 100,
                              backgroundColor: 'background.paper',
                              borderRadius: 1,
                              boxShadow: 3,
                              padding: 1,
                              zIndex: 10,
                            }}
                          >
                            <Slider
                              value={volume}
                              onChange={handleVolumeChange}
                              min={0}
                              max={1}
                              step={0.01}
                              orientation="vertical"
                              sx={{ height: 80 }}
                            />
                          </Collapse>
                        </Box>
                      </Box>
                      
                      <Typography variant="caption">
                        {formatTime(duration)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
          
          {allowDelete && (
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </StyledMediaContainer>
      );
    }
    
    if (isVideo) {
      return (
        <StyledMediaContainer sx={{ height, width }}>
          {previewThumbnail && !isPlaying ? (
            <Box
              component="img"
              src={previewThumbnail}
              alt={name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={previewUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleMediaError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              muted={isMuted}
              playsInline
            />
          )}
          
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              <CircularProgress />
            </Box>
          )}
          
          {!isPlaying && !isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <IconButton
                size="large"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                onClick={handlePlayPause}
              >
                <PlayIcon fontSize="large" />
              </IconButton>
            </Box>
          )}
          
          {showControls && (
            <MediaControls className="media-controls">
              <Box sx={{ width: '100%' }}>
                <ProgressBar
                  variant="determinate"
                  value={(currentTime / duration) * 100 || 0}
                  sx={{ mb: 0.5 }}
                  onClick={(e) => {
                    if (mediaRef.current && duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percentage = (e.clientX - rect.left) / rect.width;
                      mediaRef.current.currentTime = percentage * duration;
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    {formatTime(currentTime)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={handlePlayPause} sx={{ color: 'white' }}>
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                    
                    <Box sx={{ position: 'relative', mx: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={handleMuteToggle}
                        sx={{ color: 'white' }}
                      >
                        {isMuted ? <VolumeMuteIcon /> : <VolumeIcon />}
                      </IconButton>
                      
                      <Collapse
                        in={isVolumeControlVisible}
                        sx={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 100,
                          backgroundColor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 3,
                          padding: 1,
                          zIndex: 10,
                        }}
                      >
                        <Slider
                          value={volume}
                          onChange={handleVolumeChange}
                          min={0}
                          max={1}
                          step={0.01}
                          orientation="vertical"
                          sx={{ height: 80 }}
                        />
                      </Collapse>
                    </Box>
                    
                    <IconButton
                      size="small"
                      onClick={handleFullscreenToggle}
                      sx={{ color: 'white' }}
                    >
                      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    {formatTime(duration)}
                  </Typography>
                </Box>
              </Box>
            </MediaControls>
          )}
          
          {allowDelete && (
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                zIndex: 3,
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </StyledMediaContainer>
      );
    }
    
    // Default for other file types
    return (
      <StyledMediaContainer
        sx={{ 
          height, 
          width, 
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={onClick}
      >
        {getFileIcon(type)}
        {allowDelete && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </StyledMediaContainer>
    );
  };
  
  return (
    <Box>
      {error ? (
        <Paper
          sx={{
            height,
            width,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
          }}
        >
          <Typography variant="body2" align="center">
            {error}
          </Typography>
        </Paper>
      ) : (
        renderPreview()
      )}
      
      {showInfo && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" component="div" noWrap title={name}>
            {name}
          </Typography>
          <Typography variant="caption" color="textSecondary" component="div">
            {formatFileSize(size)} • {type || 'Unknown type'}
          </Typography>
        </Box>
      )}
      
      {allowDownload && previewUrl && (
        <Box sx={{ mt: 1 }}>
          <Button
            variant="text"
            size="small"
            component="a"
            href={previewUrl}
            download={name}
            sx={{ textTransform: 'none' }}
          >
            Download
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FilePreview;