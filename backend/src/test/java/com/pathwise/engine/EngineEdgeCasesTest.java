package com.pathwise.engine;

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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EngineEdgeCasesTest {

    @Mock
    private CatalogItemRepository catalogItemRepository;

    @Mock
    private AiProvider aiProvider;

    private ScoringService scoringService;
    private ObjectMapper objectMapper = new ObjectMapper();
    private Sequencer sequencer;

    private User testUser;
    private LearnerProfile profile;
    private Skill s1, s2, s3;

    @BeforeEach
    void setUp() {
        scoringService = new ScoringService();
        sequencer = new Sequencer(catalogItemRepository, scoringService, aiProvider, objectMapper);

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("engine.edge@example.com");

        profile = new LearnerProfile();
        profile.setId(UUID.randomUUID());
        profile.setUser(testUser);
        profile.setGoal("Learn Everything");

        s1 = new Skill(); s1.setId("skill-1"); s1.setName("Skill 1");
        s2 = new Skill(); s2.setId("skill-2"); s2.setName("Skill 2");
        s3 = new Skill(); s3.setId("skill-3"); s3.setName("Skill 3");
    }

    @Test
    void testLearnerWithZeroStatedSkills() {
        profile.setCurrentSkills("[]");

        CatalogItem item = new CatalogItem();
        item.setId(UUID.randomUUID());
        item.setTitle("Intro to Skill 1");
        item.setFormat("PROJECT");
        
        CatalogItemSkill cis = new CatalogItemSkill();
        cis.setSkill(s1);
        cis.setOutcome(true);
        item.setItemSkills(new HashSet<>(Collections.singletonList(cis)));

        when(catalogItemRepository.findAll()).thenReturn(Collections.singletonList(item));

        List<CatalogItem> sequence = sequencer.generateSequence(profile);
        
        assertFalse(sequence.isEmpty(), "Should recommend something even with zero skills");
        assertEquals(item.getId(), sequence.get(0).getId());
    }

    @Test
    void testLearnerWhoAlreadyKnowsEverySkill() {
        profile.setCurrentSkills("[\"skill-1\"]");

        CatalogItem item = new CatalogItem();
        item.setId(UUID.randomUUID());
        item.setTitle("Intro to Skill 1");
        item.setFormat("VIDEO");
        
        CatalogItemSkill cis = new CatalogItemSkill();
        cis.setSkill(s1);
        cis.setOutcome(true);
        item.setItemSkills(new HashSet<>(Collections.singletonList(cis)));

        when(catalogItemRepository.findAll()).thenReturn(Collections.singletonList(item));

        List<CatalogItem> sequence = sequencer.generateSequence(profile);
        assertNotNull(sequence, "Sequence should not be null");
    }

    @Test
    void testCircularPrerequisitesGracefullyHandledWithoutInfiniteLoop() {
        CatalogItem itemA = new CatalogItem();
        itemA.setId(UUID.randomUUID());
        itemA.setTitle("Item A");
        CatalogItemSkill aOut = new CatalogItemSkill(); aOut.setSkill(s1); aOut.setOutcome(true);
        CatalogItemSkill aPre = new CatalogItemSkill(); aPre.setSkill(s2); aPre.setPrerequisite(true);
        itemA.setItemSkills(new HashSet<>(Arrays.asList(aOut, aPre)));

        CatalogItem itemB = new CatalogItem();
        itemB.setId(UUID.randomUUID());
        itemB.setTitle("Item B");
        CatalogItemSkill bOut = new CatalogItemSkill(); bOut.setSkill(s2); bOut.setOutcome(true);
        CatalogItemSkill bPre = new CatalogItemSkill(); bPre.setSkill(s1); bPre.setPrerequisite(true);
        itemB.setItemSkills(new HashSet<>(Arrays.asList(bOut, bPre)));

        profile.setCurrentSkills("[]");

        when(catalogItemRepository.findAll()).thenReturn(Arrays.asList(itemA, itemB));

        // Cycle must not infinite-loop
        List<CatalogItem> sequence = assertDoesNotThrow(() -> sequencer.generateSequence(profile));
        assertNotNull(sequence);
        assertEquals(2, sequence.size(), "Both items should be returned without hanging");
    }
}
