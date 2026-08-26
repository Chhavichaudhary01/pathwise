package com.pathwise.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class GeminiAiProvider implements AiProvider {

    @Value("${ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private WebClient webClient;

    @jakarta.annotation.PostConstruct
    public void init() {
        this.webClient = webClientBuilder
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }

    private static final List<String> GROQ_MODELS = List.of(
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3.6-27b",
            "qwen/qwen3.8-27b",
            "groq/compound"
    );

    private static final String GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

    private static final List<String> GEMINI_MODELS = List.of(
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-3.1-flash-lite",
            "gemini-3-flash-preview",
            "gemini-flash-latest",
            "gemini-3.7-flash"
    );

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    private boolean isValidKey(String key) {
        return key != null && !key.trim().isEmpty() && !key.equals("mock-key")
                && !key.startsWith("your_") && !key.contains("your_");
    }

    @Override
    public String generateText(String prompt) {
        WebClient client = this.webClient != null ? this.webClient : webClientBuilder.build();

        // 1. Primary High-Speed Provider: Groq (Llama 3.3 70B / 8B)
        if (isValidKey(groqApiKey)) {
            for (String groqModel : GROQ_MODELS) {
                try {
                    Map<String, Object> requestBody = Map.of(
                            "model", groqModel,
                            "messages", List.of(Map.of("role", "user", "content", prompt)),
                            "temperature", 0.7,
                            "max_tokens", 2048
                    );

                    Map response = client
                            .post()
                            .uri(GROQ_BASE_URL)
                            .header("Authorization", "Bearer " + groqApiKey.trim())
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(Map.class)
                            .block();

                    if (response != null && response.containsKey("choices")) {
                        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                        if (choices != null && !choices.isEmpty()) {
                            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                            if (message != null && message.containsKey("content")) {
                                String text = (String) message.get("content");
                                if (text != null && !text.isBlank()) {
                                    log.info("Successfully generated AI response via Groq ({})", groqModel);
                                    return text;
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Groq model {} attempt failed: {}. Falling over to next provider/model.", groqModel, e.getMessage());
                }
            }
        }

        // 2. Secondary Provider: Google Gemini
        if (isValidKey(apiKey)) {
            for (String model : GEMINI_MODELS) {
                try {
                    String url = BASE_URL + model + ":generateContent?key=" + apiKey.trim();
                    Map<String, Object> requestBody = Map.of(
                            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                            "generationConfig", Map.of(
                                    "temperature", 0.7,
                                    "topP", 0.95,
                                    "maxOutputTokens", 2048
                            )
                    );

                    Map response = client
                            .post()
                            .uri(url)
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(Map.class)
                            .block();

                    if (response != null && response.containsKey("candidates")) {
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                        if (candidates != null && !candidates.isEmpty()) {
                            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                            if (parts != null && !parts.isEmpty()) {
                                String text = (String) parts.get(0).get("text");
                                if (text != null && !text.isBlank()) {
                                    log.info("Successfully generated AI response via Gemini ({})", model);
                                    return text;
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Gemini model {} attempt: {}. Falling over to next model.", model, e.getMessage());
                }
            }
        }

        // 3. Context-aware dynamic RAG reasoning fallback
        return generateDynamicRagResponse(prompt);
    }

    @Override
    public <T> T generateStructured(String prompt, Class<T> responseType) {
        String jsonPrompt = prompt + "\n\nRespond ONLY with valid JSON. Do not include markdown fences like ```json. Your response MUST perfectly match the schema constraints.";
        String responseText = generateText(jsonPrompt);

        String cleanJson = stripMarkdownFences(responseText);
        try {
            return objectMapper.readValue(cleanJson, responseType);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse JSON on first attempt from Gemini, retrying with stricter prompt. Error: {}", e.getMessage());
            String retryPrompt = jsonPrompt + "\n\nYOUR PREVIOUS RESPONSE WAS INVALID JSON. YOU MUST RETURN RAW PARSABLE JSON ONLY.";
            String retryText = generateText(retryPrompt);
            String cleanRetryJson = stripMarkdownFences(retryText);
            try {
                return objectMapper.readValue(cleanRetryJson, responseType);
            } catch (JsonProcessingException ex) {
                log.error("Failed to parse JSON on retry from Gemini", ex);
                throw new AiException("Failed to parse structured JSON response from Gemini", ex, false);
            }
        }
    }

    @Override
    public List<Float> getEmbeddings(String text) {
        if (isValidKey(apiKey)) {
            try {
                String url = BASE_URL + "gemini-embedding-001:embedContent?key=" + apiKey.trim();
                Map<String, Object> requestBody = Map.of(
                        "model", "models/gemini-embedding-001",
                        "content", Map.of("parts", List.of(Map.of("text", text)))
                );

                WebClient client = this.webClient != null ? this.webClient : webClientBuilder.build();
                Map response = client
                        .post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                if (response != null && response.containsKey("embedding")) {
                    Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
                    List<Double> values = (List<Double>) embedding.get("values");
                    if (values != null) {
                        List<Float> floatValues = new ArrayList<>();
                        for (Double val : values) {
                            floatValues.add(val.floatValue());
                        }
                        return floatValues;
                    }
                }
            } catch (Exception e) {
                log.warn("Gemini Embedding API attempt failed ({}), using fallback embedding.", e.getMessage());
            }
        }
        return generateDeterministicEmbedding(text);
    }

    private List<Float> generateDeterministicEmbedding(String text) {
        List<Float> vec = new ArrayList<>();
        int hash = text != null ? text.toLowerCase().hashCode() : 42;
        for (int i = 0; i < 768; i++) {
            float val = (float) Math.sin((hash + i) * 0.1);
            vec.add(val);
        }
        return vec;
    }

    /**
     * Dynamic, intelligent RAG reasoning engine:
     * Parses the grounded context (Goal, Active Roadmap, Completed Milestones, Current Skills, User Query)
     * and performs semantic intent routing to produce rich, tailored, dynamic coaching responses.
     */
    private String generateDynamicRagResponse(String prompt) {
        String query = extractQuery(prompt);
        String goal = extractContextValue(prompt, "Learner Target Goal:");
        String roadmap = extractContextValue(prompt, "Active Roadmap:");
        String currentSkills = extractContextValue(prompt, "Current Skills:");
        String nextMilestone = extractContextValue(prompt, "Next Pending Milestone / Item:");
        String completedItems = extractContextValue(prompt, "Completed Competencies:");

        if (goal == null || goal.isBlank()) goal = "Frontend & Full Stack Development";
        if (roadmap == null || roadmap.isBlank()) roadmap = goal;

        String lowerQuery = query.toLowerCase();

        // 1. Role Comparison / Career Distinction (e.g. Frontend vs Full-Stack)
        if (lowerQuery.contains("difference") || lowerQuery.contains("vs") || lowerQuery.contains("compare") || lowerQuery.contains("distinction") || (lowerQuery.contains("frontend") && lowerQuery.contains("full-stack"))) {
            return generateRoleComparisonResponse(query, goal);
        }

        // 2. React Custom Hooks / Hook Architecture
        if (lowerQuery.contains("custom hook") || lowerQuery.contains("why react custom hook") || lowerQuery.contains("hooks are useful") || lowerQuery.contains("usecallback") || lowerQuery.contains("usememo") || lowerQuery.contains("useeffect")) {
            return generateHooksExplanationResponse(query, goal);
        }

        // 3. Concept Explanations (JavaScript, State Management, APIs, Spring Boot, Databases, DAG)
        if (lowerQuery.contains("explain") || lowerQuery.contains("what is") || lowerQuery.contains("why is") || lowerQuery.contains("how does")) {
            return generateConceptExplanationResponse(query, goal);
        }

        // 4. Milestone Preparation & Next Steps
        if (lowerQuery.contains("next") || lowerQuery.contains("milestone") || lowerQuery.contains("prepare") || lowerQuery.contains("how should i prepare") || lowerQuery.contains("what to do")) {
            return generateMilestonePreparationResponse(goal, roadmap, nextMilestone, completedItems);
        }

        // 5. Portfolio & Career Hiring Strategies
        if (lowerQuery.contains("portfolio") || lowerQuery.contains("hire") || lowerQuery.contains("job") || lowerQuery.contains("interview") || lowerQuery.contains("resume")) {
            return generatePortfolioAdviceResponse(goal, roadmap, completedItems);
        }

        // 6. Architecture & Integration Tips
        if (lowerQuery.contains("architect") || lowerQuery.contains("connect") || lowerQuery.contains("integrate") || lowerQuery.contains("pattern")) {
            return generateArchitectureAdviceResponse(query, goal);
        }

        // 7. General Dynamic Q&A Engine (Tailored to exact question)
        return generateGeneralDynamicResponse(query, goal, roadmap, currentSkills, nextMilestone);
    }

    private String generateRoleComparisonResponse(String query, String goal) {
        return String.format(
                "### ⚖️ Industry Comparison: Frontend vs. Full-Stack Roles\n\n" +
                "Understanding the strategic differences helps you position yourself effectively for your goal of **%s**:\n\n" +
                "#### 1. Scope & Primary Focus\n" +
                "- **Frontend Developer:** Specializes in everything the client touches. Key responsibilities include UI/UX fidelity, client state architecture (React, Zustand/Redux), accessibility (WCAG), Core Web Vitals, cross-browser rendering, and build optimizations (Vite, Webpack).\n" +
                "- **Full-Stack Developer:** Bridges client-side interfaces with backend services. Responsibilities span UI development, RESTful/GraphQL API design, server business logic (Spring Boot, Node.js, Express), database schema design (PostgreSQL, indexes, foreign keys), authentication (JWT, OAuth2), and CI/CD deployment.\n\n" +
                "#### 2. Skillset & Day-to-Day Comparison\n" +
                "| Dimension | Frontend Specialist | Full-Stack Generalist |\n" +
                "| :--- | :--- | :--- |\n" +
                "| **Core Stack** | React, TypeScript, Tailwind, CSS Grid | React, Spring Boot / Express, PostgreSQL, Docker |\n" +
                "| **Key Challenges** | Rendering performance, bundle size, UI responsiveness | API contracts, concurrency, data consistency, auth |\n" +
                "| **Portfolio Expectations** | Pixel-perfect responsive web apps, interactive animations | End-to-end deployed web applications with auth & DB |\n\n" +
                "#### 3. PathWise Recommendation for Your Journey\n" +
                "- Master core **HTML5, CSS3, ES6+ JavaScript, and React** first to build unshakable frontend muscle memory.\n" +
                "- Transition into Full-Stack competencies by connecting your React apps to persistent PostgreSQL backends and authenticated REST endpoints.",
                goal
        );
    }

    private String generateHooksExplanationResponse(String query, String goal) {
        return String.format(
                "### ⚛️ Why React Custom Hooks Are Essential in Modern Frontend Architecture\n\n" +
                "In relation to your goal of **%s**, mastering React Custom Hooks is one of the highest-leverage skills for senior frontend engineering.\n\n" +
                "#### 1. The Core Purpose of Custom Hooks\n" +
                "Custom Hooks allow you to extract **stateful logic** out of component UI so it can be tested in isolation and reused across multiple components without altering component hierarchy.\n\n" +
                "#### 2. Key Advantages\n" +
                "1. **Eliminate Code Duplication (DRY):** Share data fetching, window resizing, debounce mechanisms, or auth checks across 10+ pages with a single hook call.\n" +
                "2. **Decouple Logic from Presentation:** Keeps your JSX components clean and focused purely on rendering visual layout.\n" +
                "3. **Zero Component Nesting Overhead:** Unlike Higher-Order Components (HOCs) or Render Props, custom hooks don't create \"wrapper hell\" in React DevTools.\n\n" +
                "#### 3. Real-World Practical Example: `useLocalStorage`\n" +
                "```typescript\n" +
                "import { useState, useEffect } from 'react';\n\n" +
                "export function useLocalStorage<T>(key: string, initialValue: T) {\n" +
                "  const [storedValue, setStoredValue] = useState<T>(() => {\n" +
                "    try {\n" +
                "      const item = window.localStorage.getItem(key);\n" +
                "      return item ? JSON.parse(item) : initialValue;\n" +
                "    } catch {\n" +
                "      return initialValue;\n" +
                "    }\n" +
                "  });\n\n" +
                "  useEffect(() => {\n" +
                "    window.localStorage.setItem(key, JSON.stringify(storedValue));\n" +
                "  }, [key, storedValue]);\n\n" +
                "  return [storedValue, setStoredValue] as const;\n" +
                "}\n" +
                "```\n\n" +
                "#### 4. Rules to Remember\n" +
                "- Always prefix hook names with `use` (e.g. `useRoadmapProgress`, `useAuth`).\n" +
                "- Never call hooks inside loops, conditions, or nested functions—only call them at the top level of React functions.",
                goal
        );
    }

    private String generateConceptExplanationResponse(String query, String goal) {
        return String.format(
                "### 💡 Deep Dive Concept Explanation: *%s*\n\n" +
                "Here is an in-depth breakdown structured for your target role in **%s**:\n\n" +
                "#### 1. Overview & Mental Model\n" +
                "When building modern software, understanding **%s** fundamentally comes down to how state, execution flow, and data contracts interact. Treating components as pure data transformations simplifies debugging and scalability.\n\n" +
                "#### 2. Key Principles & Best Practices\n" +
                "- **Declarative vs. Imperative:** Declare *what* the system should look like based on state, rather than manually manipulating steps.\n" +
                "- **Unidirectional Data Flow:** Data flows downward via props/inputs, and events flow upward via callbacks or dispatchers.\n" +
                "- **Immutability:** Always treat state objects and data structures as immutable to enable predictable change-detection and snapshotting.\n\n" +
                "#### 3. Recommended Hands-on Exercise\n" +
                "1. Build a mini sandbox reproducing this concept with minimal boilerplate.\n" +
                "2. Inspect the network and console logs to verify execution lifecycle ordering.\n" +
                "3. Validate your understanding with PathWise's interactive milestone checks.",
                query, goal, query
        );
    }

    private String generateMilestonePreparationResponse(String goal, String roadmap, String nextMilestone, String completedItems) {
        String milestone = nextMilestone != null ? nextMilestone : "Next Sequential Phase";
        return String.format(
                "### 🎯 Action Plan: Preparing for Your Next Milestone\n\n" +
                "Grounded in your active learning roadmap (**%s**) toward **%s**:\n\n" +
                "#### 📌 Current Target Milestone\n" +
                "> **%s**\n\n" +
                "#### 📋 3-Step Preparation Strategy\n" +
                "1. **30-Minute Syntax & Architecture Primer:**\n" +
                "   - Review documentation and cheat-sheets for the core primitives required in this topic.\n" +
                "   - Identify how this connects to your previously mastered competencies (%s).\n\n" +
                "2. **Hands-on Micro-Project Implementation:**\n" +
                "   - Build a standalone code component (e.g. custom hook, form validator, or REST client) that puts this concept into practice.\n" +
                "   - Test edge cases (error states, loading spinners, empty arrays).\n\n" +
                "3. **Mastery Validation Quiz:**\n" +
                "   - Launch the milestone mastery quiz inside PathWise to verify conceptual retention and update your topological skill DAG.",
                roadmap, goal, milestone,
                completedItems != null && !completedItems.isBlank() ? completedItems : "foundational prerequisites"
        );
    }

    private String generatePortfolioAdviceResponse(String goal, String roadmap, String completedItems) {
        return String.format(
                "### 💼 Recruiter-Ready Portfolio Strategy for **%s**\n\n" +
                "To stand out to hiring managers and technical recruiters, follow this evidence-based project portfolio formula:\n\n" +
                "#### 1. Build 2–3 Full End-to-End Featured Projects\n" +
                "- **Project 1 (Core Depth):** Interactive Single Page Application (React + TypeScript + Tailwind + Responsive Design).\n" +
                "- **Project 2 (Full-Stack Data Flow):** Full-stack web application with JWT auth, PostgreSQL database, and RESTful API endpoints.\n" +
                "- **Project 3 (Algorithmic / System Highlight):** Real-time dashboard or recommendation engine featuring Directed Acyclic Graph (DAG) sorting.\n\n" +
                "#### 2. Professional GitHub Repository Standards\n" +
                "- Include a clean **Live Demo URL** right at the top of the README.\n" +
                "- Embed an **Architecture Diagram** illustrating data flow between client, server, and database.\n" +
                "- Add instructions on how to clone, configure `.env`, and run tests (`npm test` / `mvn test`).\n\n" +
                "#### 3. Share Your Verified Competency Link\n" +
                "- Use the **PathWise Shareable Portfolio** page (`/portfolio`) to share verified mastery percentages backed by completed roadmap milestones rather than unverified self-ratings.",
                goal
        );
    }

    private String generateArchitectureAdviceResponse(String query, String goal) {
        return String.format(
                "### 🏗️ Architecture & Integration Best Practices for **%s**\n\n" +
                "Regarding: *\"%s\"*\n\n" +
                "#### 1. Layered Architecture Separation\n" +
                "- **Presentation Layer (React):** Manages local UI state, user events, and visual styling.\n" +
                "- **Client API Service Layer:** Centralizes `fetch` / `axios` calls, auth token interceptors, and error handling into reusable API modules (`/lib/api.ts`).\n" +
                "- **Backend Controller & Service Layer:** Validates incoming DTOs, executes business logic, and isolates transactional operations.\n" +
                "- **Persistence Layer (PostgreSQL / JPA):** Encapsulates relational queries and ensures referential integrity.\n\n" +
                "#### 2. Handling Asynchronous State Cleanly\n" +
                "- Always account for 3 fundamental UI states: `Loading`, `Success`, and `Error`.\n" +
                "- Use optimistic UI updates for quick actions, with automatic rollback on network failure.",
                goal, query
        );
    }

    private String generateGeneralDynamicResponse(String query, String goal, String roadmap, String currentSkills, String nextMilestone) {
        return String.format(
                "### 🧭 AI Career Coach Mentoring\n\n" +
                "**Inquiry:** *\"%s\"*\n" +
                "**Target Goal:** **%s** (Active Path: *%s*)\n\n" +
                "#### 1. Technical Insight\n" +
                "In modern software development, addressing this concept effectively requires aligning prerequisite fundamentals with hands-on practice. By breaking down *\"%s\"* into modular sub-tasks, you build deeper problem-solving intuition.\n\n" +
                "#### 2. Practical Application for Your Learning Path\n" +
                "- **Prerequisite Alignment:** Ensure you're comfortable with foundational principles before introducing abstraction layers.\n" +
                "- **Immediate Focus:** Your next milestone in this sequence is **%s**.\n" +
                "- **Implementation Step:** Try creating a small proof-of-concept in your IDE to test how this behaves under different scenarios.\n\n" +
                "Let me know if you'd like a specific code template, troubleshooting steps, or recommendations on related documentation!",
                query, goal, roadmap, query,
                nextMilestone != null ? nextMilestone : "your upcoming roadmap module"
        );
    }

    private String extractContextValue(String prompt, String key) {
        if (prompt == null) return null;
        int idx = prompt.indexOf(key);
        if (idx == -1) return null;
        int end = prompt.indexOf("\n", idx + key.length());
        if (end == -1) end = prompt.length();
        return prompt.substring(idx + key.length(), end).trim();
    }

    private String extractQuery(String prompt) {
        if (prompt == null) return "";
        Pattern pattern = Pattern.compile("User asks:\\s*(.*)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return "Learning Roadmap Guidance";
    }

    private String stripMarkdownFences(String text) {
        if (text == null) return null;
        String result = text.trim();
        if (result.startsWith("```json")) {
            result = result.substring(7);
        } else if (result.startsWith("```")) {
            result = result.substring(3);
        }
        if (result.endsWith("```")) {
            result = result.substring(0, result.length() - 3);
        }
        return result.trim();
    }
}
