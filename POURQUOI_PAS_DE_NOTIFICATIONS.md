# 🔔 POURQUOI JE NE VOIS PAS LES NOTIFICATIONS ?

## Vérifications à faire MAINTENANT

### ✅ Étape 1: Vérifier votre email de connexion

1. Ouvrez la console du navigateur (F12)
2. Tapez: `localStorage.getItem('currentUser')`
3. Notez l'email affiché

### ✅ Étape 2: Vérifier l'email dans la base de données

Exécutez cette requête SQL:
```sql
SELECT id, nom, email, role FROM users WHERE role = 'ADMINISTRATEUR';
```

**IMPORTANT**: L'email dans la base DOIT correspondre EXACTEMENT à l'email de connexion.

### ✅ Étape 3: Vérifier la connexion SSE

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet "Network" ou "Réseau"
3. Filtrez par "EventSource" ou cherchez "stream"
4. Vous devriez voir: `/api/notifications/stream/votre-email`
5. Le statut doit être "200" ou "pending"

### ✅ Étape 4: Vérifier les notifications dans la base

```sql
SELECT * FROM notifications 
WHERE destinataire = 'votre-email@example.com'
ORDER BY date_creation DESC 
LIMIT 10;
```

Si aucune notification n'existe, passez à l'étape 5.

### ✅ Étape 5: Créer les notifications pour les prestations existantes

**Option A - Via la console du navigateur:**
```javascript
fetch('http://localhost:8080/api/notifications/test-admin-notification', {
  method: 'POST'
}).then(r => r.text()).then(console.log);
```

**Option B - Via curl:**
```bash
curl -X POST http://localhost:8080/api/notifications/test-admin-notification
```

### ✅ Étape 6: Rafraîchir la page

Appuyez sur F5 pour rafraîchir la page admin.

## 🚨 Problèmes courants

### Problème 1: Email différent
**Symptôme**: Vous êtes connecté avec un email différent de celui dans la base.
**Solution**: 
1. Déconnectez-vous
2. Reconnectez-vous avec l'email exact de la base de données

### Problème 2: SSE non connecté
**Symptôme**: Pas de connexion "stream" dans l'onglet Network.
**Solution**:
1. Vérifiez que le service de notifications est bien importé dans le layout
2. Rafraîchissez la page (F5)
3. Vérifiez les erreurs dans la console

### Problème 3: Notifications pas créées
**Symptôme**: Aucune notification dans la table `notifications`.
**Solution**: Exécutez l'étape 5 ci-dessus pour créer les notifications.

### Problème 4: Backend pas à jour
**Symptôme**: Les endpoints de notification ne fonctionnent pas.
**Solution**:
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

## 📋 Checklist complète

- [ ] Backend démarré et accessible
- [ ] Au moins 1 admin existe dans la table `users`
- [ ] Email de connexion = email dans la base
- [ ] SSE connecté (visible dans Network)
- [ ] Notifications créées dans la base
- [ ] Page rafraîchie (F5)

## 🎯 Test final

1. Ouvrez la console du navigateur
2. Exécutez:
```javascript
fetch('http://localhost:8080/api/notifications/test-admin-notification', {
  method: 'POST'
}).then(r => r.text()).then(data => {
  console.log('Réponse:', data);
  // Attendre 2 secondes puis rafraîchir
  setTimeout(() => location.reload(), 2000);
});
```

3. Après le rafraîchissement, vérifiez la cloche 🔔

## 💡 Si ça ne fonctionne toujours pas

Vérifiez les logs du backend:
```bash
tail -f backend/backend.log | grep -i "notification\|sse"
```

Vous devriez voir:
```
📧 Envoi notification fiche soumise
📧 Nombre d'administrateurs trouvés: X
SSE connection opened
```

---

**Besoin d'aide ?** Consultez `SOLUTION_RAPIDE_NOTIFICATIONS.md`
