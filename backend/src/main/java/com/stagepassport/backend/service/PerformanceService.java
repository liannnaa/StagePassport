package com.stagepassport.backend.service;

import com.stagepassport.backend.dto.PerformanceRequest;
import com.stagepassport.backend.dto.PerformanceResponse;
import com.stagepassport.backend.repository.PerformanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PerformanceService {

    private final PerformanceRepository performanceRepository;

    public PerformanceService(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }

    public List<PerformanceResponse> getPerformancesForUser(String uid) throws Exception {
        return performanceRepository.findByUserId(uid);
    }

    public PerformanceResponse createPerformanceForUser(String uid, PerformanceRequest request) throws Exception {
        return performanceRepository.insert(uid, request);
    }

    public List<PerformanceResponse> createPerformancesForUser(String uid, List<PerformanceRequest> requests) throws Exception {
        return performanceRepository.insertMany(uid, requests);
    }
}