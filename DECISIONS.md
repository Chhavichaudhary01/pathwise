# PathWise: Architecture & Implementation Decisions

This document outlines the key technical and design decisions made during the development of PathWise, along with the rationale behind them.

---

## 1. Hybrid Recommendation Engine vs. "Pure LLM"

* **Decision:** Implement a hybrid engine where a deterministic Java core (scoring + topological sort on a prerequisite graph) handles sequencing, while Google Gemini AI sits on top for semantic understanding and contextual explanation.
* **Rationale:** 
  * **Zero Prerequisite Hallucinations:** LLMs are prone to hallucinating prerequisites or inventing non-existent courses. A deterministic graph guarantees that prerequisite rules are mathematically satisfied and circular dependencies are avoided.
  * **Performance:** Pure Java topological sorting runs in milliseconds and consumes zero API tokens.
  * **Inspectability:** We assign numeric fit scores and verified mastery badges based on actual data matching, making the system transparent rather than a black box.

---

## 2. Embedding-Based Semantic Matching

* **Decision:** Use Google's `text-embedding-004` vector embeddings with in-memory caching to semantically match free-text user goals against catalog item descriptions and skills.
* **Rationale:** 
  * **Nuance:** A learner might enter *"I want to create user-friendly web interfaces"* while catalog tags are *"React"* or *"Frontend"*. Embeddings capture semantic intent, providing higher quality recommendations than keyword matching.

---

## 3. Tech Stack & Hosting Choices

* **Backend:** Spring Boot 3.3 + Java 21 on **Render**. Chosen for enterprise-grade type safety, layered architecture, and performance.
* **Database:** PostgreSQL on **Neon Cloud (v18.6)**. Chosen for serverless autoscaling, instant branching, and permanent cloud reliability.
* **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS on **Vercel / Netlify**.
* **AI Provider:** Google Gemini 1.5 Flash + Text-Embedding-004 with resilient deterministic fallbacks.

---

## 4. JWT Authentication vs. Sessions

* **Decision:** Use JWT (JSON Web Tokens) with access and refresh tokens, BCrypt password hashing, and role-based route protection.
* **Rationale:** 
  * **Statelessness:** Enables seamless horizontal scaling.
  * **Security:** 256-bit SHA-256 HMAC tokens provide robust security while supporting silent refresh.

---

## 5. Innovation & Differentiation Features

* **Mastery Checks, Not Self-Report:** Every milestone is gated by interactive 3-question mini-assessments to ensure genuine skill verification.
* **Deliberate Serendipity Injection:** Surfacing multidisciplinary wildcard resources (e.g., WCAG Accessibility for Frontend developers).
* **Weekly AI Progress Digest & Momentum Streak:** Proactively acknowledges consistency and effort to combat learner dropout.
* **Instant No-Signup Demo Mode:** Bypasses authentication friction, seeding a live demo profile and dropping the visitor directly into the dashboard.

---

## 6. Seed Data & Career Tracks

* **Decision:** Seed the catalog with ~60 structured items covering 4 distinct career tracks (Frontend Developer, Data Analyst, Machine Learning Engineer, Full-Stack Developer).

---

## 7. UI/UX Design System (Section 6f Compliance)

* **Color Palette:** Distinct, grounded color identity avoiding the generic purple/indigo AI cliché:
  * Primary Canvas: Slate / Neutral (`#f8fafc`, `#ffffff`)
  * Deep Accent: Midnight Slate & Navy (`#0f172a`, `#1e293b`, `#172554`)
  * Progression & Mastery: Emerald / Forest Green (`#16a34a`, `#22c55e`)
  * Action & Focus: Deep Cobalt Blue (`#2563eb`, `#1d4ed8`)
  * Wildcard / Serendipity: Warm Amber (`#f59e0b`, `#fef3c7`)
* **Typography & Hierarchy:** Bold display headlines, clean legible sans-serif body, with dedicated utility badges (fit scores, demand indicators, freshness badges).
* **Signature Visual Moments:**
  1. **Topological DAG Skill Graph (`/skill-graph`):** SVG interactive map with prerequisite arrows and color-coded mastery nodes.
  2. **Adaptive Recalibration Narration:** Animated top banner communicating dynamically adjusted pathing upon learner feedback.
  3. **Interactive Mastery Assessment Modal:** Instant grading and feedback to verify real retention.
* **Copy Voice:** Learner-first, active voice (*"Mark Complete"*, *"Take Mastery Check"*, *"Open Resource"*), with constructive, supportive guidance.
* **Quality & Accessibility Floor:** Full keyboard navigation, 375px mobile responsiveness, and high contrast compliant badges.
