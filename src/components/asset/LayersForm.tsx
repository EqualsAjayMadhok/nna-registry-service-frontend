import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Button,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import taxonomyService from '../../api/taxonomyService';
import { LayerOption } from '../../types/taxonomy.types';
import { PaginatedResponse } from '../../types/api.types';
import { Asset } from '../../types/asset.types';
import AssetService from '../../services/api/asset.service';
import { ExpandMore } from '@mui/icons-material';
import { Controller } from 'react-hook-form';

interface IComponentForm {
  control: any;
}

export const LayersForm = ({ control }: IComponentForm) => {
  const [layers, setLayers] = useState<LayerOption[]>([]);
  const [_selectedLayer, setSelectedLayer] = useState<LayerOption | undefined>(undefined);
  const [selectedLayers, setSelectLayers] = useState<LayerOption[]>([]);
  const [components, setComponents] = useState<{ layer: LayerOption; assets: Asset[] }[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    fetchLayers();
  }, []);

  useEffect(() => {
    fetchAsstes(_selectedLayer);
  }, [selectedLayers, _selectedLayer]);

  const fetchAsstes = async (selectedLayer: LayerOption | undefined) => {
    try {
      setLoading(true);

      if (selectedLayer) {
        const response: PaginatedResponse<Asset> = await AssetService.getAssets({
          layer: selectedLayer.id,
        });

        setComponents(prev =>
          [
            ...prev,
            {
              layer: selectedLayer,
              assets: response.items,
            },
          ].filter(item => selectedLayers.some((item2: any) => item.layer.id === item2.id))
        );

        console.log(response, 'response');
      }

      setComponents(prev =>
        prev.filter(item => selectedLayers.some((item2: any) => item.layer.id === item2.id))
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLayers = async () => {
    const allLayerOptions = taxonomyService.getLayers();

    setLayers(allLayerOptions);
  };

  const options = layers.filter(item => item.id !== 'C');

  const renderComponents = components.map((item, index) => (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">{`${item.layer.id}.${item.layer.name}`}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {item.assets.length <= 0 ? (
            <Alert severity="warning">No assets available for this layer yet.</Alert>
          ) : (
            <Controller
              name={`layerSpecificData.components${index}`}
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={item.assets.map(asset => ({
                    value: asset.name,
                    title: `${asset.name} (${asset.description})`,
                  }))}
                  fullWidth
                  getOptionLabel={(option: any) => option.title}
                  getOptionKey={(option: any) => option.value}
                  filterOptions={values => {
                    return values.filter(
                      item => !field?.value?.some((item2: any) => item.value === item2.value)
                    );
                  }}
                  renderInput={params => (
                    <TextField {...params} label="Components" placeholder="Components" />
                  )}
                  onChange={(event, item) => {
                    field.onChange(item);
                  }}
                  value={field.value}
                />
              )}
            />
          )}
          <Button onClick={() => {
            window.open('/assets/new', '_blank');
          }} variant="contained">Add asset for {item.layer.name} layer</Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  ));

  return (
    <Stack mt={2} spacing={2}>
      <Autocomplete
        multiple
        options={options}
        fullWidth
        getOptionLabel={(option: any) => option.name}
        getOptionKey={(option: any) => option.id}
        filterOptions={values => {
          return values.filter(item => !selectedLayers.some((item2: any) => item.id === item2.id));
        }}
        renderInput={params => <TextField {...params} label="Layers" placeholder="Select layers" />}
        onChange={(event, item, reason, detail) => {
          console.log(detail?.option, 'detail');
          setSelectedLayer(detail?.option);
          setSelectLayers(item);
        }}
        value={selectedLayers}
      />
      {components.length > 0 && (
        <Stack>
          <Divider sx={{ mb: 2 }} />
          {renderComponents}
          {isLoading && <LinearProgress />}
        </Stack>
      )}
    </Stack>
  );
};
