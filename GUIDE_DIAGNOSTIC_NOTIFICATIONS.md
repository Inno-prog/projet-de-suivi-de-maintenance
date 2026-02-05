# Guide de diagnostic - Système de notifications admin

## Problème
Les administrateurs ne reçoivent pas de notifications lorsque les prestataires soumettent leurs prestations.

## Corrections apportées

### 1. Ajout de notification lors de la création de prestation
**Fichier**: `backend/src/main/java/com/dgsi/maintenance/service/PrestationService.java`

**Modification**: Ajout d'un appel à `envoyerNotificationFicheSoumise()` lors de la création d'une prestation avec statut non-brouillon.

```java
// Envoyer notification aux admins si la prestation est soumise (pas en brouillon)
if (savedPrestation.getStatutValidation() != null && 
    !"BROUILLON".equals(savedPrestation.getStatutValidation())) {
    notificationService.envoyerNotificationFicheSoumise(
        savedPrestation.getNomPrestataire(),
        savedPrestation.getId().toString(),
        savedPrestation.getNomPrestation()
    );
}
```

### 2. Amélioration de la robustesse du service de notification
**Fichier**: `backend/src/main/java/com/dgsi/maintenance/service/NotificationService.java`

**Modifications**:
- Ajout de logs détaillés pour le débogage
- Gestion d'erreur améliorée avec try-catch pour chaque admin
- Vérification alternative avec "ROLE_ADMINISTRATEUR" si "ADMINISTRATEUR" ne retourne rien
- Message d'erreur clair si aucun admin n'est trouvé

### 3. Ajout d'endpoints de test
**Fichier**: `backend/src/main/java/com/dgsi/maintenance/controller/NotificationController.java`

**Nouveaux endpoints**:
- `POST /api/notifications/test-admin-notification` - Teste l'envoi de notifications aux admins
- `GET /api/notifications/admin-count` - Vérifie le nombre d'admins dans le système

## Étapes de diagnostic

### Étape 1: Vérifier que des administrateurs existent dans la base de données

```sql
-- Vérifier les utilisateurs avec le rôle ADMINISTRATEUR
SELECT id, nom, email, role, contact 
FROM users 
WHERE role = 'ADMINISTRATEUR' OR role = 'ROLE_ADMINISTRATEUR';

-- Si aucun résultat, créer un administrateur de test
INSERT INTO users (id, nom, email, password, role, contact, created_at, updated_at)
VALUES (
    'admin-test-001',
    'Admin Test',
    'admin.test@dgsi.bf',
    '$2a$10$dummyHashedPassword',  -- Remplacer par un vrai hash
    'ADMINISTRATEUR',
    '+226 70 00 00 00',
    NOW(),
    NOW()
);
```

### Étape 2: Tester l'envoi de notification

```bash
# Tester l'endpoint de notification
curl -X POST http://localhost:8080/api/notifications/test-admin-notification

# Vérifier les logs du backend
tail -f backend/backend.log | grep "notification"
```

### Étape 3: Vérifier les notifications créées

```sql
-- Vérifier les notifications récentes
SELECT id, destinataire, titre, message, type, lu, date_creation
FROM notifications
ORDER BY date_creation DESC
LIMIT 10;

-- Compter les notifications par destinataire
SELECT destinataire, COUNT(*) as nb_notifications
FROM notifications
GROUP BY destinataire;
```

### Étape 4: Tester le flux complet

1. **Créer une prestation en tant que prestataire**:
   - Connectez-vous en tant que prestataire
   - Créez une nouvelle prestation
   - Soumettez-la pour validation

2. **Vérifier les logs backend**:
   ```bash
   # Rechercher les logs de notification
   grep "📧 Envoi notification fiche soumise" backend/backend.log
   grep "✅ Notifications fiche soumise envoyées" backend/backend.log
   ```

3. **Vérifier côté admin**:
   - Connectez-vous en tant qu'administrateur
   - Vérifiez la cloche de notifications
   - Vérifiez la table notifications dans la base de données

## Points de vérification

### ✅ Checklist de diagnostic

- [ ] Des utilisateurs avec role='ADMINISTRATEUR' existent dans la table `users`
- [ ] Les administrateurs ont des adresses email valides
- [ ] Les logs montrent "Nombre d'administrateurs trouvés: X" avec X > 0
- [ ] Les notifications sont créées dans la table `notifications`
- [ ] Le champ `destinataire` des notifications correspond aux emails des admins
- [ ] Les logs ne montrent pas d'erreurs lors de la sauvegarde des notifications
- [ ] Le frontend se connecte au stream SSE (`/api/notifications/stream/{email}`)

## Logs à surveiller

### Logs de succès attendus:
```
📧 Envoi notification fiche soumise - Prestataire: XXX, ID: YYY, Item: ZZZ
📧 Nombre d'administrateurs trouvés: 2
📧 Notification sauvegardée pour admin: admin@dgsi.bf (ID: 123)
✅ Notifications fiche soumise envoyées à 2 administrateurs
```

### Logs d'erreur possibles:
```
❌ ERREUR: Aucun administrateur trouvé dans la base de données
⚠️ Aucun admin trouvé avec role 'ADMINISTRATEUR'
❌ Erreur lors de l'envoi de notification à l'admin XXX
```

## Solutions aux problèmes courants

### Problème 1: Aucun administrateur trouvé
**Solution**: Vérifier que le rôle est exactement "ADMINISTRATEUR" (sans "ROLE_" devant)

```sql
-- Corriger les rôles si nécessaire
UPDATE users 
SET role = 'ADMINISTRATEUR' 
WHERE role = 'ROLE_ADMINISTRATEUR';
```

### Problème 2: Notifications créées mais pas affichées
**Solution**: Vérifier que le frontend se connecte au stream SSE

```javascript
// Dans le frontend, vérifier la connexion SSE
const eventSource = new EventSource(`/api/notifications/stream/${userEmail}`);
eventSource.onmessage = (event) => {
  console.log('Notification reçue:', event.data);
};
```

### Problème 3: Notifications envoyées mais pas en temps réel
**Solution**: Vérifier que le SSE fonctionne correctement

```bash
# Tester le stream SSE manuellement
curl -N http://localhost:8080/api/notifications/stream/admin@dgsi.bf
```

## Test manuel complet

1. **Redémarrer le backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Créer un administrateur de test** (si nécessaire):
   ```sql
   INSERT INTO users (id, nom, email, password, role, created_at, updated_at)
   VALUES (
       UUID(),
       'Admin Test',
       'admin.test@dgsi.bf',
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', -- password: admin123
       'ADMINISTRATEUR',
       NOW(),
       NOW()
   );
   ```

3. **Tester l'endpoint de notification**:
   ```bash
   curl -X POST http://localhost:8080/api/notifications/test-admin-notification
   ```

4. **Vérifier les résultats**:
   ```sql
   SELECT * FROM notifications ORDER BY date_creation DESC LIMIT 5;
   ```

## Contact et support

Si le problème persiste après avoir suivi ce guide:
1. Vérifiez tous les logs du backend
2. Vérifiez la configuration de la base de données
3. Assurez-vous que les tables `users` et `notifications` existent
4. Vérifiez que le frontend se connecte correctement au backend

## Fichiers modifiés

- ✅ `backend/src/main/java/com/dgsi/maintenance/service/PrestationService.java`
- ✅ `backend/src/main/java/com/dgsi/maintenance/service/NotificationService.java`
- ✅ `backend/src/main/java/com/dgsi/maintenance/controller/NotificationController.java`
- ✅ `backend/test-admin-notifications.sh` (nouveau)
- ✅ `GUIDE_DIAGNOSTIC_NOTIFICATIONS.md` (ce fichier)
