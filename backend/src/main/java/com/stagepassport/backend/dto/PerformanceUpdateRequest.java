package com.stagepassport.backend.dto;

public record PerformanceUpdateRequest(
    String id,
    PerformanceRequest performance
) {}