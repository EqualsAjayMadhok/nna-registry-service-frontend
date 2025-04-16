import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  Pagination,
  Chip,
  Stack,
  IconButton,
  Collapse,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  useTheme
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterAlt as FilterAltIcon,
  TuneOutlined as TuneIcon
} from '@mui/icons-material';
import { Asset, AssetSearchParams } from '../../types/asset.types';
import { PaginatedResponse } from '../../types/api.types';
import AssetService from '../../services/api/asset.service';
import taxonomyService from '../../api/taxonomyService';
import AssetCard from './AssetCard';
import AdvancedFilters from './AdvancedFilters';

interface AssetSearchProps {
  onSelectAsset?: (asset: Asset) => void;
  showFilters?: boolean;
  initialParams?: AssetSearchParams;
}

const AssetSearch: React.FC<AssetSearchProps> = ({
  onSelectAsset,
  showFilters = true,
  initialParams = {}
}) => {
  const theme = useTheme();
  
  // Search mode state
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic');
  
  // Search state
  const [searchParams, setSearchParams] = useState<AssetSearchParams>({
    page: 1,
    limit: 12,
    ...initialParams
  });
  const [query, setQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Results state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Options for filters
  const layers = taxonomyService.getLayers();
  const categories = selectedLayer 
    ? taxonomyService.getCategories(selectedLayer) 
    : [];
  const subcategories = selectedLayer && selectedCategory 
    ? taxonomyService.getSubcategories(selectedLayer, selectedCategory) 
    : [];
  
  // Popular tags (would come from API in real implementation)
  const popularTags = [
    'trending', 'popular', 'new', 'vintage', 'electronic', 
    'jazz', 'rock', 'hip-hop', 'dance', 'ambient'
  ];
  
  // Load assets on mount and when search params change
  useEffect(() => {
    fetchAssets();
  }, [searchParams]);
  
  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use advancedSearch for complex queries, otherwise use getAssets
      let response: PaginatedResponse<Asset>;
      
      if (searchMode === 'advanced' || searchParams.searchGroup) {
        response = await AssetService.advancedSearch(searchParams);
      } else {
        response = await AssetService.getAssets(searchParams);
      }
      
      setAssets(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search form submission for basic search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search params
    const newParams: AssetSearchParams = {
      ...searchParams,
      search: query || undefined,
      layer: selectedLayer || undefined,
      category: selectedCategory || undefined,
      subcategory: selectedSubcategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      page: 1, // Reset to first page on new search
      
      // Clear advanced search params if in basic mode
      ...(searchMode === 'basic' && { searchGroup: undefined })
    };
    
    setSearchParams(newParams);
  };
  
  // Handle advanced search submission
  const handleAdvancedSearch = (params: AssetSearchParams) => {
    // Preserve pagination settings
    params.limit = searchParams.limit || 12;
    params.page = 1; // Reset to first page on new search
    
    setSearchParams(params);
  };
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams({
      ...searchParams,
      page
    });
  };
  
  // Handle filter changes
  const handleLayerChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedLayer(value);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };
  
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedCategory(value);
    setSelectedSubcategory('');
  };
  
  const handleSubcategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedSubcategory(event.target.value);
  };
  
  // Handle tag selection
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setQuery('');
    setSelectedLayer('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedTags([]);
    setSearchParams({
      page: 1,
      limit: searchParams.limit
    });
  };
  
  // Handle search mode change
  const handleSearchModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'basic' | 'advanced' | null
  ) => {
    if (newMode !== null) {
      setSearchMode(newMode);
      
      // Reset search parameters when switching modes
      if (newMode === 'advanced') {
        // When switching to advanced, initialize with any existing basic search params
        const advancedParams: AssetSearchParams = {
          page: 1,
          limit: searchParams.limit || 12,
          sortBy: 'createdAt',
          sortDirection: 'desc'
        };
        
        // Convert basic search to advanced if needed
        if (query || selectedLayer || selectedCategory || selectedSubcategory || selectedTags.length > 0) {
          const conditions = [];
          
          if (query) {
            conditions.push({
              field: 'name',
              type: 'text' as const,
              operator: 'contains' as const,
              value: query,
              label: 'Name'
            });
          }
          
          if (selectedLayer) {
            conditions.push({
              field: 'layer',
              type: 'select' as const,
              operator: 'equals' as const,
              value: selectedLayer,
              label: 'Layer'
            });
          }
          
          if (selectedCategory) {
            conditions.push({
              field: 'category',
              type: 'text' as const,
              operator: 'equals' as const,
              value: selectedCategory,
              label: 'Category'
            });
          }
          
          if (selectedSubcategory) {
            conditions.push({
              field: 'subcategory',
              type: 'text' as const,
              operator: 'equals' as const,
              value: selectedSubcategory,
              label: 'Subcategory'
            });
          }
          
          if (selectedTags.length > 0) {
            conditions.push({
              field: 'tags',
              type: 'tags' as const,
              operator: 'contains' as const,
              value: selectedTags.join(','),
              label: 'Tags'
            });
          }
          
          if (conditions.length > 0) {
            advancedParams.searchGroup = {
              operator: 'AND',
              conditions
            };
          }
        }
        
        setSearchParams(advancedParams);
      } else {
        // When switching to basic, extract simple conditions if possible
        const simpleParams: AssetSearchParams = {
          page: 1,
          limit: searchParams.limit || 12
        };
        
        let newQuery = '';
        let newLayer = '';
        let newCategory = '';
        let newSubcategory = '';
        let newTags: string[] = [];
        
        // Try to extract simple conditions from searchGroup
        if (searchParams.searchGroup && searchParams.searchGroup.operator === 'AND') {
          searchParams.searchGroup.conditions.forEach(condition => {
            if ('field' in condition) {
              if (condition.field === 'name' && condition.operator === 'contains') {
                newQuery = condition.value;
              } else if (condition.field === 'layer' && condition.operator === 'equals') {
                newLayer = condition.value;
              } else if (condition.field === 'category' && condition.operator === 'equals') {
                newCategory = condition.value;
              } else if (condition.field === 'subcategory' && condition.operator === 'equals') {
                newSubcategory = condition.value;
              } else if (condition.field === 'tags' && condition.operator === 'contains') {
                newTags = typeof condition.value === 'string' 
                  ? condition.value.split(',') 
                  : Array.isArray(condition.value) 
                    ? condition.value 
                    : [];
              }
            }
          });
        }
        
        setQuery(newQuery);
        setSelectedLayer(newLayer);
        setSelectedCategory(newCategory);
        setSelectedSubcategory(newSubcategory);
        setSelectedTags(newTags);
        setSearchParams(simpleParams);
      }
    }
  };
  
  return (
    <Box>
      {/* Search Mode Toggle */}
      {showFilters && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mb: 2 
          }}
        >
          <ToggleButtonGroup
            value={searchMode}
            exclusive
            onChange={handleSearchModeChange}
            aria-label="search mode"
            size="small"
          >
            <ToggleButton value="basic" aria-label="basic search">
              <SearchIcon sx={{ mr: 1 }} />
              Basic
            </ToggleButton>
            <ToggleButton value="advanced" aria-label="advanced search">
              <TuneIcon sx={{ mr: 1 }} />
              Advanced
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      
      {/* Basic Search Form */}
      {searchMode === 'basic' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={showFilters ? 6 : 9}>
                <TextField
                  fullWidth
                  placeholder="Search assets..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {showFilters && (
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="layer-select-label">Layer</InputLabel>
                    <Select
                      labelId="layer-select-label"
                      id="layer-select"
                      value={selectedLayer}
                      label="Layer"
                      onChange={handleLayerChange}
                    >
                      <MenuItem value="">All Layers</MenuItem>
                      {layers.map((layer) => (
                        <MenuItem key={layer.code} value={layer.code}>
                          {layer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12} sm={3}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit"
                  startIcon={<SearchIcon />}
                  disabled={loading}
                >
                  Search
                </Button>
              </Grid>
              
              {showFilters && (
                <Grid item xs={12} sm={9} textAlign="right">
                  <Button
                    color="primary"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  >
                    {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                  </Button>
                  
                  {(selectedLayer || selectedCategory || selectedSubcategory || selectedTags.length > 0) && (
                    <Button
                      color="error"
                      startIcon={<ClearIcon />}
                      onClick={handleClearFilters}
                      sx={{ ml: 1 }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Grid>
              )}
            </Grid>
            
            {/* Basic Advanced Filters */}
            {showFilters && (
              <Collapse in={showAdvancedFilters}>
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    {selectedLayer && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="category-select-label">Category</InputLabel>
                          <Select
                            labelId="category-select-label"
                            id="category-select"
                            value={selectedCategory}
                            label="Category"
                            onChange={handleCategoryChange}
                          >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((category) => (
                              <MenuItem key={category.code} value={category.code}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    
                    {selectedLayer && selectedCategory && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
                          <Select
                            labelId="subcategory-select-label"
                            id="subcategory-select"
                            value={selectedSubcategory}
                            label="Subcategory"
                            onChange={handleSubcategoryChange}
                          >
                            <MenuItem value="">All Subcategories</MenuItem>
                            {subcategories.map((subcategory) => (
                              <MenuItem key={subcategory.code} value={subcategory.code}>
                                {subcategory.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Popular Tags
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {popularTags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            clickable
                            color={selectedTags.includes(tag) ? 'primary' : 'default'}
                            onClick={() => handleTagClick(tag)}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Advanced Search Form */}
      {searchMode === 'advanced' && (
        <AdvancedFilters
          onSearch={handleAdvancedSearch}
          initialParams={searchParams}
          loading={loading}
        />
      )}
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Results Count and Per Page */}
      {!loading && !error && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1">
            {pagination.total} result{pagination.total !== 1 ? 's' : ''} found
          </Typography>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="per-page-label">Per Page</InputLabel>
            <Select
              labelId="per-page-label"
              id="per-page-select"
              value={searchParams.limit || 12}
              onChange={(e) => setSearchParams({
                ...searchParams,
                limit: Number(e.target.value),
                page: 1
              })}
              label="Per Page"
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {/* No Results */}
      {!loading && !error && assets.length === 0 && (
        <Box textAlign="center" my={6}>
          <Typography variant="h6" color="text.secondary">
            No assets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try modifying your search criteria
          </Typography>
        </Box>
      )}
      
      {/* Results Grid */}
      {!loading && !error && assets.length > 0 && (
        <Grid container spacing={3}>
          {assets.map((asset) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
              <AssetCard 
                asset={asset} 
                onClick={() => onSelectAsset && onSelectAsset(asset)} 
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default AssetSearch;