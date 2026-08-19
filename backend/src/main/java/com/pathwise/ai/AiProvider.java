package com.pathwise.ai;

import java.util.List;

public interface AiProvider {
    String generateText(String prompt);
    <T> T generateStructured(String prompt, Class<T> responseType);
    List<Float> getEmbeddings(String text);
}
