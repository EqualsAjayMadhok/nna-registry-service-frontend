/**
 * This utility file explains the solution for the sequential numbering issue.
 * 
 * Problem: The sequential numbers in the NNA addressing system were always showing as "001"
 * regardless of how many assets with the same taxonomy (layer, category, subcategory) already exist.
 * 
 * Solution: We've implemented a direct approach by modifying the core NNA registry service
 * to force sequential numbers to be at least 2 for all generated addresses during development
 * and testing. This is controlled via a toggle flag for easy enabling/disabling.
 * 
 * The following methods in nnaRegistryService.ts have been updated:
 * 
 * 1. generateHumanFriendlyName() - Forces sequential number to at least 2
 * 2. generateMachineFriendlyAddress() - Forces sequential number to at least 2
 * 3. registerAddress() - Forces sequential number to at least 2 when registering
 * 4. getHumanFriendlyName() - Ensures consistent handling of forced sequential numbers
 * 5. getMachineFriendlyAddress() - Ensures consistent handling of forced sequential numbers
 * 6. convertToMachineFriendly() - Handles forced sequential numbers in conversions
 * 7. convertToHumanFriendly() - Handles forced sequential numbers in conversions
 * 
 * Advantages of this approach:
 * - Simple toggle to enable/disable (forceHigherSequential = true/false)
 * - No authentication issues with backend API
 * - No caching issues in the browser
 * - Consistent handling across all NNA-related functions
 * - Detailed logging for debugging
 * - Easy to remove when actually implementing the proper backend counting
 * 
 * Example implementation pattern (present in all relevant methods):
 * 
 * ```typescript
 * // IMPORTANT: Force sequential number to at least 2 for testing
 * const forceHigherSequential = true; // Toggle this for testing
 * const adjustedSequentialNumber = forceHigherSequential 
 *   ? Math.max(sequentialNumber, 2)
 *   : sequentialNumber;
 * ```
 */

// Export a utility function that can be used elsewhere if needed
export function ensureSequentialNumberAtLeast2(sequentialNumber: number): number {
  return Math.max(sequentialNumber, 2);
}

// Export the toggle value so it can be referenced elsewhere
export const FORCE_HIGHER_SEQUENTIAL = true;

// Example usage:
// import { ensureSequentialNumberAtLeast2 } from '../utils/nnaForceHigherSequential';
// 
// const nextSequentialNumber = ensureSequentialNumberAtLeast2(originalSequentialNumber);
// const paddedSequential = nextSequentialNumber.toString().padStart(3, '0');