package com.dgsi.maintenance.repository;

import java.util.Optional;
import com.dgsi.maintenance.entity.StructureMefp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StructureMefpRepository extends JpaRepository<StructureMefp, String> {
    Optional<StructureMefp> findByNom(String nom);
}