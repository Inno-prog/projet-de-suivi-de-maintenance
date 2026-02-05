#!/bin/bash

echo "🔍 DIAGNOSTIC NOTIFICATIONS ADMIN"
echo "=================================="
echo ""

# Vérifier si le backend tourne
echo "1. Vérification du backend..."
if curl -s http://localhost:8080/api/users > /dev/null 2>&1; then
    echo "✅ Backend accessible"
else
    echo "❌ Backend non accessible - Démarrez-le avec: cd backend && ./mvnw spring-boot:run"
    exit 1
fi

echo ""
echo "2. Vérification des administrateurs dans la base..."
echo "   Exécutez cette requête SQL:"
echo "   SELECT id, nom, email, role FROM users WHERE role = 'ADMINISTRATEUR';"
echo ""

echo "3. Vérification des prestations en attente..."
echo "   Exécutez cette requête SQL:"
echo "   SELECT id, nom_prestataire, nom_prestation, statut_validation FROM prestation WHERE statut_validation = 'EN_ATTENTE';"
echo ""

echo "4. Vérification des notifications existantes..."
echo "   Exécutez cette requête SQL:"
echo "   SELECT id, destinataire, titre, lu, date_creation FROM notifications ORDER BY date_creation DESC LIMIT 5;"
echo ""

echo "=================================="
echo "SOLUTION RAPIDE"
echo "=================================="
echo ""
echo "Si vous êtes connecté en tant qu'admin, vérifiez:"
echo ""
echo "1. Votre email de connexion correspond à celui dans la base"
echo "2. La console du navigateur (F12) pour voir si SSE est connecté"
echo "3. Rafraîchissez la page (F5)"
echo ""
echo "Pour forcer l'envoi de notifications aux prestations existantes:"
echo "Ouvrez la console du navigateur et tapez:"
echo ""
echo "fetch('http://localhost:8080/api/notifications/test-admin-notification', {method: 'POST'})"
echo "  .then(r => r.text())"
echo "  .then(console.log)"
echo ""
