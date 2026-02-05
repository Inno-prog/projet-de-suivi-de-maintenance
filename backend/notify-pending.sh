#!/bin/bash

# Script pour envoyer des notifications pour les prestations en attente
# Utilise l'endpoint nouvellement créé

echo "🔔 Envoi de notifications pour les prestations en attente..."
echo ""

# URL du backend
BACKEND_URL="http://localhost:8080"

# Appeler l'endpoint pour notifier les prestations en attente
echo "📤 Appel de l'endpoint /api/notifications/notify-pending-prestations..."
curl -X POST "${BACKEND_URL}/api/notifications/notify-pending-prestations" \
  -H "Content-Type: application/json" \
  -w "\n\nCode HTTP: %{http_code}\n"

echo ""
echo "✅ Terminé! Vérifiez les logs du backend pour plus de détails."
echo ""
echo "Pour vérifier les notifications créées, exécutez:"
echo "  SELECT * FROM notifications ORDER BY date_creation DESC LIMIT 10;"
