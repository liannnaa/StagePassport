package com.stagepassport.backend.dto.catalog;

public record GenreOptionResponse(
        String id,
        String name,
        String normalizedName
) {}