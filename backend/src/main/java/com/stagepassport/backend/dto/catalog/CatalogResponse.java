package com.stagepassport.backend.dto.catalog;

import java.util.List;

public record CatalogResponse(
        List<VenueOptionResponse> venues,
        List<BillingOptionResponse> billings,
        List<TagOptionResponse> tags,
        List<GenreOptionResponse> genres,
        List<SubGenreOptionResponse> subGenres
) {}