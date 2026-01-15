#!/bin/bash

# Script de test pour l'inscription automatique des prestataires
# Usage: ./test-inscription.sh

echo "🧪 Test de l'inscription automatique des prestataires"
echo "======================================================"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour vérifier si un service est accessible
check_service() {
    local url=$1
    local name=$2
    
    if curl -s --head --request GET "$url" | grep "200\|302\|404" > /dev/null; then
        echo -e "${GREEN}✓${NC} $name est accessible"
        return 0
    else
        echo -e "${RED}✗${NC} $name n'est pas accessible"
        return 1
    fi
}

# Vérification des prérequis
echo "📋 Vérification des prérequis..."
echo ""

# Vérifier Keycloak
check_service "http://localhost:8080" "Keycloak (http://localhost:8080)"
KEYCLOAK_OK=$?

# Vérifier Backend
check_service "http://localhost:8085/api/users" "Backend (http://localhost:8085)"
BACKEND_OK=$?

# Vérifier Frontend
check_service "http://localhost:4200" "Frontend (http://localhost:4200)"
FRONTEND_OK=$?

echo ""

# Résumé des vérifications
if [ $KEYCLOAK_OK -eq 0 ] && [ $BACKEND_OK -eq 0 ] && [ $FRONTEND_OK -eq 0 ]; then
    echo -e "${GREEN}✓ Tous les services sont opérationnels${NC}"
    echo ""
    echo "🚀 Vous pouvez maintenant tester l'inscription :"
    echo ""
    echo "1. Ouvrez http://localhost:4200 dans votre navigateur"
    echo "2. Cliquez sur le bouton 'S'inscrire'"
    echo "3. Remplissez le formulaire d'inscription Keycloak"
    echo "4. Après inscription, vous serez automatiquement connecté"
    echo ""
    echo "📊 Pour vérifier la création en base de données :"
    echo "   - Ouvrez http://localhost:8085/h2-console"
    echo "   - JDBC URL: jdbc:h2:./data/maintenance-db"
    echo "   - Username: sa"
    echo "   - Password: (vide)"
    echo "   - Exécutez: SELECT * FROM users WHERE dtype = 'Prestataire';"
    echo ""
else
    echo -e "${RED}✗ Certains services ne sont pas accessibles${NC}"
    echo ""
    echo "🔧 Actions à effectuer :"
    echo ""
    
    if [ $KEYCLOAK_OK -ne 0 ]; then
        echo -e "${YELLOW}→ Démarrer Keycloak :${NC}"
        echo "   cd keycloak-23.0.7/bin"
        echo "   ./kc.sh start-dev"
        echo ""
    fi
    
    if [ $BACKEND_OK -ne 0 ]; then
        echo -e "${YELLOW}→ Démarrer le Backend :${NC}"
        echo "   cd backend"
        echo "   mvn spring-boot:run"
        echo ""
    fi
    
    if [ $FRONTEND_OK -ne 0 ]; then
        echo -e "${YELLOW}→ Démarrer le Frontend :${NC}"
        echo "   cd frontend"
        echo "   npm start"
        echo ""
    fi
fi

# Vérifier la configuration Keycloak
echo "🔍 Vérification de la configuration Keycloak..."
echo ""
echo "⚠️  Assurez-vous que :"
echo "   1. Le rôle PRESTATAIRE existe dans Keycloak"
echo "   2. PRESTATAIRE est défini comme rôle par défaut"
echo "   3. Le client 'maintenance-app' est configuré correctement"
echo ""
echo "📖 Consultez CONFIGURATION_INSCRIPTION_PRESTATAIRE.md pour plus de détails"
echo ""

# Proposer d'ouvrir les URLs
echo "🌐 Voulez-vous ouvrir les URLs dans votre navigateur ? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Ouverture des URLs..."
    
    # Détecter le système d'exploitation
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "http://localhost:4200" 2>/dev/null
        open "http://localhost:8080" 2>/dev/null
        open "http://localhost:8085/h2-console" 2>/dev/null
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "http://localhost:4200" 2>/dev/null
        xdg-open "http://localhost:8080" 2>/dev/null
        xdg-open "http://localhost:8085/h2-console" 2>/dev/null
    else
        echo "Système d'exploitation non reconnu. Ouvrez manuellement :"
        echo "  - Frontend: http://localhost:4200"
        echo "  - Keycloak: http://localhost:8080"
        echo "  - H2 Console: http://localhost:8085/h2-console"
    fi
fi

echo ""
echo "✅ Script de test terminé"
