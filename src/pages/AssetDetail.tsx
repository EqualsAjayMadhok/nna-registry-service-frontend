import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Mock asset data
  const asset = {
    id: id || '1',
    name: 'Sample Asset',
    nnaAddress: 'G.001.002.003',
    layer: 'G',
    category: '001',
    subcategory: '002',
    description: 'This is a sample asset for demonstration purposes. It represents a song in the NNA framework.',
    tags: ['sample', 'demo', 'song'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: user?.username || 'demo_user',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ my: 3 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/assets"
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {asset.name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Chip
            label={asset.layer}
            color="primary"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Typography variant="subtitle1" color="text.secondary">
            NNA: {asset.nnaAddress}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Asset Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {asset.description}
            </Typography>

            {asset.tags && asset.tags.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Tags
                </Typography>
                <Box>
                  {asset.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      sx={{ mr: 0.5, mb: 0.5 }}
                      size="small"
                    />
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {formatDate(asset.createdAt)}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {formatDate(asset.updatedAt)}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Created By
              </Typography>
              <Typography variant="body1">
                {asset.createdBy}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssetDetail;