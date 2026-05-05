package com.interviewplatform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables MongoDB auditing for @CreatedDate annotations.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
