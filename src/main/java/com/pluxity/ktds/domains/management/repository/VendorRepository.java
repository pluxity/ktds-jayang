package com.pluxity.ktds.domains.management.repository;

import com.pluxity.ktds.domains.management.entity.Vendor;
import com.pluxity.ktds.global.repository.BaseRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends BaseRepository<Vendor, Long> {
}
