import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CardHeader,
  Divider,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LibraryMusic as SongIcon,
  Person as StarIcon,
  Palette as LookIcon,
  DirectionsRun as MoveIcon,
  Public as WorldIcon,
  Videocam as VideoIcon,
  ViewModule as BlockIcon,
  Extension as PluginIcon
} from '@mui/icons-material';
import { LayerOption } from '../../types/taxonomy.types';
import taxonomyService from '../../api/taxonomyService';

interface LayerSelectionProps {
  onLayerSelect: (layer: LayerOption) => void;
  selectedLayerCode?: string;
}

// Define layer card details with icon, description and color
const layerDetails: Record<string, {
  icon: React.ReactNode;
  description: string;
  color: string;
}> = {
  G: {
    icon: <SongIcon fontSize="large" />,
    description: 'Music and audio assets',
    color: '#1976d2' // blue
  },
  S: {
    icon: <StarIcon fontSize="large" />,
    description: 'Characters and personalities',
    color: '#e91e63' // pink
  },
  L: {
    icon: <LookIcon fontSize="large" />,
    description: 'Visual styles and appearances',
    color: '#9c27b0' // purple
  },
  M: {
    icon: <MoveIcon fontSize="large" />,
    description: 'Animations and movements',
    color: '#4caf50' // green
  },
  W: {
    icon: <WorldIcon fontSize="large" />,
    description: 'Environments and settings',
    color: '#ff9800' // orange
  },
  V: {
    icon: <VideoIcon fontSize="large" />,
    description: 'Video and cinematic assets',
    color: '#f44336' // red
  },
  B: {
    icon: <BlockIcon fontSize="large" />,
    description: 'Building blocks and components',
    color: '#795548' // brown
  },
  P: {
    icon: <PluginIcon fontSize="large" />,
    description: 'Plugins and extensions',
    color: '#607d8b' // blue-grey
  }
};

const LayerSelection: React.FC<LayerSelectionProps> = ({ onLayerSelect, selectedLayerCode }) => {
  const [layers, setLayers] = useState<LayerOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        setLoading(true);
        const layerOptions = taxonomyService.getLayers();
        setLayers(layerOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load layers');
      } finally {
        setLoading(false);
      }
    };

    fetchLayers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select Asset Layer
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the primary layer for your asset. The layer determines the asset's classification in the NNA framework.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {layers.map((layer) => {
          const details = layerDetails[layer.code] || {
            icon: <BlockIcon fontSize="large" />,
            description: 'Layer description not available',
            color: theme.palette.grey[500]
          };
          
          const isSelected = layer.code === selectedLayerCode;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={layer.code}>
              <Card 
                raised={isSelected}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderColor: isSelected ? details.color : 'transparent',
                  borderWidth: isSelected ? 2 : 0,
                  borderStyle: 'solid',
                  transition: 'all 0.3s ease'
                }}
              >
                <CardActionArea 
                  sx={{ height: '100%' }}
                  onClick={() => onLayerSelect(layer)}
                >
                  <CardHeader
                    avatar={
                      <Box 
                        sx={{ 
                          color: details.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {details.icon}
                      </Box>
                    }
                    title={`${layer.name} (${layer.code})`}
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {details.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default LayerSelection;