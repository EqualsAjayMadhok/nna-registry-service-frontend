import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Code as ModelIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { layerConfig } from '../../api/layerConfig';

// Types
interface Asset {
  id?: string;
  name: string;
  address: string;
  status?: 'pending' | 'complete' | 'incomplete';
}

interface TrainingDataComponent {
  id: string;
  name: string; // Human-friendly name (e.g., T.S.POP.PNK.002.txt)
  address: string; // Machine-friendly address
  type: 'prompt' | 'image' | 'video' | 'model';
  content?: string | File | URL;
  usageCount?: number; // Number of other assets using this component
}

interface TrainingDataSetManagerProps {
  trainingAsset: Asset;
  onSave: (components: TrainingDataComponent[]) => void;
  existingComponents?: TrainingDataComponent[];
}

// Main component
const TrainingDataSetManager: React.FC<TrainingDataSetManagerProps> = ({
  trainingAsset,
  onSave,
  existingComponents = []
}) => {
  const [components, setComponents] = useState<TrainingDataComponent[]>(existingComponents);
  const [showBrowseDialog, setShowBrowseDialog] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generate a unique ID
  const generateId = () => `component-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Handle file selection for images
  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        const component: TrainingDataComponent = {
          id: generateId(),
          name: `T.${trainingAsset.name.split('.')[1]}.${file.name}`,
          address: `T.${trainingAsset.address.split('.')[1]}.${file.name}`,
          type: 'image',
          content: file,
          usageCount: 1
        };
        setComponents([...components, component]);
      }
    };
    
    input.click();
  };
  
  // Handle prompt submission
  const handlePromptSubmit = () => {
    if (promptText.trim()) {
      const component: TrainingDataComponent = {
        id: generateId(),
        name: `T.${trainingAsset.name.split('.')[1]}.txt`,
        address: `T.${trainingAsset.address.split('.')[1]}.txt`,
        type: 'prompt',
        content: promptText,
        usageCount: 1
      };
      setComponents([...components, component]);
      setPromptText('');
      setShowPromptDialog(false);
    }
  };
  
  // Handle video URL submission
  const handleVideoSubmit = () => {
    if (videoUrl.trim()) {
      try {
        const url = new URL(videoUrl);
        const component: TrainingDataComponent = {
          id: generateId(),
          name: `T.${trainingAsset.name.split('.')[1]}.video`,
          address: `T.${trainingAsset.address.split('.')[1]}.video`,
          type: 'video',
          content: url,
          usageCount: 1
        };
        setComponents([...components, component]);
        setVideoUrl('');
        setShowVideoDialog(false);
      } catch (e) {
        // Handle invalid URL
        alert('Please enter a valid URL');
      }
    }
  };
  
  // Handle component deletion
  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter(component => component.id !== id));
  };
  
  // Handle adding an existing component
  const handleAddExistingComponent = (component: TrainingDataComponent) => {
    if (!components.some(c => c.id === component.id)) {
      setComponents([...components, component]);
    }
    setShowBrowseDialog(false);
  };
  
  // Filter existing components based on search query
  const filteredExistingComponents = existingComponents.filter(component => {
    if (!searchQuery) return true;
    return component.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Sample existing components for the mock UI
  const sampleExistingComponents: TrainingDataComponent[] = [
    {
      id: 'sample-1',
      name: 'T.S.POP.PNK.001.txt',
      address: 'T.S.001.002.001.txt',
      type: 'prompt',
      content: 'A pink star character with flowing hair and a glittery outfit',
      usageCount: 5
    },
    {
      id: 'sample-2',
      name: 'T.S.POP.PNK.002.png',
      address: 'T.S.001.002.002.png',
      type: 'image',
      usageCount: 3
    },
    {
      id: 'sample-3',
      name: 'T.S.POP.PNK.003.video',
      address: 'T.S.001.002.003.video',
      type: 'video',
      content: new URL('https://example.com/video.mp4'),
      usageCount: 2
    }
  ];
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6">
            Training Data Set
          </Typography>
          <Chip 
            label={trainingAsset.name} 
            color="primary" 
            size="small"
            sx={{ mt: 0.5 }} 
          />
        </Box>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<SearchIcon />}
            onClick={() => setShowBrowseDialog(true)}
            sx={{ mr: 1 }}
          >
            Browse Existing
          </Button>
          
          <ButtonGroup variant="contained" size="small">
            <Button 
              startIcon={<DescriptionIcon />}
              onClick={() => setShowPromptDialog(true)}
            >
              Add Prompt
            </Button>
            <Button 
              startIcon={<ImageIcon />}
              onClick={handleImageSelect}
            >
              Add Image
            </Button>
            <Button 
              startIcon={<VideoIcon />}
              onClick={() => setShowVideoDialog(true)}
            >
              Add Video
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Add training data components to this set. Training data helps with attribution and enhances AI-powered features.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {components.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography color="text.secondary">
            No training data components added yet. Add components using the buttons above.
          </Typography>
        </Box>
      ) : (
        <List>
          {components.map(component => (
            <ListItem key={component.id} sx={{ 
              mb: 1, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}>
              <ListItemIcon>
                {component.type === 'prompt' && <DescriptionIcon color="primary" />}
                {component.type === 'image' && <ImageIcon color="secondary" />}
                {component.type === 'video' && <VideoIcon color="error" />}
                {component.type === 'model' && <ModelIcon color="info" />}
              </ListItemIcon>
              
              <ListItemText 
                primary={
                  <Typography variant="body2" fontWeight="medium">
                    {component.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Chip 
                      label={component.type.toUpperCase()} 
                      size="small" 
                      color={
                        component.type === 'prompt' ? 'primary' :
                        component.type === 'image' ? 'secondary' :
                        component.type === 'video' ? 'error' : 'info'
                      }
                      sx={{ mr: 1, fontSize: '0.6rem' }}
                    />
                    {component.usageCount && component.usageCount > 1 && (
                      <Tooltip title="Number of assets using this component">
                        <Chip 
                          label={`Used in ${component.usageCount} assets`} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.6rem' }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <Tooltip title="View component">
                  <IconButton edge="end" sx={{ mr: 1 }}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove from set">
                  <IconButton edge="end" onClick={() => handleDeleteComponent(component.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => onSave(components)}>
          Save Training Data Set
        </Button>
      </Box>
      
      {/* Browse Existing Components Dialog */}
      <Dialog 
        open={showBrowseDialog} 
        onClose={() => setShowBrowseDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Browse Existing Training Data Components</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Components"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Search by name, type, or content"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          
          <Grid container spacing={2}>
            {(filteredExistingComponents.length > 0 ? filteredExistingComponents : sampleExistingComponents).map(component => (
              <Grid item xs={12} sm={6} md={4} key={component.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 2,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleAddExistingComponent(component)}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ 
                        bgcolor: 
                          component.type === 'prompt' ? 'primary.light' :
                          component.type === 'image' ? 'secondary.light' :
                          component.type === 'video' ? 'error.light' : 'info.light'
                      }}>
                        {
                          component.type === 'prompt' ? <DescriptionIcon /> :
                          component.type === 'image' ? <ImageIcon /> :
                          component.type === 'video' ? <VideoIcon /> : <ModelIcon />
                        }
                      </Avatar>
                    }
                    title={component.name}
                    subheader={`Used in ${component.usageCount || 1} asset(s)`}
                  />
                  <CardContent>
                    <Box sx={{ height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {component.type === 'prompt' && (
                        <Typography variant="body2" color="text.secondary">
                          {typeof component.content === 'string' ? component.content : 'Text prompt'}
                        </Typography>
                      )}
                      {component.type === 'image' && (
                        <Box sx={{ textAlign: 'center' }}>
                          <ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                          <Typography variant="caption" display="block">Image preview</Typography>
                        </Box>
                      )}
                      {component.type === 'video' && (
                        <Box sx={{ textAlign: 'center' }}>
                          <VideoIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                          <Typography variant="caption" display="block">Video reference</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={component.type.toUpperCase()} 
                        size="small" 
                        color={
                          component.type === 'prompt' ? 'primary' :
                          component.type === 'image' ? 'secondary' :
                          component.type === 'video' ? 'error' : 'info'
                        }
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBrowseDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Prompt Dialog */}
      <Dialog 
        open={showPromptDialog} 
        onClose={() => setShowPromptDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Text Prompt</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the text prompt used to generate this asset. This helps with attribution and AI training.
          </Typography>
          <TextField
            label="Prompt Text"
            multiline
            rows={6}
            fullWidth
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="E.g., A digital artwork of a pop star with flowing pink hair, wearing a sparkly outfit..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPromptDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handlePromptSubmit}
            disabled={!promptText.trim()}
          >
            Add Prompt
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Video Dialog */}
      <Dialog 
        open={showVideoDialog} 
        onClose={() => setShowVideoDialog(false)}
      >
        <DialogTitle>Add Video Reference</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the URL of a reference video used for this asset.
          </Typography>
          <TextField
            label="Video URL"
            fullWidth
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVideoDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleVideoSubmit}
            disabled={!videoUrl.trim()}
          >
            Add Video
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TrainingDataSetManager;