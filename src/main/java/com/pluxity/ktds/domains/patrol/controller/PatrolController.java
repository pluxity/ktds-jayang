package com.pluxity.ktds.domains.patrol.controller;


import com.pluxity.ktds.domains.patrol.dto.CreatePatrolDTO;
import com.pluxity.ktds.domains.patrol.dto.CreatePatrolPointDTO;
import com.pluxity.ktds.domains.patrol.dto.PatrolResponseDTO;
import com.pluxity.ktds.domains.patrol.service.PatrolService;
import com.pluxity.ktds.global.response.DataResponseBody;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import com.pluxity.ktds.global.response.ResponseBody;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/patrols")
public class PatrolController {

    private final PatrolService service;

    @GetMapping
    public DataResponseBody<List<PatrolResponseDTO>> getPatrols() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping("/{id}")
    public DataResponseBody<PatrolResponseDTO> getPatrol(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postPatrol(@Valid @RequestBody CreatePatrolDTO dto) throws Exception {
        return DataResponseBody.of(service.save(dto));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody patchPatrol(@PathVariable Long id,
                                    @Valid @RequestBody CreatePatrolDTO dto) throws Exception {
        service.update(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deletePatrol(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @PatchMapping("/{id}/points")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPatrolPoints(@PathVariable Long id, @Valid @RequestBody CreatePatrolPointDTO dto) {
        service.updatePatrolAddPoint(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

}
