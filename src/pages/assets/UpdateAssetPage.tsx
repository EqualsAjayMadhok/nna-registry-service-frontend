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
  
  const handleEditStep = (step: number) => {
    setActiveStep(step);
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

      // Prepare update data that matches AssetUpdateRequest interface
      const updateData = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags,
        layer: formData.layer,
        category: formData.category,
        subcategory: formData.subcategory,
        metadata: formData.metadata
      };

      // Update asset metadata
      await assetService.updateAsset(id, updateData);

      // Upload new file if provided
      if (file) {
        // Use the update method with just the file
        await assetService.updateAsset(id, { files: [file] });
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
            selectedLayerCode={formData.layer || ''}
            onLayerSelect={(layer) => handleFormDataChange({ layer: layer.code })}
          />
        )}

        {activeStep === 1 && (
          <MetadataForm
            layerCode={formData.layer || ''}
            onFormChange={(data, isValid) => {
              // Merge the metadata with the form data
              handleFormDataChange({
                name: data.name,
                description: data.description,
                tags: data.tags,
                metadata: {
                  ...formData.metadata,
                  ...data.layerSpecificData,
                  source: data.source,
                  rights: data.rights
                }
              });
            }}
            initialData={{
              name: formData.name || '',
              description: formData.description || '',
              tags: formData.tags || [],
              source: formData.metadata?.source as any,
              layerSpecificData: formData.metadata,
              rights: formData.rights
            }}
          />
        )}

        {activeStep === 2 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Current File
                </Typography>
                {asset?.files && asset.files.length > 0 ? (
                  <Box sx={{ mb: 3 }}>
                    <img 
                      src={asset.files[0].url} 
                      alt={asset.name}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px',
                        display: 'block',
                        marginBottom: '16px'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Original filename: {asset.files[0].filename}
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
                  onFilesChange={(files) => handleFileChange(files.length > 0 ? files[0] : null)}
                  initialFiles={file ? [file] : []}
                  maxFiles={1}
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
            assetMetadata={{
              name: formData.name || '',
              description: formData.description || '',
              tags: formData.tags || [],
              source: formData.metadata?.source as any,
              layerSpecificData: formData.metadata
            }}
            layerCode={formData.layer || ''}
            categoryCode={formData.category || ''}
            subcategoryCode={formData.subcategory || ''}
            files={file ? [file] : []}
            onEditStep={handleEditStep}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
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