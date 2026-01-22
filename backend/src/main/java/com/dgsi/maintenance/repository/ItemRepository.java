package com.dgsi.maintenance.repository;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findByNomItem(String nomItem);

    Optional<Item> findFirstByNomItem(String nomItem);

    List<Item> findByNomItemContainingIgnoreCase(String nomItem);

    boolean existsByNomItem(String nomItem);

    // Get all used idItem values
    @Query("SELECT i.idItem FROM Item i WHERE i.idItem IS NOT NULL ORDER BY i.idItem")
    List<Integer> findAllUsedIdItems();

    // Find the maximum idItem used
    @Query("SELECT COALESCE(MAX(i.idItem), 0) FROM Item i")
    int findMaxIdItem();

    // Check if a specific idItem is already used
    boolean existsByIdItem(Integer idItem);

    // Find items by lot
    List<Item> findByLot(String lot);

    // Find items by lot containing a keyword
    List<Item> findByLotContaining(String lot);

    // Count items by lot
    long countByLot(String lot);

    // Compter les items par lot pour les statistiques
    @Query("SELECT i.lot, COUNT(i) FROM Item i WHERE i.lot IS NOT NULL GROUP BY i.lot")
    List<Object[]> countItemsByLot();

    // Compter les items avec limites trimestrielles définies
    @Query("SELECT COUNT(i) FROM Item i WHERE i.quantiteMaxTrimestre IS NOT NULL AND i.quantiteMaxTrimestre > 0")
    long countItemsWithLimits();

    // Trouver les items par liste de lots (pour filtrage par prestataire)
    @Query("SELECT i FROM Item i WHERE i.lot IN :lots")
    List<Item> findByLotIn(@Param("lots") List<String> lots);

    // Trouver les items par lot (avec variante pour "Lot X" vs "X")
    @Query("SELECT DISTINCT i FROM Item i WHERE " +
           "LOWER(TRIM(i.lot)) IN :lotNames OR " +
           "LOWER(TRIM(REPLACE(i.lot, 'Lot ', ''))) IN :lotNames OR " +
           "LOWER(TRIM(REPLACE(i.lot, 'lot', ''))) IN :lotNames OR " +
           "LOWER(TRIM(CONCAT('Lot ', i.lot))) IN :lotNames OR " +
           "LOWER(TRIM(CONCAT('lot', i.lot))) IN :lotNames OR " +
           "UPPER(TRIM(i.lot)) IN :lotNames OR " +
           "UPPER(TRIM(REPLACE(i.lot, 'Lot ', ''))) IN :lotNames OR " +
           "UPPER(TRIM(CONCAT('Lot ', i.lot))) IN :lotNames")
    List<Item> findByLotNameInIgnoreCase(@Param("lotNames") List<String> lotNames);

    // NOUVELLE MÉTHODE: Recherche optimisée par lots avec correspondance flexible
    // Gère les cas: "3", "lot3", "Lot 3", "lot 3", etc.
    @Query(value = "SELECT * FROM items i WHERE " +
           "LOWER(TRIM(i.lot)) = ANY(:lotNumbers) OR " +
           "LOWER(TRIM(REPLACE(i.lot, 'lot', ''))) = ANY(:lotNumbers) OR " +
           "LOWER(TRIM(REPLACE(i.lot, 'Lot ', ''))) = ANY(:lotNumbers) OR " +
           "LOWER(TRIM(CONCAT('lot', i.lot))) = ANY(:lotNumbers) OR " +
           "LOWER(TRIM(CONCAT('lot ', i.lot))) = ANY(:lotNumbers)",
           nativeQuery = true)
    List<Item> findByLotNumbersFlexible(@Param("lotNumbers") List<String> lotNumbers);
}
