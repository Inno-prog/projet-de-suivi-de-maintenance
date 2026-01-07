package com.dgsi.maintenance.config;

import java.util.logging.Logger;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(10) // Run after other initializers
public class FicheStructureDataFix implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(FicheStructureDataFix.class.getName());

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Fixing nomStructure field in existing fiches_prestation records...");

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        try {
            // First, check current state
            Integer totalRecords = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM fiches_prestation", Integer.class);
            Integer recordsWithStructure = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM fiches_prestation WHERE nom_structure IS NOT NULL AND nom_structure != ''",
                Integer.class);

            logger.info("Before fix - Total fiches_prestation records: " + totalRecords);
            logger.info("Before fix - Records with nom_structure: " + recordsWithStructure);
            logger.info("Before fix - Records missing nom_structure: " + (totalRecords - recordsWithStructure));

            // Update existing fiches_prestation records where nom_structure is missing
            // PostgreSQL compatible UPDATE with subquery
            String updateSql1 = """
                UPDATE fiches_prestation
                SET nom_structure = (
                    SELECT p.nom_structure
                    FROM prestations p
                    WHERE p.id = CAST(fiches_prestation.id_prestation AS BIGINT)
                    AND p.nom_structure IS NOT NULL
                    AND p.nom_structure != ''
                    LIMIT 1
                )
                WHERE (nom_structure IS NULL OR nom_structure = '')
                AND EXISTS (
                    SELECT 1 FROM prestations p
                    WHERE p.id = CAST(fiches_prestation.id_prestation AS BIGINT)
                    AND p.nom_structure IS NOT NULL
                    AND p.nom_structure != ''
                )
                """;

            int updatedRows1 = jdbcTemplate.update(updateSql1);
            logger.info("Updated " + updatedRows1 + " fiches_prestation records");

            int totalUpdated = updatedRows1;

            // Final summary
            Integer finalRecordsWithStructure = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM fiches_prestation WHERE nom_structure IS NOT NULL AND nom_structure != ''",
                Integer.class);
            Integer finalRecordsWithoutStructure = totalRecords - finalRecordsWithStructure;

            logger.info("Fiche structure fix summary:");
            logger.info("- Total fiches_prestation records: " + totalRecords);
            logger.info("- Records updated: " + totalUpdated);
            logger.info("- Final records with nom_structure: " + finalRecordsWithStructure);
            logger.info("- Final records still missing nom_structure: " + finalRecordsWithoutStructure);

            // Show some examples
            jdbcTemplate.query(
                "SELECT fp.id, fp.id_prestation, fp.nom_structure, p.nom_structure as prestation_structure " +
                "FROM fiches_prestation fp " +
                "LEFT JOIN prestations p ON CAST(p.id AS VARCHAR) = fp.id_prestation " +
                "WHERE fp.nom_structure IS NOT NULL AND fp.nom_structure != '' " +
                "LIMIT 5",
                (rs, rowNum) -> {
                    logger.info("Example fixed record - ID: " + rs.getLong("id") +
                              ", nom_structure: " + rs.getString("nom_structure"));
                    return null;
                });

        } catch (Exception e) {
            logger.severe("Error fixing fiche structure data: " + e.getMessage());
            e.printStackTrace();
            // Don't fail the application startup for this
        }

        logger.info("Fiche structure data fix completed");
    }
}
