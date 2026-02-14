#!/bin/bash
# Test if duplicate prevention is working

BASE_URL="http://localhost:8085/api"

# Try with a specific prestataire (IT Solutions Burkina)
echo "Testing items for IT Solutions Burkina"
echo "===================================="

# First, get the prestataire ID
PRESTATAIRE_ID="d78d2975-5fa7-4b36-b113-4ddf3a251211"

# Make request to get items by prestataire
curl -X GET "$BASE_URL/items/by-prestataire/$PRESTATAIRE_ID" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "Check the response for duplicate items!"
