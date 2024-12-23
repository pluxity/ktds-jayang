package com.pluxity.ktds.domains.notice.controller;

import com.pluxity.ktds.domains.notice.dto.CreateNoticeDTO;
import com.pluxity.ktds.domains.notice.dto.NoticeResponseDTO;
import com.pluxity.ktds.domains.notice.dto.UpdateNoticeDTO;
import com.pluxity.ktds.domains.notice.service.NoticeService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequestMapping("/notices")
public class NoticeController {

    private final NoticeService service;

    public NoticeController(NoticeService service) {
        this.service = service;
    }

    @GetMapping
    public DataResponseBody<List<NoticeResponseDTO>> getNotices() {
        return DataResponseBody.of(service.getNotices());
    }

    @GetMapping("/{id}")
    public DataResponseBody<NoticeResponseDTO> getNotice(@PathVariable Long id) {
        return DataResponseBody.of(service.getNotice(id));
    }

    @PostMapping
    public ResponseBody createNotice(
            @RequestBody CreateNoticeDTO dto
        ){
        service.createNotice(dto);
        return ResponseBody.of(SUCCESS_CREATE);
    }

    @PutMapping("/{id}")
    public ResponseBody updateNotice(
            @PathVariable Long id,
            @RequestBody UpdateNoticeDTO dto
    ) {
        service.updateNotice(id, dto);
        return ResponseBody.of(SUCCESS_PUT);
    }

    @DeleteMapping("/{id}")
    public ResponseBody deleteNotice(@PathVariable Long id) {
        service.deleteNotice(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

}
