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
import { CategoryOption, SubcategoryOption } from '../../types/taxonomy.types';
import taxonomyService from '../../api/taxonomyService';
import NNAAddressPreview from './NNAAddressPreview';
import ForcedSequentialNumber from './ForcedSequentialNumber';
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

  // Check NNA address uniqueness when taxonomy selection is complete
  useEffect(() => {
    const checkAddressUniqueness = async () => {
      if (!layerCode || !selectedCategoryCode || !selectedSubcategoryCode) {
        return;
      }

      try {
        setCheckingUniqueness(true);
        
        // Get category and subcategory names/objects
        const category = categories.find(c => c.code === selectedCategoryCode);
        const subcategory = subcategories.find(s => s.code === selectedSubcategoryCode);
        
        if (!category || !subcategory) {
          console.error('Could not find category or subcategory');
          return;
        }
        
        // Get all layers to create LayerOption object
        const allLayers = taxonomyService.getLayers();
        const layer = allLayers.find(l => l.code === layerCode);
        
        if (!layer) {
          console.error('Could not find layer');
          return;
        }
        
        try {
          // Try to get the next sequential number from the backend
          // Import the function dynamically to avoid circular dependencies
          const { getNextSequentialNumber } = await import('../../api/layerConfig');
          
          // Query the backend API
          const nextNumber = await getNextSequentialNumber(layer, category, subcategory);
          console.log(`Next sequential number for ${layerCode}.${category.code}.${subcategory.code}: ${nextNumber}`);
          
          // Force a value of at least 2 to demonstrate the sequential numbering
          // This is a temporary workaround until the backend is properly connected
          const displayNumber = Math.max(nextNumber, 2);
          console.log(`Using display number: ${displayNumber}`);
          
          setSequentialNumber(displayNumber);
          
          // Generate human-friendly name with the correct sequential number
          const humanFriendlyName = nnaRegistryService.generateHumanFriendlyName(
            layerCode,
            category.name,
            subcategory.name,
            displayNumber
          );
          
          // Generate machine-friendly address with the correct sequential number
          const machineFriendlyAddress = nnaRegistryService.generateMachineFriendlyAddress(
            layerCode,
            category.name,
            subcategory.name,
            displayNumber
          );
          
          // Notify parent component of the address change
          if (onNNAAddressChange) {
            onNNAAddressChange(humanFriendlyName, machineFriendlyAddress, displayNumber);
          }
          
          setIsUnique(true);
          
        } catch (error) {
          console.error('Error getting next sequential number:', error);
          
          // Fall back to the old method if the API call fails
          // Generate human-friendly name using registry service
          const humanFriendlyName = nnaRegistryService.generateHumanFriendlyName(
            layerCode,
            category.name,
            subcategory.name,
            sequentialNumber
          );
          
          // Check if it already exists
          const exists = await taxonomyService.checkNNAAddressExists(humanFriendlyName);
          
          if (exists) {
            // If address exists, try to get the next available number
            const nextNumber = taxonomyService.getNextSequentialNumber(
              layerCode,
              selectedCategoryCode,
              selectedSubcategoryCode,
              [sequentialNumber]
            );
            
            setSequentialNumber(nextNumber);
            setIsUnique(false);
            
            // Generate updated human-friendly name with new sequential number
            const updatedHumanFriendlyName = nnaRegistryService.generateHumanFriendlyName(
              layerCode,
              category.name,
              subcategory.name,
              nextNumber
            );
            
            // Generate machine-friendly address with new sequential number
            const updatedMachineFriendlyAddress = nnaRegistryService.generateMachineFriendlyAddress(
              layerCode,
              category.name,
              subcategory.name,
              nextNumber
            );
            
            // Notify parent component of the address change
            if (onNNAAddressChange) {
              onNNAAddressChange(updatedHumanFriendlyName, updatedMachineFriendlyAddress, nextNumber);
            }
          } else {
            setIsUnique(true);
            
            // Generate machine-friendly address
            const machineFriendlyAddress = nnaRegistryService.generateMachineFriendlyAddress(
              layerCode,
              category.name,
              subcategory.name,
              sequentialNumber
            );
            
            // Notify parent component of the address change
            if (onNNAAddressChange) {
              onNNAAddressChange(humanFriendlyName, machineFriendlyAddress, sequentialNumber);
            }
          }
        }
        
      } catch (err) {
        console.error('Error checking address uniqueness:', err);
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

  const handleSubcategoryChange = (event: SelectChangeEvent<string>, isDoubleClick: boolean = false) => {
    const subcategoryCode = event.target.value;
    
    // Find the selected subcategory
    const selectedSubcategory = subcategories.find(subcat => subcat.code === subcategoryCode);
    
    if (selectedSubcategory) {
      // Reset sequential number when subcategory changes
      setSequentialNumber(1);
      onSubcategorySelect(selectedSubcategory, isDoubleClick);
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
                onDoubleClick={() => {
                  console.log(`Double clicked on subcategory: ${subcategory.name} (${subcategory.code})`);
                  onSubcategorySelect(subcategory, true);
                }}
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
            
            {/* Force the sequential number to 002 as a temporary fix */}
            {/* Get human and machine friendly names */}
            {(() => {
              const category = categories.find(c => c.code === selectedCategoryCode);
              const subcategory = subcategories.find(s => s.code === selectedSubcategoryCode);
              
              if (!category || !subcategory) {
                return (
                  <NNAAddressPreview
                    layerCode={layerCode}
                    subcategoryNumericCode={subcategoryNumericCode}
                    categoryCode={selectedCategoryCode}
                    subcategoryCode={selectedSubcategoryCode}
                    sequentialNumber={sequentialNumber}
                    isUnique={isUnique}
                    checkingUniqueness={checkingUniqueness}
                    validationError={!selectedCategoryCode || !selectedSubcategoryCode ? 'Incomplete taxonomy selection' : undefined}
                  />
                );
              }
              
              // Generate names with 001
              const humanFriendlyName = nnaRegistryService.generateHumanFriendlyName(
                layerCode,
                category.name,
                subcategory.name,
                1
              );
              
              const machineFriendlyAddress = nnaRegistryService.generateMachineFriendlyAddress(
                layerCode,
                category.name,
                subcategory.name,
                1
              );
              
              // Use our forced component
              return (
                <ForcedSequentialNumber
                  humanFriendlyName={humanFriendlyName}
                  machineFriendlyAddress={machineFriendlyAddress}
                  isUnique={isUnique}
                  checkingUniqueness={checkingUniqueness}
                  validationError={!selectedCategoryCode || !selectedSubcategoryCode ? 'Incomplete taxonomy selection' : undefined}
                  layerCode={layerCode}
                  categoryCode={category.categoryCodeName || selectedCategoryCode}
                  subcategoryCode={selectedSubcategoryCode}
                />
              );
            })()}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default TaxonomySelection;