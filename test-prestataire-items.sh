#!/bin/bash

# Script de test pour vérifier que les prestataires peuvent voir leurs items
# Ce script teste l'endpoint sync-user et get-items

BASE_URL="http://localhost:8085/api"

echo "=========================================="
echo "Test: Synchronisation utilisateur"
echo "=========================================="

# Test 1: Vérifier que sync-user retourne une erreur 400 sans token
echo ""
echo "Test 1: sync-user sans token (doit retourner 401 ou 400)"
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/sync-user"
echo ""

# Test 2: Vérifier que sync-user fonctionne avec un token JWT valide
# Note: Remplacez TOKEN par un token JWT valide de Keycloak
echo ""
echo "Test 2: sync-user avec token JWT"
echo "Remplacez TOKEN par un token JWT valide de Keycloak"
# curl -s -X POST "$BASE_URL/auth/sync-user" \
#   -H "Authorization: Bearer TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{}'
# echo ""

# Test 3: Vérifier que l'endpoint items fonctionne
echo ""
echo "Test 3: items sans authentication (doit retourner 200 en dev ou 401)"
curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/items"
echo ""

echo ""
echo "=========================================="
echo "Logs à vérifier dans le backend"
echo "=========================================="
echo "- [sync-user] Pas d'authentification valide"
echo "- [sync-user] Email extrait de l'authentification"
echo "- [sync-user] Utilisateur synchronisé avec succès"
echo ""

