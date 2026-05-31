package com.stagepassport.backend.dto.catalog;

public record BillingOptionResponse(
        String id,
        String name,
        String normalizedName
) {}