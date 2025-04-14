import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Divider,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import {
  AddCircle as AddIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // State for incomplete assets
  const [incompleteAssets, setIncompleteAssets] = useState<any[]>([]);
  
  // Fetch incomplete assets on component mount
  useEffect(() => {
    // This would normally be an API call
    // Mock data for now
    setIncompleteAssets([
      {
        id: 'asset-1',
        name: 'S.POP.BAS.001.png',
        address: 'S.001.001.001.png',
        description: 'Olivia as a Base Pop Star',
        type: 'training_data',
        createdAt: new Date().toISOString(),
        status: 'incomplete'
      },
      {
        id: 'asset-2',
        name: 'G.POP.BAS.002.mp3',
        address: 'G.001.001.002.mp3',
        description: 'Pop Base Track',
        type: 'rights_data',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'incomplete'
      }
    ]);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Welcome back, {user?.username || 'User'}!
      </Typography>

      {/* Quick Actions */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/assets/new"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Register Asset
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/assets"
              variant="outlined"
              startIcon={<SearchIcon />}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Browse Assets
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/taxonomy"
              variant="outlined"
              startIcon={<CategoryIcon />}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Taxonomy
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Incomplete Assets */}
      {incompleteAssets.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Incomplete Assets
            </Typography>
            <Chip label={`${incompleteAssets.length} pending`} color="warning" />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {incompleteAssets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <Card 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: asset.type === 'training_data' ? 'secondary.main' : 'primary.main' }}>
                        {asset.name.charAt(0)}
                      </Avatar>
                    }
                    action={
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    }
                    title={asset.name}
                    subheader={`Needs ${asset.type === 'training_data' ? 'training data' : 'rights data'}`}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {asset.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Created {new Date(asset.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      startIcon={<EditIcon />}
                      component={RouterLink}
                      to={`/assets/training/${asset.id}`}
                    >
                      Complete
                    </Button>
                    <Button size="small">
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Registered Assets
                </Typography>
                <Typography variant="h3">30</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  My Assets
                </Typography>
                <Typography variant="h3">12</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending Review
                </Typography>
                <Typography variant="h3">5</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Assets */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Recent Assets
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              name: 'S.POP.BAS.001.png',
              address: 'S.001.001.001.png',
              description: 'Olivia as a Base Pop Star',
              type: 'Stars',
              createdAt: new Date().toISOString()
            },
            {
              name: 'G.POP.BAS.002.mp3',
              address: 'G.001.001.002.mp3',
              description: 'Pop Base Track',
              type: 'Songs',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              name: 'L.POP.BAS.001.png',
              address: 'L.001.001.001.png',
              description: 'Outfit for Pop Base Character',
              type: 'Looks',
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
            }
          ].map((asset, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 
                      asset.type === 'Songs' ? '#2196f3' : 
                      asset.type === 'Stars' ? '#e91e63' : 
                      '#ff9800'
                    }}>
                      {asset.name.charAt(0)}
                    </Avatar>
                  }
                  title={asset.name}
                  subheader={`${asset.type} • ${new Date(asset.createdAt).toLocaleDateString()}`}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      HFN:
                    </Typography>
                    <Typography variant="caption" fontFamily="monospace">
                      {asset.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      MFA:
                    </Typography>
                    <Typography variant="caption" fontFamily="monospace">
                      {asset.address}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    {asset.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={RouterLink} to={`/assets/${index + 1}`}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;