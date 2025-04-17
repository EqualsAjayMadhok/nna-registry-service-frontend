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
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  SmartToy as ModelIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { layerConfig } from '../../api/layerConfig';
import { modelsInUse, modelsByType } from '../../api/ModelsInUseConfig';

import { Asset as GlobalAsset } from '../../types/asset.types';

// Local interface for simplified assets
interface SimpleAsset {
  id?: string;
  name: string;
  address?: string;
  status?: 'pending' | 'complete' | 'incomplete';
  layer?: string;
  category?: string;
  subcategory?: string;
  sequentialNumber?: number;
}

interface ModelInfo {
  id: string;
  name: string;
  version: string;
  type: string;
  provider: string;
  description?: string;
  documentationUrl?: string;
}

interface TrainingDataComponent {
  id: string;
  name: string; // Human-friendly name (e.g., T.S.POP.PNK.002.txt)
  address: string; // Machine-friendly address
  type: 'prompt' | 'image' | 'video' | 'model';
  content?: string | File | URL;
  modelInfo?: ModelInfo; // Only for model type
  usageCount?: number; // Number of other assets using this component
  sequentialNumber?: number; // Sequential number within the training set
}

interface TrainingDataSetManagerProps {
  trainingAsset: GlobalAsset | SimpleAsset;
  primaryAsset?: GlobalAsset | SimpleAsset; // The primary asset this training set is for
  onSave: (components: TrainingDataComponent[]) => void;
  existingComponents?: TrainingDataComponent[];
  onComplete?: () => void; // Called when saving is complete
  onCancel?: () => void; // Called when user cancels
}

// Main component
const TrainingDataSetManager: React.FC<TrainingDataSetManagerProps> = ({
  trainingAsset,
  primaryAsset,
  onSave,
  existingComponents = [],
  onComplete,
  onCancel
}) => {
  const [components, setComponents] = useState<TrainingDataComponent[]>(existingComponents);
  const [showBrowseDialog, setShowBrowseDialog] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  
  // Extract asset details from training asset name for proper naming
  const assetAddress = trainingAsset.address || ('nna_address' in trainingAsset ? trainingAsset.nna_address : '') || trainingAsset.name;
  const assetParts = {
    layer: trainingAsset.layer || assetAddress.split('.')[1] || '',
    category: trainingAsset.category || assetAddress.split('.')[2] || '',
    subcategory: trainingAsset.subcategory || assetAddress.split('.')[3] || '',
    sequential: ('sequentialNumber' in trainingAsset ? trainingAsset.sequentialNumber : undefined) || parseInt(assetAddress.split('.')[4]?.split('.')[0] || '1', 10)
  };
  
  // Keep track of next sequential numbers for each component type
  const [nextSequential, setNextSequential] = useState({
    prompt: 1,
    image: 1,
    video: 1,
    model: 1
  });
  
  useEffect(() => {
    // Find max sequential numbers from existing components
    const maxSequentials = {
      prompt: 0,
      image: 0,
      video: 0,
      model: 0
    };
    
    existingComponents.forEach(component => {
      if (component.sequentialNumber && component.type) {
        maxSequentials[component.type] = Math.max(maxSequentials[component.type], component.sequentialNumber);
      }
    });
    
    // Set next sequential numbers
    setNextSequential({
      prompt: maxSequentials.prompt + 1,
      image: maxSequentials.image + 1,
      video: maxSequentials.video + 1,
      model: maxSequentials.model + 1
    });
  }, [existingComponents]);
  
  // Generate a unique ID
  const generateId = () => `component-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Generate proper NNA human-friendly name for training component
  const generateComponentName = (type: 'prompt' | 'image' | 'video' | 'model', extension: string = ''): string => {
    // Format: T.[Layer].[CategoryCode].[SubCategoryCode].[Sequential].[Type]
    const seq = nextSequential[type].toString().padStart(3, '0');
    const ext = extension ? `.${extension}` : '';
    
    return `T.${assetParts.layer}.${assetParts.category}.${assetParts.subcategory}.${seq}${ext}`;
  };
  
  // Generate proper NNA machine-friendly address for training component
  const generateComponentAddress = (type: 'prompt' | 'image' | 'video' | 'model', extension: string = ''): string => {
    // Format: T.[Layer].[CategoryNum].[SubCategoryNum].[Sequential].[Type]
    // For demo, we'll use 001, 002, etc. for category and subcategory
    const layerPart = assetParts.layer;
    const catPart = '001';
    const subcatPart = '002';
    const seq = nextSequential[type].toString().padStart(3, '0');
    const ext = extension ? `.${extension}` : '';
    
    return `T.${layerPart}.${catPart}.${subcatPart}.${seq}${ext}`;
  };
  
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
        const fileExt = file.name.split('.').pop() || 'png';
        
        const component: TrainingDataComponent = {
          id: generateId(),
          name: generateComponentName('image', fileExt),
          address: generateComponentAddress('image', fileExt),
          type: 'image',
          content: file,
          sequentialNumber: nextSequential.image,
          usageCount: 1
        };
        
        setComponents([...components, component]);
        
        // Increment the next sequential number for images
        setNextSequential({
          ...nextSequential,
          image: nextSequential.image + 1
        });
      }
    };
    
    input.click();
  };
  
  // Handle prompt submission
  const handlePromptSubmit = () => {
    if (promptText.trim()) {
      const component: TrainingDataComponent = {
        id: generateId(),
        name: generateComponentName('prompt', 'txt'),
        address: generateComponentAddress('prompt', 'txt'),
        type: 'prompt',
        content: promptText,
        sequentialNumber: nextSequential.prompt,
        usageCount: 1
      };
      
      setComponents([...components, component]);
      setPromptText('');
      setShowPromptDialog(false);
      
      // Increment the next sequential number for prompts
      setNextSequential({
        ...nextSequential,
        prompt: nextSequential.prompt + 1
      });
    }
  };
  
  // Handle video URL submission
  const handleVideoSubmit = () => {
    if (videoUrl.trim()) {
      try {
        const url = new URL(videoUrl);
        const component: TrainingDataComponent = {
          id: generateId(),
          name: generateComponentName('video', 'mp4'),
          address: generateComponentAddress('video', 'mp4'),
          type: 'video',
          content: url,
          sequentialNumber: nextSequential.video,
          usageCount: 1
        };
        
        setComponents([...components, component]);
        setVideoUrl('');
        setShowVideoDialog(false);
        
        // Increment the next sequential number for videos
        setNextSequential({
          ...nextSequential,
          video: nextSequential.video + 1
        });
      } catch (e) {
        // Handle invalid URL
        alert('Please enter a valid URL');
      }
    }
  };
  
  // Handle model selection
  const handleModelSubmit = () => {
    // Add each selected model as a separate component
    selectedModelIds.forEach((modelId, index) => {
      const modelInfo = modelsInUse.find(model => model.id === modelId);
      
      if (modelInfo) {
        const component: TrainingDataComponent = {
          id: generateId(),
          name: generateComponentName('model', 'mdl'),
          address: generateComponentAddress('model', 'mdl'),
          type: 'model',
          modelInfo: modelInfo,
          sequentialNumber: nextSequential.model + index,
          usageCount: 1
        };
        
        setComponents(prev => [...prev, component]);
      }
    });
    
    // Update next sequential number
    setNextSequential({
      ...nextSequential,
      model: nextSequential.model + selectedModelIds.length
    });
    
    // Reset and close dialog
    setSelectedModelIds([]);
    setShowModelDialog(false);
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
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Chip 
              label={trainingAsset.name} 
              color="primary" 
              size="small"
              sx={{ mr: 1 }} 
            />
            <Badge 
              badgeContent="Auto-generated" 
              color="primary"
              sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 'auto' } }}
            />
          </Box>
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
              title="Add Text Prompt"
            >
              Add Prompt
            </Button>
            <Button 
              startIcon={<ImageIcon />}
              onClick={handleImageSelect}
              title="Add Reference Image"
            >
              Add Image
            </Button>
            <Button 
              startIcon={<VideoIcon />}
              onClick={() => setShowVideoDialog(true)}
              title="Add Video URL Reference"
            >
              Add Video
            </Button>
            <Button 
              startIcon={<ModelIcon />}
              onClick={() => setShowModelDialog(true)}
              title="Select AI Models Used"
              color="info"
            >
              Add Models
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Add training data components to this set. Training data helps with attribution and enhances AI model features.
        Each component will receive its own NNA address for proper tracking and provenance.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {components.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography color="text.secondary">
            No training data components added yet. Add components using the buttons above.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Components in this training set:
          </Typography>
          
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
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {component.name}
                      </Typography>
                      {component.type === 'model' && component.modelInfo && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {component.modelInfo.name} v{component.modelInfo.version} ({component.modelInfo.provider})
                        </Typography>
                      )}
                      {component.type === 'prompt' && typeof component.content === 'string' && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '400px'
                          }}
                        >
                          "{component.content.substring(0, 80)}{component.content.length > 80 ? '...' : ''}"
                        </Typography>
                      )}
                      {component.type === 'video' && component.content && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <LinkIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                          {component.content.toString().substring(0, 40)}...
                        </Typography>
                      )}
                    </Box>
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
                      <Chip 
                        label={`NNA: ${component.address}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', mr: 1 }}
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
        </Box>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Box>
          {onComplete && (
            <Button 
              variant="outlined" 
              onClick={onComplete} 
              sx={{ mr: 1 }}
            >
              Skip & Complete Later
            </Button>
          )}
          <Button 
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => onSave(components)}
            disabled={components.length === 0}
          >
            Save Training Data Set
          </Button>
        </Box>
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

      {/* Model Selection Dialog */}
      <Dialog
        open={showModelDialog}
        onClose={() => setShowModelDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select AI Models Used</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select the AI models used to generate or train this asset. This helps with attribution and provenance tracking.
          </Typography>
          
          {Object.entries(modelsByType).map(([type, models]) => (
            <Box key={type} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'capitalize' }}>
                {type.replace(/-/g, ' ')} Models
              </Typography>
              <Grid container spacing={1}>
                {(models as ModelInfo[]).map((model) => (
                  <Grid item xs={12} sm={6} md={4} key={model.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        border: selectedModelIds.includes(model.id) 
                          ? '2px solid' 
                          : '1px solid',
                        borderColor: selectedModelIds.includes(model.id) 
                          ? 'primary.main' 
                          : 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 1,
                          borderColor: 'primary.light'
                        },
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onClick={() => {
                        setSelectedModelIds(ids => 
                          ids.includes(model.id)
                            ? ids.filter(id => id !== model.id)
                            : [...ids, model.id]
                        );
                      }}
                    >
                      {selectedModelIds.includes(model.id) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2
                          }}
                        >
                          ✓
                        </Box>
                      )}
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <ModelIcon />
                          </Avatar>
                        }
                        title={`${model.name} v${model.version}`}
                        subheader={model.provider}
                        sx={{ pb: 0 }}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          minHeight: '40px',
                          fontSize: '0.8rem'
                        }}>
                          {model.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={type.toUpperCase()}
                            size="small"
                            color="info"
                            sx={{ fontSize: '0.6rem' }}
                          />
                          {model.documentationUrl && (
                            <Tooltip title="View documentation">
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(model.documentationUrl, '_blank');
                                }}
                              >
                                <LinkIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          {selectedModelIds.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                Selected Models: {selectedModelIds.length}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {selectedModelIds.map(id => {
                  const model = modelsInUse.find(m => m.id === id);
                  return model ? (
                    <Chip
                      key={id}
                      label={`${model.name} (${model.provider})`}
                      onDelete={() => setSelectedModelIds(ids => ids.filter(i => i !== id))}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ) : null;
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSelectedModelIds([]);
            setShowModelDialog(false);
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleModelSubmit}
            disabled={selectedModelIds.length === 0}
            startIcon={<AddIcon />}
          >
            Add Selected Models
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TrainingDataSetManager;