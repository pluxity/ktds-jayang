package com.pluxity.ktds.domains.building.repostiory;

import com.pluxity.ktds.domains.building.entity.FloorHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FloorHistoryRepository extends JpaRepository<FloorHistory, Long> {

    List<FloorHistory> findByBuildingFileHistoryId(Long buildingFileHistoryId);
    void deleteByBuildingFileHistoryIdIn(List<Long> buildingFileHistoryIds);
}
