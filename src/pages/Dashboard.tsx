import React from 'react';
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
  Divider,
} from '@mui/material';
import {
  AddCircle as AddIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

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
                  Downloaded
                </Typography>
                <Typography variant="h3">8</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Layers Used
                </Typography>
                <Typography variant="h3">3</Typography>
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
          {['G-001-001', 'S-002-003', 'L-003-002'].map((nna, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Demo Asset {index + 1}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                    NNA: {nna}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    This is a sample asset created for demonstration purposes.
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