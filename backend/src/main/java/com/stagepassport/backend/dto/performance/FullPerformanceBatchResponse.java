package com.stagepassport.backend.dto.performance;

import java.util.List;

import com.stagepassport.backend.dto.catalog.CatalogResponse;

public record FullPerformanceBatchResponse(
        List<PerformanceResponse> createdPerformances,
        List<PerformanceResponse> updatedPerformances,
        CatalogResponse catalog
) {}
