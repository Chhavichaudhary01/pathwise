package com.pathwise.engine;

import com.pathwise.ai.AiProvider;
import com.pathwise.domain.CatalogItem;
import com.pathwise.domain.CatalogItemSkill;
import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.User;
import com.pathwise.domain.Skill;
import com.pathwise.repository.CatalogItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationEvaluator {

    @Mock
    private CatalogItemRepository catalogItemRepository;
    @Mock
    private AiProvider aiProvider;
    
    private ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void evaluateRecommendations() throws Exception {
        ScoringService scoringService = new ScoringService();
        Sequencer sequencer = new Sequencer(catalogItemRepository, scoringService, aiProvider, objectMapper);

        // Setup mock catalog
        List<CatalogItem> catalog = new ArrayList<>();
        Skill python = new Skill("python", "Python", "Data");
        Skill pandas = new Skill("pandas", "Pandas", "Data");

        CatalogItem c1 = new CatalogItem();
        c1.setId(UUID.randomUUID());
        c1.setTitle("Intro to Python");
        c1.setEmbedding("[0.9, 0.1, 0.0]");
        Set<CatalogItemSkill> c1Skills = new HashSet<>();
        CatalogItemSkill cis1 = new CatalogItemSkill();
        cis1.setSkill(python); cis1.setOutcome(true); c1Skills.add(cis1);
        c1.setItemSkills(c1Skills);
        catalog.add(c1);

        CatalogItem c2 = new CatalogItem();
        c2.setId(UUID.randomUUID());
        c2.setTitle("Data Analysis with Pandas");
        c2.setEmbedding("[0.8, 0.8, 0.0]");
        Set<CatalogItemSkill> c2Skills = new HashSet<>();
        CatalogItemSkill cis2_pre = new CatalogItemSkill();
        cis2_pre.setSkill(python); cis2_pre.setPrerequisite(true); c2Skills.add(cis2_pre);
        CatalogItemSkill cis2_out = new CatalogItemSkill();
        cis2_out.setSkill(pandas); cis2_out.setOutcome(true); c2Skills.add(cis2_out);
        c2.setItemSkills(c2Skills);
        catalog.add(c2);

        when(catalogItemRepository.findAll()).thenReturn(catalog);
        
        List<Float> goalEmbedding = Arrays.asList(0.8f, 0.9f, 0.0f);
        when(aiProvider.getEmbeddings(anyString())).thenReturn(goalEmbedding);

        User dummyUser = new User();
        dummyUser.setId(UUID.randomUUID());

        // Profile 1: Complete beginner
        LearnerProfile beginner = new LearnerProfile();
        beginner.setUser(dummyUser);
        beginner.setGoal("I want to learn pandas");
        beginner.setCurrentSkills("[]");

        List<CatalogItem> beginnerRoadmap = sequencer.generateSequence(beginner);
        
        System.out.println("Beginner Roadmap:");
        beginnerRoadmap.forEach(item -> System.out.println("- " + item.getTitle()));
        
        // Assert sequence: Python -> Pandas
        assertEquals(2, beginnerRoadmap.size());
        assertEquals("Intro to Python", beginnerRoadmap.get(0).getTitle());
        assertEquals("Data Analysis with Pandas", beginnerRoadmap.get(1).getTitle());

        // Profile 2: Knows Python
        LearnerProfile knowsPython = new LearnerProfile();
        knowsPython.setUser(dummyUser);
        knowsPython.setGoal("I want to learn pandas");
        knowsPython.setCurrentSkills("[\"python\"]");

        List<CatalogItem> advRoadmap = sequencer.generateSequence(knowsPython);
        
        System.out.println("Advanced Roadmap:");
        advRoadmap.forEach(item -> System.out.println("- " + item.getTitle()));
        
        // Assert sequence: Only Pandas
        assertEquals(1, advRoadmap.size());
        assertEquals("Data Analysis with Pandas", advRoadmap.get(0).getTitle());
    }
}
