import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Grid,
  Breadcrumbs,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Collections as CollectionsIcon,
  MoreVert as MoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import collectionService from '../../api/collectionService';
import {
  Collection,
  CollectionType,
  CollectionVisibility,
  CollectionUpdateRequest
} from '../../types/asset.types';
import CollectionGrid from '../../components/collection/CollectionGrid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collection-tabpanel-${index}`}
      aria-labelledby={`collection-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CollectionDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Collection state
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // Edit form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<CollectionType>(CollectionType.PERSONAL);
  const [formVisibility, setFormVisibility] = useState<CollectionVisibility>(CollectionVisibility.PRIVATE);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState('');
  
  // Load collection details
  useEffect(() => {
    if (id) {
      fetchCollection(id);
    }
  }, [id]);
  
  // Fetch collection by ID
  const fetchCollection = async (collectionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await collectionService.getCollection(collectionId);
      setCollection(data);
      
      // Initialize form values
      setFormName(data.name);
      setFormDescription(data.description || '');
      setFormType(data.type);
      setFormVisibility(data.visibility);
      setFormTags(data.tags || []);
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError('Failed to fetch collection details');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Open edit dialog
  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };
  
  // Open delete dialog
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Open share dialog
  const handleShareDialogOpen = () => {
    setShareDialogOpen(true);
    handleMenuClose();
  };
  
  // Update a collection
  const handleUpdateCollection = async () => {
    if (!collection) return;
    
    try {
      const updates: CollectionUpdateRequest = {
        name: formName,
        description: formDescription,
        type: formType,
        visibility: formVisibility,
        tags: formTags.length > 0 ? formTags : undefined
      };
      
      const updatedCollection = await collectionService.updateCollection(collection.id, updates);
      setCollection(updatedCollection);
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating collection:', err);
      setError('Failed to update collection');
    }
  };
  
  // Delete a collection
  const handleDeleteCollection = async () => {
    if (!collection) return;
    
    try {
      await collectionService.deleteCollection(collection.id);
      setDeleteDialogOpen(false);
      
      // Navigate back to collections page
      navigate('/collections');
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection');
    }
  };
  
  // Share collection (simulated)
  const handleShareCollection = () => {
    // In a real app, this would handle sharing functionality
    // For now, just close the dialog
    setShareDialogOpen(false);
    handleMenuClose();
  };
  
  // Add tag to form
  const handleAddTag = () => {
    if (formTagInput && !formTags.includes(formTagInput)) {
      setFormTags([...formTags, formTagInput]);
      setFormTagInput('');
    }
  };
  
  // Remove tag from form
  const handleRemoveTag = (tag: string) => {
    setFormTags(formTags.filter(t => t !== tag));
  };
  
  // Handle pressing Enter in tag input
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Visibility icon helper
  const getVisibilityIcon = (visibility: CollectionVisibility) => {
    switch (visibility) {
      case CollectionVisibility.PUBLIC:
        return <PublicIcon fontSize="small" />;
      case CollectionVisibility.PRIVATE:
        return <LockIcon fontSize="small" />;
      case CollectionVisibility.SHARED:
        return <GroupIcon fontSize="small" />;
      default:
        return null;
    }
  };
  
  // Collection visibility text
  const getVisibilityText = (visibility: CollectionVisibility) => {
    switch (visibility) {
      case CollectionVisibility.PUBLIC:
        return 'Public - Visible to everyone';
      case CollectionVisibility.PRIVATE:
        return 'Private - Only visible to you';
      case CollectionVisibility.SHARED:
        return 'Shared - Visible to specific users';
      default:
        return '';
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !collection) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Collection not found'}
          </Alert>
          <Button
            component={Link}
            to="/collections"
            startIcon={<ArrowBackIcon />}
          >
            Back to Collections
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
            Home
          </Link>
          <Link to="/collections" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
            Collections
          </Link>
          <Typography color="text.primary">{collection.name}</Typography>
        </Breadcrumbs>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Collection header */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            position: 'relative',
            ...(collection.featured && {
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
              borderStyle: 'solid'
            })
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            gap: 2 
          }}>
            {/* Collection cover image */}
            <Box 
              sx={{ 
                width: { xs: '100%', md: 200 }, 
                height: { xs: 150, md: 150 }, 
                borderRadius: 1,
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <img
                src={collection.coverImageUrl || `https://picsum.photos/seed/${collection.id}/400/300`}
                alt={collection.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            
            {/* Collection details */}
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                  {collection.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    size="small" 
                    label={collection.type} 
                    color="default" 
                  />
                  
                  <Chip 
                    size="small" 
                    icon={getVisibilityIcon(collection.visibility)} 
                    label={collection.visibility} 
                    color="default" 
                  />
                  
                  {collection.featured && (
                    <Chip 
                      size="small" 
                      icon={<StarIcon />} 
                      label="Featured" 
                      color="primary" 
                    />
                  )}
                </Box>
              </Box>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                {collection.description || 'No description provided'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {collection.tags && collection.tags.map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    variant="outlined" 
                  />
                ))}
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(collection.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {collection.assetCount} {collection.assetCount === 1 ? 'asset' : 'assets'}
                  </Typography>
                  {collection.viewCount !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      {collection.viewCount} {collection.viewCount === 1 ? 'view' : 'views'}
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<ShareIcon />}
                    onClick={handleShareDialogOpen}
                    sx={{ mr: 1 }}
                  >
                    Share
                  </Button>
                  
                  <IconButton
                    onClick={handleMenuOpen}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="collection tabs">
            <Tab 
              label="Assets" 
              id="collection-tab-0"
              icon={<CollectionsIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Details" 
              id="collection-tab-1"
              icon={<InfoIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {/* Assets tab */}
        <TabPanel value={tabValue} index={0}>
          <CollectionGrid 
            collection={collection} 
            onCollectionUpdated={setCollection}
            editable={true}
          />
        </TabPanel>
        
        {/* Details tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Collection Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{collection.name}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">
                    {collection.description || 'No description provided'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{collection.type}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Visibility</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getVisibilityIcon(collection.visibility)}
                    <Typography variant="body1">
                      {getVisibilityText(collection.visibility)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                  <Typography variant="body1">{collection.createdBy}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">
                    {new Date(collection.createdAt).toLocaleDateString()} at {new Date(collection.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1">
                    {new Date(collection.updatedAt).toLocaleDateString()} at {new Date(collection.updatedAt).toLocaleTimeString()}
                  </Typography>
                </Box>
                
                {collection.lastViewedAt && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Last Viewed</Typography>
                    <Typography variant="body1">
                      {new Date(collection.lastViewedAt).toLocaleDateString()} at {new Date(collection.lastViewedAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Views</Typography>
                  <Typography variant="body1">{collection.viewCount || 0}</Typography>
                </Box>
                
                {collection.tags && collection.tags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Tags</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {collection.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
            
            {collection.permissions && collection.permissions.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Shared With
                </Typography>
                
                <Box>
                  {collection.permissions.map((permission, index) => (
                    <Box 
                      key={permission.userId} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 1,
                        borderBottom: index < collection.permissions!.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                      }}
                    >
                      <Typography>{permission.userId}</Typography>
                      <Chip 
                        label={permission.role} 
                        size="small" 
                        color={
                          permission.role === 'admin' 
                            ? 'primary' 
                            : permission.role === 'editor' 
                              ? 'secondary' 
                              : 'default'
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditDialogOpen}
              >
                Edit Collection
              </Button>
            </Box>
          </Paper>
        </TabPanel>
        
        {/* Collection action menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditDialogOpen}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Collection
          </MenuItem>
          <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Collection
          </MenuItem>
        </Menu>
        
        {/* Edit Collection Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <TextField
                label="Collection Name"
                required
                fullWidth
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                margin="normal"
              />
              
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Collection Type</InputLabel>
                <Select
                  value={formType}
                  label="Collection Type"
                  onChange={(e) => setFormType(e.target.value as CollectionType)}
                >
                  <MenuItem value={CollectionType.PERSONAL}>Personal</MenuItem>
                  <MenuItem value={CollectionType.PROJECT}>Project</MenuItem>
                  <MenuItem value={CollectionType.CURATED}>Curated</MenuItem>
                  <MenuItem value={CollectionType.PUBLIC}>Public</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={formVisibility}
                  label="Visibility"
                  onChange={(e) => setFormVisibility(e.target.value as CollectionVisibility)}
                >
                  <MenuItem value={CollectionVisibility.PRIVATE}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LockIcon fontSize="small" sx={{ mr: 1 }} /> 
                      Private (Only you)
                    </Box>
                  </MenuItem>
                  <MenuItem value={CollectionVisibility.SHARED}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GroupIcon fontSize="small" sx={{ mr: 1 }} /> 
                      Shared (You and selected users)
                    </Box>
                  </MenuItem>
                  <MenuItem value={CollectionVisibility.PUBLIC}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PublicIcon fontSize="small" sx={{ mr: 1 }} /> 
                      Public (Everyone)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    placeholder="Add tags..."
                    variant="outlined"
                    size="small"
                    value={formTagInput}
                    onChange={(e) => setFormTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    fullWidth
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddTag} 
                    disabled={!formTagInput}
                    sx={{ ml: 1, whiteSpace: 'nowrap' }}
                  >
                    Add Tag
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {formTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateCollection} 
              variant="contained"
              disabled={!formName.trim()}
            >
              Update Collection
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Collection Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Collection</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the collection "{collection.name}"?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteCollection} 
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Share Collection Dialog */}
        <Dialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Share Collection</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography gutterBottom>
                Share this collection with others:
              </Typography>
              
              <TextField
                label="Collection URL"
                fullWidth
                value={`https://example.com/collections/${collection.id}`}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={collection.visibility}
                    label="Visibility"
                    onChange={(e) => {
                      const updatedCollection = { ...collection, visibility: e.target.value as CollectionVisibility };
                      setCollection(updatedCollection);
                    }}
                  >
                    <MenuItem value={CollectionVisibility.PRIVATE}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LockIcon fontSize="small" sx={{ mr: 1 }} /> 
                        Private (Only you)
                      </Box>
                    </MenuItem>
                    <MenuItem value={CollectionVisibility.SHARED}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon fontSize="small" sx={{ mr: 1 }} /> 
                        Shared (You and selected users)
                      </Box>
                    </MenuItem>
                    <MenuItem value={CollectionVisibility.PUBLIC}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PublicIcon fontSize="small" sx={{ mr: 1 }} /> 
                        Public (Everyone)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              {collection.visibility === CollectionVisibility.SHARED && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Invite Users
                  </Typography>
                  <TextField
                    label="Email or User ID"
                    fullWidth
                    margin="normal"
                    placeholder="Enter email or user ID to invite"
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleShareCollection} 
              variant="contained"
              startIcon={<ShareIcon />}
            >
              Share
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};


export default CollectionDetailPage;