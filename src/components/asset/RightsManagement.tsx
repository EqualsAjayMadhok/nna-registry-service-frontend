import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  HourglassEmpty as PendingIcon,
  Schedule as ExpiredIcon,
  Help as HelpIcon,
  Verified as VerifiedIcon,
  PlaylistAddCheck as UsageIcon,
  Link as LinkIcon,
  CloudUpload as UploadIcon,
  Check as ComplianceCheckIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  Public as GlobalIcon,
  PinDrop as LocationIcon,
  PhoneAndroid as PlatformIcon,
  AccessTime as TimeIcon,
  Money as PaymentIcon,
  Assignment as LicenseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  Asset,
  AssetRights,
  RightsStatus,
  RightsType,
  RightsLimitation,
  RightsVerificationMethod,
  RightsClearance,
  RightsLimitationDetail,
  RightsClearanceRequest,
  RightsVerificationRequest,
  RightsUpdateRequest
} from '../../types/asset.types';
import rightsService from '../../api/rightsService';
import { format } from 'date-fns';

// Map status to colors and icons
const STATUS_CONFIG = {
  [RightsStatus.VERIFIED]: {
    color: 'success',
    icon: <CheckCircleIcon />,
    label: 'Verified'
  },
  [RightsStatus.PARTIAL]: {
    color: 'info',
    icon: <VerifiedIcon />,
    label: 'Partially Verified'
  },
  [RightsStatus.PENDING]: {
    color: 'warning',
    icon: <PendingIcon />,
    label: 'Verification Pending'
  },
  [RightsStatus.UNVERIFIED]: {
    color: 'default',
    icon: <HelpIcon />,
    label: 'Unverified'
  },
  [RightsStatus.REJECTED]: {
    color: 'error',
    icon: <CancelIcon />,
    label: 'Verification Failed'
  },
  [RightsStatus.EXPIRED]: {
    color: 'error',
    icon: <ExpiredIcon />,
    label: 'Expired'
  }
};

// Map rights types to labels and descriptions
const RIGHTS_TYPE_INFO = {
  [RightsType.COPYRIGHT]: {
    label: 'Copyright',
    description: 'Copyright ownership or license for the asset'
  },
  [RightsType.TRADEMARK]: {
    label: 'Trademark',
    description: 'Trademark usage rights for the asset'
  },
  [RightsType.PATENT]: {
    label: 'Patent',
    description: 'Patent rights for the asset'
  },
  [RightsType.PERSONALITY]: {
    label: 'Personality Rights',
    description: 'Personality/publicity rights for individuals depicted'
  },
  [RightsType.MUSIC]: {
    label: 'Music Rights',
    description: 'Music synchronization rights for audio content'
  },
  [RightsType.PERFORMANCE]: {
    label: 'Performance Rights',
    description: 'Performance rights for the asset'
  },
  [RightsType.MECHANICAL]: {
    label: 'Mechanical Rights',
    description: 'Mechanical reproduction rights for the asset'
  },
  [RightsType.SYNC]: {
    label: 'Sync Rights',
    description: 'Synchronization rights for the asset'
  },
  [RightsType.MASTER]: {
    label: 'Master Rights',
    description: 'Master recording rights for the asset'
  },
  [RightsType.ATTRIBUTION]: {
    label: 'Attribution Requirements',
    description: 'Attribution requirements for using the asset'
  }
};

// Map limitation types to icons and descriptions
const LIMITATION_TYPE_INFO = {
  [RightsLimitation.TIME]: {
    icon: <TimeIcon />,
    label: 'Time Limitation',
    description: 'Time-limited usage'
  },
  [RightsLimitation.TERRITORY]: {
    icon: <LocationIcon />,
    label: 'Territory Limitation',
    description: 'Geographic usage limitations'
  },
  [RightsLimitation.PLATFORM]: {
    icon: <PlatformIcon />,
    label: 'Platform Limitation',
    description: 'Platform-specific usage limitations'
  },
  [RightsLimitation.PURPOSE]: {
    icon: <UsageIcon />,
    label: 'Purpose Limitation',
    description: 'Purpose-specific usage limitations'
  },
  [RightsLimitation.MODIFICATION]: {
    icon: <EditIcon />,
    label: 'Modification Limitation',
    description: 'Limitations on modification of the asset'
  },
  [RightsLimitation.DISTRIBUTION]: {
    icon: <GlobalIcon />,
    label: 'Distribution Limitation',
    description: 'Limitations on distribution of the asset'
  },
  [RightsLimitation.COMBINATION]: {
    icon: <LinkIcon />,
    label: 'Combination Limitation',
    description: 'Limitations on combining with other assets'
  }
};

// Map verification methods to labels
const VERIFICATION_METHOD_INFO = {
  [RightsVerificationMethod.BLOCKCHAIN]: {
    label: 'Blockchain',
    description: 'Verified using blockchain technology'
  },
  [RightsVerificationMethod.CONTRACT]: {
    label: 'Contract',
    description: 'Verified using contract evidence'
  },
  [RightsVerificationMethod.LICENSE]: {
    label: 'License',
    description: 'Verified using license agreement'
  },
  [RightsVerificationMethod.DECLARATION]: {
    label: 'Declaration',
    description: 'Verified using declaration of rights'
  },
  [RightsVerificationMethod.REGISTRY]: {
    label: 'Registry',
    description: 'Verified using registry lookup'
  },
  [RightsVerificationMethod.LEGAL]: {
    label: 'Legal Documentation',
    description: 'Verified using legal documentation'
  }
};

// Common license types
const LICENSE_TYPES = [
  { value: 'CC0', label: 'CC0 - Public Domain Dedication' },
  { value: 'CC BY', label: 'CC BY - Attribution' },
  { value: 'CC BY-SA', label: 'CC BY-SA - Attribution-ShareAlike' },
  { value: 'CC BY-NC', label: 'CC BY-NC - Attribution-NonCommercial' },
  { value: 'CC BY-ND', label: 'CC BY-ND - Attribution-NoDerivatives' },
  { value: 'CC BY-NC-SA', label: 'CC BY-NC-SA - Attribution-NonCommercial-ShareAlike' },
  { value: 'CC BY-NC-ND', label: 'CC BY-NC-ND - Attribution-NonCommercial-NoDerivatives' },
  { value: 'MIT', label: 'MIT License' },
  { value: 'GPL', label: 'GNU General Public License' },
  { value: 'Apache 2.0', label: 'Apache License 2.0' },
  { value: 'Commercial', label: 'Commercial License' },
  { value: 'Custom', label: 'Custom License' }
];

interface RightsManagementProps {
  asset: Asset;
  rights: AssetRights;
  onRightsUpdated: (updatedRights: AssetRights) => void;
  readOnly?: boolean;
}

const RightsManagement: React.FC<RightsManagementProps> = ({
  asset,
  rights,
  onRightsUpdated,
  readOnly = false
}) => {
  const theme = useTheme();
  
  // State for dialogs
  const [addClearanceDialogOpen, setAddClearanceDialogOpen] = useState(false);
  const [verifyRightsDialogOpen, setVerifyRightsDialogOpen] = useState(false);
  const [usageComplianceDialogOpen, setUsageComplianceDialogOpen] = useState(false);
  const [updateSettingsDialogOpen, setUpdateSettingsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [verificationStatusDialogOpen, setVerificationStatusDialogOpen] = useState(false);
  
  // State for selection and current job
  const [selectedClearance, setSelectedClearance] = useState<RightsClearance | null>(null);
  const [currentVerificationJobId, setCurrentVerificationJobId] = useState<string | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [clearanceForm, setClearanceForm] = useState<Partial<RightsClearanceRequest>>({
    assetId: asset.id,
    rightType: RightsType.COPYRIGHT,
    source: '',
    holder: '',
    licenseType: '',
    paymentRequired: false
  });
  
  const [verificationForm, setVerificationForm] = useState<Partial<RightsVerificationRequest>>({
    assetId: asset.id,
    rightTypes: [RightsType.COPYRIGHT],
    notes: ''
  });
  
  const [usageComplianceForm, setUsageComplianceForm] = useState({
    purpose: '',
    platform: '',
    usageType: 'inclusion',
    territory: '',
    commercial: false,
    derivative: false
  });
  
  const [complianceResult, setComplianceResult] = useState<null | {
    compliant: boolean;
    issues?: string[];
    limitations?: string[];
    requiresAttribution: boolean;
    attributionText?: string;
  }>(null);
  
  const [settingsForm, setSettingsForm] = useState<Partial<RightsUpdateRequest>>({
    assetId: asset.id,
    attributionText: rights.attributionText || '',
    attributionRequired: rights.attributionRequired,
    commercialUse: rights.commercialUse,
    derivativeWorks: rights.derivativeWorks
  });
  
  const [verificationStatus, setVerificationStatus] = useState<null | {
    status: RightsStatus;
    completed: boolean;
    message?: string;
    details?: any;
  }>(null);
  
  // Handle adding a new clearance
  const handleAddClearance = async () => {
    if (!clearanceForm.rightType || !clearanceForm.source || !clearanceForm.holder) {
      setError('Please fill out all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const request: RightsClearanceRequest = {
        assetId: asset.id,
        rightType: clearanceForm.rightType as RightsType,
        source: clearanceForm.source,
        holder: clearanceForm.holder,
        expiresAt: clearanceForm.expiresAt,
        limitations: clearanceForm.limitations as RightsLimitationDetail[] | undefined,
        licenseType: clearanceForm.licenseType,
        termsUrl: clearanceForm.termsUrl,
        paymentRequired: clearanceForm.paymentRequired || false,
        paymentDetails: clearanceForm.paymentDetails,
        notes: clearanceForm.notes
      };
      
      const newClearance = await rightsService.addRightsClearance(request);
      
      // Refresh rights information
      const updatedRights = await rightsService.getAssetRights(asset.id);
      onRightsUpdated(updatedRights);
      
      // Reset form and close dialog
      setClearanceForm({
        assetId: asset.id,
        rightType: RightsType.COPYRIGHT,
        source: '',
        holder: '',
        licenseType: '',
        paymentRequired: false
      });
      setAddClearanceDialogOpen(false);
    } catch (err) {
      console.error('Error adding clearance:', err);
      setError('Failed to add clearance');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a clearance
  const handleDeleteClearance = async (clearance: RightsClearance) => {
    if (!window.confirm(`Are you sure you want to delete the ${RIGHTS_TYPE_INFO[clearance.rightType].label} clearance?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await rightsService.deleteRightsClearance(asset.id, clearance.id);
      
      // Refresh rights information
      const updatedRights = await rightsService.getAssetRights(asset.id);
      onRightsUpdated(updatedRights);
    } catch (err) {
      console.error('Error deleting clearance:', err);
      setError('Failed to delete clearance');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle submitting verification request
  const handleSubmitVerification = async () => {
    if (!verificationForm.rightTypes || verificationForm.rightTypes.length === 0) {
      setError('Please select at least one right type to verify');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const request: RightsVerificationRequest = {
        assetId: asset.id,
        rightTypes: verificationForm.rightTypes as RightsType[],
        evidenceUrls: verificationForm.evidenceUrls,
        notes: verificationForm.notes,
        contactEmail: verificationForm.contactEmail
      };
      
      const result = await rightsService.submitVerificationRequest(request);
      setCurrentVerificationJobId(result.jobId);
      
      // Reset form
      setVerificationForm({
        assetId: asset.id,
        rightTypes: [RightsType.COPYRIGHT],
        notes: ''
      });
      
      // Refresh rights information
      const updatedRights = await rightsService.getAssetRights(asset.id);
      onRightsUpdated(updatedRights);
      
      // Close dialog and open status dialog
      setVerifyRightsDialogOpen(false);
      setVerificationStatusDialogOpen(true);
      
      // Check initial status
      await checkVerificationStatus(result.jobId);
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError('Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle checking verification status
  const checkVerificationStatus = async (jobId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const status = await rightsService.checkVerificationStatus(asset.id, jobId);
      setVerificationStatus(status);
      
      // If completed, refresh rights information
      if (status.completed) {
        const updatedRights = await rightsService.getAssetRights(asset.id);
        onRightsUpdated(updatedRights);
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
      setError('Failed to check verification status');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle verifying usage compliance
  const handleCheckCompliance = async () => {
    if (!usageComplianceForm.purpose || !usageComplianceForm.platform) {
      setError('Please provide purpose and platform information');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await rightsService.verifyUsageCompliance(
        asset.id,
        {
          purpose: usageComplianceForm.purpose,
          platform: usageComplianceForm.platform,
          usageType: usageComplianceForm.usageType,
          territory: usageComplianceForm.territory || undefined,
          commercial: usageComplianceForm.commercial,
          derivative: usageComplianceForm.derivative
        }
      );
      
      setComplianceResult(result);
    } catch (err) {
      console.error('Error checking compliance:', err);
      setError('Failed to check usage compliance');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle updating rights settings
  const handleUpdateSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: RightsUpdateRequest = {
        assetId: asset.id,
        attributionText: settingsForm.attributionText,
        attributionRequired: settingsForm.attributionRequired,
        commercialUse: settingsForm.commercialUse,
        derivativeWorks: settingsForm.derivativeWorks,
        notes: 'Updated rights settings'
      };
      
      const updatedRights = await rightsService.updateAssetRights(request);
      onRightsUpdated(updatedRights);
      
      // Close dialog
      setUpdateSettingsDialogOpen(false);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update rights settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle copying attribution text
  const handleCopyAttribution = () => {
    if (rights.attributionText) {
      navigator.clipboard.writeText(rights.attributionText)
        .then(() => alert('Attribution text copied to clipboard'))
        .catch(err => console.error('Failed to copy attribution text:', err));
    }
  };
  
  // Format date string
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Render status chip
  const renderStatusChip = (status: RightsStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color as any}
        size="medium"
      />
    );
  };
  
  // Render rights clearance list
  const renderClearanceList = () => {
    if (rights.clearances.length === 0) {
      return (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No rights clearance records available
          </Typography>
          {!readOnly && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddClearanceDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Add Rights Clearance
            </Button>
          )}
        </Box>
      );
    }
    
    return (
      <List sx={{ width: '100%' }}>
        {rights.clearances.map((clearance) => (
          <React.Fragment key={clearance.id}>
            <ListItem
              alignItems="flex-start"
              sx={{ 
                borderLeft: `4px solid ${
                  STATUS_CONFIG[clearance.status].color === 'default' 
                    ? theme.palette.grey[500] 
                    : theme.palette[STATUS_CONFIG[clearance.status].color as 'success' | 'error' | 'info' | 'warning'].main
                }`,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {STATUS_CONFIG[clearance.status].icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {RIGHTS_TYPE_INFO[clearance.rightType].label}
                    </Typography>
                    <Chip 
                      label={clearance.status} 
                      size="small" 
                      color={STATUS_CONFIG[clearance.status].color as any} 
                      variant="outlined" 
                    />
                    {clearance.licenseType && (
                      <Chip 
                        icon={<LicenseIcon fontSize="small" />}
                        label={clearance.licenseType} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" component="span" display="block">
                      <strong>Source:</strong> {clearance.source}
                    </Typography>
                    <Typography variant="body2" component="span" display="block">
                      <strong>Rights Holder:</strong> {clearance.holder}
                    </Typography>
                    <Typography variant="body2" component="span" display="block">
                      <strong>Obtained:</strong> {formatDate(clearance.obtainedAt)}
                      {clearance.expiresAt && ` • Expires: ${formatDate(clearance.expiresAt)}`}
                    </Typography>
                    
                    {/* Verification details if available */}
                    {clearance.verification && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="body2" component="span" display="block">
                          <strong>Verification Method:</strong> {VERIFICATION_METHOD_INFO[clearance.verification.method].label}
                        </Typography>
                        <Typography variant="body2" component="span" display="block">
                          <strong>Verified By:</strong> {clearance.verification.verifiedBy || 'System'}
                        </Typography>
                        <Typography variant="body2" component="span" display="block">
                          <strong>Verified On:</strong> {formatDate(clearance.verification.verifiedAt)}
                        </Typography>
                        {clearance.verification.notes && (
                          <Typography variant="body2" component="span" display="block">
                            <strong>Notes:</strong> {clearance.verification.notes}
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {/* Limitations if available */}
                    {clearance.limitations && clearance.limitations.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" component="div" fontWeight="medium">
                          Limitations:
                        </Typography>
                        {clearance.limitations.map((limitation, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            {LIMITATION_TYPE_INFO[limitation.type].icon}
                            <Typography variant="body2">
                              {limitation.description}
                              {limitation.type === RightsLimitation.TIME && limitation.startDate && limitation.endDate && (
                                <span> ({formatDate(limitation.startDate)} - {formatDate(limitation.endDate)})</span>
                              )}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    {/* Additional info */}
                    {(clearance.paymentRequired || clearance.notes) && (
                      <Box sx={{ mt: 1 }}>
                        {clearance.paymentRequired && (
                          <Typography variant="body2" component="div" display="flex" alignItems="center" sx={{ color: 'warning.main' }}>
                            <PaymentIcon fontSize="small" sx={{ mr: 0.5 }} />
                            Payment required {clearance.paymentDetails && `(${clearance.paymentDetails})`}
                          </Typography>
                        )}
                        {clearance.notes && (
                          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                            <strong>Notes:</strong> {clearance.notes}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                }
              />
              
              {!readOnly && (
                <ListItemSecondaryAction>
                  <Tooltip title="Delete Clearance">
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleDeleteClearance(clearance)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              )}
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  return (
    <Box>
      {/* Overall Rights Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Rights Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 } }}>
            {renderStatusChip(rights.status)}
            
            {!readOnly && (
              <Button 
                variant="outlined" 
                startIcon={<VerifiedIcon />}
                onClick={() => setVerifyRightsDialogOpen(true)}
                disabled={rights.status === RightsStatus.VERIFIED || rights.status === RightsStatus.PENDING}
              >
                Verify Rights
              </Button>
            )}
          </Box>
        </Box>
        
        {rights.status === RightsStatus.PENDING && rights.clarityJobId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Rights verification is in progress (Job ID: {rights.clarityJobId}).
              {rights.clarityLastChecked && ` Last checked: ${formatDate(rights.clarityLastChecked)}`}
            </Typography>
          </Alert>
        )}
        
        {rights.status === RightsStatus.REJECTED && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Rights verification failed. Please check the clearance records for details.
            </Typography>
          </Alert>
        )}
        
        {rights.status === RightsStatus.EXPIRED && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Some rights have expired. Please update your clearance records.
            </Typography>
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Usage Rights
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Commercial Use</Typography>
                  {rights.commercialUse ? (
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Allowed" 
                      color="success" 
                      size="small" 
                      variant="outlined" 
                    />
                  ) : (
                    <Chip 
                      icon={<CancelIcon />} 
                      label="Not Allowed" 
                      color="error" 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Derivative Works</Typography>
                  {rights.derivativeWorks ? (
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Allowed" 
                      color="success" 
                      size="small" 
                      variant="outlined" 
                    />
                  ) : (
                    <Chip 
                      icon={<CancelIcon />} 
                      label="Not Allowed" 
                      color="error" 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Attribution Required</Typography>
                  {rights.attributionRequired ? (
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Required" 
                      color="warning" 
                      size="small" 
                      variant="outlined" 
                    />
                  ) : (
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Not Required" 
                      color="success" 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Box>
              
              {rights.attributionRequired && rights.attributionText && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">Attribution Text:</Typography>
                    <Tooltip title="Copy Attribution">
                      <IconButton size="small" onClick={handleCopyAttribution}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" component="div" sx={{ fontStyle: 'italic' }}>
                    "{rights.attributionText}"
                  </Typography>
                </Box>
              )}
              
              {!readOnly && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setUpdateSettingsDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Update Settings
                </Button>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Clearance Records
                </Typography>
                
                {!readOnly && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setAddClearanceDialogOpen(true)}
                  >
                    Add Clearance
                  </Button>
                )}
              </Box>
              
              {renderClearanceList()}
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setHistoryDialogOpen(true)}
          >
            View History
          </Button>
          
          <Button
            variant="contained"
            startIcon={<ComplianceCheckIcon />}
            onClick={() => setUsageComplianceDialogOpen(true)}
          >
            Check Usage Compliance
          </Button>
        </Box>
      </Paper>
      
      {/* Add Clearance Dialog */}
      <Dialog
        open={addClearanceDialogOpen}
        onClose={() => setAddClearanceDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Rights Clearance</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Rights Type</InputLabel>
                <Select
                  value={clearanceForm.rightType || ''}
                  label="Rights Type *"
                  onChange={(e: SelectChangeEvent<string>) => setClearanceForm({
                    ...clearanceForm,
                    rightType: e.target.value as RightsType
                  })}
                >
                  {Object.values(RightsType).map(type => (
                    <MenuItem key={type} value={type}>
                      {RIGHTS_TYPE_INFO[type].label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {clearanceForm.rightType && RIGHTS_TYPE_INFO[clearanceForm.rightType as RightsType].description}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>License Type</InputLabel>
                <Select
                  value={clearanceForm.licenseType || ''}
                  label="License Type"
                  onChange={(e: SelectChangeEvent<string>) => setClearanceForm({
                    ...clearanceForm,
                    licenseType: e.target.value
                  })}
                >
                  <MenuItem value="">No Specific License</MenuItem>
                  {LICENSE_TYPES.map(license => (
                    <MenuItem key={license.value} value={license.value}>
                      {license.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Rights Source *"
                placeholder="e.g., Original Creation, License, Assignment"
                fullWidth
                required
                value={clearanceForm.source || ''}
                onChange={(e) => setClearanceForm({
                  ...clearanceForm,
                  source: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Rights Holder *"
                placeholder="Name of rights holder or licensing entity"
                fullWidth
                required
                value={clearanceForm.holder || ''}
                onChange={(e) => setClearanceForm({
                  ...clearanceForm,
                  holder: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Terms URL"
                placeholder="URL to license or terms document"
                fullWidth
                value={clearanceForm.termsUrl || ''}
                onChange={(e) => setClearanceForm({
                  ...clearanceForm,
                  termsUrl: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Expiration Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={clearanceForm.expiresAt?.substring(0, 10) || ''}
                onChange={(e) => setClearanceForm({
                  ...clearanceForm,
                  expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined
                })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={clearanceForm.paymentRequired || false}
                    onChange={(e) => setClearanceForm({
                      ...clearanceForm,
                      paymentRequired: e.target.checked
                    })}
                  />
                }
                label="Payment Required for Usage"
              />
            </Grid>
            
            {clearanceForm.paymentRequired && (
              <Grid item xs={12}>
                <TextField
                  label="Payment Details"
                  placeholder="Specify payment details, amounts, or contact information"
                  fullWidth
                  multiline
                  rows={2}
                  value={clearanceForm.paymentDetails || ''}
                  onChange={(e) => setClearanceForm({
                    ...clearanceForm,
                    paymentDetails: e.target.value
                  })}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                placeholder="Additional notes about this clearance"
                fullWidth
                multiline
                rows={3}
                value={clearanceForm.notes || ''}
                onChange={(e) => setClearanceForm({
                  ...clearanceForm,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddClearanceDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddClearance} 
            variant="contained" 
            disabled={loading || !clearanceForm.rightType || !clearanceForm.source || !clearanceForm.holder}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Clearance'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Verify Rights Dialog */}
      <Dialog
        open={verifyRightsDialogOpen}
        onClose={() => setVerifyRightsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submit Rights Verification Request</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Submit a verification request to the Clearity service to verify the rights for this asset.
            You'll need to provide information about which rights should be verified.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Rights to Verify</InputLabel>
                <Select
                  multiple
                  value={verificationForm.rightTypes || []}
                  label="Rights to Verify *"
                  onChange={(e: SelectChangeEvent<RightsType[]>) => setVerificationForm({
                    ...verificationForm,
                    rightTypes: e.target.value as RightsType[]
                  })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as RightsType[]).map((value) => (
                        <Chip key={value} label={RIGHTS_TYPE_INFO[value].label} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(RightsType).map(type => (
                    <MenuItem key={type} value={type}>
                      {RIGHTS_TYPE_INFO[type].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Evidence URLs"
                placeholder="Provide URLs to supporting documentation or evidence, one per line"
                fullWidth
                multiline
                rows={3}
                value={verificationForm.evidenceUrls?.join('\n') || ''}
                onChange={(e) => setVerificationForm({
                  ...verificationForm,
                  evidenceUrls: e.target.value.split('\n').filter(url => url.trim().length > 0)
                })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Contact Email"
                placeholder="Email address for verification communications"
                fullWidth
                type="email"
                value={verificationForm.contactEmail || ''}
                onChange={(e) => setVerificationForm({
                  ...verificationForm,
                  contactEmail: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                placeholder="Additional information for the verification team"
                fullWidth
                multiline
                rows={3}
                value={verificationForm.notes || ''}
                onChange={(e) => setVerificationForm({
                  ...verificationForm,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyRightsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitVerification} 
            variant="contained" 
            disabled={loading || !verificationForm.rightTypes || verificationForm.rightTypes.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Verification Request'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Usage Compliance Dialog */}
      <Dialog
        open={usageComplianceDialogOpen}
        onClose={() => setUsageComplianceDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Check Usage Compliance</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Verify if a specific usage scenario complies with the rights and limitations of this asset.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Purpose *"
                placeholder="e.g., Marketing, Production, Prototype"
                fullWidth
                required
                value={usageComplianceForm.purpose}
                onChange={(e) => setUsageComplianceForm({
                  ...usageComplianceForm,
                  purpose: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Platform *"
                placeholder="e.g., Web, Mobile, Print, TV"
                fullWidth
                required
                value={usageComplianceForm.platform}
                onChange={(e) => setUsageComplianceForm({
                  ...usageComplianceForm,
                  platform: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Usage Type</InputLabel>
                <Select
                  value={usageComplianceForm.usageType}
                  label="Usage Type *"
                  onChange={(e: SelectChangeEvent<string>) => setUsageComplianceForm({
                    ...usageComplianceForm,
                    usageType: e.target.value
                  })}
                >
                  <MenuItem value="inclusion">Inclusion (Unmodified)</MenuItem>
                  <MenuItem value="derivative">Derivative Work</MenuItem>
                  <MenuItem value="reference">Reference Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Territory"
                placeholder="e.g., US, EU, Global"
                fullWidth
                value={usageComplianceForm.territory}
                onChange={(e) => setUsageComplianceForm({
                  ...usageComplianceForm,
                  territory: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={usageComplianceForm.commercial}
                    onChange={(e) => setUsageComplianceForm({
                      ...usageComplianceForm,
                      commercial: e.target.checked
                    })}
                  />
                }
                label="Commercial Use"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={usageComplianceForm.derivative}
                    onChange={(e) => setUsageComplianceForm({
                      ...usageComplianceForm,
                      derivative: e.target.checked
                    })}
                  />
                }
                label="Will create derivative works"
              />
            </Grid>
          </Grid>
          
          {complianceResult && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Compliance Result
              </Typography>
              
              <Alert 
                severity={complianceResult.compliant ? 'success' : 'error'} 
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1">
                  {complianceResult.compliant ? 'Usage Compliant ✓' : 'Usage Non-Compliant ✗'}
                </Typography>
                <Typography variant="body2">
                  {complianceResult.compliant 
                    ? 'This usage scenario complies with the asset\'s rights and limitations.' 
                    : 'This usage scenario does not comply with the asset\'s rights and limitations.'}
                </Typography>
              </Alert>
              
              {complianceResult.issues && complianceResult.issues.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Compliance Issues
                  </Typography>
                  <List dense>
                    {complianceResult.issues.map((issue, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <WarningIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={issue} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {complianceResult.limitations && complianceResult.limitations.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Usage Limitations
                  </Typography>
                  <List dense>
                    {complianceResult.limitations.map((limitation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <InfoIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={limitation} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {complianceResult.requiresAttribution && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attribution Requirement
                  </Typography>
                  <Alert severity="warning" variant="outlined">
                    <Typography variant="body2">
                      This asset requires attribution. Please use the following attribution text:
                    </Typography>
                    <Box sx={{ 
                      mt: 1, 
                      p: 1, 
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      borderRadius: 1, 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {complianceResult.attributionText || rights.attributionText || `Credit: ${asset.name}`}
                      </Typography>
                      <IconButton size="small" onClick={() => {
                        const text = complianceResult.attributionText || rights.attributionText || `Credit: ${asset.name}`;
                        navigator.clipboard.writeText(text);
                      }}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUsageComplianceDialogOpen(false);
            setComplianceResult(null);
          }}>
            Close
          </Button>
          <Button 
            onClick={handleCheckCompliance} 
            variant="contained" 
            disabled={loading || !usageComplianceForm.purpose || !usageComplianceForm.platform}
          >
            {loading ? <CircularProgress size={24} /> : 'Check Compliance'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rights Settings Dialog */}
      <Dialog
        open={updateSettingsDialogOpen}
        onClose={() => setUpdateSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Rights Settings</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settingsForm.commercialUse || false}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      commercialUse: e.target.checked
                    })}
                  />
                }
                label="Allow Commercial Use"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settingsForm.derivativeWorks || false}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      derivativeWorks: e.target.checked
                    })}
                  />
                }
                label="Allow Derivative Works"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settingsForm.attributionRequired || false}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      attributionRequired: e.target.checked
                    })}
                  />
                }
                label="Require Attribution"
              />
            </Grid>
            
            {settingsForm.attributionRequired && (
              <Grid item xs={12}>
                <TextField
                  label="Attribution Text"
                  placeholder="Required attribution text for this asset"
                  fullWidth
                  multiline
                  rows={2}
                  value={settingsForm.attributionText || ''}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    attributionText: e.target.value
                  })}
                  helperText="Specify the exact text that should be used for attribution"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateSettingsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateSettings} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Settings'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rights History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Rights Management History</DialogTitle>
        <DialogContent>
          {rights.updateHistory && rights.updateHistory.length > 0 ? (
            <List>
              {rights.updateHistory.map((update, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {formatDate(update.updatedAt)} by {update.updatedBy}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" component="div">
                            Changed fields: {update.changedFields.join(', ')}
                          </Typography>
                          {update.previousStatus && (
                            <Typography variant="body2" component="div">
                              Status changed from {update.previousStatus} to {rights.status}
                            </Typography>
                          )}
                          {update.notes && (
                            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                              Notes: {update.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < rights.updateHistory.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No rights management history available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Verification Status Dialog */}
      <Dialog
        open={verificationStatusDialogOpen}
        onClose={() => setVerificationStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Verification Status</DialogTitle>
        <DialogContent>
          {currentVerificationJobId && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Job ID:</strong> {currentVerificationJobId}
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : verificationStatus ? (
                <Box sx={{ mt: 2 }}>
                  <Alert 
                    severity={
                      verificationStatus.status === RightsStatus.VERIFIED ? 'success' :
                      verificationStatus.status === RightsStatus.REJECTED ? 'error' :
                      'info'
                    }
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle2">
                      Status: {verificationStatus.status.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      {verificationStatus.message}
                    </Typography>
                  </Alert>
                  
                  {verificationStatus.details && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Verification Details
                      </Typography>
                      
                      {verificationStatus.details.verifiedRights && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Verified Rights:</strong> {verificationStatus.details.verifiedRights.map(
                            (right: RightsType) => RIGHTS_TYPE_INFO[right].label
                          ).join(', ')}
                        </Typography>
                      )}
                      
                      {verificationStatus.details.verificationTimestamp && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Verification Time:</strong> {formatDate(verificationStatus.details.verificationTimestamp)}
                        </Typography>
                      )}
                      
                      {verificationStatus.details.verificationMethod && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Method:</strong> {
                            VERIFICATION_METHOD_INFO[verificationStatus.details.verificationMethod].label
                          }
                        </Typography>
                      )}
                      
                      {verificationStatus.details.verificationId && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Verification ID:</strong> {verificationStatus.details.verificationId}
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {!verificationStatus.completed && (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => checkVerificationStatus(currentVerificationJobId)}
                      sx={{ mt: 2 }}
                    >
                      Refresh Status
                    </Button>
                  )}
                </Box>
              ) : (
                <Alert severity="info">
                  Click "Check Status" to get the current verification status.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationStatusDialogOpen(false)}>Close</Button>
          {currentVerificationJobId && !loading && !verificationStatus && (
            <Button 
              onClick={() => checkVerificationStatus(currentVerificationJobId)} 
              variant="contained"
            >
              Check Status
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};


export default RightsManagement;