# Gestion des Contrats et Items - Fonctionnalités Implémentées

## Vue d'ensemble

Ce document décrit les nouvelles fonctionnalités implémentées pour la gestion des contrats et des items selon les exigences spécifiées.

## Fonctionnalités Principales

### 1. Gestion des Limites Trimestrielles des Items

#### Nouveau Champ dans l'Entité Item
- **`quantiteUtiliseeTrimestre`** : Suit la quantité utilisée pour le trimestre en cours
- Remis à zéro au début de chaque trimestre
- Permet de contrôler les limites d'utilisation

#### Vérifications Automatiques
- Avant chaque création de prestation, vérification que la limite trimestrielle n'est pas atteinte
- Blocage automatique si `quantiteUtiliseeTrimestre >= quantiteMaxTrimestre`
- Messages d'erreur explicites pour l'utilisateur

### 2. Gestion du Budget des Contrats

#### Déduction Automatique
- À chaque création de prestation, le montant est déduit du `montantRestant` du contrat
- Formule : `montantRestant = montantRestant - montantIntervention`
- Gestion multi-contrats : déduction intelligente sur plusieurs contrats si nécessaire

#### Vérifications de Budget
- Vérification du budget disponible avant création de prestation
- Blocage si budget insuffisant
- Notifications automatiques selon le niveau de budget restant

### 3. Contrôle d'Accès par Contrat

#### Vérification des Droits
- Un prestataire ne peut créer des prestations que pour les items de ses contrats
- Vérification du lot et de l'appartenance des items au contrat
- Contrôle de la validité et du statut du contrat (ACTIF uniquement)

## Services Implémentés

### ContratItemService
Service spécialisé pour la gestion des contrats et items :

```java
// Vérification de disponibilité
verifierDisponibiliteItems(prestataireContact, lot, itemQuantities)

// Mise à jour des quantités
mettreAJourQuantitesUtilisees(itemQuantities)

// Réinitialisation trimestrielle
reinitialiserCompteursTrimestriels()

// Statistiques d'utilisation
getStatistiquesUtilisationContrat(contratId)
```

### Modifications du PrestationService
- Intégration des vérifications de contrat et d'items
- Gestion automatique des déductions de budget
- Notifications intelligentes selon l'état du budget

## Endpoints API Ajoutés

### Contrats
```
GET /api/contrats/{id}/statistiques - Statistiques d'utilisation
POST /api/contrats/reinitialiser-trimestre - Réinitialisation trimestrielle
POST /api/contrats/verifier-items - Vérification disponibilité items
GET /api/contrats/budget/{prestataireContact} - Budget restant
GET /api/contrats/budget/{prestataireContact}/verifier - Vérification budget prestation
```

## Logique de Fonctionnement

### Création d'une Prestation

1. **Vérifications préalables** :
   - Validation des données de base
   - Vérification du budget contractuel disponible
   - Contrôle des limites trimestrielles des items
   - Vérification des droits du prestataire sur les items

2. **Création et mise à jour** :
   - Sauvegarde de la prestation
   - Déduction du montant du budget contractuel
   - Incrémentation des compteurs d'utilisation des items
   - Décrémentation des quantités disponibles

3. **Notifications automatiques** :
   - Budget épuisé (0%)
   - Budget critique (< 10%)
   - Budget faible (< 25%)
   - Limite trimestrielle atteinte pour un item

### Gestion Trimestrielle

#### Début de Trimestre
- Appel de `reinitialiserCompteursTrimestriels()`
- Remise à zéro de `quantiteUtiliseeTrimestre` pour tous les items
- Restauration des limites maximales

#### Suivi en Cours de Trimestre
- Décompte en temps réel des quantités utilisées
- Blocage automatique à l'atteinte des limites
- Statistiques disponibles via l'API

## Sécurité et Contrôles

### Validation des Données
- Vérification de l'existence des items
- Contrôle de cohérence des lots
- Validation des montants et quantités

### Gestion des Erreurs
- Exceptions personnalisées (`BudgetInsufficientException`)
- Messages d'erreur explicites
- Rollback automatique en cas d'échec

### Logging et Audit
- Traçabilité complète des opérations
- Logs détaillés pour le debugging
- Suivi des modifications de budget et quantités

## Base de Données

### Migration SQL
```sql
-- Nouveau champ pour le suivi trimestriel
ALTER TABLE items ADD COLUMN quantite_utilisee_trimestre INTEGER DEFAULT 0;

-- Mise à jour des données existantes
UPDATE items SET quantite_utilisee_trimestre = 0 WHERE quantite_utilisee_trimestre IS NULL;
```

### Nouvelles Requêtes
- Recherche de contrats par prestataire et lot
- Calcul des budgets restants
- Statistiques d'utilisation des items

## Utilisation

### Pour les Prestataires
1. Vérifier le budget disponible avant de créer une prestation
2. Consulter les statistiques d'utilisation des contrats
3. Recevoir des notifications automatiques sur l'état du budget

### Pour les Administrateurs
1. Initialiser les budgets des contrats
2. Réinitialiser les compteurs trimestriels
3. Consulter les statistiques globales d'utilisation
4. Gérer les contrats et leurs items associés

## Tests et Validation

### Endpoints de Test
- `/api/contrats/test-notification-budget` : Test des notifications
- Vérification des limites avec des données de test
- Validation des calculs de budget

### Scénarios de Test
1. Création de prestation avec budget suffisant
2. Tentative de création avec budget insuffisant
3. Atteinte de la limite trimestrielle d'un item
4. Réinitialisation trimestrielle
5. Notifications automatiques

## Notes Techniques

### Performance
- Utilisation de transactions pour la cohérence
- Requêtes optimisées avec FETCH JOIN
- Cache des calculs de budget fréquents

### Évolutivité
- Architecture modulaire avec services spécialisés
- Possibilité d'ajouter de nouvelles règles métier
- Extension facile pour d'autres types de contrôles

Cette implémentation assure une gestion complète et robuste des contrats et items selon les exigences spécifiées, avec un contrôle strict des budgets et des limites trimestrielles.