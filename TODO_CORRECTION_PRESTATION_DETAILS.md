# Plan de Correction - Affichage des Détails de Prestation

## Objectif
Corriger l'affichage des valeurs dans les détails de prestation:
- Pas de "N/A" pour les valeurs manquantes (remplacé par "-")
- Afficher correctement les colonnes de la facture proforma (Item, Prix unitaire, Quantité, Montant)
- Items couverts doivent être numérotés avec retour à la ligne
- Afficher les informations de la facture proforma même si les items sont dans nomPrestation

## Modifications Effectuées

### 1. Frontend - PrestationDetailComponent ✅
Fichier: `frontend/src/app/features/prestations/components/prestation-detail/prestation-detail.component.ts`

Modifications:
- Suppression des fallbacks 'N/A' pour les infos prestataire/responsable (remplacé par '-')
- Amélioration de l'affichage de la table proforma avec prix, quantité, montant
- Colonnes renommées: "Prix unitaire (FCFA)", "Montant (FCFA)"
- Items numérotés dans la table proforma (1. Item, 2. Item, etc.)
- Ajout de `getItemsStringWithBreaks()` pour afficher les items couverts numérotés avec retour à la ligne
- Ajout de `getItemsArrayWithDetails()` pour parser les items depuis nomPrestation (JSON ou CSV)
- Ajout de `getProformaItems()` pour afficher les items dans la facture proforma
- Styles CSS ajoutés pour `items-list-cell` avec `white-space: pre-wrap`
- Message de la facture proforma affiche maintenant les détails des prestations avec les items numérotés

### 2. Backend - PrestationPdfService ✅
Fichier: `backend/src/main/java/com/dgsi/maintenance/service/PrestationPdfService.java`

Modifications:
- Ajout d'une section "DÉTAILS DE LA FACTURE PROFORMA" avec les items
- Affichage prix unitaire, quantité et montant pour chaque item
- Changement de "Non spécifié" à "-" pour les valeurs manquantes
- Items numérotés dans le PDF (1. Item, 2. Item, etc.)
- Nouvelle méthode `getItemsFromPrestation()` qui:
  - D'abord essaie itemsUtilises (depuis la base de données)
  - Puis parse nomPrestation comme JSON array
  - Ensuite parse nomPrestation comme valeurs séparées par des virgules
- Total automatique calculé à partir des items

## État d'avancement
- [x] Frontend fix - Supprimer 'N/A' et améliorer l'affichage
- [x] Backend PDF - Ajouter section proforma items avec numérotation
- [x] Items couverts avec numérotation et retour à la ligne
- [x] Facture proforma affiche les items depuis nomPrestation
- [ ] Tests de vérification (à faire manuellement)

