# 🚨 SOLUTION RAPIDE - Pas de notifications visibles

## Problème
Vous avez des prestations en attente mais aucune notification n'apparaît pour l'admin.

## Solution en 3 étapes

### Étape 1: Vérifier que vous êtes connecté avec le bon email

L'admin doit être connecté avec l'email qui est dans la base de données.

```sql
-- Vérifier votre email admin
SELECT id, nom, email, role FROM users WHERE role = 'ADMINISTRATEUR';
```

**Important**: Connectez-vous avec cet email exact dans le frontend.

### Étape 2: Envoyer les notifications pour les prestations existantes

```bash
# Redémarrer le backend d'abord
cd backend
./mvnw spring-boot:run

# Dans un autre terminal, exécuter:
./backend/notify-pending.sh
```

OU directement avec curl:
```bash
curl -X POST http://localhost:8080/api/notifications/notify-pending-prestations
```

### Étape 3: Vérifier que les notifications sont créées

```sql
-- Vérifier les notifications
SELECT id, destinataire, titre, lu, date_creation 
FROM notifications 
ORDER BY date_creation DESC 
LIMIT 10;
```

## Vérifications supplémentaires

### A. Vérifier la connexion SSE dans le navigateur

1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet "Network" ou "Réseau"
3. Filtrer par "EventSource" ou "stream"
4. Vous devriez voir une connexion à `/api/notifications/stream/votre-email`

### B. Vérifier les logs backend

```bash
tail -f backend/backend.log | grep "notification\|SSE"
```

Vous devriez voir:
```
📧 Nombre d'administrateurs trouvés: X
✅ Notifications fiche soumise envoyées à X administrateurs
SSE connection opened
```

### C. Forcer le rechargement des notifications

Dans la console du navigateur:
```javascript
// Vérifier si le service de notification est connecté
localStorage.clear();
location.reload();
```

## Causes communes

### ❌ Email différent
**Problème**: Vous êtes connecté avec un email différent de celui dans la base.
**Solution**: Vérifiez l'email dans la base et reconnectez-vous avec le bon email.

### ❌ SSE non connecté
**Problème**: La connexion SSE ne s'établit pas.
**Solution**: Vérifiez la console du navigateur pour les erreurs de connexion.

### ❌ Notifications pas créées
**Problème**: Les notifications n'ont jamais été créées pour les prestations existantes.
**Solution**: Exécutez `./backend/notify-pending.sh`

### ❌ Backend pas redémarré
**Problème**: Les modifications du code ne sont pas appliquées.
**Solution**: Redémarrez le backend.

## Test rapide

```bash
# 1. Tester l'endpoint de notification
curl -X POST http://localhost:8080/api/notifications/test-admin-notification

# 2. Vérifier dans la base
# SELECT * FROM notifications ORDER BY date_creation DESC LIMIT 1;

# 3. Rafraîchir la page admin et vérifier la cloche
```

## Si ça ne fonctionne toujours pas

1. **Vérifier l'email de connexion**:
   - Ouvrez la console du navigateur
   - Tapez: `localStorage.getItem('currentUser')`
   - Vérifiez que l'email correspond à celui de la base

2. **Vérifier la connexion SSE**:
   - Console navigateur → Network → EventSource
   - Doit montrer une connexion active

3. **Vérifier les logs backend**:
   ```bash
   grep "SSE\|notification" backend/backend.log | tail -50
   ```

4. **Forcer la création de notifications**:
   ```bash
   curl -X POST http://localhost:8080/api/notifications/notify-pending-prestations
   ```

## Commande tout-en-un

```bash
# Redémarrer backend + envoyer notifications + vérifier
cd backend && \
./mvnw spring-boot:run & \
sleep 30 && \
curl -X POST http://localhost:8080/api/notifications/notify-pending-prestations && \
echo "✅ Notifications envoyées! Rafraîchissez la page admin."
```

---

**Note**: Après avoir exécuté ces étapes, rafraîchissez la page admin (F5) et vérifiez la cloche de notifications.
