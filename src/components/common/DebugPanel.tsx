import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  Button,
  Divider,
  FormControlLabel,
  Chip,
  IconButton,
  Collapse,
  TextField
} from '@mui/material';
import {
  Code as CodeIcon,
  Info as InfoIcon,
  BugReport as BugReportIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { APP_VERSION, BUILD_TIMESTAMP } from '../../utils/version';
import { getExistingAssetsCount } from '../../utils/assetCountService';
import { formatSequentialNumber } from '../../utils/nnaAddressing';
import { apiConfig } from '../../services/api/api';
import authService from '../../services/api/auth.service';

interface DebugTestResult {
  name: string;
  input?: any;
  output?: any;
  error?: string;
  timestamp: string;
}

/**
 * Debug Panel Component
 * 
 * A floating panel that provides debugging information and tools
 * for development and troubleshooting.
 */
const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mockMode, setMockMode] = useState(apiConfig.useMockData);
  const [testResults, setTestResults] = useState<DebugTestResult[]>([]);
  const [customLayer, setCustomLayer] = useState('S');
  const [customCategory, setCustomCategory] = useState('POP');
  const [customSubcategory, setCustomSubcategory] = useState('BAS');
  
  // Get initial state from localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem('debugPanelVisible');
    if (savedVisibility !== null) {
      setIsVisible(savedVisibility === 'true');
    }
    
    // Update mock mode state when it changes
    setMockMode(apiConfig.useMockData);
  }, []);
  
  // Save visibility state to localStorage
  useEffect(() => {
    localStorage.setItem('debugPanelVisible', isVisible.toString());
  }, [isVisible]);
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleMockMode = () => {
    const newMode = !mockMode;
    apiConfig.setUseMockData(newMode);
    setMockMode(newMode);
  };
  
  const clearResults = () => {
    setTestResults([]);
  };
  
  // Run test to get asset count and calculate sequential number
  const testSequentialNumbering = async () => {
    try {
      // Add "started" result entry
      const testId = Date.now().toString();
      setTestResults(prev => [
        ...prev,
        {
          name: 'Sequential Number Test',
          input: {
            layer: customLayer,
            category: customCategory,
            subcategory: customSubcategory
          },
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Get count from asset service
      const count = await getExistingAssetsCount(
        customLayer,
        customCategory,
        customSubcategory
      );
      
      // Format as sequential number
      const sequentialNumber = formatSequentialNumber(count);
      
      // Update result
      setTestResults(prev => 
        prev.map(result => 
          result.timestamp === testId 
            ? {
                ...result,
                output: {
                  count,
                  sequentialNumber,
                  humanFriendlyName: `${customLayer}.${customCategory}.${customSubcategory}.${sequentialNumber}`
                }
              }
            : result
        )
      );
    } catch (error) {
      console.error('Sequential number test error:', error);
      
      // Add error result
      setTestResults(prev => [
        ...prev,
        {
          name: 'Sequential Number Test',
          input: {
            layer: customLayer,
            category: customCategory,
            subcategory: customSubcategory
          },
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };
  
  // Run predefined test cases
  const runPredefinedTests = async () => {
    const testCases = [
      { layer: 'S', category: 'POP', subcategory: 'BAS' },
      { layer: 'G', category: 'POP', subcategory: 'BAS' },
      { layer: 'L', category: 'FAS', subcategory: 'DRS' }
    ];
    
    for (const testCase of testCases) {
      try {
        // Get count from asset service
        const count = await getExistingAssetsCount(
          testCase.layer,
          testCase.category,
          testCase.subcategory
        );
        
        // Format as sequential number
        const sequentialNumber = formatSequentialNumber(count);
        
        // Add result
        setTestResults(prev => [
          ...prev,
          {
            name: 'Predefined Test',
            input: testCase,
            output: {
              count,
              sequentialNumber,
              humanFriendlyName: `${testCase.layer}.${testCase.category}.${testCase.subcategory}.${sequentialNumber}`
            },
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (error) {
        console.error('Predefined test error:', error);
        
        // Add error result
        setTestResults(prev => [
          ...prev,
          {
            name: 'Predefined Test',
            input: testCase,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          }
        ]);
      }
    }
  };
  
  // Show debug info about the environment
  const runEnvironmentCheck = () => {
    const envInfo = {
      version: APP_VERSION,
      buildTimestamp: BUILD_TIMESTAMP,
      environment: process.env.NODE_ENV,
      apiMode: apiConfig.useMockData ? 'Mock' : 'Real',
      apiUrl: apiConfig.getApiUrl(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: typeof localStorage !== 'undefined'
    };
    
    setTestResults(prev => [
      ...prev,
      {
        name: 'Environment Info',
        output: envInfo,
        timestamp: new Date().toISOString()
      }
    ]);
  };
  
  // Render the debug toggle button when not visible
  if (!isVisible) {
    return (
      <Button
        variant="contained"
        size="small"
        color="info"
        onClick={toggleVisibility}
        startIcon={<BugReportIcon />}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 9999,
          opacity: 0.7,
          '&:hover': {
            opacity: 1
          }
        }}
      >
        Debug
      </Button>
    );
  }
  
  // Render the debug panel
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: isOpen ? 400 : 'auto',
        maxWidth: '90vw',
        maxHeight: isOpen ? '80vh' : 'auto',
        zIndex: 9999,
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'info.main',
          color: 'info.contrastText',
          p: 1
        }}
      >
        <Box display="flex" alignItems="center">
          <BugReportIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Debug Panel</Typography>
          <Chip
            label={`v${APP_VERSION}`}
            size="small"
            variant="outlined"
            sx={{ ml: 1, color: 'info.contrastText', borderColor: 'info.contrastText' }}
          />
        </Box>
        
        <Box>
          <IconButton
            size="small"
            onClick={toggleOpen}
            sx={{ color: 'info.contrastText' }}
          >
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={toggleVisibility}
            sx={{ color: 'info.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Content */}
      <Collapse in={isOpen}>
        <Box sx={{ p: 2, maxHeight: '70vh', overflow: 'auto' }}>
          {/* Settings */}
          <Typography variant="subtitle2" gutterBottom>
            Settings
          </Typography>
          <Box mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={mockMode}
                  onChange={toggleMockMode}
                  color="primary"
                />
              }
              label="Use Mock Data"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Test Asset Count */}
          <Typography variant="subtitle2" gutterBottom>
            Test Sequential Numbering
          </Typography>
          <Box mb={2}>
            <Box display="flex" gap={1} mb={1}>
              <TextField
                label="Layer"
                value={customLayer}
                onChange={(e) => setCustomLayer(e.target.value)}
                size="small"
                sx={{ width: '80px' }}
              />
              <TextField
                label="Category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                size="small"
                sx={{ width: '100px' }}
              />
              <TextField
                label="Subcategory"
                value={customSubcategory}
                onChange={(e) => setCustomSubcategory(e.target.value)}
                size="small"
                sx={{ width: '100px' }}
              />
            </Box>
            <Button
              variant="outlined"
              onClick={testSequentialNumbering}
              fullWidth
            >
              Test Custom Path
            </Button>
          </Box>
          
          <Box display="flex" gap={1} mb={2}>
            <Button
              variant="outlined"
              onClick={runPredefinedTests}
              fullWidth
              size="small"
            >
              Run Predefined Tests
            </Button>
            <Button
              variant="outlined"
              onClick={runEnvironmentCheck}
              fullWidth
              size="small"
            >
              Environment Info
            </Button>
          </Box>
          
          {/* User Management */}
          <Typography variant="subtitle2" gutterBottom>
            User Management
          </Typography>
          <Box display="flex" flexDirection="column" gap={1} mb={2}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => {
                  authService.clearStorage();
                  setTestResults(prev => [
                    ...prev,
                    {
                      name: 'Mock Storage Cleared',
                      output: { success: true },
                      timestamp: new Date().toISOString()
                    }
                  ]);
                }}
                fullWidth
                size="small"
              >
                Clear Mock User Data
              </Button>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => {
                  authService.createTestUser();
                  setTestResults(prev => [
                    ...prev,
                    {
                      name: 'Test User Created',
                      output: { 
                        success: true,
                        message: 'Created test user. Login with username "testuser" and any password.'
                      },
                      timestamp: new Date().toISOString()
                    }
                  ]);
                }}
                fullWidth
                size="small"
              >
                Create Test User
              </Button>
            </Box>
          </Box>
          
          {/* Test Results */}
          {testResults.length > 0 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" gutterBottom>
                  Test Results
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={clearResults}
                >
                  Clear
                </Button>
              </Box>
              <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {testResults.map((result, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ 
                      p: 1, 
                      mb: 1, 
                      bgcolor: result.error ? 'error.light' : 'success.light',
                      fontSize: '0.75rem'
                    }}
                  >
                    <Typography variant="caption" component="div" fontWeight="bold">
                      {result.name} - {new Date(result.timestamp).toLocaleTimeString()}
                    </Typography>
                    
                    {result.input && (
                      <Box mt={0.5}>
                        <Typography variant="caption" component="div">
                          Input:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{ 
                            m: 0, 
                            p: 0.5, 
                            bgcolor: 'background.paper', 
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            maxHeight: '100px',
                            overflow: 'auto'
                          }}
                        >
                          {JSON.stringify(result.input, null, 2)}
                        </Box>
                      </Box>
                    )}
                    
                    {result.output && (
                      <Box mt={0.5}>
                        <Typography variant="caption" component="div">
                          Output:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{ 
                            m: 0, 
                            p: 0.5, 
                            bgcolor: 'background.paper', 
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            maxHeight: '100px',
                            overflow: 'auto'
                          }}
                        >
                          {JSON.stringify(result.output, null, 2)}
                        </Box>
                      </Box>
                    )}
                    
                    {result.error && (
                      <Box mt={0.5}>
                        <Typography variant="caption" component="div" color="error">
                          Error:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{ 
                            m: 0, 
                            p: 0.5, 
                            bgcolor: 'background.paper', 
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            color: 'error.main',
                            maxHeight: '100px',
                            overflow: 'auto'
                          }}
                        >
                          {result.error}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DebugPanel;