package com.interviewplatform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for manual match request submission.
 */
@Data
public class ManualMatchRequest {

    @NotBlank(message = "Interviewer ID is required")
    private String interviewerId;
}
