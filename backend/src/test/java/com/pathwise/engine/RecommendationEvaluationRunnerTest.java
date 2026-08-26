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

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RecommendationEvaluationRunnerTest {

    @Mock
    private CatalogItemRepository catalogItemRepository;

    @Mock
    private AiProvider aiProvider;

    private ScoringService scoringService;
    private ObjectMapper objectMapper = new ObjectMapper();
    private Sequencer sequencer;

    private List<CatalogItem> benchmarkCatalog;

    @BeforeEach
    void setUp() {
        scoringService = new ScoringService();
        sequencer = new Sequencer(catalogItemRepository, scoringService, aiProvider, objectMapper);

        // Build a synthetic benchmark catalog of 15 items across 3 tracks
        benchmarkCatalog = new ArrayList<>();

        // Frontend Track Items
        benchmarkCatalog.add(createItem("f1", "HTML & CSS Fundamentals", "PROJECT", "Frontend", Arrays.asList("html", "css"), Collections.emptyList()));
        benchmarkCatalog.add(createItem("f2", "Modern JavaScript & DOM", "COURSE", "Frontend", Arrays.asList("javascript"), Arrays.asList("html", "css")));
        benchmarkCatalog.add(createItem("f3", "React Component Architecture", "COURSE", "Frontend", Arrays.asList("react"), Arrays.asList("javascript")));
        benchmarkCatalog.add(createItem("f4", "Zustand & State Management", "ARTICLE", "Frontend", Arrays.asList("zustand"), Arrays.asList("react")));
        benchmarkCatalog.add(createItem("f5", "Production Next.js Full Stack", "PROJECT", "Frontend", Arrays.asList("nextjs"), Arrays.asList("react", "javascript")));

        // Data Analyst Track Items
        benchmarkCatalog.add(createItem("d1", "SQL Data Extraction & Joins", "PROJECT", "Data", Arrays.asList("sql"), Collections.emptyList()));
        benchmarkCatalog.add(createItem("d2", "Python for Data Analysis", "COURSE", "Data", Arrays.asList("python"), Collections.emptyList()));
        benchmarkCatalog.add(createItem("d3", "Pandas & Data Wrangling", "COURSE", "Data", Arrays.asList("pandas"), Arrays.asList("python")));
        benchmarkCatalog.add(createItem("d4", "Tableau & PowerBI Dashboarding", "ARTICLE", "Data", Arrays.asList("tableau"), Arrays.asList("sql")));
        benchmarkCatalog.add(createItem("d5", "Statistical Hypothesis Testing", "COURSE", "Data", Arrays.asList("statistics"), Arrays.asList("python")));

        // ML Engineer Track Items
        benchmarkCatalog.add(createItem("m1", "Linear Algebra & Calculus for ML", "COURSE", "ML", Arrays.asList("math"), Collections.emptyList()));
        benchmarkCatalog.add(createItem("m2", "Scikit-Learn Machine Learning", "COURSE", "ML", Arrays.asList("sklearn"), Arrays.asList("python", "math")));
        benchmarkCatalog.add(createItem("m3", "Deep Learning with PyTorch", "COURSE", "ML", Arrays.asList("pytorch"), Arrays.asList("sklearn")));
        benchmarkCatalog.add(createItem("m4", "Transformer & LLM Fine-Tuning", "PROJECT", "ML", Arrays.asList("transformers"), Arrays.asList("pytorch")));
        benchmarkCatalog.add(createItem("m5", "MLOps & Model Deployment", "PROJECT", "ML", Arrays.asList("mlops"), Arrays.asList("pytorch")));

        when(catalogItemRepository.findAll()).thenReturn(benchmarkCatalog);
        when(aiProvider.getEmbeddings(anyString())).thenAnswer(invocation -> {
            String text = ((String) invocation.getArgument(0)).toLowerCase();
            // Synthetic 3D vector for semantic similarity: [frontend_score, data_score, ml_score]
            float f = (text.contains("react") || text.contains("frontend") || text.contains("html") || text.contains("javascript") || text.contains("web")) ? 0.95f : 0.1f;
            float d = (text.contains("sql") || text.contains("data") || text.contains("pandas") || text.contains("tableau")) ? 0.95f : 0.1f;
            float m = (text.contains("ml") || text.contains("pytorch") || text.contains("deep learning") || text.contains("machine learning")) ? 0.95f : 0.1f;
            return Arrays.asList(f, d, m);
        });
    }

    private CatalogItem createItem(String idStr, String title, String format, String category, List<String> outcomes, List<String> prereqs) {
        CatalogItem item = new CatalogItem();
        item.setId(UUID.nameUUIDFromBytes(idStr.getBytes()));
        item.setTitle(title);
        item.setDescription(title + " " + category);
        item.setFormat(format);
        
        Set<CatalogItemSkill> itemSkills = new HashSet<>();
        for (String o : outcomes) {
            Skill s = new Skill();
            s.setId(o);
            s.setName(o);
            CatalogItemSkill cis = new CatalogItemSkill();
            cis.setSkill(s);
            cis.setOutcome(true);
            cis.setPrerequisite(false);
            itemSkills.add(cis);
        }
        for (String p : prereqs) {
            Skill s = new Skill();
            s.setId(p);
            s.setName(p);
            CatalogItemSkill cis = new CatalogItemSkill();
            cis.setSkill(s);
            cis.setOutcome(false);
            cis.setPrerequisite(true);
            itemSkills.add(cis);
        }
        item.setItemSkills(itemSkills);
        return item;
    }

    @Test
    void runOfflineRecommendationQualityEvaluation() {
        System.out.println("===============================================================");
        System.out.println("PathWise Offline Recommendation Quality Benchmark Evaluation");
        System.out.println("===============================================================");

        List<SyntheticLearner> testLearners = Arrays.asList(
                new SyntheticLearner("Learner 1 (Beginner Frontend)", "I want to become a Frontend Web Developer from scratch", "[]", "Frontend", Arrays.asList("f1", "f2", "f3", "f4")),
                new SyntheticLearner("Learner 2 (Intermediate React)", "I know JS and want to master advanced React and state management", "[\"html\", \"css\", \"javascript\"]", "Frontend", Arrays.asList("f3", "f4", "f5")),
                new SyntheticLearner("Learner 3 (Data Analyst Starter)", "I want to learn SQL, Python, and Data Visualization", "[]", "Data", Arrays.asList("d1", "d2", "d3", "d4")),
                new SyntheticLearner("Learner 4 (ML & Deep Learning)", "I want to specialize in PyTorch Deep Learning and Transformers", "[\"python\", \"math\"]", "ML", Arrays.asList("m1", "m2", "m3", "m4", "m5")),
                new SyntheticLearner("Learner 5 (Full Stack Next.js)", "Frontend web engineer wanting to build production Next.js apps", "[\"html\", \"css\", \"javascript\", \"react\"]", "Frontend", Arrays.asList("f3", "f4", "f5"))
        );

        double totalPrecision = 0.0;
        double totalRecall = 0.0;

        for (SyntheticLearner sl : testLearners) {
            LearnerProfile profile = new LearnerProfile();
            profile.setId(UUID.randomUUID());
            profile.setGoal(sl.goal);
            profile.setCurrentSkills(sl.knownSkills);

            List<CatalogItem> recommended = sequencer.generateSequence(profile);

            int hits = 0;
            for (CatalogItem rec : recommended) {
                for (String expectedId : sl.expectedItemIds) {
                    if (rec.getId().equals(UUID.nameUUIDFromBytes(expectedId.getBytes()))) {
                        hits++;
                    }
                }
            }

            double precision = recommended.isEmpty() ? 0.0 : (double) hits / recommended.size();
            double recall = sl.expectedItemIds.isEmpty() ? 0.0 : (double) hits / sl.expectedItemIds.size();

            totalPrecision += precision;
            totalRecall += recall;

            System.out.printf("[%s]%nGoal: %s%nRecommended Count: %d | Hits: %d | Precision: %.2f | Recall: %.2f%n%n",
                    sl.name, sl.goal, recommended.size(), hits, precision, recall);
        }

        double avgPrecision = totalPrecision / testLearners.size();
        double avgRecall = totalRecall / testLearners.size();
        double f1Score = (avgPrecision + avgRecall == 0) ? 0 : 2 * (avgPrecision * avgRecall) / (avgPrecision + avgRecall);

        System.out.println("---------------------------------------------------------------");
        System.out.printf("OVERALL BENCHMARK RESULTS:%nAverage Precision@K: %.2f%%%nAverage Recall:        %.2f%%%nF1 Recommendation Score: %.2f%n",
                avgPrecision * 100, avgRecall * 100, f1Score);
        System.out.println("===============================================================");

        assertTrue(avgPrecision >= 0.60, "Precision should exceed 60%");
        assertTrue(avgRecall >= 0.70, "Recall should exceed 70%");
    }

    private static class SyntheticLearner {
        String name;
        String goal;
        String knownSkills;
        String targetCategory;
        List<String> expectedItemIds;

        SyntheticLearner(String name, String goal, String knownSkills, String targetCategory, List<String> expectedItemIds) {
            this.name = name;
            this.goal = goal;
            this.knownSkills = knownSkills;
            this.targetCategory = targetCategory;
            this.expectedItemIds = expectedItemIds;
        }
    }
}
