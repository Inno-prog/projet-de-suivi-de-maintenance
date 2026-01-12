# Guide de Test Rapide - Correction Items Prestataire

## 🚀 Démarrage

### Option 1: Script automatique
```bash
cd /home/inno/projet-de-suivi-de-maintenance
./restart-backend.sh
```

### Option 2: Manuel
```bash
cd /home/inno/projet-de-suivi-de-maintenance/backend
mvn clean spring-boot:run
```

## ✅ Tests à effectuer

### 1. Test Backend Direct
Ouvrir un navigateur ou utiliser curl:

```bash
# Remplacer {TOKEN} par votre token JWT
# Remplacer {PRESTATAIRE_ID} par l'ID du prestataire

curl -H "Authorization: Bearer {TOKEN}" \
     http://localhost:8085/api/items/by-prestataire/{PRESTATAIRE_ID}
```

**Résultat attendu**: 
- Code HTTP 200
- Liste d'items JSON (peut être vide si pas d'items)
- Pas d'erreur 500

### 2. Test Frontend

1. **Démarrer le frontend** (si pas déjà démarré):
   ```bash
   cd /home/inno/projet-de-suivi-de-maintenance/frontend
   npm start
   ```

2. **Se connecter en tant que prestataire**:
   - Aller sur http://localhost:4200
   - Se connecter avec un compte prestataire

3. **Naviguer vers "Mes Items"**:
   - Cliquer sur le menu "Mes Items"
   - Vérifier que la page se charge sans erreur

4. **Vérifier les résultats**:
   - ✅ Pas d'erreur 500 dans la console du navigateur (F12)
   - ✅ Les items s'affichent (si le prestataire a des contrats avec items)
   - ✅ Message "Aucun item trouvé" si pas d'items (au lieu d'une erreur)
   - ✅ Les statistiques s'affichent correctement

### 3. Vérifier les logs Backend

Dans le terminal où tourne le backend, chercher:

```
🔍 Getting items for prestataire: {ID}
📄 Found X contracts for prestataire {ID}
🏷️ Found X unique lots: [...]
📦 Lot 'lotX' has X items
📊 Total unique items for prestataire: X
```

**Pas d'erreur comme**:
- ❌ LazyInitializationException
- ❌ NullPointerException
- ❌ Could not initialize proxy

## 🐛 Dépannage

### Erreur persiste?

1. **Vérifier la base de données**:
   ```sql
   -- Vérifier les contrats du prestataire
   SELECT * FROM contrats WHERE prestataire_id = '{ID}';
   
   -- Vérifier les items des lots
   SELECT * FROM items WHERE lot IN (
     SELECT lot_name FROM contrats WHERE prestataire_id = '{ID}'
   );
   ```

2. **Vérifier les logs détaillés**:
   - Activer le mode DEBUG dans `application.properties`:
   ```properties
   logging.level.com.dgsi.maintenance=DEBUG
   ```

3. **Tester avec un autre prestataire**:
   - Essayer avec un prestataire différent
   - Vérifier si le problème est spécifique à un prestataire

### Erreur de compilation?

```bash
cd /home/inno/projet-de-suivi-de-maintenance/backend
mvn clean install -DskipTests
```

### Frontend ne se connecte pas au backend?

Vérifier dans `frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api'
};
```

## 📊 Scénarios de test

| Scénario | Résultat attendu |
|----------|------------------|
| Prestataire avec 2 contrats et 10 items | Affiche 10 items |
| Prestataire avec 1 contrat sans items | Message "Aucun item trouvé" |
| Prestataire sans contrats | Message "Aucun item trouvé" |
| Utilisateur non connecté | Erreur "Utilisateur non connecté" |
| Token expiré | Redirection vers login |

## 📝 Checklist finale

- [ ] Backend démarre sans erreur
- [ ] Endpoint `/api/items/by-prestataire/{id}` retourne 200
- [ ] Frontend affiche "Mes Items" sans erreur 500
- [ ] Les items s'affichent correctement
- [ ] Les filtres fonctionnent
- [ ] Le bouton "Actualiser" fonctionne
- [ ] Les statistiques sont correctes
- [ ] Pas d'erreur dans les logs backend
- [ ] Pas d'erreur dans la console frontend

## 🎉 Succès!

Si tous les tests passent, le problème est résolu! Les prestataires peuvent maintenant voir leurs items sans erreur 500.
