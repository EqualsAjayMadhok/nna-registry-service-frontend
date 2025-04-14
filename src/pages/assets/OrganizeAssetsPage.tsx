import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon, 
  Save as SaveIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AssetCard from '../../components/search/AssetCard';
import AssetOrganizer from '../../components/asset/AssetOrganizer';
import assetService from '../../services/api/asset.service';
import { Asset } from '../../types/asset.types';

/**
 * OrganizeAssetsPage component for organizing and curating assets
 */
const OrganizeAssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  // Load assets
  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await assetService.getAssets({
        limit: 50,
        sort: 'updatedAt',
        order: 'desc'
      });
      setAssets(response.items);
      setError(null);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter assets based on search term
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle asset selection
  const handleAssetSelect = (asset: Asset) => {
    setSelectedAssets(prevSelected => {
      const isAlreadySelected = prevSelected.some(item => item.id === asset.id);
      
      if (isAlreadySelected) {
        // Remove from selection
        return prevSelected.filter(item => item.id !== asset.id);
      } else {
        // Add to selection
        return [...prevSelected, asset];
      }
    });
  };

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    // Drop outside the list
    if (!result.destination) {
      return;
    }

    // Reorder selected assets
    const items = Array.from(selectedAssets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedAssets(items);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  // Save organization (in a real implementation, this would call an API)
  const handleSaveOrganization = () => {
    console.log('Saving organization of assets:', selectedAssets);
    alert('Asset organization saved!');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Organize Assets
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Organize and curate assets for collections, playlists, or featured content.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Asset Library</Typography>
              <TextField
                placeholder="Search assets..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: '300px' }}
              />
            </Box>

            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              sx={{ mb: 2 }}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="All Assets" />
              <Tab label="Images" />
              <Tab label="Audio" />
              <Tab label="Video" />
              <Tab label="3D Models" />
            </Tabs>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {filteredAssets.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No assets found matching your search.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {filteredAssets.map(asset => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: selectedAssets.some(item => item.id === asset.id) 
                              ? '2px solid #1976d2' 
                              : 'none',
                          }}
                        >
                          <CardActionArea 
                            onClick={() => handleAssetSelect(asset)}
                            sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                          >
                            <CardMedia
                              component="img"
                              height="160"
                              image={asset.files?.[0]?.url || "https://via.placeholder.com/300?text=No+Image"}
                              alt={asset.name}
                            />
                            <CardContent sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" noWrap>
                                {asset.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {asset.nnaAddress}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={asset.layer}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                                {asset.tags?.slice(0, 2).map(tag => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            </CardContent>
                          </CardActionArea>
                          <CardActions>
                            <Button 
                              size="small" 
                              onClick={() => navigate(`/assets/${asset.id}`)}
                            >
                              Details
                            </Button>
                            <Button 
                              size="small" 
                              color={selectedAssets.some(item => item.id === asset.id) ? "error" : "primary"}
                              onClick={() => handleAssetSelect(asset)}
                            >
                              {selectedAssets.some(item => item.id === asset.id) ? "Remove" : "Add"}
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Selected Assets</Typography>
              <Button 
                size="small" 
                variant="outlined" 
                color="error" 
                onClick={handleClearSelection}
                disabled={selectedAssets.length === 0}
              >
                Clear All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {selectedAssets.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" color="text.secondary">
                  No assets selected.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click on assets from the library to add them here.
                </Typography>
              </Box>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="selected-assets">
                  {(provided) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{ maxHeight: '600px', overflowY: 'auto' }}
                    >
                      {selectedAssets.map((asset, index) => (
                        <Draggable key={asset.id} draggableId={asset.id} index={index}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ mb: 2 }}
                            >
                              <Card sx={{ display: 'flex', alignItems: 'center' }}>
                                <DragIndicatorIcon sx={{ mx: 1, color: 'text.secondary' }} />
                                <CardMedia
                                  component="img"
                                  sx={{ width: 80, height: 80, objectFit: 'cover' }}
                                  image={asset.files?.[0]?.url || "https://via.placeholder.com/80?text=No+Image"}
                                  alt={asset.name}
                                />
                                <CardContent sx={{ flex: 1, py: 1, px: 2 }}>
                                  <Typography variant="subtitle2" noWrap>
                                    {asset.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                    {asset.nnaAddress}
                                  </Typography>
                                  <Chip
                                    label={`${asset.layer} · ${asset.category}`}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                </CardContent>
                                <Button
                                  size="small"
                                  color="error"
                                  sx={{ minWidth: 'auto', p: 1, mr: 1 }}
                                  onClick={() => handleAssetSelect(asset)}
                                >
                                  ✕
                                </Button>
                              </Card>
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveOrganization}
                disabled={selectedAssets.length === 0}
                fullWidth
              >
                Save Organization
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrganizeAssetsPage;