package com.pathwise.engine;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathwise.ai.AiProvider;
import com.pathwise.domain.CatalogItem;
import com.pathwise.domain.CatalogItemSkill;
import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.Skill;
import com.pathwise.domain.User;
import com.pathwise.repository.CatalogItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SequencerTest {

    @Mock
    private CatalogItemRepository catalogItemRepository;

    @Mock
    private ScoringService scoringService;

    @Mock
    private AiProvider aiProvider;

    private ObjectMapper objectMapper = new ObjectMapper();

    private Sequencer sequencer;

    @BeforeEach
    void setUp() {
        sequencer = new Sequencer(catalogItemRepository, scoringService, aiProvider, objectMapper);
    }

    @Test
    void testGenerateSequence_EmptyCatalog() {
        when(catalogItemRepository.findAll()).thenReturn(Collections.emptyList());

        LearnerProfile profile = new LearnerProfile();
        profile.setGoal("Learn Java");
        profile.setUser(new User());
        
        List<CatalogItem> result = sequencer.generateSequence(profile);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGenerateSequence_FiltersLowScores() {
        CatalogItem item1 = new CatalogItem();
        item1.setId(UUID.randomUUID());
        item1.setTitle("A");

        CatalogItem item2 = new CatalogItem();
        item2.setId(UUID.randomUUID());
        item2.setTitle("B");

        when(catalogItemRepository.findAll()).thenReturn(Arrays.asList(item1, item2));
        when(aiProvider.getEmbeddings(anyString())).thenReturn(Arrays.asList(1.0f, 0.0f));

        // item1 gets 10, item2 gets 50
        when(scoringService.calculateScore(eq(item1), anyList(), anyList(), anySet(), any())).thenReturn(10.0);
        when(scoringService.calculateScore(eq(item2), anyList(), anyList(), anySet(), any())).thenReturn(50.0);

        LearnerProfile profile = new LearnerProfile();
        profile.setGoal("Learn Java");
        profile.setUser(new User());

        List<CatalogItem> result = sequencer.generateSequence(profile);
        
        assertEquals(1, result.size());
        assertEquals(item2.getId(), result.get(0).getId());
    }
    
    @Test
    void testGenerateSequence_AddsMissingPrerequisites() throws JsonProcessingException {
        // Goal: score Item B high. Item B needs skill-1. Item A provides skill-1.
        CatalogItem itemA = new CatalogItem();
        itemA.setId(UUID.randomUUID());
        itemA.setTitle("Item A");
        
        Skill s1 = new Skill(); s1.setId("skill-1");
        CatalogItemSkill cisA = new CatalogItemSkill();
        cisA.setSkill(s1);
        cisA.setOutcome(true);
        itemA.setItemSkills(new HashSet<>(Arrays.asList(cisA)));

        CatalogItem itemB = new CatalogItem();
        itemB.setId(UUID.randomUUID());
        itemB.setTitle("Item B");
        CatalogItemSkill cisB = new CatalogItemSkill();
        cisB.setSkill(s1);
        cisB.setPrerequisite(true);
        itemB.setItemSkills(new HashSet<>(Arrays.asList(cisB)));

        when(catalogItemRepository.findAll()).thenReturn(Arrays.asList(itemA, itemB));
        when(aiProvider.getEmbeddings(anyString())).thenReturn(Arrays.asList(1.0f, 0.0f));

        // Score B high, A low
        when(scoringService.calculateScore(eq(itemA), anyList(), anyList(), anySet(), any())).thenReturn(10.0);
        when(scoringService.calculateScore(eq(itemB), anyList(), anyList(), anySet(), any())).thenReturn(90.0);

        LearnerProfile profile = new LearnerProfile();
        profile.setGoal("Learn Java");
        profile.setUser(new User());
        profile.setCurrentSkills("[]");

        List<CatalogItem> result = sequencer.generateSequence(profile);
        
        // B was selected directly. A was added as prerequisite.
        // Topological sort should put A before B.
        assertEquals(2, result.size());
        assertEquals(itemA.getId(), result.get(0).getId());
        assertEquals(itemB.getId(), result.get(1).getId());
    }
}
