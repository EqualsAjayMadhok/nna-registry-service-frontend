import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Badge
} from '@mui/material';
import {
  Collections as TrainingIcon,
  Notifications as NotificationsIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

interface Asset {
  id?: string;
  name: string;
  address: string;
}

interface TrainingDataUploadPromptProps {
  open: boolean;
  trainingAsset: Asset | null;
  onUploadNow: () => void;
  onRemindLater: () => void;
  onClose: () => void;
}

const TrainingDataUploadPrompt: React.FC<TrainingDataUploadPromptProps> = ({
  open,
  trainingAsset,
  onUploadNow,
  onRemindLater,
  onClose
}) => {
  if (!trainingAsset) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Training Data</DialogTitle>
      <DialogContent>
        <Typography paragraph>
          Would you like to upload training data for your newly registered asset?
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Training data helps with attribution and enhances AI-powered features. This data lets us track provenance
          and properly attribute content to its sources.
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
          <TrainingIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle2">Training Data Asset:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={trainingAsset.name} 
                color="primary" 
                size="small"
                sx={{ mr: 1 }} 
              />
              <Badge badgeContent="Auto-generated" color="primary" />
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Training data can include:
          </Typography>
          <ul>
            <li>Text prompts used to generate the asset</li>
            <li>Reference images that inspired the creation</li>
            <li>URLs to reference videos</li>
            <li>Model information</li>
          </ul>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          startIcon={<NotificationsIcon />}
          onClick={onRemindLater}
        >
          Remind Me Later
        </Button>
        <Button 
          variant="contained" 
          startIcon={<UploadIcon />}
          onClick={onUploadNow}
        >
          Upload Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrainingDataUploadPrompt;