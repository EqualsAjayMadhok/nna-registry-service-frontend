import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Launch as LaunchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Asset } from '../../types/asset.types';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

interface RegistrationSuccessProps {
  asset: Asset;
  onRegisterAnother: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  asset,
  onRegisterAnother
}) => {
  const theme = useTheme();
  const { width, height } = useWindowSize();
  
  return (
    <Paper sx={{ p: 3, mb: 4, position: 'relative', overflow: 'hidden' }}>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
        confettiSource={{ x: width / 2, y: 0, w: 0, h: 0 }}
        tweenDuration={5000}
      />
      
      <Box textAlign="center" mb={4}>
        <CheckCircleIcon
          sx={{
            fontSize: 80,
            color: 'success.main',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.7
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1
              }
            }
          }}
        />
        <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
          Registration Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your asset has been successfully registered in the NNA Registry.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {asset.name}
                  </Typography>
                  <Chip
                    label={asset.layer}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    NNA Address:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      padding: 1,
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}
                  >
                    {asset.nnaAddress}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Created At:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(asset.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                
                {asset.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description:
                    </Typography>
                    <Typography variant="body2">{asset.description}</Typography>
                  </Grid>
                )}
                
                {asset.tags && asset.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {asset.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}
                
                {asset.files && asset.files.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Files:
                    </Typography>
                    <Typography variant="body2">
                      {asset.files.length} file{asset.files.length !== 1 ? 's' : ''} uploaded
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" gap={2} mt={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onRegisterAnother}
            >
              Register Another Asset
            </Button>
            <Button
              variant="outlined"
              startIcon={<LaunchIcon />}
              component={Link}
              to={`/assets/${asset.id}`}
            >
              View Asset Details
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RegistrationSuccess;