# PathWise: System Architecture & Data Flow

This document details the architectural components, data flow, and the multi-stage AI pipeline of PathWise.

## System Diagram

`mermaid
graph TD
    %% Frontend
    subgraph Frontend [React + Vite SPA]
        UI[UI Components / shadcn]
        State[Zustand State]
        Query[TanStack Query]
        API_Client[Axios API Client]
        
        UI --> State
        UI --> Query
        Query --> API_Client
    end

    %% External Services
    subgraph External [External Services]
        Google[Google OAuth]
        Gemini[Google Gemini API]
    end

    %% Backend
    subgraph Backend [Spring Boot Backend]
        Controller[REST Controllers]
        Security[Spring Security / JWT Filter]
        Service[Business Logic Services]
        
        %% Recommendation Engine
        subgraph Engine [Hybrid Recommendation Engine]
            Embeddings[Embedding Service / API]
            Scoring[Deterministic Scoring]
            Graph[Prerequisite Graph / Topological Sort]
            LLM_Logic[LLM Explanation & NLU]
        end
        
        Repository[Spring Data JPA Repositories]
        
        API_Client -- HTTPS --> Security
        Security --> Controller
        Controller --> Service
        Service --> Engine
        Service --> Repository
    end

    %% Database
    subgraph Database [PostgreSQL on Neon]
        DB[(Relational Tables & JSONB)]
    end

    %% Connections
    Repository --> DB
    Security -.-> Google
    LLM_Logic -.-> Gemini
`

## The Hybrid Recommendation Pipeline

Our core differentiator is a multi-stage pipeline that combines deterministic logic with AI capabilities, rather than relying on a single "black box" LLM call.

1. **NLU Extraction (LLM):** The user's natural language goal (e.g., "I want to be a data analyst but I only know Excel") is parsed by the LLM into a structured JSON profile (current skills, target skills, time available).
2. **Semantic Matching (Embeddings):** The user's goal and extracted profile are converted into vector embeddings. We compare these against the embeddings of catalog items to find semantically relevant courses/projects, going beyond simple keyword tags.
3. **Deterministic Scoring (Java):** A pure Java scoring engine evaluates the semantic matches against the user's existing skills. It assigns a "Fit Score" (e.g., 85%) based on the skill gap and format preferences.
4. **Graph Sequencing (Java):** The top-scoring items are fed into a directed acyclic graph (DAG) representing prerequisites. A topological sort ensures that items are sequenced correctly (e.g., "Python Basics" strictly before "Pandas Data Analysis"). Circular dependencies are detected and rejected here.
5. **LLM Explanation (LLM):** Finally, the sequenced roadmap is sent back to the LLM to generate the "Why this?" contextual explanations, grounding the deterministic choices in the user's original goal.

This approach guarantees structural correctness (no hallucinated prerequisites) while maintaining the personalization and conversational feel of AI.

## Data Flow: Roadmap Generation

1. **Client:** User completes onboarding chat.
2. **Backend:** /api/v1/onboarding/extract uses AI to parse the chat history into a structured LearnerProfile.
3. **Backend:** /api/v1/roadmaps/generate is called with the profile.
4. **Engine:** The Hybrid Pipeline (described above) runs:
    * Fetch relevant catalog items from DB.
    * Compute Embeddings similarity.
    * Score and sort via the Prerequisite Graph.
    * Generate explanations.
5. **Database:** The final Roadmap and its RoadmapItems are persisted.
6. **Client:** Receives the roadmap JSON and renders the timeline and Skill Graph.

## Data Flow: Adaptive Re-ranking

1. **Client:** User clicks "Too Hard" on a specific RoadmapItem.
2. **Backend:** Receives feedback event. Optimistic locking (@Version) ensures no concurrent modifications corrupt the state.
3. **Engine:** 
    * The scoring algorithm adjusts weights for this user (e.g., favoring lower difficulty or different formats).
    * Uncompleted items are re-scored and re-sorted through the graph.
    * An AI prompt generates a short narration: "I noticed you found that module difficult, so I've swapped in a more beginner-friendly tutorial for the next step."
4. **Database:** Roadmap state is updated.
5. **Client:** The UI animates the changes and displays the narration.
