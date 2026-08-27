package com.pathwise.controller;

import com.pathwise.dto.PublicProfileDto;
import com.pathwise.service.PublicProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicProfileController {

    private final PublicProfileService publicProfileService;

    @GetMapping("/profile/{username}")
    public ResponseEntity<PublicProfileDto> getPublicProfile(@PathVariable("username") String username) {
        PublicProfileDto profile = publicProfileService.getPublicProfile(username);
        return ResponseEntity.ok(profile);
    }

    @GetMapping(value = "/og/{username}", produces = "image/svg+xml")
    public ResponseEntity<String> getOpenGraphImage(@PathVariable("username") String username) {
        PublicProfileDto profile = publicProfileService.getPublicProfile(username);
        String svg = publicProfileService.generateOpenGraphSvg(profile);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("image/svg+xml; charset=utf-8"));
        headers.set(HttpHeaders.CACHE_CONTROL, "public, max-age=3600");

        return ResponseEntity.ok()
                .headers(headers)
                .body(svg);
    }
}
