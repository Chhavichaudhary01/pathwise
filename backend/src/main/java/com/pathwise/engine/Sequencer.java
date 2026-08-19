package com.pathwise.engine;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathwise.ai.AiProvider;
import com.pathwise.domain.*;
import com.pathwise.repository.CatalogItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class Sequencer {

    private final CatalogItemRepository catalogItemRepository;
    private final ScoringService scoringService;
    private final AiProvider aiProvider;
    private final ObjectMapper objectMapper;

    public List<CatalogItem> generateSequence(LearnerProfile profile) {
        List<CatalogItem> allItems = catalogItemRepository.findAll();

        // 1. Get Goal Embeddings
        List<Float> goalEmbedding = aiProvider.getEmbeddings(profile.getGoal());

        // Parse user skills
        Set<String> userSkills = new HashSet<>();
        try {
            if (profile.getCurrentSkills() != null && !profile.getCurrentSkills().isEmpty() && !profile.getCurrentSkills().equals("[]")) {
                List<String> skills = objectMapper.readValue(profile.getCurrentSkills(), new TypeReference<List<String>>() {});
                userSkills.addAll(skills);
            }
        } catch (Exception e) {
            log.warn("Failed to parse current skills for user {}", profile.getUser().getId());
        }

        // 2. Score items
        List<ItemScore> scoredItems = new ArrayList<>();
        for (CatalogItem item : allItems) {
            List<Float> itemEmbedding = null;
            try {
                if (item.getEmbedding() != null && !item.getEmbedding().isEmpty()) {
                    itemEmbedding = objectMapper.readValue(item.getEmbedding(), new TypeReference<List<Float>>() {});
                } else {
                    // Fallback to generating on the fly
                    itemEmbedding = aiProvider.getEmbeddings(item.getTitle() + " " + item.getDescription());
                }
            } catch (Exception e) {
                log.warn("Failed to get/parse embedding for item {}", item.getId());
            }

            double score = scoringService.calculateScore(item, goalEmbedding, itemEmbedding, userSkills, profile.getLearningStyle());
            scoredItems.add(new ItemScore(item, score));
        }

        // 3. Filter top N items (e.g. top 10 items > 50 score)
        List<CatalogItem> topItems = scoredItems.stream()
                .filter(is -> is.score > 20.0)
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .limit(10)
                .map(is -> is.item)
                .collect(Collectors.toList());

        if (topItems.isEmpty()) return Collections.emptyList();

        // Add prerequisites that might be missing
        Set<UUID> finalItemsToSequence = new HashSet<>();
        for (CatalogItem item : topItems) {
            finalItemsToSequence.add(item.getId());
            addMissingPrerequisites(item, allItems, userSkills, finalItemsToSequence);
        }

        // 4. Topological Sort
        PrerequisiteGraph graph = new PrerequisiteGraph();
        graph.buildGraph(allItems); // Build graph with all items to resolve edges

        return graph.topologicalSort(finalItemsToSequence);
    }

    private void addMissingPrerequisites(CatalogItem item, List<CatalogItem> allItems, Set<String> userSkills, Set<UUID> itemsToSequence) {
        if (item.getItemSkills() == null) return;
        
        for (CatalogItemSkill cis : item.getItemSkills()) {
            if (cis.isPrerequisite() && !userSkills.contains(cis.getSkill().getId())) {
                // Find an item that provides this skill
                for (CatalogItem potentialProvider : allItems) {
                    if (potentialProvider.getItemSkills() == null) continue;
                    for (CatalogItemSkill providerCis : potentialProvider.getItemSkills()) {
                        if (providerCis.isOutcome() && providerCis.getSkill().getId().equals(cis.getSkill().getId())) {
                            if (!itemsToSequence.contains(potentialProvider.getId())) {
                                itemsToSequence.add(potentialProvider.getId());
                                // recursively add prerequisites of the provider
                                addMissingPrerequisites(potentialProvider, allItems, userSkills, itemsToSequence);
                            }
                            break; // just add one provider
                        }
                    }
                }
            }
        }
    }

    @RequiredArgsConstructor
    private static class ItemScore {
        final CatalogItem item;
        final double score;
    }
}
