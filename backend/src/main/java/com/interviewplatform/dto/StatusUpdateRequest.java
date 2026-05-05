package com.interviewplatform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for updating session status.
 */
@Data
public class StatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    /** Optional: scheduled time (ISO format) when status = SCHEDULED */
    private String scheduledAt;
}
