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
  
  CircularProgress
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import useTaxonomy from '../../hooks/useTaxonomy';

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

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Asset Taxonomy
      </Typography>
      
      <Box mt={2}>
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

        {selectedLayer && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
              disabled={categories.length === 0}
            >
              <MenuItem value="">
                <em>Select a category</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.code} value={category.code}>
                  {category.name} ({category.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedLayer && selectedCategory && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
            <Select
              labelId="subcategory-select-label"
              id="subcategory-select"
              value={selectedSubcategory}
              label="Subcategory"
              onChange={handleSubcategoryChange}
              disabled={subcategories.length === 0}
            >
              <MenuItem value="">
                <em>Select a subcategory</em>
              </MenuItem>
              {subcategories.map((subcategory) => (
                <MenuItem key={subcategory.code} value={subcategory.code}>
                  {subcategory.name} ({subcategory.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedLayer && (
          <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Selected Taxonomy:
            </Typography>
            <Typography>
              {getTaxonomyPath() || 'Complete your selection'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TaxonomySelector;