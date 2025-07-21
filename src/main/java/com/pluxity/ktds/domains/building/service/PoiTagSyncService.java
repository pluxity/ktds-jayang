package com.pluxity.ktds.domains.building.service;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.PoiTag;
import com.pluxity.ktds.domains.building.repostiory.PoiTagRepository;
import com.pluxity.ktds.domains.tag.TagClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PoiTagSyncService {
    
    private final PoiTagRepository poiTagRepository;
    private final TagClientService tagClientService;

    
    /**
     * 서버 시작 시 모든 POI 태그 동기화
     */
//    @EventListener(ApplicationReadyEvent.class)
//    public void syncAllPoiTagsOnStartup() {
//        log.info("서버 시작 - POI 태그 동기화 시작");
//        syncUnregisteredTags();
//        log.info("서버 시작 - POI 태그 동기화 완료");
//    }
    
    /**
     * 미등록 태그들 동기화
     */
    private void syncUnregisteredTags() {
        List<PoiTag> unregisteredTags = poiTagRepository.findByExternalRegisteredFalse();
        
        if (unregisteredTags.isEmpty()) {
            log.info("동기화할 태그 없음");
            return;
        }
        
        log.info("총 {}개 미등록 태그 동기화 시작", unregisteredTags.size());
        syncPoiTags(unregisteredTags);
    }
    
    /**
     * PoiTag 리스트 동기화
     */
    private void syncPoiTags(List<PoiTag> poiTags) {
        if(registerTagToExternalServer(poiTags)){
            for (PoiTag poiTag : poiTags) {
                // poiTag.markAsRegistered(); update 막음
                log.debug("POI {}  등록 성공", poiTag.getTagName());
            }
            poiTagRepository.saveAll(poiTags);

        }else {
            log.warn( "등록 실패" );
        }
    }
    
    /**
     * 특정 POI의 미등록 태그들 동기화
     */
    @Transactional
    public void syncPoiUnregisteredTags(Poi poi) {
        List<PoiTag> tags = poi.getPoiTags().stream()
                .filter(tag -> !tag.getExternalRegistered())
                .toList();

        syncPoiTags(tags);
    }

    /**
     * 외부 서버에 태그 등록(일괄)
     */
    private boolean registerTagToExternalServer(List<PoiTag> tagNames) {
        try {
            // tagClientService.addTag(tagNames);
            log.debug("외부 서버에 태그 등록 요청: TAG SIZE={}", tagNames.size());

            // 임시로 성공으로 처리 (실제 구현 시 제거)
            return true;

        } catch (Exception e) {
            log.error("외부 서버 태그 등록 실패: 오류={}", e.getMessage());
            return false;
        }
    }
} 