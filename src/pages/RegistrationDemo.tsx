import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import StepControl, { StepInfo } from '../components/asset/StepControl';

// Define the steps for the registration process
const registrationSteps: StepInfo[] = [
  { label: 'Select Layer', completed: false },
  { label: 'Select Category', completed: false },
  { label: 'Asset Details', completed: false },
  { label: 'Upload Files', completed: false },
  { label: 'Review & Submit', completed: false }
];

const RegistrationDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<StepInfo[]>(registrationSteps);
  const [loading, setLoading] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Handle next button click
  const handleNext = () => {
    // Mark current step as completed
    const updatedSteps = [...steps];
    updatedSteps[activeStep].completed = true;
    setSteps(updatedSteps);
    
    // Move to the next step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back button click
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle finish button click
  const handleFinish = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Show success message
      alert('Registration completed successfully!');
      // Reset form
      setActiveStep(0);
      setSteps(registrationSteps.map(step => ({ ...step, completed: false })));
      setAssetName('');
      setAssetDescription('');
      setTermsAccepted(false);
    }, 2000);
  };

  // Check if the next button should be disabled based on current step
  const isNextDisabled = () => {
    switch (activeStep) {
      case 0: // Layer selection
        return false; // For demo purposes, allow moving forward
      case 1: // Category selection
        return false; // For demo purposes, allow moving forward
      case 2: // Asset details
        return !assetName; // Require at least a name
      case 3: // File upload
        return false; // For demo purposes, allow moving forward
      case 4: // Review and submit
        return !termsAccepted; // Require terms acceptance
      default:
        return false;
    }
  };

  // Render different content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Step 1: Select Layer
            </Typography>
            <Typography paragraph>
              Select the layer for your asset (e.g., Song, Star, Look, Move, World).
            </Typography>
            <Alert severity="info">
              For this demo, all steps are simplified. In a real implementation, each step would have its own component.
            </Alert>
          </Paper>
        );
      case 1:
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Step 2: Select Category
            </Typography>
            <Typography paragraph>
              Select the category and subcategory for your asset based on the layer.
            </Typography>
          </Paper>
        );
      case 2:
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Step 3: Asset Details
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Asset Name"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                multiline
                rows={4}
                margin="normal"
              />
            </Box>
          </Paper>
        );
      case 3:
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Step 4: Upload Files
            </Typography>
            <Typography paragraph>
              Upload one or more files associated with this asset.
            </Typography>
            <Alert severity="info">
              The file upload component would go here in a real implementation.
            </Alert>
          </Paper>
        );
      case 4:
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Step 5: Review & Submit
            </Typography>
            <Typography paragraph>
              Review your asset details and submit for registration.
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Asset Name:</Typography>
                  <Typography paragraph>{assetName || 'Not provided'}</Typography>
                  
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography paragraph>{assetDescription || 'Not provided'}</Typography>
                </Box>
                
                <FormControl required margin="normal">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                    }
                    label="I confirm that all information is correct and I have the rights to register this asset."
                  />
                </FormControl>
              </>
            )}
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Asset Registration Demo
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          This demonstrates the multi-step asset registration process.
        </Typography>

        {/* Step Control Component */}
        <StepControl
          steps={steps}
          activeStep={activeStep}
          onNext={handleNext}
          onBack={handleBack}
          onFinish={handleFinish}
          isNextDisabled={isNextDisabled()}
          loading={loading}
          isFinishDisabled={!termsAccepted}
        />

        {/* Step Content */}
        {renderStepContent()}
      </Box>
    </Container>
  );
};

export default RegistrationDemo;