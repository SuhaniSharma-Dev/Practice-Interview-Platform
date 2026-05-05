package com.interviewplatform.controller;

import com.interviewplatform.dto.ApiResponse;
import com.interviewplatform.dto.ProfileRequest;
import com.interviewplatform.dto.ProfileResponse;
import com.interviewplatform.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Profile controller — CRUD REST APIs for user profiles.
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * GET /api/profile/{userId}
     * Retrieve a user's profile.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @PathVariable String userId) {
        try {
            ProfileResponse profile = profileService.getProfile(userId);
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /api/profile/{userId}
     * Create or update a user's profile.
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @PathVariable String userId,
            @Valid @RequestBody ProfileRequest request) {
        try {
            ProfileResponse profile = profileService.saveOrUpdateProfile(userId, request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
