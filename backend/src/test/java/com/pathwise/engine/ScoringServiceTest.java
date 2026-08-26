package com.pathwise.engine;

import com.pathwise.domain.CatalogItem;
import com.pathwise.domain.CatalogItemSkill;
import com.pathwise.domain.Skill;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ScoringServiceTest {

    private ScoringService scoringService;

    @BeforeEach
    void setUp() {
        scoringService = new ScoringService();
    }

    @Test
    void testCosineSimilarity_Normal() {
        List<Float> vecA = Arrays.asList(1.0f, 0.0f);
        List<Float> vecB = Arrays.asList(1.0f, 0.0f);
        double similarity = scoringService.cosineSimilarity(vecA, vecB);
        assertEquals(1.0, similarity, 0.001);
    }

    @Test
    void testCosineSimilarity_Orthogonal() {
        List<Float> vecA = Arrays.asList(1.0f, 0.0f);
        List<Float> vecB = Arrays.asList(0.0f, 1.0f);
        double similarity = scoringService.cosineSimilarity(vecA, vecB);
        assertEquals(0.0, similarity, 0.001);
    }
    
    @Test
    void testCosineSimilarity_DifferentSizes() {
        List<Float> vecA = Arrays.asList(1.0f, 0.0f);
        List<Float> vecB = Arrays.asList(1.0f);
        double similarity = scoringService.cosineSimilarity(vecA, vecB);
        assertEquals(0.0, similarity, 0.001);
    }
    
    @Test
    void testCosineSimilarity_Nulls() {
        assertEquals(0.0, scoringService.cosineSimilarity(null, Arrays.asList(1.0f)), 0.001);
        assertEquals(0.0, scoringService.cosineSimilarity(Arrays.asList(1.0f), null), 0.001);
        assertEquals(0.0, scoringService.cosineSimilarity(null, null), 0.001);
    }

    @Test
    void testCosineSimilarity_ZeroNorm() {
        List<Float> vecA = Arrays.asList(0.0f, 0.0f);
        List<Float> vecB = Arrays.asList(1.0f, 0.0f);
        double similarity = scoringService.cosineSimilarity(vecA, vecB);
        assertEquals(0.0, similarity, 0.001);
    }

    @Test
    void testCalculateScore_NoSkills() {
        CatalogItem item = new CatalogItem();
        item.setFormat("VIDEO");
        
        List<Float> goal = Arrays.asList(1.0f, 0.0f);
        List<Float> itemEmb = Arrays.asList(1.0f, 0.0f);
        
        double score = scoringService.calculateScore(item, goal, itemEmb, Collections.emptySet(), "VIDEO");
        
        // Semantic score = 1.0 -> 100
        // Format match = +10
        // Total = 110, capped to 100
        assertEquals(100.0, score, 0.001);
    }
    
    @Test
    void testCalculateScore_FormatMismatch() {
        CatalogItem item = new CatalogItem();
        item.setFormat("ARTICLE");
        
        List<Float> goal = Arrays.asList(1.0f, 0.0f);
        List<Float> itemEmb = Arrays.asList(0.5f, 0.5f); // ~0.707 similarity
        
        double score = scoringService.calculateScore(item, goal, itemEmb, Collections.emptySet(), "VIDEO");
        
        // Semantic score = ~0.707 -> ~70.7
        // Format mismatch = 0
        // Total = ~70.7
        assertEquals(70.71, score, 0.01);
    }

    @Test
    void testCalculateScore_AlreadyKnowsAllOutcomes() {
        CatalogItem item = new CatalogItem();
        item.setFormat("VIDEO");
        
        Skill s1 = new Skill();
        s1.setId("java");
        
        CatalogItemSkill cis1 = new CatalogItemSkill();
        cis1.setSkill(s1);
        cis1.setOutcome(true);
        
        item.setItemSkills(Set.of(cis1));
        
        List<Float> goal = Arrays.asList(1.0f, 0.0f);
        List<Float> itemEmb = Arrays.asList(1.0f, 0.0f);
        
        Set<String> userSkills = new HashSet<>(Arrays.asList("java"));
        
        double score = scoringService.calculateScore(item, goal, itemEmb, userSkills, "VIDEO");
        
        // Base = 100
        // Format = +10
        // Knows all outcomes = -50
        // Total = 60
        assertEquals(60.0, score, 0.001);
    }
    
    @Test
    void testCalculateScore_BoundsCheckNegative() {
        CatalogItem item = new CatalogItem();
        item.setFormat("ARTICLE");
        
        Skill s1 = new Skill();
        s1.setId("java");
        
        CatalogItemSkill cis1 = new CatalogItemSkill();
        cis1.setSkill(s1);
        cis1.setOutcome(true);
        
        item.setItemSkills(Set.of(cis1));
        
        List<Float> goal = Arrays.asList(0.0f, 1.0f);
        List<Float> itemEmb = Arrays.asList(1.0f, 0.0f); // similarity = 0
        
        Set<String> userSkills = new HashSet<>(Arrays.asList("java"));
        
        double score = scoringService.calculateScore(item, goal, itemEmb, userSkills, "VIDEO");
        
        // Base = 0
        // Format = +0
        // Knows all outcomes = -50
        // Total = -50 -> max(0, -50) = 0
        assertEquals(0.0, score, 0.001);
    }

}
