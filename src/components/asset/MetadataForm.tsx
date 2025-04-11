import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Grid,
  Typography,
  Divider,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface MetadataFormProps {
  layerCode: string;
  onFormChange: (data: AssetMetadata, isValid: boolean) => void;
  initialData?: AssetMetadata;
}

export interface AssetMetadata {
  name: string;
  description: string;
  source?: string;
  tags: string[];
  // Layer-specific metadata fields
  layerSpecificData?: Record<string, any>;
  // Optional sections
  trainingData?: {
    isTrainable: boolean;
    trainingDescription?: string;
    trainingRequirements?: string;
  };
  rights?: {
    license: string;
    attributionRequired: boolean;
    attributionText?: string;
    commercialUse: boolean;
  };
}

// Layer-specific validation schemas
const layerValidationSchema: Record<string, any> = {
  // Songs layer
  G: {
    tempo: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
    key: yup.string().nullable(),
    duration: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
  },
  // Stars layer
  S: {
    age: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
    personality: yup.string().nullable(),
  },
  // Looks layer
  L: {
    colorPalette: yup.string().nullable(),
    style: yup.string().nullable(),
  },
  // Moves layer
  M: {
    duration: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
    complexity: yup.string().nullable(),
    speed: yup.string().nullable(),
  },
  // Worlds layer
  W: {
    size: yup.string().nullable(),
    theme: yup.string().nullable(),
    terrain: yup.string().nullable(),
  },
};

// Create a base validation schema
const createValidationSchema = (layerCode: string) => {
  const baseSchema = yup.object({
    name: yup.string().required('Name is required').max(100, 'Name must be at most 100 characters'),
    description: yup.string().required('Description is required'),
    source: yup.string(),
    tags: yup.array().of(yup.string()),
    trainingData: yup.object({
      isTrainable: yup.boolean(),
      trainingDescription: yup.string().when('isTrainable', {
        is: true,
        then: yup.string().required('Training description is required when asset is trainable'),
        otherwise: yup.string(),
      }),
      trainingRequirements: yup.string(),
    }),
    rights: yup.object({
      license: yup.string().required('License is required'),
      attributionRequired: yup.boolean(),
      attributionText: yup.string().when('attributionRequired', {
        is: true,
        then: yup.string().required('Attribution text is required when attribution is required'),
        otherwise: yup.string(),
      }),
      commercialUse: yup.boolean(),
    }),
  });

  // Add layer-specific validation
  if (layerCode && layerValidationSchema[layerCode]) {
    return baseSchema.shape({
      layerSpecificData: yup.object(layerValidationSchema[layerCode]),
    });
  }

  return baseSchema;
};

// Layer-specific form fields
const renderLayerSpecificFields = (
  layerCode: string, 
  control: any, 
  errors: any
) => {
  switch (layerCode) {
    case 'G': // Songs
      return (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.tempo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Tempo (BPM)"
                  type="number"
                  error={!!errors.layerSpecificData?.tempo}
                  helperText={errors.layerSpecificData?.tempo?.message}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">BPM</InputAdornment>,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.key"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Key"
                  error={!!errors.layerSpecificData?.key}
                  helperText={errors.layerSpecificData?.key?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.duration"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Duration"
                  type="number"
                  error={!!errors.layerSpecificData?.duration}
                  helperText={errors.layerSpecificData?.duration?.message}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">sec</InputAdornment>,
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      );
    case 'M': // Moves
      return (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.duration"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Duration"
                  type="number"
                  error={!!errors.layerSpecificData?.duration}
                  helperText={errors.layerSpecificData?.duration?.message}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">sec</InputAdornment>,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.complexity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Complexity"
                  select
                  SelectProps={{ native: true }}
                  error={!!errors.layerSpecificData?.complexity}
                  helperText={errors.layerSpecificData?.complexity?.message}
                >
                  <option value=""></option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.speed"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Speed"
                  select
                  SelectProps={{ native: true }}
                  error={!!errors.layerSpecificData?.speed}
                  helperText={errors.layerSpecificData?.speed?.message}
                >
                  <option value=""></option>
                  <option value="slow">Slow</option>
                  <option value="medium">Medium</option>
                  <option value="fast">Fast</option>
                </TextField>
              )}
            />
          </Grid>
        </Grid>
      );
    case 'W': // Worlds
      return (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.size"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Size"
                  select
                  SelectProps={{ native: true }}
                  error={!!errors.layerSpecificData?.size}
                  helperText={errors.layerSpecificData?.size?.message}
                >
                  <option value=""></option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.theme"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Theme"
                  error={!!errors.layerSpecificData?.theme}
                  helperText={errors.layerSpecificData?.theme?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="layerSpecificData.terrain"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Terrain"
                  error={!!errors.layerSpecificData?.terrain}
                  helperText={errors.layerSpecificData?.terrain?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      );
    // Add cases for other layers as needed
    default:
      return null;
  }
};

const MetadataForm: React.FC<MetadataFormProps> = ({
  layerCode,
  onFormChange,
  initialData
}) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const validationSchema = createValidationSchema(layerCode);
  
  const defaultValues: AssetMetadata = {
    name: '',
    description: '',
    source: '',
    tags: [],
    layerSpecificData: {},
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
    },
    ...initialData
  };

  const { control, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm<AssetMetadata>({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Watch for form changes and notify parent component
  const formValues = watch();
  React.useEffect(() => {
    onFormChange(formValues, isValid);
  }, [formValues, isValid, onFormChange]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const newTags = tags.filter(tag => tag !== tagToDelete);
    setTags(newTags);
    setValue('tags', newTags);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Asset Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Provide essential information about your asset.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form">
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Asset Name"
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description"
                  required
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Source"
                  placeholder="Where did this asset come from? (URL, creator name, etc.)"
                  error={!!errors.source}
                  helperText={errors.source?.message}
                />
              )}
            />
          </Grid>
          
          {/* Tags */}
          <Grid item xs={12}>
            <Box mb={1}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box display="flex" alignItems="center">
                <TextField
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  label="Add Tag"
                  variant="outlined"
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  sx={{ mr: 1, flexGrow: 1 }}
                />
                <Button
                  onClick={handleAddTag}
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="medium"
                >
                  Add
                </Button>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Grid>

          {/* Layer-specific fields */}
          {layerCode && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {layerCode} Layer Specific Information
              </Typography>
              {renderLayerSpecificFields(layerCode, control, errors)}
            </Grid>
          )}

          {/* Training Data (Optional) */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="training-data-content"
                id="training-data-header"
              >
                <Typography>Training Data (Optional)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="trainingData.isTrainable"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                            />
                          }
                          label="This asset can be used for training AI models"
                        />
                      )}
                    />
                  </Grid>
                  
                  {watch('trainingData.isTrainable') && (
                    <>
                      <Grid item xs={12}>
                        <Controller
                          name="trainingData.trainingDescription"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Training Description"
                              multiline
                              rows={2}
                              error={!!errors.trainingData?.trainingDescription}
                              helperText={errors.trainingData?.trainingDescription?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="trainingData.trainingRequirements"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Training Requirements"
                              multiline
                              rows={2}
                              error={!!errors.trainingData?.trainingRequirements}
                              helperText={errors.trainingData?.trainingRequirements?.message}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Rights Information */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="rights-content"
                id="rights-header"
              >
                <Typography>Rights Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="rights.license"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="License"
                          select
                          SelectProps={{ native: true }}
                          error={!!errors.rights?.license}
                          helperText={errors.rights?.license?.message}
                        >
                          <option value=""></option>
                          <option value="CC0">CC0 (Public Domain)</option>
                          <option value="CC-BY">CC-BY (Attribution)</option>
                          <option value="CC-BY-SA">CC-BY-SA (Attribution-ShareAlike)</option>
                          <option value="CC-BY-NC">CC-BY-NC (Attribution-NonCommercial)</option>
                          <option value="CC-BY-ND">CC-BY-ND (Attribution-NoDerivs)</option>
                          <option value="proprietary">Proprietary (All Rights Reserved)</option>
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="rights.attributionRequired"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                            />
                          }
                          label="Attribution Required"
                        />
                      )}
                    />
                  </Grid>
                  
                  {watch('rights.attributionRequired') && (
                    <Grid item xs={12}>
                      <Controller
                        name="rights.attributionText"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Attribution Text"
                            error={!!errors.rights?.attributionText}
                            helperText={errors.rights?.attributionText?.message}
                          />
                        )}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Controller
                      name="rights.commercialUse"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                            />
                          }
                          label="Commercial Use Allowed"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MetadataForm;