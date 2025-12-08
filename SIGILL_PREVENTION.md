# Guide de prévention de l'erreur SIGILL

## Causes communes de SIGILL
- Incompatibilité d'architecture (ARM vs x86)
- Corruption du cache Angular/Node
- Optimisations agressives du compilateur
- Modules natifs incompatibles

## Solutions appliquées

### 1. Script de correction automatique
```bash
chmod +x fix-sigill-error.sh
./fix-sigill-error.sh
```

### 2. Configuration Angular sécurisée
- Désactivation des optimisations agressives
- Mode AOT désactivé en développement
- Chunks nommés pour debug

### 3. Variables d'environnement
```bash
export NODE_OPTIONS="--max-old-space-size=4096 --no-experimental-fetch"
```

### 4. Commandes de démarrage sécurisées
```bash
# Au lieu de ng serve
npm run start:safe

# Ou directement
ng serve --configuration=development --disable-host-check --poll=2000
```

## Prévention permanente

### Package.json - Ajouter ces scripts :
```json
{
  "scripts": {
    "start:safe": "ng serve --configuration=development --disable-host-check --poll=2000",
    "build:safe": "ng build --configuration=development",
    "clean": "rm -rf .angular/cache node_modules/.cache dist"
  }
}
```

### Utilisation recommandée :
1. `npm run clean` avant chaque session
2. `npm run start:safe` pour démarrer
3. Redémarrer le serveur toutes les 2h

## En cas d'erreur SIGILL :
1. Ctrl+C pour arrêter
2. `./fix-sigill-error.sh`
3. `npm run start:safe`