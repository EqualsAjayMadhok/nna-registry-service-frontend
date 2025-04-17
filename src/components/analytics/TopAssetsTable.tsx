import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { format, isValid, parseISO } from 'date-fns';
import { TopAssetData } from '../../types/asset.types';

interface TopAssetsTableProps {
  assets: TopAssetData[];
  title?: string;
  maxItems?: number;
  loading?: boolean;
}

/**
 * TopAssetsTable Component displays a table of top performing assets
 */
const TopAssetsTable: React.FC<TopAssetsTableProps> = ({
  assets,
  title = 'Top Assets',
  maxItems = 10,
  loading = false
}) => {
  const theme = useTheme();
  const displayedAssets = assets.slice(0, maxItems);
  
  // Get the highest view count to calculate relative progress bars
  const maxViews = assets.length > 0 
    ? Math.max(...assets.map(asset => asset.views))
    : 1;
  
  // Format date helper
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Unknown';
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get layer color
  const getLayerColor = (layer: string): string => {
    const layerColors: Record<string, string> = {
      'G': theme.palette.primary.main,  // Songs
      'S': theme.palette.secondary.main, // Stars
      'L': theme.palette.success.main,   // Looks
      'M': theme.palette.warning.main,   // Moves
      'W': theme.palette.info.main       // Worlds
    };
    
    return layerColors[layer] || theme.palette.text.primary;
  };
  
  return (
    <Card variant="outlined">
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6' }}
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ width: '100%', p: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Loading top assets data...
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Asset</TableCell>
                  <TableCell>Layer</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Downloads</TableCell>
                  <TableCell align="right">Last Viewed</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No assets data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedAssets.map((asset, index) => (
                    <TableRow key={asset.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}
                          >
                            {/* Position indicator */}
                            <Tooltip title={`Rank #${index + 1}`}>
                              <Typography
                                variant="caption"
                                sx={{
                                  position: 'absolute',
                                  bottom: -4,
                                  right: -8,
                                  bgcolor: 'background.paper',
                                  borderRadius: '50%',
                                  border: `1px solid ${theme.palette.divider}`,
                                  width: 20,
                                  height: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  zIndex: 1
                                }}
                              >
                                {index + 1}
                              </Typography>
                            </Tooltip>
                            
                            {/* Asset thumbnail */}
                            <Avatar
                              src={asset.thumbnailUrl}
                              variant="rounded"
                              sx={{ width: 48, height: 48 }}
                            >
                              <ImageIcon />
                            </Avatar>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              <Link 
                                component={RouterLink} 
                                to={`/assets/${asset.id}`}
                                color="inherit"
                              >
                                {asset.name}
                              </Link>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {asset.nna_address}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={asset.layer} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getLayerColor(asset.layer),
                            color: '#fff',
                            fontWeight: 'bold'
                          }} 
                        />
                      </TableCell>
                      
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
                            {asset.views.toLocaleString()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(asset.views / maxViews) * 100}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 1,
                              backgroundColor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 1,
                                backgroundColor: theme.palette.primary.main
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {asset.downloads.toLocaleString()}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {asset.lastViewedAt ? formatDate(asset.lastViewedAt) : 'Never'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Tooltip title="View Asset">
                          <IconButton
                            size="small"
                            component={RouterLink}
                            to={`/assets/${asset.id}`}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TopAssetsTable;