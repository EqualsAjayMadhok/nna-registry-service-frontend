export interface Subcategory {
  name: string;
  [key: string]: any;
}

export interface SubcategoryMap {
  [key: string]: Subcategory;
}

export interface Category {
  name: string;
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
  [key: string]: LayerInfo;
  G: LayerInfo; // Songs
  S: LayerInfo; // Stars
  L: LayerInfo; // Looks
  M: LayerInfo; // Moves
  W: LayerInfo; // Worlds
  // Additional layers as needed (V, B, P, etc.)
  [key: string]: any;
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
  layerCode: string;
}

export interface SubcategoryOption {
  id: string;
  name: string;
  code: string;
  categoryCode: string;
  layerCode: string;
}