# Correction du bug de création d'item (Erreur 400)

## Problème
Erreur 400 Bad Request sur POST /api/items avec message "yenne de Greenwich)" - problème probable de timezone ou validation.

## Étapes de correction

- [x] 1. Améliorer la gestion d'erreurs dans ItemController.java
- [x] 2. Corriger l'entité Item.java pour gérer les valeurs null
- [x] 3. Vérifier l'initialisation du formulaire dans item-list.component.ts
- [ ] 4. Tester la création d'item (redémarrer le backend requis)

## Fichiers à modifier
- backend/src/main/java/com/dgsi/maintenance/controller/ItemController.java
- backend/src/main/java/com/dgsi/maintenance/entity/Item.java
- frontend/src/app/features/items/components/item-list/item-list.component.ts
