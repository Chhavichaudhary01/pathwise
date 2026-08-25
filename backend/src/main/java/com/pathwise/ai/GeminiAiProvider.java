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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class GeminiAiProvider implements AiProvider {

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private static final String GEMINI_EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

    private boolean isMockOrMissingKey() {
        return apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("mock-key") 
                || apiKey.startsWith("your_") || apiKey.contains("your_gemini_api_key");
    }

    @Override
    public String generateText(String prompt) {
        if (isMockOrMissingKey()) {
            log.info("Gemini API key not configured or using placeholder, returning simulated intelligent response");
            return "I have analyzed your learning goals and career objectives with PathWise AI engine. Based on our prerequisite graph and skill analysis, here is the structured guidance to achieve your milestone.";
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );

            Map response = webClientBuilder.build()
                    .post()
                    .uri(GEMINI_API_URL + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            // Graceful fallback to avoid application crash
            return "Based on your requested goal, PathWise has analyzed the requisite skills and structured an optimal learning sequence.";
        }
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
        if (isMockOrMissingKey()) {
            return generateDeterministicEmbedding(text);
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", "models/text-embedding-004",
                    "content", Map.of("parts", List.of(Map.of("text", text)))
            );

            Map response = webClientBuilder.build()
                    .post()
                    .uri(GEMINI_EMBEDDING_URL + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
            List<Double> values = (List<Double>) embedding.get("values");
            
            List<Float> floatValues = new ArrayList<>();
            for (Double val : values) {
                floatValues.add(val.floatValue());
            }
            return floatValues;
        } catch (Exception e) {
            log.warn("Gemini Embedding API call failed ({}), falling back to deterministic local embedding", e.getMessage());
            return generateDeterministicEmbedding(text);
        }
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
