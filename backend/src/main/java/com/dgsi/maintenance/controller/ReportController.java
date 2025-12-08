package com.dgsi.maintenance.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.dgsi.maintenance.dto.ReportData;
import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.service.EvaluationService;
import com.dgsi.maintenance.service.PdfReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final PdfReportService pdfReportService;
    private final EvaluationService evaluationService;

    public ReportController(PdfReportService pdfReportService, EvaluationService evaluationService) {
        this.pdfReportService = pdfReportService;
        this.evaluationService = evaluationService;
    }

    @PostMapping(value = "/prestations/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generatePrestationsReportPdf(@RequestBody ReportData data) {
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("report", data);
            vars.put("generatedAt", LocalDateTime.now().toString());

            // templateName corresponds to resources/templates/report_prestations.html (without extension)
            byte[] pdf = pdfReportService.generatePdf("report_prestations", vars);

            String fileName = "rapport-prestations-" + (data.period != null ? data.period.replaceAll("\\s+","_") : "report") + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping(value = "/evaluations/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generateEvaluationReportPdf(@PathVariable Long id) {
        try {
            Optional<EvaluationTrimestrielle> evaluationOpt = evaluationService.getEvaluationById(id);
            if (!evaluationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            EvaluationTrimestrielle evaluation = evaluationOpt.get();
            Map<String, Object> vars = new HashMap<>();
            vars.put("evaluation", evaluation);
            vars.put("generatedAt", LocalDateTime.now().toString());

            // templateName corresponds to resources/templates/report_evaluation.html (without extension)
            byte[] pdf = pdfReportService.generatePdf("report_evaluation", vars);

            String fileName = "rapport-evaluation-" + evaluation.getLot() + "-" + evaluation.getTrimestre() + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}