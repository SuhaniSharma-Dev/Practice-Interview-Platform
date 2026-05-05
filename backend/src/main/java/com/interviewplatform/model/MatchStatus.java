package com.interviewplatform.model;

/**
 * Session lifecycle: PENDING → ACCEPTED → SCHEDULED → COMPLETED
 * Rejected/Expired are terminal states.
 */
public enum MatchStatus {
    PENDING,
    ACCEPTED,
    SCHEDULED,
    COMPLETED,
    REJECTED,
    EXPIRED
}
