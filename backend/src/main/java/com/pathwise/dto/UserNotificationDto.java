package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNotificationDto {
    private UUID id;
    private String title;
    private String message;
    private String type;
    private String link;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
