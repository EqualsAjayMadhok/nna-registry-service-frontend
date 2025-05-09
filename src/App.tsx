import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import NotificationsProvider from './contexts/NotificationsContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DebugPanel from './components/common/DebugPanel';
import { APP_VERSION } from './utils/version';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetDetail from './pages/AssetDetail';
import AssetRegistration from './pages/asset/AssetRegistration';
import UpdateAssetPage from './pages/assets/UpdateAssetPage';
import BatchUploadPage from './pages/assets/BatchUploadPage';
import OrganizeAssetsPage from './pages/assets/OrganizeAssetsPage';
import AssetAnalyticsDashboard from './pages/dashboard/AssetAnalyticsDashboard';
import TaxonomyPage from './pages/TaxonomyPage';
import CollectionsPage from './pages/collections/CollectionsPage';
import CollectionDetailPage from './pages/collections/CollectionDetailPage';
import SequentialNumberTestPage from './pages/SequentialNumberTestPage';
import SequentialNumberPublicTestPage from './pages/SequentialNumberPublicTestPage';
import SequentialDemoRoot from './pages/SequentialDemoRoot';
import NotFound from './pages/NotFound';

// Set up Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Always enable mock API responses for demo purposes
(window as any).process = {
  ...((window as any).process || {}),
  env: {
    ...((window as any).process?.env || {}),
    REACT_APP_USE_MOCK_DATA: 'true',
  },
};

function App() {
  // Log application version on startup
  useEffect(() => {
    console.log(`NNA Registry Service - Version ${APP_VERSION}`);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <NotificationsProvider>
            <Router>
              {/* Debug Panel - available in all routes */}
              <DebugPanel />
              
              <Routes>
              {/* Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Public Test Pages */}
              <Route path="/test/sequential-numbers" element={
                <MainLayout>
                  <SequentialNumberTestPage />
                </MainLayout>
              } />
              
              {/* Ultra Simple Public Test Page (no dependencies) */}
              <Route path="/public-test" element={<SequentialNumberPublicTestPage />} />
              
              {/* Root Demo Page */}
              <Route path="/sequential-demo" element={<SequentialDemoRoot />} />
              
              {/* Main Application (Protected Routes) */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Asset Routes */}
                <Route path="/assets" element={<AssetList />} />
                <Route path="/assets/new" element={<AssetRegistration />} />
                <Route path="/assets/batch" element={<BatchUploadPage />} />
                <Route path="/assets/organize" element={<OrganizeAssetsPage />} />
                <Route path="/assets/analytics" element={<AssetAnalyticsDashboard />} />
                <Route path="/assets/edit/:id" element={<UpdateAssetPage />} />
                <Route path="/assets/:id" element={<AssetDetail />} />
                <Route path="/taxonomy" element={<TaxonomyPage />} />
                
                {/* Collections Routes */}
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/collections/:id" element={<CollectionDetailPage />} />
              </Route>
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Router>
          </NotificationsProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
