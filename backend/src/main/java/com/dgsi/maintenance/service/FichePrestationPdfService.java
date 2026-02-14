package com.dgsi.maintenance.service;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.imageio.ImageIO;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.utils.PdfMerger;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.BorderRadius;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FichePrestationPdfService {

        private final PrestationRepository prestationRepository;
        private final ItemService itemService;
        private final FichePrestationRepository fichePrestationRepository;
        private final ItemRepository itemRepository;

        @Autowired
        public FichePrestationPdfService(PrestationRepository prestationRepository, ItemService itemService,
                                         FichePrestationRepository fichePrestationRepository, ItemRepository itemRepository) {
                this.prestationRepository = prestationRepository;
                this.itemService = itemService;
                this.fichePrestationRepository = fichePrestationRepository;
                this.itemRepository = itemRepository;
        }

    // Couleurs définies une seule fois
    private static final DeviceRgb DARK_BLUE = new DeviceRgb(31, 41, 97);     // Bleu marine sombre
    private static final DeviceRgb BLACK = new DeviceRgb(0, 0, 0);             // Noir
    private static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);       // Blanc
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(245, 245, 245);  // Gris clair
    private static final DeviceRgb MEDIUM_GRAY = new DeviceRgb(221, 221, 221); // Gris moyen
    private static final DeviceRgb DARK_GRAY = new DeviceRgb(128, 128, 128);   // Gris foncé
    private static final DeviceRgb TEXT_COLOR = new DeviceRgb(51, 51, 51);     // Couleur texte
    private static final DeviceRgb SUCCESS_COLOR = new DeviceRgb(0, 128, 0);   // Vert pour succès
    private static final DeviceRgb ERROR_COLOR = new DeviceRgb(220, 53, 69);   // Rouge pour erreur

    // ============================
    // 1. FICHE DE PRESTATION INDIVIDUELLE
    // ============================
    @Transactional(readOnly = true)
    public byte[] generateFichePrestationPdf(FichePrestation fiche) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(40, 40, 40, 40);

            // Polices
            PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont italicFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            // 1. En-tête avec logo (plus petit pour la fiche individuelle)
            addHeader(document, boldFont, italicFont, 60);

            // Ligne de séparation
            document.add(new Paragraph("_".repeat(100))
                    .setFont(normalFont)
                    .setFontSize(6)
                    .setFontColor(DARK_BLUE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(10)
                    .setMarginBottom(20));

            // 2. Titre principal
            document.add(new Paragraph("FICHE DE PRESTATION")
                    .setFont(titleFont)
                    .setFontSize(18)
                    .setFontColor(DARK_BLUE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(25));

            // 3. Section INFORMATIONS GÉNÉRALES
            addSectionTitle(document, "INFORMATIONS GÉNÉRALES", boldFont);
            addFicheGeneralInfo(document, fiche, normalFont);

            // 4. Section INFORMATIONS DU PRESTATAIRE
            addSectionTitle(document, "INFORMATIONS DU PRESTATAIRE", boldFont);
            addFichePrestataireInfo(document, fiche, normalFont);

            // 5. Section DÉTAILS DE L'INTERVENTION
            addSectionTitle(document, "DÉTAILS DE L'INTERVENTION", boldFont);
            addFicheInterventionDetails(document, fiche, normalFont);

            // 6. Section COMMENTAIRES (si existants)
            if (fiche.getCommentaire() != null && !fiche.getCommentaire().trim().isEmpty()) {
                addSectionTitle(document, "COMMENTAIRES", boldFont);
                addObservations(document, fiche.getCommentaire(), normalFont);
            }

            // 7. Pied de page
            addFooter(document, normalFont);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF de fiche prestation", e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    // ============================
    // 2. FICHE GLOBALE
    // ============================
    @Transactional(readOnly = true)
    public byte[] generateGlobalServiceSheetPdf(String lot, int annee, int trimestre, List<FichePrestation> fiches) {
        // Nouvelle approche : la fiche globale pour "tous les prestataires" est
        // l'assemblage (concaténation) des fiches par prestataire. On génère la
        // fiche prestataire pour chaque prestataire et on les fusionne en un
        // seul PDF en respectant le format existant (design inchangé).
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument destPdf = new PdfDocument(writer);
            PdfMerger merger = new PdfMerger(destPdf);

            if (fiches == null || fiches.isEmpty()) {
                // Si aucune fiche, retourner un PDF court indiquant l'absence de données
                Document document = new Document(destPdf, PageSize.A4);
                PdfFont normalFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
                document.add(new Paragraph("Aucune prestation enregistrée pour cette période.")
                        .setFont(normalFont)
                        .setFontSize(12)
                        .setFontColor(TEXT_COLOR)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginTop(200));
                document.close();
                return outputStream.toByteArray();
            }

            // Grouper les fiches par prestataire
            java.util.Map<String, List<FichePrestation>> byPrestataire = fiches.stream()
                    .filter(f -> f.getNomPrestataire() != null)
                    .collect(Collectors.groupingBy(FichePrestation::getNomPrestataire));

            for (java.util.Map.Entry<String, List<FichePrestation>> entry : byPrestataire.entrySet()) {
                String prestataire = entry.getKey();
                List<FichePrestation> fichesForPrest = entry.getValue();

                // Générer le PDF de la fiche prestataire (déjà formaté)
                byte[] prestPdf = generatePrestataireServiceSheetPdf(lot, annee, trimestre, prestataire, fichesForPrest);

                // Fusionner les pages de ce PDF dans le document de destination
                try (java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(prestPdf);
                     PdfDocument srcPdf = new PdfDocument(new com.itextpdf.kernel.pdf.PdfReader(bais))) {
                    merger.merge(srcPdf, 1, srcPdf.getNumberOfPages());
                }
            }

            // Fermer le document final
            destPdf.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF de fiche globale (merge prestataires)", e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    // ============================
    // 3. FICHE PAR PRESTATAIRE
    // ============================
    @Transactional(readOnly = true)
    public byte[] generatePrestataireServiceSheetPdf(String lot, int annee, int trimestre, String prestataire, List<FichePrestation> fiches) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(40, 40, 40, 40);

            // Polices
            PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont italicFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            // 1. En-tête avec logo (per-service sheet: use default medium size)
            addHeader(document, boldFont, italicFont, 92);

            // Ligne de séparation
            document.add(new Paragraph("_".repeat(100))
                    .setFont(normalFont)
                    .setFontSize(6)
                    .setFontColor(DARK_BLUE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(10)
                    .setMarginBottom(20));

            // 2. Titre principal
            document.add(new Paragraph("FICHE DE PRESTATIONS PAR PRESTATAIRE")
                    .setFont(titleFont)
                    .setFontSize(18)
                    .setFontColor(DARK_BLUE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5));

            document.add(new Paragraph(prestataire)
                    .setFont(boldFont)
                    .setFontSize(16)
                    .setFontColor(DARK_BLUE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5));

            document.add(new Paragraph("Trimestre " + trimestre + " " + annee + " - Lot: " + lot)
                    .setFont(italicFont)
                    .setFontSize(12)
                    .setFontColor(TEXT_COLOR)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(25));

            // 3. Informations du prestataire
            addPrestataireInfoSection(document, prestataire, lot, annee, trimestre, fiches, normalFont, boldFont);

            // 4. Tableau des prestations
            addSectionTitle(document, "PRESTATIONS RÉALISÉES", boldFont);

            if (fiches == null || fiches.isEmpty()) {
                document.add(new Paragraph("Aucune prestation réalisée par ce prestataire pour cette période.")
                        .setFont(normalFont)
                        .setFontSize(12)
                        .setFontColor(TEXT_COLOR)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(20)
                        .setBackgroundColor(LIGHT_GRAY)
                        .setBorder(new SolidBorder(MEDIUM_GRAY, 1))
                        .setBorderRadius(new BorderRadius(5)));
            } else {
                addPrestatairePrestationsTable(document, fiches, lot, normalFont, boldFont);
            }

            // 5. Pied de page
            addFooter(document, normalFont);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF de fiche prestataire", e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    // ============================
    // 4. FICHE OFFICIELLE DE PRESTATION
    // ============================
    @Transactional(readOnly = true)
    public byte[] generatePrestationPdf(Prestation prestation) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                        // Polices
                        PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
                        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
                        PdfFont normalFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
                        PdfFont italicFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

                        // Création du document (writer + pdfDoc + document)
                        PdfWriter writer = new PdfWriter(outputStream);
                        PdfDocument pdfDoc = new PdfDocument(writer);
                        Document document = new Document(pdfDoc, PageSize.A4);
                        document.setMargins(40, 40, 40, 40);

                        // 1. En-tête avec logo (prestation document: smaller logo)
                        addHeader(document, boldFont, italicFont, 60);

            // Ligne de séparation
            document.add(new Paragraph("_".repeat(100))
                    .setFont(normalFont)
                    .setFontSize(6)
                    .setFontColor(DARK_BLUE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(10)
                    .setMarginBottom(20));

            // 2. Titre principal
            document.add(new Paragraph("FICHE OFFICIELLE DE PRESTATION")
                    .setFont(titleFont)
                    .setFontSize(18)
                    .setFontColor(DARK_BLUE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(25));

            // Date de génération
            String currentDate = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            document.add(new Paragraph("Généré le " + currentDate + " à Ouagadougou")
                    .setFont(italicFont)
                    .setFontSize(10)
                    .setFontColor(DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(25));

            // 3. Section INFORMATIONS DU PRESTATAIRE
            addSectionTitle(document, "INFORMATIONS DU PRESTATAIRE", boldFont);
            addPrestataireInfo(document, prestation, normalFont);

            // 4. Section INFORMATIONS DU RESPONSABLE
            addSectionTitle(document, "INFORMATIONS DU RESPONSABLE", boldFont);
            addResponsableInfo(document, prestation, normalFont);

            // 5. Section INFORMATIONS DE LA STRUCTURE
            addSectionTitle(document, "INFORMATIONS DE LA STRUCTURE", boldFont);
            addStructureInfo(document, prestation, normalFont);

            // 6. Section DÉTAILS DE L'INTERVENTION
            addSectionTitle(document, "DÉTAILS DE L'INTERVENTION", boldFont);
            addInterventionDetails(document, prestation, normalFont);

            // 7. Section SIGNATURES
            addSectionTitle(document, "VALIDATION ET SIGNATURES", boldFont);
            addValidationSignatures(document, prestation, boldFont, normalFont);

            // 8. Pied de page
            addFooter(document, normalFont);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF de prestation", e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    // ============================
    // MÉTHODES COMMUNES
    // ============================

    

    /**
     * Titre de section
     */
    private void addSectionTitle(Document document, String title, PdfFont boldFont) {
        document.add(new Paragraph(title)
                .setFont(boldFont)
                .setFontSize(13)
                .setFontColor(DARK_BLUE)
                .setMarginTop(20)
                .setMarginBottom(10)
                .setBorderBottom(new SolidBorder(DARK_BLUE, 1))
                .setPaddingBottom(5));
    }

        // Helper to add a labelled row (label + value) into a two-column table
        private void addInfoRow(Table table, String label, String value, PdfFont normalFont) {
                try {
                        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

                        Cell labelCell = new Cell()
                                        .add(new Paragraph(label).setFont(bold).setFontSize(10).setFontColor(DARK_BLUE))
                                        .setBackgroundColor(LIGHT_GRAY)
                                        .setPadding(6)
                                        .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));

                        Cell valueCell = new Cell()
                                        .add(new Paragraph(value != null ? value : "N/A").setFont(normalFont).setFontSize(10))
                                        .setBackgroundColor(WHITE)
                                        .setPadding(6)
                                        .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));

                        table.addCell(labelCell);
                        table.addCell(valueCell);
                } catch (IOException e) {
                        log.warn("Erreur lors de la création d'une ligne d'information", e);
                }
        }

        private void addGeneralInfoSection(Document document, String lot, int annee, int trimestre,
                                                                           List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont) {
                // Reuse existing helper that builds the info table
                addDocumentInfo(document, lot, annee, trimestre, fiches, normalFont, boldFont);
        }

        private void addFicheInterventionDetails(Document document, FichePrestation fiche, PdfFont normalFont) {
                Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                                .setWidth(UnitValue.createPercentValue(100))
                                .setMarginBottom(15);

                String dateStr = fiche.getDateRealisation() != null ?
                                fiche.getDateRealisation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";
                addInfoRow(table, "Date de réalisation", dateStr, normalFont);

                addInfoRow(table, "Quantité", fiche.getQuantite() != null ? fiche.getQuantite().toString() : "0", normalFont);

                // Montant approximatif if not present
                double montant = fiche.getQuantite() != null ? fiche.getQuantite() * 50000 : 0;
                addInfoRow(table, "Montant estimé", String.format("%.0f FCFA", montant), normalFont);

                document.add(table);
        }

        private void addObservations(Document document, String commentaire, PdfFont normalFont) {
                if (commentaire == null || commentaire.trim().isEmpty()) return;
                Paragraph p = new Paragraph(commentaire)
                                .setFont(normalFont)
                                .setFontSize(10)
                                .setFontColor(TEXT_COLOR)
                                .setMarginBottom(10);
                document.add(p);
        }

    /**
     * Pied de page commun
     */
    private void addFooter(Document document, PdfFont normalFont) {
        document.add(new Paragraph("_" .repeat(100))
                .setFont(normalFont)
                .setFontSize(6)
                .setFontColor(DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30)
                .setMarginBottom(10));

        document.add(new Paragraph("Document généré automatiquement par le système DGSI Maintenance")
                .setFont(normalFont)
                .setFontSize(9)
                .setFontColor(DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5));

        document.add(new Paragraph("Confidentiel - Ministère de l'Économie et des Finances")
                .setFont(normalFont)
                .setFontSize(9)
                .setFontColor(DARK_BLUE)
                .setTextAlignment(TextAlignment.CENTER));
    }

    // ============================
    // MÉTHODES POUR FICHE INDIVIDUELLE
    // ============================

    private void addFicheGeneralInfo(Document document, FichePrestation fiche, PdfFont normalFont) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addInfoRow(table, "ID Fiche", fiche.getId().toString(), normalFont);
        addInfoRow(table, "ID Prestation", fiche.getIdPrestation() != null ? fiche.getIdPrestation() : "N/A", normalFont);
        addInfoRow(table, "Nom de l'item", fiche.getNomItem() != null ? fiche.getNomItem() : "N/A", normalFont);
        addInfoRow(table, "Items couverts", fiche.getItemsCouverts() != null ? fiche.getItemsCouverts() : "N/A", normalFont);
        addInfoRow(table, "Statut", fiche.getStatut() != null ? fiche.getStatut().toString() : "N/A", normalFont);
        addInfoRow(table, "Statut d'intervention", fiche.getStatutIntervention() != null ? fiche.getStatutIntervention() : "N/A", normalFont);

                document.add(table);
    }

    private void addFichePrestataireInfo(Document document, FichePrestation fiche, PdfFont normalFont) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addInfoRow(table, "Nom du prestataire", fiche.getNomPrestataire() != null ? fiche.getNomPrestataire() : "N/A", normalFont);

                document.add(table);
        }

    private void addHeader(Document document, PdfFont boldFont, PdfFont italicFont, int logoSize) {
        try {
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{35, 30, 35}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(15);

            // Left column (ministry info) - compact spacing
            Cell leftCell = new Cell()
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setVerticalAlignment(VerticalAlignment.TOP)
                    .setPadding(4);

            leftCell.add(new Paragraph("MINISTERE DE L'ECONOMIE")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setFontColor(BLACK)
                    .setMarginBottom(2));
            leftCell.add(new Paragraph("------------------------")
                    .setFont(italicFont)
                    .setFontSize(9)
                    .setFontColor(DARK_GRAY)
                    .setMarginBottom(2)
                    .setTextAlignment(TextAlignment.CENTER));
            leftCell.add(new Paragraph("SECRETARIAT GENERAL")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setFontColor(BLACK)
                    .setMarginBottom(2));
            leftCell.add(new Paragraph("------------------------")
                    .setFont(italicFont)
                    .setFontSize(9)
                    .setFontColor(DARK_GRAY)
                    .setMarginBottom(2)
                    .setTextAlignment(TextAlignment.CENTER));
            leftCell.add(new Paragraph("DIRECTION GENERALE DES SYSTEMES D'INFORMATION")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setFontColor(BLACK)
                    .setMarginBottom(2));
            leftCell.add(new Paragraph("------------------------")
                    .setFont(italicFont)
                    .setFontSize(9)
                    .setFontColor(DARK_GRAY)
                    .setMarginBottom(2)
                    .setTextAlignment(TextAlignment.CENTER));
            leftCell.add(new Paragraph("DIRECTION DES RESEAUX ET SYSTEMES")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setFontColor(BLACK));

            // Center column - circular logo of requested size
            Cell centerCell = new Cell()
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setVerticalAlignment(VerticalAlignment.TOP)
                    .setPadding(4);

            try {
                ClassPathResource logoResource = new ClassPathResource("static/assets/logoFinal.png");
                if (logoResource.exists()) {
                    BufferedImage original = ImageIO.read(logoResource.getInputStream());
                    int size = Math.max(32, logoSize);
                    BufferedImage circ = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
                    Graphics2D g2 = circ.createGraphics();
                    try {
                        g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                        g2.setClip(new Ellipse2D.Float(0, 0, size, size));
                        g2.drawImage(original, 0, 0, size, size, null);
                    } finally {
                        g2.dispose();
                    }
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ImageIO.write(circ, "PNG", baos);
                    ImageData imageData = ImageDataFactory.create(baos.toByteArray());
                    Image logoImage = new Image(imageData);
                    logoImage.setWidth(size);
                    logoImage.setHeight(size);
                    logoImage.setAutoScale(false);
                    logoImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
                    centerCell.add(logoImage);
                } else {
                    centerCell.add(new Paragraph("BURKINA FASO")
                            .setFont(boldFont)
                            .setFontSize(14)
                            .setFontColor(BLACK)
                            .setTextAlignment(TextAlignment.CENTER));
                }
            } catch (IOException e) {
                log.warn("Impossible de charger le logo", e);
                centerCell.add(new Paragraph("BURKINA FASO")
                        .setFont(boldFont)
                        .setFontSize(14)
                        .setFontColor(BLACK)
                        .setTextAlignment(TextAlignment.CENTER));
            }

            // Right column - country, motto, separator, date
            Cell rightCell = new Cell()
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setVerticalAlignment(VerticalAlignment.TOP)
                    .setPadding(4);

            rightCell.add(new Paragraph("BURKINA FASO")
                    .setFont(boldFont)
                    .setFontSize(14)
                    .setFontColor(BLACK)
                    .setMarginBottom(4)
                    .setTextAlignment(TextAlignment.CENTER));

            rightCell.add(new Paragraph("La Patrie ou la Mort, nous\\nVaincrons")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setFontColor(BLACK)
                    .setMarginBottom(4)
                    .setTextAlignment(TextAlignment.CENTER));

            rightCell.add(new Paragraph("------------------------")
                    .setFont(italicFont)
                    .setFontSize(10)
                    .setFontColor(DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(4));

            String currentDate = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            rightCell.add(new Paragraph("Généré à Ouaga le " + currentDate)
                    .setFont(italicFont)
                    .setFontSize(10)
                    .setFontColor(DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            headerTable.addCell(leftCell);
            headerTable.addCell(centerCell);
            headerTable.addCell(rightCell);

            document.add(headerTable);

        } catch (Exception e) {
            log.error("Erreur lors de la création de l'en-tête", e);
        }
    }

    private void addDetailedPrestationsSection(Document document, String lot, List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{10,20,25,10,8,12,15}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        Cell headerCell = new Cell(1, 7)
                .add(new Paragraph("DÉTAILS DES PRESTATIONS")
                        .setFont(boldFont)
                        .setFontSize(12)
                        .setFontColor(WHITE))
                .setBackgroundColor(DARK_BLUE)
                .setPadding(8)
                .setBorder(new SolidBorder(DARK_BLUE, 1));
        table.addCell(headerCell);

        // En-têtes des colonnes
        String[] headers = {"Fiche", "Prestataire", "Item/Service", "Date", "Qté", "Montant", "Statut"};
        for (String header : headers) {
            Cell headerCellCol = new Cell()
                    .add(new Paragraph(header)
                            .setFont(boldFont)
                            .setFontSize(10)
                            .setFontColor(WHITE))
                    .setBackgroundColor(DARK_BLUE)
                    .setPadding(6)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBorder(new SolidBorder(DARK_BLUE, 1));
            table.addCell(headerCellCol);
        }


        List<FichePrestation> fichesSorted = fiches.stream()
                .sorted((f1, f2) -> {
                    if (f1.getDateRealisation() != null && f2.getDateRealisation() != null) {
                        return f2.getDateRealisation().compareTo(f1.getDateRealisation());
                    }
                    return 0;
                })
                .collect(Collectors.toList());

        double totalMontant = 0;
        boolean alternateRow = false;
        int rowNumber = 1;

        for (FichePrestation fiche : fichesSorted) {
            DeviceRgb rowBg = alternateRow ? LIGHT_GRAY : WHITE;
            alternateRow = !alternateRow;

            // Fiche
            table.addCell(createTableCell(fiche.getIdPrestation() != null ? fiche.getIdPrestation() : "N/A",
                    normalFont, rowBg, TextAlignment.LEFT));

            // Prestataire
            table.addCell(createTableCell(fiche.getNomPrestataire() != null ? fiche.getNomPrestataire() : "N/A",
                    normalFont, rowBg, TextAlignment.LEFT));

            // Item/Service avec numérotation et retour à la ligne
            String itemsText = getFormattedItemsText(fiche, rowNumber);
            table.addCell(createTableCell(itemsText, normalFont, rowBg, TextAlignment.LEFT));
            rowNumber++;
            // Date
            String dateStr = fiche.getDateRealisation() != null ?
                    fiche.getDateRealisation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";
            table.addCell(createTableCell(dateStr, normalFont, rowBg, TextAlignment.CENTER));

            // Quantité
            String qteStr = fiche.getQuantite() != null ? fiche.getQuantite().toString() : "0";
            table.addCell(createTableCell(qteStr, normalFont, rowBg, TextAlignment.CENTER));

            // Récupérer tous les items de la fiche avec leurs prix
            List<java.util.Map<String, Object>> items = new ArrayList<>();
            String itemsCouverts = fiche.getItemsCouverts();
            String nomItem = fiche.getNomItem();
            
            // Try to parse itemsCouverts as JSON array first
            if (itemsCouverts != null && !itemsCouverts.trim().isEmpty()) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.List<java.util.Map<String, Object>> parsed = mapper.readValue(itemsCouverts, 
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {});
                    for (java.util.Map<String, Object> item : parsed) {
                        if (item != null && item.containsKey("nom")) {
                            items.add(item);
                        }
                    }
                } catch (Exception e) {
                    // If JSON parsing fails, treat as comma-separated string
                    String[] splitItems = itemsCouverts.split(",");
                    for (String item : splitItems) {
                        String trimmed = item.trim();
                        if (!trimmed.isEmpty()) {
                            java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                            itemMap.put("nom", trimmed);
                            items.add(itemMap);
                        }
                    }
                }
            }
            
            // If no items found in itemsCouverts, use nomItem
            if (items.isEmpty() && nomItem != null && !nomItem.trim().isEmpty()) {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("nom", nomItem.trim());
                items.add(itemMap);
            }
            
            // If still no items, use default
            if (items.isEmpty()) {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("nom", "N/A");
                items.add(itemMap);
            }
            
            int quantite = fiche.getQuantite() != null ? fiche.getQuantite() : 0;
            double montant = 0;
            
            // Calculer le montant pour chaque item de la fiche
            for (java.util.Map<String, Object> item : items) {
                String itemNom = (String) item.get("nom");
                Number itemPrix = (Number) item.get("prix");
                
                double prixUnitaire;
                if (itemPrix != null) {
                    prixUnitaire = itemPrix.doubleValue();
                } else if (fiche.getPrixUnitaire() != null) {
                    prixUnitaire = fiche.getPrixUnitaire();
                } else {
                    // Récupérer le prix réel de l'item depuis la base de données en fonction du lot
                    Item realItem = itemService.getItemByNomItemAndLot(itemNom, lot);
                    if (realItem != null && realItem.getPrix() != null) {
                        prixUnitaire = realItem.getPrix().doubleValue();
                    } else {
                        // Si prix unitaire non défini et item non trouvé, utiliser un prix par défaut (50000 FCFA)
                        prixUnitaire = 50000;
                    }
                }
                
                montant += quantite * prixUnitaire;
            }
            
            totalMontant += montant;
            table.addCell(createTableCell(String.format("%.0f FCFA", montant),
                    normalFont, rowBg, TextAlignment.RIGHT));

            // Statut avec couleur
            String statut = fiche.getStatut() != null ? fiche.getStatut().toString() : "N/A";
            DeviceRgb statutColor;
            if ("VALIDE".equals(statut)) {
                statutColor = SUCCESS_COLOR;
            } else if ("REJETE".equals(statut)) {
                statutColor = ERROR_COLOR;
            } else {
                statutColor = DARK_GRAY;
            }

            Cell statutCell = new Cell()
                    .add(new Paragraph(statut)
                            .setFont(boldFont)
                            .setFontSize(9)
                            .setFontColor(statutColor))
                    .setBackgroundColor(rowBg)
                    .setPadding(6)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));
            table.addCell(statutCell);
        }

        // Ligne de total général
        Cell totalLabelCell = new Cell(1, 5)
                .add(new Paragraph("TOTAL GÉNÉRAL")
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        Cell totalAmountCell = new Cell()
                .add(new Paragraph(String.format("%.0f FCFA", totalMontant))
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        Cell totalStatusCell = new Cell()
                .add(new Paragraph("-")
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        table.addCell(totalLabelCell);
        table.addCell(totalAmountCell);
        table.addCell(totalStatusCell);

        document.add(table);
    }

    private Cell createInfoRow(String label, String value, PdfFont normalFont, PdfFont boldFont) {
        // Cellule pour le libellé
        Cell labelCell = new Cell()
                .add(new Paragraph(label)
                        .setFont(boldFont)
                        .setFontSize(10)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(6)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));

        // Cellule pour la valeur
        Cell valueCell = new Cell()
                .add(new Paragraph(value)
                        .setFont(normalFont)
                        .setFontSize(10)
                        .setFontColor(BLACK))
                .setBackgroundColor(WHITE)
                .setPadding(6)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));

        // Créer une ligne avec deux cellules
        Table rowTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100));

        rowTable.addCell(labelCell);
        rowTable.addCell(valueCell);

        return new Cell()
                .add(rowTable)
                .setBorder(null)
                .setPadding(0);
    }

    private void addDocumentInfo(Document document, String lot, int annee, int trimestre,
                               List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont) {
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        addInfoRow(infoTable, "Lot", lot, normalFont);
        addInfoRow(infoTable, "Année", String.valueOf(annee), normalFont);
        addInfoRow(infoTable, "Trimestre", "T" + trimestre, normalFont);

        if (fiches != null) {
            addInfoRow(infoTable, "Nombre total de fiches", String.valueOf(fiches.size()), normalFont);

            long prestatairesUniques = fiches.stream()
                    .map(FichePrestation::getNomPrestataire)
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .count();
            addInfoRow(infoTable, "Nombre de prestataires", String.valueOf(prestatairesUniques), normalFont);
        }

        // Date de génération
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy à HH:mm");
        addInfoRow(infoTable, "Date de génération", sdf.format(new java.util.Date()), normalFont);

        document.add(infoTable);
    }

    private void addGlobalSummaryInfo(Document document, String lot, List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont) {
        Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        // Calcul des statistiques
        int totalFiches = fiches.size();
        int validees = (int) fiches.stream().filter(f -> "VALIDE".equals(f.getStatut() != null ? f.getStatut().toString() : "")).count();
        int rejetees = (int) fiches.stream().filter(f -> "REJETE".equals(f.getStatut() != null ? f.getStatut().toString() : "")).count();
        int enAttente = totalFiches - validees - rejetees;

        double montantTotal = 0;
        for (FichePrestation fiche : fiches) {
            // Calculer le montant de la fiche
            // Récupérer les items de la fiche
            List<Map<String, Object>> items = new ArrayList<>();
            
            // Vérifier les items dans itemsCouverts (JSON ou string séparé par des virgules)
            if (fiche.getItemsCouverts() != null && !fiche.getItemsCouverts().isEmpty()) {
                try {
                    // Essayer de parser itemsCouverts comme JSON
                    com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    List<Map<String, Object>> parsedItems = objectMapper.readValue(fiche.getItemsCouverts(), List.class);
                    items.addAll(parsedItems);
                } catch (Exception e) {
                    // Si JSON parsing fails, treat as comma-separated string
                    String[] splitItems = fiche.getItemsCouverts().split(",");
                    for (String item : splitItems) {
                        String trimmed = item.trim();
                        if (!trimmed.isEmpty()) {
                            Map<String, Object> itemMap = new HashMap<>();
                            itemMap.put("nom", trimmed);
                            items.add(itemMap);
                        }
                    }
                }
            }

            // Si no items found in itemsCouverts, use nomItem
            if (items.isEmpty() && fiche.getNomItem() != null && !fiche.getNomItem().trim().isEmpty()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("nom", fiche.getNomItem().trim());
                items.add(itemMap);
            }

            // If still no items, use default
            if (items.isEmpty()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("nom", "N/A");
                items.add(itemMap);
            }

            int quantite = fiche.getQuantite() != null ? fiche.getQuantite() : 0;
            
            // Calculer le montant pour chaque item de la fiche
            for (Map<String, Object> item : items) {
                String itemNom = (String) item.get("nom");
                Number itemPrix = (Number) item.get("prix");
                
                // Calculer le prix unitaire
                double prixUnitaire;
                if (itemPrix != null) {
                    prixUnitaire = itemPrix.doubleValue();
                } else if (fiche.getPrixUnitaire() != null) {
                    prixUnitaire = fiche.getPrixUnitaire();
                } else {
                    // Récupérer le prix réel de l'item depuis la base de données
                    Item realItem = itemService.getItemByNomItemAndLot(itemNom, lot);
                    if (realItem != null && realItem.getPrix() != null) {
                        prixUnitaire = realItem.getPrix().doubleValue();
                    } else {
                        // Si prix unitaire non défini et item non trouvé, utiliser un prix par défaut (50000 FCFA)
                        prixUnitaire = 50000;
                    }
                }
                
                // Ajouter au montant total
                montantTotal += quantite * prixUnitaire;
            }
        }

        long prestatairesUniques = fiches.stream()
                .map(FichePrestation::getNomPrestataire)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();

        // En-tête du tableau
        Cell headerCell = new Cell(1, 2)
                .add(new Paragraph("DÉTAIL DES PRESTATIONS")
                        .setFont(boldFont)
                        .setFontSize(12)
                        .setFontColor(WHITE))
                .setBackgroundColor(DARK_BLUE)
                .setPadding(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(DARK_BLUE, 1));
        summaryTable.addCell(headerCell);

        // Ligne Total des fiches
        summaryTable.addCell(createSummaryRow("Total des fiches", String.valueOf(totalFiches), normalFont, boldFont));

        // Ligne Fiches validées
        summaryTable.addCell(createSummaryRow("Fiches validées", String.valueOf(validees), normalFont, boldFont));

        // Ligne Fiches rejetées
        summaryTable.addCell(createSummaryRow("Fiches rejetées", String.valueOf(rejetees), normalFont, boldFont));

        // Ligne Fiches en attente
        summaryTable.addCell(createSummaryRow("Fiches en attente", String.valueOf(enAttente), normalFont, boldFont));

        // Ligne Montant total estimé
        summaryTable.addCell(createSummaryRow("Montant total estimé", String.format("%.0f FCFA", montantTotal), normalFont, boldFont));

        // Ligne Nombre de prestataires
        summaryTable.addCell(createSummaryRow("Nombre de prestataires", String.valueOf(prestatairesUniques), normalFont, boldFont));

        document.add(summaryTable);
    }

    private Cell createSummaryRow(String label, String value, PdfFont normalFont, PdfFont boldFont) {
        // Cellule pour le libellé
        Cell labelCell = new Cell()
                .add(new Paragraph(label)
                        .setFont(boldFont)
                        .setFontSize(10)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(6)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));

        // Cellule pour la valeur
        Cell valueCell = new Cell()
                .add(new Paragraph(value)
                        .setFont(normalFont)
                        .setFontSize(10)
                        .setFontColor(BLACK))
                .setBackgroundColor(WHITE)
                .setPadding(6)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));

        // Créer une ligne avec deux cellules
        Table rowTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100));

        rowTable.addCell(labelCell);
        rowTable.addCell(valueCell);

        return new Cell()
                .add(rowTable)
                .setBorder(null)
                .setPadding(0);
    }

    private void addGlobalPrestationsTable(Document document, List<FichePrestation> fiches, String lot, PdfFont normalFont, PdfFont boldFont) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{10, 20, 25, 15, 10, 10, 10}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(30);

        // En-têtes du tableau
        String[] headers = {"N° Fiche", "Prestataire", "Item/Service", "Date", "Qté", "Montant", "Statut"};
        for (String header : headers) {
            Cell headerCell = new Cell()
                    .add(new Paragraph(header)
                            .setFont(boldFont)
                            .setFontSize(10)
                            .setFontColor(WHITE))
                    .setBackgroundColor(DARK_BLUE)
                    .setPadding(8)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBorder(new SolidBorder(DARK_BLUE, 1));
            table.addCell(headerCell);
        }

        // Trier par date (plus récente en premier)
        List<FichePrestation> fichesSorted = fiches.stream()
                .sorted((f1, f2) -> {
                    if (f1.getDateRealisation() != null && f2.getDateRealisation() != null) {
                        return f2.getDateRealisation().compareTo(f1.getDateRealisation());
                    }
                    return 0;
                })
                .collect(Collectors.toList());

        double totalMontant = 0;
        boolean alternateRow = false;

        for (FichePrestation fiche : fichesSorted) {
            DeviceRgb rowBg = alternateRow ? LIGHT_GRAY : WHITE;
            alternateRow = !alternateRow;

            // N° Fiche
            table.addCell(createTableCell(fiche.getIdPrestation() != null ? fiche.getIdPrestation() : "N/A",
                    normalFont, rowBg, TextAlignment.LEFT));

            // Prestataire
            table.addCell(createTableCell(fiche.getNomPrestataire() != null ? fiche.getNomPrestataire() : "N/A",
                    normalFont, rowBg, TextAlignment.LEFT));

            // Item/Service
            table.addCell(createTableCell(fiche.getNomItem() != null ? fiche.getNomItem() : "N/A",
                    normalFont, rowBg, TextAlignment.LEFT));

            // Date
            String dateStr = fiche.getDateRealisation() != null ?
                    fiche.getDateRealisation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";
            table.addCell(createTableCell(dateStr, normalFont, rowBg, TextAlignment.CENTER));

            // Quantité
            String qteStr = fiche.getQuantite() != null ? fiche.getQuantite().toString() : "0";
            table.addCell(createTableCell(qteStr, normalFont, rowBg, TextAlignment.CENTER));

            // Récupérer tous les items de la fiche avec leurs prix
            List<java.util.Map<String, Object>> items = new ArrayList<>();
            String itemsCouverts = fiche.getItemsCouverts();
            String nomItem = fiche.getNomItem();
            
            // Try to parse itemsCouverts as JSON array first
            if (itemsCouverts != null && !itemsCouverts.trim().isEmpty()) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.List<java.util.Map<String, Object>> parsed = mapper.readValue(itemsCouverts, 
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {});
                    for (java.util.Map<String, Object> item : parsed) {
                        if (item != null && item.containsKey("nom")) {
                            items.add(item);
                        }
                    }
                } catch (Exception e) {
                    // If JSON parsing fails, treat as comma-separated string
                    String[] splitItems = itemsCouverts.split(",");
                    for (String item : splitItems) {
                        String trimmed = item.trim();
                        if (!trimmed.isEmpty()) {
                            java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                            itemMap.put("nom", trimmed);
                            items.add(itemMap);
                        }
                    }
                }
            }
            
            // If no items found in itemsCouverts, use nomItem
            if (items.isEmpty() && nomItem != null && !nomItem.trim().isEmpty()) {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("nom", nomItem.trim());
                items.add(itemMap);
            }
            
            // If still no items, use default
            if (items.isEmpty()) {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("nom", "N/A");
                items.add(itemMap);
            }
            
            int quantite = fiche.getQuantite() != null ? fiche.getQuantite() : 0;
            double montant = 0;
            
            // Calculer le montant pour chaque item de la fiche
            for (java.util.Map<String, Object> item : items) {
                String itemNom = (String) item.get("nom");
                Number itemPrix = (Number) item.get("prix");
                
                double prixUnitaire;
                if (itemPrix != null) {
                    prixUnitaire = itemPrix.doubleValue();
                } else if (fiche.getPrixUnitaire() != null) {
                    prixUnitaire = fiche.getPrixUnitaire();
                } else {
                    // Récupérer le prix réel de l'item depuis la base de données en fonction du lot
                    Item realItem = itemService.getItemByNomItemAndLot(itemNom, lot);
                    if (realItem != null && realItem.getPrix() != null) {
                        prixUnitaire = realItem.getPrix().doubleValue();
                    } else {
                        // Si prix unitaire non défini et item non trouvé, utiliser un prix par défaut (50000 FCFA)
                        prixUnitaire = 50000;
                    }
                }
                
                montant += quantite * prixUnitaire;
            }
            
            totalMontant += montant;
            table.addCell(createTableCell(String.format("%.0f FCFA", montant),
                    normalFont, rowBg, TextAlignment.RIGHT));

            // Statut avec couleur
            String statut = fiche.getStatut() != null ? fiche.getStatut().toString() : "N/A";
            DeviceRgb statutColor;
            if ("VALIDE".equals(statut)) {
                statutColor = SUCCESS_COLOR;
            } else if ("REJETE".equals(statut)) {
                statutColor = ERROR_COLOR;
            } else {
                statutColor = DARK_GRAY;
            }

            Cell statutCell = new Cell()
                    .add(new Paragraph(statut)
                            .setFont(boldFont)
                            .setFontSize(9)
                            .setFontColor(statutColor))
                    .setBackgroundColor(rowBg)
                    .setPadding(6)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));
            table.addCell(statutCell);
        }

        // Ligne de total
        Cell totalLabelCell = new Cell(1, 5)
                .add(new Paragraph("TOTAL GÉNÉRAL")
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        Cell totalAmountCell = new Cell()
                .add(new Paragraph(String.format("%.0f FCFA", totalMontant))
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        Cell totalStatusCell = new Cell()
                .add(new Paragraph("-")
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        table.addCell(totalLabelCell);
        table.addCell(totalAmountCell);
        table.addCell(totalStatusCell);

        document.add(table);
    }

    // ============================
    // MÉTHODES POUR FICHE PAR PRESTATAIRE
    // ============================

    private void addPrestataireInfoSection(Document document, String prestataire, String lot, int annee, int trimestre,
                                          List<FichePrestation> fiches, PdfFont normalFont, PdfFont boldFont) {

        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        addInfoRow(infoTable, "Nom du prestataire", prestataire, normalFont);
        addInfoRow(infoTable, "Lot assigné", lot, normalFont);
        addInfoRow(infoTable, "Année", String.valueOf(annee), normalFont);
        addInfoRow(infoTable, "Trimestre", "T" + trimestre, normalFont);

        if (fiches != null) {
            addInfoRow(infoTable, "Nombre de fiches", String.valueOf(fiches.size()), normalFont);

            int validees = (int) fiches.stream().filter(f -> "VALIDE".equals(f.getStatut() != null ? f.getStatut().toString() : "")).count();
            addInfoRow(infoTable, "Fiches validées", String.valueOf(validees), normalFont);

             // Calculer le montant total en utilisant les prix réels des items
             double totalMontant = 0;
             for (FichePrestation fiche : fiches) {
                 int quantite = fiche.getQuantite() != null ? fiche.getQuantite() : 0;
                 
                 // Récupérer les items de la fiche
                 List<java.util.Map<String, Object>> items = new ArrayList<>();
                 String itemsCouverts = fiche.getItemsCouverts();
                 String nomItem = fiche.getNomItem();
                 
                 // Try to parse itemsCouverts as JSON array first
                 if (itemsCouverts != null && !itemsCouverts.trim().isEmpty()) {
                     try {
                         com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                         java.util.List<java.util.Map<String, Object>> parsed = mapper.readValue(itemsCouverts, 
                             new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {});
                         for (java.util.Map<String, Object> item : parsed) {
                             if (item != null && item.containsKey("nom")) {
                                 items.add(item);
                             }
                         }
                     } catch (Exception e) {
                         // If JSON parsing fails, treat as comma-separated string
                         String[] splitItems = itemsCouverts.split(",");
                         for (String item : splitItems) {
                             String trimmed = item.trim();
                             if (!trimmed.isEmpty()) {
                                 java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                                 itemMap.put("nom", trimmed);
                                 items.add(itemMap);
                             }
                         }
                     }
                 }
                 
                 // If no items found in itemsCouverts, use nomItem
                 if (items.isEmpty() && nomItem != null && !nomItem.trim().isEmpty()) {
                     java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                     itemMap.put("nom", nomItem.trim());
                     items.add(itemMap);
                 }
                 
                 // Calculer le montant pour chaque item de la fiche
                 for (java.util.Map<String, Object> item : items) {
                     String itemNom = (String) item.get("nom");
                     Number itemPrix = (Number) item.get("prix");
                     
                     double prixUnitaire;
                     if (itemPrix != null) {
                         prixUnitaire = itemPrix.doubleValue();
                     } else if (fiche.getPrixUnitaire() != null) {
                         prixUnitaire = fiche.getPrixUnitaire();
                     } else {
                             // Récupérer le prix réel de l'item depuis la base de données en fonction du lot
                             Item realItem = itemService.getItemByNomItemAndLot(itemNom, lot);
                             if (realItem != null && realItem.getPrix() != null) {
                                 prixUnitaire = realItem.getPrix().doubleValue();
                             } else {
                                 // Si prix unitaire non défini et item non trouvé, utiliser un prix par défaut (50000 FCFA)
                                 prixUnitaire = 50000;
                             }
                     }
                     
                     totalMontant += quantite * prixUnitaire;
                 }
             }
            addInfoRow(infoTable, "Montant total", String.format("%.0f FCFA", totalMontant), normalFont);
        }

        document.add(infoTable);
    }

    private void addPrestatairePrestationsTable(Document document, List<FichePrestation> fiches,
                                               String lot, PdfFont normalFont, PdfFont boldFont) {

        Table table = new Table(UnitValue.createPercentArray(new float[]{8, 30, 10, 12, 10, 15, 15}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(30);

        // En-têtes (7 colonnes: numéro, désignation du service, quantité réalisée, prix unitaire, date, montant total, statut)
        String[] headers = {"N°", "Désignation du service", "Quantité réalisée", "Prix unitaire", "Date", "Montant total", "Statut"};
        for (String header : headers) {
            Cell headerCell = new Cell()
                    .add(new Paragraph(header)
                            .setFont(boldFont)
                            .setFontSize(10)
                            .setFontColor(WHITE))
                    .setBackgroundColor(DARK_BLUE)
                    .setPadding(8)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBorder(new SolidBorder(DARK_BLUE, 1));
            table.addCell(headerCell);
        }

        // Trier par date
        List<FichePrestation> fichesSorted = fiches.stream()
                .sorted((f1, f2) -> {
                    if (f1.getDateRealisation() != null && f2.getDateRealisation() != null) {
                        return f2.getDateRealisation().compareTo(f1.getDateRealisation());
                    }
                    return 0;
                })
                .collect(Collectors.toList());

        double totalMontant = 0;
        boolean alternateRow = false;
        int rowNumber = 1;

        for (FichePrestation fiche : fichesSorted) {
            DeviceRgb rowBg = alternateRow ? LIGHT_GRAY : WHITE;
            alternateRow = !alternateRow;

            // Récupérer tous les items de la fiche avec leurs prix
            List<java.util.Map<String, Object>> items = new ArrayList<>();
            String itemsCouverts = fiche.getItemsCouverts();
            String nomItem = fiche.getNomItem();

            // Try to parse itemsCouverts as JSON array first
            if (itemsCouverts != null && !itemsCouverts.trim().isEmpty()) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.List<java.util.Map<String, Object>> parsed = mapper.readValue(itemsCouverts, 
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {});
                    for (java.util.Map<String, Object> item : parsed) {
                        if (item != null && item.containsKey("nom")) {
                            items.add(item);
                        }
                    }
                } catch (Exception e) {
                    // If JSON parsing fails, treat as comma-separated string
                    String[] splitItems = itemsCouverts.split(",");
                    for (String item : splitItems) {
                        String trimmed = item.trim();
                        if (!trimmed.isEmpty()) {
                            java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                            itemMap.put("nom", trimmed);
                            items.add(itemMap);
                        }
                    }
                }
            }

            // If no items found in itemsCouverts, use nomItem
            if (items.isEmpty() && nomItem != null && !nomItem.trim().isEmpty()) {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("nom", nomItem.trim());
                items.add(itemMap);
            }

            // If still no items, use default
            if (items.isEmpty()) {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("nom", "N/A");
                items.add(itemMap);
            }

            // Pour chaque item, créer une ligne dans le tableau
            for (int itemIndex = 0; itemIndex < items.size(); itemIndex++) {
                java.util.Map<String, Object> item = items.get(itemIndex);
                String itemNom = (String) item.get("nom");
                Number itemPrix = (Number) item.get("prix");
                
                // N° (numéro de ligne) - seulement pour le premier item de la fiche
                if (itemIndex == 0) {
                    table.addCell(createTableCell(String.valueOf(rowNumber++),
                            normalFont, rowBg, TextAlignment.CENTER));
                } else {
                    table.addCell(createTableCell("", normalFont, rowBg, TextAlignment.CENTER));
                }

                // Désignation du service (Item/Service) avec numérotation
                String itemText = (itemIndex + 1) + "- " + itemNom;
                table.addCell(createTableCell(itemText, normalFont, rowBg, TextAlignment.LEFT));

                 // Quantité réalisée - calculer la quantité utilisée pour cet item dans la fiche courante
                 int qteUtilisee = getItemUsageCount(itemNom, fiche);
                String qteStr = String.valueOf(qteUtilisee);
                table.addCell(createTableCell(qteStr, normalFont, rowBg, TextAlignment.CENTER));

                 // Prix unitaire - utiliser le prix réel de l'item depuis la base de données (en fonction du lot)
                 String prixStr;
                 if (itemPrix != null) {
                     if (itemPrix instanceof Integer) {
                         prixStr = String.format("%d FCFA", itemPrix.intValue());
                     } else {
                         prixStr = String.format("%.0f FCFA", itemPrix.doubleValue());
                     }
                 } else if (fiche.getPrixUnitaire() != null) {
                     prixStr = String.format("%.0f FCFA", fiche.getPrixUnitaire());
                 } else {
                     // Récupérer le prix réel de l'item depuis la base de données en fonction du lot
                     Item realItem = itemService.getItemByNomItemAndLot(itemNom, lot);
                     if (realItem != null && realItem.getPrix() != null) {
                         prixStr = String.format("%.0f FCFA", realItem.getPrix().doubleValue());
                     } else {
                         // Si prix unitaire non défini et item non trouvé, utiliser un prix par défaut (50000 FCFA)
                         prixStr = String.format("%d FCFA", 50000);
                     }
                 }
                table.addCell(createTableCell(prixStr, normalFont, rowBg, TextAlignment.RIGHT));

                // Date
                String dateStr = fiche.getDateRealisation() != null ?
                        fiche.getDateRealisation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";
                table.addCell(createTableCell(dateStr, normalFont, rowBg, TextAlignment.CENTER));

                 // Montant total - utiliser le prix réel de l'item depuis la base de données (en fonction du lot)
                 double montant;
                 if (fiche.getMontantTotal() != null) {
                     // Si montant total de la fiche est défini, diviser par le nombre d'items
                     montant = fiche.getMontantTotal() / items.size();
                 } else if (qteUtilisee > 0 && itemPrix != null) {
                     montant = qteUtilisee * itemPrix.doubleValue();
                 } else if (qteUtilisee > 0 && fiche.getPrixUnitaire() != null) {
                     montant = qteUtilisee * fiche.getPrixUnitaire();
                 } else if (qteUtilisee > 0) {
                     // Récupérer le prix réel de l'item depuis la base de données en fonction du lot
                     Item realItem = itemService.getItemByNomItemAndLot(itemNom, lot);
                     if (realItem != null && realItem.getPrix() != null) {
                         montant = qteUtilisee * realItem.getPrix().doubleValue();
                     } else {
                         // Si prix unitaire non défini et item non trouvé, utiliser un prix par défaut (50000 FCFA)
                         montant = qteUtilisee * 50000;
                     }
                 } else {
                     montant = 0;
                 }
                
                // Ajouter au total pour chaque item (car chaque item a maintenant sa propre quantité)
                totalMontant += montant;
                
                // Formater le montant
                String montantStr;
                if (montant % 1 == 0) {
                    montantStr = String.format("%d FCFA", (long) montant);
                } else {
                    montantStr = String.format("%.0f FCFA", montant);
                }
                table.addCell(createTableCell(montantStr, normalFont, rowBg, TextAlignment.RIGHT));

                // Statut - seulement pour le premier item de la fiche
                if (itemIndex == 0) {
                    String statut = fiche.getStatut() != null ? fiche.getStatut().toString() : "N/A";
                    DeviceRgb statutColor;
                    if ("VALIDE".equals(statut)) {
                        statutColor = SUCCESS_COLOR;
                    } else if ("REJETE".equals(statut)) {
                        statutColor = ERROR_COLOR;
                    } else {
                        statutColor = DARK_GRAY;
                    }

                    Cell statutCell = new Cell()
                            .add(new Paragraph(statut)
                                    .setFont(boldFont)
                                    .setFontSize(9)
                                    .setFontColor(statutColor))
                            .setBackgroundColor(rowBg)
                            .setPadding(6)
                            .setTextAlignment(TextAlignment.CENTER)
                            .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));
                    table.addCell(statutCell);
                } else {
                    table.addCell(createTableCell("", normalFont, rowBg, TextAlignment.CENTER));
                }
            }
        }

        // Ligne de total
        Cell totalLabelCell = new Cell(1, 5)
                .add(new Paragraph("TOTAL PRESTATAIRE")
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        Cell totalAmountCell = new Cell()
                .add(new Paragraph(String.format("%.0f FCFA", totalMontant))
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        Cell totalStatusCell = new Cell()
                .add(new Paragraph("-")
                        .setFont(boldFont)
                        .setFontSize(11)
                        .setFontColor(DARK_BLUE))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 1));

        table.addCell(totalLabelCell);
        table.addCell(totalAmountCell);
        table.addCell(totalStatusCell);

        document.add(table);
    }

    // ============================
    // MÉTHODES POUR FICHE OFFICIELLE
    // ============================

    private void addPrestataireInfo(Document document, Prestation prestation, PdfFont normalFont) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addInfoRow(table, "Nom du prestataire", prestation.getNomPrestataire() != null ? prestation.getNomPrestataire() : "NetCom Afrique", normalFont);
        addInfoRow(table, "Structure", prestation.getStructurePrestataire() != null ? prestation.getStructurePrestataire() : "Non spécifié", normalFont);
        addInfoRow(table, "Service", prestation.getServicePrestataire() != null ? prestation.getServicePrestataire() : "Non spécifié", normalFont);
        addInfoRow(table, "Qualification", prestation.getQualificationPrestataire() != null ? prestation.getQualificationPrestataire() : "Non spécifié", normalFont);

        document.add(table);
    }

    private void addResponsableInfo(Document document, Prestation prestation, PdfFont normalFont) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addInfoRow(table, "Nom du responsable", prestation.getNomResponsablePrestation() != null ? prestation.getNomResponsablePrestation() : "ki", normalFont);
        addInfoRow(table, "Contact responsable", prestation.getContactResponsablePrestation() != null ? prestation.getContactResponsablePrestation() : "78906756", normalFont);
        addInfoRow(table, "Qualification responsable", prestation.getQualificationResponsablePrestation() != null ? prestation.getQualificationResponsablePrestation() : "!e", normalFont);

        document.add(table);
    }

    private void addStructureInfo(Document document, Prestation prestation, PdfFont normalFont) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addInfoRow(table, "Nom Structure", prestation.getNomStructure() != null ? prestation.getNomStructure() : "MINISTRE DÉLÉGUÉ CHARGÉ DU BUDGET", normalFont);
        addInfoRow(table, "Adresse", prestation.getAdresseStructure() != null ? prestation.getAdresseStructure() : "BP 78 OUAGA 1", normalFont);
        addInfoRow(table, "Email", "delegue.budget@mefp.bf", normalFont);
        addInfoRow(table, "Correspondant", prestation.getNomCi() != null ? prestation.getNomCi() : "INNO", normalFont);
        addInfoRow(table, "Contact CI", prestation.getContactCi() != null ? prestation.getContactCi() : "+226 20 00 00 08", normalFont);
        addInfoRow(table, "Fonction CI", prestation.getFonctionCi() != null ? prestation.getFonctionCi() : "Correspondant Informatique", normalFont);

        document.add(table);
    }

    private void addInterventionDetails(Document document, Prestation prestation, PdfFont normalFont) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addInfoRow(table, "Items couverts par la prestation", prestation.getItemsNames() != null && !prestation.getItemsNames().isEmpty() ? prestation.getItemsNames() : "scanner, reparation de souris", normalFont);
        addInfoRow(table, "Trimestre", prestation.getTrimestre() != null ? prestation.getTrimestre() : "T4", normalFont);
        addInfoRow(table, "Montant", prestation.getMontantIntervention() != null ? prestation.getMontantIntervention().toString() + " FCFA" : "7500.00 FCFA", normalFont);
        addInfoRow(table, "Statut de l'intervention", prestation.getStatutIntervention() != null ? prestation.getStatutIntervention() : "réussie", normalFont);

        // Dates
        if (prestation.getDateHeureDebut() != null) {
            String debutStr = prestation.getDateHeureDebut().format(DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm"));
            addInfoRow(table, "Début", debutStr, normalFont);
        } else {
            addInfoRow(table, "Début", "08/12/2025 à 13:40", normalFont);
        }

        if (prestation.getDateHeureFin() != null) {
            String finStr = prestation.getDateHeureFin().format(DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm"));
            addInfoRow(table, "Fin", finStr, normalFont);
        } else {
            addInfoRow(table, "Fin", "16/12/2025 à 16:47", normalFont);
        }

        document.add(table);
    }

    private void addValidationSignatures(Document document, Prestation prestation, PdfFont boldFont, PdfFont normalFont) {
        Table signatureTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(30);

        // Pour le Prestataire
        Cell prestataireCell = new Cell()
                .setBorder(null)
                .setPadding(20)
                .setTextAlignment(TextAlignment.CENTER);

        prestataireCell.add(new Paragraph("Pour le Prestataire")
                .setFont(boldFont)
                .setFontSize(12)
                .setFontColor(DARK_BLUE)
                .setMarginBottom(40));

        prestataireCell.add(new Paragraph("_________________________")
                .setFont(normalFont)
                .setFontSize(10)
                .setMarginBottom(5));

        prestataireCell.add(new Paragraph(prestation.getNomPrestataire() != null ? prestation.getNomPrestataire() : "NetCom Afrique")
                .setFont(normalFont)
                .setFontSize(10)
                .setFontColor(DARK_GRAY));

        // Pour la Structure
        Cell structureCell = new Cell()
                .setBorder(null)
                .setPadding(20)
                .setTextAlignment(TextAlignment.CENTER);

        structureCell.add(new Paragraph("Pour la Structure")
                .setFont(boldFont)
                .setFontSize(12)
                .setFontColor(DARK_BLUE)
                .setMarginBottom(40));

        structureCell.add(new Paragraph("_________________________")
                .setFont(normalFont)
                .setFontSize(10)
                .setMarginBottom(5));

        structureCell.add(new Paragraph(prestation.getNomCi() != null ? prestation.getNomCi() : "INNO")
                .setFont(normalFont)
                .setFontSize(10)
                .setFontColor(DARK_GRAY));

        signatureTable.addCell(prestataireCell);
        signatureTable.addCell(structureCell);

        document.add(signatureTable);
    }

    // ============================
    // MÉTHODES UTILITAIRES
    // ============================

    private String getFormattedItemsText(FichePrestation fiche, int rowNumber) {
        String itemsCouverts = fiche.getItemsCouverts();
        String nomItem = fiche.getNomItem();

        // Try to parse itemsCouverts as JSON array first
        java.util.List<String> items = new java.util.ArrayList<>();
        if (itemsCouverts != null && !itemsCouverts.trim().isEmpty()) {
            try {
                // Try to parse as JSON array
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.List<?> parsed = mapper.readValue(itemsCouverts, java.util.List.class);
                for (Object item : parsed) {
                    if (item != null) {
                        items.add(item.toString());
                    }
                }
            } catch (Exception e) {
                // If JSON parsing fails, treat as comma-separated string
                String[] splitItems = itemsCouverts.split(",");
                for (String item : splitItems) {
                    String trimmed = item.trim();
                    if (!trimmed.isEmpty()) {
                        items.add(trimmed);
                    }
                }
            }
        }

        // If no items found in itemsCouverts, use nomItem
        if (items.isEmpty() && nomItem != null && !nomItem.trim().isEmpty()) {
            items.add(nomItem.trim());
        }

        // If still no items, return N/A
        if (items.isEmpty()) {
            return "N/A";
        }

        // Format items with numbering and line breaks
        StringBuilder formatted = new StringBuilder();
        int itemNumber = 1;
        for (String item : items) {
            if (formatted.length() > 0) {
                formatted.append("\n"); // Line break between items
            }
            formatted.append(itemNumber).append("- ").append(item);
            itemNumber++;
        }

        return formatted.toString();
    }

    private int getItemUsageCount(String itemNom, FichePrestation currentFiche) {
        int count = 0;
        // Vérifier si l'item est dans itemsCouverts (JSON ou string séparé par des virgules)
        String itemsCouverts = currentFiche.getItemsCouverts();
        String nomItem = currentFiche.getNomItem();
        
        // Vérifier dans itemsCouverts
        if (itemsCouverts != null && !itemsCouverts.trim().isEmpty()) {
            String[] items = itemsCouverts.split(",");
            for (String item : items) {
                String trimmedItem = item.trim();
                if (trimmedItem.equalsIgnoreCase(itemNom)) {
                    count++;
                }
            }
        }
        
        // Vérifier dans nomItem
        if (count == 0 && nomItem != null && !nomItem.trim().isEmpty()) {
            if (nomItem.trim().equalsIgnoreCase(itemNom)) {
                count++;
            }
        }
        
        return count;
    }



        /**
         * Calcule la quantité totale réalisée pour un item donné à travers
         * TOUTES les fiches de la base de données. Si une fiche contient une quantité explicite
         * (champ quantite) celle-ci est sommée; sinon on compte 1 par fiche
         * contenant l'item.
         * 
         * Cette méthode est identique à calculateItemUsageQuantity dans ItemController
         * pour assurer la cohérence des valeurs entre la page des items et le PDF.
         */
        private int getItemUsageCount(String itemNom, String lot) {
                if (itemNom == null || itemNom.trim().isEmpty()) {
                        return 0;
                }
                
                int total = 0;
                List<FichePrestation> allFiches = fichePrestationRepository.findAll();
                
                // Normaliser le nom de l'item pour la comparaison (supprimer les espaces en fin)
                String normalizedItemNom = itemNom.trim();
                
                for (FichePrestation fiche : allFiches) {
                        if (fiche == null) continue;
                        
                        // Ne compter que les fiches du lot spécifié (via numero_fiche)
                        if (fiche.getNumeroFiche() == null || !fiche.getNumeroFiche().contains("L" + lot.replaceAll("[^0-9]", ""))) {
                            continue;
                        }
                        
                        int countInFiche = 0;
                        String itemsCouverts = fiche.getItemsCouverts();
                        String nomItem = fiche.getNomItem();
                        
                        // Compter les occurrences dans itemsCouverts
                        if (itemsCouverts != null && !itemsCouverts.trim().isEmpty()) {
                            // Split items by commas and trim each item
                            String[] items = itemsCouverts.split(",");
                            for (String item : items) {
                                String trimmedItem = item.trim();
                                if (trimmedItem.equalsIgnoreCase(normalizedItemNom)) {
                                    countInFiche++;
                                }
                            }
                        }
                        
                        // Compter l'occurrence dans nomItem
                        if (countInFiche == 0 && nomItem != null && !nomItem.trim().isEmpty()) {
                            if (nomItem.trim().equalsIgnoreCase(normalizedItemNom)) {
                                countInFiche++;
                            }
                        }
                        
                        total += countInFiche;
                }
                
                return total;
        }


    private Cell createTableCell(String text, PdfFont font, DeviceRgb bgColor, TextAlignment alignment) {
        return new Cell()
                .add(new Paragraph(text)
                        .setFont(font)
                        .setFontSize(9))
                .setBackgroundColor(bgColor)
                .setPadding(6)
                .setTextAlignment(alignment)
                .setBorder(new SolidBorder(MEDIUM_GRAY, 0.5f));
    }
}
