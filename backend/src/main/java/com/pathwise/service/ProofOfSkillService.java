package com.pathwise.service;

import com.pathwise.ai.AiProvider;
import com.pathwise.domain.RoadmapItem;
import com.pathwise.domain.User;
import com.pathwise.domain.VerifiedSkillBadge;
import com.pathwise.dto.BadgeMintResponse;
import com.pathwise.dto.CodingChallengeDto;
import com.pathwise.dto.CodingChallengeDto.ScenarioQuestionDto;
import com.pathwise.dto.CodingChallengeDto.TestCaseDto;
import com.pathwise.repository.RoadmapItemRepository;
import com.pathwise.repository.VerifiedSkillBadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProofOfSkillService {

    private final VerifiedSkillBadgeRepository badgeRepository;
    private final RoadmapItemRepository roadmapItemRepository;
    private final AiProvider aiProvider;

    /**
     * Generate an interactive 3-minute coding challenge or architectural scenario for any skill
     */
    public CodingChallengeDto generateChallenge(String skillNameInput, String topicTitleInput) {
        String skill = (skillNameInput != null && !skillNameInput.isBlank()) 
                ? skillNameInput.trim() 
                : (topicTitleInput != null ? topicTitleInput.trim() : "JavaScript");

        String topic = (topicTitleInput != null && !topicTitleInput.isBlank()) ? topicTitleInput.trim() : skill;
        String lower = (skill + " " + topic).toLowerCase();

        // 1. React & Frontend Challenges
        if (lower.contains("react") || lower.contains("hook") || lower.contains("state")) {
            return CodingChallengeDto.builder()
                    .skillName("React")
                    .topicTitle("Custom useToggle State Hook")
                    .challengeType("CODE_CHALLENGE")
                    .title("Implement a Clean useToggle Custom Hook")
                    .difficulty("Intermediate")
                    .timeLimitSeconds(180)
                    .language("javascript")
                    .instructions("### 🎯 Challenge: Custom `useToggle` Hook\n" +
                            "Write a function `useToggle(initialValue = false)` that returns a tuple `[state, toggle, setExplicit]`:\n" +
                            "- `state`: Current boolean value (defaults to `initialValue`).\n" +
                            "- `toggle(value)`: Toggles state if no argument is passed; or sets to explicit boolean if provided.\n" +
                            "- Must correctly handle alternating triggers and explicit overrides.")
                    .starterCode("function useToggle(initialValue = false) {\n" +
                            "  let state = Boolean(initialValue);\n" +
                            "  \n" +
                            "  const toggle = (val) => {\n" +
                            "    // TODO: implement toggle logic\n" +
                            "    state = typeof val === 'boolean' ? val : !state;\n" +
                            "    return state;\n" +
                            "  };\n" +
                            "  \n" +
                            "  const getState = () => state;\n" +
                            "  return { getState, toggle };\n" +
                            "}")
                    .testCases(List.of(
                            TestCaseDto.builder()
                                    .id("tc_1")
                                    .description("Initializes with default false and toggles to true")
                                    .inputCode("const t = useToggle(); t.toggle(); return t.getState();")
                                    .expectedOutput("true")
                                    .build(),
                            TestCaseDto.builder()
                                    .id("tc_2")
                                    .description("Toggles twice back to initial false")
                                    .inputCode("const t = useToggle(); t.toggle(); t.toggle(); return t.getState();")
                                    .expectedOutput("false")
                                    .build(),
                            TestCaseDto.builder()
                                    .id("tc_3")
                                    .description("Explicit boolean override sets exact state")
                                    .inputCode("const t = useToggle(false); t.toggle(true); return t.getState();")
                                    .expectedOutput("true")
                                    .build()
                    ))
                    .build();
        }

        // 2. JavaScript / TypeScript Core
        if (lower.contains("javascript") || lower.contains("typescript") || lower.contains("async") || lower.contains("promise")) {
            return CodingChallengeDto.builder()
                    .skillName("JavaScript")
                    .topicTitle("Array Flatten & Deduplicate (ES6+)")
                    .challengeType("CODE_CHALLENGE")
                    .title("Deep Array Flatten with Preservation of Order")
                    .difficulty("Intermediate")
                    .timeLimitSeconds(180)
                    .language("javascript")
                    .instructions("### 🎯 Challenge: Deep Flatten & Deduplicate\n" +
                            "Implement `flattenAndDedupe(arr)` that takes an arbitrarily nested array of numbers and returns a single flat array with unique elements preserved in first-occurrence order.")
                    .starterCode("function flattenAndDedupe(arr) {\n" +
                            "  // TODO: Recursively flatten and remove duplicate values\n" +
                            "  const flat = arr.flat(Infinity);\n" +
                            "  return [...new Set(flat)];\n" +
                            "}")
                    .testCases(List.of(
                            TestCaseDto.builder()
                                    .id("tc_1")
                                    .description("Flattens nested array [1, [2, [3, 4]]]")
                                    .inputCode("return JSON.stringify(flattenAndDedupe([1, [2, [3, 4]]]));")
                                    .expectedOutput("[1,2,3,4]")
                                    .build(),
                            TestCaseDto.builder()
                                    .id("tc_2")
                                    .description("Deduplicates duplicates in nested structures")
                                    .inputCode("return JSON.stringify(flattenAndDedupe([1, 2, [2, 3], [3, [4, 1]]]));")
                                    .expectedOutput("[1,2,3,4]")
                                    .build()
                    ))
                    .build();
        }

        // 3. SQL / Database Topics
        if (lower.contains("sql") || lower.contains("database") || lower.contains("postgres")) {
            return CodingChallengeDto.builder()
                    .skillName("SQL")
                    .topicTitle("Aggregation & Conditional Filtering")
                    .challengeType("SCENARIO_ANALYSIS")
                    .title("Architecting Efficient SQL Aggregation")
                    .difficulty("Intermediate")
                    .timeLimitSeconds(180)
                    .language("sql")
                    .instructions("### 🎯 SQL Scenario Analysis\nEvaluate the optimal SQL constructs for analytical aggregation and performance tuning.")
                    .scenarioQuestions(List.of(
                            ScenarioQuestionDto.builder()
                                    .id("sq_1")
                                    .scenario("You have an `orders` table with 10M rows. You need to find all customer IDs with more than 5 completed orders in the last 30 days. Which clause correctly filters the aggregated counts?")
                                    .options(List.of(
                                            "WHERE COUNT(order_id) > 5",
                                            "HAVING COUNT(order_id) > 5",
                                            "GROUP BY COUNT(order_id) > 5",
                                            "FILTER (COUNT(order_id) > 5)"
                                    ))
                                    .correctIndex(1)
                                    .explanation("HAVING is evaluated after GROUP BY aggregation to filter grouped result sets, whereas WHERE filters individual rows prior to grouping.")
                                    .build(),
                            ScenarioQuestionDto.builder()
                                    .id("sq_2")
                                    .scenario("To optimize queries filtering by `(customer_id, created_at)`, what type of index should you create on PostgreSQL?")
                                    .options(List.of(
                                            "Single-column B-Tree index on `created_at` only",
                                            "Composite B-Tree index on `(customer_id, created_at)`",
                                            "Full-text GIN index on customer_id",
                                            "Hash index on created_at"
                                    ))
                                    .correctIndex(1)
                                    .explanation("A composite B-Tree index on (customer_id, created_at) enables index-only scans matching both the equality filter and range ordering.")
                                    .build()
                    ))
                    .build();
        }

        // 4. Docker / DevOps / Cloud
        if (lower.contains("docker") || lower.contains("kubernetes") || lower.contains("ci/cd") || lower.contains("devops") || lower.contains("cloud")) {
            return CodingChallengeDto.builder()
                    .skillName("Docker & DevOps")
                    .topicTitle("Production Containerization & Multi-Stage Builds")
                    .challengeType("SCENARIO_ANALYSIS")
                    .title("Production Dockerfile Architecture")
                    .difficulty("Advanced")
                    .timeLimitSeconds(180)
                    .language("dockerfile")
                    .instructions("### 🎯 DevOps Architecture Assessment\nSelect the best practices for secure, lightweight production container deployments.")
                    .scenarioQuestions(List.of(
                            ScenarioQuestionDto.builder()
                                    .id("sq_1")
                                    .scenario("Why do modern Node.js and Spring Boot applications utilize Multi-Stage Docker builds in production?")
                                    .options(List.of(
                                            "To run tests concurrently on multiple machines",
                                            "To isolate build toolchains (e.g. Maven, npm devDependencies) from the final minimal runtime image",
                                            "To enable root permissions inside the container",
                                            "To bypass SSL certificate verification"
                                    ))
                                    .correctIndex(1)
                                    .explanation("Multi-stage builds leave compiler SDKs and build tools in temporary stages, minimizing image size and attack surface in the final runtime container.")
                                    .build(),
                            ScenarioQuestionDto.builder()
                                    .id("sq_2")
                                    .scenario("What Docker instruction should be configured to prevent containers from executing with root privileges?")
                                    .options(List.of(
                                            "RUN sudo app",
                                            "USER node (or a non-root UID)",
                                            "EXPOSE 80",
                                            "ENV ROOT=false"
                                    ))
                                    .correctIndex(1)
                                    .explanation("The USER instruction switches the container execution context to a non-root user, protecting the host system from container breakout vulnerabilities.")
                                    .build()
                    ))
                    .build();
        }

        // 5. General Fallback Algorithmic Challenge
        return CodingChallengeDto.builder()
                .skillName(skill)
                .topicTitle("Algorithmic Logic & String Formatting")
                .challengeType("CODE_CHALLENGE")
                .title("String Tokenizer & Slug Generator")
                .difficulty("Intermediate")
                .timeLimitSeconds(180)
                .language("javascript")
                .instructions("### 🎯 Challenge: URL Slug Formatter\nWrite `toKebabCase(str)` that transforms any phrase (with mixed spaces, underscores, camelCase) into lowercase kebab-case.")
                .starterCode("function toKebabCase(str) {\n" +
                        "  // TODO: Convert string to kebab-case\n" +
                        "  return str\n" +
                        "    .replace(/([a-z])([A-Z])/g, '$1-$2')\n" +
                        "    .replace(/[\\s_]+/g, '-')\n" +
                        "    .toLowerCase();\n" +
                        "}")
                .testCases(List.of(
                        TestCaseDto.builder()
                                .id("tc_1")
                                .description("Converts 'Hello World' to 'hello-world'")
                                .inputCode("return toKebabCase('Hello World');")
                                .expectedOutput("hello-world")
                                .build(),
                        TestCaseDto.builder()
                                .id("tc_2")
                                .description("Converts 'camelCaseExample' to 'camel-case-example'")
                                .inputCode("return toKebabCase('camelCaseExample');")
                                .expectedOutput("camel-case-example")
                                .build()
                ))
                .build();
    }

    /**
     * Verify test execution / answers, mint verifiable skill badge, and auto-complete roadmap item
     */
    @Transactional
    public BadgeMintResponse verifyAndMintBadge(
            User user,
            String skillNameInput,
            String topicTitleInput,
            int score,
            UUID roadmapItemId
    ) {
        String skillName = (skillNameInput != null && !skillNameInput.isBlank()) ? skillNameInput.trim() : "Engineering Competency";
        String topicTitle = (topicTitleInput != null && !topicTitleInput.isBlank()) ? topicTitleInput.trim() : skillName;

        boolean passed = score >= 75;
        if (!passed) {
            return BadgeMintResponse.builder()
                    .skillName(skillName)
                    .topicTitle(topicTitle)
                    .score(score)
                    .passed(false)
                    .message("Score " + score + "% did not meet the 75% verification threshold. Review the concept and try again!")
                    .build();
        }

        // Generate SHA-256 Tamper-Evident Verification Hash
        String rawHashInput = user.getId() + ":" + skillName + ":" + System.currentTimeMillis() + ":" + score;
        String verificationHash = generateSha256("pw_badge_" + rawHashInput);

        // Determine Badge Tier
        String tier = score >= 95 ? "DIAMOND" : score >= 85 ? "PLATINUM" : "GOLD";

        // Save or update badge record
        VerifiedSkillBadge badge = badgeRepository.findByUserIdAndSkillName(user.getId(), skillName)
                .orElseGet(() -> VerifiedSkillBadge.builder()
                        .user(user)
                        .skillName(skillName)
                        .build());

        badge.setTopicTitle(topicTitle);
        badge.setScore(score);
        badge.setVerificationHash(verificationHash);
        badge.setBadgeTier(tier);
        badge.setIssuedAt(OffsetDateTime.now());
        badge = badgeRepository.save(badge);

        // Auto-complete roadmap item if provided
        if (roadmapItemId != null) {
            roadmapItemRepository.findById(roadmapItemId).ifPresent(item -> {
                item.setStatus("COMPLETED");
                roadmapItemRepository.save(item);
            });
        }

        String verificationUrl = "http://localhost:5173/verify/" + verificationHash.substring(0, 16);

        return BadgeMintResponse.builder()
                .badgeId(badge.getId())
                .skillName(skillName)
                .topicTitle(topicTitle)
                .score(score)
                .verificationHash(verificationHash)
                .badgeTier(tier)
                .issuedAt(badge.getIssuedAt())
                .verificationUrl(verificationUrl)
                .passed(true)
                .message("🎉 Skill verified with " + score + "% score! Verifiable " + tier + " Badge minted to your public profile.")
                .build();
    }

    /**
     * Retrieve all minted badges for a user
     */
    @Transactional(readOnly = true)
    public List<VerifiedSkillBadge> getUserBadges(UUID userId) {
        return badgeRepository.findByUserId(userId);
    }

    private String generateSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder("0x");
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return "0x" + UUID.randomUUID().toString().replace("-", "");
        }
    }
}
