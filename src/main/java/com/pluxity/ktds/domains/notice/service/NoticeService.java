package com.pluxity.ktds.domains.notice.service;

import com.pluxity.ktds.domains.notice.dto.CreateNoticeDTO;
import com.pluxity.ktds.domains.notice.dto.NoticeResponseDTO;
import com.pluxity.ktds.domains.notice.dto.UpdateNoticeDTO;
import com.pluxity.ktds.domains.notice.entity.Notice;
import com.pluxity.ktds.domains.notice.repository.NoticeRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.swing.text.StyledEditorKit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository repository;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.notice}")
    private String noticeExchangeName;

//    public NoticeService(NoticeRepository repository) {
//        this.repository = repository;
//    }

    @Transactional
    public void createNotice(CreateNoticeDTO dto) {

        var notice = CreateNoticeDTO.toEntity(dto);
        Notice savedNotice = repository.save(notice);
        if (savedNotice.getIsUrgent() && savedNotice.getIsActive()) {
            rabbitTemplate.convertAndSend(noticeExchangeName, "", savedNotice);
        }
    }
    @Transactional
    public List<NoticeResponseDTO> getNotices() {
        var notices = repository.findAll();
        return notices.stream()
                .map(NoticeResponseDTO::from)
                .toList();
    }

    @Transactional
    public List<NoticeResponseDTO> getNoticesIsActiveTrue() {
        var notices = repository.findAllByIsActiveTrueOrderByCreatedAtDesc();
        return notices.stream()
                .map(NoticeResponseDTO::from)
                .toList();
    }

    @Transactional
    public NoticeResponseDTO getNotice(Long id) {
        var notice = repository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));

        return NoticeResponseDTO.from(notice);
    }

    @Transactional
    public void updateNotice(Long id, UpdateNoticeDTO dto) {
        var notice = repository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));

        notice.update(dto.title(), dto.content(), dto.isUrgent(), dto.isActive(), dto.isRead(), dto.expiredAt(), dto.buildingIds());
    }

    @Transactional
    public void updateActive(Long id, Boolean isActive) {
        Notice notice = repository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));
        notice.updateActive(isActive);
    }

    @Transactional
    public void deleteNotice(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public void deleteNoticeList(@NotNull List<Long> ids) {
        repository.deleteAllById(ids);
    }

    @Transactional
    public void deleteAllById(@NotNull List<Long> ids) {
        repository.deleteAllById(ids);
    }

    @Transactional
    public int markNoticesAsRead(List<Long> noticeIds) {
        if (noticeIds == null || noticeIds.isEmpty()) {
            return 0;
        }
        return repository.markNoticesAsRead(noticeIds);
    }
}
