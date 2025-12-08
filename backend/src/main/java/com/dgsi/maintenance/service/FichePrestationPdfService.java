package com.dgsi.maintenance.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import com.dgsi.maintenance.entity.FichePrestation;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FichePrestationPdfService {

    /**
     * Génère un PDF pour une fiche de prestation (FichePrestation)
     */
    @Transactional(readOnly = true)
    public byte[] generateFichePrestationPdf(FichePrestation fiche) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // Créer le document PDF
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);

            // Couleurs
            DeviceRgb primaryColor = new DeviceRgb(249, 115, 22); // Orange
            DeviceRgb secondaryColor = new DeviceRgb(31, 41, 97); // Bleu foncé
            DeviceRgb grayColor = new DeviceRgb(107, 114, 128); // Gris

            // Police
            PdfFont boldFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);

            // En-tête
            addHeader(document, primaryColor, secondaryColor, boldFont);

            // Titre
            Paragraph title = new Paragraph("FICHE DE PRESTATION")
                    .setFont(boldFont)
                    .setFontSize(20)
                    .setFontColor(primaryColor)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(30);
            document.add(title);

            // Informations générales de la fiche
            addSectionTitle(document, "Informations Générales", secondaryColor, boldFont);
            addFicheGeneralInfo(document, fiche, normalFont, grayColor);

            // Informations du Prestataire
            addSectionTitle(document, "Informations du Prestataire", secondaryColor, boldFont);
            addFichePrestataireInfo(document, fiche, normalFont, grayColor);

            // Détails de l'Intervention
            addSectionTitle(document, "Détails de l'Intervention", secondaryColor, boldFont);
            addFicheInterventionDetails(document, fiche, normalFont, grayColor);

            // Commentaire
            if (fiche.getCommentaire() != null && !fiche.getCommentaire().trim().isEmpty()) {
                addSectionTitle(document, "Commentaires", secondaryColor, boldFont);
                addObservations(document, fiche.getCommentaire(), normalFont);
            }

            // Pied de page
            addFooter(document, normalFont, grayColor);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF de fiche prestation", e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    private void addHeader(Document document, DeviceRgb primaryColor, DeviceRgb secondaryColor, PdfFont boldFont) {
        try {
            PdfFont normalFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);
            PdfFont italicFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_OBLIQUE);

            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{30, 40, 30}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            // Contenu texte à gauche
            Cell leftCell = new Cell()
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.LEFT)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE)
                    .setPadding(10);

            Paragraph leftText = new Paragraph()
                    .setTextAlignment(TextAlignment.LEFT);

            leftText.add(new Paragraph("MINISTERE DE L'ECONOMIE")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(1));

            leftText.add(new Paragraph("ET DES FINANCES")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(3));

            leftText.add(new Paragraph("SECRETARIAT GENERAL")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(3));

            leftText.add(new Paragraph("DIRECTION GENERALE DES")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(1));

            leftText.add(new Paragraph("SYSTEMES D'INFORMATION")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(3));

            leftText.add(new Paragraph("DIRECTION DES RESEAUX")
                    .setFont(boldFont)
                    .setFontSize(9)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(1));

            leftText.add(new Paragraph("ET SYSTÈMES")
                    .setFont(boldFont)
                    .setFontSize(9)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(2));

            leftCell.add(leftText);

            // Logo au centre
            Cell centerCell = new Cell()
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE)
                    .setPadding(10);

            try {
                // Charger le logo depuis les ressources
                ClassPathResource logoResource = new ClassPathResource("static/assets/logoFinal.png");
                if (logoResource.exists()) {
                    ImageData imageData = ImageDataFactory.create(logoResource.getURL());
                    Image logoImage = new Image(imageData);
                    logoImage.setWidth(60);
                    logoImage.setHeight(45);
                    logoImage.setAutoScale(true);
                    centerCell.add(logoImage);
                } else {
                    // Fallback si le logo n'est pas trouvé
                    centerCell.add(new Paragraph("BURKINA FASO")
                            .setFont(boldFont)
                            .setFontSize(12)
                            .setFontColor(primaryColor)
                            .setTextAlignment(TextAlignment.CENTER));
                }
            } catch (IOException e) {
                log.warn("Impossible de charger le logo, utilisation du texte par défaut", e);
                centerCell.add(new Paragraph("BURKINA FASO")
                        .setFont(boldFont)
                        .setFontSize(12)
                        .setFontColor(primaryColor)
                        .setTextAlignment(TextAlignment.CENTER));
            }

            // Devise à droite
            Cell rightCell = new Cell()
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE)
                    .setPadding(10);

            Paragraph rightText = new Paragraph()
                    .setTextAlignment(TextAlignment.RIGHT);

            rightText.add(new Paragraph("Unité - Travail - Progrès")
                    .setFont(italicFont)
                    .setFontSize(10)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(10));

            rightText.add(new Paragraph("La Patrie ou la Mort,")
                    .setFont(italicFont)
                    .setFontSize(9)
                    .setFontColor(new DeviceRgb(0, 0, 0))
                    .setMarginBottom(1));

            rightText.add(new Paragraph("nous Vaincrons !")
                    .setFont(italicFont)
                    .setFontSize(9)
                    .setFontColor(new DeviceRgb(0, 0, 0)));

            rightCell.add(rightText);

            headerTable.addCell(leftCell);
            headerTable.addCell(centerCell);
            headerTable.addCell(rightCell);

            document.add(headerTable);
        } catch (Exception e) {
            log.error("Erreur lors de la création de l'entête", e);
        }
    }

    private void addSectionTitle(Document document, String title, DeviceRgb color, PdfFont font) {
        Paragraph sectionTitle = new Paragraph(title)
                .setFont(font)
                .setFontSize(16)
                .setFontColor(color)
                .setMarginTop(20)
                .setMarginBottom(10);
        document.add(sectionTitle);
    }

    private void addFicheGeneralInfo(Document document, FichePrestation fiche, PdfFont font, DeviceRgb grayColor) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        addInfoRow(table, "ID Fiche", fiche.getId().toString(), font, grayColor);
        addInfoRow(table, "ID Prestation", fiche.getIdPrestation() != null ? fiche.getIdPrestation() : "N/A", font, grayColor);
        addInfoRow(table, "Nom de l'item", fiche.getNomItem() != null ? fiche.getNomItem() : "N/A", font, grayColor);
        addInfoRow(table, "Items couverts", fiche.getItemsCouverts() != null ? fiche.getItemsCouverts() : "N/A", font, grayColor);
        addInfoRow(table, "Statut", fiche.getStatut() != null ? fiche.getStatut().toString() : "N/A", font, grayColor);
        addInfoRow(table, "Statut d'intervention", fiche.getStatutIntervention() != null ? fiche.getStatutIntervention() : "N/A", font, grayColor);

        document.add(table);
    }

    private void addFichePrestataireInfo(Document document, FichePrestation fiche, PdfFont font, DeviceRgb grayColor) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        addInfoRow(table, "Nom du prestataire", fiche.getNomPrestataire() != null ? fiche.getNomPrestataire() : "N/A", font, grayColor);

        document.add(table);
    }

    private void addFicheInterventionDetails(Document document, FichePrestation fiche, PdfFont font, DeviceRgb grayColor) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        addInfoRow(table, "Quantité", fiche.getQuantite() != null ? fiche.getQuantite().toString() : "N/A", font, grayColor);

        // Date de réalisation
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String dateRealisation = fiche.getDateRealisation() != null ?
                fiche.getDateRealisation().format(formatter) : "N/A";
        addInfoRow(table, "Date/heure de réalisation", dateRealisation, font, grayColor);

        // Fichiers contrat
        addInfoRow(table, "Fichiers contrat", fiche.getFichiersContrat() != null ? fiche.getFichiersContrat() : "N/A", font, grayColor);

        document.add(table);
    }

    private void addObservations(Document document, String observations, PdfFont font) {
        Paragraph obsParagraph = new Paragraph(observations)
                .setFont(font)
                .setFontSize(11)
                .setMarginBottom(15)
                .setMultipliedLeading(1.2f);
        document.add(obsParagraph);
    }

    private void addInfoRow(Table table, String label, String value, PdfFont font, DeviceRgb grayColor) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label + " :")
                        .setFont(font)
                        .setFontSize(11)
                        .setFontColor(grayColor))
                .setBorder(null)
                .setPadding(5);

        Cell valueCell = new Cell()
                .add(new Paragraph(value)
                        .setFont(font)
                        .setFontSize(11))
                .setBorder(null)
                .setPadding(5);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addFooter(Document document, PdfFont font, DeviceRgb grayColor) {
        Paragraph footer = new Paragraph("Document généré automatiquement par le système DGSI Maintenance")
                .setFont(font)
                .setFontSize(9)
                .setFontColor(grayColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30);
        document.add(footer);
    }

    /**
     * Génère une fiche globale de prestations pour un lot et trimestre donnés
     */
    @Transactional(readOnly = true)
    public byte[] generateGlobalServiceSheetPdf(String lot, int annee, int trimestre, List<FichePrestation> fiches) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(30, 30, 30, 30);

            PdfFont boldFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);
            
            DeviceRgb blueColor = new DeviceRgb(52, 144, 220);
            DeviceRgb grayColor = new DeviceRgb(128, 128, 128);

            // Titre principal
            document.add(new Paragraph("FICHE GLOBALE DE PRESTATION")
                    .setFont(boldFont).setFontSize(18).setFontColor(blueColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(5));

            // Sous-titre
            document.add(new Paragraph("Trimestre " + trimestre + " - " + lot)
                    .setFont(normalFont).setFontSize(12).setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(3));

            document.add(new Paragraph("Gestion de projet et coordination - Ouagadougou")
                    .setFont(normalFont).setFontSize(10).setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(3));

            document.add(new Paragraph("Date de génération: " + java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFont(normalFont).setFontSize(10).setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // Ligne de séparation
            document.add(new Paragraph("_".repeat(100))
                    .setFont(normalFont).setFontSize(8).setFontColor(blueColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // Informations du lot et période
            addLotAndPeriodInfo(document, lot, annee, trimestre, fiches, normalFont, boldFont, blueColor);

            // Tableau des prestations
            addPrestationsTable(document, fiches, normalFont, boldFont, blueColor);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF de fiche globale", e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    private void addGlobalSheetGeneralInfo(Document document, String lot, int annee, int trimestre, int nbFiches, PdfFont font, DeviceRgb grayColor) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        addInfoRow(table, "Lot", lot, font, grayColor);
        addInfoRow(table, "Année", String.valueOf(annee), font, grayColor);
        addInfoRow(table, "Trimestre", "T" + trimestre, font, grayColor);
        addInfoRow(table, "Nombre de fiches", String.valueOf(nbFiches), font, grayColor);

        document.add(table);
    }

    private void addItemsUsageTable(Document document, List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont, DeviceRgb primaryColor, DeviceRgb grayColor) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 1, 1, 1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        // En-têtes
        addTableHeader(table, "Item", boldFont, primaryColor);
        addTableHeader(table, "Prestataire", boldFont, primaryColor);
        addTableHeader(table, "Quantité réalisée", boldFont, primaryColor);
        addTableHeader(table, "Date", boldFont, primaryColor);
        addTableHeader(table, "Statut", boldFont, primaryColor);

        // Trier les fiches par nom d'item puis par date
        List<FichePrestation> fichesSorted = fiches.stream()
                .sorted((f1, f2) -> {
                    // Tri par nom d'item d'abord
                    String item1 = f1.getNomItem() != null ? f1.getNomItem() : "";
                    String item2 = f2.getNomItem() != null ? f2.getNomItem() : "";
                    int itemComparison = item1.compareToIgnoreCase(item2);
                    if (itemComparison != 0) {
                        return itemComparison;
                    }
                    // Puis par date si même item
                    if (f1.getDateRealisation() != null && f2.getDateRealisation() != null) {
                        return f1.getDateRealisation().compareTo(f2.getDateRealisation());
                    }
                    return 0;
                })
                .collect(java.util.stream.Collectors.toList());

        // Données triées
        for (FichePrestation fiche : fichesSorted) {
            addTableCell(table, fiche.getNomItem() != null ? fiche.getNomItem() : "N/A", normalFont);
            addTableCell(table, fiche.getNomPrestataire() != null ? fiche.getNomPrestataire() : "N/A", normalFont);
            addTableCell(table, fiche.getQuantite() != null ? fiche.getQuantite().toString() : "N/A", normalFont);
            addTableCell(table, fiche.getDateRealisation() != null ? fiche.getDateRealisation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A", normalFont);
            addTableCell(table, fiche.getStatut() != null ? fiche.getStatut().toString() : "N/A", normalFont);
        }

        document.add(table);
    }

    private void addTableHeader(Table table, String text, PdfFont font, DeviceRgb color) {
        Cell cell = new Cell()
                .add(new Paragraph(text)
                        .setFont(font)
                        .setFontSize(12)
                        .setFontColor(new DeviceRgb(255, 255, 255)))
                .setBackgroundColor(color)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(8);
        table.addCell(cell);
    }

    private void addTableCell(Table table, String text, PdfFont font) {
        Cell cell = new Cell()
                .add(new Paragraph(text)
                        .setFont(font)
                        .setFontSize(10))
                .setPadding(6)
                .setTextAlignment(TextAlignment.CENTER);
        table.addCell(cell);
    }

    private void addLotAndPeriodInfo(Document document, String lot, int annee, int trimestre, List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont, DeviceRgb blueColor) {
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100)).setMarginBottom(20);

        // Colonne gauche - Informations du Lot
        Cell leftCell = new Cell().setBorder(null).setPadding(10);
        leftCell.add(new Paragraph("Informations du Lot").setFont(boldFont).setFontSize(12).setFontColor(blueColor));
        leftCell.add(new Paragraph("Numéro: " + lot).setFont(normalFont).setFontSize(10).setMarginTop(5));
        leftCell.add(new Paragraph("Ville: Ouagadougou").setFont(normalFont).setFontSize(10));
        leftCell.add(new Paragraph("Trimestre: T" + trimestre).setFont(normalFont).setFontSize(10));
        leftCell.add(new Paragraph("Statut: Actif").setFont(normalFont).setFontSize(10));

        // Colonne droite - Période
        Cell rightCell = new Cell().setBorder(null).setPadding(10);
        rightCell.add(new Paragraph("Période").setFont(boldFont).setFontSize(12).setFontColor(blueColor));
        rightCell.add(new Paragraph("Année: " + annee).setFont(normalFont).setFontSize(10).setMarginTop(5));
        rightCell.add(new Paragraph("Trimestre: Octobre - Décembre").setFont(normalFont).setFontSize(10));
        rightCell.add(new Paragraph("Fiches incluses: " + fiches.size()).setFont(normalFont).setFontSize(10));

        infoTable.addCell(leftCell);
        infoTable.addCell(rightCell);
        document.add(infoTable);
    }

    private void addStatisticsCards(Document document, List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont, DeviceRgb blueColor) {
        Table statsTable = new Table(UnitValue.createPercentArray(new float[]{25, 25, 25, 25}))
                .setWidth(UnitValue.createPercentValue(100)).setMarginBottom(30);

        int totalFiches = fiches.size();
        int validees = (int) fiches.stream().filter(f -> "VALIDE".equals(f.getStatut().toString())).count();
        int rejetees = (int) fiches.stream().filter(f -> "REJETE".equals(f.getStatut().toString())).count();
        double montantTotal = fiches.stream().mapToDouble(f -> f.getQuantite() != null ? f.getQuantite() * 50000 : 0).sum();

        addStatCard(statsTable, String.valueOf(totalFiches), "Total Fiches", normalFont, boldFont, blueColor);
        addStatCard(statsTable, String.valueOf(validees), "Validées", normalFont, boldFont, blueColor);
        addStatCard(statsTable, String.valueOf(rejetees), "Rejetées", normalFont, boldFont, blueColor);
        addStatCard(statsTable, String.format("%.0f FCFA", montantTotal), "Montant Total", normalFont, boldFont, blueColor);

        document.add(statsTable);
    }

    private void addStatCard(Table table, String value, String label, PdfFont normalFont, PdfFont boldFont, DeviceRgb blueColor) {
        Cell cell = new Cell().setBorder(null).setPadding(15).setTextAlignment(TextAlignment.CENTER);
        cell.add(new Paragraph(value).setFont(boldFont).setFontSize(24).setFontColor(blueColor));
        cell.add(new Paragraph(label).setFont(normalFont).setFontSize(10).setMarginTop(5));
        table.addCell(cell);
    }

    private void addPrestationsTable(Document document, List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont, DeviceRgb blueColor) {
        document.add(new Paragraph("Détail des Prestations").setFont(boldFont).setFontSize(14).setMarginBottom(10));

        Table table = new Table(UnitValue.createPercentArray(new float[]{10, 20, 30, 15, 10, 15, 10}))
                .setWidth(UnitValue.createPercentValue(100));

        // En-têtes avec fond bleu
        String[] headers = {"N° Fiche", "Prestataire", "Item/Service", "Date", "Qté", "Montant", "Statut"};
        for (String header : headers) {
            Cell headerCell = new Cell().add(new Paragraph(header).setFont(boldFont).setFontSize(10).setFontColor(new DeviceRgb(255, 255, 255)))
                    .setBackgroundColor(blueColor).setPadding(8).setTextAlignment(TextAlignment.CENTER);
            table.addHeaderCell(headerCell);
        }

        // Trier et ajouter les données
        List<FichePrestation> fichesSorted = fiches.stream()
                .sorted((f1, f2) -> {
                    String item1 = f1.getNomItem() != null ? f1.getNomItem() : "";
                    String item2 = f2.getNomItem() != null ? f2.getNomItem() : "";
                    return item1.compareToIgnoreCase(item2);
                })
                .collect(java.util.stream.Collectors.toList());

        for (FichePrestation fiche : fichesSorted) {
            table.addCell(new Cell().add(new Paragraph(fiche.getIdPrestation() != null ? fiche.getIdPrestation() : "N/A").setFont(normalFont).setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(fiche.getNomPrestataire() != null ? fiche.getNomPrestataire() : "N/A").setFont(normalFont).setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(fiche.getNomItem() != null ? fiche.getNomItem() : "N/A").setFont(normalFont).setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(fiche.getDateRealisation() != null ? fiche.getDateRealisation().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A").setFont(normalFont).setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(fiche.getQuantite() != null ? fiche.getQuantite().toString() : "0").setFont(normalFont).setFontSize(9)).setPadding(5).setTextAlignment(TextAlignment.CENTER));
            
            double montant = fiche.getQuantite() != null ? fiche.getQuantite() * 50000 : 0;
            table.addCell(new Cell().add(new Paragraph(String.format("%.0f FCFA", montant)).setFont(normalFont).setFontSize(9)).setPadding(5).setTextAlignment(TextAlignment.RIGHT));
            
            String statut = fiche.getStatut() != null ? fiche.getStatut().toString() : "N/A";
            DeviceRgb statutColor = "VALIDE".equals(statut) ? new DeviceRgb(0, 128, 0) : "REJETE".equals(statut) ? new DeviceRgb(255, 0, 0) : new DeviceRgb(128, 128, 128);
            table.addCell(new Cell().add(new Paragraph(statut).setFont(normalFont).setFontSize(9).setFontColor(statutColor)).setPadding(5).setTextAlignment(TextAlignment.CENTER));
        }

        // Ligne de total
        double totalMontant = fichesSorted.stream().mapToDouble(f -> f.getQuantite() != null ? f.getQuantite() * 50000 : 0).sum();
        table.addCell(new Cell(1, 5).add(new Paragraph("TOTAL GÉNÉRAL").setFont(boldFont).setFontSize(10)).setPadding(8).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph(String.format("%.0f FCFA", totalMontant)).setFont(boldFont).setFontSize(10)).setPadding(8).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph("-").setFont(normalFont).setFontSize(10)).setPadding(8).setTextAlignment(TextAlignment.CENTER));

        document.add(table);
    }

    /**
     * Génère une fiche de prestation pour un prestataire spécifique
     */
    @Transactional(readOnly = true)
    public byte[] generatePrestataireServiceSheetPdf(String lot, int annee, int trimestre, String prestataire, List<FichePrestation> fiches) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(30, 30, 30, 30);

            PdfFont boldFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);
            
            DeviceRgb blueColor = new DeviceRgb(52, 144, 220);
            DeviceRgb grayColor = new DeviceRgb(128, 128, 128);

            // Titre principal
            document.add(new Paragraph("FICHE DE PRESTATION - PRESTATAIRE")
                    .setFont(boldFont).setFontSize(18).setFontColor(blueColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(5));

            // Sous-titre avec nom du prestataire
            document.add(new Paragraph(prestataire)
                    .setFont(boldFont).setFontSize(14).setFontColor(new DeviceRgb(0, 0, 0))
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(3));

            document.add(new Paragraph("Trimestre " + trimestre + " - " + lot)
                    .setFont(normalFont).setFontSize(12).setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(3));

            document.add(new Paragraph("Date de génération: " + java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFont(normalFont).setFontSize(10).setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // Ligne de séparation
            document.add(new Paragraph("_".repeat(100))
                    .setFont(normalFont).setFontSize(8).setFontColor(blueColor)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // Informations du prestataire et période
            addPrestataireAndPeriodInfo(document, prestataire, lot, annee, trimestre, fiches, normalFont, boldFont, blueColor);

            // Tableau des prestations du prestataire
            addPrestatairePrestationsTable(document, fiches, normalFont, boldFont, blueColor);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF de fiche prestataire", e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    private void addPrestataireAndPeriodInfo(Document document, String prestataire, String lot, int annee, int trimestre, List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont, DeviceRgb blueColor) {
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100)).setMarginBottom(20);

        // Colonne gauche - Informations du Prestataire
        Cell leftCell = new Cell().setBorder(null).setPadding(10);
        leftCell.add(new Paragraph("Informations du Prestataire").setFont(boldFont).setFontSize(12).setFontColor(blueColor));
        leftCell.add(new Paragraph("Nom: " + prestataire).setFont(normalFont).setFontSize(10).setMarginTop(5));
        leftCell.add(new Paragraph("Lot assigné: " + lot).setFont(normalFont).setFontSize(10));
        leftCell.add(new Paragraph("Statut: Actif").setFont(normalFont).setFontSize(10));

        // Colonne droite - Période et statistiques
        Cell rightCell = new Cell().setBorder(null).setPadding(10);
        rightCell.add(new Paragraph("Période et Statistiques").setFont(boldFont).setFontSize(12).setFontColor(blueColor));
        rightCell.add(new Paragraph("Année: " + annee).setFont(normalFont).setFontSize(10).setMarginTop(5));
        rightCell.add(new Paragraph("Trimestre: T" + trimestre).setFont(normalFont).setFontSize(10));
        rightCell.add(new Paragraph("Fiches réalisées: " + fiches.size()).setFont(normalFont).setFontSize(10));
        
        int validees = (int) fiches.stream().filter(f -> "VALIDE".equals(f.getStatut().toString())).count();
        rightCell.add(new Paragraph("Fiches validées: " + validees).setFont(normalFont).setFontSize(10));

        infoTable.addCell(leftCell);
        infoTable.addCell(rightCell);
        document.add(infoTable);
    }

    private void addPrestatairePrestationsTable(Document document, List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont, DeviceRgb blueColor) {
        document.add(new Paragraph("Détail des Prestations Réalisées").setFont(boldFont).setFontSize(14).setMarginBottom(10));

        if (fiches.isEmpty()) {
            document.add(new Paragraph("Aucune prestation réalisée pour cette période.")
                    .setFont(normalFont).setFontSize(12).setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(20).setMarginBottom(20));
            return;
        }

        Table table = new Table(UnitValue.createPercentArray(new float[]{15, 35, 15, 10, 15, 10}))
                .setWidth(UnitValue.createPercentValue(100));

        // En-têtes avec fond bleu
        String[] headers = {"N° Fiche", "Item/Service", "Date", "Qté", "Montant", "Statut"};
        for (String header : headers) {
            Cell headerCell = new Cell().add(new Paragraph(header).setFont(boldFont).setFontSize(10).setFontColor(new DeviceRgb(255, 255, 255)))
                    .setBackgroundColor(blueColor).setPadding(8).setTextAlignment(TextAlignment.CENTER);
            table.addHeaderCell(headerCell);
        }

        // Trier par date
        List<FichePrestation> fichesSorted = fiches.stream()
                .sorted((f1, f2) -> {
                    if (f1.getDateRealisation() != null && f2.getDateRealisation() != null) {
                        return f2.getDateRealisation().compareTo(f1.getDateRealisation()); // Plus récent en premier
                    }
                    return 0;
                })
                .collect(java.util.stream.Collectors.toList());

        double totalMontant = 0;
        for (FichePrestation fiche : fichesSorted) {
            table.addCell(new Cell().add(new Paragraph(fiche.getIdPrestation() != null ? fiche.getIdPrestation() : "N/A").setFont(normalFont).setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(fiche.getNomItem() != null ? fiche.getNomItem() : "N/A").setFont(normalFont).setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(fiche.getDateRealisation() != null ? fiche.getDateRealisation().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A").setFont(normalFont).setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(fiche.getQuantite() != null ? fiche.getQuantite().toString() : "0").setFont(normalFont).setFontSize(9)).setPadding(5).setTextAlignment(TextAlignment.CENTER));
            
            double montant = fiche.getQuantite() != null ? fiche.getQuantite() * 50000 : 0;
            totalMontant += montant;
            table.addCell(new Cell().add(new Paragraph(String.format("%.0f FCFA", montant)).setFont(normalFont).setFontSize(9)).setPadding(5).setTextAlignment(TextAlignment.RIGHT));
            
            String statut = fiche.getStatut() != null ? fiche.getStatut().toString() : "N/A";
            DeviceRgb statutColor = "VALIDE".equals(statut) ? new DeviceRgb(0, 128, 0) : "REJETE".equals(statut) ? new DeviceRgb(255, 0, 0) : new DeviceRgb(128, 128, 128);
            table.addCell(new Cell().add(new Paragraph(statut).setFont(normalFont).setFontSize(9).setFontColor(statutColor)).setPadding(5).setTextAlignment(TextAlignment.CENTER));
        }

        // Ligne de total
        table.addCell(new Cell(1, 4).add(new Paragraph("TOTAL PRESTATAIRE").setFont(boldFont).setFontSize(10)).setPadding(8).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph(String.format("%.0f FCFA", totalMontant)).setFont(boldFont).setFontSize(10)).setPadding(8).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph("-").setFont(normalFont).setFontSize(10)).setPadding(8).setTextAlignment(TextAlignment.CENTER));

        document.add(table);
    }
}
