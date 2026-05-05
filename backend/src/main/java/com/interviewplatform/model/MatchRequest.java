package com.interviewplatform.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MatchRequest document — tracks interview sessions between users.
 * Lifecycle: PENDING → ACCEPTED → SCHEDULED → COMPLETED
 */
@Document(collection = "match_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRequest {

    @Id
    private String id;

    /** The interviewee who initiated the match */
    private String intervieweeId;

    /** The interviewer being matched with */
    private String interviewerId;

    /** Status: PENDING → ACCEPTED → SCHEDULED → COMPLETED */
    private MatchStatus status;

    /** Unique room ID for the video session (generated when SCHEDULED) */
    private String roomId;

    /** When the session is scheduled for */
    private LocalDateTime scheduledAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
