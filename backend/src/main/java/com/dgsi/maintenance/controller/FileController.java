package com.dgsi.maintenance.controller;

import java.io.IOException;
import java.util.List;
import com.dgsi.maintenance.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileController {

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/upload/contrats")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<String>> uploadContrats(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> filePaths = fileUploadService.uploadFiles(files, "contrats");
            return ResponseEntity.ok(filePaths);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/upload/rapports")
    @PreAuthorize("hasRole('PRESTATAIRE')")
    public ResponseEntity<List<String>> uploadRapports(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> filePaths = fileUploadService.uploadFiles(files, "rapports");
            return ResponseEntity.ok(filePaths);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        } 
    }

    @GetMapping("/download/{folder}/{filename:.+}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String folder, @PathVariable String filename) {
        try {
            // Construire le chemin du fichier
            String filePath = folder + "/" + filename;

            // Récupérer le contenu du fichier
            byte[] fileContent = fileUploadService.getFile(filePath);

            // Déterminer le type MIME du fichier
            String contentType = determineContentType(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            default -> "application/octet-stream";
        };
    }
}
