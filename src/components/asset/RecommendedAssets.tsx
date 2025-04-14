import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
  Tooltip,
  IconButton,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Info as InfoIcon,
  FindReplace as FindReplaceIcon,
  LinkOff as LinkOffIcon,
  TrendingUp as TrendingUpIcon,
  Shuffle as ShuffleIcon,
  EmojiObjects as InsightIcon,
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import recommendationService, { 
  RecommendationItem, 
  RecommendationType 
} from '../../api/recommendationService';
import { Asset } from '../../types/asset.types';

// Interface for the component props
interface RecommendedAssetsProps {
  asset: Asset;
  limit?: number;
  showFilters?: boolean;
  height?: number | string;
  refreshInterval?: number; // in milliseconds, if 0 or undefined, won't auto-refresh
  onAssetClick?: (asset: Asset) => void;
}

// Define recommendation type display details
interface RecommendationTypeOption {
  value: RecommendationType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * RecommendedAssets Component
 * Displays asset recommendations based on the current asset and selected criteria
 */
const RecommendedAssets: React.FC<RecommendedAssetsProps> = ({
  asset,
  limit = 4,
  showFilters = true,
  height,
  refreshInterval,
  onAssetClick
}) => {
  const theme = useTheme();
  
  // State
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendationType, setRecommendationType] = useState<RecommendationType>(
    RecommendationType.SIMILAR
  );
  
  // Auto-refresh mechanism
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    
    const interval = setInterval(() => {
      fetchRecommendations();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [asset.id, recommendationType, refreshInterval]);
  
  // Fetch recommendations whenever the asset or type changes
  useEffect(() => {
    fetchRecommendations();
  }, [asset.id, recommendationType]);
  
  // Recommendation type options with icons and descriptions
  const recommendationTypeOptions: RecommendationTypeOption[] = [
    {
      value: RecommendationType.SIMILAR,
      label: 'Similar Assets',
      description: 'Assets that share attributes with the current asset',
      icon: <FindReplaceIcon />
    },
    {
      value: RecommendationType.USED_TOGETHER,
      label: 'Used Together',
      description: 'Assets frequently used alongside the current asset',
      icon: <LinkOffIcon />
    },
    {
      value: RecommendationType.COMPLEMENTARY,
      label: 'Complementary',
      description: 'Assets that complement the current asset',
      icon: <ShuffleIcon />
    },
    {
      value: RecommendationType.TRENDING,
      label: 'Trending',
      description: 'Currently trending assets related to this asset',
      icon: <TrendingUpIcon />
    },
    {
      value: RecommendationType.PERSONALIZED,
      label: 'For You',
      description: 'Personalized recommendations based on your usage',
      icon: <InsightIcon />
    }
  ];
  
  // Get recommendation type details
  const getRecommendationTypeOption = (
    type: RecommendationType
  ): RecommendationTypeOption => {
    return (
      recommendationTypeOptions.find(option => option.value === type) || 
      recommendationTypeOptions[0]
    );
  };
  
  // Fetch recommendations based on the current type
  const fetchRecommendations = async () => {
    if (!asset || !asset.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let recommendationsData: RecommendationItem[] = [];
      
      switch (recommendationType) {
        case RecommendationType.SIMILAR:
          recommendationsData = await recommendationService.getSimilarAssets(
            asset.id,
            { limit }
          );
          break;
        case RecommendationType.USED_TOGETHER:
          recommendationsData = await recommendationService.getAssetsUsedTogether(
            asset.id,
            { limit }
          );
          break;
        case RecommendationType.TRENDING:
          recommendationsData = await recommendationService.getTrendingAssets({
            limit,
            context: { sourceAssetId: asset.id }
          });
          break;
        case RecommendationType.PERSONALIZED:
          recommendationsData = await recommendationService.getPersonalizedRecommendations(
            'current-user', // In a real app, this would be the actual user ID
            { 
              limit,
              context: { sourceAssetId: asset.id }
            }
          );
          break;
        case RecommendationType.COMPLEMENTARY:
          recommendationsData = await recommendationService.getComplementaryAssets(
            asset.id,
            { limit }
          );
          break;
        default:
          recommendationsData = await recommendationService.getSimilarAssets(
            asset.id,
            { limit }
          );
      }
      
      setRecommendations(recommendationsData);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle recommendation type change
  const handleRecommendationTypeChange = (event: SelectChangeEvent<RecommendationType>) => {
    setRecommendationType(event.target.value as RecommendationType);
  };
  
  // Handle asset click
  const handleAssetClick = (clickedAsset: Asset) => {
    if (onAssetClick) {
      onAssetClick(clickedAsset);
    }
  };
  
  // Render recommendation items
  const renderRecommendationItems = () => {
    if (loading) {
      // Show skeletons while loading
      return Array.from(new Array(limit)).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={`skeleton-${index}`}>
          <Card sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
              <Skeleton width="80%" height={24} />
              <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
              <Skeleton width="90%" height={16} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ));
    }
    
    if (error) {
      return (
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.error.light, 0.1),
              border: `1px solid ${theme.palette.error.light}`
            }}
          >
            <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1" color="error" gutterBottom>
              Error Loading Recommendations
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={fetchRecommendations}
            >
              Try Again
            </Button>
          </Paper>
        </Grid>
      );
    }
    
    if (recommendations.length === 0) {
      return (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <InfoIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              No Recommendations Available
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We couldn't find any {getRecommendationTypeOption(recommendationType).label.toLowerCase()} for this asset.
            </Typography>
            {showFilters && (
              <Typography variant="body2" color="text.secondary">
                Try selecting a different recommendation type.
              </Typography>
            )}
          </Paper>
        </Grid>
      );
    }
    
    return recommendations.map((recommendation, index) => (
      <Grid item xs={12} sm={6} md={3} key={`${recommendation.asset.id}-${index}`}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}
        >
          <CardActionArea
            component={Link}
            to={`/assets/${recommendation.asset.id}`}
            onClick={() => handleAssetClick(recommendation.asset)}
            sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
          >
            <CardMedia
              component="img"
              height="140"
              image={
                recommendation.asset.files && 
                recommendation.asset.files.length > 0 && 
                recommendation.asset.files[0].thumbnailUrl
                  ? recommendation.asset.files[0].thumbnailUrl
                  : `https://via.placeholder.com/300x140?text=${encodeURIComponent(recommendation.asset.name)}`
              }
              alt={recommendation.asset.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ mb: 1 }}>
                <Chip 
                  label={recommendation.asset.layer} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              <Typography variant="subtitle1" component="div" gutterBottom noWrap>
                {recommendation.asset.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  height: '2.5em'
                }}
              >
                {recommendation.asset.description || 'No description available.'}
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: alpha(theme.palette.info.light, 0.1),
                  borderRadius: 1,
                  p: 1,
                  mt: 'auto'
                }}
              >
                <Tooltip title={`Reason: ${recommendation.reason.description}`}>
                  <InfoIcon 
                    fontSize="small" 
                    color="info" 
                    sx={{ mr: 1, flexShrink: 0 }} 
                  />
                </Tooltip>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {recommendation.reason.description}
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    ));
  };
  
  return (
    <Box sx={{ height }}>
      {/* Header with filters */}
      {showFilters && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mr: 1 }}>
              Recommended Assets
            </Typography>
            <Tooltip 
              title={getRecommendationTypeOption(recommendationType).description}
              placement="top"
            >
              <InfoIcon fontSize="small" color="action" />
            </Tooltip>
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="recommendation-type-label">Recommendation Type</InputLabel>
            <Select
              labelId="recommendation-type-label"
              id="recommendation-type-select"
              value={recommendationType}
              label="Recommendation Type"
              onChange={handleRecommendationTypeChange}
              disabled={loading}
            >
              {recommendationTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 1 }}>
                      {option.icon}
                    </Box>
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      
      {/* Recommendations grid */}
      <Grid container spacing={2}>
        {renderRecommendationItems()}
      </Grid>
    </Box>
  );
};

export default RecommendedAssets;