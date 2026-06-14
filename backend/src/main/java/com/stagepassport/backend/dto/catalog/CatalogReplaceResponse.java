package com.stagepassport.backend.dto.catalog;

import java.util.List;

import com.stagepassport.backend.dto.performance.PerformanceResponse;

public record CatalogReplaceResponse(
        List<PerformanceResponse> performances,
        CatalogResponse catalog
) {}