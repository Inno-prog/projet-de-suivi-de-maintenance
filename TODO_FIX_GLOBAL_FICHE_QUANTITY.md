# Fix Fiche Globale Prestation Item Quantity Count

## Problem
The "fiche globale de prestation" (global service sheet) does not correctly count the quantity of item usage. Taking lot 4 as an example, it doesn't use the correct logic like the one on the items page that counts the used quantity of items.

## Root Cause Analysis
1. **Item Page (working correctly)**: Uses `fichePrestationRepository.countByItemId(itemId, lotPattern)` which queries the `fiche_prestation_items` join table to count total item usage across ALL fiches for a given lot.

2. **Fiche Prestation PDF (has the bug)**: In the `addPrestatairePrestationsTable` method, the code uses `fiche.getQuantite()` which is just the quantity from the individual fiche, instead of using the total count from the join table.

## Solution
Fix the `addPrestatairePrestationsTable` method in `FichePrestationPdfService.java` to use the `getItemUsageCount` method that correctly counts item usage from the join table.

## Files to Modify
- `backend/src/main/java/com/dgsi/maintenance/service/FichePrestationPdfService.java`

## Implementation Plan
1. In `addPrestatairePrestationsTable`, instead of using `fiche.getQuantite()` for each row, use `getItemUsageCount(itemNom, lot)` to get the total usage count of each item.
2. Update the quantity column to display the total item usage count from the join table.
