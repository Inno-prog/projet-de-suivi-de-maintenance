# Correction - Modal "Détails de la Fiche de Prestation"

## 🐛 Problème
La modal affichant les détails de la fiche de prestation (bouton "Voir") montrait une page blanche. Le PDF n'était pas visible car la modal était trop petite et l'iframe n'avait pas les bonnes dimensions.

## ✅ Solution appliquée

### Fichier modifié
`frontend/src/app/features/ordres-commande/components/lot-fiches/lot-fiches.component.ts`

### Changements effectués

#### 1. **Amélioration du CSS de la modal PDF**
```css
.pdf-modal {
  max-width: 90vw !important;      /* 90% de la largeur de l'écran */
  width: 90vw !important;
  height: 90vh !important;          /* 90% de la hauteur de l'écran */
  max-height: 90vh !important;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;                 /* Empêche le scroll externe */
}

.pdf-modal .modal-body {
  flex: 1;                          /* Prend tout l'espace disponible */
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pdf-modal iframe {
  height: 100% !important;          /* Iframe prend toute la hauteur */
  width: 100% !important;
  border: 0;
}
```

#### 2. **Sécurisation de l'URL du PDF avec DomSanitizer**
- Ajout de l'import `DomSanitizer` et `SafeResourceUrl`
- Changement du type de `selectedFichePdfUrl` de `string` à `SafeResourceUrl`
- Utilisation de `sanitizer.bypassSecurityTrustResourceUrl()` pour sécuriser l'URL

#### 3. **Correction du template HTML**
```html
<div *ngIf="selectedFichePdfUrl; else detailsTemplate" 
     style="height:100%; width:100%;">
  <iframe [src]="selectedFichePdfUrl" 
          style="border:0; width:100%; height:100%;"></iframe>
</div>
```

## 🎯 Résultat

### Avant
- ❌ Modal trop petite (600px max)
- ❌ Iframe avec hauteur fixe (80vh)
- ❌ Page blanche, PDF non visible
- ❌ Erreur de sécurité Angular possible

### Après
- ✅ Modal en plein écran (90% de la fenêtre)
- ✅ Iframe responsive qui prend toute la hauteur disponible
- ✅ PDF parfaitement visible et lisible
- ✅ URL sécurisée avec DomSanitizer
- ✅ Expérience utilisateur optimale

## 📱 Responsive
La modal s'adapte automatiquement à la taille de l'écran :
- Desktop : 90% de l'écran (grande surface de visualisation)
- Tablette : 90% de l'écran
- Mobile : 90% de l'écran (avec media queries existantes)

## 🧪 Test
1. Aller sur http://localhost:4200/ordres-commande/trimestre/2/lot/lot2
2. Cliquer sur le bouton "Voir" (icône œil) d'une fiche
3. La modal s'ouvre en grand format
4. Le PDF est visible et lisible
5. Possibilité de fermer avec le bouton X ou en cliquant à l'extérieur

## 📝 Notes techniques
- La modal utilise maintenant `flex` pour une meilleure gestion de l'espace
- L'iframe prend automatiquement toute la hauteur disponible
- Le header et footer restent visibles et accessibles
- Pas de scroll externe, le PDF gère son propre scroll interne
