package com.stagepassport.backend.dto.catalog;

public record CatalogReplaceRequest(
        String type,
        String oldId,
        CatalogReplacementRequest replacement
) {}
