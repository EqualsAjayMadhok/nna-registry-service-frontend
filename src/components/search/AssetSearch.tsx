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
  Collapse
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { Asset, AssetSearchParams } from '../../types/asset.types';
import { PaginatedResponse } from '../../types/api.types';
import AssetService from '../../services/api/asset.service';
import taxonomyService from '../../api/taxonomyService';
import AssetCard from './AssetCard';

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
      const response: PaginatedResponse<Asset> = await AssetService.getAssets(searchParams);
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
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search params
    const newParams: AssetSearchParams = {
      ...searchParams,
      query: query || undefined,
      layer: selectedLayer || undefined,
      category: selectedCategory || undefined,
      subcategory: selectedSubcategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      page: 1 // Reset to first page on new search
    };
    
    setSearchParams(newParams);
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
  
  return (
    <Box>
      {/* Search Form */}
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
                  {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
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
          
          {/* Advanced Filters */}
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
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Results Count */}
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