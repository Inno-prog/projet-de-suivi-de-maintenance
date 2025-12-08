package com.dgsi.maintenance.service;

import java.io.ByteArrayOutputStream;
import java.util.Map;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class PdfReportService {

    private final SpringTemplateEngine templateEngine;

    public PdfReportService(SpringTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generatePdf(String templateName, Map<String, Object> variables) throws Exception {
        org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
        context.setVariables(variables);

        // render HTML from Thymeleaf template
        String html = templateEngine.process(templateName, context);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            // Use default fonts; to embed custom fonts, configure here (see OpenHTMLToPDF docs)
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();

            return os.toByteArray();
        }
    }
}