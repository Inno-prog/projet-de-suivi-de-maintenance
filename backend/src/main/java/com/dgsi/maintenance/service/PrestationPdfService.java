package com.dgsi.maintenance.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import com.dgsi.maintenance.entity.Prestation;
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
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PrestationPdfService {

    private DeviceRgb lightGray = new DeviceRgb(240, 240, 240);

    @Transactional(readOnly = true)
    public byte[] generatePrestationPdf(Prestation prestation) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(40, 40, 60, 40);

            DeviceRgb primaryColor = new DeviceRgb(0, 51, 102);
            DeviceRgb secondaryColor = new DeviceRgb(249, 115, 22);
            DeviceRgb darkGray = new DeviceRgb(64, 64, 64);

            PdfFont boldFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);

            addOfficialHeader(document, boldFont, normalFont, prestation);

            addMainTitle(document, "FICHE DE PRESTATION", primaryColor, boldFont);
            addSectionTitle(document, "INFORMATIONS DU PRESTATAIRE", primaryColor, boldFont);
            addPrestataireInfo(document, prestation, normalFont, darkGray, lightGray);
            addSectionTitle(document, "INFORMATIONS DE LA STRUCTURE", primaryColor, boldFont);
            addStructureAndCIInfo(document, prestation, normalFont, darkGray, lightGray);
            addSectionTitle(document, "DÉTAILS DE L'INTERVENTION", primaryColor, boldFont);
            addInterventionDetails(document, prestation, normalFont, darkGray, lightGray);


            addSignatureSection(document, prestation, normalFont, boldFont, primaryColor, darkGray);
            addProfessionalFooter(document, normalFont, darkGray);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF de prestation", e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    // ----------------------------------------------------------------------
    // 🔵 ENTÊTE AVEC INTERLIGNE RÉDUIT + LOGO RÉDUIT + TEXTE COMPLÉTÉ
    // ----------------------------------------------------------------------
    private void addOfficialHeader(Document document, PdfFont bold, PdfFont normal, Prestation prestation) {

        Table table = new Table(UnitValue.createPercentArray(new float[]{33, 34, 33}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(10)
                .setTextAlignment(TextAlignment.CENTER);

        // --- BLOC GAUCHE AVEC INTERLIGNE RÉDUIT ---
        Cell left = new Cell().setBorder(null);
        left.add(createHeaderText(bold, normal,
                "MINISTERE DE L’ECONOMIE ET DES FINANCES",
                "------------------------",
                "SECRETARIAT GENERAL",
                "------------------------",
                "DIRECTION GENERALE",
                "DES SYSTEMES D’INFORMATION",
                "------------------------",
                "DIRECTION DES RESEAUX ET SYSTEMES"
        ));
        table.addCell(left);

                // --- LOGO CENTRAL (réduit pour la fiche individuelle) ---
                Cell center = new Cell().setBorder(null).setTextAlignment(TextAlignment.CENTER);
                try {
                        ClassPathResource logo = new ClassPathResource("static/assets/logoFinal.png");
                        ImageData imgData = ImageDataFactory.create(logo.getURL());
                        // smaller, but visible — keep aspect ratio
                        Image img = new Image(imgData).setWidth(40).setAutoScale(true);
                        center.add(img);
                } catch (Exception e) {
                        center.add(new Paragraph("LOGO"));
                }
        table.addCell(center);

        // --- BLOC DROIT ---
        Cell right = new Cell().setBorder(null);
        right.add(new Paragraph("BURKINA FASO")
                .setFont(bold).setFontSize(12).setTextAlignment(TextAlignment.CENTER));
        right.add(new Paragraph("La Patrie ou la Mort, nous\nVaincrons")
                .setFont(normal).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
        right.add(new Paragraph("------------------------")
                .setFont(normal).setFontSize(10).setTextAlignment(TextAlignment.CENTER));

        // Date de génération — placé sous la devise / séparateur comme demandé
        String currentDate = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        DeviceRgb darkGrayLocal = new DeviceRgb(64, 64, 64);
        right.add(new Paragraph("Généré à Ouaga le " + currentDate)
                .setFont(normal)
                .setFontSize(10)
                .setFontColor(darkGrayLocal)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(4));

        table.addCell(right);

        document.add(table);
    }

    private Paragraph createHeaderText(PdfFont bold, PdfFont normal, String... lines) {
        Paragraph p = new Paragraph()
                .setTextAlignment(TextAlignment.CENTER)
                .setFixedLeading(11); // 🔥 interligne réduit

        for (String line : lines) {
            p.add(new Paragraph(line)
                    .setFont(line.contains("---") ? normal : bold)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER));
        }
        return p;
    }

    // ----------------------------------------------------------------------

    private void addMainTitle(Document document, String title, DeviceRgb color, PdfFont font) {
        Paragraph titleParagraph = new Paragraph(title)
                .setFont(font).setFontSize(18)
                .setFontColor(color)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20)
                .setMarginBottom(25)
                .setBackgroundColor(new DeviceRgb(240, 240, 240))
                .setPadding(10)
                .setBold();
        document.add(titleParagraph);
    }

    private void addSectionTitle(Document document, String title, DeviceRgb color, PdfFont font) {
        Paragraph sectionTitle = new Paragraph(title)
                .setFont(font).setFontSize(12)
                .setFontColor(color)
                .setMarginTop(25).setMarginBottom(10)
                .setBold()
                .setBackgroundColor(new DeviceRgb(249, 249, 249))
                .setPadding(8)
                .setBorder(new com.itextpdf.layout.borders.SolidBorder(color, 1));
        document.add(sectionTitle);
    }

    private void addPrestataireInfo(Document document, Prestation prestation, PdfFont font, DeviceRgb textColor, DeviceRgb bgColor) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

                // Always show prestataire name if present
                if (prestation.getNomPrestataire() != null && !prestation.getNomPrestataire().isBlank()) {
                        addStyledInfoRow(table, "Nom du prestataire", prestation.getNomPrestataire(), font, textColor, bgColor);
                }

                // Show responsable contact details when available (must be displayed as requested)
                if (prestation.getNomResponsablePrestation() != null && !prestation.getNomResponsablePrestation().isBlank()) {
                        addStyledInfoRow(table, "Nom du responsable de la prestation", prestation.getNomResponsablePrestation(), font, textColor, bgColor);
                }
                if (prestation.getContactResponsablePrestation() != null && !prestation.getContactResponsablePrestation().isBlank()) {
                        addStyledInfoRow(table, "Contact responsable de la prestation", prestation.getContactResponsablePrestation(), font, textColor, bgColor);
                }
                if (prestation.getQualificationResponsablePrestation() != null && !prestation.getQualificationResponsablePrestation().isBlank()) {
                        addStyledInfoRow(table, "Qualification responsable de la prestation", prestation.getQualificationResponsablePrestation(), font, textColor, bgColor);
                }

                // Only include structure/service/qualification if they have values — avoid 'Non spécifié' placeholders
                if (prestation.getStructurePrestataire() != null && !prestation.getStructurePrestataire().isBlank()) {
                        addStyledInfoRow(table, "Structure", prestation.getStructurePrestataire(), font, textColor, bgColor);
                }
                if (prestation.getServicePrestataire() != null && !prestation.getServicePrestataire().isBlank()) {
                        addStyledInfoRow(table, "Service", prestation.getServicePrestataire(), font, textColor, bgColor);
                }
                if (prestation.getQualificationPrestataire() != null && !prestation.getQualificationPrestataire().isBlank()) {
                        addStyledInfoRow(table, "Qualification", prestation.getQualificationPrestataire(), font, textColor, bgColor);
                }

        document.add(table);
    }

    private void addStructureAndCIInfo(Document document, Prestation prestation, PdfFont font, DeviceRgb textColor, DeviceRgb bgColor) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addStyledInfoRow(table, "Nom Structure", prestation.getNomStructure(), font, textColor, bgColor);
        addStyledInfoRow(table, "Adresse", prestation.getAdresseStructure(), font, textColor, bgColor);
        addStyledInfoRow(table, "Email", prestation.getContactStructure(), font, textColor, bgColor);
        addStyledInfoRow(table, "Correspondant", prestation.getNomCi(), font, textColor, bgColor);
        addStyledInfoRow(table, "Contact CI", prestation.getContactCi(), font, textColor, bgColor);
        addStyledInfoRow(table, "Fonction CI", prestation.getFonctionCi(), font, textColor, bgColor);

        document.add(table);
    }

    private void addInterventionDetails(Document document, Prestation prestation, PdfFont font, DeviceRgb textColor, DeviceRgb bgColor) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        // Items couverts par la prestation
        String itemsString = "Non spécifié";
        if (prestation.getItemsUtilises() != null && !prestation.getItemsUtilises().isEmpty()) {
            itemsString = prestation.getItemsUtilises().stream()
                    .map(item -> item.getNomItem())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Non spécifié");
        }
        addStyledInfoRow(table, "Items couverts par la prestation", itemsString, font, textColor, bgColor);

        addStyledInfoRow(table, "Trimestre", prestation.getTrimestre(), font, textColor, bgColor);
        addStyledInfoRow(table, "Montant", prestation.getMontantIntervention() + " FCFA", font, textColor, bgColor);
        addStyledInfoRow(table, "Statut de l'intervention", prestation.getStatutIntervention(), font, textColor, bgColor);

        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

        addStyledInfoRow(table, "Début", prestation.getDateHeureDebut().format(df), font, textColor, bgColor);
        addStyledInfoRow(table, "Fin", prestation.getDateHeureFin().format(df), font, textColor, bgColor);

        document.add(table);
    }

    private void addStyledInfoRow(Table table, String label, String value, PdfFont font, DeviceRgb textColor, DeviceRgb bgColor) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setFont(font).setFontSize(10).setBold().setFontColor(textColor))
                .setBackgroundColor(bgColor)
                .setPadding(6);

        Cell valueCell = new Cell()
                .add(new Paragraph(value != null ? value : "Non spécifié")
                        .setFont(font).setFontSize(10))
                .setPadding(6);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addSignatureSection(Document document, Prestation prestation, PdfFont normalFont,
                                     PdfFont boldFont, DeviceRgb primary, DeviceRgb darkGray) {

        addSectionTitle(document, "VALIDATION ET SIGNATURES", primary, boldFont);

        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginTop(20);

        Cell prestataire = new Cell()
                .add(new Paragraph("Pour le Prestataire").setFont(boldFont).setFontColor(darkGray))
                .add(new Paragraph("\n\n\nSignature"))
                .add(new Paragraph(prestation.getNomPrestataire()).setFont(boldFont).setFontColor(primary))
                .setPadding(20);

        Cell structure = new Cell()
                .add(new Paragraph("Pour la Structure").setFont(boldFont).setFontColor(darkGray))
                .add(new Paragraph("\n\n\nSignature"))
                .add(new Paragraph(prestation.getNomCi()).setFont(boldFont).setFontColor(primary));

        table.addCell(prestataire);
        table.addCell(structure);

        document.add(table);
    }

    private void addProfessionalFooter(Document document, PdfFont font, DeviceRgb gray) {
        Paragraph footer = new Paragraph("Document généré automatiquement - MainTrack Pro\nConfidentiel - DGSI")
                .setFont(font).setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(gray)
                .setMarginTop(40);

        document.add(footer);
    }
}
