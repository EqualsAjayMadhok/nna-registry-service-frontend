// Version and scalability types
export interface VersionInfo {
  current_version: string;
  previous_versions: string[];
  deprecated_categories: {
    code: string;
    deprecated_in: string;
    replaced_by: string;
  }[];
}

export interface ScalabilityFeatures {
  hierarchical_expansion: {
    enabled: boolean;
    description: string;
  };
  category_mappings: {
    legacy_codes: { [key: string]: string };
    aliases: { [key: string]: string };
  };
  versioning: VersionInfo;
}

// Core taxonomy types
export interface Subcategory {
  code: string;  // 3-letter code (e.g., "BAS")
  name: string;  // Human readable name
  numericCode?: string;  // 3-digit code (e.g., "001")
}

export interface Category {
  code: string;  // 3-letter code (e.g., "POP")
  name: string;  // Human readable name
  subcategories: { [key: string]: Subcategory };  // Keyed by numeric code
}

export interface LayerInfo {
  name: string;
  categories: { [key: string]: Category };  // Keyed by numeric code
}

export interface TaxonomyData {
  scalability_features: ScalabilityFeatures;
  G: LayerInfo;  // Songs
  S: LayerInfo;  // Stars
  L: LayerInfo;  // Looks
  M: LayerInfo;  // Moves
  W: LayerInfo;  // Worlds
  [otherKey: string]: LayerInfo | ScalabilityFeatures;
}

// UI Component types (used in TaxonomySelection.tsx)
export interface LayerOption {
  id: string;
  name: string;
  code: string;  // Single letter code (e.g., "G", "S", etc.)
  description?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  code: string;  // 3-letter code
  categoryCodeName?: string;
  layerCode: string;
  numericCode?: number;  // 3-digit code as number
}

export interface SubcategoryOption {
  id: string;
  name: string;
  code: string;  // 3-letter code
  categoryCode: string;
  layerCode: string;
  numericCode?: number;  // 3-digit code as number
  subcategoryCode?: string;
}

// Helper type for mapping between codes
export interface CodeMapping {
  numericCode: number;  // 3-digit code as number
  alphabeticCode: string;  // 3-letter code
  name: string;
}
