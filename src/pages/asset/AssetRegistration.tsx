import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import LayerSelection from '../../components/asset/LayerSelection';
import TaxonomySelection from '../../components/asset/TaxonomySelection';
import MetadataForm, { AssetMetadata } from '../../components/asset/MetadataForm';
import FileUpload from '../../components/asset/FileUpload';
import ReviewSubmit from '../../components/asset/ReviewSubmit';
import assetService from '../../services/api/asset.service';

// Define steps
const steps = [
  'Select Layer',
  'Select Taxonomy',
  'Enter Metadata',
  'Upload Files',
  'Review & Submit',
];

// Main component
const AssetRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for collected form data
  const [layerCode, setLayerCode] = useState<string>('');
  const [layerName, setLayerName] = useState<string>('');
  const [categoryCode, setCategoryCode] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [subcategoryCode, setSubcategoryCode] = useState<string>('');
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [metadata, setMetadata] = useState<AssetMetadata | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [formValid, setFormValid] = useState(false);

  // Event handlers
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setLayerCode('');
    setLayerName('');
    setCategoryCode('');
    setCategoryName('');
    setSubcategoryCode('');
    setSubcategoryName('');
    setMetadata(null);
    setFiles([]);
    setFormValid(false);
  };

  // Submit the asset with files
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!metadata) {
        throw new Error('Metadata is required');
      }
      
      // Prepare asset creation data
      const assetData = {
        name: metadata.name,
        layer: layerCode,
        category: categoryCode,
        subcategory: subcategoryCode,
        description: metadata.description,
        tags: metadata.tags,
        metadata: {
          source: metadata.source,
          isTrainable: metadata.trainingData?.isTrainable || false,
          trainingDescription: metadata.trainingData?.trainingDescription || '',
          rights: metadata.rights,
          layerSpecificData: metadata.layerSpecificData,
          // Include any other metadata fields
        },
        files
      };
      
      console.log('Asset data being submitted:', assetData);
      
      // Submit to backend (or mock in our case)
      const result = await assetService.createAssetWithFiles(assetData, {
        onProgress: (fileId, progress) => {
          console.log(`File ${fileId} upload progress: ${progress}%`);
        },
        onComplete: (fileId, fileData) => {
          console.log(`File ${fileId} upload complete:`, fileData);
        },
        onError: (fileId, error) => {
          console.error(`File ${fileId} upload error:`, error);
        }
      });
      
      console.log('Asset created successfully:', result);
      
      // Display success message
      setActiveStep(steps.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register asset');
      console.error('Error creating asset:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render different step content based on activeStep
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box mt={4}>
            <Typography variant="body1" paragraph>
              Please select a layer for this asset. This will determine the categorization
              and metadata schema.
            </Typography>
            
            <LayerSelection 
              onLayerSelect={(layer) => {
                setLayerCode(layer.code);
                setLayerName(layer.name);
                setFormValid(true);
              }}
              selectedLayerCode={layerCode}
            />
          </Box>
        );
      case 1:
        return (
          <Box mt={4}>
            <Typography variant="body1" paragraph>
              Please select the category and subcategory for this asset within the {layerName} layer.
            </Typography>
            
            <TaxonomySelection
              layerCode={layerCode}
              selectedCategoryCode={categoryCode}
              selectedSubcategoryCode={subcategoryCode}
              onCategorySelect={(category) => {
                setCategoryCode(category.code);
                setCategoryName(category.name);
                // Reset subcategory when category changes
                setSubcategoryCode('');
                setSubcategoryName('');
                setFormValid(false);
              }}
              onSubcategorySelect={(subcategory) => {
                setSubcategoryCode(subcategory.code);
                setSubcategoryName(subcategory.name);
                setFormValid(true);
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box mt={4}>
            <Typography variant="body1" paragraph>
              Enter metadata for your {layerName} asset.
            </Typography>
            
            <MetadataForm
              layerCode={layerCode}
              initialData={metadata || undefined}
              onFormChange={(data, isValid) => {
                setMetadata(data);
                setFormValid(isValid);
              }}
            />
          </Box>
        );
      case 3:
        return (
          <Box mt={4}>
            <Typography variant="body1" paragraph>
              Upload files for your {layerName} asset.
            </Typography>
            
            <FileUpload
              onFilesChange={(newFiles) => {
                setFiles(newFiles);
                setFormValid(newFiles.length > 0);
              }}
              layerCode={layerCode}
              initialFiles={files}
              maxFiles={5}
              onUploadProgress={(fileId, progress) => {
                console.log(`File ${fileId} upload progress: ${progress}%`);
              }}
              onUploadComplete={(fileId, fileData) => {
                console.log(`File ${fileId} upload complete:`, fileData);
              }}
              onUploadError={(fileId, error) => {
                console.error(`File ${fileId} upload error:`, error);
              }}
            />
            
            {files.length === 0 && (
              <Typography variant="body2" color="info.main" paragraph>
                For demo purposes, you can also proceed without uploading actual files.
                <Button 
                  onClick={() => {
                    // Create a mock file object
                    const mockFile = new File([''], 'sample-file.mp3', { type: 'audio/mpeg' });
                    setFiles([mockFile]);
                    setFormValid(true);
                  }} 
                  sx={{ ml: 2 }} 
                  variant="contained" 
                  size="small"
                >
                  Simulate File Upload
                </Button>
              </Typography>
            )}
          </Box>
        );
      case 4:
        return (
          <Box mt={4}>
            <Typography variant="body1" paragraph>
              Review the information below and submit your asset registration.
            </Typography>
            
            {/* Summary display */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Asset Summary</Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle2">Layer:</Typography>
                <Typography variant="body1">{layerName} ({layerCode})</Typography>
              </Box>
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle2">Taxonomy:</Typography>
                <Typography variant="body1">{layerName} &gt; {categoryName} &gt; {subcategoryName}</Typography>
              </Box>
              {metadata && (
                <Box sx={{ my: 2 }}>
                  <Typography variant="subtitle2">Metadata:</Typography>
                  <Typography variant="body1"><strong>Name:</strong> {metadata.name}</Typography>
                  <Typography variant="body1"><strong>Description:</strong> {metadata.description}</Typography>
                  {metadata.tags && metadata.tags.length > 0 && (
                    <Typography variant="body1">
                      <strong>Tags:</strong> {metadata.tags.join(', ')}
                    </Typography>
                  )}
                </Box>
              )}
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle2">Files:</Typography>
                <Typography variant="body1">{files.length} file(s) selected</Typography>
                {files.map((file, index) => (
                  <Typography key={index} variant="body2">
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  // Success view
  const renderSuccess = () => (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Alert severity="success" sx={{ mb: 3 }}>
        Asset successfully registered!
      </Alert>
      <Typography variant="h5" gutterBottom>
        Your asset has been registered
      </Typography>
      <Typography variant="body1" paragraph>
        Your asset has been assigned the NNA address: <strong>{layerCode}.{categoryCode}.{subcategoryCode}.001</strong>
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/assets')}
          sx={{ mr: 2 }}
        >
          View All Assets
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleReset}
        >
          Register Another Asset
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register New Asset
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === steps.length ? (
          renderSuccess()
        ) : (
          <>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!formValid || loading}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={!formValid}
                >
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default AssetRegistration;