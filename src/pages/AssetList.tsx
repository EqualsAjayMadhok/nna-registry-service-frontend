import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  FormatListNumbered as OrganizeIcon,
  BarChart as AnalyticsIcon,
} from '@mui/icons-material';
import AssetService from '../services/api/asset.service';
import { Asset, AssetSearchParams } from '../types/asset.types';
import { PaginatedResponse } from '../types/api.types';

interface PaginationState {
  page: number;
  totalPages: number;
  hasMore: boolean;
}

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<AssetSearchParams>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    hasMore: false
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLayer, setSelectedLayer] = useState<string>('');

  const layerOptions = [
    { value: '', label: 'All Layers' },
    { value: 'song', label: 'Song' },
    { value: 'star', label: 'Star' },
    { value: 'look', label: 'Look' },
    { value: 'move', label: 'Move' },
    { value: 'world', label: 'World' },
  ];

  useEffect(() => {
    fetchAssets();
  }, [searchParams]);

  const fetchAssets = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await AssetService.getAssets({ ...searchParams, page });
      setAssets(response.items);
      setPagination({
        page: response.page,
        totalPages: Math.ceil(response.total / response.limit),
        hasMore: response.hasMore
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
      setError('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      ...searchParams,
      search: searchQuery,
      layer: selectedLayer,
      page: 1, // Reset to first page when search changes
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams({
      ...searchParams,
      page,
    });
  };

  const handleLayerChange = (event: SelectChangeEvent<string>) => {
    setSelectedLayer(event.target.value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>
            Assets
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              component={Link}
              to="/assets/analytics"
            >
              Analytics
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              component={Link}
              to="/assets/batch"
            >
              Batch Upload
            </Button>
            <Button
              variant="outlined"
              startIcon={<OrganizeIcon />}
              component={Link}
              to="/assets/organize"
            >
              Organize
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/assets/new">
              New Asset
            </Button>
          </Box>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Browse and manage digital assets
        </Typography>
      </Box>

      {/* Search Form */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search assets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="layer-select-label">Layer</InputLabel>
              <Select
                labelId="layer-select-label"
                id="layer-select"
                value={selectedLayer}
                label="Layer"
                onChange={handleLayerChange}
              >
                {layerOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button fullWidth variant="outlined" type="submit">
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Assets Grid */}
      {!loading && assets.length === 0 ? (
        <Box textAlign="center" my={6}>
          <Typography variant="h6" color="text.secondary">
            No assets found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {assets.map(asset => (
            <Grid item xs={12} sm={6} md={4} key={asset.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography sx={{ wordBreak: 'break-word' }} variant="h6" component="div">
                    {asset.name}
                  </Typography>
                  <Chip
                    label={asset.layer}
                    size="small"
                    sx={{ mb: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    NNA: {asset.nna_address}
                  </Typography>
                  <Typography variant="body2">{asset.description || 'No description'}</Typography>
                  {asset.tags && asset.tags.length > 0 && (
                    <Box mt={1}>
                      {asset.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to={`/assets/${asset.name}`}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!loading && assets.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.totalPages}
            page={searchParams.page || 1}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default AssetList;
