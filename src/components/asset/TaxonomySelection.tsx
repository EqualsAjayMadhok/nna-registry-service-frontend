import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Paper
} from '@mui/material';
import { CategoryOption, SubcategoryOption } from '../../types/taxonomy.types';
import taxonomyService from '../../api/taxonomyService';

interface TaxonomySelectionProps {
  layerCode: string;
  onCategorySelect: (category: CategoryOption) => void;
  onSubcategorySelect: (subcategory: SubcategoryOption) => void;
  selectedCategoryCode?: string;
  selectedSubcategoryCode?: string;
}

const TaxonomySelection: React.FC<TaxonomySelectionProps> = ({
  layerCode,
  onCategorySelect,
  onSubcategorySelect,
  selectedCategoryCode,
  selectedSubcategoryCode
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories when layer changes
  useEffect(() => {
    const fetchCategories = async () => {
      if (!layerCode) {
        setCategories([]);
        return;
      }

      try {
        setLoading(true);
        const categoryOptions = taxonomyService.getCategories(layerCode);
        setCategories(categoryOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [layerCode]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!layerCode || !selectedCategoryCode) {
        setSubcategories([]);
        return;
      }

      try {
        setLoading(true);
        const subcategoryOptions = taxonomyService.getSubcategories(layerCode, selectedCategoryCode);
        setSubcategories(subcategoryOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [layerCode, selectedCategoryCode]);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    const categoryCode = event.target.value;
    
    // Find the selected category
    const selectedCategory = categories.find(cat => cat.code === categoryCode);
    
    if (selectedCategory) {
      onCategorySelect(selectedCategory);
    }
  };

  const handleSubcategoryChange = (event: SelectChangeEvent) => {
    const subcategoryCode = event.target.value;
    
    // Find the selected subcategory
    const selectedSubcategory = subcategories.find(subcat => subcat.code === subcategoryCode);
    
    if (selectedSubcategory) {
      onSubcategorySelect(selectedSubcategory);
    }
  };

  if (!layerCode) {
    return (
      <Alert severity="info">
        Please select a layer first
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select Category and Subcategory
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the appropriate category and subcategory for your asset based on the selected layer.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: 'relative' }}>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 16,
              marginTop: '-12px',
              zIndex: 1
            }}
          />
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCategoryCode || ''}
            label="Category"
            onChange={handleCategoryChange}
            disabled={loading || categories.length === 0}
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

        <FormControl fullWidth disabled={!selectedCategoryCode || subcategories.length === 0}>
          <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
          <Select
            labelId="subcategory-select-label"
            id="subcategory-select"
            value={selectedSubcategoryCode || ''}
            label="Subcategory"
            onChange={handleSubcategoryChange}
            disabled={loading || !selectedCategoryCode || subcategories.length === 0}
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

        {selectedCategoryCode && selectedSubcategoryCode && (
          <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Selected Taxonomy:
            </Typography>
            <Typography>
              {taxonomyService.getTaxonomyPath(layerCode, selectedCategoryCode, selectedSubcategoryCode) || 'Invalid selection'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TaxonomySelection;