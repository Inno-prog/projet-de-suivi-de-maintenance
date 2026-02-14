# TODO: Fix - Brouillon Prestations Not Visible to Admin

## Problem
When a prestataire creates a prestation ( Brouillon ), it immediately appears in the admin dashboard because a `FichePrestation` is automatically created with `EN_ATTENTE` status. The requirement is that brouillon prestations should NOT appear in the admin dashboard until the prestataire explicitly submits them.

## Solution
Only create `FichePrestation` when the prestataire submits for validation, not when creating a brouillon.

## Changes Required

### 1. PrestationService.java
- [x] Remove automatic `FichePrestation` creation from `createPrestationFromRequest()` when `statutValidation = BROUILLON`
- [x] Only create fiche and send notification when the prestation is NOT a brouillon

### 2. FichePrestationController.java
- [x] Update `getAllFiches()` to return both VALIDE and EN_ATTENTE fiches to admin (but NOT brouillons)
- [x] Update `getAllFichesDev()` for consistency with production behavior
- [x] Add `cleanup-brouillon-fiches` endpoint to clean up existing brouillon-linked fiches

## Behavior After Fix

### When Prestataire Creates Prestation (Brouillon):
1. Prestation is saved with `statutValidation = "BROUILLON"`
2. NO `FichePrestation` is created
3. Prestation is only visible to the prestataire in their dashboard

### When Prestataire Submits Prestation:
1. `/submit` endpoint creates the `FichePrestation` with `statut = EN_ATTENTE`
2. Admin dashboard shows the fiche for validation

### Admin Dashboard:
- Shows all `VALIDE` fiches (already validated)
- Shows all `EN_ATTENTE` fiches (submitted for validation)
- Does NOT show fiches from brouillon prestations (not yet submitted)

## IMPORTANT: Cleaning Up Existing Data

If you have existing brouillon-linked fiches that were created BEFORE this fix, they need to be cleaned up:

### Option 1: Use the API Endpoint (Recommended)
After restarting the backend with the new code, call this endpoint as admin:
```bash
curl -X POST http://localhost:8085/api/fiches-prestation/cleanup-brouillon-fiches \
  -H "Authorization: Bearer <your-admin-token>"
```

### Option 2: Use the SQL Script
Run the cleanup SQL script:
```bash
psql -U username -d database -f backend/cleanup_brouillon_fiches.sql
```

## Files Modified
1. `backend/src/main/java/com/dgsi/maintenance/service/PrestationService.java`
2. `backend/src/main/java/com/dgsi/maintenance/controller/FichePrestationController.java`
3. `backend/cleanup_brouillon_fiches.sql` (new SQL cleanup script)

## Status
✅ All backend changes completed. The fix is now in place.

## Testing
1. Restart the backend with the new code
2. Clean up existing brouillon-linked fiches using the API or SQL script
3. As a prestataire, create a new prestation (it will be Brouillon)
4. Verify the admin dashboard does NOT show this prestation
5. Submit the prestation
6. Verify the admin dashboard NOW shows the prestation for validation

