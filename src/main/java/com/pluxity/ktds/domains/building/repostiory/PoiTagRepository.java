package com.pluxity.ktds.domains.building.repostiory;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.PoiTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoiTagRepository extends JpaRepository<PoiTag, Long> {
    
    List<PoiTag> findByPoiId(Long poiId);

    List<PoiTag> findAllByPoiIn(@Param("poi") List<Poi> poiList);

    List<PoiTag> findByTagNameContaining(String pattern);

    @Query("SELECT pt.poi.id, pt.tagName FROM PoiTag pt WHERE pt.poi.id IN :poiIds")
    List<Object[]> findTagNamesByPoiIds(@Param("poiIds") List<Long> poiIds);

} 