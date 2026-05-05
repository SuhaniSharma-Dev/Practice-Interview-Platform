package com.interviewplatform.service;

import com.interviewplatform.dto.ProfileRequest;
import com.interviewplatform.dto.ProfileResponse;
import com.interviewplatform.model.Profile;
import com.interviewplatform.model.User;
import com.interviewplatform.repository.ProfileRepository;
import com.interviewplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

/**
 * ProfileService — CRUD operations for user profiles.
 * Handles creation, retrieval, and updates of professional profiles.
 */
@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileService(ProfileRepository profileRepository,
                          UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get a user's profile by userId.
     *
     * @param userId the user's ID
     * @return ProfileResponse DTO
     * @throws RuntimeException if user or profile not found
     */
    public ProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user: " + userId));

        return mapToResponse(profile, user);
    }

    /**
     * Create or update a user's profile.
     *
     * @param userId  the user's ID
     * @param request profile data
     * @return ProfileResponse DTO
     */
    public ProfileResponse saveOrUpdateProfile(String userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if profile already exists → update; else → create
        Profile profile = profileRepository.findByUserId(userId)
                .orElse(Profile.builder().userId(userId).build());

        // Map request fields to profile entity
        profile.setBio(request.getBio());
        profile.setSkills(request.getSkills());
        profile.setDomain(request.getDomain());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setAvailability(request.getAvailability());

        profile = profileRepository.save(profile);

        return mapToResponse(profile, user);
    }

    /**
     * Map a Profile entity and User entity into a ProfileResponse DTO.
     */
    private ProfileResponse mapToResponse(Profile profile, User user) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .role(user.getRole().name())
                .bio(profile.getBio())
                .skills(profile.getSkills())
                .domain(profile.getDomain())
                .experienceYears(profile.getExperienceYears())
                .availability(profile.getAvailability())
                .build();
    }
}
