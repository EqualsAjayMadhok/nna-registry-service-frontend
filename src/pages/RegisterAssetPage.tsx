import React, { useState, useCallback, useEffect } from 'react';
import { Container, Typography, Box, Alert, Collapse } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StepControl, { StepInfo } from '../components/asset/StepControl';
import LayerSelection from '../components/asset/LayerSelection';
import TaxonomySelection from '../components/asset/TaxonomySelection';
import MetadataForm, { AssetMetadata } from '../components/asset/MetadataForm';
import FileUpload from '../components/asset/FileUpload';
import ReviewSubmit from '../components/asset/ReviewSubmit';
import RegistrationSuccess from '../components/asset/RegistrationSuccess';
import { Asset } from '../types/asset.types';
import { LayerOption, CategoryOption, SubcategoryOption } from '../types/taxonomy.types';
import AssetService from '../services/api/asset.service';

const initialSteps: StepInfo[] = [
  { label: 'Select Layer', completed: false },
  { label: 'Select Taxonomy', completed: false },
  { label: 'Asset Details', completed: false },
  { label: 'Upload Files', completed: false },
  { label: 'Review & Submit', completed: false }
];

const initialMetadata: AssetMetadata = {
  name: '',
  description: '',
  source: '',
  tags: [],
  trainingData: {
    isTrainable: false,
    trainingDescription: '',
    trainingRequirements: ''
  },
  rights: {
    license: 'CC-BY',
    attributionRequired: true,
    attributionText: '',
    commercialUse: true
  }
};

const RegisterAssetPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Step control state
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<StepInfo[]>(initialSteps);
  
  // Form data state
  const [selectedLayer, setSelectedLayer] = useState<LayerOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryOption | null>(null);
  const [assetMetadata, setAssetMetadata] = useState<AssetMetadata>(initialMetadata);
  const [assetMetadataValid, setAssetMetadataValid] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredAsset, setRegisteredAsset] = useState<Asset | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  // Helper function to update step completion
  const updateStepCompletion = useCallback((stepIndex: number, isCompleted: boolean) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].completed = isCompleted;
    setSteps(updatedSteps);
  }, [steps]);
  
  // Check if the current step is valid and can proceed
  const isStepValid = useCallback(() => {
    switch (activeStep) {
      case 0: // Layer selection
        return selectedLayer !== null;
      case 1: // Taxonomy selection
        return selectedCategory !== null; // Subcategory can be optional
      case 2: // Asset details
        return assetMetadataValid;
      case 3: // File upload
        return files.length > 0;
      case 4: // Review & submit
        return true; // Always valid, as it's just a review
      default:
        return false;
    }
  }, [activeStep, selectedLayer, selectedCategory, assetMetadataValid, files.length]);
  
  // Update step completion when data changes
  useEffect(() => {
    updateStepCompletion(activeStep, isStepValid());
  }, [activeStep, isStepValid, updateStepCompletion]);
  
  // Handle layer selection
  const handleLayerSelect = (layer: LayerOption) => {
    setSelectedLayer(layer);
    updateStepCompletion(0, true);
  };
  
  // Handle category selection
  const handleCategorySelect = (category: CategoryOption) => {
    setSelectedCategory(category);
    // Reset subcategory when category changes
    setSelectedSubcategory(null);
    updateStepCompletion(1, true);
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: SubcategoryOption) => {
    setSelectedSubcategory(subcategory);
  };
  
  // Handle metadata form changes
  const handleMetadataChange = (data: AssetMetadata, isValid: boolean) => {
    setAssetMetadata(data);
    setAssetMetadataValid(isValid);
    updateStepCompletion(2, isValid);
  };
  
  // Handle file uploads
  const handleFilesChange = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    updateStepCompletion(3, uploadedFiles.length > 0);
  };
  
  // Navigation handlers
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };
  
  const handleEditStep = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };
  
  // Asset submission
  const handleSubmit = async () => {
    if (!selectedLayer || !selectedCategory || !assetMetadataValid || files.length === 0) {
      setError('Please complete all required steps before submitting');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare asset data
      const assetData = {
        name: assetMetadata.name,
        layer: selectedLayer.code,
        category: selectedCategory.code,
        subcategory: selectedSubcategory?.code || '',
        description: assetMetadata.description,
        tags: assetMetadata.tags,
        metadata: {
          ...assetMetadata.layerSpecificData,
          source: assetMetadata.source,
          trainingData: assetMetadata.trainingData,
          rights: assetMetadata.rights
        },
        files
      };
      
      // Submit to API
      const response = await AssetService.createAsset(assetData);
      
      // Handle success
      setRegisteredAsset(response);
      setRegistrationComplete(true);
      
      // Reset form for "register another"
      setActiveStep(0);
      setSelectedLayer(null);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setAssetMetadata(initialMetadata);
      setFiles([]);
      setSteps(initialSteps);
      
    } catch (err) {
      console.error('Error registering asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to register asset');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterAnother = () => {
    setRegistrationComplete(false);
    setRegisteredAsset(null);
    // Form is already reset in handleSubmit
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <LayerSelection
            onLayerSelect={handleLayerSelect}
            selectedLayerCode={selectedLayer?.code}
          />
        );
      case 1:
        return (
          <TaxonomySelection
            layerCode={selectedLayer?.code || ''}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            selectedCategoryCode={selectedCategory?.code}
            selectedSubcategoryCode={selectedSubcategory?.code}
          />
        );
      case 2:
        return (
          <MetadataForm
            layerCode={selectedLayer?.code || ''}
            onFormChange={handleMetadataChange}
            initialData={assetMetadata}
          />
        );
      case 3:
        return (
          <FileUpload
            onFilesChange={handleFilesChange}
            layerCode={selectedLayer?.code}
            initialFiles={files}
          />
        );
      case 4:
        return (
          <ReviewSubmit
            assetMetadata={assetMetadata}
            layerCode={selectedLayer?.code || ''}
            categoryCode={selectedCategory?.code || ''}
            subcategoryCode={selectedSubcategory?.code || ''}
            files={files}
            onEditStep={handleEditStep}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register New Asset
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Register a new asset in the NNA Registry by following the steps below.
        </Typography>

        {error && !registrationComplete && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Collapse in={!registrationComplete}>
          {/* Step Control */}
          <StepControl
            steps={steps}
            activeStep={activeStep}
            onNext={handleNext}
            onBack={handleBack}
            onFinish={handleSubmit}
            isNextDisabled={!isStepValid()}
            loading={loading}
          />
          
          {/* Step Content */}
          {renderStepContent()}
        </Collapse>
        
        {/* Registration Success */}
        <Collapse in={registrationComplete && registeredAsset !== null}>
          {registeredAsset && (
            <RegistrationSuccess
              asset={registeredAsset}
              onRegisterAnother={handleRegisterAnother}
            />
          )}
        </Collapse>
      </Box>
    </Container>
  );
};

export default RegisterAssetPage;