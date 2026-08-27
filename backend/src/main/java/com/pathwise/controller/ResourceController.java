package com.pathwise.controller;

import com.pathwise.dto.ResourceGuideDto;
import com.pathwise.dto.ResourceSearchResultDto;
import com.pathwise.engine.RoadmapScraperService;
import com.pathwise.service.ResourceGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/resources", "/api/resources"})
@RequiredArgsConstructor
public class ResourceController {

    private final RoadmapScraperService roadmapScraperService;
    private final ResourceGuideService resourceGuideService;

    @GetMapping("/guide")
    public ResponseEntity<ResourceGuideDto> getResourceGuide(
            @RequestParam(required = false, defaultValue = "React.js & Hooks") String topic,
            @RequestParam(required = false) UUID itemId) {
        ResourceGuideDto guide = resourceGuideService.getGuideForTopic(topic, itemId);
        return ResponseEntity.ok(guide);
    }

    @GetMapping("/search")
    public ResponseEntity<ResourceSearchResultDto> searchResources(@RequestParam(defaultValue = "Full Stack Development") String query) {
        ResourceSearchResultDto results = roadmapScraperService.searchAndScrapeResources(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/resolve")
    public ResponseEntity<Map<String, String>> resolveSkillUrl(
            @RequestParam String skill, 
            @RequestParam(required = false) String roadmap) {
        String url = roadmapScraperService.resolveGranularResourceUrl(skill, roadmap);
        return ResponseEntity.ok(Map.of("skill", skill, "url", url));
    }
}
