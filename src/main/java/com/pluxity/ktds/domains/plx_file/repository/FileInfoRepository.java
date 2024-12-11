package com.pluxity.ktds.domains.plx_file.repository;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FileInfoRepository extends JpaRepository<FileInfo, Long> {
    Optional<FileInfo> findByDirectoryName(String directory);
}
