export interface Subcategory {
  name: string;
  code?: string;
  [key: string]: any;
}

export interface SubcategoryMap {
  [key: string]: Subcategory;
}

export interface Category {
  name: string;
  code?: string;
  subcategories: SubcategoryMap;
  [key: string]: any;
}

export interface CategoryMap {
  [key: string]: Category;
}

export interface LayerInfo {
  name: string;
  categories: CategoryMap;
  [key: string]: any;
}

export interface TaxonomyData {
  // Specific layer keys
  G: LayerInfo; // Songs
  S: LayerInfo; // Stars
  L: LayerInfo; // Looks
  M: LayerInfo; // Moves
  W: LayerInfo; // Worlds

  // Optional properties for other keys
  [otherKey: string]: LayerInfo | undefined;
}

// Types for the taxonomy service functions
export interface LayerOption {
  id: string;
  name: string;
  code: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  code: string;
  categoryCodeName?: string;
  layerCode: string;
  numericCode?: number; // Numeric code for machine-friendly address
}

export interface SubcategoryOption {
  id: string;
  name: string;
  code: string;
  categoryCode: string;
  layerCode: string;
  numericCode?: number; // Numeric code for machine-friendly address
  subcategoryCode?: string;
}
