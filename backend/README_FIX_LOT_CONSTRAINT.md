# Correction de la contrainte d'unicité sur lot_id

## Problème

Lors de la création d'un contrat avec `lot_id=3`, l'erreur suivante se produisait :

```
ERROR: duplicate key value violates unique constraint "uk9i5s9jrbyums3ssryiqv6mgf7"
  Détail : Key (lot_id)=(3) already exists.
```

Cette erreur indiquait qu'une contrainte d'unicité UNIQUE existait sur la colonne `lot_id` dans la table `contrats`, empêchant d'avoir plusieurs contrats pour le même lot.

## Cause

La contrainte `uk9i5s9jrbyums3ssryiqv6mgf7` imposait que chaque valeur de `lot_id` soit unique dans la table `contrats`. Or, dans le modèle métier, un lot peut avoir plusieurs contrats (par exemple, un contrat par prestataire pour le même lot).

## Solution

La solution consiste à **supprimer la contrainte d'unicité** sur la colonne `lot_id` dans la table `contrats`.

### Fichiers créés

1. **`fix_lot_unique_constraint.sql`** - Script SQL pour supprimer la contrainte
2. **`run_fix_lot_constraint.sh`** - Script shell pour exécuter automatiquement le script SQL

## Comment appliquer la correction

### Méthode 1 : Utiliser le script shell (recommandé)

```bash
cd backend
./run_fix_lot_constraint.sh
```

Le script utilisera les paramètres par défaut :
- Host: localhost
- Port: 5432
- Database: maintenance_db
- User: postgres

Pour utiliser des paramètres personnalisés :

```bash
DB_HOST=monhost DB_NAME=mabase DB_USER=monuser ./run_fix_lot_constraint.sh
```

### Méthode 2 : Exécuter manuellement le script SQL

```bash
cd backend
psql -h localhost -U postgres -d maintenance_db -f fix_lot_unique_constraint.sql
```

### Méthode 3 : Commande SQL directe

Si vous connaissez le nom exact de la contrainte :

```sql
ALTER TABLE contrats DROP CONSTRAINT uk9i5s9jrbyums3ssryiqv6mgf7;
```

## Vérification

Après application de la correction, vous pouvez vérifier que la contrainte a bien été supprimée :

```sql
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
WHERE 
    tc.table_name = 'contrats' 
    AND kcu.column_name = 'lot_id'
    AND tc.constraint_type = 'UNIQUE';
```

Cette requête ne doit retourner aucun résultat (ou uniquement des contraintes que vous souhaitez conserver).

## Note sur le modèle de données

L'entité JPA `Contrat` est correctement configurée avec une relation `@ManyToOne` vers `Lot` :

```java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "lot_id")
@JsonIgnore
private Lot lot;
```

Cette configuration permet bien d'avoir plusieurs contrats associés au même lot, ce qui est le comportement attendu métier.
