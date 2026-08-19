package com.pathwise.engine;

import com.pathwise.domain.CatalogItem;
import com.pathwise.domain.CatalogItemSkill;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ScoringService {

    public double cosineSimilarity(List<Float> vecA, List<Float> vecB) {
        if (vecA == null || vecB == null || vecA.size() != vecB.size()) {
            return 0.0;
        }
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vecA.size(); i++) {
            dotProduct += vecA.get(i) * vecB.get(i);
            normA += Math.pow(vecA.get(i), 2);
            normB += Math.pow(vecB.get(i), 2);
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    public double calculateScore(
            CatalogItem item,
            List<Float> goalEmbedding,
            List<Float> itemEmbedding,
            Set<String> userSkills,
            String preferredFormat) {
        
        double semanticScore = cosineSimilarity(goalEmbedding, itemEmbedding);
        double score = semanticScore * 100.0; // Base score out of 100

        // Bonus for preferred format
        if (preferredFormat != null && preferredFormat.equalsIgnoreCase(item.getFormat())) {
            score += 10.0;
        }

        // Penalize if the user already has ALL outcome skills
        boolean hasAllOutcomes = true;
        boolean hasAnyOutcomes = false;
        if (item.getItemSkills() != null) {
            for (CatalogItemSkill cis : item.getItemSkills()) {
                if (cis.isOutcome()) {
                    hasAnyOutcomes = true;
                    if (!userSkills.contains(cis.getSkill().getId())) {
                        hasAllOutcomes = false;
                        break;
                    }
                }
            }
        }

        if (hasAnyOutcomes && hasAllOutcomes) {
            score -= 50.0; // Huge penalty, they already know this
        }

        // Keep it bounded
        return Math.max(0.0, Math.min(100.0, score));
    }
}
