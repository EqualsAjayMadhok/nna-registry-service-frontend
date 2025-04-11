import taxonomyData from '../assets/enriched_nna_layer_taxonomy_v1.2.json';
import {
  TaxonomyData,
  LayerInfo,
  Category,
  Subcategory,
  LayerOption,
  CategoryOption,
  SubcategoryOption
} from '../types/taxonomy.types';

class TaxonomyService {
  private taxonomyData: TaxonomyData;
  private isInitialized: boolean = false;
  private layerCache: Map<string, LayerInfo> = new Map();
  private categoriesCache: Map<string, CategoryOption[]> = new Map();
  private subcategoriesCache: Map<string, SubcategoryOption[]> = new Map();

  constructor() {
    this.taxonomyData = taxonomyData as unknown as TaxonomyData;
    this.initialize();
  }

  /**
   * Initialize the taxonomy service and validate data
   */
  private initialize(): void {
    try {
      // Basic validation to ensure taxonomy data is structured correctly
      if (!this.taxonomyData) {
        throw new Error('Taxonomy data is empty or invalid');
      }

      // Check for required layers (G, S, L, M, W) at minimum
      const requiredLayers = ['G', 'S', 'L', 'M', 'W'];
      for (const layer of requiredLayers) {
        if (!this.taxonomyData[layer]) {
          throw new Error(`Required layer ${layer} is missing from taxonomy data`);
        }
      }

      this.isInitialized = true;
      console.log('Taxonomy service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize taxonomy service:', error);
      throw error;
    }
  }

  /**
   * Check if the service is initialized
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Taxonomy service is not initialized');
    }
  }

  /**
   * Get all available layers
   * @returns Array of layer options
   */
  getLayers(): LayerOption[] {
    this.checkInitialized();

    const layers: LayerOption[] = [];
    for (const layerCode in this.taxonomyData) {
      // Skip any non-layer properties
      const layerData = this.taxonomyData[layerCode];
      if (typeof layerData !== 'object' || layerData === null || !('name' in layerData)) {
        continue;
      }

      const layer = this.taxonomyData[layerCode] as LayerInfo;
      layers.push({
        id: layerCode,
        name: layer.name,
        code: layerCode
      });
    }

    return layers;
  }

  /**
   * Get the layer information by layer code
   * @param layerCode The layer code (e.g., 'G', 'S', 'L')
   * @returns Layer information or null if not found
   */
  getLayer(layerCode: string): LayerInfo | null {
    this.checkInitialized();

    if (this.layerCache.has(layerCode)) {
      return this.layerCache.get(layerCode) || null;
    }

    const layer = this.taxonomyData[layerCode];
    if (!layer) {
      return null;
    }

    this.layerCache.set(layerCode, layer);
    return layer;
  }

  /**
   * Get categories for a specific layer
   * @param layerCode The layer code (e.g., 'G', 'S', 'L')
   * @returns Array of category options
   */
  getCategories(layerCode: string): CategoryOption[] {
    this.checkInitialized();

    if (this.categoriesCache.has(layerCode)) {
      return this.categoriesCache.get(layerCode) || [];
    }

    const layer = this.getLayer(layerCode);
    if (!layer || !layer.categories) {
      return [];
    }

    const categories: CategoryOption[] = [];
    for (const categoryCode in layer.categories) {
      const category = layer.categories[categoryCode];
      categories.push({
        id: `${layerCode}.${categoryCode}`,
        name: category.name,
        code: categoryCode,
        layerCode
      });
    }

    this.categoriesCache.set(layerCode, categories);
    return categories;
  }

  /**
   * Get subcategories for a specific category within a layer
   * @param layerCode The layer code (e.g., 'G', 'S', 'L')
   * @param categoryCode The category code (e.g., '001', '002')
   * @returns Array of subcategory options
   */
  getSubcategories(layerCode: string, categoryCode: string): SubcategoryOption[] {
    this.checkInitialized();

    const cacheKey = `${layerCode}.${categoryCode}`;
    if (this.subcategoriesCache.has(cacheKey)) {
      return this.subcategoriesCache.get(cacheKey) || [];
    }

    const layer = this.getLayer(layerCode);
    if (!layer || !layer.categories || !layer.categories[categoryCode]) {
      return [];
    }

    const category = layer.categories[categoryCode];
    if (!category.subcategories) {
      return [];
    }

    const subcategories: SubcategoryOption[] = [];
    for (const subcategoryCode in category.subcategories) {
      const subcategory = category.subcategories[subcategoryCode];
      subcategories.push({
        id: `${layerCode}.${categoryCode}.${subcategoryCode}`,
        name: subcategory.name,
        code: subcategoryCode,
        categoryCode,
        layerCode
      });
    }

    this.subcategoriesCache.set(cacheKey, subcategories);
    return subcategories;
  }

  /**
   * Get the full taxonomy data
   * @returns The complete taxonomy data object
   */
  getTaxonomyData(): TaxonomyData {
    this.checkInitialized();
    return this.taxonomyData;
  }

  /**
   * Get a category by its code and layer
   * @param layerCode The layer code
   * @param categoryCode The category code
   * @returns The category object or null if not found
   */
  getCategory(layerCode: string, categoryCode: string): Category | null {
    this.checkInitialized();
    
    const layer = this.getLayer(layerCode);
    if (!layer || !layer.categories || !layer.categories[categoryCode]) {
      return null;
    }
    
    return layer.categories[categoryCode];
  }

  /**
   * Get a subcategory by its codes
   * @param layerCode The layer code
   * @param categoryCode The category code
   * @param subcategoryCode The subcategory code
   * @returns The subcategory object or null if not found
   */
  getSubcategory(layerCode: string, categoryCode: string, subcategoryCode: string): Subcategory | null {
    this.checkInitialized();
    
    const category = this.getCategory(layerCode, categoryCode);
    if (!category || !category.subcategories || !category.subcategories[subcategoryCode]) {
      return null;
    }
    
    return category.subcategories[subcategoryCode];
  }

  /**
   * Get the full taxonomy path as a string (e.g., "Songs > Pop > Teen_Pop")
   * @param layerCode The layer code
   * @param categoryCode The category code
   * @param subcategoryCode The subcategory code
   * @returns The formatted path or empty string if layer is not provided
   */
  getTaxonomyPath(layerCode?: string, categoryCode?: string, subcategoryCode?: string): string {
    if (!layerCode) return '';
    
    this.checkInitialized();
    
    const layer = this.getLayer(layerCode);
    if (!layer) {
      return layerCode;
    }
    
    let path = layer.name;
    
    if (categoryCode) {
      const category = this.getCategory(layerCode, categoryCode);
      if (!category) {
        return path;
      }
      
      path += ` > ${category.name}`;
      
      if (subcategoryCode) {
        const subcategory = this.getSubcategory(layerCode, categoryCode, subcategoryCode);
        if (!subcategory) {
          return path;
        }
        
        path += ` > ${subcategory.name}`;
      }
    }
    
    return path;
  }
}

// Create a singleton instance
const taxonomyService = new TaxonomyService();

export default taxonomyService;