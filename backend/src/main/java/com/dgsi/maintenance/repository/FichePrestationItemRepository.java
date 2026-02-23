package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.FichePrestationItem;
import com.dgsi.maintenance.entity.FichePrestationItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FichePrestationItemRepository extends JpaRepository<FichePrestationItem, FichePrestationItemId> {
    List<FichePrestationItem> findByFichePrestationId(Long fichePrestationId);
    List<FichePrestationItem> findByItemId(Long itemId);
}
