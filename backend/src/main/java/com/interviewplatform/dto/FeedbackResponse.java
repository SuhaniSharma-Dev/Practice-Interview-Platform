package com.interviewplatform.dto;

import lombok.*;

/**
 * DTO for feedback API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private String id;
    private String matchRequestId;
    private String fromUserId;
    private String fromUserName;
    private String toUserId;
    private String toUserName;
    private int rating;
    private String comments;
    private String createdAt;
}
