import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  ClearAll as ClearAllIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import AssetUsageChart from '../../components/analytics/AssetUsageChart';
import TopAssetsTable from '../../components/analytics/TopAssetsTable';
import UsageMetricsCard from '../../components/analytics/UsageMetricsCard';
import assetService from '../../services/api/asset.service';
import {
  AssetAnalyticsFilters,
  AssetsByCategoryData,
  AssetsAnalyticsData,
  PlatformUsageData,
  UserActivityData
} from '../../types/asset.types';
import { format, subMonths } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Custom legend for the pie charts
const CustomLegend = ({ 
  payload,
  totalLabel = 'Total',
  total = 0
}: {
  payload?: any[],
  totalLabel?: string,
  total?: number
}) => {
  if (!payload) return null;
  
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      fontSize: '0.875rem',
      p: 1
    }}>
      {payload.map((entry, index) => (
        <Box
          key={`item-${index}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 0.5,
            '&:last-child': { mb: 0 }
          }}
        >
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              mr: 1,
              borderRadius: '50%'
            }}
          />
          <Typography variant="body2" sx={{ mr: 1, flex: 1 }}>
            {entry.value}
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {entry.payload.percentage.toFixed(1)}%
          </Typography>
        </Box>
      ))}
      
      {total > 0 && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" fontWeight="medium">
              {totalLabel}:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {total.toLocaleString()}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

// Custom tooltip for pie charts
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 1.5, 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Typography variant="body2" fontWeight="medium">
          {data.category || data.platform}
        </Typography>
        <Typography variant="body2">
          Count: {data.count || (data.views + data.downloads)}
        </Typography>
        <Typography variant="body2">
          Percentage: {data.percentage.toFixed(1)}%
        </Typography>
      </Paper>
    );
  }
  
  return null;
};

/**
 * Asset Analytics Dashboard Component
 */
const AssetAnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AssetsAnalyticsData | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState<AssetAnalyticsFilters>({
    startDate: subMonths(new Date(), 3),
    endDate: new Date(),
    timeFrame: 'day'
  });
  
  // COLORS for charts
  const CHART_COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light
  ];
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  // Function to fetch analytics data with current filters
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await assetService.getAssetsAnalytics(filters);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    fetchAnalyticsData();
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      startDate: subMonths(new Date(), 3),
      endDate: new Date(),
      timeFrame: 'day'
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (
    name: keyof AssetAnalyticsFilters,
    value: any
  ) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Export data as CSV
  const handleExportData = () => {
    if (!analyticsData) return;
    
    // Generate CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Include date range in the filename
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : 'start';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : 'end';
    const filename = `asset-analytics-${startDateStr}-to-${endDateStr}.csv`;
    
    // Add timeframe data
    csvContent += "Date,Views,Downloads,Unique Users\n";
    analyticsData.usageData.timeseriesData.forEach(item => {
      csvContent += `${item.date},${item.views},${item.downloads},${item.uniqueUsers || 0}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        <Box sx={{ pt: 3, pb: 5 }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4">Asset Analytics</Typography>
            
            <Box>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchAnalyticsData} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Export Data">
                <IconButton onClick={handleExportData} disabled={loading || !analyticsData}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Filters */}
          <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2.5}>
                <DatePicker 
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(newValue) => handleFilterChange('startDate', newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.5}>
                <DatePicker 
                  label="End Date"
                  value={filters.endDate}
                  onChange={(newValue) => handleFilterChange('endDate', newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="timeframe-label">Time Frame</InputLabel>
                  <Select
                    labelId="timeframe-label"
                    id="timeframe-select"
                    value={filters.timeFrame}
                    label="Time Frame"
                    onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
                  >
                    <MenuItem value="day">Daily</MenuItem>
                    <MenuItem value="week">Weekly</MenuItem>
                    <MenuItem value="month">Monthly</MenuItem>
                    <MenuItem value="quarter">Quarterly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="layer-label">Layer</InputLabel>
                  <Select
                    labelId="layer-label"
                    id="layer-select"
                    value={filters.layer || ''}
                    label="Layer"
                    onChange={(e) => handleFilterChange('layer', e.target.value || undefined)}
                  >
                    <MenuItem value="">All Layers</MenuItem>
                    <MenuItem value="G">Songs (G)</MenuItem>
                    <MenuItem value="S">Stars (S)</MenuItem>
                    <MenuItem value="L">Looks (L)</MenuItem>
                    <MenuItem value="M">Moves (M)</MenuItem>
                    <MenuItem value="W">Worlds (W)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={handleApplyFilters}
                  fullWidth
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearAllIcon />}
                  onClick={handleResetFilters}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Usage Metrics */}
          {analyticsData && (
            <UsageMetricsCard
              metrics={analyticsData.usageData.metrics}
              loading={loading}
            />
          )}
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" id="dashboard-tab-0" />
              <Tab label="Usage Trends" id="dashboard-tab-1" />
              <Tab label="Top Assets" id="dashboard-tab-2" />
              <Tab label="Asset Distribution" id="dashboard-tab-3" />
              <Tab label="User Activity" id="dashboard-tab-4" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            {analyticsData ? (
              <>
                <Grid container spacing={3}>
                  {/* Main usage chart */}
                  <Grid item xs={12} lg={8}>
                    <AssetUsageChart
                      data={analyticsData.usageData.timeseriesData}
                      title="Asset Usage Over Time"
                      height={350}
                    />
                  </Grid>
                  
                  {/* Assets by layer pie chart */}
                  <Grid item xs={12} md={6} lg={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ height: 350 }}>
                        <Typography variant="h6" gutterBottom>
                          Assets by Layer
                        </Typography>
                        <Box sx={{ height: '90%', display: 'flex', alignItems: 'center' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={Object.entries(analyticsData.assetsByLayer).map(([key, value]) => ({
                                  category: key,
                                  count: value,
                                  percentage: (value / analyticsData.totalAssets) * 100
                                }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="count"
                                nameKey="category"
                                label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                                labelLine={false}
                              >
                                {Object.keys(analyticsData.assetsByLayer).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip content={<CustomPieTooltip />} />
                              <Legend 
                                content={
                                  <CustomLegend 
                                    totalLabel="Total Assets" 
                                    total={analyticsData.totalAssets} 
                                  />
                                } 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Platform usage chart */}
                  <Grid item xs={12} md={6} lg={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ height: 350 }}>
                        <Typography variant="h6" gutterBottom>
                          Platform Usage
                        </Typography>
                        <Box sx={{ height: '90%', display: 'flex', alignItems: 'center' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.platformUsage}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="views"
                                nameKey="platform"
                              >
                                {analyticsData.platformUsage.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip content={<CustomPieTooltip />} />
                              <Legend 
                                content={
                                  <CustomLegend 
                                    totalLabel="Total Views" 
                                    total={analyticsData.usageData.metrics.totalViews} 
                                  />
                                } 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* User activity chart */}
                  <Grid item xs={12} md={6} lg={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ height: 350 }}>
                        <Typography variant="h6" gutterBottom>
                          User Activity
                        </Typography>
                        <Box sx={{ height: '90%' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analyticsData.userActivity.slice(-7)} // Last 7 data points
                              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={50}
                              />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar 
                                dataKey="newUsers" 
                                name="New Users" 
                                stackId="a" 
                                fill={theme.palette.primary.main} 
                              />
                              <Bar 
                                dataKey="returningUsers" 
                                name="Returning Users" 
                                stackId="a" 
                                fill={theme.palette.secondary.main} 
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Category distribution */}
                  <Grid item xs={12} md={6} lg={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ height: 350 }}>
                        <Typography variant="h6" gutterBottom>
                          Category Distribution
                        </Typography>
                        <Box sx={{ height: '90%' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analyticsData.assetsByCategory}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis 
                                dataKey="category" 
                                type="category" 
                                width={80}
                                tick={{ fontSize: 12 }}
                              />
                              <RechartsTooltip />
                              <Bar 
                                dataKey="count" 
                                fill={theme.palette.primary.main}
                                background={{ fill: theme.palette.grey[100] }}
                                radius={[0, 4, 4, 0]}
                                label={{ 
                                  position: 'right', 
                                  formatter: (value: number) => value 
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Top assets mini table */}
                  <Grid item xs={12} lg={8}>
                    <TopAssetsTable 
                      assets={analyticsData.topAssets}
                      title="Top Assets"
                      maxItems={5}
                      loading={loading}
                    />
                  </Grid>
                </Grid>
              </>
            ) : loading ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography>Loading analytics data...</Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography>No analytics data available</Typography>
                <Button 
                  variant="contained" 
                  onClick={fetchAnalyticsData} 
                  sx={{ mt: 2 }}
                >
                  Refresh Data
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Usage Trends Tab */}
          <TabPanel value={tabValue} index={1}>
            {analyticsData && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <AssetUsageChart
                    data={analyticsData.usageData.timeseriesData}
                    title="Asset Usage Over Time"
                    height={500}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: 400 }}>
                      <Typography variant="h6" gutterBottom>
                        Views vs Downloads
                      </Typography>
                      <Box sx={{ height: '90%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={analyticsData.usageData.timeseriesData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <RechartsTooltip />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="views"
                              stroke={theme.palette.primary.main}
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="downloads"
                              stroke={theme.palette.secondary.main}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: 400 }}>
                      <Typography variant="h6" gutterBottom>
                        Monthly Growth
                      </Typography>
                      <Box sx={{ height: '90%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analyticsData.usageData.timeseriesData
                              .filter((_, i) => i % 30 === 0) // Approximate monthly data points
                              .map((item, index, array) => {
                                // Calculate growth percentages
                                const prevItem = index > 0 ? array[index - 1] : null;
                                return {
                                  date: item.date,
                                  views: item.views,
                                  viewsGrowth: prevItem ? ((item.views - prevItem.views) / prevItem.views) * 100 : 0
                                };
                              })}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar 
                              dataKey="views" 
                              fill={theme.palette.primary.main} 
                              name="Views"
                            />
                            <Bar 
                              dataKey="viewsGrowth" 
                              fill={theme.palette.success.main} 
                              name="Growth (%)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* Top Assets Tab */}
          <TabPanel value={tabValue} index={2}>
            {analyticsData && (
              <TopAssetsTable 
                assets={analyticsData.topAssets}
                title="Top Assets by Usage"
                maxItems={20}
                loading={loading}
              />
            )}
          </TabPanel>

          {/* Asset Distribution Tab */}
          <TabPanel value={tabValue} index={3}>
            {analyticsData && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: 500 }}>
                      <Typography variant="h6" gutterBottom>
                        Assets by Layer
                      </Typography>
                      <Box sx={{ height: '90%', display: 'flex', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(analyticsData.assetsByLayer).map(([key, value]) => ({
                                category: key,
                                count: value,
                                percentage: (value / analyticsData.totalAssets) * 100
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={100}
                              outerRadius={140}
                              paddingAngle={2}
                              dataKey="count"
                              nameKey="category"
                              label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                            >
                              {Object.keys(analyticsData.assetsByLayer).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomPieTooltip />} />
                            <Legend 
                              content={
                                <CustomLegend 
                                  totalLabel="Total Assets" 
                                  total={analyticsData.totalAssets} 
                                />
                              } 
                              layout="vertical" 
                              verticalAlign="middle" 
                              align="right"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: 500 }}>
                      <Typography variant="h6" gutterBottom>
                        Assets by Category
                      </Typography>
                      <Box sx={{ height: '90%', display: 'flex', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.assetsByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={100}
                              outerRadius={140}
                              paddingAngle={2}
                              dataKey="count"
                              nameKey="category"
                              label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                            >
                              {analyticsData.assetsByCategory.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomPieTooltip />} />
                            <Legend 
                              content={
                                <CustomLegend 
                                  totalLabel="Total Assets" 
                                  total={analyticsData.totalAssets} 
                                />
                              } 
                              layout="vertical" 
                              verticalAlign="middle" 
                              align="right"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: 400 }}>
                      <Typography variant="h6" gutterBottom>
                        Distribution by Category
                      </Typography>
                      <Box sx={{ height: '90%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analyticsData.assetsByCategory}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar 
                              dataKey="count" 
                              name="Assets"
                              fill={theme.palette.primary.main} 
                              label={{ 
                                position: 'top', 
                                formatter: (value: number) => value 
                              }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* User Activity Tab */}
          <TabPanel value={tabValue} index={4}>
            {analyticsData && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: 400 }}>
                      <Typography variant="h6" gutterBottom>
                        User Activity Over Time
                      </Typography>
                      <Box sx={{ height: '90%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={analyticsData.userActivity}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="activeUsers" 
                              stackId="1"
                              stroke={theme.palette.primary.main} 
                              fill={theme.palette.primary.light} 
                              name="Active Users"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="newUsers" 
                              stackId="2"
                              stroke={theme.palette.success.main} 
                              fill={theme.palette.success.light}
                              name="New Users" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="returningUsers" 
                              stackId="3"
                              stroke={theme.palette.secondary.main} 
                              fill={theme.palette.secondary.light}
                              name="Returning Users" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: 400 }}>
                      <Typography variant="h6" gutterBottom>
                        New vs Returning Users
                      </Typography>
                      <Box sx={{ height: '90%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { 
                                  name: 'New Users',
                                  value: analyticsData.userActivity.reduce((sum, item) => sum + item.newUsers, 0),
                                  percentage: 25 // Mock percentage
                                },
                                { 
                                  name: 'Returning Users',
                                  value: analyticsData.userActivity.reduce((sum, item) => sum + item.returningUsers, 0),
                                  percentage: 75 // Mock percentage
                                }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={140}
                              paddingAngle={0}
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percentage }) => `${name} (${percentage}%)`}
                            >
                              <Cell fill={theme.palette.success.main} />
                              <Cell fill={theme.palette.secondary.main} />
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: 400 }}>
                      <Typography variant="h6" gutterBottom>
                        Platform Usage
                      </Typography>
                      <Box sx={{ height: '90%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analyticsData.platformUsage}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="platform" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar 
                              dataKey="views" 
                              name="Views" 
                              fill={theme.palette.primary.main} 
                            />
                            <Bar 
                              dataKey="downloads" 
                              name="Downloads" 
                              fill={theme.palette.secondary.main} 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default AssetAnalyticsDashboard;