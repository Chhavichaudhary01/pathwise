package com.pathwise.controller;

import com.pathwise.domain.User;
import com.pathwise.domain.RefreshToken;
import com.pathwise.dto.*;
import com.pathwise.exception.TokenRefreshException;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.JwtUtils;
import com.pathwise.security.RefreshTokenService;
import com.pathwise.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final com.pathwise.repository.LearnerProfileRepository learnerProfileRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());
        boolean isComplete = learnerProfileRepository.findByUserId(userDetails.getId())
                .map(p -> Boolean.TRUE.equals(p.getIsProfileComplete()))
                .orElse(false);

        return ResponseEntity.ok(new JwtResponse(jwt, refreshToken.getToken(), userDetails.getId(), userDetails.getUsername(), isComplete));
    }

    @PostMapping("/demo")
    public ResponseEntity<?> demoLogin() {
        String demoEmail = "demo@pathwise.io";
        String demoPassword = "DemoPassword123!";

        User user = userRepository.findByEmail(demoEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .email(demoEmail)
                    .password(encoder.encode(demoPassword))
                    .build();
            return userRepository.save(newUser);
        });

        // Ensure demo profile exists
        if (!learnerProfileRepository.existsByUserId(user.getId())) {
            com.pathwise.domain.LearnerProfile profile = com.pathwise.domain.LearnerProfile.builder()
                    .user(user)
                    .goal("Full Stack Web Developer with React & Spring Boot")
                    .currentSkills("[\"html\", \"css\", \"js\"]")
                    .interests("[\"Web Development\", \"Cloud Architecture\"]")
                    .weeklyHours(10)
                    .learningStyle("hands-on")
                    .streakCount(1)
                    .longestStreak(1)
                    .lastActiveDate(java.time.LocalDate.now())
                    .dailyReminderEnabled(true)
                    .dailyReminderTime("09:00")
                    .isProfileComplete(true)
                    .build();
            learnerProfileRepository.save(profile);
        }

        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(new JwtResponse(jwt, refreshToken.getToken(), user.getId(), user.getEmail(), true));
    }

    @PostMapping("/firebase")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> authenticateFirebase(@RequestBody com.pathwise.dto.FirebaseAuthRequest request) {
        try {
            String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
            if (email.isBlank()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Valid email is required for Firebase authentication"));
            }

            log.info("Processing Firebase OAuth login for email: {}", email);

            // Find or provision user in Neon DB
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .email(email)
                        .password(encoder.encode(java.util.UUID.randomUUID().toString()))
                        .googleId(request.getUid())
                        .build();
                return userRepository.save(newUser);
            });

            if (request.getUid() != null && user.getGoogleId() == null) {
                user.setGoogleId(request.getUid());
                userRepository.save(user);
            }

            // Initialize or update learner profile
            com.pathwise.domain.LearnerProfile profile = learnerProfileRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        com.pathwise.domain.LearnerProfile newProf = com.pathwise.domain.LearnerProfile.builder()
                                .user(user)
                                .goal("Full Stack Web Developer")
                                .weeklyHours(10)
                                .learningStyle("hands-on")
                                .currentSkills("[]")
                                .interests("[]")
                                .learningHistory("[]")
                                .streakCount(1)
                                .longestStreak(1)
                                .lastActiveDate(java.time.LocalDate.now())
                                .dailyReminderEnabled(true)
                                .dailyReminderTime("09:00")
                                .notificationEmail(email)
                                .isProfileComplete(false)
                                .build();
                        return learnerProfileRepository.save(newProf);
                    });

            // Sync Google photo if profile avatar is not yet set
            if (request.getPhotoUrl() != null && !request.getPhotoUrl().isBlank()) {
                if (profile.getAvatarUrl() == null || profile.getAvatarUrl().isBlank()) {
                    profile.setAvatarUrl(request.getPhotoUrl());
                    learnerProfileRepository.save(profile);
                }
            }

            String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
            boolean isComplete = Boolean.TRUE.equals(profile.getIsProfileComplete());

            log.info("Firebase login successful for user ID: {}", user.getId());
            return ResponseEntity.ok(new JwtResponse(jwt, refreshToken.getToken(), user.getId(), user.getEmail(), isComplete));
        } catch (Exception e) {
            log.error("Firebase authentication error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new MessageResponse("Firebase authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        String email = signUpRequest.getEmail() != null ? signUpRequest.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = User.builder()
                .email(email)
                .password(encoder.encode(signUpRequest.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        // Initialize incomplete profile for new signups
        com.pathwise.domain.LearnerProfile profile = com.pathwise.domain.LearnerProfile.builder()
                .user(savedUser)
                .isProfileComplete(false)
                .weeklyHours(10)
                .learningStyle("hands-on")
                .currentSkills("[]")
                .interests("[]")
                .learningHistory("[]")
                .build();
        learnerProfileRepository.save(profile);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getEmail());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database!"));
    }
    
    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        refreshTokenService.deleteByUserId(userDetails.getId());
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }
}
