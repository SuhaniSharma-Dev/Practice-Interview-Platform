package com.interviewplatform.repository;

import com.interviewplatform.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    /** Check if user already submitted feedback for this session */
    boolean existsByMatchRequestIdAndFromUserId(String matchRequestId, String fromUserId);

    /** Find feedback for a specific session */
    List<Feedback> findByMatchRequestId(String matchRequestId);

    /** Find all feedback given by a user */
    List<Feedback> findByFromUserId(String fromUserId);

    /** Find all feedback received by a user */
    List<Feedback> findByToUserId(String toUserId);
}
