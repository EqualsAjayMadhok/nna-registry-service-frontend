import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  IconButton, 
  Menu, 
  MenuItem, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  MoreVert as MoreIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Notes as NotesIcon,
  Add as AddIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { Collection, CollectionAsset, Asset } from '../../types/asset.types';
import AssetService from '../../services/api/asset.service';
import collectionService from '../../api/collectionService';
import AssetSearch from '../search/AssetSearch';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface CollectionGridProps {
  collection: Collection;
  onCollectionUpdated: (collection: Collection) => void;
  editable?: boolean;
}

const CollectionGrid: React.FC<CollectionGridProps> = ({
  collection,
  onCollectionUpdated,
  editable = false
}) => {
  const theme = useTheme();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<{[key: string]: boolean}>({});
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Load assets when collection changes
  useEffect(() => {
    if (collection && collection.assets.length > 0) {
      loadAssets();
    } else {
      setAssets([]);
    }
  }, [collection]);

  // Load assets data
  const loadAssets = async () => {
    setLoading(true);
    setError(null);

    try {
      // For each asset in the collection, fetch the full asset data
      const assetIds = collection.assets.map(asset => asset.assetId);
      
      // In a real implementation, we'd have a batch endpoint to fetch multiple assets at once
      // For now, we'll simulate it with sequential requests
      const assetPromises = assetIds.map(id => AssetService.getAssetById(id));
      const fetchedAssets = await Promise.all(assetPromises);
      
      // Sort assets according to the order in the collection
      const sortedAssets = [...fetchedAssets].sort((a, b) => {
        const aIndex = collection.assets.findIndex(asset => asset.assetId === a.id);
        const bIndex = collection.assets.findIndex(asset => asset.assetId === b.id);
        return aIndex - bIndex;
      });
      
      setAssets(sortedAssets);
    } catch (err) {
      console.error('Error loading collection assets:', err);
      setError('Failed to load collection assets');
    } finally {
      setLoading(false);
    }
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, assetId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAssetId(assetId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedAssetId(null);
  };

  // Show/hide asset notes
  const toggleNotes = (assetId: string) => {
    setShowNotes(prev => ({
      ...prev,
      [assetId]: !prev[assetId]
    }));
  };

  // Remove asset from collection
  const handleRemoveAsset = async () => {
    if (!selectedAssetId) return;
    
    try {
      const updatedCollection = await collectionService.removeAssetsFromCollection(
        collection.id, 
        { assetIds: [selectedAssetId] }
      );
      
      // Refresh assets list
      onCollectionUpdated(updatedCollection);
      handleMenuClose();
    } catch (err) {
      console.error('Error removing asset from collection:', err);
      setError('Failed to remove asset from collection');
    }
  };

  // Move asset up in collection order
  const handleMoveUp = async () => {
    if (!selectedAssetId) return;
    
    const assetIndex = collection.assets.findIndex(a => a.assetId === selectedAssetId);
    if (assetIndex <= 0) return; // Already at the top
    
    const reorderedAssets = [...collection.assets];
    const currentOrder = reorderedAssets[assetIndex].order;
    const prevOrder = reorderedAssets[assetIndex - 1].order;
    
    reorderedAssets[assetIndex].order = prevOrder;
    reorderedAssets[assetIndex - 1].order = currentOrder;
    
    try {
      const updatedCollection = await collectionService.reorderCollectionAssets(
        collection.id,
        {
          assets: [
            { assetId: reorderedAssets[assetIndex].assetId, order: prevOrder },
            { assetId: reorderedAssets[assetIndex - 1].assetId, order: currentOrder }
          ]
        }
      );
      
      onCollectionUpdated(updatedCollection);
      handleMenuClose();
    } catch (err) {
      console.error('Error reordering collection assets:', err);
      setError('Failed to reorder collection assets');
    }
  };

  // Move asset down in collection order
  const handleMoveDown = async () => {
    if (!selectedAssetId) return;
    
    const assetIndex = collection.assets.findIndex(a => a.assetId === selectedAssetId);
    if (assetIndex === -1 || assetIndex >= collection.assets.length - 1) return; // Already at the bottom
    
    const reorderedAssets = [...collection.assets];
    const currentOrder = reorderedAssets[assetIndex].order;
    const nextOrder = reorderedAssets[assetIndex + 1].order;
    
    reorderedAssets[assetIndex].order = nextOrder;
    reorderedAssets[assetIndex + 1].order = currentOrder;
    
    try {
      const updatedCollection = await collectionService.reorderCollectionAssets(
        collection.id,
        {
          assets: [
            { assetId: reorderedAssets[assetIndex].assetId, order: nextOrder },
            { assetId: reorderedAssets[assetIndex + 1].assetId, order: currentOrder }
          ]
        }
      );
      
      onCollectionUpdated(updatedCollection);
      handleMenuClose();
    } catch (err) {
      console.error('Error reordering collection assets:', err);
      setError('Failed to reorder collection assets');
    }
  };

  // Edit asset notes
  const handleEditNotes = () => {
    if (!selectedAssetId) return;
    
    const asset = collection.assets.find(a => a.assetId === selectedAssetId);
    if (asset) {
      setNoteText(asset.notes || '');
      setNotesDialogOpen(true);
    }
  };

  // Save edited notes
  const handleSaveNotes = async () => {
    if (!selectedAssetId) return;
    
    try {
      // In a real API, you would have an endpoint to update just the notes
      // For now, we'll simulate it by removing and adding the asset with new notes
      const updatedCollection = await collectionService.removeAssetsFromCollection(
        collection.id, 
        { assetIds: [selectedAssetId] }
      );
      
      const finalCollection = await collectionService.addAssetsToCollection(
        collection.id,
        {
          assetIds: [selectedAssetId],
          notes: noteText
        }
      );
      
      onCollectionUpdated(finalCollection);
      setNotesDialogOpen(false);
      handleMenuClose();
    } catch (err) {
      console.error('Error updating asset notes:', err);
      setError('Failed to update asset notes');
    }
  };

  // Handle asset selection from search dialog
  const handleAssetSelect = async (asset: Asset) => {
    try {
      const updatedCollection = await collectionService.addAssetsToCollection(
        collection.id,
        { assetIds: [asset.id] }
      );
      
      onCollectionUpdated(updatedCollection);
      setShowAddAssetDialog(false);
    } catch (err) {
      console.error('Error adding asset to collection:', err);
      setError('Failed to add asset to collection');
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // Create new order of assets
    const reorderedAssets = Array.from(collection.assets);
    const [removed] = reorderedAssets.splice(sourceIndex, 1);
    reorderedAssets.splice(destinationIndex, 0, removed);
    
    // Update order property for each asset
    const updatedAssets = reorderedAssets.map((asset, index) => ({
      assetId: asset.assetId,
      order: index
    }));
    
    try {
      const updatedCollection = await collectionService.reorderCollectionAssets(
        collection.id,
        { assets: updatedAssets }
      );
      
      onCollectionUpdated(updatedCollection);
    } catch (err) {
      console.error('Error reordering collection assets:', err);
      setError('Failed to reorder collection assets');
      // Revert to original order by reloading
      loadAssets();
    }
  };

  // Find collection asset data for an asset ID
  const getCollectionAssetData = (assetId: string): CollectionAsset | undefined => {
    return collection.assets.find(a => a.assetId === assetId);
  };

  // Render asset card
  const renderAssetCard = (asset: Asset, index: number) => {
    const collectionAsset = getCollectionAssetData(asset.id);
    const hasNotes = collectionAsset?.notes && collectionAsset.notes.trim().length > 0;
    
    return (
      <Draggable 
        key={asset.id} 
        draggableId={asset.id} 
        index={index}
        isDragDisabled={!editable}
      >
        {(provided) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            lg={3}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {editable && (
                <Box 
                  {...provided.dragHandleProps}
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    zIndex: 2,
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '0 0 4px 0',
                    cursor: 'grab'
                  }}
                >
                  <IconButton size="small" sx={{ color: 'white' }}>
                    <DragIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              
              {editable && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    zIndex: 2 
                  }}
                >
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleMenuOpen(e, asset.id)}
                    sx={{ color: 'white', background: 'rgba(0,0,0,0.3)', m: 0.5 }}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              
              <CardMedia
                component="img"
                height="140"
                image={asset.files && asset.files[0]?.thumbnailUrl ? 
                  asset.files[0].thumbnailUrl : 
                  `https://picsum.photos/seed/${asset.id}/400/300`}
                alt={asset.name}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" component="div" gutterBottom noWrap>
                  {asset.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {asset.layer} • {asset.category || 'Uncategorized'}
                </Typography>
                
                {hasNotes && (
                  <>
                    <Button 
                      variant="text" 
                      size="small" 
                      startIcon={<NotesIcon fontSize="small" />}
                      onClick={() => toggleNotes(asset.id)}
                      sx={{ mt: 1, mb: 1, p: 0 }}
                    >
                      {showNotes[asset.id] ? 'Hide Notes' : 'Show Notes'}
                    </Button>
                    
                    {showNotes[asset.id] && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mt: 1, 
                          p: 1, 
                          backgroundColor: 'rgba(0,0,0,0.03)', 
                          borderRadius: 1,
                          fontSize: '0.8rem'
                        }}
                      >
                        {collectionAsset?.notes}
                      </Typography>
                    )}
                  </>
                )}
                
                <Typography 
                  variant="caption" 
                  display="block" 
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Added {new Date(collectionAsset?.addedAt || '').toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Draggable>
    );
  };

  return (
    <Box>
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Asset action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMoveUp}>
          <MoveUpIcon fontSize="small" sx={{ mr: 1 }} /> Move Up
        </MenuItem>
        <MenuItem onClick={handleMoveDown}>
          <MoveDownIcon fontSize="small" sx={{ mr: 1 }} /> Move Down
        </MenuItem>
        <MenuItem onClick={handleEditNotes}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Notes
        </MenuItem>
        <MenuItem onClick={handleRemoveAsset} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Remove
        </MenuItem>
      </Menu>
      
      {/* Notes dialog */}
      <Dialog open={notesDialogOpen} onClose={() => setNotesDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Asset Notes</DialogTitle>
        <DialogContent>
          <textarea
            style={{ 
              width: '100%', 
              minHeight: '150px', 
              padding: '12px', 
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'vertical'
            }}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add notes about this asset in the collection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNotes} variant="contained">Save Notes</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add asset dialog */}
      <Dialog 
        open={showAddAssetDialog} 
        onClose={() => setShowAddAssetDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>Add Assets to Collection</DialogTitle>
        <DialogContent>
          <AssetSearch 
            onSelectAsset={handleAssetSelect}
            showFilters={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddAssetDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Collection header with actions */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}
      >
        <Typography variant="h6" component="h2">
          {collection.assets.length} {collection.assets.length === 1 ? 'Asset' : 'Assets'}
        </Typography>
        
        {editable && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowAddAssetDialog(true)}
          >
            Add Assets
          </Button>
        )}
      </Box>
      
      {/* Loading indicator */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : assets.length === 0 ? (
        <Box textAlign="center" my={4} p={4} bgcolor="background.paper" borderRadius={1}>
          <Typography variant="body1" color="text.secondary">
            This collection is empty.
          </Typography>
          {editable && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddAssetDialog(true)}
              sx={{ mt: 2 }}
            >
              Add Assets
            </Button>
          )}
        </Box>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="collection-assets" direction="horizontal">
            {(provided) => (
              <Grid 
                container 
                spacing={3}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {assets.map((asset, index) => renderAssetCard(asset, index))}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Box>
  );
};

export default CollectionGrid;