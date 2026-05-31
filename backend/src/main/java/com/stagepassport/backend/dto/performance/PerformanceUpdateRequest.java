package com.stagepassport.backend.dto.performance;

public record PerformanceUpdateRequest(
    String id,
    PerformanceRequest performance
) {}