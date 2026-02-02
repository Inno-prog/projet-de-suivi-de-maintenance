# Plan: Harmoniser le design des cartes de régions avec les cartes de lots

## Objectif
Les cartes représentant les régions doivent avoir le même design que les cartes représentant les lots d'items, avec comme seule différence l'icône (maison pour les régions, layer-group pour les lots).

## Fichiers modifiés
1. ✅ `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.html`
2. ✅ `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.css`

## Changements effectués

### HTML (structures-mefp.component.html)
- ✅ Remplacer la structure de la carte de région pour utiliser le même design que lot-selection-card
- ✅ Garder l'icône maison (fa-house-chimney) comme seule différence
- ✅ Adapter l'affichage des statistiques (Villes et Structures)

### CSS (structures-mefp.component.css)
- ✅ Utiliser les mêmes classes de style que lot-selection-card
- ✅ Garder les mêmes effets de hover (translateY -8px)
- ✅ Garder la même animation d'apparition
- ✅ Supprimer les anciens styles .region-card qui ne sont plus utilisés

## Étapes d'implémentation
1. ✅ Modifier le template HTML des cartes de régions
2. ✅ Ajouter les classes CSS nécessaires
3. ✅ Supprimer les styles CSS obsolètes

## Résumé des changements
- Les cartes de régions utilisent maintenant la classe `lot-selection-card`
- L'icône est un cercle de 60x60px avec un dégradé bleu (comme les lots)
- L'icône est une maison (fa-house-chimney) au lieu de layer-group
- Le design est identique aux cartes de lots, harmonisant ainsi l'interface

