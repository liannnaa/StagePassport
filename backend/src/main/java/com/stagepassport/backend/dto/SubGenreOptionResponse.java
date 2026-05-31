package com.stagepassport.backend.dto;

public record SubGenreOptionResponse(
        String id,
        String genreId,
        String name,
        String normalizedKey
) {}