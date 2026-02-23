#!/bin/bash

# Script pour exécuter la correction de la contrainte d'unicité sur lot_id

echo "=========================================="
echo "Correction de la contrainte lot_id unique"
echo "=========================================="

# Vérifier si psql est disponible
if ! command -v psql &> /dev/null; then
    echo "❌ psql n'est pas installé ou n'est pas dans le PATH" 
    exit 1
fi

# Paramètres de connexion (à adapter selon votre configuration)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-maintenance_dgsi}
DB_USER=${DB_USER:dgsi_user}

echo ""
echo "Connexion à la base de données :"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Exécuter le script SQL
echo "Exécution du script SQL..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f fix_lot_unique_constraint.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Script exécuté avec succès !"
    echo ""
    echo "La contrainte d'unicité sur lot_id a été supprimée."
    echo "Vous pouvez maintenant créer plusieurs contrats pour le même lot."
else
    echo ""
    echo "❌ Erreur lors de l'exécution du script SQL"
    exit 1
fi
