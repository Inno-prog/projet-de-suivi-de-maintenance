#!/bin/bash

# Solution alternative sans sudo pour corriger npm
echo "🔧 Correction des permissions npm sans sudo..."

# 1. Nettoyer le cache npm local
cd frontend
rm -rf ~/.npm/_cacache
rm -rf ~/.npm/_logs

# 2. Utiliser un cache npm local
npm config set cache ~/.npm-cache
npm config set prefix ~/.npm-global

# 3. Nettoyer les caches Angular
rm -rf .angular/cache
rm -rf node_modules/.cache
rm -rf dist

# 4. Réinstaller proprement
npm install --no-optional --legacy-peer-deps --cache ~/.npm-cache

echo "✅ Permissions corrigées. Utilisez: npm run start:safe"