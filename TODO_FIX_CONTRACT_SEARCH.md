# TODO - Correction recherche contrats prestataire

## Problème
Le système retourne 0 contrat pour un prestataire qui possède pourtant un contrat.
La requête SQL générée filtre sur `statut='ACTIF'` mais ne trouve aucun résultat.

## Étapes de correction

- [x] 1. Analyser le code existant (ContratController, ContratRepository, Contrat entity)
- [x] 2. Modifier ContratRepository.java - Ajouter méthodes de recherche par prestataireId avec/sans statut
- [x] 3. Modifier ContratController.java - Prioriser recherche par prestataireId et améliorer la logique de fallback
- [x] 4. Créer script SQL de diagnostic
- [ ] 5. Tester les modifications

## Fichiers concernés
- backend/src/main/java/com/dgsi/maintenance/repository/ContratRepository.java
- backend/src/main/java/com/dgsi/maintenance/controller/ContratController.java
