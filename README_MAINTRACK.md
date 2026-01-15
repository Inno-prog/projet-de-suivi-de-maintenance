# 🚀 MainTrack Pro DGSI - Système de Suivi de Maintenance

## 📋 Vue d'ensemble

MainTrack Pro DGSI est une plateforme professionnelle de suivi des prestations de maintenance informatique développée par la Direction Générale des Systèmes d'Information (DGSI) du Ministère de l'Économie, des Finances et de la Prospective du Burkina Faso.

## ✨ Fonctionnalités principales

- 🔐 **Authentification sécurisée** via Keycloak (OAuth2/OIDC)
- 👥 **Gestion multi-rôles** : Administrateur, Agent DGSI, Prestataire
- 📝 **Gestion des prestations** de maintenance
- 📊 **Suivi des ordres de commande** par trimestre
- 📈 **Tableaux de bord** personnalisés par rôle
- 🔄 **Évaluations** des prestations
- 📄 **Génération de rapports** PDF
- ✅ **Inscription automatique** des prestataires

## 🆕 Nouveauté : Inscription automatique des prestataires

### ✅ Problème résolu

Le bouton **"S'inscrire"** sur la page d'accueil fonctionne maintenant correctement. Tous les nouveaux utilisateurs qui s'inscrivent sont automatiquement créés en tant que **PRESTATAIRE**.

### 📚 Documentation complète

Pour configurer et tester l'inscription automatique, consultez :

- 📄 **[INDEX_INSCRIPTION.md](INDEX_INSCRIPTION.md)** - Index de toute la documentation
- 📄 **[SOLUTION_INSCRIPTION.md](SOLUTION_INSCRIPTION.md)** - Guide de démarrage rapide
- 🎨 **[GUIDE_VISUEL_KEYCLOAK.md](GUIDE_VISUEL_KEYCLOAK.md)** - Configuration visuelle de Keycloak
- 🧪 **[GUIDE_TEST_INSCRIPTION.md](GUIDE_TEST_INSCRIPTION.md)** - Tests et vérifications

### 🚀 Démarrage rapide

```bash
# 1. Configurer Keycloak (voir GUIDE_VISUEL_KEYCLOAK.md)

# 2. Démarrer les services
./test-inscription.sh

# 3. Tester l'inscription
# Ouvrir http://localhost:4200
# Cliquer sur "S'inscrire"
```

## 🏗️ Architecture

### Backend
- **Framework** : Spring Boot 3.x
- **Base de données** : H2 (développement), PostgreSQL (production)
- **Authentification** : Keycloak OAuth2/OIDC
- **API** : RESTful

### Frontend
- **Framework** : Angular 18
- **UI** : Angular Material + Tailwind CSS
- **Authentification** : angular-oauth2-oidc

### Authentification
- **Serveur** : Keycloak 23.0.7
- **Protocole** : OAuth2 + OpenID Connect
- **Flux** : Authorization Code + PKCE

## 🚀 Installation et démarrage

### Prérequis

- Java 17+
- Node.js 18+
- Maven 3.8+
- Keycloak 23.0.7

### 1. Démarrer Keycloak

```bash
cd keycloak-23.0.7/bin
./kc.sh start-dev
```

Keycloak sera accessible sur http://localhost:8080

### 2. Configurer Keycloak

Suivez le guide : [GUIDE_VISUEL_KEYCLOAK.md](GUIDE_VISUEL_KEYCLOAK.md)

**Étapes essentielles** :
1. Créer le rôle `PRESTATAIRE`
2. Définir `PRESTATAIRE` comme rôle par défaut
3. Configurer le client `maintenance-app`

### 3. Démarrer le Backend

```bash
cd backend
mvn spring-boot:run
```

Le backend sera accessible sur http://localhost:8085

### 4. Démarrer le Frontend

```bash
cd frontend
npm install
npm start
```

Le frontend sera accessible sur http://localhost:4200

## 👥 Comptes utilisateurs

### Comptes existants

| Email | Mot de passe | Rôle | Description |
|-------|--------------|------|-------------|
| admin@gmail.com | admin123 | ADMINISTRATEUR | Compte administrateur unique |
| agent@gmail.com | agent123 | AGENT_DGSI | Compte agent DGSI unique |

### Nouveaux comptes

Tous les nouveaux utilisateurs qui s'inscrivent via le bouton **"S'inscrire"** sont automatiquement créés en tant que **PRESTATAIRE**.

**Pour s'inscrire** :
1. Ouvrir http://localhost:4200
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire Keycloak
4. Après inscription, vous serez automatiquement connecté en tant que PRESTATAIRE

## 🎭 Rôles et permissions

### ADMINISTRATEUR
- Gestion complète des utilisateurs
- Gestion des contrats
- Gestion des ordres de commande
- Validation des prestations
- Accès à toutes les statistiques

### AGENT_DGSI
- Gestion des équipements
- Gestion des structures MEFP
- Consultation des prestations
- Accès aux statistiques

### PRESTATAIRE
- Gestion de ses propres prestations
- Consultation de ses contrats
- Soumission de fiches de prestation
- Tableau de bord personnalisé

## 📊 Fonctionnalités par module

### Gestion des prestations
- Création et suivi des prestations
- Validation par l'administrateur
- Génération de fiches de prestation PDF
- Historique complet

### Ordres de commande
- Organisation par trimestre
- Gestion des lots
- Suivi des prestations par lot
- Génération de rapports

### Évaluations
- Évaluation des prestations
- Critères personnalisables
- Rapports d'évaluation
- Historique des évaluations

### Équipements
- Inventaire des équipements
- Suivi de la maintenance
- Historique des interventions
- Affectation aux structures

## 🔧 Configuration

### Variables d'environnement

#### Backend (application.properties)
```properties
# Base de données
spring.datasource.url=jdbc:h2:./data/maintenance-db
spring.datasource.username=sa
spring.datasource.password=

# Keycloak
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/Maintenance-DGSI
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api',
  keycloakUrl: 'http://localhost:8080',
  keycloakRealm: 'Maintenance-DGSI',
  keycloakClientId: 'maintenance-app'
};
```

## 🧪 Tests

### Test automatique

```bash
./test-inscription.sh
```

Ce script vérifie :
- ✅ Keycloak est accessible
- ✅ Backend est accessible
- ✅ Frontend est accessible
- ✅ Configuration correcte

### Tests manuels

Consultez [GUIDE_TEST_INSCRIPTION.md](GUIDE_TEST_INSCRIPTION.md) pour :
- Scénarios de test complets
- Vérifications en base de données
- Dépannage détaillé

## 📝 Base de données

### Console H2

Accessible sur http://localhost:8085/h2-console

**Configuration** :
- JDBC URL : `jdbc:h2:./data/maintenance-db`
- Username : `sa`
- Password : (vide)

### Scripts SQL

Consultez [backend/verification_prestataires.sql](backend/verification_prestataires.sql) pour :
- Vérifier les utilisateurs
- Compter les prestataires
- Diagnostiquer les problèmes

## 🐛 Dépannage

### Le bouton "S'inscrire" ne fonctionne pas

1. Vérifiez que Keycloak est démarré : http://localhost:8080
2. Vérifiez la configuration du rôle PRESTATAIRE
3. Consultez [GUIDE_TEST_INSCRIPTION.md](GUIDE_TEST_INSCRIPTION.md) - Section "Dépannage"

### L'utilisateur n'est pas créé en base de données

1. Vérifiez les logs du backend
2. Vérifiez que l'endpoint `/api/auth/sync-user` est accessible
3. Consultez [backend/verification_prestataires.sql](backend/verification_prestataires.sql)

### Autres problèmes

Consultez la documentation complète :
- [INDEX_INSCRIPTION.md](INDEX_INSCRIPTION.md) - Index de la documentation
- [SOLUTION_INSCRIPTION.md](SOLUTION_INSCRIPTION.md) - Solutions rapides

## 📚 Documentation

### Documentation principale
- [INDEX_INSCRIPTION.md](INDEX_INSCRIPTION.md) - Index de toute la documentation
- [SOLUTION_INSCRIPTION.md](SOLUTION_INSCRIPTION.md) - Guide de démarrage rapide
- [GUIDE_VISUEL_KEYCLOAK.md](GUIDE_VISUEL_KEYCLOAK.md) - Configuration visuelle
- [GUIDE_TEST_INSCRIPTION.md](GUIDE_TEST_INSCRIPTION.md) - Tests complets

### Documentation technique
- [CONFIGURATION_INSCRIPTION_PRESTATAIRE.md](CONFIGURATION_INSCRIPTION_PRESTATAIRE.md) - Configuration détaillée
- [RESUME_MODIFICATIONS_INSCRIPTION.md](RESUME_MODIFICATIONS_INSCRIPTION.md) - Modifications techniques

### Scripts et outils
- [test-inscription.sh](test-inscription.sh) - Script de test automatique
- [backend/verification_prestataires.sql](backend/verification_prestataires.sql) - Scripts SQL

## 🔐 Sécurité

- ✅ Authentification OAuth2/OIDC via Keycloak
- ✅ Tokens JWT sécurisés
- ✅ HTTPS en production
- ✅ CORS configuré
- ✅ Protection CSRF
- ✅ Validation des données côté serveur
- ✅ Pas de stockage de mots de passe en base locale

## 🚀 Déploiement

### Environnement de développement

```bash
# Démarrer tous les services
./test-inscription.sh
```

### Environnement de production

1. Configurer Keycloak en production (HTTPS)
2. Configurer la base de données PostgreSQL
3. Mettre à jour les variables d'environnement
4. Déployer le backend
5. Déployer le frontend
6. Configurer le reverse proxy (nginx)

## 📞 Support

### Documentation
- Consultez [INDEX_INSCRIPTION.md](INDEX_INSCRIPTION.md) pour naviguer dans la documentation

### Logs
- **Backend** : Recherchez "Synchronisation de l'utilisateur"
- **Frontend** : Console du navigateur (F12)
- **Keycloak** : Logs dans keycloak-23.0.7/keycloak.log

### Base de données
- Console H2 : http://localhost:8085/h2-console
- Scripts SQL : [backend/verification_prestataires.sql](backend/verification_prestataires.sql)

## 🎉 Contributeurs

Développé par la **Direction Générale des Systèmes d'Information (DGSI)**
Ministère de l'Économie, des Finances et de la Prospective
Burkina Faso

## 📄 Licence

© 2024 DGSI - Tous droits réservés

---

**Version** : 1.0
**Date** : $(date +%Y-%m-%d)
**Statut** : ✅ Production Ready

Pour plus d'informations, consultez [INDEX_INSCRIPTION.md](INDEX_INSCRIPTION.md)
