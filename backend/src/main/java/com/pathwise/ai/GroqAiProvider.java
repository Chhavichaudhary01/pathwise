package com.pathwise.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroqAiProvider implements AiProvider {

    @Value("")
    private String apiKey;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";

    @Override
    public String generateText(String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("mock-key")) {
            log.warn("Groq API key not configured, returning mock response");
            return "Mock AI response";
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", MODEL,
                    "messages", List.of(Map.of("role", "user", "content", prompt)),
                    "temperature", 0.7
            );

            Map response = webClientBuilder.build()
                    .post()
                    .uri(GROQ_API_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("Groq API call failed", e);
            throw new AiException("Failed to generate text with Groq", e, true);
        }
    }

    @Override
    public <T> T generateStructured(String prompt, Class<T> responseType) {
        String jsonPrompt = prompt + "\n\nRespond ONLY with valid JSON. Do not include markdown fences like `json. Your response MUST perfectly match this schema constraints.";
        String responseText = generateText(jsonPrompt);
        
        String cleanJson = stripMarkdownFences(responseText);
        try {
            return objectMapper.readValue(cleanJson, responseType);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse JSON on first attempt, retrying with stricter prompt. Error: {}", e.getMessage());
            // Retry once
            String retryPrompt = jsonPrompt + "\n\nYOUR PREVIOUS RESPONSE WAS INVALID JSON. YOU MUST RETURN RAW PARSABLE JSON ONLY.";
            String retryText = generateText(retryPrompt);
            String cleanRetryJson = stripMarkdownFences(retryText);
            try {
                return objectMapper.readValue(cleanRetryJson, responseType);
            } catch (JsonProcessingException ex) {
                log.error("Failed to parse JSON on retry", ex);
                throw new AiException("Failed to parse structured JSON response from AI", ex, false);
            }
        }
    }

    @Override
    public List<Float> getEmbeddings(String text) {
        // Groq does not support embeddings, fallback will handle it.
        throw new AiException("Embeddings not supported by Groq", false);
    }

    private String stripMarkdownFences(String text) {
        if (text == null) return null;
        String result = text.trim();
        if (result.startsWith("`json")) {
            result = result.substring(7);
        } else if (result.startsWith("`")) {
            result = result.substring(3);
        }
        if (result.endsWith("`")) {
            result = result.substring(0, result.length() - 3);
        }
        return result.trim();
    }
}
