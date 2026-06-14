package com.stagepassport.backend.dto.performance;

public record ArtistGenreSyncRequest(
        String artistName,
        String genre,
        String subGenre
) {}