package com.pluxity.ktds.domains.building.service;

import com.pluxity.ktds.domains.building.entity.PoiTag;
import com.pluxity.ktds.domains.building.repostiory.PoiTagRepository;
import com.pluxity.ktds.domains.tag.TagClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
     * PoiTag 리스트 동기화
     * 주어진 POI ID들에 대해 태그 정보를 동기화하고, 외부 서버에 등록된 태그들을 반환
     */
    @Transactional
    public boolean syncPoiTags(Long poiId) {

        try {
            // 1. 주어진 POI ID들에 해당하는 태그 정보 조회
            List<PoiTag> poiTags = poiTagRepository.findByPoiId(poiId);

            // 2. 태그 이름들 추출
            List<String> tagNames = poiTags.stream()
                    .map(PoiTag::getTagName)
                    .distinct()
                    .toList();

            if (tagNames.isEmpty()) {
                return false;
            }

            // 3. 외부 서버에 태그 등록
            boolean registrationSuccess = registerTagToExternalServer(tagNames);

            if (registrationSuccess) {
                return true;
            } else {
                return false;
            }

        } catch (Exception e) {
            log.error("POI 태그 동기화 중 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }


    /**
     * 외부 서버에 태그 등록(일괄)
     */
    private boolean registerTagToExternalServer(List<String> tagNames) {
        try {
            ResponseEntity<String> response = tagClientService.addTags(tagNames);

            // 응답 상태가 성공인지 확인
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("외부 서버 태그 등록 성공: TAG SIZE={}", tagNames.size());
                return true;
            } else {
                log.warn("외부 서버 태그 등록 실패: 상태={}, 응답={}",
                response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (Exception e) {
            log.error("외부 서버 태그 등록 실패: 오류={}", e.getMessage());
            return false;
        }
    }

} 