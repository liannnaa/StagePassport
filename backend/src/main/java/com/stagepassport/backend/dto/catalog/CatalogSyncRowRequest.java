package com.stagepassport.backend.dto.catalog;

import java.util.List;

public record CatalogSyncRowRequest(
        String venue,
        String city,
        String genre,
        String subGenre,
        String billing,
        List<String> tags
) {}