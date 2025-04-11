import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetDetail from './pages/AssetDetail';
import AssetRegistration from './pages/asset/AssetRegistration';
import TaxonomyPage from './pages/TaxonomyPage';
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Main Application (Protected Routes) */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Asset Routes */}
                <Route path="/assets" element={<AssetList />} />
                <Route path="/assets/:id" element={<AssetDetail />} />
                <Route path="/assets/new" element={<AssetRegistration />} />
                <Route path="/taxonomy" element={<TaxonomyPage />} />
              </Route>
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
