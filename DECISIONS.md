# PathWise: Architecture & Implementation Decisions

This document outlines the key technical decisions made during the development of PathWise, along with the rationale behind them.

## 1. Hybrid Recommendation Engine vs. "Pure LLM"

*   **Decision:** Implement a hybrid engine where a deterministic Java core (scoring + topological sort on a prerequisite graph) handles the heavy lifting, while the LLM sits on top for natural language understanding and explanation.
*   **Rationale:** 
    *   **Reliability & Correctness:** LLMs are prone to hallucinating prerequisites or inventing non-existent courses. A deterministic graph guarantees that prerequisite rules are never violated and circular dependencies are avoided.
    *   **Performance:** Pure Java topological sorting and scoring run in milliseconds and don't consume API tokens.
    *   **Inspectability:** We can assign numeric "confidence/fit scores" based on actual data matching, making the system transparent rather than a black box.

## 2. Embedding-Based Semantic Matching

*   **Decision:** Use embedding-based semantic similarity (via a local sentence-transformers python service or Cohere free tier) to match user goals against catalog items, rather than simple tag matching.
*   **Rationale:** 
    *   **Nuance:** A user might say "I want to build web pages" while the catalog tags are "Frontend" or "React". Embeddings capture semantic intent, providing much higher quality recommendations than keyword matching.
    *   **Innovation:** This goes beyond simple prompt engineering and demonstrates real ML technique depth.

## 3. Tech Stack & Hosting Choices

*   **Backend:** Spring Boot 3.x + Java 21. Chosen for enterprise-grade maturity, strong typing, and excellent ecosystem. Hosted on **Render**.
*   **Database:** PostgreSQL on **Neon** (or Supabase). Chosen because it provides a permanent free tier and native JSONB support which is useful for storing flexible profile data.
*   **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui. Chosen for rapid development, excellent performance, and a polished, modern aesthetic. Hosted on **Vercel**.
*   **AI Providers:** Groq as primary (for speed and cost-effectiveness) with Gemini as fallback. This ensures high availability and resilience against rate limits during demonstrations.

## 4. JWT Authentication vs. Sessions

*   **Decision:** Use JWT (JSON Web Tokens) with short-lived access tokens and longer-lived refresh tokens stored in HttpOnly cookies (or secure storage).
*   **Rationale:** 
    *   **Statelessness:** Makes the backend easily horizontally scalable.
    *   **Security:** By keeping the access token in memory and the refresh token in an HttpOnly cookie, we mitigate both XSS and CSRF risks while providing a seamless user experience (silent refresh).

## 5. Innovation Features

*   **"Day in the Life" Preview:** We added this to validate the user's *goal*, not just the *path*. Many users start learning a skill without knowing what the day-to-day work actually entails.
*   **Peer Benchmarking (Synthetic):** Provides a powerful motivational tool without requiring real user data or raising privacy concerns. We use synthetic data to show "Learners on a similar path are typically at X% completion by week Y".
*   **Instant No-Signup Demo Mode:** Crucial for hackathon judging. It reduces friction to zero, allowing judges to experience the core value proposition immediately.

## 6. Seed Data & Career Tracks

*   **Decision:** Seed the catalog with 60-100 items covering 4-5 specific career tracks (e.g., Frontend, Data Analyst, ML Engineer, Product Manager).
*   **Rationale:** A focused, high-quality catalog within specific domains provides a much better demonstration of the recommendation engine's capabilities than a sparse, generic catalog attempting to cover everything.
