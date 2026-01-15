# 🎨 Guide Visuel - Configuration Keycloak pour l'inscription automatique

## 📋 Vue d'ensemble

Ce guide vous montre **exactement** où cliquer dans Keycloak pour configurer l'inscription automatique des prestataires.

---

## 🚀 Étape 1 : Accéder à Keycloak

### 1.1 Ouvrir Keycloak
```
URL : http://localhost:8080
```

### 1.2 Se connecter
```
Username : admin
Password : admin
```

### 1.3 Sélectionner le realm
```
En haut à gauche : Cliquez sur "master"
Sélectionnez : "Maintenance-DGSI"
```

---

## 🎭 Étape 2 : Créer le rôle PRESTATAIRE

### 2.1 Navigation
```
Menu de gauche
  ↓
Realm roles
  ↓
Cliquez sur "Create role" (bouton en haut à droite)
```

### 2.2 Remplir le formulaire
```
┌─────────────────────────────────────────┐
│ Create role                              │
├─────────────────────────────────────────┤
│                                          │
│ Role name *                              │
│ ┌─────────────────────────────────────┐ │
│ │ PRESTATAIRE                         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Description                              │
│ ┌─────────────────────────────────────┐ │
│ │ Rôle pour les prestataires de      │ │
│ │ maintenance                         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Cancel]              [Save]            │
└─────────────────────────────────────────┘
```

### 2.3 Cliquer sur "Save"
```
✅ Le rôle PRESTATAIRE est maintenant créé
```

---

## ⚙️ Étape 3 : Définir PRESTATAIRE comme rôle par défaut

### 3.1 Navigation
```
Menu de gauche
  ↓
Realm roles
  ↓
Cliquez sur l'onglet "Default roles"
```

### 3.2 Ajouter le rôle
```
┌─────────────────────────────────────────┐
│ Default roles                            │
├─────────────────────────────────────────┤
│                                          │
│ Available roles          Assigned roles │
│ ┌──────────────┐        ┌─────────────┐ │
│ │ ADMINISTRATEUR│        │ offline_access│ │
│ │ AGENT_DGSI   │        │ uma_authorization│ │
│ │ PRESTATAIRE  │◄─────  │             │ │
│ │ ...          │        │             │ │
│ └──────────────┘        └─────────────┘ │
│                                          │
│ [Add selected >]                        │
└─────────────────────────────────────────┘
```

### 3.3 Sélectionner et ajouter
```
1. Cliquez sur "PRESTATAIRE" dans la liste de gauche
2. Cliquez sur "Add selected >" (ou double-cliquez sur PRESTATAIRE)
3. PRESTATAIRE apparaît maintenant dans "Assigned roles"
```

### 3.4 Résultat attendu
```
┌─────────────────────────────────────────┐
│ Assigned roles                           │
├─────────────────────────────────────────┤
│ ✅ offline_access                        │
│ ✅ uma_authorization                     │
│ ✅ PRESTATAIRE          ← Nouveau !      │
└─────────────────────────────────────────┘
```

---

## 🔧 Étape 4 : Vérifier la configuration du client

### 4.1 Navigation
```
Menu de gauche
  ↓
Clients
  ↓
Cliquez sur "maintenance-app"
```

### 4.2 Onglet Settings
```
┌─────────────────────────────────────────┐
│ Settings                                 │
├─────────────────────────────────────────┤
│                                          │
│ Client authentication                    │
│ ○ On   ● Off  ← Doit être OFF           │
│                                          │
│ Valid redirect URIs *                    │
│ ┌─────────────────────────────────────┐ │
│ │ http://localhost:4200/*             │ │
│ │ http://localhost:4200/login         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Web origins                              │
│ ┌─────────────────────────────────────┐ │
│ │ http://localhost:4200               │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Cancel]              [Save]            │
└─────────────────────────────────────────┘
```

### 4.3 Vérifications importantes
```
✅ Client authentication : OFF (client public)
✅ Valid redirect URIs : http://localhost:4200/*
✅ Valid redirect URIs : http://localhost:4200/login
✅ Web origins : http://localhost:4200
```

---

## ✅ Étape 5 : Vérification finale

### 5.1 Vérifier le rôle
```
Menu de gauche
  ↓
Realm roles
  ↓
Vous devriez voir :
  - ADMINISTRATEUR
  - AGENT_DGSI
  - PRESTATAIRE ← Nouveau !
```

### 5.2 Vérifier les rôles par défaut
```
Menu de gauche
  ↓
Realm roles
  ↓
Onglet "Default roles"
  ↓
Dans "Assigned roles", vous devriez voir :
  - offline_access
  - uma_authorization
  - PRESTATAIRE ← Nouveau !
```

---

## 🧪 Test de la configuration

### Test 1 : Créer un utilisateur de test dans Keycloak
```
Menu de gauche
  ↓
Users
  ↓
Cliquez sur "Add user"
  ↓
Remplissez :
  - Email : test-config@example.com
  - First name : Test
  - Last name : Config
  ↓
Cliquez sur "Create"
  ↓
Allez dans l'onglet "Role mapping"
  ↓
Vous devriez voir PRESTATAIRE dans "Assigned roles" ✅
```

### Test 2 : Tester l'inscription depuis l'application
```
1. Ouvrez http://localhost:4200
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire d'inscription
4. Après inscription, vérifiez dans H2 Console :
   SELECT * FROM users WHERE dtype = 'Prestataire';
```

---

## 🎯 Résumé visuel du flux

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX D'INSCRIPTION                        │
└─────────────────────────────────────────────────────────────┘

1. Utilisateur clique sur "S'inscrire"
   │
   ↓
2. Redirection vers Keycloak
   │
   ↓
3. Formulaire d'inscription Keycloak
   ┌──────────────────────────────────┐
   │ Email    : [________________]    │
   │ Prénom   : [________________]    │
   │ Nom      : [________________]    │
   │ Password : [________________]    │
   │                                  │
   │        [Register]                │
   └──────────────────────────────────┘
   │
   ↓
4. Keycloak crée le compte
   + Attribue automatiquement le rôle PRESTATAIRE ✅
   │
   ↓
5. Redirection vers l'application avec token JWT
   │
   ↓
6. Frontend appelle /api/auth/sync-user
   │
   ↓
7. Backend crée le compte en base de données
   ┌──────────────────────────────────┐
   │ Table: users                     │
   ├──────────────────────────────────┤
   │ id    : [UUID]                   │
   │ email : test@example.com         │
   │ nom   : Test Utilisateur         │
   │ dtype : Prestataire ✅           │
   └──────────────────────────────────┘
   │
   ↓
8. Utilisateur accède au tableau de bord prestataire 🎉
```

---

## 🎨 Codes couleur dans Keycloak

```
🟢 Vert   : Configuration correcte
🟡 Jaune  : Attention requise
🔴 Rouge  : Erreur ou manquant
🔵 Bleu   : Information
```

---

## 📸 Captures d'écran attendues

### Vue 1 : Realm roles
```
┌─────────────────────────────────────────┐
│ Realm roles                              │
├─────────────────────────────────────────┤
│ Role name          Description           │
├─────────────────────────────────────────┤
│ ADMINISTRATEUR     Admin role            │
│ AGENT_DGSI         Agent role            │
│ PRESTATAIRE        Prestataire role ✅   │
│ default-roles-...  Default roles         │
│ offline_access     Offline access        │
│ uma_authorization  UMA authorization     │
└─────────────────────────────────────────┘
```

### Vue 2 : Default roles
```
┌─────────────────────────────────────────┐
│ Default roles                            │
├─────────────────────────────────────────┤
│ Assigned roles:                          │
│   • offline_access                       │
│   • uma_authorization                    │
│   • PRESTATAIRE ✅                       │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de configuration

Cochez chaque étape au fur et à mesure :

- [ ] Keycloak est accessible sur http://localhost:8080
- [ ] Je me suis connecté avec admin/admin
- [ ] J'ai sélectionné le realm "Maintenance-DGSI"
- [ ] J'ai créé le rôle "PRESTATAIRE"
- [ ] J'ai ajouté "PRESTATAIRE" aux "Default roles"
- [ ] J'ai vérifié la configuration du client "maintenance-app"
- [ ] J'ai testé avec un utilisateur de test
- [ ] L'utilisateur de test a bien le rôle PRESTATAIRE
- [ ] J'ai testé l'inscription depuis l'application
- [ ] L'utilisateur apparaît en base de données avec dtype='Prestataire'

---

## 🆘 Aide visuelle pour le dépannage

### Problème : Le rôle PRESTATAIRE n'apparaît pas
```
Solution :
  Menu de gauche → Realm roles → Create role
  Nom : PRESTATAIRE (en MAJUSCULES)
  Save
```

### Problème : Les nouveaux utilisateurs n'ont pas le rôle
```
Solution :
  Menu de gauche → Realm roles → Default roles
  Sélectionner PRESTATAIRE dans la liste de gauche
  Cliquer sur "Add selected >"
```

### Problème : Erreur de redirection
```
Solution :
  Menu de gauche → Clients → maintenance-app
  Valid redirect URIs : http://localhost:4200/*
  Web origins : http://localhost:4200
  Save
```

---

**🎉 Configuration terminée !**

Vous pouvez maintenant tester l'inscription en ouvrant http://localhost:4200 et en cliquant sur "S'inscrire".
