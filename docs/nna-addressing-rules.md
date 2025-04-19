# NNA Addressing Rules

This document outlines the rules and conventions for the NNA (Naming, Numbering, and Addressing) system used in the NNA Registry Service.

## Overview

The NNA framework uses a dual addressing system:

1. **Human-Friendly Names (HFN)** - Uses alphabetic codes for readability
   - Format: `[Layer].[Category].[Subcategory].[SequentialNumber]`
   - Example: `S.POP.BAS.011`

2. **Machine-Friendly Addresses (MFA)** - Uses numeric codes for machine processing
   - Format: `[Layer].[CategoryNumeric].[SubcategoryNumeric].[SequentialNumber]`
   - Example: `S.001.001.011`

## Sequential Numbering

**IMPORTANT:** Sequential numbers in NNA addresses always start at `011` (not `001`).

- Sequential numbers are padded with leading zeros to ensure 3 digits
- The minimum sequential number is `011` (displayed as `011`)
- This is enforced at the backend database level

### Technical Implementation

The sequential numbering rule is enforced in several places:

1. **Backend API** (`assets.service.ts`):
   ```typescript
   // Ensure sequential numbers start at 11 minimum
   const sequentialNumber = Math.max(count + 1, 11);
   const sequential = sequentialNumber.toString().padStart(3, '0');
   ```

2. **Frontend Configuration** (`index.html`):
   ```javascript
   window.MIN_SEQUENTIAL_NUMBER = 11;
   ```

3. **Frontend Utilities** (`nnaAddressing.ts`):
   ```typescript
   // CRITICAL FIX: Ensure sequential number is ALWAYS at least 11
   const effectiveNum = Math.max(nextNum, 11);
   ```

## Layer Codes

- `S` - Song
- `G` - Star (Performer)
- `L` - Look (Fashion/Appearance)
- `M` - Move (Choreography)
- `W` - World (Environment)
- `C` - Component (Reusable Element)

## Category and Subcategory Codes

Category and subcategory codes are defined in the taxonomy and can be:

1. **Alphabetic Codes** (for human-friendly names):
   - Usually 2-4 uppercase letters
   - Examples: `POP`, `HIP`, `ROC`, `BAS`

2. **Numeric Codes** (for machine-friendly addresses):
   - 3-digit numbers padded with zeros
   - Examples: `001`, `002`, `003`

## Governance

Changes to the NNA addressing structure should follow these guidelines:

1. Maintain backward compatibility
2. Document any changes thoroughly
3. Consider database migrations for existing assets
4. Test with various layer/category/subcategory combinations

## FAQ

**Q: Why do sequential numbers start at 011 instead of 001?**

A: This is a business requirement to ensure visual distinction in addressing. Starting at 011 instead of 001 makes it easier to distinguish between different assets and avoid confusion with default or placeholder values.

**Q: Can I use sequential numbers below 011?**

A: No, the system enforces a minimum of 011 for all sequential numbers. Any attempt to use a lower number will automatically be adjusted to 011.

**Q: What happens to existing assets with sequential number 001?**

A: Existing assets may still have sequential number 001. Consider running a database migration to update these assets if consistency is required.