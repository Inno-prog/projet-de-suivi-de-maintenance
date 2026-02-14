#!/bin/bash

# Script to execute delete-all-fiches.sql on H2 database
# This script uses the H2 Console or JDBC to connect and run the SQL script

# Configuration
DB_DIR="data"
DB_NAME="maintenance_db"
SQL_SCRIPT="delete-all-fiches.sql"

echo "🔍 Checking if H2 database exists..."

if [ -f "$DB_DIR/$DB_NAME.mv.db" ]; then
    echo "✅ H2 database found: $DB_DIR/$DB_NAME.mv.db"
else
    echo "❌ H2 database not found in $DB_DIR"
    exit 1
fi

echo "📝 SQL script: $SQL_SCRIPT"
echo "========================================"
cat "$SQL_SCRIPT"
echo "========================================"

read -p "⚠️  Are you sure you want to delete all fiches prestation? This operation cannot be undone. (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Operation cancelled by user"
    exit 0
fi

echo "🔄 Executing SQL script..."

# Check if we have h2-tools available
if command -v java &>/dev/null; then
    # Try to find h2*.jar in Maven repo
    H2_JAR=$(find ~/.m2 -name "h2-*.jar" | sort -V | tail -1)
    
    if [ -z "$H2_JAR" ]; then
        echo "❌ H2 jar not found in Maven repository. Please run 'mvn clean install' first."
        exit 1
    fi

    echo "✅ Found H2 jar: $H2_JAR"
    
    # Execute SQL script directly
    java -cp "$H2_JAR" org.h2.tools.RunScript -url "jdbc:h2:file:$(pwd)/$DB_DIR/$DB_NAME" -user "sa" -password "" -script "$SQL_SCRIPT" -showResults
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully executed script: $SQL_SCRIPT"
    else
        echo "❌ Failed to execute SQL script"
        exit 1
    fi
else
    echo "❌ Java not found. Please install Java to run this script."
    exit 1
fi
