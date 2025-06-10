package com.pluxity.ktds.domains.management.repository;

import com.pluxity.ktds.domains.management.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
}
