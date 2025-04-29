/**
 * Mapping file for NNA taxonomy codes
 * Maps numeric codes to alphabetic codes for human-friendly display
 */

// Category code mappings (numeric to alphabetic)
export const categoryCodeMap: Record<string, Record<string, string>> = {
  // Songs layer (G)
  G: {
    '001': 'POP', // Pop
    '002': 'ROC', // Rock
    '003': 'HIP', // Hip Hop
    '004': 'DNC', // Dance/Electronic
    '005': 'DIS', // Disco/Funk
    '006': 'RNB', // RnB
    '007': 'JAZ', // Jazz
    '008': 'JPP', // J-Pop
    '009': 'KPP', // K-Pop
    '010': 'CNT', // Country
    '011': 'LAT', // Latin
    '012': 'REG', // Reggae
    '013': 'FOL', // Folk
    '014': 'CLS', // Classical
    '015': 'AMB', // Ambient
    '016': 'SND', // Soundtracks
    '017': 'MET', // Metal
    '018': 'PNK', // Punk
    '019': 'BLU', // Blues
    '020': 'SKA', // Ska
  },
  // Stars layer (S)
  S: {
    '001': 'POP', // Pop
    '002': 'ROC', // Rock
    '003': 'HIP', // Hip Hop
    '004': 'ACT', // Actor
    '005': 'COM', // Comedy
    '006': 'INF', // Influencer
    '007': 'ATH', // Athlete
    '008': 'DNC', // Dancer
    '009': 'MOD', // Model
    '010': 'VTB', // VTuber
    '011': 'ANI', // Anime
    '012': 'GAM', // Gaming
    '013': 'CEL', // Celebrity
    '014': 'SPK', // Speaker
    '015': 'CHF', // Chef
  },
  // Looks layer (L)
  L: {
    '001': 'FAS', // Fashion
    '002': 'OUT', // Outfits
    '003': 'COS', // Costumes
    '004': 'ACC', // Accessories
    '005': 'HAI', // Hair
    '006': 'MAK', // Makeup
  },
  // Moves layer (M)
  M: {
    '001': 'DNC', // Dance
    '002': 'CHR', // Choreography
    '003': 'PER', // Performance
    '004': 'SPT', // Sports
    '005': 'MAR', // Martial Arts
    '006': 'ACT', // Action
  },
  // Worlds layer (W)
  W: {
    '001': 'STG', // Stage
    '002': 'SCN', // Scenes
    '003': 'LOC', // Locations
    '004': 'ENV', // Environments
    '005': 'VFX', // Visual Effects
    '006': 'BKG', // Backgrounds
  },
  // Branded layer (B)
  B: {
    '001': 'PRD', // Products
    '002': 'LOG', // Logos
    '003': 'BND', // Brands
    '004': 'MRC', // Merchandise
    '005': 'SPO', // Sponsorships
  },
  // Personalize layer (P)
  P: {
    '001': 'FAC', // Faces
    '002': 'BOD', // Bodies
    '003': 'VOC', // Voices
    '004': 'PER', // Personalities
  },
  // Training Data layer (T)
  T: {
    '001': 'PRM', // Prompts
    '002': 'IMG', // Images
    '003': 'VID', // Videos
    '004': 'MDL', // Models
    '005': 'DAT', // Datasets
  },
  // Composite layer (C)
  C: {
    '001': 'SCN', // Scenes
    '002': 'PRF', // Performances
    '003': 'VID', // Videos
    '004': 'MIX', // Mixes
  },
  // Rights layer (R)
  R: {
    '001': 'LIC', // Licenses
    '002': 'CPY', // Copyrights
    '003': 'TRM', // Terms
    '004': 'ATR', // Attribution
    '005': 'PRV', // Provenance
  },
};

// Subcategory code mappings for common subcategories
export const subCategoryCodeMap: Record<string, Record<string, Record<string, string>>> = {
  // Songs layer subcategories
  G: {
    '001': {
      // Pop
      '001': 'BAS', // Base
      '002': 'GLB', // Global_Pop
      '003': 'TNP', // Teen_Pop
      '004': 'DNC', // Dance_Pop
      '005': 'ELC', // Electro_Pop
      '006': 'DRM', // Dream_Pop
      '007': 'IND', // Indie_Pop
      '008': 'LAT', // Latin_Pop
      '009': 'SOL', // Soul_Pop
      '010': 'PRK', // Pop_Rock
      '011': 'ALT', // Alt_Pop
    },
    '002': {
      // Rock
      '001': 'BAS', // Base
      '002': 'CLS', // Classic_Rock
      '003': 'MOD', // Modern_Rock
      '004': 'GRN', // Grunge
      '005': 'PNK', // Punk_Rock
      '006': 'ALT', // Alternative_Rock
      '007': 'PRG', // Progressive_Rock
      '008': 'PSY', // Psychedelic_Rock
      '009': 'FLK', // Folk_Rock
      '010': 'ARN', // Arena_Rock
      '011': 'GRG', // Garage_Rock
    },
  },
  // Stars layer subcategories
  S: {
    '001': {
      // Pop
      '001': 'BAS', // Base
      '002': 'DVA', // Pop_Diva_Female_Stars
      '003': 'IDL', // Pop_Idol_Female_Stars
      '004': 'BND', // Pop_Boy_Band_Stars
      '005': 'SVL', // Pop_Solo_Vocalist
      '006': 'GRP', // Pop_Group
    },
    '004': {
      // Actor
      '001': 'BAS', // Base
      '002': 'MOV', // Movie_Actor
      '003': 'TVS', // TV_Series_Actor
      '004': 'VOI', // Voice_Actor
      '005': 'STG', // Stage_Actor
    },
  },
};

/**
 * Converts a numeric code to its alphabetic equivalent
 * @param layerCode Layer code (G, S, L, etc.)
 * @param categoryCode Category numeric code (e.g., 001)
 * @param subcategoryCode Optional subcategory numeric code (e.g., 001)
 * @returns The alphabetic code or the original code if not found
 */
export function getAlphabeticCode(
  layerCode: string,
  categoryCode: string,
  subcategoryCode?: string
): string {
  // Convert category code
  const categoryAlpha = categoryCodeMap[layerCode]?.[categoryCode];

  if (!subcategoryCode) {
    return categoryAlpha || categoryCode;
  }

  // Convert subcategory code if provided
  const subcategoryAlpha = subCategoryCodeMap[layerCode]?.[categoryCode]?.[subcategoryCode];

  return subcategoryAlpha || subcategoryCode;
}

/**
 * Generate a human-friendly name using alphabetic codes
 * @param layerCode Layer code
 * @param categoryCode Category numeric code
 * @param subcategoryCode Subcategory numeric code
 * @param sequentialNumber Sequential number
 * @returns Formatted human-friendly name
 */
export function generateHumanFriendlyName(
  layerCode: string,
  categoryCode: string,
  subcategoryCode: string,
  sequentialNumber: string
): string {
  const categoryAlpha = getAlphabeticCode(layerCode, categoryCode);
  const subcategoryAlpha = getAlphabeticCode(layerCode, categoryCode, subcategoryCode);
  const seqStr = sequentialNumber.toString().padStart(3, '0');

  return `${layerCode}.${categoryAlpha}.${subcategoryAlpha}.${seqStr}`;
}

/**
 * Generate a machine-friendly address using numeric codes
 * @param layerCode Layer code
 * @param categoryCode Category numeric code
 * @param subcategoryCode Subcategory numeric code
 * @param sequentialNumber Sequential number
 * @returns Formatted machine-friendly address
 */
export function generateMachineFriendlyAddress(
  layerCode: string,
  categoryCode: string,
  subcategoryCode: string,
  sequentialNumber: string
): string {
  const seqStr = sequentialNumber.toString().padStart(3, '0');
  return `${layerCode}.${categoryCode}.${subcategoryCode}.${seqStr}`;
}
