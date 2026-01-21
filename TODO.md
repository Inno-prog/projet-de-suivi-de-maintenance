# Fix Contract Items Display Issue

## Problem
When creating a new contract for a provider, the system displays "aucun item pour ce contrat" (no items for this contract) instead of showing the items linked to the lot of the contract.

## Root Cause
The `getItemsByPrestataire` method in ItemController was using an inefficient loop to match items by lot, which may not work correctly for all cases.

## Solution
1. Add a new method `findByLotIn` to ItemRepository to efficiently find items by multiple lots
2. Update ItemController to use the new repository method instead of manual filtering
3. Ensure proper lot matching logic

## Tasks
- [x] Analyze the issue and identify root cause
- [x] Add `findByLotIn` method to ItemRepository
- [x] Update ItemController to use the new repository method
- [ ] Test the fix by creating a new contract
- [ ] Verify items are displayed correctly for prestataires

## Files Modified
- backend/src/main/java/com/dgsi/maintenance/repository/ItemRepository.java
- backend/src/main/java/com/dgsi/maintenance/controller/ItemController.java
