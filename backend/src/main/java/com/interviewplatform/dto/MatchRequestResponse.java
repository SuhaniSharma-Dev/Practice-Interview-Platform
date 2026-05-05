package com.interviewplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for match/session request API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequestResponse {

    private String id;
    private String intervieweeId;
    private String intervieweeName;
    private String interviewerId;
    private String interviewerName;
    private String status;
    private String roomId;
    private String scheduledAt;
    private String createdAt;
    /** Whether the current user already submitted feedback */
    private boolean feedbackSubmitted;
}
