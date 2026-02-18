# Solution pour le problème de suppression de contrats

## Problème
Une erreur de contrainte de clé étrangère est survenue lors de la suppression de contrats:
```
update or delete on table "contrats" violates foreign key constraint "fkcx9kue9pwbs9h439em022pcfo" on table "contrat_regions"
Détail : Key (id)=(369) is still referenced from table "contrat_regions".
```

## Causes
Le problème est que la table `contrat_regions` (table de jointure Many-to-Many) contient des références aux contrats à supprimer, mais la suppression de ces références n'est pas gérée avant la suppression du contrat.

## Solution
### Étape 1: Ajouter une méthode pour supprimer les références dans contrat_regions
Ajouter une méthode dans le ContratRepository pour supprimer les références dans la table contrat_regions:

```java
@Modifying
@Query(value = "DELETE FROM contrat_regions WHERE contrat_id = :id", nativeQuery = true)
void deleteContratRegions(@Param("id") Long id);
```

### Étape 2: Modifier le ContratController
Ajouter l'injection de EntityManager et modifier la méthode deleteContrat pour appeler la méthode deleteContratRegions avant de supprimer le contrat:

```java
@PersistenceContext
private EntityManager entityManager;

@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMINISTRATEUR')")
@Transactional
public ResponseEntity<?> deleteContrat(@PathVariable Long id) {
    return contratRepository.findById(id)
        .map(contrat -> {
            // Supprimer les références dans la table contrat_regions (table de jointure Many-to-Many)
            contratRepository.deleteContratRegions(id);
            
            // Supprimer le contrat
            contratRepository.delete(contrat);
            return ResponseEntity.ok().build();
        })
        .orElse(ResponseEntity.notFound().build());
}
```

### Étape 3: Tester la solution
Démarrer le backend et tester la suppression d'un contrat:

```bash
curl -X DELETE http://localhost:8085/api/contrats/369 -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Script de réinitialisation
Pour réinitialiser la base de données et supprimer la table contrat_regions, exécuter le script `reset_contract_regions.sh`:

```bash
cd /home/inno/Bureau/projet-de-suivi-de-maintenance/backend
./reset_contract_regions.sh
```

## Vérification
Vérifier la liste des contrats pour confirmer que le contrat avec id=369 a été supprimé:

```bash
curl -X GET http://localhost:8085/api/contrats
```

## Resultat attendu
La réponse doit contenir seulement les contrats avec id=364 et id=366:

```json
[{"id":364,"idContrat":"CT-001-2026","dateDebut":"2026-02-17","dateFin":"2026-03-17","nomPrestataire":"CyberTech SARL","montant":800000.0,"montantRestant":781000.0,"ville":null,"typeContrat":null,"statut":"ACTIF","fichierContrat":"contrats/4004e663-ff16-48f6-9c88-afb3d78258f2_marché à commande numéro 00377 (1).pdf","lot":"lot4"},{"id":366,"idContrat":"CT-002-2026","dateDebut":"2026-02-11","dateFin":"2026-03-12","nomPrestataire":"TechPro Services","montant":5600000.0,"montantRestant":5600000.0,"ville":null,"typeContrat":null,"statut":"ACTIF","fichierContrat":"contrats/88bef8df-2bf7-4275-ba8a-21be120524d5_marché à commande numéro 00377 (1).pdf","lot":"lot1"}]
```

## Conclusion
La solution résout le problème de contrainte de clé étrangère lors de la suppression de contrats en supprimant d'abord les références dans la table contrat_regions avant de supprimer le contrat.
