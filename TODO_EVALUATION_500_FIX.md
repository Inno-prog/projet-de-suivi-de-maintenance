# Plan de Correction - Erreur 500 lors de l'enregistrement d'évaluation

## Problème
L'erreur 500 (Internal Server Error) se produit lors de l'enregistrement d'une évaluation trimestrielle. Causes probables :
1. La table `evaluation_trimestrielle` n'existe pas dans le schéma de base de données
2. Les colonnes du formulaire ne correspondent pas aux colonnes de la table
3. Conversion de types de données incorrecte (String vs LocalDate/Boolean)

## Fichiers à modifier

### 1. schema.sql - Ajouter la table evaluation_trimestrielle
- Créer la table complète avec toutes les colonnes nécessaires

### 2. EvaluationService.java - Améliorer la robustesse
- Gérer les valeurs null/empty pour les Boolean
- Gérer les conversions de dates
- Ajouter des logs plus détaillés

### 3. EvaluationTrimestrielleController.java - Améliorer les logs
- Logger les données reçues avant traitement
- Gestion d'erreurs plus informative

### 4. EvaluationTrimestrielle.java - Ajouter annotations
- @DateTimeFormat pour les dates
- @NotNull/@NotBlank pour la validation

## Étapes d'implémentation

- [ ] 1. Ajouter la table evaluation_trimestrielle dans schema.sql
- [ ] 2. Créer script SQL de migration complète
- [ ] 3. Mettre à jour EvaluationService.java pour gérer null
- [ ] 4. Améliorer les logs dans le controller
- [ ] 5. Tester la création d'évaluation

## Commandes de test
```bash
# Démarrer le backend
cd backend && ./mvnw spring-boot:run

# Tester l'endpoint
curl -X POST http://localhost:8080/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{
    "trimestre": "T1",
    "lot": "10",
    "prestataireNom": "Hard Home ARL",
    "dateEvaluation": "2025-01-15"
  }'
```

