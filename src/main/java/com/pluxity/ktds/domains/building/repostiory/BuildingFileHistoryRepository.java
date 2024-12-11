package com.pluxity.ktds.domains.building.repostiory;

import com.pluxity.ktds.domains.building.entity.BuildingFileHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BuildingFileHistoryRepository extends JpaRepository<BuildingFileHistory, Long> {
    @EntityGraph(attributePaths = {"building", "fileInfo"})
    List<BuildingFileHistory> findByBuildingId(Long id);

    @EntityGraph(attributePaths = {"building", "fileInfo"})
    List<BuildingFileHistory> findByFileInfoId(Long id);
}
