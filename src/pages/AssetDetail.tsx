import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import AssetService from '../services/api/asset.service';
import { Asset, AssetFile } from '../types/asset.types';
import { useAuth } from '../hooks/useAuth';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchAsset(id);
    }
  }, [id]);

  const fetchAsset = async (assetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AssetService.getAssetById(assetId);
      setAsset(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch asset');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (id) {
      try {
        await AssetService.deleteAsset(id);
        setDeleteDialogOpen(false);
        navigate('/assets');
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to delete asset');
        }
        setDeleteDialogOpen(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box mt={4}>
          <Alert severity="error">{error}</Alert>
          <Box mt={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/assets"
            >
              Back to Assets
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container maxWidth="md">
        <Box mt={4}>
          <Alert severity="warning">Asset not found</Alert>
          <Box mt={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/assets"
            >
              Back to Assets
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {asset.description || 'No description provided.'}
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

              {asset.metadata && Object.keys(asset.metadata).length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Metadata
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: 'background.default',
                      p: 2,
                      borderRadius: 1,
                      overflowX: 'auto',
                    }}
                  >
                    <pre>
                      {JSON.stringify(asset.metadata, null, 2)}
                    </pre>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Files Section */}
          {asset.files && asset.files.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Files
                </Typography>
                <List>
                  {asset.files.map((file: AssetFile) => (
                    <ListItem
                      key={file.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="download"
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <DownloadIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.filename}
                        secondary={`${(file.size / 1024).toFixed(2)} KB • ${file.contentType}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
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
                  {asset.createdBy || 'Unknown'}
                </Typography>
              </Box>

              {/* Actions */}
              <Box mt={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  component={Link}
                  to={`/assets/edit/${asset.id}`}
                  sx={{ mb: 1 }}
                >
                  Edit Asset
                </Button>
                {isAdmin && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteClick}
                  >
                    Delete Asset
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Asset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this asset? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssetDetail;