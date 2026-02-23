package com.dgsi.maintenance.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class TestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        System.out.println("Test ping endpoint called");
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend is running");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lot4-usage")
    public List<Map<String, Object>> getLot4Usage() {
        String sql = "SELECT i.nom_item, COUNT(fpi.fiche_prestation_id) as count_occurrences, SUM(fpi.quantite_utilisee) as total_quantity_used " +
                    "FROM fiche_prestation_items fpi " +
                    "JOIN items i ON fpi.item_id = i.id " +
                    "JOIN fiches_prestation fp ON fpi.fiche_prestation_id = fp.id " +
                    "WHERE i.lot = 'lot4' " +
                    "GROUP BY i.nom_item";
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        return result;
    }

    @GetMapping("/lot4-details")
    public List<Map<String, Object>> getLot4Details() {
        String sql = "SELECT fp.numero_fiche, i.nom_item, fpi.quantite_utilisee " +
                    "FROM fiche_prestation_items fpi " +
                    "JOIN items i ON fpi.item_id = i.id " +
                    "JOIN fiches_prestation fp ON fpi.fiche_prestation_id = fp.id " +
                    "WHERE i.lot = 'lot4' " +
                    "ORDER BY fp.numero_fiche";
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        return result;
    }

    @PostMapping("/sync-item-quantities")
    public ResponseEntity<Map<String, Object>> syncItemQuantities() {
        try {
            // Reset all item usage quantities to zero
            jdbcTemplate.execute("UPDATE items SET quantite_utilisee = 0, quantite_utilisee_trimestre = 0");

            // Synchronize quantite_utilisee with actual usage from fiche_prestation_items
            jdbcTemplate.execute("UPDATE items i SET quantite_utilisee = (SELECT COALESCE(SUM(fpi.quantite_utilisee), 0) FROM fiche_prestation_items fpi WHERE fpi.item_id = i.id) WHERE EXISTS (SELECT 1 FROM fiche_prestation_items fpi WHERE fpi.item_id = i.id)");

            // Synchronize quantite_utilisee_trimestre with actual usage from fiche_prestation_items (trimestre 1)
            jdbcTemplate.execute("UPDATE items i SET quantite_utilisee_trimestre = (SELECT COALESCE(SUM(fpi.quantite_utilisee), 0) FROM fiche_prestation_items fpi JOIN fiches_prestation fp ON fpi.fiche_prestation_id = fp.id WHERE fpi.item_id = i.id AND fp.numero_fiche LIKE 'T1-%') WHERE EXISTS (SELECT 1 FROM fiche_prestation_items fpi JOIN fiches_prestation fp ON fpi.fiche_prestation_id = fp.id WHERE fpi.item_id = i.id AND fp.numero_fiche LIKE 'T1-%')");

            // Verify the synchronization
            List<Map<String, Object>> results = jdbcTemplate.queryForList("SELECT i.nom_item, i.lot, COALESCE(i.quantite_utilisee, 0) as quantite_utilisee, COALESCE(i.quantite_utilisee_trimestre, 0) as quantite_utilisee_trimestre, COALESCE(SUM(fpi.quantite_utilisee), 0) as total_used FROM items i LEFT JOIN fiche_prestation_items fpi ON i.id = fpi.item_id GROUP BY i.id, i.nom_item, i.lot, i.quantite_utilisee, i.quantite_utilisee_trimestre ORDER BY i.lot, i.nom_item");

            // Count updated items
            int updatedItems = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM items WHERE quantite_utilisee > 0 OR quantite_utilisee_trimestre > 0", Integer.class);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Item quantities synchronized successfully");
            response.put("updatedItems", updatedItems);
            response.put("items", results);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Error synchronizing item quantities");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}