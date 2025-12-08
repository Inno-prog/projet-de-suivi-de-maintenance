package com.dgsi.maintenance.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileUploadService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public List<String> uploadFiles(MultipartFile[] files, String subfolder) throws IOException {
        List<String> filePaths = new ArrayList<>();
        
        // Créer le dossier s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir, subfolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                // Générer un nom unique pour le fichier
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                
                // Copier le fichier
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                filePaths.add(subfolder + "/" + fileName);
            }
        }
        
        return filePaths;
    }

    public boolean deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadDir, filePath);
            return Files.deleteIfExists(path);
        } catch (IOException e) {
            return false;
        }
    }

    public byte[] getFile(String filePath) throws IOException {
        // Vérifier que le chemin ne contient pas de séquences de navigation (sécurité)
        if (filePath.contains("..") || filePath.startsWith("/") || filePath.startsWith("\\")) {
            throw new SecurityException("Chemin de fichier non autorisé");
        }
        
        Path path = Paths.get(uploadDir, filePath).normalize();
        
        // Vérifier que le chemin final est bien dans le répertoire autorisé
        if (!path.startsWith(Paths.get(uploadDir).normalize())) {
            throw new SecurityException("Accès non autorisé au fichier");
        }
        
        // Vérifier que le fichier existe
        if (!Files.exists(path)) {
            throw new IOException("Fichier non trouvé: " + path);
        }
        
        return Files.readAllBytes(path);
    }
}