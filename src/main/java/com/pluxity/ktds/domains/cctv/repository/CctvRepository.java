package com.pluxity.ktds.domains.cctv.repository;

import com.pluxity.ktds.domains.cctv.entity.Cctv;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CctvRepository extends JpaRepository<Cctv, Long> {
}
