# Configuration de l'inscription automatique des prestataires

## Problème résolu
Le bouton "S'inscrire" sur la page d'accueil ne fonctionnait pas correctement. Maintenant, tous les nouveaux utilisateurs qui s'inscrivent via Keycloak sont automatiquement créés en tant que PRESTATAIRE dans la base de données.

## Modifications apportées

### 1. Backend - AuthController.java
Ajout d'un endpoint `/api/auth/sync-user` qui :
- Vérifie si l'utilisateur existe déjà dans la base de données
- Crée automatiquement un compte PRESTATAIRE si l'utilisateur est nouveau
- Initialise les champs avec des valeurs par défaut

### 2. Frontend - auth.service.ts
Modification de la méthode `updateUserFromToken()` pour :
- Appeler automatiquement l'endpoint de synchronisation après chaque connexion
- Créer le compte prestataire en base de données si nécessaire
- Récupérer les informations complètes du prestataire

### 3. Configuration Keycloak requise

Pour que tous les nouveaux utilisateurs reçoivent automatiquement le rôle PRESTATAIRE dans Keycloak :

#### Étape 1 : Créer le rôle PRESTATAIRE
1. Connectez-vous à la console d'administration Keycloak : http://localhost:8080
2. Sélectionnez le realm "Maintenance-DGSI"
3. Allez dans "Realm roles"
4. Cliquez sur "Create role"
5. Nom : `PRESTATAIRE`
6. Description : `Rôle pour les prestataires de maintenance`
7. Cliquez sur "Save"

#### Étape 2 : Configurer le rôle par défaut
1. Dans "Realm roles", cliquez sur "Default roles"
2. Cliquez sur "Add roles"
3. Sélectionnez `PRESTATAIRE` dans la liste
4. Cliquez sur "Add"

Maintenant, tous les nouveaux utilisateurs qui s'inscrivent recevront automatiquement le rôle PRESTATAIRE.

#### Étape 3 : Vérifier la configuration du client
1. Allez dans "Clients" et sélectionnez "maintenance-app"
2. Vérifiez que "Client authentication" est désactivé (client public)
3. Dans "Valid redirect URIs", assurez-vous d'avoir :
   - `http://localhost:4200/*`
   - `http://localhost:4200/login`
4. Dans "Web origins", ajoutez :
   - `http://localhost:4200`
5. Cliquez sur "Save"

## Flux d'inscription

1. L'utilisateur clique sur "S'inscrire" sur la page d'accueil
2. Il est redirigé vers la page d'inscription Keycloak
3. Après inscription, Keycloak lui attribue automatiquement le rôle PRESTATAIRE
4. L'utilisateur est redirigé vers l'application
5. Le frontend appelle automatiquement `/api/auth/sync-user`
6. Le backend crée un compte PRESTATAIRE dans la base de données
7. L'utilisateur peut maintenant accéder à son tableau de bord prestataire

## Comptes existants

- **Admin** : admin@gmail.com (rôle ADMINISTRATEUR)
- **Agent DGSI** : agent@gmail.com (rôle AGENT_DGSI)
- **Nouveaux prestataires** : Créés automatiquement lors de l'inscription

## Test de l'inscription

1. Démarrez Keycloak : `cd keycloak-23.0.7/bin && ./kc.sh start-dev`
2. Démarrez le backend : `cd backend && mvn spring-boot:run`
3. Démarrez le frontend : `cd frontend && npm start`
4. Ouvrez http://localhost:4200
5. Cliquez sur "S'inscrire"
6. Remplissez le formulaire d'inscription Keycloak
7. Après inscription, vous serez automatiquement connecté en tant que PRESTATAIRE

## Vérification

Pour vérifier qu'un utilisateur a été créé en tant que prestataire :

```bash
# Vérifier dans la base de données H2
# Ouvrez http://localhost:8085/h2-console
# JDBC URL: jdbc:h2:./data/maintenance-db
# Username: sa
# Password: (vide)

# Exécutez cette requête :
SELECT * FROM users WHERE email = 'votre-email@example.com';
```

## Dépannage

### Le bouton "S'inscrire" ne redirige pas
- Vérifiez que Keycloak est démarré sur http://localhost:8080
- Vérifiez la configuration du client dans Keycloak
- Vérifiez les logs du navigateur (F12 > Console)

### L'utilisateur n'est pas créé en base de données
- Vérifiez les logs du backend
- Vérifiez que l'endpoint `/api/auth/sync-user` est accessible
- Vérifiez que le token JWT contient l'email de l'utilisateur

### L'utilisateur n'a pas le rôle PRESTATAIRE
- Vérifiez que le rôle PRESTATAIRE est dans les "Default roles" de Keycloak
- Reconnectez-vous pour obtenir un nouveau token avec le rôle
