package com.stagepassport.backend.dto;

public record BillingOptionResponse(
        String id,
        String name,
        String normalizedName
) {}