# Guide de test - Inscription automatique des prestataires

## 🎯 Objectif
Permettre à tous les nouveaux utilisateurs de s'inscrire via le bouton "S'inscrire" et être automatiquement créés en tant que PRESTATAIRE.

## 📋 Prérequis

1. **Keycloak** doit être démarré sur http://localhost:8080
2. **Backend** doit être démarré sur http://localhost:8085
3. **Frontend** doit être démarré sur http://localhost:4200

## 🚀 Démarrage rapide

### 1. Démarrer Keycloak
```bash
cd keycloak-23.0.7/bin
./kc.sh start-dev
```

### 2. Configurer Keycloak (première fois seulement)

#### a. Créer le rôle PRESTATAIRE
1. Ouvrez http://localhost:8080
2. Connectez-vous avec admin/admin
3. Sélectionnez le realm "Maintenance-DGSI"
4. Allez dans "Realm roles" > "Create role"
5. Nom : `PRESTATAIRE`
6. Cliquez sur "Save"

#### b. Définir PRESTATAIRE comme rôle par défaut
1. Dans "Realm roles", cliquez sur "Default roles"
2. Cliquez sur "Add roles"
3. Sélectionnez `PRESTATAIRE`
4. Cliquez sur "Add"

✅ Maintenant tous les nouveaux utilisateurs auront automatiquement le rôle PRESTATAIRE !

### 3. Démarrer le backend
```bash
cd backend
mvn spring-boot:run
```

### 4. Démarrer le frontend
```bash
cd frontend
npm start
```

## 🧪 Test de l'inscription

### Scénario 1 : Nouvel utilisateur

1. Ouvrez http://localhost:4200
2. Cliquez sur le bouton **"S'inscrire"** (en haut à droite)
3. Vous serez redirigé vers la page d'inscription Keycloak
4. Remplissez le formulaire :
   - Email : test-prestataire@example.com
   - Prénom : Test
   - Nom : Prestataire
   - Mot de passe : Test123!
   - Confirmation : Test123!
5. Cliquez sur "Register"
6. Vous serez automatiquement connecté et redirigé vers le tableau de bord prestataire

### Scénario 2 : Vérification en base de données

1. Ouvrez http://localhost:8085/h2-console
2. Configuration :
   - JDBC URL : `jdbc:h2:./data/maintenance-db`
   - Username : `sa`
   - Password : (laisser vide)
3. Cliquez sur "Connect"
4. Exécutez cette requête :
```sql
SELECT id, email, nom, dtype as role, structure, direction, qualification
FROM users 
WHERE email = 'test-prestataire@example.com';
```
5. Vous devriez voir votre utilisateur avec `dtype = 'Prestataire'`

## 🔍 Vérifications

### Vérifier que le bouton fonctionne
- Le bouton "S'inscrire" doit rediriger vers Keycloak
- URL attendue : `http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/registrations?...`

### Vérifier la création en base de données
```sql
-- Compter les prestataires
SELECT COUNT(*) FROM users WHERE dtype = 'Prestataire';

-- Lister tous les prestataires
SELECT email, nom, structure FROM users WHERE dtype = 'Prestataire';
```

### Vérifier les logs du backend
Recherchez dans les logs :
```
Synchronisation de l'utilisateur: test-prestataire@example.com
Nouvel utilisateur prestataire créé: [ID]
```

## 🎭 Comptes de test existants

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@gmail.com | admin123 | ADMINISTRATEUR |
| agent@gmail.com | agent123 | AGENT_DGSI |
| Nouveaux comptes | (votre choix) | PRESTATAIRE |

## 🐛 Dépannage

### Le bouton "S'inscrire" ne fait rien
**Cause** : Keycloak n'est pas démarré ou mal configuré

**Solution** :
1. Vérifiez que Keycloak est accessible : http://localhost:8080
2. Vérifiez les logs du navigateur (F12 > Console)
3. Vérifiez la configuration du client dans Keycloak

### L'utilisateur n'apparaît pas en base de données
**Cause** : L'endpoint de synchronisation n'est pas appelé

**Solution** :
1. Vérifiez les logs du backend
2. Vérifiez que l'endpoint `/api/auth/sync-user` est accessible
3. Reconnectez-vous pour déclencher la synchronisation

### L'utilisateur n'a pas le rôle PRESTATAIRE dans Keycloak
**Cause** : Le rôle par défaut n'est pas configuré

**Solution** :
1. Allez dans Keycloak > Realm roles > Default roles
2. Ajoutez `PRESTATAIRE` aux rôles par défaut
3. Créez un nouvel utilisateur pour tester

### Erreur "User already exists"
**Cause** : L'email est déjà utilisé

**Solution** :
1. Utilisez un autre email
2. Ou supprimez l'utilisateur existant :
```sql
DELETE FROM users WHERE email = 'votre-email@example.com';
```

## 📊 Statistiques

Pour voir les statistiques des utilisateurs :

```sql
-- Nombre d'utilisateurs par rôle
SELECT dtype as role, COUNT(*) as count 
FROM users 
GROUP BY dtype;

-- Prestataires créés aujourd'hui (si vous avez une colonne created_at)
-- SELECT COUNT(*) FROM users 
-- WHERE dtype = 'Prestataire' 
-- AND created_at > CURRENT_DATE;
```

## 🔐 Sécurité

- Les mots de passe sont gérés par Keycloak (pas stockés dans la base de données locale)
- Le champ `password` dans la table `users` contient "keycloak-managed"
- L'authentification se fait uniquement via Keycloak

## 📝 Notes importantes

1. **Tous les nouveaux utilisateurs sont des prestataires** : C'est le comportement attendu
2. **Les comptes admin et agent DGSI** : Doivent être créés manuellement dans Keycloak avec les rôles appropriés
3. **Synchronisation automatique** : Se fait à chaque connexion, pas besoin d'action manuelle
4. **Profil incomplet** : Les nouveaux prestataires doivent compléter leur profil (structure, direction, qualification)

## ✅ Checklist de validation

- [ ] Keycloak est démarré et accessible
- [ ] Le rôle PRESTATAIRE existe dans Keycloak
- [ ] PRESTATAIRE est défini comme rôle par défaut
- [ ] Le backend est démarré
- [ ] Le frontend est démarré
- [ ] Le bouton "S'inscrire" redirige vers Keycloak
- [ ] Un nouvel utilisateur peut s'inscrire
- [ ] L'utilisateur est créé en base de données avec dtype='Prestataire'
- [ ] L'utilisateur peut se connecter et accéder au tableau de bord prestataire

## 🎉 Succès !

Si tous les tests passent, l'inscription automatique des prestataires fonctionne correctement !
