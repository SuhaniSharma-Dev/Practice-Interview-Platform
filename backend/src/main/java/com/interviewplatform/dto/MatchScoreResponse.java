package com.interviewplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for ranked interviewer results from the matching algorithm.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchScoreResponse {

    private String interviewerId;
    private String interviewerName;
    private String domain;
    private int experienceYears;
    private int matchScore;
    private int skillOverlap;
    private boolean domainMatch;
    private int availabilityOverlap;
}
