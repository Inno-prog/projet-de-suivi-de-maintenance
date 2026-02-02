package com.dgsi.maintenance.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class PdfReportService {

    private final SpringTemplateEngine templateEngine;

    public PdfReportService(SpringTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generatePdf(String templateName, Map<String, Object> variables) throws Exception {
        System.out.println("Starting PDF generation for template: " + templateName);
        org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
        
        // Ajouter le logo en base64 au contexte
        try {
            ClassPathResource logoResource = new ClassPathResource("static/assets/logoFinal.png");
            if (logoResource.exists()) {
                byte[] logoBytes = logoResource.getInputStream().readAllBytes();
                String logoBase64 = Base64.getEncoder().encodeToString(logoBytes);
                variables.put("logoBase64", logoBase64);
                System.out.println("Logo found and added to context");
            } else {
                System.out.println("Logo not found at static/assets/logoFinal.png");
                variables.put("logoBase64", "");
            }
        } catch (IOException e) {
            System.err.println("Error loading logo: " + e.getMessage());
            e.printStackTrace();
            variables.put("logoBase64", ""); // Valeur par défaut si le logo n'est pas trouvé
        }
        
        context.setVariables(variables);

        // render HTML from Thymeleaf template
        System.out.println("Rendering HTML from Thymeleaf template");
        String html = templateEngine.process(templateName, context);
        System.out.println("HTML rendering successful, length: " + html.length() + " characters");

        // Parse and clean HTML with JSoup to ensure XML compliance
        Document doc = Jsoup.parse(html);
        doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        String cleanedHtml = doc.html();

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            // Use default fonts; to embed custom fonts, configure here (see OpenHTMLToPDF docs)
            builder.withHtmlContent(cleanedHtml, null);
            builder.toStream(os);
            System.out.println("Running PDF renderer");
            builder.run();
            System.out.println("PDF rendering successful, output size: " + os.size() + " bytes");

            return os.toByteArray();
        } catch (Exception e) {
            System.err.println("Error during PDF rendering: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}