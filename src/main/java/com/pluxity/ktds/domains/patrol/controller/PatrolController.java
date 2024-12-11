package com.pluxity.ktds.domains.patrol.controller;


import com.pluxity.ktds.domains.patrol.service.PatrolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/patrols")
public class PatrolController {

    private final PatrolService service;

}
