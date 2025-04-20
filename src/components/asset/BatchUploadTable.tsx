import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Button,
  LinearProgress,
  Tooltip,
  Badge,
  Link,
  useTheme,
  Collapse,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Refresh as RetryIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CloudOff as CancelIcon,
  ViewList as ViewDetailsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as ClockIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { BatchUploadItem, Asset, AssetFile } from '../../types/asset.types';
import { formatDistance } from 'date-fns';

// Props for the BatchUploadTable component
interface BatchUploadTableProps {
  items: BatchUploadItem[];
  onRetry: (itemId: string) => void;
  onCancel: (itemId: string) => void;
  onClear: (itemId: string) => void;
  onViewAsset: (asset: Asset) => void;
}

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <SuccessIcon color="success" />;
    case 'error':
      return <ErrorIcon color="error" />;
    case 'cancelled':
      return <CancelIcon color="warning" />;
    case 'uploading':
      return <SpeedIcon color="primary" />;
    case 'pending':
    default:
      return <ClockIcon color="disabled" />;
  }
};

// Helper function to get status label with appropriate color
const StatusLabel: React.FC<{ status: string }> = ({ status }) => {
  let color: 'success' | 'error' | 'warning' | 'primary' | 'default' = 'default';
  let label = 'Unknown';
  
  switch (status) {
    case 'completed':
      color = 'success';
      label = 'Completed';
      break;
    case 'error':
      color = 'error';
      label = 'Failed';
      break;
    case 'cancelled':
      color = 'warning';
      label = 'Cancelled';
      break;
    case 'uploading':
      color = 'primary';
      label = 'Uploading';
      break;
    case 'pending':
      color = 'default';
      label = 'Pending';
      break;
  }
  
  return (
    <Chip 
      size="small"
      label={label} 
      color={color} 
      icon={getStatusIcon(status)}
      variant="outlined"
    />
  );
};

/**
 * Duration display component
 */
const Duration: React.FC<{ startTime?: number, endTime?: number }> = ({ startTime, endTime }) => {
  const formattedDuration = useMemo(() => {
    if (!startTime) return 'N/A';
    const end = endTime || Date.now();
    return formatDistance(startTime, end, { addSuffix: false, includeSeconds: true });
  }, [startTime, endTime]);
  
  if (!startTime) return null;
  
  return (
    <Typography variant="body2" color="text.secondary">
      {formattedDuration}
    </Typography>
  );
};

/**
 * File thumbnail component
 */
const FileThumbnail: React.FC<{ file: File, size?: number }> = ({ file, size = 40 }) => {
  const getFileTypeIcon = () => {
    if (file.type.startsWith('image/')) {
      // For images, create a thumbnail
      try {
        return (
          <Box
            component="img"
            src={URL.createObjectURL(file)}
            alt={file.name}
            sx={{
              width: size,
              height: size,
              objectFit: 'cover',
              borderRadius: 1
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      } catch (e) {
        // Fall back to file type display
        return (
          <Box
            sx={{
              width: size,
              height: size,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f1f1',
              borderRadius: 1,
              fontSize: '0.7rem',
              fontWeight: 'bold',
              color: '#555'
            }}
          >
            IMG
          </Box>
        );
      }
    }
    
    // For other file types, display the type abbreviation
    let type = 'FILE';
    
    if (file.type.startsWith('audio/')) {
      type = 'AUD';
    } else if (file.type.startsWith('video/')) {
      type = 'VID';
    } else if (file.type.startsWith('text/')) {
      type = 'TXT';
    } else if (file.type.includes('pdf')) {
      type = 'PDF';
    } else if (file.type.includes('zip') || file.type.includes('archive')) {
      type = 'ZIP';
    }
    
    return (
      <Box
        sx={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f1f1f1',
          borderRadius: 1,
          fontSize: '0.7rem',
          fontWeight: 'bold',
          color: '#555'
        }}
      >
        {type}
      </Box>
    );
  };
  
  return getFileTypeIcon();
};

/**
 * Main BatchUploadTable component
 */
const BatchUploadTable: React.FC<BatchUploadTableProps> = ({
  items,
  onRetry,
  onCancel,
  onClear,
  onViewAsset
}) => {
  const theme = useTheme();
  
  // State for table pagination and sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof BatchUploadItem>('startTime');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  // State for expanded row details
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  
  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle sorting changes
  const handleRequestSort = (property: keyof BatchUploadItem) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle row expansion toggle
  const handleExpandRow = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const pending = items.filter(item => item.status === 'pending').length;
    const uploading = items.filter(item => item.status === 'uploading').length;
    const completed = items.filter(item => item.status === 'completed').length;
    const failed = items.filter(item => item.status === 'error').length;
    const cancelled = items.filter(item => item.status === 'cancelled').length;
    
    const totalItems = items.length;
    const finishedItems = completed + failed + cancelled;
    const overallProgress = totalItems > 0 
      ? Math.round((finishedItems / totalItems) * 100)
      : 0;
    
    // Calculate average speed
    const uploadedItems = items.filter(item => item.endTime && item.startTime);
    let avgSpeed = 'N/A';
    
    if (uploadedItems.length > 0) {
      const totalBytes = uploadedItems.reduce((sum, item) => sum + item.file.size, 0);
      const totalMs = uploadedItems.reduce((sum, item) => {
        if (item.endTime && item.startTime) {
          return sum + (item.endTime - item.startTime);
        }
        return sum;
      }, 0);
      
      if (totalMs > 0) {
        const bytesPerMs = totalBytes / totalMs;
        const bytesPerSec = bytesPerMs * 1000;
        
        if (bytesPerSec > 1024 * 1024) {
          avgSpeed = `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
        } else if (bytesPerSec > 1024) {
          avgSpeed = `${(bytesPerSec / 1024).toFixed(2)} KB/s`;
        } else {
          avgSpeed = `${bytesPerSec.toFixed(2)} B/s`;
        }
      }
    }
    
    return {
      pending,
      uploading,
      completed,
      failed,
      cancelled,
      totalItems,
      finishedItems,
      overallProgress,
      avgSpeed
    };
  }, [items]);
  
  // Sort and paginate items
  const sortedItems = useMemo(() => {
    const compareFunction = (a: BatchUploadItem, b: BatchUploadItem) => {
      if (orderBy === 'startTime' || orderBy === 'endTime') {
        const aValue = a[orderBy] || 0;
        const bValue = b[orderBy] || 0;
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Default string comparison for other fields
      const aValue = a[orderBy] as any;
      const bValue = b[orderBy] as any;
      
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    };
    
    return [...items].sort(compareFunction);
  }, [items, order, orderBy]);
  
  const paginatedItems = useMemo(() => {
    return rowsPerPage > 0
      ? sortedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : sortedItems;
  }, [sortedItems, page, rowsPerPage]);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Render the overall status section
  const renderStatusSummary = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Batch Upload Status
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.overallProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {metrics.overallProgress}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {metrics.finishedItems} of {metrics.totalItems} items processed
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Average Upload Speed
            </Typography>
            <Typography variant="body1">
              {metrics.avgSpeed}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                icon={<ClockIcon />} 
                label={`${metrics.pending} Pending`} 
                variant="outlined"
                size="small"
              />
              <Chip 
                icon={<SpeedIcon />} 
                label={`${metrics.uploading} Uploading`} 
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip 
                icon={<SuccessIcon />} 
                label={`${metrics.completed} Completed`} 
                color="success"
                variant="outlined"
                size="small"
              />
              <Chip 
                icon={<ErrorIcon />} 
                label={`${metrics.failed} Failed`} 
                color="error"
                variant="outlined"
                size="small"
              />
              <Chip 
                icon={<CancelIcon />} 
                label={`${metrics.cancelled} Cancelled`} 
                color="warning"
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  return (
    <Box>
      {/* Status summary */}
      {renderStatusSummary()}
      
      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '5%' }}></TableCell>
              <TableCell sx={{ width: '5%' }}>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '40%' }}>File</TableCell>
              <TableCell sx={{ width: '15%' }}>Layer</TableCell>
              <TableCell sx={{ width: '15%' }}>
                <TableSortLabel
                  active={orderBy === 'progress'}
                  direction={orderBy === 'progress' ? order : 'asc'}
                  onClick={() => handleRequestSort('progress')}
                >
                  Progress
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '20%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" sx={{ py: 3 }}>
                    No items to display
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map(item => (
                <React.Fragment key={item.id}>
                  <TableRow 
                    hover 
                    sx={{ 
                      '&:hover': { 
                        bgcolor: theme.palette.action.hover 
                      },
                      bgcolor: expandedItemId === item.id ? theme.palette.action.selected : 'inherit'
                    }}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleExpandRow(item.id)}
                      >
                        {expandedItemId === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <StatusLabel status={item.status} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FileThumbnail file={item.file} />
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {item.file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(item.file.size)} • {item.file.type || 'Unknown type'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${item.metadata.layer}${item.metadata.category ? `.${item.metadata.category}` : ''}${item.metadata.subcategory ? `.${item.metadata.subcategory}` : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '75%', mr: 1 }}>
                          <LinearProgress
                            variant={item.status === 'uploading' ? 'determinate' : 'determinate'}
                            value={item.progress}
                            color={
                              item.status === 'completed' ? 'success' :
                              item.status === 'error' ? 'error' :
                              item.status === 'cancelled' ? 'warning' : 'primary'
                            }
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {item.status === 'completed' && item.asset && (
                          <Tooltip title="View Asset">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => item.asset && onViewAsset(item.asset)}
                            >
                              <ViewDetailsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {item.status === 'error' && (
                          <Tooltip title="Retry">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onRetry(item.id)}
                            >
                              <RetryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {(item.status === 'pending' || item.status === 'uploading') && (
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => onCancel(item.id)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {(item.status === 'completed' || item.status === 'error' || item.status === 'cancelled') && (
                          <Tooltip title="Clear">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onClear(item.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Details">
                          <IconButton
                            size="small"
                            onClick={() => handleExpandRow(item.id)}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded details row */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedItemId === item.id} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 3, px: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Asset Details
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                Metadata
                              </Typography>
                              
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="body2">
                                  <strong>Name:</strong> {item.metadata.name || 'Auto-generated'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Layer:</strong> {item.metadata.layer}
                                  {item.metadata.category && ` > ${item.metadata.category}`}
                                  {item.metadata.subcategory && ` > ${item.metadata.subcategory}`}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Description:</strong> {item.metadata.description || 'None'}
                                </Typography>
                                
                                {item.metadata.tags && item.metadata.tags.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                      <strong>Tags:</strong>
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                      {item.metadata.tags.map((tag, index) => (
                                        <Chip key={index} label={tag} size="small" />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                Upload Information
                              </Typography>
                              
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="body2">
                                  <strong>File:</strong> {item.file.name} ({formatFileSize(item.file.size)})
                                </Typography>
                                
                                <Typography variant="body2">
                                  <strong>Status:</strong> <StatusLabel status={item.status} />
                                </Typography>
                                
                                <Typography variant="body2">
                                  <strong>Progress:</strong> {item.progress}%
                                </Typography>
                                
                                {item.startTime && (
                                  <Typography variant="body2">
                                    <strong>Started:</strong> {new Date(item.startTime).toLocaleString()}
                                  </Typography>
                                )}
                                
                                {item.endTime && (
                                  <Typography variant="body2">
                                    <strong>Completed:</strong> {new Date(item.endTime).toLocaleString()}
                                  </Typography>
                                )}
                                
                                {item.startTime && (
                                  <Typography variant="body2">
                                    <strong>Duration:</strong> <Duration startTime={item.startTime} endTime={item.endTime} />
                                  </Typography>
                                )}
                                
                                {item.error && (
                                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                    <strong>Error:</strong> {item.error}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                            
                            {item.asset && (
                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" gutterBottom>
                                  Created Asset
                                </Typography>
                                
                                <Box sx={{ ml: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Asset ID:</strong> {item.asset.id}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>NNA Address:</strong> {item.asset.nna_address}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Created:</strong> {item.asset.createdAt ? new Date(item.asset.createdAt).toLocaleString() : 'N/A'}
                                  </Typography>
                                  
                                  <Button 
                                    variant="outlined"
                                    size="small" 
                                    color="primary"
                                    sx={{ mt: 1 }}
                                    onClick={() => onViewAsset(item.asset!)}
                                  >
                                    View Asset Details
                                  </Button>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={items.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default BatchUploadTable;