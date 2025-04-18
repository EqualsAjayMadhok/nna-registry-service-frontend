import { Autocomplete, CircularProgress, LinearProgress, Stack, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import AssetService from '../../services/api/asset.service';
import { PaginatedResponse } from '../../types/api.types';
import { useEffect, useState } from 'react';
import { Asset } from '../../types/asset.types';

interface IComponentForm {
  control: any;
}

export const ComponentForm = ({ control }: IComponentForm) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetchAsstes();
  }, []);

  const fetchAsstes = async () => {
    try {
      const response: PaginatedResponse<Asset> = await AssetService.getAssets();

      setAssets(response.items);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const options = assets.map(asset => ({
    value: asset.name,
    title: `${asset.name} (${asset.description})`,
  }));

  return (
    <Stack mt={2}>
      {isLoading && (
        <LinearProgress
          sx={{
            mb: 2,
          }}
        />
      )}
      <Controller
        name="layerSpecificData.components"
        control={control}
        render={({ field }) => (
          <Autocomplete
            multiple
            options={options}
            fullWidth
            getOptionLabel={(option: any) => option.title}
            getOptionKey={(option: any) => option.value}
            filterOptions={(values) => {
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
    </Stack>
  );
};
