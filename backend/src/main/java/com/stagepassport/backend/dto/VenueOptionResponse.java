package com.stagepassport.backend.dto;

public record VenueOptionResponse(
        String id,
        String venueName,
        String city,
        String normalizedKey
) {}