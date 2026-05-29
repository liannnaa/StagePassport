package com.stagepassport.backend.dto;

import java.util.List;

public record PerformanceResponse(
        String id,
        String artist,
        String billing,
        String city,
        String date,
        String genre,
        String showId,
        String showName,
        String subGenre,
        List<String> tags,
        String venue
) {}