# TODO: Implémentation Hiérarchie Complète Structures MEFP

## Objectif
Implémenter la hiérarchie complète des 17 régions du Burkina Faso avec leurs villes, et afficher les structures du MEFP de manière organisée dans la sidebar et la page dédiée.

## Étapes

### 1. Backend - Script SQL pour les 17 régions et leurs villes ✅
- [x] Créer le script `backend/insert_regions_villes_bf.sql` avec les 17 régions et leurs villes
- [x] Vérifier que la table `structures_mefp` a les colonnes `region` et `ville`

### 2. Backend - Service de données de référence ✅
- [x] Créer `ReferenceDataService.java` avec les 17 régions et leurs villes
- [x] Créer les méthodes pour attribuer automatiquement la région en fonction de la ville

### 3. Backend - Amélioration du service StructureMefpService ✅
- [x] Intégrer ReferenceDataService
- [x] Améliorer la méthode getHierarchy() pour inclure toutes les 17 régions
- [x] Ajouter l'auto-assignation de région lors de la création/modification
- [x] Ajouter des méthodes utilitaires (getAllRegions, getAllVilles, etc.)

### 4. Backend - Nouveaux endpoints ✅
- [x] GET /api/structures-mefp/regions - Liste toutes les 17 régions
- [x] GET /api/structures-mefp/villes - Liste toutes les villes
- [x] GET /api/structures-mefp/regions/{region}/villes - Liste les villes d'une région

### 5. Frontend - Service ✅
- [x] Ajouter les nouveaux endpoints au service structure-mefp.service.ts

### 6. Frontend - Page Structures MEFP ✅
- [x] Mettre à jour structures-mefp.component.html avec meilleure présentation
- [x] Ajouter des animations pour les collapsebles
- [x] Améliorer structures-mefp.component.css avec nouveaux styles

### 7. Frontend - Component TypeScript ✅
- [x] Ajouter getTotalVilles()
- [x] Ajouter selectStructure(), editStructure(), deleteStructure()
- [x] Améliorer le comportement d'expansion par défaut

### 8. Tests et Vérifications
- [ ] Vérifier que l'API /hierarchy retourne les 17 régions
- [ ] Vérifier l'affichage dans la sidebar
- [ ] Vérifier l'affichage sur la page structures-mefp

## Données des 17 Régions et Villes ✅

1. **Bankui** (Chef-lieu : Dédougou)
   - Dédougou, Nouna, Tougan, Solenzo, Toma

2. **Djôrô** (Chef-lieu : Gaoua)
   - Gaoua, Diébougou, Dano, Batié

3. **Goulmou** (Chef-lieu : Fada N'Gourma)
   - Fada N'Gourma, Diapaga, Bogandé, Manni

4. **Guiriko** (Chef-lieu : Bobo-Dioulasso)
   - Bobo-Dioulasso, Houndé, Orodara, Banfora

5. **Kadiogo** (Chef-lieu : Ouagadougou)
   - Ouagadougou, Saaba, Koubri, Tanghin-Dassouri

6. **Kuilsé** (Chef-lieu : Kaya)
   - Kaya, Kongoussi, Boulsa, Pissila

7. **Liptako** (Chef-lieu : Dori)
   - Dori, Gorom-Gorom, Sebba

8. **Nando** (Chef-lieu : Koudougou)
   - Koudougou, Réo, Léo, Sabou

9. **Nakambé** (Chef-lieu : Tenkodogo)
   - Tenkodogo, Koupéla, Pouytenga, Garango

10. **Nazinon** (Chef-lieu : Manga)
    - Manga, Kombissiri, Pô

11. **Oubri** (Chef-lieu : Ziniaré)
    - Ziniaré, Boussé, Zorgho

12. **Sirba** (Chef-lieu : Bogandé)
    - Bogandé, Manni, Coalla

13. **Soum** (Chef-lieu : Djibo)
    - Djibo, Arbinda, Tongomayel

14. **Tannounyan** (Chef-lieu : Banfora)
    - Banfora, Sindou, Mangodara

15. **Tapoa** (Chef-lieu : Diapaga)
    - Diapaga, Pama

16. **Sourou** (Chef-lieu : Tougan)
    - Tougan, Lankoué, Kiembara

17. **Yaadga** (Chef-lieu : Ouahigouya)
    - Ouahigouya, Gourcy, Titao

## Fichiers Modifiés/Créés

### Backend
- `backend/src/main/java/com/dgsi/maintenance/service/ReferenceDataService.java` (NOUVEAU)
- `backend/src/main/java/com/dgsi/maintenance/service/StructureMefpService.java` (MODIFIÉ)
- `backend/src/main/java/com/dgsi/maintenance/controller/StructureMefpController.java` (MODIFIÉ)
- `backend/insert_regions_villes_bf.sql` (NOUVEAU)

### Frontend
- `frontend/src/app/core/services/structure-mefp.service.ts` (MODIFIÉ)
- `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.html` (MODIFIÉ)
- `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.ts` (MODIFIÉ)
- `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.css` (MODIFIÉ)

## Notes
- Les structures comme "Impôts", "Contrôle (DCMEF)", "Trésor" seront attribuées à la ville de Ouagadougou (Kadiogo)
- D'autres structures seront réparties selon leur ville
- L'attribution automatique de région se fait en fonction de la ville définie

