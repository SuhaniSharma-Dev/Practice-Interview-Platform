package com.interviewplatform.repository;

import com.interviewplatform.model.MatchRequest;
import com.interviewplatform.model.MatchStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for MatchRequest documents.
 */
@Repository
public interface MatchRequestRepository extends MongoRepository<MatchRequest, String> {

    /** Find all match requests where this user is the interviewee */
    List<MatchRequest> findByIntervieweeId(String intervieweeId);

    /** Find all match requests where this user is the interviewer */
    List<MatchRequest> findByInterviewerId(String interviewerId);

    /** Check if a pending request already exists between two users */
    boolean existsByIntervieweeIdAndInterviewerIdAndStatus(
            String intervieweeId, String interviewerId, MatchStatus status);

    /** Find requests by interviewee or interviewer */
    List<MatchRequest> findByIntervieweeIdOrInterviewerId(
            String intervieweeId, String interviewerId);
}
