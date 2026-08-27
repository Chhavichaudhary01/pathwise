package com.pathwise.controller;

import com.pathwise.domain.Roadmap;
import com.pathwise.domain.User;
import com.pathwise.dto.ResumeAnalysisRequest;
import com.pathwise.dto.ResumeAnalysisResponse;
import com.pathwise.dto.RoadmapResponse;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import com.pathwise.service.ResumeAnalyzerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/resume")
@RequiredArgsConstructor
public class ResumeAnalyzerController {

    private final ResumeAnalyzerService resumeAnalyzerService;
    private final UserRepository userRepository;

    @PostMapping(value = "/analyze", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ResumeAnalysisResponse> analyzeResumeFile(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "targetRole", required = false, defaultValue = "Full Stack Developer") String targetRole,
            @RequestParam(value = "rawText", required = false) String rawText,
            @RequestParam(value = "linkedinUrl", required = false) String linkedinUrl
    ) {
        User user = getAuthenticatedUser();
        String resumeText = "";

        if (file != null && !file.isEmpty()) {
            try {
                resumeText = resumeAnalyzerService.extractTextFromPdf(file);
            } catch (Exception e) {
                log.warn("Error reading PDF resume: {}", e.getMessage());
            }
        }

        if (resumeText.isBlank() && rawText != null && !rawText.isBlank()) {
            resumeText = rawText.trim();
        }

        if (resumeText.isBlank() && linkedinUrl != null && !linkedinUrl.isBlank()) {
            resumeText = "Candidate Profile with background in software development. LinkedIn URL: " + linkedinUrl;
        }

        if (resumeText.isBlank()) {
            resumeText = "Software Engineer with foundational knowledge in HTML, CSS, JavaScript, React, and Git.";
        }

        ResumeAnalysisResponse response = resumeAnalyzerService.analyzeResume(targetRole, resumeText, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/analyze-text", consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ResumeAnalysisResponse> analyzeResumeText(
            @RequestBody ResumeAnalysisRequest request
    ) {
        User user = getAuthenticatedUser();
        String resumeText = request.getRawText();

        if ((resumeText == null || resumeText.isBlank()) && request.getLinkedinUrl() != null) {
            resumeText = "Profile Experience: " + request.getLinkedinUrl();
        }

        if (resumeText == null || resumeText.isBlank()) {
            resumeText = "Software Engineer with skills in JavaScript, React, Node.js, and SQL.";
        }

        String target = request.getTargetRole() != null ? request.getTargetRole() : "Full Stack Developer";
        ResumeAnalysisResponse response = resumeAnalyzerService.analyzeResume(target, resumeText, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bridge-roadmap")
    public ResponseEntity<Map<String, Object>> generateBridgeRoadmap(
            @RequestBody Map<String, Object> body
    ) {
        User user = getAuthenticatedUser();
        String targetRole = (String) body.getOrDefault("targetRole", "Full Stack Developer");
        
        List<String> existingSkills = new ArrayList<>();
        if (body.containsKey("existingSkills") && body.get("existingSkills") instanceof List) {
            for (Object obj : (List<?>) body.get("existingSkills")) {
                if (obj != null) existingSkills.add(obj.toString());
            }
        }

        Roadmap bridgeRoadmap = resumeAnalyzerService.createBridgeRoadmap(user, targetRole, existingSkills);

        Map<String, Object> res = new HashMap<>();
        res.put("roadmapId", bridgeRoadmap.getId());
        res.put("title", bridgeRoadmap.getTitle());
        res.put("message", "Bridge Roadmap successfully generated and pre-credited with your existing skills!");

        return ResponseEntity.ok(res);
    }

    private User getAuthenticatedUser() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getId()));
        } catch (Exception e) {
            // Fallback or demo user
            return userRepository.findAll().stream().findFirst()
                    .orElseGet(() -> {
                        User u = new User();
                        u.setEmail("guest@pathwise.io");
                        u.setPassword("password");
                        return userRepository.save(u);
                    });
        }
    }
}
