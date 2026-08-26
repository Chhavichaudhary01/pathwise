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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PrerequisiteGraphTest {

    private PrerequisiteGraph graph;

    @BeforeEach
    void setUp() {
        graph = new PrerequisiteGraph();
    }

    private CatalogItem createItemWithOutcome(String idStr, String outcomeSkillId) {
        CatalogItem item = new CatalogItem();
        item.setId(UUID.randomUUID()); // we'll rely on the object itself
        
        Skill s = new Skill();
        s.setId(outcomeSkillId);
        
        CatalogItemSkill cis = new CatalogItemSkill();
        cis.setSkill(s);
        cis.setOutcome(true);
        cis.setPrerequisite(false);
        
        item.setItemSkills(new HashSet<>(Arrays.asList(cis)));
        return item;
    }

    private CatalogItem createItemWithPrereq(String idStr, String prereqSkillId) {
        CatalogItem item = new CatalogItem();
        item.setId(UUID.randomUUID());
        
        Skill s = new Skill();
        s.setId(prereqSkillId);
        
        CatalogItemSkill cis = new CatalogItemSkill();
        cis.setSkill(s);
        cis.setOutcome(false);
        cis.setPrerequisite(true);
        
        item.setItemSkills(new HashSet<>(Arrays.asList(cis)));
        return item;
    }

    @Test
    void testBuildGraph_Linear() {
        CatalogItem itemA = createItemWithOutcome("A", "skill-1");
        CatalogItem itemB = createItemWithPrereq("B", "skill-1");

        graph.buildGraph(Arrays.asList(itemA, itemB));

        // A provides skill-1, B requires skill-1 -> edge A -> B
        assertTrue(graph.getAdjacencyList().get(itemA.getId()).contains(itemB.getId()));
        assertFalse(graph.getAdjacencyList().get(itemB.getId()).contains(itemA.getId()));
    }

    @Test
    void testBuildGraph_CircularDependency() {
        CatalogItem itemA = new CatalogItem();
        itemA.setId(UUID.randomUUID());
        CatalogItem itemB = new CatalogItem();
        itemB.setId(UUID.randomUUID());

        Skill s1 = new Skill(); s1.setId("skill-1");
        Skill s2 = new Skill(); s2.setId("skill-2");

        // A provides skill-1, requires skill-2
        CatalogItemSkill aOut = new CatalogItemSkill(); aOut.setSkill(s1); aOut.setOutcome(true);
        CatalogItemSkill aPre = new CatalogItemSkill(); aPre.setSkill(s2); aPre.setPrerequisite(true);
        itemA.setItemSkills(Set.of(aOut, aPre));

        // B provides skill-2, requires skill-1
        CatalogItemSkill bOut = new CatalogItemSkill(); bOut.setSkill(s2); bOut.setOutcome(true);
        CatalogItemSkill bPre = new CatalogItemSkill(); bPre.setSkill(s1); bPre.setPrerequisite(true);
        itemB.setItemSkills(Set.of(bOut, bPre));

        // Cyclic graph should build cleanly and sort both items resiliently
        assertDoesNotThrow(() -> graph.buildGraph(Arrays.asList(itemA, itemB)));
        List<CatalogItem> sorted = graph.topologicalSort(Set.of(itemA.getId(), itemB.getId()));
        assertEquals(2, sorted.size());
    }
    
    @Test
    void testTopologicalSort() {
        CatalogItem itemA = createItemWithOutcome("A", "skill-1");
        CatalogItem itemB = createItemWithPrereq("B", "skill-1");
        // add outcome to B to support C
        Skill s2 = new Skill(); s2.setId("skill-2");
        CatalogItemSkill bOut = new CatalogItemSkill(); bOut.setSkill(s2); bOut.setOutcome(true);
        itemB.getItemSkills().add(bOut);

        CatalogItem itemC = createItemWithPrereq("C", "skill-2");

        graph.buildGraph(Arrays.asList(itemC, itemA, itemB));

        Set<UUID> toSort = new HashSet<>(Arrays.asList(itemA.getId(), itemB.getId(), itemC.getId()));
        List<CatalogItem> sorted = graph.topologicalSort(toSort);

        assertEquals(3, sorted.size());
        assertEquals(itemA.getId(), sorted.get(0).getId());
        assertEquals(itemB.getId(), sorted.get(1).getId());
        assertEquals(itemC.getId(), sorted.get(2).getId());
    }
}
