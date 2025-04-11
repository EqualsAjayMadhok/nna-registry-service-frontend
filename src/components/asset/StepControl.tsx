import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Check as CheckIcon
} from '@mui/icons-material';

export interface StepInfo {
  label: string;
  optional?: boolean;
  completed?: boolean;
}

interface StepControlProps {
  steps: StepInfo[];
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  isFinishDisabled?: boolean;
  loading?: boolean;
}

/**
 * A stepper component that controls multi-step processes like asset registration
 * Displays the current step and provides navigation buttons
 */
const StepControl: React.FC<StepControlProps> = ({
  steps,
  activeStep,
  onNext,
  onBack,
  onFinish,
  isNextDisabled = false,
  isBackDisabled = false,
  isFinishDisabled = false,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLastStep = activeStep === steps.length - 1;

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={isMobile} 
        sx={{ mb: 4 }}
      >
        {steps.map((step, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};
          
          if (step.optional) {
            labelProps.optional = (
              <Typography variant="caption" color="text.secondary">
                Optional
              </Typography>
            );
          }
          
          if (step.completed) {
            stepProps.completed = true;
          }
          
          return (
            <Step key={step.label} {...stepProps}>
              <StepLabel {...labelProps}>{step.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          disabled={activeStep === 0 || isBackDisabled || loading}
          onClick={onBack}
          startIcon={<BackIcon />}
          variant="outlined"
        >
          Back
        </Button>
        
        <Box>
          {!isLastStep ? (
            <Button
              variant="contained"
              onClick={onNext}
              endIcon={<NextIcon />}
              disabled={isNextDisabled || loading}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={onFinish}
              endIcon={<CheckIcon />}
              disabled={isFinishDisabled || loading}
            >
              Finish
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default StepControl;