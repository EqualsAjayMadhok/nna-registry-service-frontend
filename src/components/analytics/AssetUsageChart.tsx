import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface UsageDataPoint {
  date: string;
  views: number;
  downloads: number;
  remixes?: number;
  uniqueUsers?: number;
}

interface AssetUsageChartProps {
  data: UsageDataPoint[];
  title?: string;
  height?: number;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const AssetUsageChart: React.FC<AssetUsageChartProps> = ({
  data,
  title = 'Asset Usage',
  height = 300,
  timeRange = 'month'
}) => {
  const theme = useTheme();

  // Format the dates on the X-axis based on the time range
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    
    switch (timeRange) {
      case 'week':
        // For weekly data, show day of week (e.g., "Mon")
        return date.toLocaleDateString(undefined, { weekday: 'short' });
      case 'month':
        // For monthly data, show day of month (e.g., "15")
        return date.getDate().toString();
      case 'quarter':
        // For quarterly data, show abbreviated month (e.g., "Jan")
        return date.toLocaleDateString(undefined, { month: 'short' });
      case 'year':
        // For yearly data, show month (e.g., "Jan")
        return date.toLocaleDateString(undefined, { month: 'short' });
      default:
        return dateStr;
    }
  };

  // Format the tooltip date
  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ 
          boxShadow: 2,
          p: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}>
          <Typography variant="subtitle2">
            {formatTooltipDate(label)}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={`tooltip-${index}`} sx={{ 
              display: 'flex',
              alignItems: 'center',
              mt: 0.5 
            }}>
              <Box
                component="span"
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  mr: 1
                }}
              />
              <Typography variant="body2" sx={{ mr: 1 }}>
                {entry.name}:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {entry.value.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Card>
      );
    }
    return null;
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ height }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height: title ? 'calc(100% - 30px)' : '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                height={50}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 15 }} />
              <Line
                type="monotone"
                dataKey="views"
                name="Views"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="downloads"
                name="Downloads"
                stroke={theme.palette.secondary.main}
                strokeWidth={2}
              />
              {data[0] && data[0].remixes !== undefined && (
                <Line
                  type="monotone"
                  dataKey="remixes"
                  name="Remixes"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                />
              )}
              {data[0] && data[0].uniqueUsers !== undefined && (
                <Line
                  type="monotone"
                  dataKey="uniqueUsers"
                  name="Unique Users"
                  stroke={theme.palette.info.main}
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssetUsageChart;