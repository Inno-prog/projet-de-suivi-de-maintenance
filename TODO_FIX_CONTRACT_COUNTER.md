# Fix Contract Counter in Provider Dashboard

## Task Description
The contract counter in the provider dashboard (tableau de bord prestataire) must count only contracts belonging to the currently connected provider, not other contracts.

## Files Modified

### 1. frontend/src/app/features/prestataire-dashboard/prestataire-dashboard.component.ts
- [x] Already correctly uses `getContratsByPrestataire(currentUser.id.toString())` to load only provider's contracts
- [x] Contract counter `{{ contrats.length }}` displays only the provider's contracts

### 2. frontend/src/app/features/contrats/components/contrat-list/contrat-list.component.ts
- [x] Fixed `loadContrats()` method to use `getContratsByPrestataire(currentUser.id)` for providers
- [x] Changed from filtering by `nomPrestataire` to using the dedicated endpoint with `prestataireId`
- [x] Admin users still see all contracts via `getAllContrats()`

### 3. frontend/src/app/core/services/contrat.service.ts
- [x] Fixed `getContratsByPrestataire(prestataireId: string)` parameter type from `number` to `string`
- [x] This matches the Keycloak user ID format used throughout the application

### 4. backend/src/main/java/com/dgsi/maintenance/controller/ContratController.java
- [x] Verified `getContratsByPrestataire(@PathVariable String prestataireId)` already accepts String
- [x] Endpoint correctly calls `contratRepository.findByPrestataireId(prestataireId)`

## Summary of Changes

The contract counter now correctly counts only contracts for the currently logged-in provider because:

1. **Provider Dashboard**: Uses `getContratsByPrestataire(currentUser.id)` which queries the backend for contracts where `prestataireId` matches the current user's Keycloak ID.

2. **Contract List Component**: Now uses the same approach - providers see only their contracts via the dedicated endpoint instead of filtering all contracts client-side.

3. **Service Layer**: Fixed type mismatch to properly handle Keycloak user IDs (strings).

4. **Backend**: Already correctly implemented to filter by `prestataireId` field in the database.

## Testing
- [ ] Log in as a provider and verify the contract count matches only their contracts
- [ ] Verify the contract list shows only the provider's contracts
- [ ] Log in as admin and verify all contracts are still visible
