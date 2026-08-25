package com.pathwise.engine;

import com.pathwise.domain.CatalogItem;
import com.pathwise.domain.CatalogItemSkill;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Slf4j
@Getter
public class PrerequisiteGraph {

    private final Map<UUID, CatalogItem> itemsById = new HashMap<>();
    private final Map<UUID, Set<UUID>> adjacencyList = new HashMap<>();
    private final Map<UUID, Set<UUID>> reverseAdjacencyList = new HashMap<>();

    public void buildGraph(List<CatalogItem> items) {
        items.forEach(item -> itemsById.put(item.getId(), item));
        
        // Initialize adjacency lists
        itemsById.keySet().forEach(id -> {
            adjacencyList.put(id, new HashSet<>());
            reverseAdjacencyList.put(id, new HashSet<>());
        });

        // Map skill -> item providing it (outcomes)
        Map<String, Set<UUID>> skillProviders = new HashMap<>();
        for (CatalogItem item : items) {
            if (item.getItemSkills() == null) continue;
            for (CatalogItemSkill cis : item.getItemSkills()) {
                if (cis.isOutcome() && cis.getSkill() != null) {
                    skillProviders.computeIfAbsent(cis.getSkill().getId(), k -> new HashSet<>()).add(item.getId());
                }
            }
        }

        // Add edges: if A provides skill S, and B requires skill S, then A -> B (A must come before B)
        for (CatalogItem item : items) {
            if (item.getItemSkills() == null) continue;
            for (CatalogItemSkill cis : item.getItemSkills()) {
                if (cis.isPrerequisite() && cis.getSkill() != null) {
                    Set<UUID> providers = skillProviders.get(cis.getSkill().getId());
                    if (providers != null) {
                        for (UUID providerId : providers) {
                            if (!providerId.equals(item.getId())) { // Avoid self-loops
                                adjacencyList.get(providerId).add(item.getId());
                                reverseAdjacencyList.get(item.getId()).add(providerId);
                            }
                        }
                    }
                }
            }
        }
    }

    public List<CatalogItem> topologicalSort(Set<UUID> itemsToSort) {
        Map<UUID, Integer> inDegree = new HashMap<>();
        for (UUID id : itemsToSort) {
            inDegree.put(id, 0);
        }

        for (UUID id : itemsToSort) {
            for (UUID neighbor : adjacencyList.getOrDefault(id, Collections.emptySet())) {
                if (itemsToSort.contains(neighbor)) {
                    inDegree.put(neighbor, inDegree.get(neighbor) + 1);
                }
            }
        }

        Queue<UUID> queue = new LinkedList<>();
        for (Map.Entry<UUID, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.add(entry.getKey());
            }
        }

        List<CatalogItem> sorted = new ArrayList<>();
        Set<UUID> added = new HashSet<>();
        while (!queue.isEmpty()) {
            UUID curr = queue.poll();
            if (added.add(curr) && itemsById.containsKey(curr)) {
                sorted.add(itemsById.get(curr));

                for (UUID neighbor : adjacencyList.getOrDefault(curr, Collections.emptySet())) {
                    if (itemsToSort.contains(neighbor)) {
                        inDegree.put(neighbor, inDegree.get(neighbor) - 1);
                        if (inDegree.get(neighbor) <= 0 && !added.contains(neighbor)) {
                            queue.add(neighbor);
                        }
                    }
                }
            }
        }

        // Fallback: If any cyclical edges prevented inDegree reaching 0, append remaining items
        for (UUID id : itemsToSort) {
            if (!added.contains(id) && itemsById.containsKey(id)) {
                sorted.add(itemsById.get(id));
            }
        }

        return sorted;
    }
}
