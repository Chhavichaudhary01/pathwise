# MASTER BUILD PROMPT — "PathWise" AI Career & Learning Path Recommender
## Stack: Spring Boot (Java) + React — Production-Grade, Hackathon-Winning Build
*(Paste this entire document as the initial instruction to your Antigravity agent. Context: HCLTech AMPlified "PathFinder Prototype" round, competing against ~5,000 registered students. Deliverables: hosted demo URL, GitHub repo, demo video/write-up on approach, AI/ML components, and UX decisions. Judged out of 100. Build to win, not just to submit.)*

---

## ROLE

**Companion file:** a full page-by-page UI/UX specification exists in `pathfinder-ui-spec.md` — read it in full before building any frontend screen and follow it exactly. It defines every page's layout, states, and specific requirements (including explicit rules for making the AI chat assistant NOT look like a generic ChatGPT/Claude clone) using the same entity/field names as this document's backend schema.

You are an autonomous principal-level full-stack engineer, product designer, and QA lead. Build, test, self-verify, and finalize a **complete, production-grade, deployable SaaS application** called **PathWise** — an AI-Powered Personalized Career & Learning Path Recommender — with a Spring Boot backend and React frontend, from scratch, with zero further guidance from me beyond this document.

Standard to hold yourself to: if a senior engineer at a real company reviewed this pull request, it should pass review — clean layering, no god-classes, meaningful tests, no TODOs left in, no silent failures. Work in vertical slices, commit frequently with meaningful conventional-commit-style messages, and do not stop until every item in Section 9 (Final Checklist) is true.

Do not ask me clarifying questions. Where a decision is ambiguous, make the most sensible production-quality choice yourself and log it in `DECISIONS.md`.

---

## 1. PRODUCT SCOPE & CORE STORY

PathWise takes a learner from "I want to become a ___" to a concrete, adaptive, milestone-based roadmap — explained in plain language, with progress tracked and the path re-adapting as they learn.

### Full end-to-end feature list (build every item — this is the whole app)

**A. Landing & Access**
1. Public landing page — hero, how-it-works (3 steps), feature highlights, CTA.
2. "Try instant demo" — seeds a demo learner, drops the visitor straight into the dashboard, no signup required, clearly labeled "Demo Mode" with a "Save your progress — Sign up" banner.
3. Register (email + password) with server-side validation, password strength rules, duplicate-email handling.
4. Email verification flow (token generated server-side, verification link, gated features until verified — demo mode bypasses this).
5. Login (email + password) plus Google OAuth2 login.
6. Forgot password → emailed reset link → set new password → confirmation.
7. Logout everywhere. JWT access + refresh token flow with silent refresh on the frontend.
8. Route protection: unauthenticated users redirected to `/login` from protected routes, with return-to-intended-page behavior.

**B. Onboarding**
9. Conversational chat-based onboarding — learner describes their goal in natural language.
10. Progressive structured extraction woven into the chat: skill level, interests, weekly time availability, learning history/certifications, preferred learning style.
11. Live-updating profile summary panel the learner can correct inline before confirming.
12. "Generate my roadmap" confirmation step.

**C. Roadmap**
13. AI-generated roadmap: phases → milestones → resources, correctly sequenced by prerequisites via a real topological sort — not LLM guesswork.
14. Roadmap view: visual phase/milestone timeline, expandable resource cards (title, format, estimated hours, provider, difficulty, prerequisite tags).
15. "Why this?" button per resource → AI-generated explanation grounded in the learner's goal and profile.
16. Mark resources/milestones in-progress/complete; give feedback per item (good fit / too easy / too hard / not interested).
17. On feedback, the roadmap **visibly re-adapts** — remaining items re-rank/re-sequence, UI animates and highlights the change with a short AI-written narration explaining what changed and why.
18. Skill graph visualization (skills as nodes, prerequisites as edges, mastery color-coded).
19. Multiple roadmaps per user with a switcher/list view.

**D. AI Assistant**
20. Persistent chat assistant (dedicated page + floating widget) answering free-form questions grounded in the learner's profile and current roadmap.
21. In-chat actions (e.g., "mark this milestone done," "swap this resource") with a confirm step before applying, then reflected live in the UI.

**E. Dashboard**
22. Overall roadmap progress %, skill growth over time, streak/momentum tracker, next recommended action, recent activity feed.
23. Charts: progress-over-time line chart, skill-radar/bar chart of current competencies vs. goal requirements.

**F. Account & Settings**
24. Edit profile/onboarding answers, change password, connected accounts (Google), notification preferences, delete account (confirmation modal + real cascading data deletion), export my data (JSON download).
25. Light/dark theme toggle, persisted per user.

**G. Resilience & Polish**
26. Real empty states, loading skeletons everywhere data is fetched, graceful error states (AI provider down, network failure, backend cold-start) with retry actions — never a blank screen, never a raw stack trace or 500 page shown to the user.

---

## 2. TECH STACK (use exactly this — every piece free to run and free to host)

### Backend — Spring Boot
- **Java 21 + Spring Boot 3.x**, Maven.
- **Layering:** strict Controller → Service → Repository separation. DTOs at the controller boundary (never expose JPA entities directly in API responses). MapStruct or manual mappers for entity↔DTO.
- **Spring Data JPA + PostgreSQL** (Neon or Supabase free Postgres — see Section 6 for hosting rationale).
- **Spring Security** — JWT-based auth (access + refresh tokens, refresh token rotation, stored hashed), `spring-boot-starter-oauth2-client` for Google OAuth2 login, BCrypt password hashing, email verification + password reset via signed, time-limited tokens.
- **Flyway** for versioned DB migrations (never `hibernate.ddl-auto=update` in production config — migrations only).
- **Validation:** Bean Validation (`jakarta.validation`) on all request DTOs, global `@ControllerAdvice` exception handler returning a consistent JSON error shape (code, message, timestamp, path) — no raw stack traces ever reach the client.
- **AI/LLM — FREE PROVIDERS ONLY:** Groq (`console.groq.com`, free, no credit card, OpenAI-compatible REST API) as primary, called via Spring's `WebClient` (reactive, non-blocking) with `llama-3.3-70b-versatile` as the default model. Google Gemini free tier as an automatic fallback provider behind a shared `AiProvider` interface (`generateText`, `generateStructured`) — Groq 429 or timeout triggers failover, no user-visible failure. Never a paid-only provider anywhere.
- **Structured AI output:** prompt explicitly for JSON, strip markdown fences, validate against a Jackson-mapped schema class, retry once with a stricter instruction on parse failure, then fall back to a safe default rather than crashing the request.
- **Rate limiting:** Bucket4j (in-memory, per-IP or per-user) on AI-calling endpoints so a demo session can't exhaust free-tier quota.
- **Caching:** Spring Cache (simple in-memory `ConcurrentMapCacheManager` is fine) for AI explanations per roadmap item — don't regenerate "why this?" text that was already generated for the same item/context.
- **API docs:** springdoc-openapi (Swagger UI) auto-generated — free, and a nice thing to show judges as evidence of production discipline.
- **Logging:** SLF4J + Logback, structured log messages, no `System.out.println` anywhere, no secrets ever logged.

### Frontend — React
- **React 18 + Vite + TypeScript.**
- **Styling:** Tailwind CSS + shadcn/ui — clean, modern, a distinct color identity (not the default indigo/purple AI-app cliché), polished micro-interactions on roadmap re-adapt and milestone completion.
- **Routing:** React Router, with a route guard component wrapping protected routes.
- **State/data fetching:** TanStack Query for server state, lightweight context or Zustand for auth/session state.
- **Auth handling:** access token in memory, refresh token flow via httpOnly cookie or secure storage, automatic silent refresh + logout-on-expiry.
- **Charts:** Recharts. **Skill graph:** `react-flow`.
- **Forms:** React Hook Form + Zod for client-side validation mirroring backend validation rules.

### Testing (this is a major scoring lever — do not skimp)
- **Backend:** JUnit 5 + Mockito for service-layer unit tests (mock repositories/AI client). `@SpringBootTest` + **Testcontainers** (real Postgres in a container) for integration tests of controllers and repositories — no H2-only shortcuts, Testcontainers catches real SQL/JPA bugs H2 hides. `@WebMvcTest`/MockMvc for controller-layer contract tests (status codes, validation error shapes, auth-required 401s).
- **Frontend:** Vitest + React Testing Library for component/unit tests. Playwright for E2E: register → verify-gate → login; Google OAuth mock flow; full onboarding → roadmap generated; mark milestone complete → dashboard updates; feedback → roadmap visibly re-adapts; forgot-password flow; instant demo mode; token-expiry → silent refresh; token-refresh-failure → forced logout.
- **Edge cases to explicitly test (write real test cases for each, not just happy path):**
  - Circular prerequisite in the skill graph (must not infinite-loop the topological sort — detect and reject at seed/creation time)
  - Learner profile with zero stated skills (cold-start recommendation)
  - Learner who already knows every skill in the target track (roadmap should be near-empty with a clear message, not error)
  - Malformed/non-JSON response from the AI provider (must retry, then degrade gracefully, never 500)
  - AI provider returns a course/skill ID that doesn't exist in the catalog (must be filtered/rejected, never rendered broken)
  - Duplicate registration with an already-used, already-verified email
  - Expired/reused password-reset token (must reject with a clear error, not silently succeed)
  - Concurrent feedback submissions on the same roadmap item (no race condition corrupting roadmap state — use optimistic locking `@Version` on the Roadmap entity)
  - JWT expiry mid-request (must return 401 cleanly, frontend must silent-refresh and retry once, not show an error to the user for a routine token refresh)
  - Rate limit hit on the AI endpoint (must fail over to Gemini, and only show a user-facing message if BOTH providers are exhausted)
  - Account deletion cascades correctly — no orphaned roadmap/profile/chat rows left behind (write a test asserting row counts are zero post-delete)

---

## 3. ARCHITECTURE

**Backend package structure (`com.pathwise.*`):**
- `controller/` — REST controllers, DTOs only in/out
- `service/` — business logic, orchestrates repositories + AI client
- `repository/` — Spring Data JPA repositories
- `domain/` — JPA entities
- `dto/` — request/response DTOs + mappers
- `security/` — JWT filter, Spring Security config, OAuth2 success handler
- `ai/` — `AiProvider` interface, `GroqAiProvider`, `GeminiAiProvider`, prompt template classes (not inline strings scattered around), response schema classes
- `engine/` — pure Java, zero Spring/AI dependencies: `ScoringService`, `PrerequisiteGraph`, `Sequencer` — the deterministic recommendation core, 100% unit-testable in isolation
- `exception/` — custom exceptions + `@ControllerAdvice` global handler
- `config/` — CORS, OpenAPI, cache, rate-limit config

**Frontend structure:**
- `src/pages/` — Landing, Login, Register, ForgotPassword, ResetPassword, VerifyEmail, Onboarding, Dashboard, Roadmap, RoadmapList, Chat, Settings
- `src/components/` — reusable UI (shadcn-based)
- `src/features/` — feature-scoped logic (roadmap, chat, auth) with hooks + API calls colocated
- `src/lib/` — API client (Axios/fetch wrapper with token refresh interceptor), Zod schemas

**Key entities:** User, LearnerProfile, Skill, CatalogItem, Roadmap (with `@Version` for optimistic locking), RoadmapItem, Milestone, ProgressEvent, Feedback, ChatMessage, RefreshToken.

**Recommendation engine — hybrid, this is your core differentiator, narrate it clearly in the write-up:**
- Seeded catalog (~60–100 courses/projects/articles, Flyway seed migration) tagged by skill, level, format, prerequisite skill IDs, covering 4–5 career tracks (Data Analyst, Frontend Developer, ML Engineer, Product Manager, Digital Marketer).
- Deterministic scoring (skill-gap match) + prerequisite graph topological sort in plain Java, zero AI calls, fully unit-tested.
- The LLM sits on top: natural-language understanding, explanation generation, adaptive re-ranking hints — never inventing catalog data.
- Explicitly document in `DECISIONS.md` and `docs/ARCHITECTURE.md` why this beats a pure "ask the LLM for everything" approach.

---

## 4. HOSTING (all free, no credit card except optional GCP fallback)

- **Backend:** Render (Web Service, Docker or native Java buildpack, GitHub-connected auto-deploy). Free tier sleeps after 15 min idle — document a "give it 30-60 seconds to wake up" note in the demo write-up, or add a lightweight scheduled self-ping (respecting Render's fair-use) to reduce cold-start risk right before your demo/judging window.
- **Database:** Neon or Supabase free Postgres (permanent free tier, not Render's own DB add-on which is time-limited).
- **Frontend:** Vercel or Netlify (free, instant, GitHub-connected).
- **CORS:** backend must explicitly allow the deployed frontend origin — set via env var, not hardcoded, so local dev and prod both work.

---

## 5. SELF-VERIFICATION LOOP (mandatory — do not skip)

Run and fix until fully green, after each major slice and again at the end:
1. `mvn clean verify` (or `./gradlew build`) — compiles clean, all backend unit + integration tests pass, including every edge case in Section 2
2. `npm run build` (frontend) — zero errors
3. `npm run lint` (frontend) + Checkstyle/Spotless (backend) — zero errors
4. `npm run test` (Vitest) — component tests pass
5. `npx playwright test` — all E2E flows pass headless, including the edge-case flows (token refresh, rate-limit failover message, expired reset token)
6. Self-simulate the full user journey as a virtual user end-to-end (register → verify gate → login → onboarding with 2 different sample goals → roadmap sanity-check → mark items complete → dashboard updates → negative feedback → confirm visible re-adaptation → ask the assistant a follow-up → instant demo mode as a fresh visitor → forgot-password flow → settings: edit profile, delete account and confirm cascade) and log this trace with pass/fail per step in `VERIFICATION.md`
7. Confirm zero hardcoded secrets anywhere; `.env`/`application.yml` values all externalized; `.env.example` and `application-example.yml` list every variable with a one-line description of where to get it
8. Confirm the app degrades gracefully with no AI keys set, and with the DB unreachable (clear setup/error messages, never a stack trace)
9. Confirm mobile responsiveness at a 375px viewport on dashboard, roadmap, and chat
10. Confirm Swagger UI (`/swagger-ui.html`) renders and every endpoint is documented
11. Time a cold request to the deployed Render backend after 20+ min idle — confirm the frontend shows a "waking up" loading state instead of an error during that window

Do not stop at "it compiles." Stop only when the full user journey works logically end-to-end, looks demo-ready, and every edge case above has a passing test.

---

## 6. RUBRIC-TARGETED REQUIREMENTS (judging is 20% Problem Understanding, 25% Functionality, 20% AI/ML, 15% Innovation, 10% UX, 10% Performance/Code Quality — build these deliberately, don't leave them implicit)

### 6a. Problem Understanding & Solution Design (20%)
- Write a `docs/PROBLEM_STATEMENT.md` before building anything: articulate the specific learner pain points PathWise solves (decision paralysis from thousands of unordered courses, no visibility into prerequisites, generic one-size-fits-all recommendations, no feedback loop when a path stops fitting), each mapped explicitly to the feature that addresses it. This doc feeds directly into the required write-up's "problem understanding" section — write it so it can be copy-pasted in largely as-is.
- Every feature in Section 1 must trace back to one of these pain points — no feature-for-feature's-sake additions.

### 6b. AI/ML Implementation — go deeper than scoring + graph (20%)
In addition to the hybrid engine (Section 3), add real technique depth:
- **Embedding-based semantic matching:** use a free embedding model (Groq doesn't do embeddings — use a free local option via `sentence-transformers` through a lightweight Python microservice, OR a free-tier embedding API like Cohere's free tier or Google's `text-embedding-004` free tier) to semantically match the learner's free-text goal against catalog item descriptions, not just tag-based matching. This is a genuine ML technique beyond "call an LLM" and is worth explicitly naming in the write-up.
- **Confidence/fit scores:** every recommended item shows a numeric fit score (e.g., 87% match) derived from the deterministic engine, not invented by the LLM — makes the "AI/ML" story concrete and inspectable rather than a black box.
- **A simple recommendation-quality self-eval:** write an offline evaluation script (`scripts/evaluate-recommendations.ts` or a Java equivalent) that runs the engine against 5-10 synthetic learner profiles with known "ideal" outcomes and reports a basic precision-style metric. This is unusual for a hackathon submission and directly demonstrates ML rigor for the write-up — screenshot/report the output in `VERIFICATION.md`.
- Document the full pipeline (NLU extraction → embedding similarity → deterministic scoring → graph sequencing → LLM explanation) as a labeled diagram in `docs/ARCHITECTURE.md` — a clear multi-stage pipeline reads as far more sophisticated to judges than "we called an LLM."

### 6c. Innovation & Creativity (15%) — add at least these two standout features
- **"Day in the life" / role preview:** on any career track, an AI-generated short preview of what day-to-day work in that role actually looks like, grounded in the catalog's tagged skills — helps a learner sanity-check the goal itself, not just the path to it. Few competing teams will think to validate the *goal* before recommending the *path*.
- **Peer benchmarking (synthetic, privacy-safe):** show the learner an anonymized "learners on a similar path are typically at X% completion by week Y" comparison, computed from seeded synthetic progress data — adds a social/motivational dimension without needing real user data or raising privacy concerns.
- Call out both explicitly as intentional innovation choices in `DECISIONS.md` — judges scoring "innovation" are actively looking for things they haven't seen five other teams do.

### 6d. Competitive Differentiation (backed by real market research — implement all four)
Before building, write `docs/COMPETITIVE_ANALYSIS.md` comparing PathWise against Coursera Coach, LinkedIn Learning, Degreed/EdCast, and roadmap.sh, then build these four features specifically because they are gaps in ALL of the above:
- **Mastery checks, not self-report:** every milestone includes a short AI-generated mini-assessment (3-5 questions) before it can be marked complete. Skill graph mastery percentage is driven by assessment performance, not a self-clicked checkbox — this directly beats the "assessment depth" weakness found in enterprise platforms like Degreed.
- **Deliberate serendipity injection:** the recommendation engine intentionally surfaces one "wildcard" resource per roadmap phase that's adjacent-but-not-strictly-on-path (e.g., a foundational concept or a differently-angled resource), labeled "Outside your usual path — worth a look" with an AI explanation of why it's included. This directly counters the well-documented "over-reliance on AI curation limits serendipity" criticism of Coursera Coach.
- **Built-in motivation/accountability loop:** since reviews consistently show AI coaching is weak at sustaining long-term motivation (not just answering questions), add a lightweight weekly progress digest (in-app, not just email) with an AI-written encouraging summary of what was learned, what's next, and a gentle (never guilt-tripping) nudge if momentum has dropped — an explicit design response to a named competitor weakness, worth stating outright in the write-up.
- **Always fully free, no usage caps:** unlike roadmap.sh (hard free-tier caps that "don't reset") and Coursera (subscription-gated personalization), PathWise's AI features are never paywalled or rate-limited from the user's perspective (backend-side quota management via the Groq/Gemini failover in Section 2 stays invisible to the learner). State this explicitly as a product decision in `DECISIONS.md` — it's a genuine, demonstrable point of difference against every named competitor.

### 6e. Sixteen Research-Backed Problems From Existing Platforms — Implement All Sixteen
Grounded in published MOOC/LMS research (dropout studies across 15M+ course enrollments, 2025-2026) and the competitive review in 6d. Each is a genuine, evidenced problem with existing tools — implement the paired solution exactly:

1. **Problem:** 50% of all learner dropouts happen in the first 2 weeks (30% within week 1 alone) because onboarding is passive (videos/reading before any real engagement). **Solution:** the very first roadmap item after onboarding must always be a small, hands-on micro-project (not a course/video) completable in under an hour — research shows immediate hands-on work cuts early dropout ~22%. Enforce this in the roadmap generator: phase 1, item 1 is always `type=project`.
2. **Problem:** "Lack of time" is the #1 cited dropout reason (38%) because platforms recommend content without regard to how much time a learner actually has. **Solution:** capture weekly time availability during onboarding and make it a hard constraint in the sequencer — every roadmap phase shows a realistic "~X weeks at your pace" estimate computed from actual resource durations, and the engine refuses to front-load more hours than the stated budget in any single week.
3. **Problem:** Lost motivation (25% of dropouts) — AI tutors are proven good at answering questions but weak at sustaining motivation over time. **Solution:** the weekly progress digest (6d) plus a visible momentum/streak indicator on the dashboard, with the AI explicitly acknowledging effort, not just output ("You showed up 4 of 7 days this week" rather than only raw completion %).
4. **Problem:** Content too difficult for the learner's actual level (14% of dropouts) — most platforms don't verify skill level, they just ask once at signup and never re-check. **Solution:** mastery-check quizzes (6d) feed a live difficulty-fit signal; two consecutive failed mastery checks on a topic auto-triggers the adaptive re-ranking flow to insert a remedial resource before continuing, rather than letting the learner silently struggle or quit.
5. **Problem:** Perceived irrelevance to the learner's actual goal (10% of dropouts) — generic catalogs recommend broadly popular content, not goal-specific content. **Solution:** the "why this?" explanation (already in Section 1) is mandatory, not optional-on-click, at every phase transition — the AI proactively states how the upcoming phase connects to the learner's original stated goal before they start it.
6. **Problem:** Long-form video content sees a 50%+ engagement drop-off past 6 minutes, yet most catalogs don't account for this. **Solution:** tag every catalog resource with estimated segment length; the roadmap generator prefers resources broken into sub-6-minute segments where available, and for longer resources, auto-generates suggested checkpoint markers ("pause here, you've covered X") using the AI to summarize natural break points from the resource description.
7. **Problem:** Zero social accountability — the single largest proven lever in the research (cohort/social features cut dropout by 28%), and something no AI-solo-tutor product in the competitive set implements well. **Solution:** lightweight opt-in "learning buddy" matching — pair learners on similar goals/pace (or fall back to an anonymized synthetic cohort comparison if the user base is thin, consistent with the peer-benchmarking feature in Section 6c) plus an optional shareable public roadmap/streak link, without building a full social network.
8. **Problem:** Learners report genuine uncertainty about whether a completion certificate has any real value. **Solution:** replace a vague "certificate of completion" with an auto-generated, shareable **mastery portfolio page** per learner — lists specific verified skills (backed by mastery-check scores, not self-report), completed projects, and a link-ready summary suitable for sharing on LinkedIn or with a recruiter. This is concrete, verifiable proof of skill, not a vanity PDF.
9. **Problem:** Poor content discoverability — reviewers of major platforms explicitly complain that keyword search surfaces short, tangentially-related clips instead of what they need. **Solution:** semantic search over the catalog using the same embedding layer from Section 6b, exposed as a real search bar on the roadmap/resource views — "find where X is covered" returns semantically relevant results, not just keyword matches.
10. **Problem:** Accessibility is consistently treated as an afterthought in existing platforms rather than a foundational requirement, per the 2025-2026 systematic review. **Solution:** build accessibility in from the start, not bolted on: full keyboard navigation, ARIA labels on all interactive elements, a dyslexia-friendly font toggle, and resource metadata that includes whether captions/transcripts exist (surfaced as a filter) — treat this as a testable requirement in Playwright (basic a11y assertions), not just a visual nice-to-have.
11. **Problem:** Content staleness has no reliable signal — reviewers explicitly recommend manually checking a course's "last updated" date and treating anything 12-18 months old in fast-moving tech topics as unreliable, but this is buried metadata everywhere, never factored into ranking. **Solution:** every seeded `CatalogItem` carries a `lastVerifiedDate` and a `volatile: true/false` tag (volatile for frameworks/tools, exempt for timeless fundamentals); the scoring engine applies a visible decay to fit score for stale volatile items, and every resource card shows a "Verified fresh" or "May be outdated" badge computed from this field, not hidden in a tooltip.
12. **Problem:** Star ratings are a proven unreliable trust signal — reviewers themselves advise "only trust 4.5+ stars with 5,000+ reviews" because of rating inflation from incentivized early reviews and self-selection (learners who finish rate more generously than those who drop off). **Solution:** never show a bare star average; compute a weighted trust score combining review volume, recency, and completion-linked feedback (did this actually help the learner pass their mastery check, not just "did you like it"), with small-sample items flagged "Not enough data yet" instead of shown with a misleadingly precise number.
13. **Problem:** Roadmaps are generated once and stay static regardless of whether the learner is actually moving faster or slower than their stated time budget — no platform in the competitive set re-calibrates pacing against real velocity. **Solution:** a scheduled weekly job compares elapsed time vs. estimated hours actually completed against the learner's stated weekly availability, and surfaces an AI-written pacing suggestion on the dashboard ("You're moving 40% faster than planned — want a more advanced roadmap?") rather than silently letting the plan drift out of sync with reality.
14. **Problem:** The most capable AI-personalized learning tools (Degreed, EdCast) are explicitly built for organizations with 5,000+ employees, take months to implement, and require dedicated admins — a solo self-directed learner has no access to this caliber of tooling. **Solution:** PathWise is architected individual-first from the ground up, with no organization/seat/admin-console concept anywhere in the schema — a deliberate design decision stated explicitly in `DECISIONS.md`, verified by a timed E2E test asserting registration-to-first-roadmap completes in under a fixed time budget with zero setup steps.
15. **Problem:** Recommendations everywhere are ranked by content popularity or taxonomy match, never by actual hiring demand — a learner can spend months on a skill that isn't what employers are currently asking for. **Solution:** tag every skill with a seeded, honestly-documented demand indicator (High demand / Emerging / Niche, sourced from your own research into current job postings for the chosen career tracks — clearly labeled as a static proxy dataset, not a live feed, since no free live labor-market API is reliable enough for this timeline) and surface it on skill graph nodes and roadmap items as a minor, bounded positive weight that never overrides prerequisite ordering or skill-gap fit.
16. **Problem:** Pricing dark patterns actively erode learner trust — Udemy reviewers describe pricing as "confusing" and sales tactics as "manipulative" (constant fake-urgency discounts), and Coursera reviewers describe a "maze to cancel" with undisclosed auto-renewal charges. **Solution:** as a design ethic, not just a feature — no countdown timers, no pre-checked upsells, no dark patterns anywhere in the UI, and the delete-account flow reachable in 2 clicks or fewer from settings with no retention-flow interstitial, verified by a dedicated Playwright test. Costs nothing to build and is a legitimate, demonstrable trust differentiator worth stating explicitly in `DECISIONS.md`.

Document all sixteen explicitly in `docs/COMPETITIVE_ANALYSIS.md` alongside the citation-style research summary (dropout %, source pattern, or named competitor weakness per item) — this level of evidence-backed reasoning is very rare in hackathon write-ups and directly strengthens the "Problem Understanding" (20%) and "Innovation" (15%) scores.

### 6f. UI/UX Design System — avoid the generic "AI-generated app" look
Most competing submissions will default to one of three templated looks: a warm cream background with a terracotta accent, a near-black background with a single acid-green/vermilion accent, or a broadsheet layout with hairline rules and zero border-radius. All three are recognizable defaults, not choices — avoid them unless deliberately justified. Before writing any UI code, produce a design plan and follow it consistently across every screen:
- **Palette:** choose 4-6 named hex values grounded in PathWise's actual subject — a learner's journey/growth/progression, not a generic "AI product" mood. Avoid the near-purple/indigo "AI app" cliché entirely.
- **Typography:** pair a characterful display face (used with restraint — headlines, phase titles) with a clean, highly legible body face, plus a distinct utility face/weight for data, badges, and captions (fit scores, demand indicators, freshness badges from Section 6e). Set an explicit type scale, not default browser sizes.
- **Signature element:** choose one memorable, on-brief visual moment the app is remembered by — strong candidates here are the skill graph visualization (Section 1/18) or the roadmap re-adaptation animation (Section 1/17). Spend your visual boldness there; keep surrounding UI (forms, settings, lists) quiet, disciplined, and consistent.
- **Motion:** deliberate, not decorative — the roadmap re-adapt moment and milestone-completion feedback deserve real animation; everything else (nav, forms, list transitions) should be minimal and fast. Respect `prefers-reduced-motion`.
- **Copy voice:** write from the learner's side of the screen — plain, active-voice labels ("Mark complete," not "Submit"), consistent terminology from button to confirmation toast, and empty/error states written as clear direction ("No roadmap yet — describe a goal to generate one" not "No data"), never a raw error code shown to the user.
- **Quality floor, non-negotiable:** responsive to 375px (already required in Section 5), visible keyboard focus states on every interactive element, and the accessibility requirements from Problem 10 (Section 6e) — these are floor requirements, not optional polish.
- Self-critique before finalizing each major screen: if it would look identical for any generic SaaS dashboard brief, revise it — the roadmap, dashboard, and skill-graph screens in particular must feel specific to PathWise, not swappable with a generic admin template. Log the chosen palette/type/signature decisions in `DECISIONS.md` alongside the reasoning.

---

## 7. DIFFERENTIATORS — WHAT WINS AGAINST 5,000 TEAMS

- **Visible adaptive re-ranking** — feedback triggers an animated, narrated roadmap change so judges SEE the AI adapt in the demo video, not just trust it happened. Script this exact moment into your demo video.
- **Skill graph visualization** — a genuine standout visual moment.
- **Instant no-signup demo mode** — zero friction for judges evaluating fast.
- **Real, hardened auth** — most hackathon submissions fake or skip auth edge cases; yours handles token refresh, OAuth, verification, and reset properly. Mention this explicitly in the write-up as evidence of production maturity.
- **Genuine edge-case test coverage** — most teams show a green test badge with 3 happy-path tests. Yours has real edge-case coverage (circular prerequisites, race conditions, provider failover). This is a concrete, demonstrable answer to "AI/ML Implementation" and "Performance & Code Quality" judging criteria — show `VERIFICATION.md` and the test suite in your video.
- **Hybrid AI architecture, clearly narrated** — deterministic engine + LLM reasoning, not prompt-and-pray. State this explicitly and confidently in the write-up; most competitors won't have this framing.
- **Swagger/OpenAPI docs + clean layered backend** — enterprise-grade signal, fits an HCLTech audience.
- **Healthy gamification** — streaks/momentum, never guilt-tripping.
- **Polished empty/first-run states** — as much design care as the happy path.

---

## 8. REQUIRED OUTPUT FILES

1. Full source code (backend + frontend as two clearly organized directories or a monorepo), committed incrementally with meaningful conventional-commit messages showing real development progression.
2. `README.md` — overview, features, tech stack, architecture diagram (mermaid), screenshots placeholders.
3. `HELP.md` — exact, copy-pasteable setup: prerequisites (Java 21, Node, Docker for Testcontainers), backend `.env`/`application-local.yml` setup, frontend `.env` setup, every variable with where to get it (all free: Groq key, Gemini key, Neon/Supabase Postgres connection string, Google OAuth client ID/secret), `mvn spring-boot:run`, `npm run dev`, Flyway migration command, and full deploy steps to Render + Vercel + Neon from zero. Assume the reader has never touched this repo.
4. `.env.example` (frontend) and `application-example.yml` (backend) — every variable, no real values.
5. `DECISIONS.md` — every ambiguous call made and why (career tracks, scoring weights, hybrid engine rationale, JWT vs. session choice, why Render/Neon/Vercel).
6. `VERIFICATION.md` — the full self-test walkthrough log from Section 5, including edge-case results.
7. `docs/ARCHITECTURE.md` — system diagram + data flow, written so it drops almost directly into the required demo write-up covering approach, AI/ML components, and UX decisions.
8. `docs/COMPETITIVE_ANALYSIS.md` — comparison against Coursera Coach, LinkedIn Learning, Degreed/EdCast, and roadmap.sh, naming specific documented weaknesses in each and how PathWise's four differentiator features (Section 6d) directly address them — written for direct reuse in the demo write-up's innovation section.
9. `.gitignore` excluding `node_modules`, `target/`, `.env`, build artifacts, IDE files.

---

## 9. WHAT I WILL DO AFTER YOU FINISH

I will only: (a) paste my real Groq API key, Gemini API key, Neon/Supabase connection string, and Google OAuth credentials into the respective `.env`/`application-local.yml` files, (b) run the steps exactly as written in `HELP.md`, (c) `git push` once to GitHub, (d) connect the repo to Render (backend) and Vercel (frontend). Nothing else should be required, and nothing should ever require a paid subscription. If any step beyond "insert free keys, push, connect to Render/Vercel" is needed, that's a failure — fix it before finishing.

---

## 10. FINAL CHECKLIST (self-check before reporting completion)

- [ ] `mvn clean verify` succeeds with all backend tests (unit + Testcontainers integration) passing
- [ ] `npm run build` succeeds, all frontend tests + Playwright E2E pass
- [ ] Every edge case in Section 2 has a real, passing test
- [ ] Full auth flow works: register, verify email, login, Google OAuth, forgot/reset password, JWT refresh, logout, protected routes
- [ ] Instant no-signup demo mode works from the landing page
- [ ] All features in Section 1 (items 1–26) are functional, not stubbed
- [ ] Roadmap visibly re-adapts on feedback, with narration
- [ ] Skill graph visualization renders correctly
- [ ] Mobile responsive at 375px
- [ ] Swagger UI documents every endpoint
- [ ] App runs fully with only free keys added — no other manual steps
- [ ] README.md, HELP.md, .env.example, application-example.yml, DECISIONS.md, VERIFICATION.md, docs/ARCHITECTURE.md all present and complete
- [ ] No hardcoded secrets anywhere
- [ ] Commit history shows real incremental progress
- [ ] Deployed successfully to Render + Vercel + Neon, cold-start behavior verified and handled gracefully in the UI
- [ ] `docs/PROBLEM_STATEMENT.md` present, with every feature traced to a specific learner pain point
- [ ] Embedding-based semantic matching implemented and visibly influences recommendations (not just tag matching)
- [ ] Numeric fit/confidence score shown on every recommended item
- [ ] Offline recommendation-quality evaluation script exists and its output is captured in `VERIFICATION.md`
- [ ] "Day in the life" role preview and peer benchmarking features both implemented and demoable
- [ ] `docs/COMPETITIVE_ANALYSIS.md` present, naming specific competitor weaknesses and how PathWise addresses each
- [ ] Mastery-check assessments gate milestone completion (not self-report only)
- [ ] Serendipity/wildcard resource appears at least once per roadmap phase, clearly labeled and explained
- [ ] Weekly progress digest with AI-written summary is implemented and viewable in-app
- [ ] No AI feature is paywalled or visibly rate-limited to the end user
- [ ] All 16 research-backed problems (Section 6e) have their paired solution implemented and testable, not just described
- [ ] Freshness badges, weighted trust scores, pacing recalibration suggestions, demand indicators, and the 2-click delete flow are all functional
- [ ] UI follows a deliberate, documented design system (Section 6f) — no default indigo/purple "AI app" look, visible keyboard focus everywhere, signature moment (skill graph or re-adapt animation) is genuinely polished

Begin now. Work autonomously through all sections in order. Report back only once every item in Section 9 is checked off.
