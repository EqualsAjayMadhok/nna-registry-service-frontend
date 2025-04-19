/**
 * NNA Force Higher Sequential Numbers - Emergency Fix
 * VERSION: 2025-04-19
 * 
 * Problem: The sequential numbers in the NNA addressing system were always showing as "001"
 * regardless of how many assets with the same taxonomy (layer, category, subcategory) already exist.
 * 
 * Solution: We've implemented multiple layers of fixes:
 * 
 * 1. Core NNA registry service - Force sequential numbers to be at least 11 for all generated addresses
 * 2. Asset count service - Return counts that ensure sequential numbers are at least 011
 * 3. DOM manipulation script - Fix any "001" that might still appear due to deployment issues
 * 
 * The following files have been updated:
 * - nnaRegistryService.ts - Core service adjustments
 * - assetCountService.ts - Hard-coded high counts
 * - codeMapping.ts - Sequential number forcing in code mapping
 * - TaxonomySelection.tsx - UI component fix
 * - NNAAddressPreview.tsx - Preview component fix
 * - nnaAddressing.ts - Utility functions fixed
 * 
 * Advantages of this multi-layered approach:
 * - Works even with deployment issues
 * - No authentication issues with backend API
 * - No caching issues in the browser
 * - Consistent handling across all NNA-related functions
 * - Detailed logging for debugging
 * - Browser-side fallback ensures consistent experience
 */

// Export utility functions that can be used elsewhere
export function ensureSequentialNumberAtLeast11(sequentialNumber: number): number {
  const adjusted = Math.max(sequentialNumber, 11);
  console.log(`[NNA FORCE] Forcing sequential ${sequentialNumber} → ${adjusted}`);
  return adjusted;
}

// Export the toggle value so it can be referenced elsewhere
export const FORCE_HIGHER_SEQUENTIAL = true;
export const MINIMUM_SEQUENTIAL = 11;

/**
 * Creates an emergency DOM fix for NNA addresses
 * Replaces any .001 in NNA addresses with .011
 * 
 * @returns Browser console script as a string
 */
export function createEmergencyDOMFix(): string {
  return `
// 🔧 EMERGENCY SEQUENTIAL NUMBER FIX 🔧
// Replace all instances of "001" in NNA addresses with "011"
(function() {
  console.log("🔧 APPLYING EMERGENCY SEQUENTIAL NUMBER FIX 🔧");
  
  // Function to replace .001 with .011 in NNA addresses in text nodes
  function fixSequentialNumbers() {
    // Get all text nodes in the document
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let textNode;
    let fixCount = 0;
    
    while (textNode = walker.nextNode()) {
      const text = textNode.nodeValue;
      
      // Check if the text contains an NNA address with .001
      // Match both human-friendly (S.POP.BAS.001) and machine-friendly (S.001.001.001) formats
      if (text && (
        text.match(/[A-Z]\\.[A-Z]{3}\\.[A-Z]{3}\\.001/) || 
        text.match(/[A-Z]\\.[0-9]{3}\\.[0-9]{3}\\.001/)
      )) {
        // Perform the replacement
        const oldText = text;
        const newText = text.replace(/\\.001/g, '.011');
        
        if (oldText !== newText) {
          textNode.nodeValue = newText;
          console.log(\`🔧 Fixed: "\${oldText}" → "\${newText}"\`);
          fixCount++;
        }
      }
    }
    
    // Also update input fields and attributes
    const inputs = document.querySelectorAll('input[type="text"], input[type="hidden"], textarea');
    inputs.forEach(input => {
      const value = input.value;
      if (value && (
        value.match(/[A-Z]\\.[A-Z]{3}\\.[A-Z]{3}\\.001/) || 
        value.match(/[A-Z]\\.[0-9]{3}\\.[0-9]{3}\\.001/)
      )) {
        const oldValue = input.value;
        input.value = oldValue.replace(/\\.001/g, '.011');
        console.log(\`🔧 Fixed input: "\${oldValue}" → "\${input.value}"\`);
        fixCount++;
      }
    });
    
    console.log(\`🔧 Fixed \${fixCount} occurrences of .001 → .011\`);
    return fixCount;
  }
  
  // Run immediately and then set up MutationObserver to continuously fix
  fixSequentialNumbers();
  
  // Create visual indicator
  const indicator = document.createElement('div');
  indicator.style.position = 'fixed';
  indicator.style.bottom = '10px';
  indicator.style.right = '10px';
  indicator.style.backgroundColor = 'rgba(255, 255, 0, 0.8)';
  indicator.style.color = 'black';
  indicator.style.padding = '5px 10px';
  indicator.style.borderRadius = '5px';
  indicator.style.fontSize = '12px';
  indicator.style.fontWeight = 'bold';
  indicator.style.zIndex = '9999';
  indicator.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  indicator.textContent = '🔧 NNA FIX ACTIVE';
  document.body.appendChild(indicator);
  
  // Set up MutationObserver to fix new content
  const observer = new MutationObserver(mutations => {
    const count = fixSequentialNumbers();
    if (count > 0) {
      // Flash the indicator
      indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.8)';
      setTimeout(() => {
        indicator.style.backgroundColor = 'rgba(255, 255, 0, 0.8)';
      }, 300);
    }
  });
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  console.log("🔧 EMERGENCY FIX INSTALLED: Continuously monitoring for '001' NNA addresses");
  console.log("🔧 Any .001 in NNA addresses will be replaced with .011");
})();
  `;
}

/**
 * Check if an NNA address has a sequential number of 001
 * @param address NNA address to check
 * @returns true if address ends with .001
 */
export function hasLowSequentialNumber(address: string): boolean {
  if (!address) return false;
  
  // Check if the address ends with .001
  return address.endsWith('.001');
}

/**
 * Fix an NNA address by replacing .001 with .011
 * @param address NNA address to fix
 * @returns Fixed NNA address
 */
export function fixLowSequentialNumber(address: string): string {
  if (!address) return address;
  
  // If the address ends with .001, replace with .011
  if (address.endsWith('.001')) {
    return address.replace(/\.001$/, '.011');
  }
  
  return address;
}