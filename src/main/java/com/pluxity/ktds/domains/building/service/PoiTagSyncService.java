package com.pluxity.ktds.domains.building.service;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.PoiTag;
import com.pluxity.ktds.domains.building.repostiory.PoiTagRepository;
import com.pluxity.ktds.domains.tag.TagClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PoiTagSyncService {
    
    private final PoiTagRepository poiTagRepository;
    private final TagClientService tagClientService;

    @Value("${tags.sync.batchSize}")
    private int batchSize;


    @Value("${tags.sync.startup-enabled}")
    private boolean startupEnabled;

    
    /**
     * 서버 시작 시 모든 POI 태그 동기화
     * enabled 여부에 따라 동작
     */
    @EventListener(ApplicationReadyEvent.class)
    public void syncAllPoiTagsOnStartup() {
        if(startupEnabled){
            log.info("서버 시작 - POI 태그 동기화 시작");
            syncUnregisteredTags();
            log.info("서버 시작 - POI 태그 동기화 완료");
        }
    }
    
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
    public void syncPoiTags(List<PoiTag> poiTags) {
        List<String> tagNames = poiTags.stream()
                .map(PoiTag::getTagName)
                .toList();

        List<List<String>> batches = createBatches(tagNames);

        for( List<String> tagBatch : batches) {
            if(registerTagToExternalServer(tagBatch)) {
                log.info("{}개의 태그 등록 성공", tagBatch.size());
                // 등록 성공 시 PoiTag의 externalRegistered 상태를 true로 업데이트
                List<Long> batchTagIds = poiTags.stream()
                        .filter(tag -> tagBatch.contains(tag.getTagName()))
                        .map(PoiTag::getId)
                        .toList();

                if(! batchTagIds.isEmpty()){
                    int updateCount = poiTagRepository.updateExternalRegisteredByIds(batchTagIds);
                    log.info("일괄 업데이트 완료: {}개", updateCount);
                }
            }else {
                log.warn( "등록 실패" );
            }
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
    private boolean registerTagToExternalServer(List<String> tagNames) {
        try {
            tagClientService.addTags(tagNames);
            log.debug("외부 서버에 태그 등록 요청: TAG SIZE={}", tagNames.size());

            // 임시로 성공으로 처리 (실제 구현 시 제거)
            return true;

        } catch (Exception e) {
            log.error("외부 서버 태그 등록 실패: 오류={}", e.getMessage());
            return false;
        }
    }

    /**
     * 태그 리스트를 배치로 분할
     * 100개씩 묶어서 처리
     */

    private List<List<String>> createBatches(List<String> tagNames) {
        List<List<String>> batches = new ArrayList<>();

        for (int i = 0; i < tagNames.size(); i += batchSize) {
            int end = Math.min(i + batchSize, tagNames.size());
            batches.add(tagNames.subList(i, end));
        }

        return batches;
    }
} 