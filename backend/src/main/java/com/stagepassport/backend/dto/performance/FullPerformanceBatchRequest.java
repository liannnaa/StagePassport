package com.stagepassport.backend.dto.performance;

import java.util.List;

public record FullPerformanceBatchRequest(
        List<PerformanceRequest> performances,
        boolean syncArtistGenres
) {}
