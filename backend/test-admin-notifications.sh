#!/bin/bash

# Script de test pour vérifier le système de notifications admin
# Ce script vérifie que les administrateurs existent et peuvent recevoir des notifications

echo "=========================================="
echo "Test du système de notifications admin"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8080"

echo "1. Vérification des administrateurs dans la base de données..."
echo ""

# Requête pour obtenir tous les utilisateurs (endpoint admin)
# Note: Vous devrez peut-être ajuster cette requête selon votre API
curl -s "${BACKEND_URL}/api/users?role=ADMINISTRATEUR" | jq '.' || echo -e "${RED}❌ Impossible de récupérer les administrateurs${NC}"

echo ""
echo "2. Test de création d'une notification manuelle..."
echo ""

# Créer une notification de test
TEST_NOTIFICATION='{
  "destinataire": "admin@gmail.com",
  "titre": "Test de notification",
  "message": "Ceci est un test du système de notifications",
  "type": "INFO"
}'

echo "Envoi de la notification de test..."
curl -X POST "${BACKEND_URL}/api/notifications/test" \
  -H "Content-Type: application/json" \
  -d "${TEST_NOTIFICATION}" || echo -e "${RED}❌ Échec de l'envoi${NC}"

echo ""
echo "=========================================="
echo "Vérifications à faire manuellement:"
echo "=========================================="
echo "1. Vérifiez les logs du backend pour voir si des administrateurs ont été trouvés"
echo "2. Vérifiez la table 'users' pour confirmer qu'il existe des utilisateurs avec role='ADMINISTRATEUR'"
echo "3. Vérifiez la table 'notifications' pour voir si les notifications sont créées"
echo ""
echo "Commandes SQL utiles:"
echo "  SELECT * FROM users WHERE role = 'ADMINISTRATEUR';"
echo "  SELECT * FROM notifications ORDER BY date_creation DESC LIMIT 10;"
echo ""
