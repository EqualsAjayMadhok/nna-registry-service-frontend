import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import TaxonomySelector from '../components/taxonomy/TaxonomySelector';

interface TaxonomySelection {
  layer: string;
  category: string;
  subcategory: string;
  path: string | null;
}

const TaxonomyPage: React.FC = () => {
  const [selection, setSelection] = useState<TaxonomySelection | null>(null);

  const handleSelectionChange = (newSelection: TaxonomySelection) => {
    setSelection(newSelection);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          NNA Taxonomy Browser
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Browse and select from the NNA Framework's taxonomy layers, categories, and subcategories.
        </Typography>

        <TaxonomySelector onSelectionChange={handleSelectionChange} />

        {selection && selection.layer && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Taxonomy Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Layer:
              </Typography>
              <Typography variant="body1">
                {selection.layer}
              </Typography>
            </Box>
            
            {selection.category && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category:
                </Typography>
                <Typography variant="body1">
                  {selection.category}
                </Typography>
              </Box>
            )}
            
            {selection.subcategory && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Subcategory:
                </Typography>
                <Typography variant="body1">
                  {selection.subcategory}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Full Path:
              </Typography>
              <Alert severity="info" sx={{ mt: 1 }}>
                {selection.path || 'Complete your selection to see the full path'}
              </Alert>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default TaxonomyPage;