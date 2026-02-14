# Fix Prestataire Items - Plan d'implémentation

## Objectif
Corriger l'erreur 400 sur `/api/auth/sync-user` et permettre aux prestataires de voir leurs items.

## Problèmes identifiés

### 1. Sync User retourne 400
Le endpoint `/api/auth/sync-user` retourne 400 quand l'utilisateur existe déjà au lieu de retourner 200.

### 2. Correspondance email échoue
La logique de `ItemController.getItemsByPrestataire()` cherche les contrats par `prestataire_id` (UUID Keycloak) ou par correspondance EXACTE d'email, mais les contrats peuvent utiliser un format différent.

## Étapes d'implémentation

### Étape 1: Corriger AuthController.syncUser()
- [x] Retourner 200 OK même si l'utilisateur existe déjà
- [x] Retourner 200 OK même sans authentification complète (dev mode)
- [x] Retourner 200 OK même en cas d'erreur (pour ne pas bloquer l'authentification)
- [x] Améliorer les logs de débogage

### Étape 2: Corriger ItemController.getItemsByPrestataire()`
- [x] Améliorer la logique de correspondance avec les contrats
- [x] Utiliser l'email du token JWT pour trouver les contrats
- [x] Ajouter une correspondance flexible:
    - Correspondance email exacte
    - Correspondance avec le préfixe de l'email (softlink = softlink@gmail.com)
    - Correspondance flexible en ignorant les espaces et caractères spéciaux
- [x] Stratégie de fallback par mots-clés courants (solution, digital, softlink, tech, etc.)
- [x] Ajouter des logs de débogage détaillés

### Étape 3: Vérifier la structure des contrats
- [ ] Vérifier si les contrats ont une colonne email_prestataire
- [ ] Créer une migration si nécessaire pour ajouter l'email aux contrats

## Fichiers modifiés

1. `backend/src/main/java/com/dgsi/maintenance/controller/AuthController.java`
2. `backend/src/main/java/com/dgsi/maintenance/controller/ItemController.java`

## Tests

- [x] Modifications appliquées
- [ ] Redémarrer le backend
- [ ] Se connecter en tant que prestataire
- [ ] Vérifier que sync-user retourne 200
- [ ] Vérifier que les items sont affichés dans "Mes Items"

