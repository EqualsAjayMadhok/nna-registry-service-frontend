import { useState, useEffect } from 'react';
import taxonomyService from '../api/taxonomyService';
import { LayerOption, CategoryOption, SubcategoryOption } from '../types/taxonomy.types';

export const useTaxonomy = () => {
  const [layers, setLayers] = useState<LayerOption[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load layers on initialization
  useEffect(() => {
    try {
      const layerOptions = taxonomyService.getLayers();
      setLayers(layerOptions);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load taxonomy data');
      setLoading(false);
    }
  }, []);

  // Load categories when layer changes
  useEffect(() => {
    if (!selectedLayer) {
      setCategories([]);
      return;
    }

    try {
      const categoryOptions = taxonomyService.getCategories(selectedLayer);
      setCategories(categoryOptions);
      setSelectedCategory('');
      setSubcategories([]);
      setSelectedSubcategory('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    }
  }, [selectedLayer]);

  // Load subcategories when category changes
  useEffect(() => {
    if (!selectedLayer || !selectedCategory) {
      setSubcategories([]);
      return;
    }

    try {
      const subcategoryOptions = taxonomyService.getSubcategories(selectedLayer, selectedCategory);
      setSubcategories(subcategoryOptions);
      setSelectedSubcategory('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subcategories');
    }
  }, [selectedLayer, selectedCategory]);

  const selectLayer = (layerCode: string) => {
    setSelectedLayer(layerCode);
  };

  const selectCategory = (categoryCode: string) => {
    setSelectedCategory(categoryCode);
  };

  const selectSubcategory = (subcategoryCode: string) => {
    setSelectedSubcategory(subcategoryCode);
  };

  const getTaxonomyPath = (): string | null => {
    return taxonomyService.getTaxonomyPath(
      selectedLayer,
      selectedCategory,
      selectedSubcategory
    );
  };

  return {
    // State
    layers,
    categories,
    subcategories,
    selectedLayer,
    selectedCategory,
    selectedSubcategory,
    loading,
    error,
    
    // Actions
    selectLayer,
    selectCategory,
    selectSubcategory,
    
    // Utilities
    getTaxonomyPath,
    taxonomyService,
  };
};

export default useTaxonomy;