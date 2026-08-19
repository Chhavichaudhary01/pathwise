package com.pathwise.controller;

import com.pathwise.domain.Roadmap;
import com.pathwise.domain.LearnerProfile;
import com.pathwise.engine.Sequencer;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.RoadmapRepository;
import com.pathwise.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapRepository roadmapRepository;
    private final LearnerProfileRepository profileRepository;
    private final Sequencer sequencer;

    @GetMapping
    public ResponseEntity<List<Roadmap>> getUserRoadmaps() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(roadmapRepository.findByUserId(userDetails.getId()));
    }

    @PostMapping("/generate")
    public ResponseEntity<Roadmap> generateRoadmap() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        LearnerProfile profile = profileRepository.findByUserId(userDetails.getId()).orElseThrow();
        
        // TODO: Full generation logic storing in DB. For now, returning empty roadmap.
        Roadmap roadmap = new Roadmap();
        roadmap.setUser(profile.getUser());
        roadmap.setTitle(profile.getGoal());
        roadmap.setStatus("ACTIVE");
        
        return ResponseEntity.ok(roadmapRepository.save(roadmap));
    }
}
