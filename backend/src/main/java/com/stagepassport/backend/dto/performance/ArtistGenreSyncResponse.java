package com.stagepassport.backend.dto.performance;

import com.stagepassport.backend.dto.catalog.CatalogResponse;
import java.util.List;

public record ArtistGenreSyncResponse(
        List<PerformanceResponse> performances,
        CatalogResponse catalog
) {}