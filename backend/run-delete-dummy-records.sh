#!/bin/bash
# Script to delete dummy/fictitious records from the database
# This script should be run with the backend stopped to avoid conflicts

echo "=============================================="
echo "🗑️  Deleting Dummy Records from Database"
echo "=============================================="
echo ""

# Check if H2 database file exists
DB_FILE="./data/maintenance_db.mv.db"
H2_URL="jdbc:h2:./data/maintenance_db"

if [ ! -f "$DB_FILE" ]; then
    echo "⚠️  Database file not found at: $DB_FILE"
    echo "Attempting to use alternative paths..."
    
    # Try alternative paths
    if [ -f "./backend/data/maintenance_db.mv.db" ]; then
        DB_FILE="./backend/data/maintenance_db.mv.db"
        H2_URL="jdbc:h2:./backend/data/maintenance_db"
        echo "✅ Found database at: $DB_FILE"
    else
        echo "❌ Database file not found!"
        echo "Please ensure the backend is running and the database exists."
        exit 1
    fi
fi

echo "📁 Using database: $DB_FILE"
echo ""

# Check if Java is available for H2 if running standalone
if command -v java &> /dev/null; then
    echo "🔧 Java available - can run H2 database tool if needed"
else
    echo "⚠️ Java not found directly - the script will use the running backend"
fi

echo ""
echo "📋 Options:"
echo "   1) Delete dummy records (preview first - safe)"
echo "   2) Delete dummy records (execute - irreversible)"
echo "   3) Delete ALL fiches_prestation records"
echo "   4) Delete ALL prestations records"
echo "   5) Exit"
echo ""

read -p "Choose an option (1-5): " option

case $option in
    1)
        echo ""
        echo "🔍 Previewing dummy records to be deleted..."
        echo "Running preview query..."
        echo ""
        
        # For H2 with the backend running, use curl to call the dev endpoint
        if curl -s "http://localhost:8085/api/fiches-prestation/dev" > /dev/null 2>&1; then
            echo "✅ Backend is running at localhost:8085"
            echo "📊 Use the API endpoints to preview/delete records"
            echo ""
            echo "Available endpoints for cleanup:"
            echo "   GET /api/fiches-prestation/dev        - View all fiches"
            echo "   GET /api/prestations/dev              - View all prestations"
        else
            echo "⚠️  Backend is not running at localhost:8085"
            echo "Please start the backend first or run the SQL script directly."
        fi
        ;;
        
    2)
        echo ""
        echo "🗑️  WARNING: This will delete dummy records!"
        echo "This action cannot be undone. Are you sure?"
        echo ""
        read -p "Type 'YES' to confirm: " confirm
        
        if [ "$confirm" = "YES" ]; then
            echo ""
            echo "▶️  Executing cleanup..."
            
            # Use H2 database tool if available
            if command -v java &> /dev/null; then
                java -cp "$H2_DRIVER:./target/classes" org.h2.tools.Shell \
                    -url "$H2_URL" \
                    -sql "RUNSCRIPT FROM './delete_dummy_records.sql'"
            else
                echo "📝 Please run the SQL script manually:"
                echo "   ./delete_dummy_records.sql"
                echo ""
                echo "Or start the backend and use the dev endpoints."
            fi
        else
            echo "❌ Cleanup cancelled."
        fi
        ;;
        
    3)
        echo ""
        echo "🗑️  WARNING: Deleting ALL fiches_prestation records!"
        echo "This will remove ALL fiches from the database."
        echo ""
        read -p "Type 'DELETE ALL' to confirm: " confirm
        
        if [ "$confirm" = "DELETE ALL" ]; then
            echo ""
            echo "▶️  Deleting all fiches_prestation records..."
            
            if curl -s "http://localhost:8085" > /dev/null 2>&1; then
                # Call the delete endpoint if available
                echo "📡 Use the API to delete all fiches"
                echo "   DELETE /api/fiches-prestation/{id} - Delete single fiche"
            else
                # Run the existing delete script
                java -cp ".:./target/classes" org.h2.tools.Shell \
                    -url "$H2_URL" \
                    -sql "DELETE FROM fiches_prestation; ALTER TABLE fiches_prestation ALTER COLUMN id RESTART WITH 1;"
            fi
        else
            echo "❌ Deletion cancelled."
        fi
        ;;
        
    4)
        echo ""
        echo "🗑️  WARNING: Deleting ALL prestations records!"
        echo "This will remove ALL prestations from the database."
        echo ""
        read -p "Type 'DELETE ALL' to confirm: " confirm
        
        if [ "$confirm" = "DELETE ALL" ]; then
            echo ""
            echo "▶️  Deleting all prestations records..."
            
            java -cp ".:./target/classes" org.h2.tools.Shell \
                -url "$H2_URL" \
                -sql "DELETE FROM prestations; ALTER TABLE prestations ALTER COLUMN id RESTART WITH 1;"
        else
            echo "❌ Deletion cancelled."
        fi
        ;;
        
    5)
        echo "👋 Exiting..."
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option!"
        exit 1
        ;;
esac

echo ""
echo "✅ Script completed."

