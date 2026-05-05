package com.interviewplatform.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Feedback document — stores post-session feedback from each participant.
 */
@Document(collection = "feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    private String id;

    /** The match/session this feedback is for */
    @Indexed
    private String matchRequestId;

    /** The user who submitted the feedback */
    @Indexed
    private String fromUserId;

    /** The user being reviewed */
    private String toUserId;

    /** Rating 1-5 */
    private int rating;

    /** Free-text comments */
    private String comments;

    @CreatedDate
    private LocalDateTime createdAt;
}
