package com.stagepassport.backend.dto.catalog;

public record SubGenreRequest(
        String genreId,
        String genreName,
        String name
) {}