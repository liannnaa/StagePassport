package com.stagepassport.backend.dto.catalog;

public record CatalogReplacementRequest(
        String venue,
        String city,
        String billing,
        String tag,
        String genre,
        String subGenre,
        String genreId
) {}