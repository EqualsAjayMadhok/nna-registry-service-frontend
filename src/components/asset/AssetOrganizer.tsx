import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  SelectChangeEvent
} from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot
} from 'react-beautiful-dnd';
import {
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  MoreVert as MoreIcon,
  DragIndicator as DragIcon,
  ChevronRight as ExpandIcon,
  ExpandMore as CollapseIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Asset, AssetFile } from '../../types/asset.types';

// Type definitions
export interface AssetGroup {
  id: string;
  title: string;
  assets: Asset[];
  expanded?: boolean;
}

export interface AssetSorting {
  field: 'name' | 'createdAt' | 'updatedAt' | 'layer' | 'order';
  direction: 'asc' | 'desc';
}

export interface OrganizerView {
  mode: 'grid' | 'list';
  groupBy: 'layer' | 'category' | 'subcategory' | 'none';
}

export interface AssetOrganizerProps {
  assets: Asset[];
  loading?: boolean;
  error?: string | null;
  defaultView?: OrganizerView;
  onUpdateOrder: (assetsWithNewOrder: Asset[]) => Promise<void>;
  onUpdateGroups: (assetsWithNewGroups: Asset[]) => Promise<void>;
  onSaveOrganization: () => Promise<void>;
}

const AssetOrganizer: React.FC<AssetOrganizerProps> = ({
  assets,
  loading = false,
  error,
  defaultView = { mode: 'grid', groupBy: 'layer' },
  onUpdateOrder,
  onUpdateGroups,
  onSaveOrganization
}) => {
  const theme = useTheme();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<OrganizerView>(defaultView);
  const [sorting, setSorting] = useState<AssetSorting>({ field: 'order', direction: 'asc' });
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Initialize and update asset groups when assets change
  useEffect(() => {
    if (assets && assets.length > 0) {
      updateAssetGroups(assets, view.groupBy);
    }
  }, [assets, view.groupBy]);
  
  // Function to update asset groups based on grouping parameter
  const updateAssetGroups = (assetsToGroup: Asset[], groupBy: OrganizerView['groupBy']) => {
    if (groupBy === 'none') {
      setAssetGroups([{
        id: 'all',
        title: 'All Assets',
        assets: [...assetsToGroup],
        expanded: true
      }]);
      return;
    }
    
    // Group assets
    const groupMap = new Map<string, Asset[]>();
    
    assetsToGroup.forEach(asset => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'layer':
          groupKey = asset.layer || 'Uncategorized';
          break;
        case 'category':
          groupKey = asset.category || 'Uncategorized';
          break;
        case 'subcategory':
          groupKey = asset.subcategory || 'Uncategorized';
          break;
        default:
          groupKey = 'All';
      }
      
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      
      groupMap.get(groupKey)!.push(asset);
    });
    
    // Create groups
    const newGroups: AssetGroup[] = [];
    
    groupMap.forEach((groupAssets, key) => {
      newGroups.push({
        id: key,
        title: getGroupTitle(key, groupBy),
        assets: groupAssets,
        expanded: true // Default to expanded
      });
    });
    
    // Sort groups
    newGroups.sort((a, b) => {
      if (a.id === 'Uncategorized') return 1;
      if (b.id === 'Uncategorized') return -1;
      return a.title.localeCompare(b.title);
    });
    
    setAssetGroups(newGroups);
  };
  
  // Helper function to get group title
  const getGroupTitle = (key: string, groupBy: OrganizerView['groupBy']): string => {
    switch (groupBy) {
      case 'layer':
        // Map layer codes to human-readable names
        switch (key) {
          case 'G': return 'Songs';
          case 'S': return 'Stars';
          case 'L': return 'Looks';
          case 'M': return 'Moves';
          case 'W': return 'Worlds';
          default: return key;
        }
      case 'category':
      case 'subcategory':
        return key;
      default:
        return 'All Assets';
    }
  };
  
  // Filter assets based on search query
  const filteredAssetGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return assetGroups;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    return assetGroups.map(group => {
      const filteredAssets = group.assets.filter(asset => {
        // Search in name, description, tags, and NNA address
        return (
          (asset.name && asset.name.toLowerCase().includes(query)) ||
          (asset.description && asset.description.toLowerCase().includes(query)) ||
          (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(query))) ||
          (asset.nnaAddress && asset.nnaAddress.toLowerCase().includes(query))
        );
      });
      
      return {
        ...group,
        assets: filteredAssets
      };
    }).filter(group => group.assets.length > 0);
  }, [assetGroups, searchQuery]);
  
  // Sort assets within a group
  const sortAssetsInGroup = (assets: Asset[]): Asset[] => {
    return [...assets].sort((a, b) => {
      let aValue: any = a[sorting.field];
      let bValue: any = b[sorting.field];
      
      // Handle special cases
      if (sorting.field === 'order' && (aValue === undefined || bValue === undefined)) {
        // If order is undefined, use a default value
        aValue = aValue === undefined ? 9999 : aValue;
        bValue = bValue === undefined ? 9999 : bValue;
      } else if (sorting.field === 'createdAt' || sorting.field === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Compare values
      if (aValue < bValue) {
        return sorting.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sorting.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    
    // Dropped outside a droppable area
    if (!destination) {
      return;
    }
    
    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Handle reordering within the same group
    if (source.droppableId === destination.droppableId) {
      // Find the group
      const groupIndex = assetGroups.findIndex(g => g.id === source.droppableId);
      if (groupIndex === -1) return;
      
      const group = assetGroups[groupIndex];
      const newAssets = Array.from(group.assets);
      const [movedAsset] = newAssets.splice(source.index, 1);
      newAssets.splice(destination.index, 0, movedAsset);
      
      // Update the order property for each asset
      const updatedAssets = newAssets.map((asset, index) => ({
        ...asset,
        order: index
      }));
      
      // Update the state
      const newGroups = [...assetGroups];
      newGroups[groupIndex] = {
        ...group,
        assets: updatedAssets
      };
      
      setAssetGroups(newGroups);
      
      // Call the API to update the order
      try {
        await onUpdateOrder(updatedAssets);
      } catch (error) {
        console.error('Error updating asset order:', error);
        setSaveError('Failed to update asset order');
      }
    } 
    // Handle moving between groups
    else {
      // Find the source and destination groups
      const sourceGroupIndex = assetGroups.findIndex(g => g.id === source.droppableId);
      const destGroupIndex = assetGroups.findIndex(g => g.id === destination.droppableId);
      
      if (sourceGroupIndex === -1 || destGroupIndex === -1) return;
      
      const sourceGroup = assetGroups[sourceGroupIndex];
      const destGroup = assetGroups[destGroupIndex];
      
      // Get the moved asset
      const sourceAssets = Array.from(sourceGroup.assets);
      const [movedAsset] = sourceAssets.splice(source.index, 1);
      
      // Update the asset's group property based on the groupBy setting
      const updatedMovedAsset = { 
        ...movedAsset
      };
      
      // Set the appropriate group property
      switch (view.groupBy) {
        case 'layer':
          updatedMovedAsset.layer = destGroup.id;
          break;
        case 'category':
          updatedMovedAsset.category = destGroup.id === 'Uncategorized' ? undefined : destGroup.id;
          break;
        case 'subcategory':
          updatedMovedAsset.subcategory = destGroup.id === 'Uncategorized' ? undefined : destGroup.id;
          break;
      }
      
      // Add to destination group
      const destAssets = Array.from(destGroup.assets);
      destAssets.splice(destination.index, 0, updatedMovedAsset);
      
      // Update the order property for both groups
      const updatedSourceAssets = sourceAssets.map((asset, index) => ({
        ...asset,
        order: index
      }));
      
      const updatedDestAssets = destAssets.map((asset, index) => ({
        ...asset,
        order: index
      }));
      
      // Update the state
      const newGroups = [...assetGroups];
      newGroups[sourceGroupIndex] = {
        ...sourceGroup,
        assets: updatedSourceAssets
      };
      
      newGroups[destGroupIndex] = {
        ...destGroup,
        assets: updatedDestAssets
      };
      
      setAssetGroups(newGroups);
      
      // Call the API to update the groups
      try {
        // Combine both updated lists
        const allUpdatedAssets = [
          ...updatedSourceAssets,
          ...updatedDestAssets
        ];
        
        await onUpdateGroups(allUpdatedAssets);
      } catch (error) {
        console.error('Error updating asset groups:', error);
        setSaveError('Failed to update asset groups');
      }
    }
  };
  
  // Toggle group expansion
  const toggleGroupExpansion = (groupId: string) => {
    setAssetGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? { ...group, expanded: !group.expanded } 
          : group
      )
    );
  };
  
  // Handle asset click
  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };
  
  // Handle asset menu open
  const handleAssetMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, asset: Asset) => {
    event.stopPropagation();
    setSelectedAsset(asset);
    setAnchorEl(event.currentTarget);
  };
  
  // Handle asset menu close
  const handleAssetMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode: OrganizerView['mode']) => {
    setView({ ...view, mode });
  };
  
  // Handle group by change
  const handleGroupByChange = (event: SelectChangeEvent<OrganizerView['groupBy']>) => {
    const groupBy = event.target.value as OrganizerView['groupBy'];
    setView({ ...view, groupBy });
  };
  
  // Handle sort change
  const handleSortChange = (event: SelectChangeEvent<AssetSorting['field']>) => {
    const field = event.target.value as AssetSorting['field'];
    setSorting({ ...sorting, field });
  };
  
  // Handle sort direction change
  const handleSortDirectionChange = () => {
    setSorting({
      ...sorting,
      direction: sorting.direction === 'asc' ? 'desc' : 'asc'
    });
  };
  
  // Handle save organization
  const handleSaveOrganization = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      await onSaveOrganization();
      setSaveSuccess(true);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving organization:', error);
      setSaveError('Failed to save organization');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render asset card for grid view
  const renderAssetCardGrid = (asset: Asset, index: number, provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
    // Get a thumbnail URL from the asset's files
    const thumbnailUrl = asset.files && asset.files.length > 0 && asset.files[0].thumbnailUrl 
      ? asset.files[0].thumbnailUrl 
      : asset.files && asset.files.length > 0 && asset.files[0].url
        ? asset.files[0].url
        : `https://via.placeholder.com/150?text=${encodeURIComponent(asset.name || 'Asset')}`;
    
    return (
      <Card
        ref={provided.innerRef}
        {...provided.draggableProps}
        sx={{
          width: '100%',
          bgcolor: snapshot.isDragging ? alpha(theme.palette.primary.light, 0.1) : 'background.paper',
          transition: 'background-color 0.2s',
          position: 'relative',
          '&:hover .drag-handle': {
            opacity: 1,
          },
        }}
      >
        <Box 
          className="drag-handle" 
          {...provided.dragHandleProps}
          sx={{
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            opacity: 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1,
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            }
          }}
        >
          <DragIcon sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        
        <CardActionArea onClick={() => handleAssetClick(asset)}>
          <CardMedia
            component="img"
            height="140"
            image={thumbnailUrl}
            alt={asset.name}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ pb: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {asset.name}
            </Typography>
            <Box sx={{ display: 'flex', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip 
                label={asset.layer} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              {asset.category && (
                <Chip
                  label={asset.category}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </CardActionArea>
        
        <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
          <IconButton
            size="small"
            onClick={(e) => handleAssetMenuOpen(e, asset)}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    );
  };
  
  // Render asset row for list view
  const renderAssetRowList = (asset: Asset, index: number, provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
    // Get a thumbnail URL from the asset's files
    const thumbnailUrl = asset.files && asset.files.length > 0 && asset.files[0].thumbnailUrl 
      ? asset.files[0].thumbnailUrl 
      : asset.files && asset.files.length > 0 && asset.files[0].url
        ? asset.files[0].url
        : `https://via.placeholder.com/50?text=${encodeURIComponent(asset.name || 'Asset')}`;
    
    return (
      <Paper
        ref={provided.innerRef}
        {...provided.draggableProps}
        sx={{
          p: 1,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: snapshot.isDragging ? alpha(theme.palette.primary.light, 0.1) : 'background.paper',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.1),
          },
        }}
      >
        <Box 
          {...provided.dragHandleProps}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
            px: 1,
            opacity: 0.5,
            '&:hover': { opacity: 1 }
          }}
        >
          <DragIcon />
        </Box>
        
        <Box
          component="img"
          src={thumbnailUrl}
          alt={asset.name}
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: 1,
            objectFit: 'cover',
            mr: 2
          }}
        />
        
        <Box sx={{ flexGrow: 1, overflow: 'hidden', cursor: 'pointer' }} onClick={() => handleAssetClick(asset)}>
          <Typography variant="body1" noWrap>
            {asset.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {asset.nnaAddress}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxWidth: '30%' }}>
          <Chip 
            label={asset.layer} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
          {asset.category && (
            <Chip
              label={asset.category}
              size="small"
              variant="outlined"
              sx={{ maxWidth: 100 }}
            />
          )}
        </Box>
        
        <IconButton
          size="small"
          onClick={(e) => handleAssetMenuOpen(e, asset)}
          sx={{ ml: 1 }}
        >
          <MoreIcon fontSize="small" />
        </IconButton>
      </Paper>
    );
  };
  
  // Render asset group
  const renderAssetGroup = (group: AssetGroup, groupIndex: number) => {
    const sortedAssets = sortAssetsInGroup(group.assets);
    
    return (
      <Box key={group.id} sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1,
            py: 1,
            px: 2,
            backgroundColor: 'background.default',
            borderRadius: 1,
            cursor: 'pointer',
          }}
          onClick={() => toggleGroupExpansion(group.id)}
        >
          {group.expanded ? <CollapseIcon /> : <ExpandIcon />}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {group.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            {group.assets.length} asset{group.assets.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        {group.expanded && (
          <Droppable 
            droppableId={group.id} 
            direction={view.mode === 'grid' ? 'horizontal' : 'vertical'}
            type="asset"
          >
            {(provided: DroppableProvided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  minHeight: 100,
                  p: 1,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 1,
                }}
              >
                {view.mode === 'grid' ? (
                  <Grid container spacing={2}>
                    {sortedAssets.map((asset, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                        <Draggable draggableId={asset.id} index={index}>
                          {(provided, snapshot) => renderAssetCardGrid(asset, index, provided, snapshot)}
                        </Draggable>
                      </Grid>
                    ))}
                    {provided.placeholder}
                  </Grid>
                ) : (
                  <Box>
                    {sortedAssets.map((asset, index) => (
                      <Draggable key={asset.id} draggableId={asset.id} index={index}>
                        {(provided, snapshot) => renderAssetRowList(asset, index, provided, snapshot)}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
                
                {sortedAssets.length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No assets in this group
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Droppable>
        )}
      </Box>
    );
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box>
        {/* Toolbar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="group-by-label">Group By</InputLabel>
                  <Select
                    labelId="group-by-label"
                    id="group-by"
                    value={view.groupBy}
                    label="Group By"
                    onChange={handleGroupByChange}
                  >
                    <MenuItem value="none">No Grouping</MenuItem>
                    <MenuItem value="layer">Layer</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="subcategory">Subcategory</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    id="sort-by"
                    value={sorting.field}
                    label="Sort By"
                    onChange={handleSortChange}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="createdAt">Created Date</MenuItem>
                    <MenuItem value="updatedAt">Updated Date</MenuItem>
                    <MenuItem value="layer">Layer</MenuItem>
                    <MenuItem value="order">Custom Order</MenuItem>
                  </Select>
                </FormControl>
                
                <Tooltip title={sorting.direction === 'asc' ? 'Ascending' : 'Descending'}>
                  <IconButton onClick={handleSortDirectionChange}>
                    <SortIcon 
                      sx={{ 
                        transform: sorting.direction === 'desc' ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                      }} 
                    />
                  </IconButton>
                </Tooltip>
                
                <Divider orientation="vertical" flexItem />
                
                <Tooltip title="Grid View">
                  <IconButton 
                    color={view.mode === 'grid' ? 'primary' : 'default'} 
                    onClick={() => handleViewModeChange('grid')}
                  >
                    <GridViewIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="List View">
                  <IconButton 
                    color={view.mode === 'list' ? 'primary' : 'default'} 
                    onClick={() => handleViewModeChange('list')}
                  >
                    <ListViewIcon />
                  </IconButton>
                </Tooltip>
                
                <Box sx={{ flexGrow: 1 }} />
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveOrganization}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Organization'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Error message */}
        {(error || saveError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || saveError}
          </Alert>
        )}
        
        {/* Success message */}
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Organization saved successfully!
          </Alert>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* No assets message */}
        {!loading && (!assetGroups || assetGroups.length === 0) && (
          <Box sx={{ textAlign: 'center', my: 5 }}>
            <Typography variant="h6" color="text.secondary">
              No assets found
            </Typography>
          </Box>
        )}
        
        {/* Asset groups */}
        {!loading && filteredAssetGroups.map(renderAssetGroup)}
        
        {/* Asset menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleAssetMenuClose}
        >
          <MenuItem onClick={handleAssetMenuClose}>View Details</MenuItem>
          <MenuItem onClick={handleAssetMenuClose}>Edit Asset</MenuItem>
          <MenuItem onClick={handleAssetMenuClose}>Duplicate</MenuItem>
          <Divider />
          <MenuItem onClick={handleAssetMenuClose} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        </Menu>
      </Box>
    </DragDropContext>
  );
};

export default AssetOrganizer;