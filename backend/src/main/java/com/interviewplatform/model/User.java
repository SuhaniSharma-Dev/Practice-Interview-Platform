package com.interviewplatform.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * User document — stores authentication and role information.
 * Maps to the 'users' collection in MongoDB.
 */
@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    /** Role can be INTERVIEWER or INTERVIEWEE */
    private Role role;

    @CreatedDate
    private LocalDateTime createdAt;
}
