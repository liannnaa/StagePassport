package com.stagepassport.backend.dto.catalog;

public record TagOptionResponse(
        String id,
        String name,
        String normalizedName
) {}