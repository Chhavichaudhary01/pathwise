package com.pathwise.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class FallbackAiService implements AiProvider {

    private final GroqAiProvider groqProvider;
    private final GeminiAiProvider geminiProvider;

    @Override
    public String generateText(String prompt) {
        try {
            return groqProvider.generateText(prompt);
        } catch (AiException e) {
            log.warn("Groq failed, falling back to Gemini for text generation", e);
            return geminiProvider.generateText(prompt);
        }
    }

    @Override
    public <T> T generateStructured(String prompt, Class<T> responseType) {
        try {
            return groqProvider.generateStructured(prompt, responseType);
        } catch (AiException e) {
            log.warn("Groq failed, falling back to Gemini for structured generation", e);
            return geminiProvider.generateStructured(prompt, responseType);
        }
    }

    @Override
    public List<Float> getEmbeddings(String text) {
        // Groq doesn't support embeddings, always use Gemini
        return geminiProvider.getEmbeddings(text);
    }
}
