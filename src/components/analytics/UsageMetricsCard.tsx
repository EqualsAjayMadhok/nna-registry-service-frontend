import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CloudDownload as DownloadIcon,
  Person as PersonIcon,
  Devices as DevicesIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { AssetUsageMetrics } from '../../types/asset.types';

interface UsageMetricsCardProps {
  metrics: AssetUsageMetrics;
  title?: string;
  loading?: boolean;
}

interface MetricItemProps {
  title: string;
  value: number;
  changePercentage: number;
  icon: React.ReactNode;
  color: string;
}

/**
 * Metric Item component to display a single metric with icon and change indicator
 */
const MetricItem: React.FC<MetricItemProps> = ({ 
  title, 
  value, 
  changePercentage, 
  icon,
  color
}) => {
  const theme = useTheme();
  const isPositive = changePercentage >= 0;
  
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: `${color}20`,
              color: color,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'medium' }}>
          {value.toLocaleString()}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
          {isPositive ? (
            <TrendingUpIcon 
              fontSize="small" 
              sx={{ color: theme.palette.success.main, mr: 0.5 }}
            />
          ) : (
            <TrendingDownIcon 
              fontSize="small" 
              sx={{ color: theme.palette.error.main, mr: 0.5 }}
            />
          )}
          
          <Typography
            variant="body2"
            sx={{
              color: isPositive ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 'medium'
            }}
          >
            {isPositive ? '+' : ''}{changePercentage.toFixed(1)}%
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            vs. prev. period
          </Typography>
        </Box>
      </Box>
    </Grid>
  );
};

/**
 * UsageMetricsCard Component displays a card with key metrics
 */
const UsageMetricsCard: React.FC<UsageMetricsCardProps> = ({
  metrics,
  title = 'Usage Metrics',
  loading = false
}) => {
  const theme = useTheme();

  // Define metrics with their icons and colors
  const metricsConfig: MetricItemProps[] = [
    {
      title: 'Total Views',
      value: Number(metrics.totalViews || 0),
      changePercentage: Number(metrics.viewsChange || 0),
      icon: <VisibilityIcon />,
      color: theme.palette.primary.main
    },
    {
      title: 'Total Downloads',
      value: Number(metrics.totalDownloads || 0),
      changePercentage: Number(metrics.downloadsChange || 0),
      icon: <DownloadIcon />,
      color: theme.palette.secondary.main
    },
    {
      title: 'Unique Users',
      value: Number(metrics.totalUniqueUsers || metrics.uniqueUsers || 0),
      changePercentage: Number(metrics.uniqueUsersChange || 0),
      icon: <PersonIcon />,
      color: theme.palette.success.main
    },
    {
      title: 'Platforms',
      value: Number(metrics.totalUniquePlatforms || 0),
      changePercentage: 0,
      icon: <DevicesIcon />,
      color: theme.palette.info.main
    }
  ];

  return (
    <Card variant="outlined">
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6' }}
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        <Grid container spacing={0} sx={{ height: '100%' }}>
          {loading ? (
            // Skeleton loading state
            <>
              {[0, 1, 2, 3].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1, mb: 1 }} />
                    <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                    <Skeleton width="80%" height={30} sx={{ mb: 1 }} />
                    <Skeleton width="40%" height={20} />
                  </Box>
                </Grid>
              ))}
            </>
          ) : (
            // Actual metrics
            metricsConfig.map((metric, index) => (
              <React.Fragment key={index}>
                <MetricItem {...metric} />
                {/* Add divider between metrics on mobile */}
                {index < metricsConfig.length - 1 && (
                  <Grid item xs={12} sx={{ display: { sm: 'none' } }}>
                    <Divider />
                  </Grid>
                )}
              </React.Fragment>
            ))
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UsageMetricsCard;