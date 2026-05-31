package com.stagepassport.backend.dto.catalog;

public record SubGenreOptionResponse(
        String id,
        String genreId,
        String name,
        String normalizedKey
) {}