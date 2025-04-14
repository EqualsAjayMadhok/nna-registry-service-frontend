import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Grid,
  Alert,
  Link,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  CloudUpload, 
  DataArray, 
  TaskAlt, 
  Download, 
  ContentCopy,
  PlayArrow,
  Pause,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import assetService from '../../services/api/asset.service';
import { 
  BatchUploadItem, 
  BatchItemMetadata,
  BatchUploadResult,
  Asset
} from '../../types/asset.types';
import BatchUploadTable from '../../components/asset/BatchUploadTable';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

/**
 * BatchUploadPage component for uploading multiple assets at once
 * with CSV metadata support
 */
const BatchUploadPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [csvMetadata, setCsvMetadata] = useState<string | null>(null);
  const [batchItems, setBatchItems] = useState<BatchUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<BatchUploadResult | null>(null);
  const [autoStart, setAutoStart] = useState(true);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  
  // Get CSV template for download
  const csvTemplate = useMemo(() => assetService.getCSVTemplate(), []);
  
  // Handle file drop for batch uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out any existing files to avoid duplicates
    const existingFilenames = selectedFiles.map(f => f.name);
    const newFiles = acceptedFiles.filter(f => !existingFilenames.includes(f.name));
    
    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  }, [selectedFiles]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': [],
      'video/*': [],
      'image/*': [],
      'application/json': [],
      'model/gltf+json': [],
      'model/gltf-binary': [],
      'application/octet-stream': [],
      'application/pdf': []
    }
  });
  
  // Handle CSV file selection
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvMetadata(content);
        
        // Parse the CSV content
        const parsedResult = assetService.parseCSVForBatchUpload(content);
        
        if ('error' in parsedResult) {
          setError(`Error parsing CSV: ${parsedResult.error}`);
        } else {
          // Match metadata with files
          prepareBatchItems(parsedResult);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading CSV file');
      };
      
      reader.readAsText(file);
    }
  };
  
  // Prepare batch items by matching files with metadata
  const prepareBatchItems = (metadataItems: BatchItemMetadata[]) => {
    // Create a map of filenames to metadata
    const metadataMap = new Map<string, BatchItemMetadata>();
    metadataItems.forEach(item => {
      // The filename field is expected to be part of the CSV
      const filename = Object.entries(item).find(([key]) => 
        key.toLowerCase() === 'filename'
      )?.[1] as string;
      
      if (filename) {
        metadataMap.set(filename, item);
      }
    });
    
    // Match files with metadata and create batch items
    const items: BatchUploadItem[] = [];
    const unmatchedFiles: File[] = [];
    const unmatchedMetadata: string[] = [];
    
    // Check each selected file
    selectedFiles.forEach(file => {
      const metadata = metadataMap.get(file.name);
      
      if (metadata) {
        // Create a batch item with file and metadata
        items.push({
          id: uuidv4(),
          file,
          metadata,
          status: 'pending',
          progress: 0
        });
        
        // Remove from map to track which metadata entries were matched
        metadataMap.delete(file.name);
      } else {
        // File has no metadata
        unmatchedFiles.push(file);
      }
    });
    
    // Track unmatched metadata entries
    metadataMap.forEach((_, filename) => {
      unmatchedMetadata.push(filename);
    });
    
    // Update batch items
    setBatchItems(items);
    
    // Show warnings about unmatched files or metadata
    if (unmatchedFiles.length > 0 || unmatchedMetadata.length > 0) {
      let warningMessage = '';
      
      if (unmatchedFiles.length > 0) {
        warningMessage += `${unmatchedFiles.length} files have no matching metadata: ${unmatchedFiles.map(f => f.name).join(', ')}. `;
      }
      
      if (unmatchedMetadata.length > 0) {
        warningMessage += `${unmatchedMetadata.length} metadata entries have no matching files: ${unmatchedMetadata.join(', ')}.`;
      }
      
      setError(warningMessage);
    } else {
      setError(null);
    }
    
    // Auto-advance to review step if we have items
    if (items.length > 0) {
      setActiveStep(1);
    }
  };
  
  // Download CSV template
  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate.example], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nna_asset_batch_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Copy CSV template to clipboard
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(csvTemplate.example)
      .then(() => {
        // Success notification could be added here
      })
      .catch(err => {
        setError(`Failed to copy template: ${err.message}`);
      });
  };
  
  // Generate CSV with metadata for selected files
  const handleGenerateMetadataForFiles = () => {
    if (selectedFiles.length === 0) {
      setError('No files selected');
      return;
    }
    
    // Create header row from template
    const header = csvTemplate.fields.map((field: { name: string }) => field.name).join(',');
    
    // Create a row for each file with default values
    const rows = selectedFiles.map(file => {
      // Default to generic values
      return [
        file.name,                           // filename
        file.name.replace(/\.[^/.]+$/, ""),  // name (remove extension)
        '',                                  // layer (required, but must be selected)
        '',                                  // category
        '',                                  // subcategory
        `Description for ${file.name}`,      // description
        '',                                  // tags
        'ReViz',                             // source
        'CC-BY',                             // license
        'false',                             // attributionRequired
        '',                                  // attributionText
        'true'                               // commercialUse
      ].join(',');
    });
    
    // Create CSV content
    const csvContent = [header, ...rows].join('\n');
    setCsvMetadata(csvContent);
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nna_asset_batch.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Start batch upload
  const startBatchUpload = () => {
    if (batchItems.length === 0) {
      setError('No items to upload');
      return;
    }
    
    setIsUploading(true);
    setIsPaused(false);
    setError(null);
    
    // Reset any previous results
    setBatchResult(null);
    
    // Start the batch upload process
    assetService.batchUploadAssets(batchItems, {
      maxConcurrentUploads: 3,
      onItemStart: (itemId: string) => {
        setBatchItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, status: 'uploading', startTime: Date.now() } 
              : item
          )
        );
      },
      onItemProgress: (itemId: string, progress: number) => {
        setBatchItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, progress } : item
          )
        );
      },
      onItemComplete: (itemId: string, asset: Asset) => {
        setBatchItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  status: 'completed', 
                  progress: 100, 
                  asset, 
                  endTime: Date.now() 
                } 
              : item
          )
        );
      },
      onItemError: (itemId: string, error: string) => {
        setBatchItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  status: 'error', 
                  error, 
                  endTime: Date.now() 
                } 
              : item
          )
        );
      },
      onBatchProgress: (completed: number, total: number) => {
        // We don't need to update anything here as the items list already has the status
      },
      onBatchComplete: (results: BatchUploadResult) => {
        setIsUploading(false);
        setBatchResult(results);
        setActiveStep(2); // Move to completion step
      }
    })
    .then(results => {
      // This will be called after the batch is complete
      console.log('Batch upload complete', results);
    })
    .catch(error => {
      setIsUploading(false);
      setError(`Batch upload failed: ${error.message}`);
    });
  };
  
  // Pause batch upload
  const pauseBatchUpload = () => {
    setIsPaused(true);
    // In a real implementation, you would pause the upload queue
  };
  
  // Resume batch upload
  const resumeBatchUpload = () => {
    setIsPaused(false);
    // In a real implementation, you would resume the upload queue
  };
  
  // Cancel batch upload
  const cancelBatchUpload = () => {
    // Cancel all pending and uploading items
    const updatedItems = batchItems.map(item => {
      if (item.status === 'pending' || item.status === 'uploading') {
        // Cancel any active uploads
        if (item.status === 'uploading') {
          assetService.cancelBatchUploadItem(item.id);
        }
        
        return {
          ...item,
          status: 'cancelled' as const,
          endTime: Date.now()
        };
      }
      return item;
    });
    
    setBatchItems(updatedItems);
    setIsUploading(false);
    setIsPaused(false);
  };
  
  // Retry failed items
  const retryFailedItems = () => {
    // Find all failed items
    const failedItems = batchItems.filter(item => item.status === 'error');
    
    if (failedItems.length === 0) {
      setError('No failed items to retry');
      return;
    }
    
    // Reset status to pending
    const updatedItems = batchItems.map(item => 
      item.status === 'error'
        ? { ...item, status: 'pending' as const, progress: 0, error: undefined }
        : item
    );
    
    setBatchItems(updatedItems);
    
    // Start upload if auto-start is enabled
    setIsUploading(true);
    setIsPaused(false);
    setError(null);
    
    // Continue with the upload process
    startBatchUpload();
  };
  
  // Handle retry for a specific item
  const handleRetryItem = (itemId: string) => {
    // Reset the item status
    setBatchItems(prev => 
      prev.map(item => 
        item.id === itemId
          ? { ...item, status: 'pending' as const, progress: 0, error: undefined }
          : item
      )
    );
    
    // If not already uploading, start the upload
    if (!isUploading) {
      setIsUploading(true);
      startBatchUpload();
    }
  };
  
  // Handle cancel for a specific item
  const handleCancelItem = (itemId: string) => {
    // Cancel the upload
    assetService.cancelBatchUploadItem(itemId);
    
    // Update status
    setBatchItems(prev => 
      prev.map(item => 
        item.id === itemId
          ? { ...item, status: 'cancelled' as const, endTime: Date.now() }
          : item
      )
    );
  };
  
  // Clear a specific item
  const handleClearItem = (itemId: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  // View asset details
  const handleViewAsset = (asset: Asset) => {
    navigate(`/assets/${asset.id}`);
  };
  
  // Render the file selection step
  const renderFileSelectionStep = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Select Files
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box 
              {...getRootProps()} 
              sx={{
                border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 1,
                py: 8,
                px: 2,
                textAlign: 'center',
                backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select files'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported file types: images, audio, video, 3D models, documents
              </Typography>
            </Box>
            
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {selectedFiles.length} files selected
                </Typography>
                <Box sx={{ maxHeight: '200px', overflowY: 'auto', mt: 1 }}>
                  {selectedFiles.map((file, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '200px' }}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small" 
                  onClick={() => setSelectedFiles([])}
                  sx={{ mt: 2 }}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Metadata Options
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Upload CSV" />
              <Tab label="Generate CSV" />
              <Tab label="CSV Template" />
            </Tabs>
            
            {activeTab === 0 && (
              <Box>
                <Typography variant="body2" paragraph>
                  Upload a CSV file containing metadata for your assets. The CSV should include a header row and one row per file.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DataArray />}
                  onClick={() => csvFileInputRef.current?.click()}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Upload CSV File
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  ref={csvFileInputRef}
                  onChange={handleCsvUpload}
                />
                
                {csvMetadata && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    CSV file loaded successfully.
                  </Alert>
                )}
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                <Typography variant="body2" paragraph>
                  Generate a CSV template based on your selected files. This will create a CSV file with one row per file.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DataArray />}
                  onClick={handleGenerateMetadataForFiles}
                  disabled={selectedFiles.length === 0}
                  fullWidth
                >
                  Generate CSV for Selected Files
                </Button>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  After generating, download the CSV, fill in the required fields, and upload it.
                </Alert>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="body2" paragraph>
                  Download a CSV template with the required fields. Fill this template with your asset metadata.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownloadTemplate}
                    fullWidth
                  >
                    Download Template
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={handleCopyTemplate}
                    fullWidth
                  >
                    Copy to Clipboard
                  </Button>
                </Box>
                
                <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                  Required Fields:
                </Typography>
                <Box sx={{ backgroundColor: 'background.default', p: 2, borderRadius: 1 }}>
                  {csvTemplate.fields
                    .filter((field: { required: boolean }) => field.required)
                    .map((field: { name: string, description: string }, index: number) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {field.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {field.description}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => navigate('/assets')}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => {
            if (selectedFiles.length === 0) {
              setError('Please select files to upload');
              return;
            }
            
            if (!csvMetadata) {
              setError('Please upload or generate a CSV file with metadata');
              return;
            }
            
            // If we have both files and metadata, parse and prepare batch items
            const parsedResult = assetService.parseCSVForBatchUpload(csvMetadata);
            
            if ('error' in parsedResult) {
              setError(`Error parsing CSV: ${parsedResult.error}`);
            } else {
              prepareBatchItems(parsedResult);
            }
          }}
          disabled={selectedFiles.length === 0 || !csvMetadata}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
  
  // Render the review and upload step
  const renderReviewStep = () => (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Review and Upload
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Review your files and metadata before starting the upload process.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Batch Summary
            </Typography>
            <Typography variant="body2">
              <strong>Total Files:</strong> {batchItems.length}
            </Typography>
            <Typography variant="body2">
              <strong>Total Size:</strong> {
                (batchItems.reduce((sum, item) => sum + item.file.size, 0) / (1024 * 1024)).toFixed(2)
              } MB
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  color="primary"
                />
              }
              label="Start upload automatically"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              If enabled, the upload will start as soon as you click Continue
            </Typography>
          </Grid>
        </Grid>
        
        {/* Upload controls */}
        {isUploading ? (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {isPaused ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrow />}
                onClick={resumeBatchUpload}
              >
                Resume Upload
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Pause />}
                onClick={pauseBatchUpload}
              >
                Pause Upload
              </Button>
            )}
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={cancelBatchUpload}
            >
              Cancel Upload
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUpload />}
              onClick={startBatchUpload}
              disabled={batchItems.length === 0}
            >
              Start Upload
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Refresh />}
              onClick={retryFailedItems}
              disabled={!batchItems.some(item => item.status === 'error')}
            >
              Retry Failed
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Batch upload table */}
      <BatchUploadTable
        items={batchItems}
        onRetry={handleRetryItem}
        onCancel={handleCancelItem}
        onClear={handleClearItem}
        onViewAsset={handleViewAsset}
      />
      
      {/* Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => {
            if (isUploading) {
              // Show confirmation before going back
              if (window.confirm('Upload is in progress. Are you sure you want to go back?')) {
                cancelBatchUpload();
                setActiveStep(0);
              }
            } else {
              setActiveStep(0);
            }
          }}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            // Only allow proceeding if all items are completed or there are no pending/uploading items
            const hasIncompleteItems = batchItems.some(
              item => item.status === 'pending' || item.status === 'uploading'
            );
            
            if (hasIncompleteItems) {
              setError('Please complete all uploads before proceeding');
              return;
            }
            
            setActiveStep(2);
          }}
          disabled={
            isUploading || 
            batchItems.some(item => item.status === 'pending' || item.status === 'uploading')
          }
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
  
  // Render the completion step
  const renderCompletionStep = () => {
    // Calculate summary metrics
    const totalAssets = batchItems.length;
    const successfulUploads = batchItems.filter(item => item.status === 'completed').length;
    const failedUploads = batchItems.filter(item => item.status === 'error').length;
    const cancelledUploads = batchItems.filter(item => item.status === 'cancelled').length;
    
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <TaskAlt sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Batch Upload Complete
          </Typography>
          <Typography variant="body1" paragraph>
            Your batch upload has been processed.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="h4">{totalAssets}</Typography>
              <Typography variant="body2" color="text.secondary">Total Assets</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h4" color="success.main">{successfulUploads}</Typography>
              <Typography variant="body2" color="text.secondary">Succeeded</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h4" color="error.main">{failedUploads}</Typography>
              <Typography variant="body2" color="text.secondary">Failed</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h4" color="warning.main">{cancelledUploads}</Typography>
              <Typography variant="body2" color="text.secondary">Cancelled</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                console.log('Upload Training Data clicked');
                // In a real implementation, this would show a dialog or navigate to a training data upload page
                alert('Training data upload would open here');
              }}
              sx={{ fontWeight: 'bold' }}
            >
              Upload Training Data
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/assets')}
            >
              View All Assets
            </Button>
            
            {failedUploads > 0 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setActiveStep(1);
                  retryFailedItems();
                }}
              >
                Retry Failed Uploads
              </Button>
            )}
            
            <Button
              variant="outlined"
              onClick={() => {
                // Reset state and start over
                setSelectedFiles([]);
                setCsvMetadata(null);
                setBatchItems([]);
                setActiveStep(0);
                setError(null);
                setBatchResult(null);
              }}
            >
              Upload More Assets
            </Button>
          </Box>
        </Paper>
        
        {/* Still show the batch table for reference */}
        <Typography variant="h6" gutterBottom>
          Batch Results
        </Typography>
        <BatchUploadTable
          items={batchItems}
          onRetry={handleRetryItem}
          onCancel={handleCancelItem}
          onClear={handleClearItem}
          onViewAsset={handleViewAsset}
        />
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Batch Upload Assets
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Upload multiple assets at once with CSV metadata support. Follow the steps below to complete your batch upload.
      </Typography>
      
      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Select Files & Metadata</StepLabel>
        </Step>
        <Step>
          <StepLabel>Review & Upload</StepLabel>
        </Step>
        <Step>
          <StepLabel>Complete</StepLabel>
        </Step>
      </Stepper>
      
      {/* Step content */}
      {activeStep === 0 && renderFileSelectionStep()}
      {activeStep === 1 && renderReviewStep()}
      {activeStep === 2 && renderCompletionStep()}
    </Container>
  );
};

export default BatchUploadPage;