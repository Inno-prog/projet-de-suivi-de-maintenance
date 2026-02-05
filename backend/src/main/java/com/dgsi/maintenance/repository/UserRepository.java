package com.dgsi.maintenance.repository;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(@Param("email") String email);

    Optional<User> findByNom(String nom);
    boolean existsByEmail(String email);
    List<User> findByRole(String role);

    @Query("SELECT u FROM User u WHERE u.role = 'PRESTATAIRE'")
    List<User> findAllPrestataires();
    
    @Query("SELECT u FROM User u WHERE u.nom LIKE %:keyword% OR u.email LIKE %:keyword% OR u.contact LIKE %:keyword% OR u.adresse LIKE %:keyword%")
    List<User> searchByKeyword(@Param("keyword") String keyword);
}