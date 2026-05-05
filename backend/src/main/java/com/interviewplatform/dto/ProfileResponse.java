package com.interviewplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for returning profile data in API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {

    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String role;
    private String bio;
    private List<String> skills;
    private String domain;
    private int experienceYears;
    private Map<String, List<String>> availability;
}
