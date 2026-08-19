package com.pathwise.engine;

import com.pathwise.domain.CatalogItem;
import com.pathwise.domain.CatalogItemSkill;
import lombok.Getter;

import java.util.*;

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
                if (cis.isOutcome()) {
                    skillProviders.computeIfAbsent(cis.getSkill().getId(), k -> new HashSet<>()).add(item.getId());
                }
            }
        }

        // Add edges: if A provides skill S, and B requires skill S, then A -> B (A must come before B)
        for (CatalogItem item : items) {
            if (item.getItemSkills() == null) continue;
            for (CatalogItemSkill cis : item.getItemSkills()) {
                if (cis.isPrerequisite()) {
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

        if (hasCycle()) {
            throw new IllegalStateException("Circular dependency detected in prerequisite graph");
        }
    }

    private boolean hasCycle() {
        Set<UUID> visited = new HashSet<>();
        Set<UUID> recursionStack = new HashSet<>();

        for (UUID nodeId : adjacencyList.keySet()) {
            if (hasCycleUtil(nodeId, visited, recursionStack)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasCycleUtil(UUID nodeId, Set<UUID> visited, Set<UUID> recursionStack) {
        if (recursionStack.contains(nodeId)) return true;
        if (visited.contains(nodeId)) return false;

        visited.add(nodeId);
        recursionStack.add(nodeId);

        for (UUID neighbor : adjacencyList.getOrDefault(nodeId, Collections.emptySet())) {
            if (hasCycleUtil(neighbor, visited, recursionStack)) {
                return true;
            }
        }

        recursionStack.remove(nodeId);
        return false;
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
        while (!queue.isEmpty()) {
            UUID curr = queue.poll();
            sorted.add(itemsById.get(curr));

            for (UUID neighbor : adjacencyList.getOrDefault(curr, Collections.emptySet())) {
                if (itemsToSort.contains(neighbor)) {
                    inDegree.put(neighbor, inDegree.get(neighbor) - 1);
                    if (inDegree.get(neighbor) == 0) {
                        queue.add(neighbor);
                    }
                }
            }
        }

        return sorted;
    }
}
