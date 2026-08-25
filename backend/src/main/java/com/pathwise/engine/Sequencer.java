package com.pathwise.engine;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathwise.ai.AiProvider;
import com.pathwise.domain.*;
import com.pathwise.repository.CatalogItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class Sequencer {

    private final CatalogItemRepository catalogItemRepository;
    private final ScoringService scoringService;
    private final AiProvider aiProvider;
    private final ObjectMapper objectMapper;

    private final Map<UUID, List<Float>> itemEmbeddingCache = new ConcurrentHashMap<>();

    public List<CatalogItem> generateSequence(LearnerProfile profile) {
        List<CatalogItem> allItems = catalogItemRepository.findAll();
        if (allItems.isEmpty()) {
            return Collections.emptyList();
        }

        String goalText = profile != null && profile.getGoal() != null && !profile.getGoal().isBlank() 
                ? profile.getGoal() 
                : "Full Stack Web Development";

        // 1. Get Goal Embeddings
        List<Float> goalEmbedding = aiProvider.getEmbeddings(goalText);

        // Parse user skills
        Set<String> userSkills = new HashSet<>();
        if (profile != null && profile.getCurrentSkills() != null && !profile.getCurrentSkills().isEmpty() && !profile.getCurrentSkills().equals("[]")) {
            try {
                List<String> skills = objectMapper.readValue(profile.getCurrentSkills(), new TypeReference<List<String>>() {});
                userSkills.addAll(skills);
            } catch (Exception e) {
                log.warn("Failed to parse current skills");
            }
        }

        String preferredFormat = profile != null ? profile.getLearningStyle() : null;

        // 2. Score items
        List<ItemScore> scoredItems = new ArrayList<>();
        for (CatalogItem item : allItems) {
            List<Float> itemEmbedding = getItemEmbedding(item);
            double score = scoringService.calculateScore(item, goalEmbedding, itemEmbedding, userSkills, preferredFormat);
            scoredItems.add(new ItemScore(item, score));
        }

        // 3. Filter top items
        scoredItems.sort((a, b) -> Double.compare(b.score, a.score));
        
        List<CatalogItem> topItems = scoredItems.stream()
                .filter(is -> is.score >= 40.0)
                .limit(8)
                .map(is -> is.item)
                .collect(Collectors.toList());

        if (topItems.isEmpty()) {
            topItems = scoredItems.stream()
                    .limit(6)
                    .map(is -> is.item)
                    .collect(Collectors.toList());
        }

        // Add prerequisites that might be missing
        Set<UUID> finalItemsToSequence = new HashSet<>();
        for (CatalogItem item : topItems) {
            finalItemsToSequence.add(item.getId());
            addMissingPrerequisites(item, allItems, userSkills, finalItemsToSequence);
        }

        // 4. Topological Sort
        PrerequisiteGraph graph = new PrerequisiteGraph();
        graph.buildGraph(allItems);

        List<CatalogItem> sorted = graph.topologicalSort(finalItemsToSequence);
        return sorted.isEmpty() ? topItems : sorted;
    }

    private List<Float> getItemEmbedding(CatalogItem item) {
        if (itemEmbeddingCache.containsKey(item.getId())) {
            return itemEmbeddingCache.get(item.getId());
        }

        List<Float> embedding = null;
        try {
            if (item.getEmbedding() != null && !item.getEmbedding().isEmpty()) {
                embedding = objectMapper.readValue(item.getEmbedding(), new TypeReference<List<Float>>() {});
            }
        } catch (Exception ignored) {}

        if (embedding == null) {
            embedding = aiProvider.getEmbeddings(item.getTitle() + " " + (item.getDescription() != null ? item.getDescription() : ""));
        }

        if (embedding != null) {
            itemEmbeddingCache.put(item.getId(), embedding);
        }
        return embedding;
    }

    private void addMissingPrerequisites(CatalogItem item, List<CatalogItem> allItems, Set<String> userSkills, Set<UUID> itemsToSequence) {
        if (item.getItemSkills() == null) return;
        
        for (CatalogItemSkill cis : item.getItemSkills()) {
            if (cis.isPrerequisite() && cis.getSkill() != null && !userSkills.contains(cis.getSkill().getId())) {
                for (CatalogItem potentialProvider : allItems) {
                    if (potentialProvider.getItemSkills() == null) continue;
                    for (CatalogItemSkill providerCis : potentialProvider.getItemSkills()) {
                        if (providerCis.isOutcome() && providerCis.getSkill() != null && providerCis.getSkill().getId().equals(cis.getSkill().getId())) {
                            if (!itemsToSequence.contains(potentialProvider.getId())) {
                                itemsToSequence.add(potentialProvider.getId());
                                addMissingPrerequisites(potentialProvider, allItems, userSkills, itemsToSequence);
                            }
                            break;
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
