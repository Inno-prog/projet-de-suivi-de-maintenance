# Tâches pour l'uniformisation des entêtes PDF d'évaluation

## Objectif
- Les PDFs d'évaluation doivent avoir la même entête que les fiches globales de prestation
- Le contenu des évaluations doit être bien structuré sans sauts de page unwanted

## Étapes

### 1. Modifier le template report_evaluation.html ✅ TERMINÉ
- [x] Adapter l'entête pour correspondre à celle des fiches de prestation
- [x] Structure identique: logo circulaire au centre, textes institutionnels à gauche et droite
- [x] Supprimer les sauts de page (page-break) pour un contenu continu
- [x] Améliorer la structure CSS pour un affichage optimal
- [x] Utiliser les champs disponibles dans l'entité EvaluationTrimestrielle

### 2. Créer/Modifier le service PDF d'évaluation
- [ ] Le service PdfReportService existant est utilisé pour générer le PDF
- [ ] Le template utilise Thymeleaf avec OpenHTMLToPDF

### 3. Tester les modifications
- [ ] Vérifier que l'entête est identique aux fiches de prestation
- [ ] Vérifier qu'il n'y a pas de sauts de page unwanted
- [ ] Tester la génération du PDF

## Notes
- L'entête des fiches de prestation contient:
  - À gauche: MINISTERE DE L'ECONOMIE, SECRETARIAT GENERAL, DGSI, DRS
  - Au centre: Logo circulaire (92px pour fiche globale)
  - À droite: BURKINA FASO, "La Patrie ou la Mort, nous Vaincrons", date de génération
- Les couleurs utilisées: DARK_BLUE (31, 41, 97)

## Structure du template modifié
Le template `report_evaluation.html` contient maintenant:
1. **Entête** - Identique aux fiches de prestation
2. **Introduction** - Description du processus d'évaluation
3. **Informations sur le contrat** - Lot, zone géographique, période
4. **Évaluation des critères** - Tableau des 8 critères avec status et observations
5. **Appréciation globale** - Note finale et observations
6. **Signatures** - Prestataire et DGSI
7. **Pied de page** - Message de confidentialité

