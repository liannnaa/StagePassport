package com.stagepassport.backend.controller;

import com.stagepassport.backend.dto.performance.PerformanceRequest;
import com.stagepassport.backend.dto.performance.PerformanceResponse;
import com.stagepassport.backend.dto.performance.PerformanceUpdateRequest;
import com.stagepassport.backend.security.FirebaseAuthenticationToken;
import com.stagepassport.backend.service.PerformanceService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.Map;

@RestController
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping("/api/performances")
    public List<PerformanceResponse> getPerformances(Authentication authentication) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return performanceService.getPerformancesForUser(firebaseAuth.getUid());
    }

    @PostMapping("/api/performances")
    public PerformanceResponse createPerformance(Authentication authentication, @RequestBody PerformanceRequest request) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return performanceService.createPerformanceForUser(firebaseAuth.getUid(), request);
    }

    @PostMapping("/api/performances/batch")
    public List<PerformanceResponse> createPerformancesBatch(Authentication authentication, @RequestBody List<PerformanceRequest> requests) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return performanceService.createPerformancesForUser(firebaseAuth.getUid(), requests);
    }

    @PutMapping("/api/performances/{performanceId}")
    public Map<String, String> updatePerformance(Authentication authentication, @PathVariable String performanceId, @RequestBody PerformanceRequest request) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        performanceService.updatePerformanceForUser(firebaseAuth.getUid(), performanceId, request);
        return Map.of("id", performanceId);
    }

    @DeleteMapping("/api/performances/{performanceId}")
    public void deletePerformance(Authentication authentication, @PathVariable String performanceId) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        performanceService.deletePerformanceForUser(firebaseAuth.getUid(), performanceId);
    }

    @PutMapping("/api/performances/batch")
    public List<PerformanceResponse> updatePerformancesBatch(Authentication authentication, @RequestBody List<PerformanceUpdateRequest> updates) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return performanceService.updatePerformancesForUser(firebaseAuth.getUid(), updates);
    }

    @DeleteMapping("/api/performances/batch")
    public void deletePerformancesBatch(Authentication authentication, @RequestBody List<String> performanceIds) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        performanceService.deletePerformancesForUser(firebaseAuth.getUid(), performanceIds);
    }
}