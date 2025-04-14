import React, { useState, useEffect } from 'react';
import { Switch, FormControlLabel, Box, Typography, Tooltip } from '@mui/material';
import { apiConfig } from '../../services/api/api';

/**
 * A toggle component that allows switching between mock data and real API
 * Uses the apiConfig to persist the setting in localStorage
 */
const ApiModeToggle: React.FC = () => {
  const [useMockData, setUseMockData] = useState<boolean>(apiConfig.useMockData);
  
  // Update local state when the apiConfig changes (e.g., from localStorage on mount)
  useEffect(() => {
    setUseMockData(apiConfig.useMockData);
  }, []);
  
  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setUseMockData(newValue);
    apiConfig.setUseMockData(newValue);
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1, 
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000
      }}
    >
      <Tooltip title="Switch between mock data for demo purposes and real backend API">
        <FormControlLabel
          control={
            <Switch
              checked={useMockData}
              onChange={handleToggleChange}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              {useMockData ? "Using Mock Data" : "Using Real API"}
            </Typography>
          }
        />
      </Tooltip>
    </Box>
  );
};

export default ApiModeToggle;