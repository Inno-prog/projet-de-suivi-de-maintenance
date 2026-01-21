# TODO - Correction SIGILL PrestationDetailComponent

## Problème Identifié
- Code d'erreur SIGILL (crash navigateur) causé par une boucle infinie
- Firefox affiche "chargement des détails" sans jamais terminer

## Causes Probables
1. **Getters appelés à chaque cycle de détection de changement** - Les méthodes comme `getItemsStringWithBreaks()` et `getProformaItems()` sont exécutées à chaque cycle Angular
2. **Sanitization récursive** - La méthode `sanitizePrestationData()` peut causer des problèmes avec des références circulaires
3. **Subscription non protégée** - Risque de fuites mémoire

## Corrections Appliquées

### 1. Simplification du composant
- ✅ Retiré la logique de sanitization complexe
- ✅ Ajout de `ChangeDetectionStrategy.OnPush` pour optimiser la détection de changement
- ✅ Propriétés calculées une seule fois au lieu de getters
- ✅ Utilisation de `ChangeDetectorRef.markForCheck()` pour contrôler le rendu

### 2. Propriétés calculées une seule fois
- `_itemsString` - Liste des items formatée
- `_lotName` - Nom du lot
- `_ciName` - Nom du Correspondant Informatique
- `_statutLabel` - Libellé du statut formaté
- `_montantLabel` - Montant formaté avec devise

### 3. Gestion correcte du dialog
- ✅ Utilisation de l'Injector pour récupérer les données du dialog
- ✅ Pas de décorateurs @Optional/@Inject sur les paramètres du constructeur

## Fichiers Modifiés
- `frontend/src/app/features/prestations/components/prestation-detail/prestation-detail.component.ts`

## Tests Après Correction
1. Ouvrir les détails d'une prestation
2. Vérifier que les détails s'affichent en moins de 5 secondes
3. Naviguer entre plusieurs prestations
4. Vérifier qu'il n'y a pas de plantage du navigateur

## Statut
- [x] Plan créé
- [x] Correction implémentée
- [ ] Testée et validée (en attente de test par l'utilisateur)

