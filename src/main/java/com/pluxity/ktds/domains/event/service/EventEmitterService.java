package com.pluxity.ktds.domains.event.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class EventEmitterService {
    // 클라이언트 ID -> SseEmitter 매핑
    private static final Map<String, SseEmitter> emitterMap = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(String clientId) {
        log.info("=== EventEmitterService.createEmitter() 호출 - clientId: {} ===", clientId);
        log.info("현재 활성 연결 수: {}", emitterMap.size());

        // 기존 연결이 있으면 제거
        SseEmitter existingEmitter = emitterMap.get(clientId);
        if (existingEmitter != null) {
            log.warn("기존 연결이 존재합니다. 제거 후 새로 생성합니다. clientId: {}", clientId);
            removeEmitter(clientId);
        }

        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1시간 타임아웃
        emitterMap.put(clientId, emitter);
        log.info("SseEmitter 생성 완료: clientId={}, emitter={}", clientId, emitter);

        // 콜백 등록
        emitter.onTimeout(() -> {
            log.warn("SSE 연결 타임아웃: clientId={}", clientId);
            removeEmitter(clientId);
        });
        
        emitter.onCompletion(() -> {
            log.info("SSE 연결 완료/종료: clientId={}", clientId);
            removeEmitter(clientId);
        });
        
        emitter.onError(e -> {
            log.warn("SSE 연결 에러: clientId={} - {}", clientId, e.getMessage());
            removeEmitter(clientId);
        });

        // 초기 연결 확인 이벤트 전송
        try {
            emitter.send(SseEmitter.event().name("init").data("connected"));
        } catch (IOException e) {
            removeEmitter(clientId);
            throw new RuntimeException("SSE 초기 연결 실패", e);
        }

        log.info("SSE Emitter 리스트에 추가 완료. clientId: {}, 현재 연결 수: {}", clientId, emitterMap.size());
        log.info("=== EventEmitterService.createEmitter() 완료 ===");
        
        return emitter;
    }

    private void removeEmitter(String clientId) {
        log.info("SSE Emitter 제거 시작: clientId={}", clientId);
        SseEmitter removed = emitterMap.remove(clientId);
        
        if (removed != null) {
            log.info("SSE Emitter 제거 성공: clientId={} (현재 연결 수: {})", clientId, emitterMap.size());
        } else {
            log.debug("SSE Emitter 제거 실패 - 이미 제거됨: clientId={} (현재 연결 수: {})", clientId, emitterMap.size());
        }
    }

    // ========== 이벤트별 전용 메서드들 ==========

    /**
     * Notice 이벤트 전송 (모든 클라이언트)
     */
    public void sendNotice(Object notice) {
        log.info("=== Notice 이벤트 전송 시작 ===");
        sendToAllEmitters("notice", notice);
    }

    /**
     * 알람 이벤트 전송 (모든 클라이언트)
     */
    public void sendAlarm(Object alarm) {
        log.info("=== 알람 이벤트 전송 시작 ===");
        sendToAllEmitters("newAlarm", alarm);
    }

    /**
     * 알람 해제 이벤트 전송 (모든 클라이언트)
     */
    public void sendDisableAlarm(Object alarmId) {
        log.info("=== 알람 해제 이벤트 전송 시작 ===");
        sendToAllEmitters("disableAlarm", alarmId);
    }

    /**
     * VMS 이벤트 전송 (모든 클라이언트)
     */
    public void sendVmsEvent(Object vmsEvent) {
        log.info("=== VMS 이벤트 전송 시작 ===");
        sendToAllEmitters("vmsEvent", vmsEvent);
    }

    /**
     * 일반 이벤트 전송 (모든 클라이언트)
     */
    public void sendEvent(String eventName, Object event) {
        log.info("=== 일반 이벤트 전송 시작 ===");
        log.info("이벤트명: {}", eventName);
        sendToAllEmitters(eventName, event);
    }

    // ========== 공통 전송 로직 ==========

    /**
     * 모든 연결된 클라이언트에게 이벤트 전송
     */
    private void sendToAllEmitters(String eventName, Object event) {
        log.info("이벤트명: {}", eventName);
        log.info("이벤트 데이터: {}", event);
        log.info("대상 연결 수: {}", emitterMap.size());

        if (emitterMap.isEmpty()) {
            log.warn("전송할 활성 연결이 없습니다.");
            return;
        }

        int successCount = 0;
        int failCount = 0;
        List<String> toRemove = new ArrayList<>();

        for (Map.Entry<String, SseEmitter> entry : emitterMap.entrySet()) {
            String clientId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            
            try {
                log.debug("이벤트 전송 시도: {} -> clientId={}", eventName, clientId);
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(event));
                successCount++;
                log.debug("이벤트 전송 성공: clientId={}", clientId);
            } catch (IOException e) {
                failCount++;
                log.warn("이벤트 전송 실패: clientId={} - {}", clientId, e.getMessage());
                toRemove.add(clientId);
            }
        }

        // 실패한 연결들 제거
        for (String clientId : toRemove) {
            removeEmitter(clientId);
        }

        log.info("이벤트 전송 완료 - 성공: {}, 실패: {}", successCount, failCount);
        log.info("=== 이벤트 전송 종료 ===");
    }

    // ========== 스케줄링 ==========

    @Scheduled(fixedRate = 30_000) // 30초마다
    public void sendPing() {
        if (emitterMap.isEmpty()) {
            return;
        }

        List<String> toRemove = new ArrayList<>();

        for (Map.Entry<String, SseEmitter> entry : emitterMap.entrySet()) {
            String clientId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            
            try {
                log.debug("ping: clientId={}", clientId);
                emitter.send(SseEmitter.event().name("ping").data("keep-alive"));
            } catch (IOException e) {
                log.warn("ping 전송 실패 (연결 끊어짐): clientId={} - {}", clientId, e.getMessage());
                toRemove.add(clientId);
            }
        }

        // 실패한 연결들 제거
        for (String clientId : toRemove) {
            removeEmitter(clientId);
        }
    }
}
