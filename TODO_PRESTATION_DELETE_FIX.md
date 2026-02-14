TODO_PRESTATION_DELETE_FIX.md
=======================

# Fix Prestation Delete 500 Error

## Problem
When trying to delete a prestation with ID 95, a 500 Internal Server Error occurs:
```
DELETE http://localhost:8085/api/prestations/95 500 (Internal Server Error)
Erreur lors de la suppression
```

## Root Cause Analysis

1. **Generic error handling**: The backend catches exceptions but only returns a generic message
2. **Database constraint issues**: Foreign key relationships may cause violations:
   - `itemsUtilises` (ManyToMany via `prestation_item` table)
   - `ordreCommande` (ManyToOne relationship)
   - `fichePrestation` (referenced by `idPrestation`)
3. **Transaction issues**: Rollback may not be handled properly

## Files to Modify

1. `backend/src/main/java/com/dgsi/maintenance/service/PrestationService.java`
   - Improve `deletePrestation()` method with better error handling
   - Properly clean up relationships before physical delete
   - Add detailed logging

2. `backend/src/main/java/com/dgsi/maintenance/controller/PrestationController.java`
   - Improve error response with actual error details
   - Handle constraint violations gracefully

3. `frontend/src/app/features/prestations/components/prestation-list/prestation-list.component.ts`
   - Display actual error message from backend

## Implementation Plan

### 1. PrestationService - Improve deletePrestation()

```java
@Transactional
public boolean deletePrestation(Long id, boolean isAdmin) {
    log.info("🗑️ Delete request: ID={}, isAdmin={}", id, isAdmin);
    
    try {
        Optional<Prestation> prestationOpt = prestationRepository.findById(id);
        if (prestationOpt.isEmpty()) {
            log.warn("⚠️ Prestation not found: {}", id);
            return false;
        }
        
        Prestation prestation = prestationOpt.get();
        log.info("📋 Found prestation: {} (status={}, validation={})", 
            id, prestation.getStatutIntervention(), prestation.getStatutValidation());
        
        if (isAdmin) {
            // Physical delete for admin
            return performPhysicalDelete(prestation);
        } else {
            // Soft delete for prestataire
            return performSoftDelete(prestation);
        }
        
    } catch (DataIntegrityViolationException e) {
        log.error("❌ Database constraint violation deleting prestation {}: {}", id, e.getMessage());
        throw new RuntimeException("Impossible de supprimer: la prestation est liée à d'autres données", e);
    } catch (Exception e) {
        log.error("❌ Unexpected error deleting prestation {}: {}", id, e.getMessage(), e);
        throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage(), e);
    }
}

private boolean performPhysicalDelete(Prestation prestation) {
    try {
        // Clean up relationships
        // 1. Clear itemsUtilises relationship
        prestation.getItemsUtilises().clear();
        prestationRepository.save(prestation);
        
        // 2. Handle ordreCommande - nullify or cascade based on requirements
        if (prestation.getOrdreCommande() != null) {
            log.info("📦 Nullifying ordreCommande relationship for prestation {}", prestation.getId());
            prestation.setOrdreCommande(null);
            prestationRepository.save(prestation);
        }
        
        // 3. Delete associated fiche if exists
        Optional<FichePrestation> ficheOpt = fichePrestationRepository
            .findByIdPrestation(prestation.getId().toString());
        if (ficheOpt.isPresent()) {
            log.info("📄 Deleting associated fiche for prestation {}", prestation.getId());
            fichePrestationRepository.delete(ficheOpt.get());
        }
        
        // 4. Finally delete the prestation
        prestationRepository.delete(prestation);
        log.info("✅ Prestation {} physically deleted", prestation.getId());
        return true;
        
    } catch (Exception e) {
        log.error("❌ Error during physical delete of prestation {}: {}", prestation.getId(), e.getMessage());
        throw new RuntimeException("Erreur lors de la suppression définitive: " + e.getMessage(), e);
    }
}

private boolean performSoftDelete(Prestation prestation) {
    try {
        prestation.setDeleted(true);
        prestationRepository.save(prestation);
        log.info("✅ Prestation {} marked as deleted (soft delete)", prestation.getId());
        return true;
    } catch (Exception e) {
        log.error("❌ Error during soft delete of prestation {}: {}", prestation.getId(), e.getMessage());
        throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage(), e);
    }
}
```

### 2. PrestationController - Improve error response

```java
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
public ResponseEntity<?> deletePrestation(@PathVariable Long id, Authentication authentication) {
    log.info("📥 DELETE /api/prestations/{} - User: {}", id, authentication.getName());
    
    try {
        // ... existing validation logic ...
        
        boolean deleted = prestationService.deletePrestation(id, isAdmin);
        
        if (deleted) {
            log.info("✅ Prestation {} deleted successfully", id);
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "Prestation supprimée avec succès"
            ));
        } else {
            log.warn("⚠️ Prestation {} not found", id);
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Prestation non trouvée"
            ));
        }
        
    } catch (RuntimeException e) {
        log.error("❌ Error deleting prestation {}: {}", id, e.getMessage());
        
        String errorMessage = e.getMessage();
        if (errorMessage == null || errorMessage.isEmpty()) {
            errorMessage = "Erreur lors de la suppression";
        }
        
        return ResponseEntity.status(500).body(Map.of(
            "success", false,
            "message", errorMessage,
            "error", e.getClass().getSimpleName()
        ));
    } catch (Exception e) {
        log.error("❌ Unexpected error deleting prestation {}", id, e);
        return ResponseEntity.status(500).body(Map.of(
            "success", false,
            "message", "Erreur inattendue lors de la suppression"
        ));
    }
}
```

### 3. Frontend - Display actual error

```typescript
async deletePrestation(prestation: Prestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
        title: 'Supprimer la prestation',
        message: `Êtes-vous sûr de vouloir supprimer la prestation "${prestation.nomPrestation}" ?`,
        type: 'danger',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
    });

    if (confirmed) {
        this.prestationService.deletePrestation(prestation.id!).subscribe({
            next: (response) => {
                this.toastService.show({
                    type: 'success',
                    title: 'Succès',
                    message: 'Prestation supprimée avec succès'
                });
                this.loadPrestations();
            },
            error: (error) => {
                console.error('Erreur lors de la suppression:', error);
                
                // Extract actual error message from backend
                let errorMessage = 'Impossible de supprimer la prestation';
                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                this.toastService.show({
                    type: 'error',
                    title: 'Erreur de suppression',
                    message: errorMessage
                });
            }
        });
    }
}
```

## Testing

1. Test soft delete as prestataire (status = BROUILLON)
2. Test physical delete as admin
3. Verify constraint violations are properly handled
4. Check that error messages are displayed on frontend

## Database Considerations

If foreign key constraints are blocking deletion:
- Add ON DELETE SET NULL to foreign keys in schema
- Or use soft delete for all cases
- Or manually clean up relationships before delete

The recommended approach is to use soft delete for prestations to avoid data integrity issues.

