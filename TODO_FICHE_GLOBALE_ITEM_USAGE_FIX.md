# Plan: Fix Fiche Globale Item Usage Quantity

## Problem Summary
In the "fiche globale" (global sheet), the "quantité utilisée" column is not displaying the correct total quantity for each item. The system currently shows just the number of prestations (fiches) for each item, but it should count the TOTAL quantity used across ALL fiches in the lot.

## Solution Plan

### Files to Modify:

1. **backend/src/main/java/com/dgsi/maintenance/service/FichePrestationPdfService.java**
   - Add a method to retrieve ALL items for a specific lot
   - Add a method to calculate total item usage from ALL fiches in the lot
   - Modify `addPrestatairePrestationsTable` method to display global item usage instead of per-prestataire usage

2. **backend/src/main/java/com/dgsi/maintenance/repository/ItemRepository.java** (if needed)
   - Add method to find items by lot

### Implementation Steps:

1. **Add method to get all items by lot in ItemService or directly in FichePrestationPdfService**
   - Create method to fetch all items for a specific lot

2. **Add method to calculate global item usage across ALL fiches**
   - Query all validated fiches for the lot
   - For each item in the lot, sum up all quantities from ALL fiches
   - Return a Map<String, Integer> with item name as key and total quantity as value

3. **Modify the PDF generation to show global usage**
   - In `addPrestatairePrestationsTable`, instead of using the current fiche's quantity, use the global usage count
   - The column "Quantité réalisée" should show the total usage across all fiches, not just the current fiche

4. **Backend dependencies needed:**
   - Inject ItemRepository in FichePrestationPdfService
   - Inject FichePrestationRepository in FichePrestationPdfService

### Key Changes:

- The "Quantité réalisée" column will now show the sum of all quantities for each item across ALL fiches
- Items not used will show 0
- This matches the "UTILISATION" column in the items page

