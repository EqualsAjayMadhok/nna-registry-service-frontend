import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Collections as CollectionsIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  Upload as UploadIcon,
  ViewList as ViewListIcon,
  Category as CategoryIcon,
  DataObject as DataObjectIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
  BugReport as BugReportIcon,
  Numbers as NumbersIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { apiConfig } from '../../services/api/api';

// Drawer width
const drawerWidth = 240;

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [apiConfigOpen, setApiConfigOpen] = useState(false);
  const [realApiUrl, setRealApiUrl] = useState(localStorage.getItem('realApiUrl') || 'http://localhost:3000/api');

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle account menu
  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleLogout = () => {
    handleAccountMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleAccountMenuClose();
    navigate('/profile');
  };

  // Handle API configuration
  const handleApiConfigOpen = () => {
    setApiConfigOpen(true);
  };

  const handleApiConfigClose = () => {
    setApiConfigOpen(false);
  };

  const handleApiConfigSave = () => {
    localStorage.setItem('realApiUrl', realApiUrl);
    // Force reload to apply the new API URL
    window.location.reload();
  };

  // Toggle between mock and real API
  const handleToggleMockData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const useMock = event.target.checked;
    apiConfig.setUseMockData(useMock);
  };

  // Navigation items
  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Browse Assets', icon: <SearchIcon />, path: '/assets' },
    { text: 'Register Asset', icon: <AddIcon />, path: '/assets/new' },
    { text: 'Batch Upload', icon: <UploadIcon />, path: '/assets/batch' },
    { text: 'Organize Assets', icon: <ViewListIcon />, path: '/assets/organize' },
    { text: 'Collections', icon: <CollectionsIcon />, path: '/collections' },
    { text: 'Taxonomy Browser', icon: <CategoryIcon />, path: '/taxonomy' },
    { text: 'Asset Analytics', icon: <DataObjectIcon />, path: '/assets/analytics' },
  ];
  
  // Development and test links
  const testItems = [
    { text: 'Sequential Number Fix', icon: <NumbersIcon />, path: '/test/sequential-numbers' }
  ];

  // Drawer content
  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        <Typography variant="h6" noWrap component="div">
          NNA Registry
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      <List subheader={
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
          <BugReportIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="overline" color="text.secondary">
            Testing & Development
          </Typography>
        </Box>
      }>
        {testItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ mt: 'auto' }} />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleApiConfigOpen}>
            <ListItemIcon><ApiIcon /></ListItemIcon>
            <ListItemText 
              primary="API Configuration" 
              secondary={apiConfig.useMockData ? "Using Mock Data" : "Using Real API"}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            NNA Registry Service
          </Typography>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User account */}
          <Tooltip title="Account">
            <IconButton
              color="inherit"
              onClick={handleAccountMenuOpen}
              aria-controls="account-menu"
              aria-haspopup="true"
            >
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
          <Menu
            id="account-menu"
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ChevronLeftIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer - responsive */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
        }}
      >
        {/* API configuration banner when using mock data */}
        {apiConfig.useMockData && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 1, 
              mb: 2, 
              backgroundColor: 'rgba(255, 152, 0, 0.1)', 
              border: '1px solid rgba(255, 152, 0, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="body2" color="textSecondary">
              <strong>Using Mock Data Mode</strong> - Data is not persistent and changes will not be saved to a real backend.
            </Typography>
            <Button 
              size="small" 
              variant="outlined" 
              color="warning"
              onClick={handleApiConfigOpen}
              startIcon={<ApiIcon />}
            >
              Configure API
            </Button>
          </Paper>
        )}
        
        {children || <Outlet />}
      </Box>
      
      {/* API Configuration Dialog */}
      <Dialog open={apiConfigOpen} onClose={handleApiConfigClose} maxWidth="sm" fullWidth>
        <DialogTitle>API Configuration</DialogTitle>
        <DialogContent>
          <Box my={2}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Configure the API connection settings. Use mock data for demos or connect to a real backend API for production use.
            </Alert>
            
            <FormControlLabel
              control={
                <Switch
                  checked={apiConfig.useMockData}
                  onChange={handleToggleMockData}
                  color="primary"
                />
              }
              label="Use Mock Data"
            />
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
              {apiConfig.useMockData 
                ? "Using mock data. Changes will not persist between sessions." 
                : "Using real API. All changes will be sent to the backend."}
            </Typography>
            
            <TextField
              label="Real API URL"
              value={realApiUrl}
              onChange={(e) => setRealApiUrl(e.target.value)}
              disabled={apiConfig.useMockData}
              fullWidth
              variant="outlined"
              margin="normal"
              helperText="The URL of the backend API when not using mock data"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApiConfigClose}>Cancel</Button>
          <Button onClick={handleApiConfigSave} variant="contained" color="primary">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MainLayout;