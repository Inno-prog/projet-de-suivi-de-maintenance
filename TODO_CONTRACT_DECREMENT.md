# TODO - Contract Decrement on Prestation Submission

## Task: Chaque fois que le prestataire va effectuer une prestation, le montant de sa prestation doit être soustraite de son contrat

## Analysis Summary:
The implementation now correctly:
1. When a prestataire creates/submits a prestation → stays pending (no deduction yet)
2. When admin validates the fiche → contract amount is decremented

## Plan:
- [x] 1. Remove `deduireMonantContrat()` from `PrestationService.createPrestationFromRequest()`
- [x] 2. Verify `deduireMonantContrat()` is correctly called in `FichePrestationController.validerFiche()`
- [x] 3. Verify `deduireMonantContrat()` is correctly called in `FichePrestationController.devForceValider()`
- [x] 4. Create SQL script to update existing contracts based on already validated fiches

## Implementation Summary:

### Step 1: Remove deduireMonantContrat from PrestationService.createPrestationFromRequest()`
✅ DONE - Removed the code block that was calling `deduireMonantContrat()` during prestation creation.

### Step 2: Verify FichePrestationController.validerFiche()`
✅ VERIFIED - `deduireMonantContrat()` is correctly called in `validerFiche()`

### Step 3: Verify FichePrestationController.devForceValider()`
✅ VERIFIED - `deduireMonantContrat()` is correctly called in `devForceValider()`

### Step 4: SQL Script for Existing Validated Fiches
✅ CREATED - `/home/inno/projet-de-suivi-de-maintenance/backend/update_contracts_from_validated_fiches.sql`

This script:
1. Calculates total amount of validated fiches per prestataire
2. Updates contract remaining amounts based on validated fiches
3. Handles NULL montant_total by using prix_unitaire * quantite
4. Provides verification queries to check the update

## Status: ✅ ALL TASKS COMPLETED

## Behavior Summary:
1. **Prestataire submits a prestation** → Fiche created with status `EN_ATTENTE` (pending)
2. **Admin validates the fiche** → Status changes to `VALIDE` AND `deduireMonantContrat()` is called
3. **Contract budget** → Amount is decremented only after admin validation
4. **Existing validated fiches** → Run the SQL script to update contracts

## Next Steps for Data Consistency:
Execute the SQL script to synchronize existing validated fiches with contract amounts:
```bash
# Execute in PostgreSQL
psql -d maintenance_db -f backend/update_contracts_from_validated_fiches.sql
```

