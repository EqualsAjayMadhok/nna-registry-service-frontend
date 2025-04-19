/**
 * NNA Addressing Utility
 * 
 * This utility provides functions for the NNA dual addressing system, which 
 * includes both human-friendly names (alphabetic codes) and machine-friendly
 * addresses (numeric codes). 
 * 
 * The NNA address format follows:
 * [Layer].[Category].[Subcategory].[SequentialNumber]
 * 
 * Example:
 * - Human-friendly: G.POP.TSW.001 (Song.Pop.TopSongWriters.001)
 * - Machine-friendly: G.003.042.001 (Song.Category3.Subcategory42.Asset1)
 */

/**
 * Generates a 3-letter alphabetic code from a name
 * Uses different strategies to create a meaningful, readable code
 */
export function generateAlphabeticCode(name: string): string {
  if (!name) return '';
  
  // Replace underscores and hyphens with spaces for word boundary detection
  const cleanName = name.replace(/[_-]/g, ' ');
  
  // Strategy 1: If name is a single word and 3-5 letters, use it directly
  if (/^[A-Za-z]{3,5}$/.test(cleanName)) {
    return cleanName.toUpperCase();
  }
  
  // Strategy 2: For compound words, take first letters of each word (up to 3 words)
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }
  
  if (words.length === 2) {
    // If two words, use first letter of first word and first two letters of second word
    const firstInitial = words[0][0];
    const secondInitials = words[1].substring(0, 2);
    return (firstInitial + secondInitials).toUpperCase();
  }
  
  // Strategy 3: For a single long word, take first, middle-ish and last consonant
  if (words.length === 1 && words[0].length >= 5) {
    const word = words[0];
    const firstLetter = word[0];
    const middleIndex = Math.floor(word.length / 2);
    let middleLetter = word[middleIndex];
    
    // Find a consonant near the middle if possible
    for (let i = 0; i < 3; i++) {
      const checkIndex = middleIndex + i;
      if (checkIndex < word.length && isConsonant(word[checkIndex])) {
        middleLetter = word[checkIndex];
        break;
      }
      const checkIndex2 = middleIndex - i;
      if (checkIndex2 >= 0 && isConsonant(word[checkIndex2])) {
        middleLetter = word[checkIndex2];
        break;
      }
    }
    
    const lastLetter = word[word.length - 1];
    return (firstLetter + middleLetter + lastLetter).toUpperCase();
  }
  
  // Strategy 4: Use first 3 letters of the first word
  if (words.length > 0 && words[0].length >= 3) {
    return words[0].substring(0, 3).toUpperCase();
  }
  
  // Fallback strategy: Pad with X if fewer than 3 letters
  if (cleanName.length < 3) {
    return (cleanName + 'XXX').substring(0, 3).toUpperCase();
  }
  
  // Last resort: Take first 3 letters of the input
  return cleanName.substring(0, 3).toUpperCase();
}

// Helper function to check if a character is a consonant
function isConsonant(char: string): boolean {
  return /[bcdfghjklmnpqrstvwxyz]/i.test(char);
}

/**
 * Validates a human-friendly NNA name
 * Format: [A-Z].[A-Z]{2,5}.[A-Z]{2,5}.[0-9]{3,}
 */
export function validateHumanFriendlyName(name: string): boolean {
  // Regular expression for human-friendly names
  // Layer: Single uppercase letter
  // Category: 2-5 uppercase letters
  // Subcategory: 2-5 uppercase letters
  // Sequential Number: 3 or more digits
  const regex = /^[A-Z]\.[A-Z]{2,5}\.[A-Z]{2,5}\.[0-9]{3,}$/;
  return regex.test(name);
}

/**
 * Validates a machine-friendly NNA address
 * Format: [A-Z].[0-9]{3}.[0-9]{3}.[0-9]{3,}
 */
export function validateMachineFriendlyAddress(address: string): boolean {
  // Regular expression for machine-friendly addresses
  // Layer: Single uppercase letter
  // Category: 3 digits
  // Subcategory: 3 digits
  // Sequential Number: 3 or more digits
  const regex = /^[A-Z]\.[0-9]{3}\.[0-9]{3}\.[0-9]{3,}$/;
  return regex.test(address);
}

/**
 * Generates a human-friendly NNA name from components
 * For numeric category/subcategory codes, it tries to generate alphabetic codes or uses defaults
 */
export function generateHumanFriendlyName(
  layerCode: string,
  categoryCode: string,
  subcategoryCode: string,
  sequentialNumber: number,
  categoryName?: string,
  subcategoryName?: string
): string {
  if (!layerCode || !categoryCode || !subcategoryCode) {
    return '';
  }
  
  // Ensure proper formatting for the sequential number (pad with zeros)
  const sequentialStr = sequentialNumber.toString().padStart(3, '0');
  
  // If the category or subcategory code looks numeric, convert to alphabetic if names are provided
  const numericRegex = /^\d+$/;
  let finalCategoryCode = categoryCode;
  let finalSubcategoryCode = subcategoryCode;
  
  if (numericRegex.test(categoryCode) && categoryName) {
    finalCategoryCode = generateAlphabeticCode(categoryName);
  }
  
  if (numericRegex.test(subcategoryCode) && subcategoryName) {
    finalSubcategoryCode = generateAlphabeticCode(subcategoryName);
  }
  
  return `${layerCode}.${finalCategoryCode}.${finalSubcategoryCode}.${sequentialStr}`;
}

/**
 * Generates a machine-friendly NNA address from components
 */
export function generateMachineFriendlyAddress(
  layerCode: string,
  categoryNumericCode: number,
  subcategoryNumericCode: number,
  sequentialNumber: number
): string {
  if (!layerCode || isNaN(categoryNumericCode) || isNaN(subcategoryNumericCode)) {
    return '';
  }
  
  // Format codes with proper padding
  const categoryStr = categoryNumericCode.toString().padStart(3, '0');
  const subcategoryStr = subcategoryNumericCode.toString().padStart(3, '0');
  const sequentialStr = sequentialNumber.toString().padStart(3, '0');
  
  return `${layerCode}.${categoryStr}.${subcategoryStr}.${sequentialStr}`;
}

/**
 * Converts a human-friendly name to a machine-friendly address
 * Requires a mapping function to get numeric codes
 */
export function convertToMachineFriendly(
  humanFriendlyName: string,
  getCategoryNumericCode: (layerCode: string, categoryCode: string) => number,
  getSubcategoryNumericCode: (layerCode: string, categoryCode: string, subcategoryCode: string) => number
): string {
  // Validate input format
  if (!validateHumanFriendlyName(humanFriendlyName)) {
    throw new Error('Invalid human-friendly NNA name format');
  }
  
  // Split the name into components
  const [layerCode, categoryCode, subcategoryCode, sequentialNumber] = humanFriendlyName.split('.');
  
  // Get the numeric codes
  const categoryNumericCode = getCategoryNumericCode(layerCode, categoryCode);
  const subcategoryNumericCode = getSubcategoryNumericCode(layerCode, categoryCode, subcategoryCode);
  
  if (isNaN(categoryNumericCode) || isNaN(subcategoryNumericCode)) {
    throw new Error('Failed to get numeric codes for taxonomy');
  }
  
  return generateMachineFriendlyAddress(
    layerCode,
    categoryNumericCode,
    subcategoryNumericCode,
    parseInt(sequentialNumber, 10)
  );
}

/**
 * Converts a machine-friendly address to a human-friendly name
 * Requires a mapping function to get alphabetic codes
 */
export function convertToHumanFriendly(
  machineFriendlyAddress: string,
  getCategoryAlphabeticCode: (layerCode: string, numericCode: number) => string,
  getSubcategoryAlphabeticCode: (layerCode: string, categoryNumericCode: number, subcategoryNumericCode: number) => string,
  getCategoryName?: (layerCode: string, numericCode: number) => string | undefined,
  getSubcategoryName?: (layerCode: string, categoryNumericCode: number, subcategoryNumericCode: number) => string | undefined
): string {
  // Validate input format
  if (!validateMachineFriendlyAddress(machineFriendlyAddress)) {
    throw new Error('Invalid machine-friendly NNA address format');
  }
  
  // Split the address into components
  const [layerCode, categoryCodeStr, subcategoryCodeStr, sequentialNumber] = machineFriendlyAddress.split('.');
  
  // Convert to numbers
  const categoryNumericCode = parseInt(categoryCodeStr, 10);
  const subcategoryNumericCode = parseInt(subcategoryCodeStr, 10);
  
  // Get the alphabetic codes
  let categoryCode = getCategoryAlphabeticCode(layerCode, categoryNumericCode);
  let subcategoryCode = getSubcategoryAlphabeticCode(layerCode, categoryNumericCode, subcategoryNumericCode);
  
  // If mappings don't exist but we have name functions, generate codes from names
  if ((!categoryCode || categoryCode === categoryCodeStr) && getCategoryName) {
    const categoryName = getCategoryName(layerCode, categoryNumericCode);
    if (categoryName) {
      categoryCode = generateAlphabeticCode(categoryName);
    }
  }
  
  if ((!subcategoryCode || subcategoryCode === subcategoryCodeStr) && getSubcategoryName) {
    const subcategoryName = getSubcategoryName(layerCode, categoryNumericCode, subcategoryNumericCode);
    if (subcategoryName) {
      subcategoryCode = generateAlphabeticCode(subcategoryName);
    }
  }
  
  // If still no valid codes, fall back to default formatted codes
  if (!categoryCode) {
    categoryCode = 'CAT'; // Default fallback
  }
  
  if (!subcategoryCode) {
    subcategoryCode = 'SUB'; // Default fallback
  }
  
  return generateHumanFriendlyName(
    layerCode,
    categoryCode,
    subcategoryCode,
    parseInt(sequentialNumber, 10)
  );
}

/**
 * Parses an NNA name/address and returns its components
 */
export function parseNNAAddress(address: string): {
  layerCode: string;
  categoryCode: string;
  subcategoryCode: string;
  sequentialNumber: number;
  isHumanFriendly: boolean;
} | null {
  // Check if it's a valid format first
  const isHuman = validateHumanFriendlyName(address);
  const isMachine = validateMachineFriendlyAddress(address);
  
  if (!isHuman && !isMachine) {
    return null;
  }
  
  // Split the address into components
  const [layerCode, categoryCode, subcategoryCode, sequentialNumberStr] = address.split('.');
  
  return {
    layerCode,
    categoryCode,
    subcategoryCode,
    sequentialNumber: parseInt(sequentialNumberStr, 10),
    isHumanFriendly: isHuman
  };
}

/**
 * Generates the next sequential number for a taxonomy path
 */
export function getNextSequentialNumber(
  existingNumbers: number[],
  startNumber: number = 1
): number {
  if (!existingNumbers || existingNumbers.length === 0) {
    return startNumber;
  }
  
  // Sort the existing numbers
  const sortedNumbers = [...existingNumbers].sort((a, b) => a - b);
  
  // Find the next available number
  for (let i = 0; i < sortedNumbers.length; i++) {
    // If there's a gap, use that
    if (sortedNumbers[i] > startNumber + i) {
      return startNumber + i;
    }
  }
  
  // If no gaps, use the next number after the highest existing one
  return sortedNumbers[sortedNumbers.length - 1] + 1;
}

/**
 * Formats a sequential number with leading zeros
 * @param count The current count of assets (0 or more)
 * @returns Formatted sequential number (e.g., "001", "002", etc.)
 */
export function formatSequentialNumber(count: number = 0): string {
  // Ensure we're working with a number
  const numericCount = Number(count) || 0;
  
  // Add 1 to get the next number in sequence
  const nextNum = numericCount + 1;
  
  // Format with leading zeros to ensure 3 digits
  return String(nextNum).padStart(3, '0');
}

/**
 * Gets the next sequential number from a count, ensuring a minimum value for testing
 * @param count The current count of assets
 * @param minValue The minimum value to return (default is 2 for testing)
 * @returns Formatted sequential number with minimum value enforced
 */
export function getNextSequentialNumberFromCount(count: number = 0, minValue: number = 2): string {
  // Ensure we're working with a number
  const numericCount = Number(count) || 0;
  
  // Add 1 to get the next number in sequence, but ensure it meets the minimum
  const nextNum = Math.max(numericCount + 1, minValue);
  
  // Format with leading zeros to ensure 3 digits
  return String(nextNum).padStart(3, '0');
}

/**
 * Formats an NNA address for display with proper spacing and formatting
 */
export function formatNNAAddressForDisplay(address: string): string {
  if (!address) return '';
  
  // Return the address as-is to maintain the original dot notation
  // For NNA Registry Service, we need the exact format: S.POP.BAS.001
  return address;
}

/**
 * Checks if two NNA addresses represent the same asset (regardless of format)
 */
export function areEquivalentAddresses(
  address1: string,
  address2: string,
  getCategoryNumericCode: (layerCode: string, categoryCode: string) => number,
  getSubcategoryNumericCode: (layerCode: string, categoryCode: string, subcategoryCode: string) => number,
  getCategoryAlphabeticCode: (layerCode: string, numericCode: number) => string,
  getSubcategoryAlphabeticCode: (layerCode: string, categoryNumericCode: number, subcategoryNumericCode: number) => string
): boolean {
  // Parse both addresses
  const parsed1 = parseNNAAddress(address1);
  const parsed2 = parseNNAAddress(address2);
  
  if (!parsed1 || !parsed2) {
    return false;
  }
  
  // If layer codes don't match, they're definitely not equivalent
  if (parsed1.layerCode !== parsed2.layerCode) {
    return false;
  }
  
  // If sequential numbers don't match, they're definitely not equivalent
  if (parsed1.sequentialNumber !== parsed2.sequentialNumber) {
    return false;
  }
  
  // If both are the same format, we can directly compare
  if (parsed1.isHumanFriendly === parsed2.isHumanFriendly) {
    return (
      parsed1.categoryCode === parsed2.categoryCode &&
      parsed1.subcategoryCode === parsed2.subcategoryCode
    );
  }
  
  // If they're different formats, we need to convert one to the other
  if (parsed1.isHumanFriendly) {
    // Convert parsed1 (human) to machine format and compare with parsed2 (machine)
    const categoryNumericCode = getCategoryNumericCode(parsed1.layerCode, parsed1.categoryCode);
    const subcategoryNumericCode = getSubcategoryNumericCode(
      parsed1.layerCode, 
      parsed1.categoryCode, 
      parsed1.subcategoryCode
    );
    
    return (
      categoryNumericCode.toString().padStart(3, '0') === parsed2.categoryCode &&
      subcategoryNumericCode.toString().padStart(3, '0') === parsed2.subcategoryCode
    );
  } else {
    // Convert parsed2 (human) to machine format and compare with parsed1 (machine)
    const categoryNumericCode = getCategoryNumericCode(parsed2.layerCode, parsed2.categoryCode);
    const subcategoryNumericCode = getSubcategoryNumericCode(
      parsed2.layerCode, 
      parsed2.categoryCode, 
      parsed2.subcategoryCode
    );
    
    return (
      categoryNumericCode.toString().padStart(3, '0') === parsed1.categoryCode &&
      subcategoryNumericCode.toString().padStart(3, '0') === parsed1.subcategoryCode
    );
  }
}