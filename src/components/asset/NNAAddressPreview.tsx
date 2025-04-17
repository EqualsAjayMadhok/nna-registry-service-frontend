import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
  Divider,
  Grid,
  Alert,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import taxonomyService from '../../api/taxonomyService';
import nnaRegistryService from '../../api/nnaRegistryService';
import { generateHumanFriendlyName, generateMachineFriendlyAddress } from '../../api/codeMapping';

interface NNAAddressPreviewProps {
  layerCode: string;
  categoryCode: string;
  subcategoryCode: string;
  sequentialNumber: number;
  subcategoryNumericCode?: string;
  isUnique?: boolean;
  checkingUniqueness?: boolean;
  validationError?: string;
}

const NNAAddressPreview: React.FC<NNAAddressPreviewProps> = ({
  layerCode,
  categoryCode,
  subcategoryCode,
  sequentialNumber,
  subcategoryNumericCode,
  isUnique = true,
  checkingUniqueness = false,
  validationError
}) => {
  const theme = useTheme();
  const [humanFriendlyName, setHumanFriendlyName] = useState<string>('');
  const [machineFriendlyAddress, setMachineFriendlyAddress] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const categoryOptions = taxonomyService.getCategories(layerCode);
  const category = categoryOptions.find(c => c.code === categoryCode);


  // Generate the addresses whenever inputs change
  useEffect(() => {
    if (!layerCode || !categoryCode || !subcategoryCode || sequentialNumber <= 0) {
      setIsValid(false);
      return;
    }

    // Generate addresses using our custom mapping
    const humanName = generateHumanFriendlyName(
      layerCode,
      category?.categoryCodeName || '',
      subcategoryCode,
      sequentialNumber
    );
    
    const machineAddress = generateMachineFriendlyAddress(
      layerCode,
      categoryCode,
      subcategoryNumericCode || '',
      sequentialNumber
    );
    
    setHumanFriendlyName(humanName);
    setMachineFriendlyAddress(machineAddress);
    setIsValid(Boolean(humanName && machineAddress));
    
  }, [layerCode, categoryCode, subcategoryNumericCode, subcategoryCode, sequentialNumber]);

  // Function to render address part explanation
  const renderAddressPart = (
    part: string,
    value: string,
    description: string
  ) => (
    <Grid item xs={3}>
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {part}
        </Typography>
        <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
          {value || '-'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Grid>
  );

  // If not valid, show minimal preview
  if (!isValid) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}
      >
        <Typography variant="subtitle1" gutterBottom>
          NNA Address Preview
        </Typography>
        <Alert severity="info">
          Complete the taxonomy selection to generate an NNA address.
        </Alert>
      </Paper>
    );
  }


  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          NNA Address Preview
        </Typography>
        
        {/* Status indicator */}
        {validationError ? (
          <Tooltip title={validationError}>
            <Chip
              icon={<ErrorIcon />}
              label="Invalid"
              color="error"
              size="small"
            />
          </Tooltip>
        ) : checkingUniqueness ? (
          <Chip
            icon={<CircularProgress size={16} />}
            label="Checking uniqueness..."
            color="default"
            size="small"
          />
        ) : isUnique ? (
          <Tooltip title="This NNA address is available">
            <Chip
              icon={<CheckCircleIcon />}
              label="Unique"
              color="success"
              size="small"
            />
          </Tooltip>
        ) : (
          <Tooltip title="This NNA address is already in use">
            <Chip
              icon={<WarningIcon />}
              label="Already Exists"
              color="warning"
              size="small"
            />
          </Tooltip>
        )}
      </Box>
      
      {/* Human-friendly format */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: 'red', fontWeight: 'bold' }} gutterBottom>
          Human-Friendly Name (HFN)
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            letterSpacing: '0.1em'
          }}
        >
          {humanFriendlyName}
        </Box>
      </Box>
      
      {/* Machine-friendly format */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: 'blue', fontWeight: 'bold' }} gutterBottom>
          Machine-Friendly Address (MFA)
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            color: theme.palette.text.secondary,
            letterSpacing: '0.1em'
          }}
        >
          {machineFriendlyAddress}
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Address parts explanation */}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Address Components
      </Typography>
      
      <Grid container spacing={2}>
        {renderAddressPart(
          'Layer',
          layerCode,
          'Identifies the NNA layer (e.g., G for Songs)'
        )}
        
        {renderAddressPart(
          'Category',
          category?.categoryCodeName || '',
          'Identifies the category within the layer'
        )}
        
        {renderAddressPart(
          'Subcategory',
          subcategoryCode,
          'Identifies the subcategory within the category'
        )}
        
        {renderAddressPart(
          'Sequence',
          sequentialNumber.toString().padStart(3, '0'),
          'Unique sequential number within the taxonomy path'
        )}
      </Grid>
      
      {/* Additional information */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="caption" color="text.secondary">
          The NNA dual addressing system provides both human-readable and machine-optimized formats
          for the same asset, ensuring both usability and efficiency.
        </Typography>
      </Box>
    </Paper>
  );
};

export default NNAAddressPreview;