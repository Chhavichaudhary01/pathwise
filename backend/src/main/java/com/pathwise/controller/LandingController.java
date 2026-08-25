package com.pathwise.controller;

import com.pathwise.repository.CatalogItemRepository;
import com.pathwise.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/landing")
@RequiredArgsConstructor
public class LandingController {

    private final CatalogItemRepository catalogItemRepository;
    private final SkillRepository skillRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLandingData() {
        long totalCourses = catalogItemRepository.count();
        long totalSkills = skillRepository.count();

        Map<String, Object> data = Map.of(
                "appName", "PathWise",
                "tagline", "AI-Powered Personalized Career & Learning Path Recommender",
                "aiEngine", "Google Gemini 1.5 Flash + Text-Embedding-004",
                "database", "Neon PostgreSQL (Serverless)",
                "totalCatalogItems", totalCourses,
                "totalSkillsCovered", totalSkills,
                "tracks", new String[]{"Frontend Developer", "Data Analyst", "Machine Learning Engineer", "Product Manager", "Digital Marketer"},
                "status", "ONLINE"
        );

        return ResponseEntity.ok(data);
    }
}
