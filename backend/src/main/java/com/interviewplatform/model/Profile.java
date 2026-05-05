package com.interviewplatform.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

/**
 * Profile document — stores user's professional details and availability.
 * Maps to the 'profiles' collection in MongoDB.
 */
@Document(collection = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    private String id;

    /** Reference to the User document */
    @Indexed(unique = true)
    private String userId;

    private String bio;

    /** List of technical skills (e.g., ["Java", "React", "System Design"]) */
    private List<String> skills;

    /** Primary domain (e.g., "Backend", "Frontend", "Data Science") */
    private String domain;

    /** Years of professional experience */
    private int experienceYears;

    /**
     * Availability slots stored as a map:
     * key = day of week (e.g., "MONDAY")
     * value = list of time slots (e.g., ["09:00-11:00", "14:00-16:00"])
     */
    private Map<String, List<String>> availability;
}
