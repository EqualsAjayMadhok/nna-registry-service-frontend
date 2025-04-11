import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  useTheme
} from '@mui/material';
import {
  SentimentDissatisfied as SadIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();

  return (
    <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', minHeight: '80vh' }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          textAlign: 'center',
          width: '100%',
          borderRadius: 2,
          background: `linear-gradient(120deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
        }}
      >
        <SadIcon
          sx={{
            fontSize: 80,
            color: theme.palette.primary.main,
            mb: 2,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.8
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1
              }
            }
          }}
        />
        
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>
        
        {location.pathname && (
          <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 1, mx: 'auto', maxWidth: 500 }}>
            <Typography variant="body2" fontFamily="monospace">
              Could not find: <strong>{location.pathname}</strong>
            </Typography>
          </Box>
        )}
        
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          startIcon={<HomeIcon />}
          size="large"
          sx={{ minWidth: 200 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;