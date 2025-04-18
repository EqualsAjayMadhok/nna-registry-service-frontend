/**
 * This component is a special wrapper for the NNA Address Preview component
 * that forces the sequential number to be 002 instead of 001
 */

import React, { useEffect } from 'react';
import { Box, Typography, Paper, Divider, useTheme, Chip, Tooltip, Grid, Alert } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Warning as WarningIcon, Info as InfoIcon, ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface ForcedSequentialNumberProps {
  humanFriendlyName: string;
  machineFriendlyAddress: string;
  isUnique?: boolean;
  checkingUniqueness?: boolean;
  validationError?: string;
  layerCode: string;
  categoryCode: string;
  subcategoryCode: string;
}

const ForcedSequentialNumber: React.FC<ForcedSequentialNumberProps> = ({
  humanFriendlyName,
  machineFriendlyAddress,
  isUnique = true,
  checkingUniqueness = false,
  validationError,
  layerCode,
  categoryCode,
  subcategoryCode,
}) => {
  const theme = useTheme();
  
  // Force the sequential number to 002
  const forcedHumanFriendlyName = humanFriendlyName.replace(/\.001$/, '.002');
  const forcedMachineFriendlyAddress = machineFriendlyAddress.replace(/\.001$/, '.002');

  // Extract parts for display
  const parts = forcedHumanFriendlyName.split('.');
  const sequentialNumber = parts.length === 4 ? parts[3] : '002';
  const categoryName = categoryCode;
  
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
          {forcedHumanFriendlyName}
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
          {forcedMachineFriendlyAddress}
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
          categoryName,
          'Identifies the category within the layer'
        )}
        
        {renderAddressPart(
          'Subcategory',
          subcategoryCode,
          'Identifies the subcategory within the category'
        )}
        
        {renderAddressPart(
          'Sequence',
          sequentialNumber,
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

// For TypeScript
const CircularProgress = ({ size }: { size: number }) => (
  <Box sx={{ width: size, height: size, animation: 'spin 1s linear infinite' }}>
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="30 60"
      />
    </svg>
  </Box>
);

export default ForcedSequentialNumber;