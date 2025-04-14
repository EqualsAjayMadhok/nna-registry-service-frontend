import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Button
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';
import useTaxonomy from '../../hooks/useTaxonomy';
import { getAlphabeticCode } from '../../api/codeMapping';
import { layerConfig } from '../../api/layerConfig';

interface TaxonomySelectorProps {
  onSelectionChange?: (selection: {
    layer: string;
    category: string;
    subcategory: string;
    path: string | null;
  }) => void;
}

const TaxonomySelector: React.FC<TaxonomySelectorProps> = ({ onSelectionChange }) => {
  const {
    layers,
    categories,
    subcategories,
    selectedLayer,
    selectedCategory,
    selectedSubcategory,
    loading,
    error,
    selectLayer,
    selectCategory,
    selectSubcategory,
    getTaxonomyPath
  } = useTaxonomy();

  const handleLayerChange = (event: SelectChangeEvent<string>) => {
    const layerCode = event.target.value;
    selectLayer(layerCode);
    
    if (onSelectionChange) {
      onSelectionChange({
        layer: layerCode,
        category: '',
        subcategory: '',
        path: null
      });
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const categoryCode = event.target.value;
    selectCategory(categoryCode);
    
    if (onSelectionChange) {
      onSelectionChange({
        layer: selectedLayer,
        category: categoryCode,
        subcategory: '',
        path: getTaxonomyPath()
      });
    }
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string>) => {
    const subcategoryCode = event.target.value;
    selectSubcategory(subcategoryCode);
    
    if (onSelectionChange) {
      onSelectionChange({
        layer: selectedLayer,
        category: selectedCategory,
        subcategory: subcategoryCode,
        path: getTaxonomyPath()
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
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

  // Find current layer index
  const currentLayerIndex = layers.findIndex(l => l.code === selectedLayer);
  const prevLayer = layers[currentLayerIndex - 1];
  const nextLayer = layers[currentLayerIndex + 1];

  // Function to navigate between layers
  const navigateLayer = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && prevLayer) {
      selectLayer(prevLayer.code);
    } else if (direction === 'next' && nextLayer) {
      selectLayer(nextLayer.code);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Asset Taxonomy Browser
      </Typography>
      
      <Box mt={2}>
        {/* Layer Navigation with Arrows */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3, 
          p: 2, 
          borderRadius: 1, 
          bgcolor: 'background.default' 
        }}>
          <IconButton 
            onClick={() => navigateLayer('prev')} 
            disabled={!prevLayer}
            size="large"
          >
            <PrevIcon />
          </IconButton>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {layers.find(l => l.code === selectedLayer)?.name || 'Select a Layer'}
            </Typography>
            <Chip 
              label={selectedLayer || 'Layer Code'} 
              color="primary" 
              sx={{ mt: 1 }}
            />
          </Box>
          
          <IconButton 
            onClick={() => navigateLayer('next')} 
            disabled={!nextLayer}
            size="large"
          >
            <NextIcon />
          </IconButton>
        </Box>
        
        {/* Layer Dropdown - Hide this in the enhanced view but keep for backup */}
        <Box sx={{ display: 'none' }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="layer-select-label">Layer</InputLabel>
            <Select
              labelId="layer-select-label"
              id="layer-select"
              value={selectedLayer}
              label="Layer"
              onChange={handleLayerChange}
            >
              <MenuItem value="">
                <em>Select a layer</em>
              </MenuItem>
              {layers.map((layer) => (
                <MenuItem key={layer.code} value={layer.code}>
                  {layer.name} ({layer.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Layer Cards */}
        {!selectedLayer && (
          <Grid container spacing={2}>
            {layers.map((layer) => (
              <Grid item xs={12} sm={6} md={4} key={layer.code}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                  onClick={() => selectLayer(layer.code)}
                >
                  <CardContent>
                    <Typography variant="h6">{layer.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        label={layer.code} 
                        color="primary" 
                        size="small" 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {layerConfig[layer.code]?.description || `${layer.name} layer`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Category Table */}
        {selectedLayer && categories.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Categories
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>Category Name</TableCell>
                    <TableCell><strong style={{color: 'red'}}>Human-Friendly Name (HFN)</strong></TableCell>
                    <TableCell><strong style={{color: 'blue'}}>Machine-Friendly Address (MFA)</strong></TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow 
                      key={category.code}
                      selected={category.code === selectedCategory}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&.Mui-selected': {
                          bgcolor: 'primary.lighter'
                        }
                      }}
                      onClick={() => selectCategory(category.code)}
                    >
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getAlphabeticCode(selectedLayer, category.code)}
                          size="small" 
                          color="primary" 
                          variant={category.code === selectedCategory ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Machine-Friendly Address Code">
                          <Chip 
                            label={category.code}
                            size="small" 
                            color="default" 
                            variant={category.code === selectedCategory ? 'filled' : 'outlined'}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          variant={category.code === selectedCategory ? 'contained' : 'outlined'}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectCategory(category.code);
                          }}
                        >
                          {category.code === selectedCategory ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Subcategory Table */}
        {selectedLayer && selectedCategory && subcategories.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Subcategories
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>Subcategory Name</TableCell>
                    <TableCell><strong style={{color: 'red'}}>Human-Friendly Name (HFN)</strong></TableCell>
                    <TableCell><strong style={{color: 'blue'}}>Machine-Friendly Address (MFA)</strong></TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subcategories.map((subcategory) => (
                    <TableRow 
                      key={subcategory.code}
                      selected={subcategory.code === selectedSubcategory}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&.Mui-selected': {
                          bgcolor: 'primary.lighter'
                        }
                      }}
                      onClick={() => selectSubcategory(subcategory.code)}
                    >
                      <TableCell>{subcategory.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getAlphabeticCode(selectedLayer, selectedCategory, subcategory.code)} 
                          size="small" 
                          color="secondary" 
                          variant={subcategory.code === selectedSubcategory ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Machine-Friendly Address Code">
                          <Chip 
                            label={subcategory.code} 
                            size="small" 
                            color="default" 
                            variant={subcategory.code === selectedSubcategory ? 'filled' : 'outlined'}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          variant={subcategory.code === selectedSubcategory ? 'contained' : 'outlined'}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSubcategory(subcategory.code);
                          }}
                        >
                          {subcategory.code === selectedSubcategory ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Selected Path Display */}
        {selectedLayer && (
          <Box mt={3} p={2} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Selected Taxonomy Path:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {getTaxonomyPath() || 'Complete your selection'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TaxonomySelector;