package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDto {
    private String title;
    private String url;
    private String type; // OFFICIAL_DOCS, ROADMAP_GUIDE, PRACTICE_PROJECT, VIDEO_TUTORIAL, ARTICLE
    private String description;
    private String provider;
    private String level;
    private boolean isOfficial;
}
