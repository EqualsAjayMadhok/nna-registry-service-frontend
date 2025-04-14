import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import LayerSelection from '../../components/asset/LayerSelection';
import MetadataForm from '../../components/asset/MetadataForm';
import FileUpload from '../../components/asset/FileUpload';
import ReviewSubmit from '../../components/asset/ReviewSubmit';
import assetService from '../../services/api/asset.service';
import { Asset } from '../../types/asset.types';

/**
 * UpdateAssetPage component for editing an existing asset
 */
const UpdateAssetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({});
  const [file, setFile] = useState<File | null>(null);

  // Fetch asset data
  useEffect(() => {
    if (!id) {
      setError('No asset ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    assetService.getAssetById(id)
      .then(response => {
        setAsset(response);
        setFormData({
          name: response.name,
          description: response.description,
          tags: response.tags,
          layer: response.layer,
          category: response.category,
          subcategory: response.subcategory,
          metadata: response.metadata,
          rights: response.rights
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching asset:', err);
        setError('Failed to load asset data. Please try again.');
        setLoading(false);
      });
  }, [id]);

  // Handle step changes
  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  // Handle form data changes
  const handleFormDataChange = (newData: Partial<Asset>) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
  };

  // Handle file changes
  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
  };

  // Submit updated asset
  const handleSubmit = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Prepare update data
      const updateData = {
        ...formData
      };

      // Update asset metadata
      await assetService.updateAsset(id, updateData);

      // Upload new file if provided
      if (file) {
        await assetService.updateAssetFile(id, file);
      }

      // Navigate to asset details
      navigate(`/assets/${id}`);
    } catch (err: any) {
      console.error('Error updating asset:', err);
      setError(`Failed to update asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Steps content
  const steps = [
    'Layer Selection',
    'Asset Details',
    'File Upload',
    'Review & Submit'
  ];

  // Render loading state
  if (loading && !asset) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Render error state
  if (error && !asset) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/assets')}
        >
          Back to Assets
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Update Asset
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Modify the details and files for this asset. Current NNA Address: {asset?.nnaAddress}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 4 }} />

        {/* Step content */}
        {activeStep === 0 && (
          <LayerSelection
            selectedLayer={formData.layer || ''}
            selectedCategory={formData.category || ''}
            selectedSubcategory={formData.subcategory || ''}
            onLayerChange={(layer) => handleFormDataChange({ layer })}
            onCategoryChange={(category) => handleFormDataChange({ category })}
            onSubcategoryChange={(subcategory) => handleFormDataChange({ subcategory })}
          />
        )}

        {activeStep === 1 && (
          <MetadataForm
            formData={formData}
            onChange={handleFormDataChange}
            mode="update"
          />
        )}

        {activeStep === 2 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Current File
                </Typography>
                {asset?.fileUrl ? (
                  <Box sx={{ mb: 3 }}>
                    <img 
                      src={asset.fileUrl} 
                      alt={asset.name}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px',
                        display: 'block',
                        marginBottom: '16px'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Original filename: {asset.originalFilename}
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    No file currently associated with this asset.
                  </Alert>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Upload New File (Optional)
                </Typography>
                <FileUpload 
                  onFileChange={handleFileChange}
                  selectedFile={file} 
                />
                {file && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Uploading a new file will replace the current file.
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 3 && (
          <ReviewSubmit
            formData={{
              ...asset,
              ...formData,
              file: file
            }}
            mode="update"
          />
        )}

        {/* Navigation buttons */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/assets') : handleBack}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Update Asset' : 'Continue'}
            {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UpdateAssetPage;