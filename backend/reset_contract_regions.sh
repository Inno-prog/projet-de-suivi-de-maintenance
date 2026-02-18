#!/bin/bash
# Script pour réinitialiser la base de données et supprimer la table contrat_regions
# Ce script résout le problème de contrainte de clé étrangère lors de la suppression de contrats

# Configuration de la base de données
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="maintenance_dgsi"
DB_USER="dgsi_user"
DB_PASSWORD="1234"

# Requête SQL pour supprimer la table contrat_regions
SQL="DROP TABLE IF EXISTS contrat_regions;"

# Exécuter la requête SQL
echo "Exécution de la requête SQL pour supprimer la table contrat_regions..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -c "$SQL"

if [ $? -eq 0 ]; then
    echo "La table contrat_regions a été supprimée avec succès."
else
    echo "Erreur lors de la suppression de la table contrat_regions."
fi

# Réinitialiser le schéma de la base de données (si nécessaire)
echo "Voulez-vous réinitialiser le schéma de la base de données (supprimer toutes les tables et recréer le schéma) ? (O/n)"
read -r answer

if [ "$answer" = "O" ] || [ "$answer" = "o" ]; then
    echo "Réinitialisation du schéma de la base de données..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -f schema.sql
    if [ $? -eq 0 ]; then
        echo "Le schéma de la base de données a été réinitialisé avec succès."
    else
        echo "Erreur lors de la réinitialisation du schéma de la base de données."
    fi
else
    echo "Aucune réinitialisation du schéma n'a été effectuée."
fi
