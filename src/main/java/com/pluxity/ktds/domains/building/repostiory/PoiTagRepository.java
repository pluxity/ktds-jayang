package com.pluxity.ktds.domains.building.repostiory;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.PoiTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoiTagRepository extends JpaRepository<PoiTag, Long> {
    
    /**
     * 특정 POI의 모든 태그 조회
     */
    List<PoiTag> findByPoiId(Long poiId);
    
    /**
     * 특정 POI의 특정 태그 조회
     */
    PoiTag findByPoiIdAndTagName(Long poiId, String tagName);
    
    /**
     * 외부 서버에 미등록된 태그들 조회
     */
    List<PoiTag> findByExternalRegisteredFalse();
    
    /**
     * 태그명으로 조회
     */
    List<PoiTag> findByTagName(String tagName);

    /**
     * 특정 POI에 대해 외부 서버에 등록되지 않은 태그들 조회
     */
    List<PoiTag> findByPoiAndExternalRegisteredFalse(Poi poi);

} 