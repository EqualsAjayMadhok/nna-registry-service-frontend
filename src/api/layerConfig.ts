import React from 'react';
import {
  LibraryMusic as SongIcon,
  Person as StarIcon,
  Checkroom as LookIcon,
  SettingsAccessibility as MoveIcon,
  Public as WorldIcon,
  Loyalty as BrandedIcon,
  FaceRetouchingNatural as PersonalizeIcon, 
  Collections as TrainingIcon,
  DynamicFeed as CompositeIcon,
  Security as RightsIcon
} from '@mui/icons-material';
import { LayerOption, CategoryOption, SubcategoryOption } from '../types/taxonomy.types';

/**
 * Configuration file for NNA Layer details
 * Use this file to customize the appearance and descriptions of layer cards in the UI
 */

export interface LayerDetails {
  icon: React.ReactNode;
  description: string;
  color: string;
}

// Define layer card details with icon, description and color
export const layerConfig: Record<string, LayerDetails> = {
  // Songs Layer
  G: {
    icon: React.createElement(SongIcon, { fontSize: "large" }),
    description: 'Audio clips, music tracks, sound effects and voice recordings',
    color: '#1976d2' // blue
  },
  
  // Stars Layer
  S: {
    icon: React.createElement(StarIcon, { fontSize: "large" }),
    description: 'Avatars, character and personality assets',
    color: '#e91e63' // pink
  },
  
  // Looks Layer
  L: {
    icon: React.createElement(LookIcon, { fontSize: "large" }),
    description: 'Outfits, Costumes, and Wardrobes',
    color: '#9c27b0' // purple
  },
  
  // Moves Layer
  M: {
    icon: React.createElement(MoveIcon, { fontSize: "large" }),
    description: 'Dance moves, actions, gestures and choreography',
    color: '#4caf50' // green
  },
  
  // Worlds Layer
  W: {
    icon: React.createElement(WorldIcon, { fontSize: "large" }),
    description: 'Stages, Locations, 3D environments, backgrounds, and digital twins',
    color: '#ff9800' // orange
  },
  
  // Branded Layer
  B: {
    icon: React.createElement(BrandedIcon, { fontSize: "large" }),
    description: 'Brand assets, outfits, fashion, moves, logos, products and sponsorships',
    color: '#f44336' // red
  },
  
  // Personalize Layer
  P: {
    icon: React.createElement(PersonalizeIcon, { fontSize: "large" }),
    description: 'User-provided personalized content - faces, looks, moves, and worlds',
    color: '#795548' // brown
  },
  
  // Training Data Layer
  T: {
    icon: React.createElement(TrainingIcon, { fontSize: "large" }),
    description: 'AI training data, prompts, images, videos, and model assets',
    color: '#607d8b' // blue-grey
  },
  
  // Composite Layer
  C: {
    icon: React.createElement(CompositeIcon, { fontSize: "large" }),
    description: 'Combined assets and layered compositions',
    color: '#009688' // teal
  },
  
  // Rights Layer
  R: {
    icon: React.createElement(RightsIcon, { fontSize: "large" }),
    description: 'Rights management, provenance attribution, and licensing assets',
    color: '#673ab7' // deep purple
  }
};

// MVP layers - only these will be displayed in the UI
export const mvpLayerCodes = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];

// Functions maintained from previous implementation
export const generateHumanFriendlyName = (
  layer: LayerOption,
  category: CategoryOption,
  subcategory: SubcategoryOption,
  sequentialNumber: number = 1
): string => {
  // Format: LayerCode.CategoryCode.SubcategoryCode.SequentialNumber
  // Example: S.POP.DVA.001
  const layerCode = layer.code;
  const categoryCode = category.code;
  const subcategoryCode = subcategory.code;
  
  // Format the sequential number as a 3-digit string with leading zeros
  const formattedNumber = String(sequentialNumber).padStart(3, '0');
  
  return `${layerCode}.${categoryCode}.${subcategoryCode}.${formattedNumber}`;
};

// Function to generate machine-friendly NNA address based on layer, category, and subcategory
export const generateMachineFriendlyAddress = (
  layer: LayerOption,
  category: CategoryOption,
  subcategory: SubcategoryOption,
  sequentialNumber: number = 1
): string => {
  // Format: LayerCode.CategoryNumericCode.SubcategoryNumericCode.SequentialNumber
  // Example: S.001.002.001
  const layerCode = layer.code;
  
  // For demonstration purposes, we'll use the array index + 1 as numeric codes
  // In a real implementation, these would come from the taxonomy service
  const categoryNumericCode = String(category.numericCode || 1).padStart(3, '0');
  const subcategoryNumericCode = String(subcategory.numericCode || 1).padStart(3, '0');
  
  // Format the sequential number as a 3-digit string with leading zeros
  const formattedNumber = String(sequentialNumber).padStart(3, '0');
  
  return `${layerCode}.${categoryNumericCode}.${subcategoryNumericCode}.${formattedNumber}`;
};

// Get the next sequential number for a layer-category-subcategory combination
export const getNextSequentialNumber = async (
  layer: LayerOption,
  category: CategoryOption,
  subcategory: SubcategoryOption
): Promise<number> => {
  try {
    console.log(`[layerConfig] Getting next sequential number for ${layer.code}.${category.code}.${subcategory.code}`);
    
    // Import directly from the asset count service
    const { getExistingAssetsCount } = await import('../utils/assetCountService');
    
    // Get the count from the backend via our service
    const count = await getExistingAssetsCount(
      layer.code,
      category.code,
      subcategory.code
    );
    
    console.log(`[layerConfig] Got count ${count} for ${layer.code}.${category.code}.${subcategory.code}`);
    
    // Next sequential number is count + 1
    const nextNumber = count + 1;
    
    console.log(`[layerConfig] Returning sequential number: ${nextNumber}`);
    return nextNumber;
  } catch (error) {
    console.error('[layerConfig] Error getting next sequential number:', error);
    // Return 1 as a safe fallback
    return 1;
  }
};