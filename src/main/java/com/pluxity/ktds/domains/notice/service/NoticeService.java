package com.pluxity.ktds.domains.notice.service;

import com.pluxity.ktds.domains.notice.dto.CreateNoticeDTO;
import com.pluxity.ktds.domains.notice.dto.NoticeResponseDTO;
import com.pluxity.ktds.domains.notice.dto.UpdateNoticeDTO;
import com.pluxity.ktds.domains.notice.entity.Notice;
import com.pluxity.ktds.domains.notice.repository.NoticeRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class NoticeService {

    private final NoticeRepository repository;

    public NoticeService(NoticeRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void createNotice(CreateNoticeDTO dto) {

        var notice = CreateNoticeDTO.toEntity(dto);
        repository.save(notice);
    }
    @Transactional
    public List<NoticeResponseDTO> getNotices() {
        var notices = repository.findAllByOrderByExpiredAt();
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

        notice.update(dto.title(), dto.content(), dto.isUrgent(), dto.isActive(), dto.expiredAt(), dto.buildingIds());
    }
    @Transactional
    public void deleteNotice(Long id) {
        repository.deleteById(id);
    }
}
