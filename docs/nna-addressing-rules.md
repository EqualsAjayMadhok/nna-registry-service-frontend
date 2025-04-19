# NNA Addressing Rules

This document outlines the rules and conventions for the NNA (Naming, Numbering, and Addressing) system used in the NNA Registry Service.

## Overview

The NNA framework uses a dual addressing system:

1. **Human-Friendly Names (HFN)** - Uses alphabetic codes for readability
   - Format: `[Layer].[Category].[Subcategory].[SequentialNumber]`
   - Example: `S.POP.BAS.001`

2. **Machine-Friendly Addresses (MFA)** - Uses numeric codes for machine processing
   - Format: `[Layer].[CategoryNumeric].[SubcategoryNumeric].[SequentialNumber]`
   - Example: `S.001.001.001`

## Sequential Numbering

Sequential numbers follow standard incrementing rules:

- Sequential numbers are padded with leading zeros to ensure 3 digits
- The first asset in a subcategory gets `001`
- Subsequent assets get `002`, `003`, etc.

### Technical Implementation

The sequential numbering rule is implemented in several places:

1. **Backend API** (`assets.service.ts`):
   ```typescript
   const count = await this.assetModel.countDocuments({
     layer,
     category,
     subcategory,
   });
   const sequentialNumber = count + 1;
   const sequential = sequentialNumber.toString().padStart(3, '0');
   ```

2. **Frontend Utilities** (`nnaAddressing.ts`):
   ```typescript
   // Add 1 to get the next number in sequence
   const nextNum = numericCount + 1;
   
   // Format with leading zeros to ensure 3 digits
   return String(nextNum).padStart(3, '0');
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

**Q: How are sequential numbers assigned?**

A: Sequential numbers start at "001" for the first asset in a category/subcategory combination and increment by 1 for each new asset. The system maintains uniqueness within each taxonomy path.

**Q: What happens if I delete an asset?**

A: The system does not reuse sequential numbers. If you delete asset "001", the next asset will still be "002" to maintain referential integrity.

**Q: Can I manually assign a sequential number?**

A: Yes, the system supports manual assignment of sequential numbers when creating assets. However, the system will validate that the number is not already in use within the same category/subcategory.