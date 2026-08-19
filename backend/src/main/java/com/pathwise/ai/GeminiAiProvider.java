package com.pathwise.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiAiProvider implements AiProvider {

    @Value("")
    private String apiKey;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private static final String GEMINI_EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

    @Override
    public String generateText(String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("mock-key")) {
            log.warn("Gemini API key not configured, returning mock response");
            return "Mock AI response";
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
            log.error("Gemini API call failed", e);
            throw new AiException("Failed to generate text with Gemini", e, true);
        }
    }

    @Override
    public <T> T generateStructured(String prompt, Class<T> responseType) {
        String jsonPrompt = prompt + "\n\nRespond ONLY with valid JSON. Do not include markdown fences like `json.";
        String responseText = generateText(jsonPrompt);
        
        String cleanJson = stripMarkdownFences(responseText);
        try {
            return objectMapper.readValue(cleanJson, responseType);
        } catch (JsonProcessingException e) {
            throw new AiException("Failed to parse structured JSON response from Gemini", e, false);
        }
    }

    @Override
    public List<Float> getEmbeddings(String text) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("mock-key")) {
            log.warn("Gemini API key not configured, returning mock embeddings");
            List<Float> mock = new ArrayList<>();
            for (int i=0; i<768; i++) mock.add(0.01f);
            return mock;
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
            log.error("Gemini Embedding API call failed", e);
            throw new AiException("Failed to generate embeddings with Gemini", e, true);
        }
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
