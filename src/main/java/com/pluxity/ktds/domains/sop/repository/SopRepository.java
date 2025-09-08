package com.pluxity.ktds.domains.sop.repository;

import com.pluxity.ktds.domains.sop.dto.SopResponseDTO;
import com.pluxity.ktds.domains.sop.entity.Sop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SopRepository extends JpaRepository<Sop, Long> {
    Optional<Sop> findFirstByOrderByIdDesc();
}
