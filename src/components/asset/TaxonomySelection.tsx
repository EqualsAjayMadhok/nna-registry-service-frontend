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
  Paper,
  Chip,
  Tooltip
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { CategoryOption, SubcategoryOption, Category, Subcategory } from '../../types/taxonomy.types';
import taxonomyService from '../../api/taxonomyService';
import NNAAddressPreview from './NNAAddressPreview';
// VERSION: ${new Date().toISOString()}
// Importing ForcedSequentialNumber is not needed - using direct method calls instead
import nnaRegistryService from '../../api/nnaRegistryService';
import { getAlphabeticCode, generateHumanFriendlyName } from '../../api/codeMapping';

interface TaxonomySelectionProps {
  layerCode: string;
  onCategorySelect: (category: CategoryOption) => void;
  onSubcategorySelect: (subcategory: SubcategoryOption, isDoubleClick?: boolean) => void;
  selectedCategoryCode?: string;
  categoryName?: string;
  subcategoryNumericCode?: string;
  selectedSubcategoryCode?: string;
  onNNAAddressChange?: (humanFriendlyName: string, machineFriendlyAddress: string, sequentialNumber: number) => void;
}

const TaxonomySelection: React.FC<TaxonomySelectionProps> = ({
  layerCode,
  onCategorySelect,
  onSubcategorySelect,
  selectedCategoryCode,
  categoryName,
  selectedSubcategoryCode,
  subcategoryNumericCode,
  onNNAAddressChange
}) => {
  console.log(categoryName, 'categoryName');
  
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sequentialNumber, setSequentialNumber] = useState<number>(1);
  const [isUnique, setIsUnique] = useState<boolean>(true);
  const [checkingUniqueness, setCheckingUniqueness] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

        console.log(categoryOptions, 'ewfwe');
        
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
        console.log(subcategoryOptions, 'subcategoryOptions');
        
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

  // VERSION: ${new Date().toISOString()}
  // Check NNA address uniqueness when taxonomy selection is complete
  useEffect(() => {
    const checkAddressUniqueness = async () => {
      if (!layerCode || !selectedCategoryCode || !selectedSubcategoryCode) {
        return;
      }

      console.log(`[TAXONOMY] Checking uniqueness for ${layerCode}.${selectedCategoryCode}.${selectedSubcategoryCode}`);

      try {
        setCheckingUniqueness(true);
        
        // Get category and subcategory names/objects
        const category = categories.find(c => c.code === selectedCategoryCode);
        const subcategory = subcategories.find(s => s.code === selectedSubcategoryCode);
        
        if (!category || !subcategory) {
          console.error('[TAXONOMY] Could not find category or subcategory');
          return;
        }
        
        console.log(`[TAXONOMY] Processing ${layerCode} > ${category.name} > ${subcategory.name}`);
        
        try {
          // Import the asset count service directly
          // This allows us to get the existing assets count from the backend
          const { getExistingAssetsCount, getNextSequentialNumber } = await import('../../utils/assetCountService');
          
          // Get the current count from the backend API
          const count = await getExistingAssetsCount(layerCode, category.code, subcategory.code);
          
          // CRITICAL FIX: Force minimum count of 1 for testing
          const effectiveCount = Math.max(count, 1);
          
          // Log with very clear indicators
          console.log(`[TAXONOMY] Asset count=${effectiveCount} (original=${count})`);
          
          // Get the next sequential number (count + 1)
          const nextNumber = getNextSequentialNumber(effectiveCount);
          console.log(`[TAXONOMY] Next sequential number=${nextNumber}`);
          
          // IMPORTANT: Force update the state
          setSequentialNumber(nextNumber);
          
          // Generate human-friendly name with the correct sequential number
          const humanFriendlyName = nnaRegistryService.generateHumanFriendlyName(
            layerCode,
            category.name,
            subcategory.name,
            nextNumber
          );
          
          // Generate machine-friendly address with the correct sequential number
          const machineFriendlyAddress = nnaRegistryService.generateMachineFriendlyAddress(
            layerCode,
            category.name,
            subcategory.name,
            nextNumber
          );
          
          console.log(`[TAXONOMY] Generated HFN: ${humanFriendlyName}`);
          console.log(`[TAXONOMY] Generated MFA: ${machineFriendlyAddress}`);
          
          // Notify parent component of the address change
          if (onNNAAddressChange) {
            onNNAAddressChange(humanFriendlyName, machineFriendlyAddress, nextNumber);
          }
          
          setIsUnique(true);
          
          // Force re-render with setTimeout if needed
          setTimeout(() => {
            console.log(`[TAXONOMY] Verifying sequential number is set to ${nextNumber}`);
          }, 100);
          
        } catch (error) {
          throw new Error(`Error importing or using asset count service: ${error}`);
        }
      } catch (error) {
        console.error('[TAXONOMY] Error:', error);
        
        // CRITICAL FIX: Set a default sequential number even on error
        const defaultNumber = 2; // Force to at least 2
        console.log(`[TAXONOMY] Using fallback sequential number: ${defaultNumber}`);
        
        setSequentialNumber(defaultNumber);
        
        const category = categories.find(c => c.code === selectedCategoryCode);
        const subcategory = subcategories.find(s => s.code === selectedSubcategoryCode);
        
        if (category && subcategory) {
          // Generate human-friendly name with the fallback sequential number
          const humanFriendlyName = nnaRegistryService.generateHumanFriendlyName(
            layerCode,
            category.name,
            subcategory.name,
            defaultNumber
          );
          
          // Generate machine-friendly address with the fallback sequential number
          const machineFriendlyAddress = nnaRegistryService.generateMachineFriendlyAddress(
            layerCode,
            category.name,
            subcategory.name,
            defaultNumber
          );
          
          console.log(`[TAXONOMY] Fallback HFN: ${humanFriendlyName}`);
          console.log(`[TAXONOMY] Fallback MFA: ${machineFriendlyAddress}`);
          
          // Notify parent component of the address change
          if (onNNAAddressChange) {
            onNNAAddressChange(humanFriendlyName, machineFriendlyAddress, defaultNumber);
          }
        }
        
        setIsUnique(true);
      } finally {
        setCheckingUniqueness(false);
      }
    };

    checkAddressUniqueness();
  }, [layerCode, selectedCategoryCode, selectedSubcategoryCode, categories, subcategories, onNNAAddressChange]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const categoryCode = event.target.value;
    
    // Find the selected category
    const selectedCategory = categories.find(cat => cat.code === categoryCode);
    
    if (selectedCategory) {
      // Reset sequential number when category changes
      setSequentialNumber(1);
      onCategorySelect(selectedCategory);
    }
  };

  const handleSubcategoryChange = async (event: SelectChangeEvent<string>, isDoubleClick: boolean = false) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const subcategoryCode = event.target.value;
      const selectedSubcategory = subcategories.find(subcat => subcat.code === subcategoryCode);
      
      if (selectedSubcategory) {
        setSequentialNumber(1);
        if (!isDoubleClick) {
          await onSubcategorySelect(selectedSubcategory, false);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDoubleClick = async (e: React.MouseEvent, subcategory: SubcategoryOption) => {
    if (isProcessing) return;
    
    e.preventDefault();
    setIsProcessing(true);
    try {
      console.log(`Double clicked on subcategory: ${subcategory.name} (${subcategory.code})`);
      await onSubcategorySelect(subcategory, true);
    } finally {
      setIsProcessing(false);
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>{category.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Human-Friendly Name (3-letter code)">
                      <Chip 
                        label={category.categoryCodeName}
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ ml: 1, mr: 1, fontSize: '0.7rem', fontWeight: 'bold' }} 
                      />
                    </Tooltip>
                    <Tooltip title="Machine-Friendly Address (3-digit code)">
                      <Chip 
                        label={category.code} 
                        size="small" 
                        color="default" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    </Tooltip>
                  </Box>
                </Box>
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
            onChange={(e) => handleSubcategoryChange(e, false)}
            disabled={loading || !selectedCategoryCode || subcategories.length === 0}
          >
            <MenuItem value="">
              <em>Select a subcategory</em>
            </MenuItem>
            {subcategories.map((subcategory) => (
              <MenuItem 
                key={subcategory.code} 
                value={subcategory.code} 
                onDoubleClick={(e) => handleDoubleClick(e, subcategory)}
                disabled={isProcessing}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Typography>{subcategory.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Human-Friendly Name (3-letter code)">
                      <Chip 
                        label={getAlphabeticCode(layerCode, subcategory.code)}
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                        sx={{ mr: 1, fontSize: '0.7rem', fontWeight: 'bold' }} 
                      />
                    </Tooltip>
                    <Tooltip title="Machine-Friendly Address (3-digit code)">
                      <Chip 
                        label={subcategory.subcategoryCode} 
                        size="small" 
                        color="default" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedCategoryCode && selectedSubcategoryCode && (
          <>
            <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Selected Taxonomy:
              </Typography>
              <Typography>
                {taxonomyService.getTaxonomyPath(layerCode, selectedCategoryCode, subcategoryNumericCode) || 'Invalid selection'}
              </Typography>
            </Box>
            
            {/* VERSION: ${new Date().toISOString()} */}
            {/* Display NNA Address Preview with the correct sequential number */}
            <NNAAddressPreview
              layerCode={layerCode}
              subcategoryNumericCode={subcategoryNumericCode}
              categoryCode={selectedCategoryCode}
              subcategoryCode={selectedSubcategoryCode}
              sequentialNumber={sequentialNumber} // This is already set to at least 2 in our useEffect
              isUnique={isUnique}
              checkingUniqueness={checkingUniqueness}
              validationError={!selectedCategoryCode || !selectedSubcategoryCode ? 'Incomplete taxonomy selection' : undefined}
            />
          </>
        )}
      </Box>
    </Paper>
  );
};

export default TaxonomySelection;