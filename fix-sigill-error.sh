#!/bin/bash

# Script pour corriger définitivement l'erreur SIGILL

echo "🔧 Correction de l'erreur SIGILL..."

# 1. Nettoyer le cache Angular
echo "1. Nettoyage du cache Angular..."
cd frontend
rm -rf .angular/cache
rm -rf node_modules/.cache
rm -rf dist

# 2. Nettoyer node_modules
echo "2. Nettoyage des node_modules..."
rm -rf node_modules
rm -f package-lock.json

# 3. Vider le cache npm
echo "3. Nettoyage du cache npm..."
npm cache clean --force

# 4. Réinstaller avec des flags de compatibilité
echo "4. Réinstallation avec flags de compatibilité..."
npm install --no-optional --legacy-peer-deps

# 5. Reconstruire Angular avec optimisations désactivées
echo "5. Configuration pour éviter SIGILL..."
export NODE_OPTIONS="--max-old-space-size=4096 --no-experimental-fetch"

echo "✅ Correction terminée. Redémarrez avec: npm start"