package com.interviewplatform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * DTO for creating/updating a user profile.
 */
@Data
public class ProfileRequest {

    private String bio;

    private List<String> skills;

    @NotBlank(message = "Domain is required")
    private String domain;

    private int experienceYears;

    /**
     * Availability map:
     * key = day (e.g., "MONDAY")
     * value = list of time slots (e.g., ["09:00-11:00", "14:00-16:00"])
     */
    private Map<String, List<String>> availability;
}
