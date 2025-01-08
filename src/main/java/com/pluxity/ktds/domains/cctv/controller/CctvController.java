package com.pluxity.ktds.domains.cctv.controller;

import com.pluxity.ktds.domains.cctv.service.CctvService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cctv")
public class CctvController {

    private final CctvService cctvService;
}
