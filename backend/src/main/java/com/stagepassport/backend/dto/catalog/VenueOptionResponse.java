package com.stagepassport.backend.dto.catalog;

public record VenueOptionResponse(
        String id,
        String venueName,
        String city,
        String normalizedKey
) {}