#!/bin/bash

echo "🔄 Redémarrage du backend MainTrack Pro..."
echo ""

# Arrêter le backend s'il tourne
echo "🛑 Arrêt du backend en cours..."
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "maintenance.*jar" 2>/dev/null
sleep 2

# Nettoyer et compiler
echo "🧹 Nettoyage et compilation..."
cd /home/inno/projet-de-suivi-de-maintenance/backend
mvn clean compile -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Erreur de compilation!"
    exit 1
fi

echo "✅ Compilation réussie!"
echo ""
echo "🚀 Démarrage du backend..."
echo "📝 Les logs seront affichés ci-dessous..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Démarrer le backend
mvn spring-boot:run
