# TODO - Fiche Globale Item Usage Fix

## Information Gathered:
- Problem: In "fiche globale" (global sheet), the "quantité utilisée" column shows only the number of prestations (count of fiches), not the actual total quantity used
- The system should count how many times each item was used across ALL fiches in the lot
- For IT Solutions Burkina with lot 1, this should show the total usage across all their fiches
- This should match the "UTILISATION" column in the items page

## Current Behavior:
- `addPrestatairePrestationsTable` in `FichePrestationPdfService.java` uses `getItemUsageCount(itemNom, fiche)` which gets quantity from current fiche only

## Files to Modify:
1. **backend/src/main/java/com/dgsi/maintenance/service/FichePrestationPdfService.java**
   - Add FichePrestationRepository dependency
   - Add method to get global item usage across ALL fiches for a lot
   - Modify addPrestatairePrestationsTable to use global usage counts

## Implementation Steps:
- [ ] 1. Add FichePrestationRepository dependency in FichePrestationPdfService
- [ ] 2. Add method to calculate global item usage from all fiches in the lot
- [ ] 3. Modify addPrestatairePrestationsTable to display global quantities
- [ ] 4. Test the changes

## Dependent Files:
- None (only modifying the PDF service)

## Followup Steps:
- Rebuild the backend
- Test the fiche globale PDF generation
- Verify quantities match the items page

