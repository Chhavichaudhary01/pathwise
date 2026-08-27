package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private UUID id;
    private String role;
    private String content;
    private Boolean isSearchGrounded;
    private List<SourceCitation> sources;
    private List<String> followUpQuestions;
    private OffsetDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SourceCitation {
        private String index; // e.g. "1", "2"
        private String title;
        private String url;
        private String snippet;
        private String domain;
    }
}
