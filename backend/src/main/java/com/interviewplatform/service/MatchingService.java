package com.interviewplatform.service;

import com.interviewplatform.dto.*;
import com.interviewplatform.model.*;
import com.interviewplatform.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MatchingService — implements the core matching algorithm and match request management.
 *
 * MATCHING ALGORITHM:
 *   +3 for each matching skill
 *   +2 for same domain
 *   +1 for each overlapping availability slot
 *   Returns top 5 ranked interviewers
 *
 * Stores match results in Redis with 10-minute TTL for real-time availability tracking.
 */
@Service
public class MatchingService {

    private static final Logger log = LoggerFactory.getLogger(MatchingService.class);

    private static final int SKILL_MATCH_SCORE = 3;
    private static final int DOMAIN_MATCH_SCORE = 2;
    private static final int AVAILABILITY_MATCH_SCORE = 1;
    private static final int TOP_MATCHES = 5;
    private static final Duration REDIS_TTL = Duration.ofMinutes(10);

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final MatchRequestRepository matchRequestRepository;
    private final FeedbackRepository feedbackRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public MatchingService(UserRepository userRepository,
                           ProfileRepository profileRepository,
                           MatchRequestRepository matchRequestRepository,
                           FeedbackRepository feedbackRepository,
                           RedisTemplate<String, Object> redisTemplate) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.matchRequestRepository = matchRequestRepository;
        this.feedbackRepository = feedbackRepository;
        this.redisTemplate = redisTemplate;
    }

    // ───────────────────────────────────────────────
    //  AUTO MATCH — score and rank interviewers
    // ───────────────────────────────────────────────

    /**
     * Automatically match an interviewee with the best interviewers.
     *
     * @param intervieweeUserId the interviewee's user ID
     * @return list of top-5 ranked interviewers
     */
    public List<MatchScoreResponse> autoMatch(String intervieweeUserId) {
        // 1. Get interviewee profile
        Profile intervieweeProfile = profileRepository.findByUserId(intervieweeUserId)
                .orElseThrow(() -> new RuntimeException(
                        "Profile not found. Please set up your profile first."));

        // 2. Get all interviewers
        List<User> interviewers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.INTERVIEWER)
                .collect(Collectors.toList());

        if (interviewers.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Get interviewer user IDs and fetch their profiles
        List<String> interviewerIds = interviewers.stream()
                .map(User::getId)
                .collect(Collectors.toList());

        List<Profile> interviewerProfiles = profileRepository.findByUserIdIn(interviewerIds);

        // Build a userId -> User map for quick lookup
        Map<String, User> userMap = interviewers.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // 4. Score each interviewer
        List<MatchScoreResponse> scoredMatches = new ArrayList<>();

        for (Profile interviewerProfile : interviewerProfiles) {
            User interviewer = userMap.get(interviewerProfile.getUserId());
            if (interviewer == null) continue;

            // Calculate skill overlap: +3 per matching skill
            int skillOverlap = calculateSkillOverlap(
                    intervieweeProfile.getSkills(),
                    interviewerProfile.getSkills());

            // Calculate domain match: +2 if same domain
            boolean domainMatch = isDomainMatch(
                    intervieweeProfile.getDomain(),
                    interviewerProfile.getDomain());

            // Calculate availability overlap: +1 per overlapping slot
            int availabilityOverlap = calculateAvailabilityOverlap(
                    intervieweeProfile.getAvailability(),
                    interviewerProfile.getAvailability());

            // Total score
            int totalScore = (skillOverlap * SKILL_MATCH_SCORE)
                    + (domainMatch ? DOMAIN_MATCH_SCORE : 0)
                    + (availabilityOverlap * AVAILABILITY_MATCH_SCORE);

            scoredMatches.add(MatchScoreResponse.builder()
                    .interviewerId(interviewer.getId())
                    .interviewerName(interviewer.getName())
                    .domain(interviewerProfile.getDomain())
                    .experienceYears(interviewerProfile.getExperienceYears())
                    .matchScore(totalScore)
                    .skillOverlap(skillOverlap)
                    .domainMatch(domainMatch)
                    .availabilityOverlap(availabilityOverlap)
                    .build());
        }

        // 5. Sort by score descending and return top 5
        scoredMatches.sort(Comparator.comparingInt(MatchScoreResponse::getMatchScore).reversed());
        List<MatchScoreResponse> topMatches = scoredMatches.stream()
                .limit(TOP_MATCHES)
                .collect(Collectors.toList());

        // 6. Cache in Redis with 10-minute TTL
        try {
            String cacheKey = "match:auto:" + intervieweeUserId;
            redisTemplate.opsForValue().set(cacheKey, topMatches, REDIS_TTL);
            log.info("Cached auto-match results for user {} with TTL {}min",
                    intervieweeUserId, REDIS_TTL.toMinutes());
        } catch (Exception e) {
            log.warn("Redis unavailable, skipping cache: {}", e.getMessage());
        }

        return topMatches;
    }

    // ───────────────────────────────────────────────
    //  BROWSE INTERVIEWERS
    // ───────────────────────────────────────────────

    /**
     * List all available interviewers with their profiles.
     *
     * @return list of ProfileResponse DTOs for all interviewers
     */
    public List<ProfileResponse> listInterviewers() {
        List<User> interviewers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.INTERVIEWER)
                .collect(Collectors.toList());

        List<String> ids = interviewers.stream().map(User::getId).collect(Collectors.toList());
        List<Profile> profiles = profileRepository.findByUserIdIn(ids);

        Map<String, User> userMap = interviewers.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return profiles.stream()
                .map(p -> {
                    User u = userMap.get(p.getUserId());
                    return ProfileResponse.builder()
                            .id(p.getId())
                            .userId(u.getId())
                            .userName(u.getName())
                            .userEmail(u.getEmail())
                            .role(u.getRole().name())
                            .bio(p.getBio())
                            .skills(p.getSkills())
                            .domain(p.getDomain())
                            .experienceYears(p.getExperienceYears())
                            .availability(p.getAvailability())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ───────────────────────────────────────────────
    //  MANUAL MATCH REQUEST
    // ───────────────────────────────────────────────

    /**
     * Send a manual match request from interviewee to a specific interviewer.
     *
     * @param intervieweeId the requesting interviewee's user ID
     * @param interviewerId the target interviewer's user ID
     * @return MatchRequestResponse DTO
     */
    public MatchRequestResponse sendMatchRequest(String intervieweeId, String interviewerId) {
        // Validate both users exist
        User interviewee = userRepository.findById(intervieweeId)
                .orElseThrow(() -> new RuntimeException("Interviewee not found"));

        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found"));

        // Ensure the interviewer has the correct role
        if (interviewer.getRole() != Role.INTERVIEWER) {
            throw new RuntimeException("Target user is not an interviewer");
        }

        // Check for duplicate pending requests
        if (matchRequestRepository.existsByIntervieweeIdAndInterviewerIdAndStatus(
                intervieweeId, interviewerId, MatchStatus.PENDING)) {
            throw new RuntimeException("A pending request already exists with this interviewer");
        }

        // Create the match request
        MatchRequest matchRequest = MatchRequest.builder()
                .intervieweeId(intervieweeId)
                .interviewerId(interviewerId)
                .status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        matchRequest = matchRequestRepository.save(matchRequest);

        // Cache match request in Redis for real-time tracking
        try {
            String cacheKey = "match:request:" + matchRequest.getId();
            redisTemplate.opsForValue().set(cacheKey, matchRequest, REDIS_TTL);
        } catch (Exception e) {
            log.warn("Redis unavailable, skipping cache: {}", e.getMessage());
        }

        return MatchRequestResponse.builder()
                .id(matchRequest.getId())
                .intervieweeId(intervieweeId)
                .intervieweeName(interviewee.getName())
                .interviewerId(interviewerId)
                .interviewerName(interviewer.getName())
                .status(matchRequest.getStatus().name())
                .createdAt(matchRequest.getCreatedAt().toString())
                .build();
    }

    // ───────────────────────────────────────────────
    //  VIEW MATCH REQUESTS
    // ───────────────────────────────────────────────

    /**
     * Get all match requests for a user (both incoming and outgoing).
     *
     * @param userId user's ID
     * @return list of MatchRequestResponse DTOs
     */
    public List<MatchRequestResponse> getMatchRequests(String userId) {
        List<MatchRequest> requests = matchRequestRepository
                .findByIntervieweeIdOrInterviewerId(userId, userId);

        return requests.stream()
                .map(req -> {
                    String intervieweeName = userRepository.findById(req.getIntervieweeId())
                            .map(User::getName).orElse("Unknown");
                    String interviewerName = userRepository.findById(req.getInterviewerId())
                            .map(User::getName).orElse("Unknown");
                    boolean feedbackDone = feedbackRepository
                            .existsByMatchRequestIdAndFromUserId(req.getId(), userId);

                    return MatchRequestResponse.builder()
                            .id(req.getId())
                            .intervieweeId(req.getIntervieweeId())
                            .intervieweeName(intervieweeName)
                            .interviewerId(req.getInterviewerId())
                            .interviewerName(interviewerName)
                            .status(req.getStatus().name())
                            .roomId(req.getRoomId())
                            .scheduledAt(req.getScheduledAt() != null
                                    ? req.getScheduledAt().toString() : null)
                            .feedbackSubmitted(feedbackDone)
                            .createdAt(req.getCreatedAt() != null
                                    ? req.getCreatedAt().toString() : "")
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ───────────────────────────────────────────────
    //  UPDATE SESSION STATUS
    // ───────────────────────────────────────────────

    /**
     * Update session status: PENDING→ACCEPTED→SCHEDULED→COMPLETED.
     * Generates a roomId when transitioning to SCHEDULED.
     */
    public MatchRequestResponse updateSessionStatus(String requestId, String newStatus,
                                                     String scheduledAt, String currentUserId) {
        MatchRequest request = matchRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        MatchStatus targetStatus;
        try {
            targetStatus = MatchStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        // Validate transition
        validateStatusTransition(request.getStatus(), targetStatus);

        request.setStatus(targetStatus);

        // When scheduling, set the scheduled time and generate a unique room ID
        if (targetStatus == MatchStatus.SCHEDULED) {
            if (scheduledAt != null && !scheduledAt.isEmpty()) {
                request.setScheduledAt(LocalDateTime.parse(scheduledAt));
            } else {
                request.setScheduledAt(LocalDateTime.now().plusHours(1));
            }
            request.setRoomId("room-" + UUID.randomUUID().toString().substring(0, 8));
        }

        request = matchRequestRepository.save(request);

        String intervieweeName = userRepository.findById(request.getIntervieweeId())
                .map(User::getName).orElse("Unknown");
        String interviewerName = userRepository.findById(request.getInterviewerId())
                .map(User::getName).orElse("Unknown");
        boolean feedbackDone = feedbackRepository
                .existsByMatchRequestIdAndFromUserId(requestId, currentUserId);

        return MatchRequestResponse.builder()
                .id(request.getId())
                .intervieweeId(request.getIntervieweeId())
                .intervieweeName(intervieweeName)
                .interviewerId(request.getInterviewerId())
                .interviewerName(interviewerName)
                .status(request.getStatus().name())
                .roomId(request.getRoomId())
                .scheduledAt(request.getScheduledAt() != null
                        ? request.getScheduledAt().toString() : null)
                .feedbackSubmitted(feedbackDone)
                .createdAt(request.getCreatedAt() != null
                        ? request.getCreatedAt().toString() : "")
                .build();
    }

    /** Validate allowed status transitions */
    private void validateStatusTransition(MatchStatus current, MatchStatus target) {
        boolean valid = switch (current) {
            case PENDING -> target == MatchStatus.ACCEPTED || target == MatchStatus.REJECTED;
            case ACCEPTED -> target == MatchStatus.SCHEDULED;
            case SCHEDULED -> target == MatchStatus.COMPLETED;
            default -> false;
        };
        if (!valid) {
            throw new RuntimeException(
                    "Cannot transition from " + current + " to " + target);
        }
    }

    // ───────────────────────────────────────────────
    //  FEEDBACK
    // ───────────────────────────────────────────────

    /**
     * Submit feedback after a completed session.
     */
    public FeedbackResponse submitFeedback(String fromUserId, FeedbackRequest req) {
        MatchRequest match = matchRequestRepository.findById(req.getMatchRequestId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (match.getStatus() != MatchStatus.COMPLETED) {
            throw new RuntimeException("Feedback can only be submitted for completed sessions");
        }

        if (feedbackRepository.existsByMatchRequestIdAndFromUserId(
                req.getMatchRequestId(), fromUserId)) {
            throw new RuntimeException("You have already submitted feedback for this session");
        }

        // Determine who the feedback is for
        String toUserId = fromUserId.equals(match.getIntervieweeId())
                ? match.getInterviewerId() : match.getIntervieweeId();

        Feedback feedback = Feedback.builder()
                .matchRequestId(req.getMatchRequestId())
                .fromUserId(fromUserId)
                .toUserId(toUserId)
                .rating(req.getRating())
                .comments(req.getComments())
                .createdAt(LocalDateTime.now())
                .build();

        feedback = feedbackRepository.save(feedback);

        String fromName = userRepository.findById(fromUserId)
                .map(User::getName).orElse("Unknown");
        String toName = userRepository.findById(toUserId)
                .map(User::getName).orElse("Unknown");

        return FeedbackResponse.builder()
                .id(feedback.getId())
                .matchRequestId(feedback.getMatchRequestId())
                .fromUserId(fromUserId)
                .fromUserName(fromName)
                .toUserId(toUserId)
                .toUserName(toName)
                .rating(feedback.getRating())
                .comments(feedback.getComments())
                .createdAt(feedback.getCreatedAt().toString())
                .build();
    }

    /** Check if user has submitted feedback for a session */
    public boolean hasFeedback(String matchRequestId, String userId) {
        return feedbackRepository.existsByMatchRequestIdAndFromUserId(matchRequestId, userId);
    }

    // ───────────────────────────────────────────────
    //  SCORING HELPERS
    // ───────────────────────────────────────────────

    /**
     * Count matching skills between two skill lists (case-insensitive).
     */
    private int calculateSkillOverlap(List<String> skills1, List<String> skills2) {
        if (skills1 == null || skills2 == null) return 0;

        Set<String> normalizedSkills2 = skills2.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        return (int) skills1.stream()
                .map(String::toLowerCase)
                .filter(normalizedSkills2::contains)
                .count();
    }

    /**
     * Check if two domains match (case-insensitive).
     */
    private boolean isDomainMatch(String domain1, String domain2) {
        if (domain1 == null || domain2 == null) return false;
        return domain1.equalsIgnoreCase(domain2);
    }

    /**
     * Count overlapping availability slots across all days.
     * Two slots overlap if they are identical strings on the same day.
     */
    private int calculateAvailabilityOverlap(
            Map<String, List<String>> avail1,
            Map<String, List<String>> avail2) {

        if (avail1 == null || avail2 == null) return 0;

        int overlap = 0;
        for (Map.Entry<String, List<String>> entry : avail1.entrySet()) {
            String day = entry.getKey();
            List<String> slots1 = entry.getValue();
            List<String> slots2 = avail2.get(day);

            if (slots2 != null) {
                Set<String> slotSet2 = new HashSet<>(slots2);
                overlap += (int) slots1.stream().filter(slotSet2::contains).count();
            }
        }
        return overlap;
    }
}
