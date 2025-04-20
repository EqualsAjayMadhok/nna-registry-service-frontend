import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Pagination,
  Menu,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  SelectChangeEvent,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  ListAlt as ListIcon,
  GridView as GridIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Group as GroupIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import collectionService from '../../api/collectionService';
import {
  Collection,
  CollectionType,
  CollectionVisibility,
  CollectionCreateRequest,
  CollectionUpdateRequest,
  CollectionSearchParams
} from '../../types/asset.types';

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

const CollectionsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for collections
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCollections, setTotalCollections] = useState(0);
  const itemsPerPage = 12;
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Collection action state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<CollectionType>(CollectionType.PERSONAL);
  const [formVisibility, setFormVisibility] = useState<CollectionVisibility>(CollectionVisibility.PRIVATE);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState('');
  
  // Filter state
  const [searchParams, setSearchParams] = useState<CollectionSearchParams>({
    page: 1,
    limit: itemsPerPage
  });
  const [filterQuery, setFilterQuery] = useState('');
  const [filterType, setFilterType] = useState<CollectionType | ''>('');
  const [filterVisibility, setFilterVisibility] = useState<CollectionVisibility | ''>('');
  const [filterFeatured, setFilterFeatured] = useState<boolean | undefined>(undefined);
  
  // Load collections when search params change
  useEffect(() => {
    fetchCollections();
  }, [searchParams]);
  
  // Fetch collections based on current search params
  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await collectionService.getCollections(searchParams);
      setCollections(response.items);
      setFilteredCollections(response.items);
      setTotalPages(response.totalPages);
      setTotalCollections(response.total);
      setPage(response.page);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to fetch collections');
      setCollections([]);
      setFilteredCollections([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    let newParams: CollectionSearchParams = {
      ...searchParams,
      page: 1
    };
    
    // Filter by collection type based on tab
    switch (newValue) {
      case 0: // All collections
        delete newParams.type;
        break;
      case 1: // Personal collections
        newParams.type = CollectionType.PERSONAL;
        break;
      case 2: // Project collections
        newParams.type = CollectionType.PROJECT;
        break;
      case 3: // Public collections
        newParams.visibility = CollectionVisibility.PUBLIC;
        break;
      case 4: // Featured collections
        newParams.featured = true;
        break;
    }
    
    setSearchParams(newParams);
  };
  
  // Handle page change in pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({
      ...searchParams,
      page: value
    });
  };
  
  // Open collection menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, collection: Collection) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCollection(collection);
  };
  
  // Close collection menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Open create collection dialog
  const handleCreateDialogOpen = () => {
    // Reset form values
    setFormName('');
    setFormDescription('');
    setFormType(CollectionType.PERSONAL);
    setFormVisibility(CollectionVisibility.PRIVATE);
    setFormTags([]);
    setFormTagInput('');
    
    setCreateDialogOpen(true);
  };
  
  // Open edit collection dialog
  const handleEditDialogOpen = (collection: Collection) => {
    setSelectedCollection(collection);
    
    // Set form values
    setFormName(collection.name);
    setFormDescription(collection.description || '');
    setFormType(collection.type);
    setFormVisibility(collection.visibility);
    setFormTags(collection.tags || []);
    setFormTagInput('');
    
    setEditDialogOpen(true);
    handleMenuClose();
  };
  
  // Open delete collection dialog
  const handleDeleteDialogOpen = (collection: Collection) => {
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Navigate to collection detail page
  const handleViewCollection = (collection: Collection) => {
    navigate(`/collections/${collection.id}`);
  };
  
  // Create a new collection
  const handleCreateCollection = async () => {
    try {
      const newCollection: CollectionCreateRequest = {
        name: formName,
        description: formDescription,
        type: formType,
        visibility: formVisibility,
        tags: formTags.length > 0 ? formTags : undefined
      };
      
      await collectionService.createCollection(newCollection);
      setCreateDialogOpen(false);
      
      // Refresh collections
      fetchCollections();
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection');
    }
  };
  
  // Update an existing collection
  const handleUpdateCollection = async () => {
    if (!selectedCollection) return;
    
    try {
      const updates: CollectionUpdateRequest = {
        name: formName,
        description: formDescription,
        type: formType,
        visibility: formVisibility,
        tags: formTags.length > 0 ? formTags : undefined
      };
      
      await collectionService.updateCollection(selectedCollection.id, updates);
      setEditDialogOpen(false);
      
      // Refresh collections
      fetchCollections();
    } catch (err) {
      console.error('Error updating collection:', err);
      setError('Failed to update collection');
    }
  };
  
  // Delete a collection
  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;
    
    try {
      await collectionService.deleteCollection(selectedCollection.id);
      setDeleteDialogOpen(false);
      
      // Refresh collections
      fetchCollections();
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection');
    }
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
  
  // Apply filters
  const handleApplyFilters = () => {
    const newParams: CollectionSearchParams = {
      ...searchParams,
      page: 1
    };
    
    if (filterQuery) {
      newParams.query = filterQuery;
    } else {
      delete newParams.query;
    }
    
    if (filterType) {
      newParams.type = filterType;
    } else {
      delete newParams.type;
    }
    
    if (filterVisibility) {
      newParams.visibility = filterVisibility;
    } else {
      delete newParams.visibility;
    }
    
    if (filterFeatured !== undefined) {
      newParams.featured = filterFeatured;
    } else {
      delete newParams.featured;
    }
    
    setSearchParams(newParams);
    setShowFilters(false);
  };
  
  // Clear filters
  const handleClearFilters = () => {
    setFilterQuery('');
    setFilterType('');
    setFilterVisibility('');
    setFilterFeatured(undefined);
    
    const newParams: CollectionSearchParams = {
      page: 1,
      limit: itemsPerPage
    };
    
    if (tabValue !== 0) {
      // Preserve tab-specific filters
      switch (tabValue) {
        case 1:
          newParams.type = CollectionType.PERSONAL;
          break;
        case 2:
          newParams.type = CollectionType.PROJECT;
          break;
        case 3:
          newParams.visibility = CollectionVisibility.PUBLIC;
          break;
        case 4:
          newParams.featured = true;
          break;
      }
    }
    
    setSearchParams(newParams);
    setShowFilters(false);
  };
  
  // Collection visibility icon
  const getVisibilityIcon = (visibility: CollectionVisibility) => {
    switch (visibility) {
      case CollectionVisibility.PUBLIC:
        return <PublicIcon fontSize="small" />;
      case CollectionVisibility.PRIVATE:
        return <LockIcon fontSize="small" />;
      case CollectionVisibility.SHARED:
        return <GroupIcon fontSize="small" />;
      default:
        return <VisibilityIcon fontSize="small" />;
    }
  };
  
  // Render collections grid view
  const renderCollectionsGrid = () => {
    return (
      <Grid container spacing={3}>
        {filteredCollections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={collection.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                },
                ...(collection.featured && {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2
                })
              }}
              onClick={() => handleViewCollection(collection)}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={collection.coverImageUrl || `https://picsum.photos/seed/${collection.id}/400/300`}
                  alt={collection.name}
                />
                
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                  <Chip 
                    size="small" 
                    label={collection.type} 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.9)', 
                      fontSize: '0.7rem' 
                    }} 
                  />
                  {collection.featured && (
                    <Chip 
                      size="small" 
                      icon={<StarIcon fontSize="small" />}
                      label="Featured" 
                      color="primary"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.9)', 
                        fontSize: '0.7rem' 
                      }} 
                    />
                  )}
                </Box>
                
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, collection);
                  }}
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    left: 8, 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,1)'
                    }
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" component="div" noWrap sx={{ flexGrow: 1 }}>
                    {collection.name}
                  </Typography>
                  <Tooltip title={
                    collection.visibility === CollectionVisibility.PUBLIC 
                      ? 'Public' 
                      : collection.visibility === CollectionVisibility.PRIVATE 
                        ? 'Private' 
                        : 'Shared'
                  } arrow>
                    <Box>{getVisibilityIcon(collection.visibility)}</Box>
                  </Tooltip>
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2, 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '40px'
                  }}
                >
                  {collection.description || 'No description provided'}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {collection.assetCount} {collection.assetCount === 1 ? 'asset' : 'assets'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(collection.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
                
                {collection.tags && collection.tags.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {collection.tags.slice(0, 3).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    ))}
                    {collection.tags.length > 3 && (
                      <Chip 
                        label={`+${collection.tags.length - 3}`} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  // Render collections list view
  const renderCollectionsList = () => {
    return (
      <Box>
        {filteredCollections.map((collection) => (
          <Paper
            key={collection.id}
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateX(4px)',
                boxShadow: 1
              },
              ...(collection.featured && {
                borderColor: theme.palette.primary.main,
                borderWidth: 2
              })
            }}
            onClick={() => handleViewCollection(collection)}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1,
                overflow: 'hidden',
                mr: 2,
                flexShrink: 0
              }}
            >
              <img
                src={collection.coverImageUrl || `https://picsum.photos/seed/${collection.id}/80/80`}
                alt={collection.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle1" component="div" noWrap sx={{ flexGrow: 1 }}>
                  {collection.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getVisibilityIcon(collection.visibility)}
                  {collection.featured && <StarIcon fontSize="small" color="primary" />}
                </Box>
              </Box>
              
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
              >
                {collection.description || 'No description provided'}
              </Typography>
              
              <Box sx={{ display: 'flex', mt: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label={collection.type}
                    sx={{ mr: 1, fontSize: '0.7rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {collection.assetCount} {collection.assetCount === 1 ? 'asset' : 'assets'}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Updated {new Date(collection.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, collection);
              }}
            >
              <MoreIcon />
            </IconButton>
          </Paper>
        ))}
      </Box>
    );
  };
  
  // Count collections by type for the header
  const countByType = {
    personal: collections.filter(c => c.type === CollectionType.PERSONAL).length,
    project: collections.filter(c => c.type === CollectionType.PROJECT).length,
    public: collections.filter(c => c.visibility === CollectionVisibility.PUBLIC).length,
    featured: collections.filter(c => c.featured).length
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Collections
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Organize and discover assets in curated collections.
            </Typography>
          </Box>
          
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateDialogOpen}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Create Collection
            </Button>
          </Box>
        </Box>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Tabs */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="collection tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : undefined}
          >
            <Tab label={`All (${totalCollections})`} id="collection-tab-0" />
            <Tab label={`Personal (${countByType.personal})`} id="collection-tab-1" />
            <Tab label={`Projects (${countByType.project})`} id="collection-tab-2" />
            <Tab label={`Public (${countByType.public})`} id="collection-tab-3" />
            <Tab label={`Featured (${countByType.featured})`} id="collection-tab-4" />
          </Tabs>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small" 
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            >
              <GridIcon />
            </IconButton>
            <IconButton 
              size="small" 
              color={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            >
              <ListIcon />
            </IconButton>
            <IconButton 
              size="small" 
              color={showFilters ? 'primary' : 'default'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Filters */}
        {showFilters && (
          <Paper sx={{ p: 2, mt: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Search"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    label="Type"
                    onChange={(e) => setFilterType(e.target.value as CollectionType | '')}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value={CollectionType.PERSONAL}>Personal</MenuItem>
                    <MenuItem value={CollectionType.PROJECT}>Project</MenuItem>
                    <MenuItem value={CollectionType.CURATED}>Curated</MenuItem>
                    <MenuItem value={CollectionType.FEATURED}>Featured</MenuItem>
                    <MenuItem value={CollectionType.PUBLIC}>Public</MenuItem>
                    <MenuItem value={CollectionType.SYSTEM}>System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={filterVisibility}
                    label="Visibility"
                    onChange={(e) => setFilterVisibility(e.target.value as CollectionVisibility | '')}
                  >
                    <MenuItem value="">All Visibilities</MenuItem>
                    <MenuItem value={CollectionVisibility.PUBLIC}>Public</MenuItem>
                    <MenuItem value={CollectionVisibility.PRIVATE}>Private</MenuItem>
                    <MenuItem value={CollectionVisibility.SHARED}>Shared</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filterFeatured === true}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterFeatured(true);
                        } else if (filterFeatured === true) {
                          setFilterFeatured(undefined);
                        } else {
                          setFilterFeatured(true);
                        }
                      }}
                    />
                  }
                  label="Featured Only"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </Box>
          </Paper>
        )}
        
        {/* Loading indicator */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab panels */}
            <TabPanel value={tabValue} index={0}>
              {filteredCollections.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No collections found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchParams.query ? 'Try different search terms or filters' : 'Create your first collection to get started'}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateDialogOpen}
                    sx={{ mt: 2 }}
                  >
                    Create Collection
                  </Button>
                </Box>
              ) : (
                viewMode === 'grid' ? renderCollectionsGrid() : renderCollectionsList()
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {filteredCollections.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No personal collections found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a personal collection to organize your favorite assets
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateDialogOpen}
                    sx={{ mt: 2 }}
                  >
                    Create Personal Collection
                  </Button>
                </Box>
              ) : (
                viewMode === 'grid' ? renderCollectionsGrid() : renderCollectionsList()
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              {filteredCollections.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No project collections found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a project collection to organize assets for a specific project
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateDialogOpen}
                    sx={{ mt: 2 }}
                  >
                    Create Project Collection
                  </Button>
                </Box>
              ) : (
                viewMode === 'grid' ? renderCollectionsGrid() : renderCollectionsList()
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              {filteredCollections.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No public collections found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Make your collections public to share them with others
                  </Typography>
                </Box>
              ) : (
                viewMode === 'grid' ? renderCollectionsGrid() : renderCollectionsList()
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              {filteredCollections.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No featured collections found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Featured collections are curated by our team
                  </Typography>
                </Box>
              ) : (
                viewMode === 'grid' ? renderCollectionsGrid() : renderCollectionsList()
              )}
            </TabPanel>
            
            {/* Pagination */}
            {!loading && filteredCollections.length > 0 && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
        
        {/* Collection action menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleMenuClose();
            if (selectedCollection) {
              handleViewCollection(selectedCollection);
            }
          }}>
            <ListIcon fontSize="small" sx={{ mr: 1 }} /> View Details
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedCollection) {
              handleEditDialogOpen(selectedCollection);
            }
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Collection
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedCollection) {
              handleDeleteDialogOpen(selectedCollection);
            }
          }} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Collection
          </MenuItem>
        </Menu>
        
        {/* Create Collection Dialog */}
        <Dialog 
          open={createDialogOpen} 
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Collection</DialogTitle>
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
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateCollection} 
              variant="contained"
              disabled={!formName.trim()}
            >
              Create Collection
            </Button>
          </DialogActions>
        </Dialog>
        
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
              Are you sure you want to delete the collection "{selectedCollection?.name}"?
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
      </Box>
    </Container>
  );
};

export default CollectionsPage;