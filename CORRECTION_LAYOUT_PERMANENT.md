# Correction du problème de disparition de la sidebar et navbar

## Problème identifié
La sidebar et la navbar disparaissaient après l'arrêt et le redémarrage des serveurs. Le problème venait de l'utilisation d'une classe CSS `.stable-layout` appliquée dynamiquement via JavaScript, qui pouvait être perdue lors des changements de route ou des rechargements de page.

## Solution appliquée

### 1. Styles CSS permanents (styles.css)
Les styles ont été modifiés pour s'appliquer directement à `.app-layout` sans dépendre de la classe `.stable-layout` :

```css
/* Layout stable permanent - sidebar et navbar toujours visibles */
.app-layout {
  display: flex !important;
  height: 100vh !important;
  position: relative !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.app-layout app-sidebar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  height: 100vh !important;
  width: 260px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: 1100 !important;
}

.app-layout .main-content {
  margin-left: 260px !important;
  width: calc(100% - 260px) !important;
}

.app-layout .navbar {
  position: fixed !important;
  top: 0 !important;
  left: 260px !important;
  width: calc(100% - 260px) !important;
  height: 64px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
```

### 2. Composant Layout (layout.component.ts)
- Suppression de la méthode `stabilizeLayout()` qui appliquait dynamiquement la classe `.stable-layout`
- Ajout de propriétés de visibilité explicites dans les styles du composant
- Le layout est maintenant stable via CSS pur, sans manipulation JavaScript

### 3. Composant Sidebar (sidebar.component.ts)
La sidebar avait déjà les bonnes propriétés CSS pour garantir sa visibilité permanente :

```css
.sidebar, .sidebar.collapsed, .sidebar.open {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
```

## Résultat
- ✅ La sidebar et la navbar restent visibles en permanence
- ✅ Le layout est stable même après redémarrage des serveurs
- ✅ Pas de manipulation JavaScript nécessaire
- ✅ Styles CSS purs et prévisibles
- ✅ Compatible avec tous les navigateurs

## Responsive
Sur mobile (< 768px), la sidebar se cache par défaut et peut être affichée via le menu hamburger :

```css
@media (max-width: 768px) {
  .app-layout app-sidebar {
    transform: translateX(-100%) !important;
  }
  .app-layout app-sidebar.mobile-open {
    transform: translateX(0) !important;
  }
}
```
