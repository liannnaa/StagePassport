package com.stagepassport.backend.service;

import com.stagepassport.backend.dto.PerformanceRequest;
import com.stagepassport.backend.dto.PerformanceResponse;
import com.stagepassport.backend.dto.PerformanceUpdateRequest;
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

    public void updatePerformanceForUser(String uid, String performanceId, PerformanceRequest request) throws Exception {
        performanceRepository.update(uid, performanceId, request);
    }

    public void deletePerformanceForUser(String uid, String performanceId) throws Exception {
        performanceRepository.delete(uid, performanceId);
    }

    public List<PerformanceResponse> updatePerformancesForUser(String uid, List<PerformanceUpdateRequest> updates) throws Exception {
        return performanceRepository.updateMany(uid, updates);
    }

    public void deletePerformancesForUser(String uid, List<String> performanceIds) throws Exception {
        performanceRepository.deleteMany(uid, performanceIds);
    }
}