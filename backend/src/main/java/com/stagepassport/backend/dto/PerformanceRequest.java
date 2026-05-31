package com.stagepassport.backend.dto;

import java.util.List;

public record PerformanceRequest(
        String artist,
        String venue,
        String city,
        String date,
        String billing,
        List<String> tags,
        String genre,
        String subGenre,
        String showName,
        String showId
) {}