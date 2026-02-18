#!/bin/bash

# Script pour corriger les quantités d'items après suppression de prestations
# Ce script exécute le SQL de correction sur la base de données

echo "🔧 Correction des quantités d'items après suppression de prestations"
echo "================================================================"

# Configuration de la base de données
DB_URL="jdbc:h2:file:./data/maintenance_dgsi"
DB_USER="sa"
DB_PASSWORD=""

# Vérifier si le fichier SQL existe
if [ ! -f "correct_quantities_after_deletion.sql" ]; then
    echo "❌ Fichier SQL non trouvé: correct_quantities_after_deletion.sql"
    exit 1
fi

echo "📋 Exécution du script SQL de correction..."

# Exécuter le script SQL avec H2 (ajustez selon votre base de données)
if command -v psql &> /dev/null; then
    # PostgreSQL
    echo "🐘 Utilisation de PostgreSQL..."
    psql -h localhost -U $DB_USER -d maintenance_dgsi -f correct_quantities_after_deletion.sql
elif command -v mysql &> /dev/null; then
    # MySQL
    echo "🐬 Utilisation de MySQL..."
    mysql -u $DB_USER -p$DB_PASSWORD maintenance_dgsi < correct_quantities_after_deletion.sql
elif [ -f "../data/maintenance_dgsi.mv.db" ]; then
    # H2 Database - utiliser Java pour exécuter le script
    echo "☕ Utilisation de H2 Database..."
    java -cp ~/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar org.h2.tools.RunScript \
        -url "$DB_URL" \
        -user "$DB_USER" \
        -password "$DB_PASSWORD" \
        -script correct_quantities_after_deletion.sql \
        -showResults
else
    echo "⚠️ Aucun client de base de données trouvé (PostgreSQL, MySQL, ou H2)"
    echo "💡 Veuillez exécuter manuellement le fichier correct_quantities_after_deletion.sql"
    echo "   sur votre base de données."
    exit 1
fi

echo ""
echo "✅ Correction terminée!"
echo ""
echo "📊 Vérifiez les logs ci-dessus pour voir les quantités corrigées."
echo "🔍 Les items des prestations supprimées ont été restaurés dans les contrats."
