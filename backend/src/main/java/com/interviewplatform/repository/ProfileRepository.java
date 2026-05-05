package com.interviewplatform.repository;

import com.interviewplatform.model.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MongoDB repository for Profile documents.
 */
@Repository
public interface ProfileRepository extends MongoRepository<Profile, String> {

    Optional<Profile> findByUserId(String userId);

    boolean existsByUserId(String userId);

    /** Find all profiles for users with a specific role (via user IDs) */
    List<Profile> findByUserIdIn(List<String> userIds);
}
