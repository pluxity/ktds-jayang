package com.pluxity.ktds.domains.notice.service;

import com.pluxity.ktds.domains.notice.dto.CreateNoticeDTO;
import com.pluxity.ktds.domains.notice.dto.NoticeResponseDTO;
import com.pluxity.ktds.domains.notice.dto.UpdateNoticeDTO;
import com.pluxity.ktds.domains.notice.entity.Notice;
import com.pluxity.ktds.domains.notice.repository.NoticeRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoticeService {

    private final NoticeRepository repository;

    public NoticeService(NoticeRepository repository) {
        this.repository = repository;
    }

    public void createNotice(CreateNoticeDTO dto) {
        var notice = CreateNoticeDTO.toEntity(dto);
        repository.save(notice);
    }

    public List<NoticeResponseDTO> getNotices() {
        var notices = repository.findAllByOrderByExpiredAt();

        return notices.stream()
                .map(NoticeResponseDTO::from)
                .toList();
    }

    public NoticeResponseDTO getNotice(Long id) {
        var notice = repository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));

        return NoticeResponseDTO.from(notice);
    }

    public void updateNotice(Long id, UpdateNoticeDTO dto) {
        var notice = repository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));

        notice.update(dto.title(), dto.content(), dto.isUrgent(), dto.expiredAt());
    }

    public void deleteNotice(Long id) {
        repository.deleteById(id);
    }
}
