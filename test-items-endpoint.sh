#!/bin/bash

echo "🔍 Test de l'endpoint items by prestataire"
echo ""

PRESTATAIRE_ID="6e80c5a0-b7b8-4151-8f63-4be4bf94b816"
API_URL="http://localhost:8085/api/items/by-prestataire/$PRESTATAIRE_ID"

echo "📍 URL: $API_URL"
echo ""

# Test sans authentification (pour voir l'erreur)
echo "1️⃣ Test sans authentification:"
curl -s -w "\nHTTP Status: %{http_code}\n" "$API_URL" | head -20
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Si vous avez un token, décommentez et utilisez:
# echo "2️⃣ Test avec authentification:"
# TOKEN="votre_token_ici"
# curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL"

echo "💡 Pour tester avec authentification:"
echo "   1. Connectez-vous sur http://localhost:4200"
echo "   2. Ouvrez la console (F12)"
echo "   3. Copiez le token depuis localStorage"
echo "   4. Exécutez: curl -H 'Authorization: Bearer TOKEN' $API_URL"
