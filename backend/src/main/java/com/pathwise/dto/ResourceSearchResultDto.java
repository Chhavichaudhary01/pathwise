package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceSearchResultDto {
    private String query;
    private String matchedTopic;
    private String roadmapShUrl;
    private String summary;
    private List<ResourceDto> resources;
}
