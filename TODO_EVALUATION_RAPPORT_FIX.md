# TODO - Correction du Rapport d'Évaluation Trimestrielle

## Objectif
Corriger trois problèmes dans le fichier report_evaluation.html:
1. Ajouter les bordures des deux côtés (gauche et droit)
2. Aligner les trois signatures horizontalement sur la même ligne
3. Centrer tout le contenu du rapport

## Plan d'implémentation

### Étape 1: Modifier les bordures de la page
- Ajouter `border-left` et `border-right` à la classe `.page`
- Garder une apparence professionnelle avec une bordure fine (1px solid)

### Étape 2: Aligner les signatures horizontalement
- Utiliser `justify-content: space-between` avec une distribution égale
- Réduire la largeur des éléments de signature pour un meilleur espacement
- Utiliser `flex: 1` avec `max-width` pour un alignement précis

### Étape 3: Centrer le contenu
- Ajouter un `margin: 0 auto` au conteneur principal
- S'assurer que tous les éléments de contenu sont correctement centrés

## Fichiers à modifier
- `/home/inno/projet-de-suivi-de-maintenance/backend/src/main/resources/templates/report_evaluation.html`

## Statut
- [x] Ajouter bordures gauche et droite
- [x] Aligner signatures horizontalement
- [x] Centrer le contenu du rapport (déjà implémenté avec margin: 0 auto)

