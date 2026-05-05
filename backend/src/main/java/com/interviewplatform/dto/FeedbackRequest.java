package com.interviewplatform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for submitting session feedback.
 */
@Data
public class FeedbackRequest {

    @NotBlank(message = "Match request ID is required")
    private String matchRequestId;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int rating;

    private String comments;
}
