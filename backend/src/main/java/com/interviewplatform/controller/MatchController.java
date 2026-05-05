package com.interviewplatform.controller;

import com.interviewplatform.dto.*;
import com.interviewplatform.model.User;
import com.interviewplatform.service.MatchingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Match controller — endpoints for matching, sessions, status updates, and feedback.
 */
@RestController
@RequestMapping("/api/match")
public class MatchController {

    private final MatchingService matchingService;

    public MatchController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    /** GET /api/match/interviewers — List all interviewers */
    @GetMapping("/interviewers")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> listInterviewers() {
        try {
            List<ProfileResponse> interviewers = matchingService.listInterviewers();
            return ResponseEntity.ok(ApiResponse.success("Interviewers retrieved", interviewers));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** POST /api/match/auto — Auto-match interviewee with top interviewers */
    @PostMapping("/auto")
    public ResponseEntity<ApiResponse<List<MatchScoreResponse>>> autoMatch(
            @AuthenticationPrincipal User user) {
        try {
            List<MatchScoreResponse> matches = matchingService.autoMatch(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Top matches found", matches));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** POST /api/match/request — Send manual match request */
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<MatchRequestResponse>> sendMatchRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ManualMatchRequest request) {
        try {
            MatchRequestResponse response = matchingService.sendMatchRequest(
                    user.getId(), request.getInterviewerId());
            return ResponseEntity.ok(ApiResponse.success("Match request sent", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** GET /api/match/requests/{userId} — View all match requests */
    @GetMapping("/requests/{userId}")
    public ResponseEntity<ApiResponse<List<MatchRequestResponse>>> getMatchRequests(
            @PathVariable String userId) {
        try {
            List<MatchRequestResponse> requests = matchingService.getMatchRequests(userId);
            return ResponseEntity.ok(ApiResponse.success("Match requests retrieved", requests));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** PUT /api/match/requests/{requestId}/status — Update session status */
    @PutMapping("/requests/{requestId}/status")
    public ResponseEntity<ApiResponse<MatchRequestResponse>> updateStatus(
            @PathVariable String requestId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody StatusUpdateRequest request) {
        try {
            MatchRequestResponse response = matchingService.updateSessionStatus(
                    requestId, request.getStatus(), request.getScheduledAt(), user.getId());
            return ResponseEntity.ok(ApiResponse.success("Status updated", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** POST /api/match/feedback — Submit session feedback */
    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody FeedbackRequest request) {
        try {
            FeedbackResponse response = matchingService.submitFeedback(user.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Feedback submitted", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** GET /api/match/feedback/check — Check if feedback already submitted */
    @GetMapping("/feedback/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFeedback(
            @RequestParam String matchRequestId,
            @AuthenticationPrincipal User user) {
        boolean exists = matchingService.hasFeedback(matchRequestId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Feedback check",
                Map.of("submitted", exists)));
    }
}
