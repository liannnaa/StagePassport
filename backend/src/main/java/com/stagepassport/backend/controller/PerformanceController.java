package com.stagepassport.backend.controller;

import com.stagepassport.backend.dto.PerformanceResponse;
import com.stagepassport.backend.security.FirebaseAuthenticationToken;
import com.stagepassport.backend.service.PerformanceService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping("/api/performances")
    public List<PerformanceResponse> getPerformances(Authentication authentication) throws Exception {
        FirebaseAuthenticationToken firebaseAuth =
                (FirebaseAuthenticationToken) authentication;

        return performanceService.getPerformancesForUser(firebaseAuth.getUid());
    }
}