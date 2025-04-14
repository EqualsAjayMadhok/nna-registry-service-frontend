import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ExpandMore as ExpandMoreIcon,
  FilterAlt as FilterIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  HelpOutline as HelpIcon,
  LibraryAdd as SaveAsIcon,
  FilterList as SortIcon
} from '@mui/icons-material';
import { 
  AssetSearchParams, 
  SavedSearch,
  SearchCondition,
  SearchConditionType,
  SearchComparisonOperator,
  SearchGroup,
  SearchOperator 
} from '../../types/asset.types';
import AssetService from '../../services/api/asset.service';
import { format } from 'date-fns';

interface AdvancedFiltersProps {
  onSearch: (params: AssetSearchParams) => void;
  initialParams?: AssetSearchParams;
  loading?: boolean;
}

interface FieldOption {
  field: string;
  label: string;
  type: SearchConditionType;
  options?: { value: string; label: string }[];
}

// Define all available fields for search conditions
const FIELD_OPTIONS: FieldOption[] = [
  { field: 'name', label: 'Name', type: 'text' },
  { field: 'description', label: 'Description', type: 'text' },
  { field: 'nnaAddress', label: 'NNA Address', type: 'text' },
  { 
    field: 'layer', 
    label: 'Layer', 
    type: 'select',
    options: [
      { value: 'G', label: 'Song (G)' },
      { value: 'S', label: 'Star (S)' },
      { value: 'L', label: 'Look (L)' },
      { value: 'M', label: 'Move (M)' },
      { value: 'W', label: 'World (W)' }
    ]
  },
  { field: 'category', label: 'Category', type: 'text' },
  { field: 'subcategory', label: 'Subcategory', type: 'text' },
  { field: 'tags', label: 'Tags', type: 'tags' },
  { field: 'createdAt', label: 'Created Date', type: 'date' },
  { field: 'updatedAt', label: 'Updated Date', type: 'date' },
  { field: 'createdBy', label: 'Created By', type: 'text' },
  { field: 'fileCount', label: 'File Count', type: 'number' },
  { field: 'fileSize', label: 'File Size (bytes)', type: 'number' },
  { field: 'files.contentType', label: 'File Type', type: 'text' },
  { field: 'hasFiles', label: 'Has Files', type: 'boolean' },
  { field: 'metadata.source', label: 'Source', type: 'text' },
  { field: 'metadata.license', label: 'License', type: 'text' },
  { field: 'metadata.attributionRequired', label: 'Attribution Required', type: 'boolean' },
  { field: 'metadata.commercialUse', label: 'Commercial Use', type: 'boolean' }
];

// Define operators available for each type
const OPERATORS_BY_TYPE: Record<SearchConditionType, { value: SearchComparisonOperator; label: string }[]> = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'exists', label: 'Exists' }
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'greaterThan', label: 'After' },
    { value: 'lessThan', label: 'Before' },
    { value: 'between', label: 'Between' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
    { value: 'lessThanOrEqual', label: 'Less Than or Equal' },
    { value: 'between', label: 'Between' },
  ],
  boolean: [
    { value: 'equals', label: 'Is' },
  ],
  tags: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not Contains' },
  ],
};

// Define sorting options
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Creation Date' },
  { value: 'updatedAt', label: 'Update Date' },
  { value: 'layer', label: 'Layer' }
];

// Empty condition template
const emptyCondition: SearchCondition = {
  field: 'name',
  type: 'text',
  operator: 'contains',
  value: '',
  label: 'Name'
};

// Date format for display
const formatDateStr = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch (e) {
    return dateStr;
  }
};

/**
 * AdvancedFilters component
 * Provides a comprehensive interface for complex asset searches
 */
const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onSearch,
  initialParams = {},
  loading = false
}) => {
  const theme = useTheme();
  
  // Core search state
  const [searchParams, setSearchParams] = useState<AssetSearchParams>(initialParams);
  const [showSavedSearches, setShowSavedSearches] = useState<boolean>(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [newSearchName, setNewSearchName] = useState<string>('');
  const [newSearchDescription, setNewSearchDescription] = useState<string>('');
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  
  // Complex query building
  const [rootGroup, setRootGroup] = useState<SearchGroup>({
    operator: 'AND',
    conditions: [{ ...emptyCondition }]
  });
  
  // Date filters state
  const [startDate, setStartDate] = useState<Date | null>(
    initialParams.createdAfter ? new Date(initialParams.createdAfter) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialParams.createdBefore ? new Date(initialParams.createdBefore) : null
  );
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>(initialParams.sortBy || 'createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    initialParams.sortDirection || 'desc'
  );
  
  // Load saved searches
  useEffect(() => {
    const loadSavedSearches = async () => {
      try {
        const searches = await AssetService.getSavedSearches();
        setSavedSearches(searches);
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    };
    
    loadSavedSearches();
  }, []);
  
  // Initialize search group from initialParams if available
  useEffect(() => {
    if (initialParams.searchGroup) {
      setRootGroup(initialParams.searchGroup);
    }
    
    // Set sort options
    if (initialParams.sortBy) {
      setSortBy(initialParams.sortBy);
    }
    if (initialParams.sortDirection) {
      setSortDirection(initialParams.sortDirection);
    }
    
    // Set date filters
    if (initialParams.createdAfter) {
      setStartDate(new Date(initialParams.createdAfter));
    }
    if (initialParams.createdBefore) {
      setEndDate(new Date(initialParams.createdBefore));
    }
  }, [initialParams]);
  
  // Build search params from the current state
  const buildSearchParams = (): AssetSearchParams => {
    // Start with current searchParams
    const params: AssetSearchParams = { ...searchParams };
    
    // Only add the search group if it has valid conditions
    if (rootGroup.conditions.length > 0) {
      // Remove any empty conditions
      const cleanedGroup = cleanSearchGroup(rootGroup);
      if (cleanedGroup.conditions.length > 0) {
        params.searchGroup = cleanedGroup;
      } else {
        delete params.searchGroup;
      }
    } else {
      delete params.searchGroup;
    }
    
    // Add date filters
    if (startDate) {
      params.createdAfter = startDate;
    } else {
      delete params.createdAfter;
    }
    
    if (endDate) {
      params.createdBefore = endDate;
    } else {
      delete params.createdBefore;
    }
    
    // Add sorting
    params.sortBy = sortBy;
    params.sortDirection = sortDirection;
    
    // Reset to first page when filters change
    params.page = 1;
    
    return params;
  };
  
  // Clean search group by removing empty conditions
  const cleanSearchGroup = (group: SearchGroup): SearchGroup => {
    const cleanedConditions = group.conditions
      .filter(condition => {
        if ('conditions' in condition) {
          // Nested group - only keep if it has valid conditions after cleaning
          const cleanedNestedGroup = cleanSearchGroup(condition as SearchGroup);
          return cleanedNestedGroup.conditions.length > 0;
        } else {
          // Simple condition - only keep if field and value are set (unless operator is 'exists')
          const simpleCondition = condition as SearchCondition;
          return simpleCondition.field && 
                 (simpleCondition.operator === 'exists' || 
                  simpleCondition.value !== undefined && 
                  simpleCondition.value !== '');
        }
      })
      .map(condition => {
        if ('conditions' in condition) {
          // Clean nested group
          return cleanSearchGroup(condition as SearchGroup);
        }
        return condition;
      });
    
    return {
      ...group,
      conditions: cleanedConditions
    };
  };
  
  // Apply the search
  const handleSearch = () => {
    const params = buildSearchParams();
    onSearch(params);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setRootGroup({
      operator: 'AND',
      conditions: [{ ...emptyCondition }]
    });
    setStartDate(null);
    setEndDate(null);
    setSortBy('createdAt');
    setSortDirection('desc');
    setSearchParams({});
  };
  
  // Handle change in a condition
  const handleConditionChange = (
    path: number[], 
    field: keyof SearchCondition, 
    value: any
  ) => {
    // Create a deep clone of the root group
    const updatedGroup = JSON.parse(JSON.stringify(rootGroup)) as SearchGroup;
    
    // Navigate to the target condition or group
    let target: SearchGroup | SearchCondition = updatedGroup;
    let parentGroup: SearchGroup = updatedGroup;
    let index = 0;
    
    for (let i = 0; i < path.length; i++) {
      index = path[i];
      if (i === path.length - 1) {
        // We're at the target condition's parent
        parentGroup = target as SearchGroup;
      } else {
        // Navigate deeper
        target = (target as SearchGroup).conditions[index] as SearchGroup;
      }
    }
    
    const condition = parentGroup.conditions[index] as SearchCondition;
    
    // Special handling for field change
    if (field === 'field') {
      // Find the field option
      const fieldOption = FIELD_OPTIONS.find(f => f.field === value);
      if (fieldOption) {
        // Update type and label based on selected field
        condition.type = fieldOption.type;
        condition.label = fieldOption.label;
        
        // Set default operator for the type
        condition.operator = OPERATORS_BY_TYPE[fieldOption.type][0].value;
        
        // Reset value
        if (fieldOption.type === 'boolean') {
          condition.value = true;
        } else if (fieldOption.type === 'select' && fieldOption.options) {
          condition.value = fieldOption.options[0].value;
        } else {
          condition.value = '';
        }
      }
    } else {
      // Update the specified field
      (condition as any)[field] = value;
    }
    
    setRootGroup(updatedGroup);
  };
  
  // Add a new condition to a group
  const handleAddCondition = (path: number[]) => {
    // Create a deep clone of the root group
    const updatedGroup = JSON.parse(JSON.stringify(rootGroup)) as SearchGroup;
    
    // Navigate to the target group
    let target: SearchGroup = updatedGroup;
    
    for (let i = 0; i < path.length; i++) {
      target = target.conditions[path[i]] as SearchGroup;
    }
    
    // Add a new condition
    target.conditions.push({ ...emptyCondition });
    
    setRootGroup(updatedGroup);
  };
  
  // Remove a condition from a group
  const handleRemoveCondition = (path: number[]) => {
    // Create a deep clone of the root group
    const updatedGroup = JSON.parse(JSON.stringify(rootGroup)) as SearchGroup;
    
    // Navigate to the target group
    let target: SearchGroup = updatedGroup;
    let parentGroup: SearchGroup = updatedGroup;
    let index = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      parentGroup = target;
      target = target.conditions[path[i]] as SearchGroup;
    }
    
    index = path[path.length - 1];
    
    // Remove the condition
    target.conditions.splice(index, 1);
    
    // If the group is now empty and it's not the root group, remove it
    if (target.conditions.length === 0 && path.length > 0) {
      parentGroup.conditions.splice(path[path.length - 2], 1);
      
      // If parent is now empty (shouldn't happen, but just in case)
      if (parentGroup.conditions.length === 0) {
        parentGroup.conditions.push({ ...emptyCondition });
      }
    }
    
    // If the root group is now empty, add a default condition
    if (updatedGroup.conditions.length === 0) {
      updatedGroup.conditions.push({ ...emptyCondition });
    }
    
    setRootGroup(updatedGroup);
  };
  
  // Add a new nested group
  const handleAddGroup = (path: number[], operator: SearchOperator = 'AND') => {
    // Create a deep clone of the root group
    const updatedGroup = JSON.parse(JSON.stringify(rootGroup)) as SearchGroup;
    
    // Navigate to the target group
    let target: SearchGroup = updatedGroup;
    
    for (let i = 0; i < path.length; i++) {
      target = target.conditions[path[i]] as SearchGroup;
    }
    
    // Add a new group with a default condition
    target.conditions.push({
      operator,
      conditions: [{ ...emptyCondition }]
    });
    
    setRootGroup(updatedGroup);
  };
  
  // Change the operator of a group
  const handleGroupOperatorChange = (path: number[], operator: SearchOperator) => {
    // Create a deep clone of the root group
    const updatedGroup = JSON.parse(JSON.stringify(rootGroup)) as SearchGroup;
    
    // Navigate to the target group
    let target: SearchGroup = updatedGroup;
    
    for (let i = 0; i < path.length; i++) {
      target = target.conditions[path[i]] as SearchGroup;
    }
    
    // Change the operator
    target.operator = operator;
    
    setRootGroup(updatedGroup);
  };
  
  // Load a saved search
  const handleLoadSavedSearch = (search: SavedSearch) => {
    // Load search parameters
    setSearchParams(search.params);
    
    // Load search group if available
    if (search.params.searchGroup) {
      setRootGroup(search.params.searchGroup);
    } else {
      setRootGroup({
        operator: 'AND',
        conditions: [{ ...emptyCondition }]
      });
    }
    
    // Load date filters
    setStartDate(search.params.createdAfter ? new Date(search.params.createdAfter as string) : null);
    setEndDate(search.params.createdBefore ? new Date(search.params.createdBefore as string) : null);
    
    // Load sorting
    setSortBy(search.params.sortBy || 'createdAt');
    setSortDirection(search.params.sortDirection || 'desc');
    
    // Hide saved searches panel
    setShowSavedSearches(false);
    
    // Apply the search
    onSearch(search.params);
  };
  
  // Save the current search
  const handleSaveSearch = async () => {
    if (!newSearchName.trim()) return;
    
    try {
      const searchToSave: Omit<SavedSearch, 'id' | 'createdAt' | 'userId'> = {
        name: newSearchName.trim(),
        description: newSearchDescription.trim() || undefined,
        params: buildSearchParams(),
        isDefault: false
      };
      
      const savedSearch = await AssetService.saveSearch(searchToSave);
      setSavedSearches(prev => [...prev, savedSearch]);
      
      // Reset form
      setNewSearchName('');
      setNewSearchDescription('');
      setShowSaveForm(false);
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };
  
  // Delete a saved search
  const handleDeleteSavedSearch = async (id: string) => {
    try {
      await AssetService.deleteSavedSearch(id);
      setSavedSearches(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };
  
  // Set a saved search as default
  const handleSetDefaultSearch = async (id: string) => {
    try {
      const updatedSearch = await AssetService.setDefaultSavedSearch(id);
      setSavedSearches(prev => prev.map(s => ({
        ...s,
        isDefault: s.id === id
      })));
    } catch (error) {
      console.error('Error setting default saved search:', error);
    }
  };
  
  // Render a search condition
  const renderCondition = (condition: SearchCondition, path: number[]) => {
    const fieldOption = FIELD_OPTIONS.find(f => f.field === condition.field);
    
    if (!fieldOption) return null;
    
    const operators = OPERATORS_BY_TYPE[condition.type] || [];
    
    return (
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        {/* Field selection */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Field</InputLabel>
          <Select
            value={condition.field}
            label="Field"
            onChange={(e) => handleConditionChange(path, 'field', e.target.value)}
            disabled={loading}
          >
            {FIELD_OPTIONS.map(option => (
              <MenuItem key={option.field} value={option.field}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Operator selection */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Operator</InputLabel>
          <Select
            value={condition.operator}
            label="Operator"
            onChange={(e) => handleConditionChange(
              path, 
              'operator', 
              e.target.value as SearchComparisonOperator
            )}
            disabled={loading}
          >
            {operators.map(op => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Value input - changes based on field type and operator */}
        {condition.operator !== 'exists' && (
          renderValueInput(condition, path)
        )}
        
        {/* Remove button */}
        <IconButton 
          size="small" 
          color="error"
          onClick={() => handleRemoveCondition(path)}
          disabled={loading}
          sx={{ mt: 0.5 }}
        >
          <RemoveIcon />
        </IconButton>
      </Box>
    );
  };
  
  // Render the appropriate value input based on condition type and operator
  const renderValueInput = (condition: SearchCondition, path: number[]) => {
    const { type, operator } = condition;
    
    // For between operator, we need two inputs
    if (operator === 'between') {
      return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1 }}>
          {type === 'date' ? (
            <>
              <DatePicker
                label="From"
                value={condition.value?.[0] ? new Date(condition.value[0]) : null}
                onChange={(date) => {
                  const newValue = [...(Array.isArray(condition.value) ? condition.value : [null, null])];
                  newValue[0] = date?.toISOString();
                  handleConditionChange(path, 'value', newValue);
                }}
                slotProps={{ 
                  textField: { 
                    size: 'small', 
                    fullWidth: true,
                    disabled: loading
                  } 
                }}
              />
              <DatePicker
                label="To"
                value={condition.value?.[1] ? new Date(condition.value[1]) : null}
                onChange={(date) => {
                  const newValue = [...(Array.isArray(condition.value) ? condition.value : [null, null])];
                  newValue[1] = date?.toISOString();
                  handleConditionChange(path, 'value', newValue);
                }}
                slotProps={{ 
                  textField: { 
                    size: 'small', 
                    fullWidth: true,
                    disabled: loading
                  } 
                }}
              />
            </>
          ) : (
            <>
              <TextField
                label="From"
                type={type === 'number' ? 'number' : 'text'}
                value={condition.value?.[0] || ''}
                onChange={(e) => {
                  const newValue = [...(Array.isArray(condition.value) ? condition.value : [null, null])];
                  newValue[0] = type === 'number' ? Number(e.target.value) : e.target.value;
                  handleConditionChange(path, 'value', newValue);
                }}
                size="small"
                fullWidth
                disabled={loading}
              />
              <TextField
                label="To"
                type={type === 'number' ? 'number' : 'text'}
                value={condition.value?.[1] || ''}
                onChange={(e) => {
                  const newValue = [...(Array.isArray(condition.value) ? condition.value : [null, null])];
                  newValue[1] = type === 'number' ? Number(e.target.value) : e.target.value;
                  handleConditionChange(path, 'value', newValue);
                }}
                size="small"
                fullWidth
                disabled={loading}
              />
            </>
          )}
        </Box>
      );
    }
    
    switch (type) {
      case 'text':
      case 'tags':
        return (
          <TextField
            label="Value"
            value={condition.value || ''}
            onChange={(e) => handleConditionChange(path, 'value', e.target.value)}
            size="small"
            fullWidth
            disabled={loading}
          />
        );
        
      case 'select': {
        const fieldOption = FIELD_OPTIONS.find(f => f.field === condition.field);
        return (
          <FormControl size="small" fullWidth>
            <InputLabel>Value</InputLabel>
            <Select
              value={condition.value || ''}
              label="Value"
              onChange={(e) => handleConditionChange(path, 'value', e.target.value)}
              disabled={loading}
            >
              {fieldOption?.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }
        
      case 'number':
        return (
          <TextField
            label="Value"
            type="number"
            value={condition.value || ''}
            onChange={(e) => handleConditionChange(
              path, 
              'value', 
              e.target.value === '' ? '' : Number(e.target.value)
            )}
            size="small"
            fullWidth
            disabled={loading}
          />
        );
        
      case 'date':
        return (
          <DatePicker
            label="Date"
            value={condition.value ? new Date(condition.value) : null}
            onChange={(date) => handleConditionChange(
              path, 
              'value',
              date?.toISOString() || null
            )}
            slotProps={{ 
              textField: { 
                size: 'small', 
                fullWidth: true,
                disabled: loading
              } 
            }}
          />
        );
        
      case 'boolean':
        return (
          <FormControl size="small" fullWidth>
            <InputLabel>Value</InputLabel>
            <Select
              value={condition.value === undefined ? 'true' : String(condition.value)}
              label="Value"
              onChange={(e) => handleConditionChange(
                path, 
                'value', 
                e.target.value === 'true'
              )}
              disabled={loading}
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
          </FormControl>
        );
        
      default:
        return null;
    }
  };
  
  // Render a search group
  const renderGroup = (group: SearchGroup, path: number[] = []) => {
    return (
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 1.5, 
          mb: 2,
          borderColor: theme.palette.divider,
          borderLeftWidth: 3,
          borderLeftColor: group.operator === 'AND' 
            ? theme.palette.primary.main 
            : theme.palette.secondary.main
        }}
      >
        {/* Group operator selection */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControl component="fieldset" size="small">
            <FormLabel component="legend">Match</FormLabel>
            <RadioGroup
              row
              value={group.operator}
              onChange={(e) => handleGroupOperatorChange(
                path, 
                e.target.value as SearchOperator
              )}
            >
              <FormControlLabel 
                value="AND" 
                control={<Radio size="small" />} 
                label="ALL conditions (AND)" 
                disabled={loading}
              />
              <FormControlLabel 
                value="OR" 
                control={<Radio size="small" />} 
                label="ANY condition (OR)" 
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>
          
          {/* Path indicator for nested groups - for debugging */}
          {/* <Typography variant="caption">{path.join('.')}</Typography> */}
        </Box>
        
        {/* Conditions */}
        <Box sx={{ mb: 1 }}>
          {group.conditions.map((condition, index) => {
            const currentPath = [...path, index];
            
            // Check if this is a nested group
            if ('operator' in condition && 'conditions' in condition) {
              return renderGroup(condition as SearchGroup, currentPath);
            }
            
            return (
              <Box key={index}>
                {renderCondition(condition as SearchCondition, currentPath)}
              </Box>
            );
          })}
        </Box>
        
        {/* Group actions */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleAddCondition(path)}
            disabled={loading}
            variant="outlined"
          >
            Add Condition
          </Button>
          
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleAddGroup(path)}
            disabled={loading}
            variant="outlined"
          >
            Add Group
          </Button>
        </Box>
      </Paper>
    );
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Saved Searches Panel */}
        <Accordion expanded={showSavedSearches}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            onClick={() => setShowSavedSearches(!showSavedSearches)}
          >
            <Typography variant="subtitle1">Saved Searches</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {savedSearches.length === 0 ? (
              <Typography color="text.secondary">No saved searches yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {savedSearches.map(search => (
                  <Grid item xs={12} sm={6} md={4} key={search.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        position: 'relative',
                        border: search.isDefault ? `2px solid ${theme.palette.primary.main}` : undefined
                      }}
                    >
                      {search.isDefault && (
                        <Chip 
                          label="Default" 
                          size="small" 
                          color="primary"
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                      <CardContent>
                        <Typography variant="subtitle1">{search.name}</Typography>
                        {search.description && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {search.description}
                          </Typography>
                        )}
                        
                        {/* Display some query preview */}
                        <Box sx={{ mt: 1 }}>
                          {search.params.layer && (
                            <Chip 
                              label={`Layer: ${search.params.layer}`} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                          {search.params.createdAfter && (
                            <Chip 
                              label={`After: ${formatDateStr(search.params.createdAfter as string)}`} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                          {search.params.createdBefore && (
                            <Chip 
                              label={`Before: ${formatDateStr(search.params.createdBefore as string)}`} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                        </Box>
                      </CardContent>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleLoadSavedSearch(search)}
                          disabled={loading}
                        >
                          Load
                        </Button>
                        <Box>
                          {!search.isDefault && (
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleSetDefaultSearch(search.id)}
                              disabled={loading}
                              title="Set as default"
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteSavedSearch(search.id)}
                            disabled={loading}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Save search form */}
            {showSaveForm ? (
              <Box sx={{ mt: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Save Current Search</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField
                    label="Search Name"
                    value={newSearchName}
                    onChange={(e) => setNewSearchName(e.target.value)}
                    size="small"
                    fullWidth
                    required
                    disabled={loading}
                  />
                  <TextField
                    label="Description (Optional)"
                    value={newSearchDescription}
                    onChange={(e) => setNewSearchDescription(e.target.value)}
                    size="small"
                    fullWidth
                    disabled={loading}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button 
                    size="small" 
                    onClick={() => setShowSaveForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={handleSaveSearch}
                    disabled={loading || !newSearchName.trim()}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<SaveAsIcon />}
                  onClick={() => setShowSaveForm(true)}
                  disabled={loading}
                >
                  Save Current Search
                </Button>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
        
        {/* Common Filters */}
        <Card variant="outlined" sx={{ mb: 3, mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Filters</Typography>
            
            <Grid container spacing={2}>
              {/* Date Range */}
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Created After"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{ 
                    textField: { 
                      size: 'small', 
                      fullWidth: true,
                      disabled: loading
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Created Before"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  slotProps={{ 
                    textField: { 
                      size: 'small', 
                      fullWidth: true,
                      disabled: loading
                    } 
                  }}
                />
              </Grid>
              
              {/* Sorting */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    disabled={loading}
                    startAdornment={
                      <InputAdornment position="start">
                        <SortIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {SORT_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Sort Direction</InputLabel>
                  <Select
                    value={sortDirection}
                    label="Sort Direction"
                    onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                    disabled={loading}
                  >
                    <MenuItem value="asc">Ascending (A-Z, Oldest first)</MenuItem>
                    <MenuItem value="desc">Descending (Z-A, Newest first)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Complex Query Builder */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Conditions
                </Typography>
                <Tooltip title="Build complex search queries with multiple conditions">
                  <HelpIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={loading}
              >
                Clear All Filters
              </Button>
            </Box>
            
            {/* Root group */}
            {renderGroup(rootGroup)}
          </CardContent>
        </Card>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={!showSavedSearches ? <SaveIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            disabled={loading}
          >
            {!showSavedSearches ? 'Saved Searches' : 'Hide Saved Searches'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AdvancedFilters;