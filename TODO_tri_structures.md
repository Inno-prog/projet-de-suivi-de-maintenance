

## Backend - Étapes

### 1. Modifier StructureMefpController
- [x] Ajouter paramètre `sortBy` et `sortDirection` à l'endpoint paginated
- [x] Passer les paramètres de tri au service

### 2. Modifier StructureMefpService
- [x] Ajouter méthode pour créer un Pageable avec tri dynamique

### 3. Modifier StructureMefpRepository
- [x] Optionnel: Ajouter méthodes de tri personnalisées si nécessaire

## Frontend - Étapes

### 1. Modifier StructureMefpListComponent
- [x] Ajouter sélecteur de tri dans la barre de filtres
- [x] Ajouter variable pour le champ de tri et la direction
- [x] Mettre à jour loadStructures() pour passer les paramètres de tri
- [x] Mettre à jour filterStructures() pour maintenir le tri

### 2. Modifier structure-mefp.service.ts
- [x] Ajouter paramètres de tri à l'appel paginated

## Tests
- [ ] Vérifier que les structures sont triées par défaut par nom
- [ ] Vérifier que le sélecteur de tri fonctionne
- [ ] Vérifier que la pagination conserve le tri

