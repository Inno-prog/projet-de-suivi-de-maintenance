# Modifications apportées à l'entité StructureMefp

## Problème identifié
L'entité `StructureMefp` manquait plusieurs champs nécessaires pour la création de prestations, notamment :
- L'adresse de la structure
- Les informations du Correspondant Informatique (CI) : nom, prénom, contact, fonction

## Modifications apportées

### 1. Backend - Entité StructureMefp.java
**Fichier :** `/backend/src/main/java/com/dgsi/maintenance/entity/StructureMefp.java`

**Nouveaux champs ajoutés :**
```java
// Adresse de la structure
@Size(max = 200)
@Column(name = "adresse_structure")
private String adresseStructure;

// Correspondant Informatique (CI) fields
@Size(max = 100)
@Column(name = "nom_ci")
private String nomCI;

@Size(max = 100)
@Column(name = "prenom_ci")
private String prenomCI;

@Size(max = 100)
@Column(name = "contact_ci")
private String contactCI;

@Size(max = 100)
@Column(name = "fonction_ci")
private String fonctionCI;
```

**Getters et Setters ajoutés :**
- `getAdresseStructure()` / `setAdresseStructure()`
- `getNomCI()` / `setNomCI()`
- `getPrenomCI()` / `setPrenomCI()`
- `getContactCI()` / `setContactCI()`
- `getFonctionCI()` / `setFonctionCI()`

### 2. Backend - Service StructureMefpService.java
**Fichier :** `/backend/src/main/java/com/dgsi/maintenance/service/StructureMefpService.java`

**Méthode `updateStructure` mise à jour :**
```java
// Ajout de la mise à jour des nouveaux champs
structure.setAdresseStructure(structureDetails.getAdresseStructure());
structure.setNomCI(structureDetails.getNomCI());
structure.setPrenomCI(structureDetails.getPrenomCI());
structure.setContactCI(structureDetails.getContactCI());
structure.setFonctionCI(structureDetails.getFonctionCI());
```

### 3. Frontend - Interface StructureMefp
**Fichier :** `/frontend/src/app/core/models/business.models.ts`

**Interface mise à jour :**
```typescript
export interface StructureMefp {
  id?: string;
  nom: string;
  contact?: string;
  email?: string;
  ville?: string;
  adresseStructure?: string;  // ✅ Nouveau champ
  description?: string;
  categorie?: string;
  // Correspondant Informatique (CI) fields ✅ Nouveaux champs
  nomCI?: string;
  prenomCI?: string;
  contactCI?: string;
  fonctionCI?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### 4. Base de données - Script SQL
**Fichier :** `/backend/add_structure_fields.sql`

**Script pour ajouter les colonnes :**
```sql
-- Ajouter le champ adresse_structure
ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS adresse_structure VARCHAR(200);

-- Ajouter les champs du Correspondant Informatique (CI)
ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS nom_ci VARCHAR(100);

ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS prenom_ci VARCHAR(100);

ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS contact_ci VARCHAR(100);

ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS fonction_ci VARCHAR(100);
```

### 5. Initializer de données
**Fichier :** `/backend/src/main/java/com/dgsi/maintenance/config/StructureMefpDataInitializer.java`

**Nouveau fichier créé** pour initialiser des structures MEFP avec les nouveaux champs, incluant :
- Direction Générale du Budget (DGB)
- Direction Générale des Impôts (DGI)
- Direction Générale des Douanes (DGD)
- Direction Générale du Trésor et de la Comptabilité Publique (DGTCP)
- Directions Régionales (Centre, Hauts-Bassins, Nord, Est)
- Inspection Générale des Finances (IGF)
- Secrétariat Général (SG-MINEFID)

## Impact sur la création de prestations

Avec ces modifications, lors de la création d'une prestation :

1. **Sélection de structure existante :** Les prestataires peuvent maintenant sélectionner une structure MEFP existante qui pré-remplira automatiquement :
   - Nom de la structure
   - Adresse de la structure
   - Email de la structure
   - Informations complètes du CI (nom, prénom, contact, fonction)

2. **Création de nouvelle structure :** Si la structure n'existe pas, le prestataire peut créer une nouvelle entrée avec tous les champs nécessaires.

3. **Données complètes :** Toutes les informations requises pour la génération de PDF et la traçabilité des prestations sont maintenant disponibles.

## Migration automatique

Le projet utilise `spring.jpa.hibernate.ddl-auto=update`, donc :
- ✅ Les nouvelles colonnes seront créées automatiquement au prochain démarrage
- ✅ Les données existantes seront préservées
- ✅ Le script SQL fourni peut être utilisé pour une migration manuelle si nécessaire

## Prochaines étapes

1. Redémarrer l'application backend pour appliquer les changements de schéma
2. Vérifier que les nouvelles structures sont créées via l'initializer
3. Tester la création de prestations avec sélection de structures
4. Valider que les PDF générés contiennent toutes les informations nécessaires