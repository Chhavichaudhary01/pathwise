# PathWise — Complete UI/UX Specification
*(Companion file to `pathfinder-springboot-prompt.md`. Paste this alongside the master prompt, or reference it explicitly: "Also follow every page spec in pathfinder-ui-spec.md." Every entity/field named here matches the backend schema in the master prompt exactly — `User`, `LearnerProfile`, `Skill`, `CatalogItem`, `Roadmap`, `RoadmapItem`, `Milestone`, `ProgressEvent`, `Feedback`, `ChatMessage`, `RefreshToken`, `CompletionRecord`, `AssessmentResult` — so the UI is directly implementable against that schema with no translation layer needed.)*

---

## RESEARCH BASIS — what real users complain about, and what this spec does differently

Grounded in 2026 EdTech UX research and AI-chat-interface research, not guesswork:

- **EDUCAUSE research** on LMS adoption found submitting-assignment satisfaction at 77% but collaboration-heavy features at just 43% — the more a platform asks different tasks to share one generic workflow, the worse it performs. **PathWise response:** every major function (onboarding, roadmap, chat, dashboard, settings) gets its own purpose-built layout, not one generic "content panel" reused everywhere.
- **Canvas/major-LMS reviewers** repeatedly cite notification overload and cluttered menus as the top complaint, with settings buried deep in menus. **PathWise response:** a single, short, prioritized notification model (Section 9) and settings that are flat, not nested more than one level deep.
- **Students explicitly benchmark LMS platforms against Notion, YouTube, and Duolingo** and notice immediately when a platform feels slower or clunkier. **PathWise response:** treat consumer-app polish (fast transitions, real feedback on every action, no dead clicks) as a baseline requirement, not a stretch goal — this is stated explicitly per page below.
- **"88% of users are less likely to return to a platform with poor design"** and cluttered old-style dashboards (many buttons, everything on one page) are named as the direct cause of low adoption in older LMS tools. **PathWise response:** progressive disclosure everywhere — never show more than 3-4 primary actions on any screen; secondary actions live behind a clearly-labeled "More" affordance, never invented icons with no label.
- **12 UI Mistakes That Kill AI Apps (2026)** names the single most common AI-app UI mistake as a generic spinner for 2-8 second LLM responses — users start trying to interact after 3 seconds and consider leaving after 5. **PathWise response:** every AI-generating action (roadmap generation, "why this?", chat replies, mastery-check generation) uses streaming/token-by-token rendering with a skeleton loader, never a bare spinner.
- **AI chat interface research (2026)** identifies four properties that separate a trustworthy chat UI from a generic wrapper: capability transparency, recovery patterns, confidence display, and accessibility — and explicitly warns that most AI apps ship "the same skeleton: bubbles + spinner + input box," which reads as a cheap ChatGPT clone. **This is the most important instruction in this document: the PathWise chat assistant must NOT look like a bare ChatGPT/Claude clone.** Concrete differentiators required (detailed in the Chat Assistant page spec below): the assistant is docked contextually next to the roadmap/dashboard content it's discussing rather than being a full-bleed centered chat screen, responses can render as structured cards (a recommended resource, a milestone action, a chart) inline in the conversation instead of only plain text, and every AI action has a visible confirm-before-apply step rather than silently mutating data.
- **Chat-vs-form guidance (2026):** chat is for open-ended exploration; forms/buttons are for anything with a clear data shape. **PathWise response:** onboarding uses chat only for the free-text goal description — every subsequent structured field (time availability, learning style) uses quick-reply chips/buttons rendered inside the chat thread, not free typing, so it's fast and unambiguous.

---

## GLOBAL DESIGN SYSTEM

### Visual identity
- **Palette (6 named hex tokens, derive real values from these roles, do not use the default indigo/purple "AI app" palette):** `--surface` (a warm, low-saturation neutral, not stark white or true black), `--surface-raised` (card background, one step lighter/darker than surface), `--ink` (primary text, near-black with slight warmth, never pure #000), `--ink-muted` (secondary text), `--accent-primary` (the one saturated color used for primary actions and the signature moment — pick something in the growth/forward-motion family: a confident green, teal, or amber, NOT indigo/violet, NOT Anthropic's terracotta #D97757), `--accent-secondary` (a complementary tone used sparingly for AI-specific moments like "why this?" so AI content is visually distinguishable from static UI without looking like a separate bolted-on product).
- **Typography:** a distinctive display face for headlines/phase titles (used sparingly — page titles, milestone titles, the landing hero), a highly legible body face for everything else (16px minimum body size, 1.5+ line height), and a monospace or distinct data face for scores, percentages, and badges (fit score, mastery %, demand indicator) so numeric/status information is visually distinct from prose at a glance.
- **Motion:** page transitions are fast (150-200ms) and consistent; the two moments that deserve real animation budget are (1) the roadmap re-adapt sequence and (2) milestone completion — everything else should feel instant, not "AI-magical." Respect `prefers-reduced-motion` by disabling all non-essential motion.
- **Iconography:** every icon-only control has a visible text label on hover/focus at minimum, and on mobile every icon-only control gets a persistent label — no mystery-meat navigation.
- **Dark mode:** full parity, not an inverted-filter afterthought — define `--surface`/`--ink` etc. as semantic tokens with separate light/dark values from the start.

### Global layout rules
- **Never more than 4 primary navigation destinations** visible at once (Dashboard, Roadmap, Chat, Settings) — this directly avoids the "cluttered menu" complaint research names as the top LMS grievance.
- **Settings is flat**, one level deep — Profile, Security, Notifications, Data & Privacy as tabs on a single page, never nested sub-menus.
- **Notifications are prioritized, not accumulated** — a single bell icon with a short, capped list (max 5 visible, grouped by type: progress, roadmap change, account) rather than an ever-growing unread count that trains users to ignore it.
- **Every destructive or AI-mutating action requires a visible confirm step** — this is both a UX-research-backed trust requirement and ties directly to Section 6e Problem 16 (no dark patterns) in the master prompt.

---

## PAGE-BY-PAGE SPECIFICATION

### 1. Landing Page (`/`)
**Purpose:** convert a cold visitor (including a judge with 10 seconds) into either a demo session or a signup.
**Layout:** hero (headline + one-sentence value prop + two CTAs: "Try instant demo" primary, "Sign up" secondary — never bury the free/no-signup option below the fold), a 3-step "how it works" strip (Describe your goal → Get your roadmap → Track & adapt), a feature highlight grid (4-6 cards, one per major capability: adaptive roadmap, AI explanations, skill graph, mastery verification), a closing CTA.
**Specific requirement:** the "Try instant demo" button is never more than one click from the very top of the page — this directly serves both the judge-evaluation-speed goal and the "88% won't return to a confusing platform" research finding by removing all friction from first contact.
**Avoid:** stock-photo hero images, generic "AI-powered" badge iconography seen on every SaaS landing page in 2026.

### 2. Register (`/register`)
**Layout:** single-column, centered form, max 3 fields visible at once (email, password, confirm) — password strength meter appears inline as the user types, not only on submit-failure. Real-time email-format validation, real-time duplicate-email check debounced on blur (not on every keystroke).
**Empty/error states:** duplicate-email error offers a direct "Log in instead?" link inline, not just a red error string — turns a dead-end into a recovery path.

### 3. Email Verification Gate
**Layout:** not a separate page the user gets stuck on — a persistent, dismissible-but-reappearing banner across the top of the app ("Verify your email to unlock roadmap saving — Resend link") while still allowing full exploration of Demo Mode features. Never a hard block screen with nothing else to do.

### 4. Login (`/login`)
**Layout:** email/password fields, "Continue with Google" as an equally-weighted option (not visually deprioritized), "Forgot password?" inline under the password field, not hidden elsewhere.

### 5. Forgot / Reset Password
**Layout:** two simple steps (request → set new password), each with a single clear action and a confirmation state after each step ("If that email exists, a reset link is on its way" — never confirm/deny whether an email is registered, for security). Reset-token-expired state offers a direct "Request a new link" action, not a dead end.

### 6. Onboarding (`/onboarding`)
**Layout:** split screen (or stacked on mobile) — left/top: chat thread for the free-text goal description; right/bottom: a **live-updating profile summary card** that fills in fields (Goal, Current level, Interests, Weekly time, Learning style) as the AI extracts them from the conversation, each field individually editable inline (click to edit, not "restart the whole chat"). This directly implements the chat-vs-form research finding: free text only for the genuinely open-ended goal description, everything else becomes tappable quick-reply chips inside the thread (e.g., time availability offered as chip buttons: "2-4 hrs/wk," "5-9 hrs/wk," "10+ hrs/wk" — not typed).
**AI response rendering:** streamed token-by-token with a skeleton state, never a bare spinner (per the research above).
**Completion:** a distinct "Generate my roadmap" confirmation screen showing the full captured profile before committing — the user sees exactly what will drive their roadmap before it's generated, addressing the "black box AI" trust gap named throughout the research.

### 7. Roadmap List (`/roadmap`)
**Layout:** card grid, one card per `Roadmap` (supports multiple goals per user), each card showing goal title, overall progress %, and last-activity date. Empty state (no roadmaps yet) is an explicit invitation ("You haven't started a path yet — describe a goal to generate one") with a direct CTA into onboarding, never a bare "No data."

### 8. Roadmap Detail (`/roadmap/[id]`)
**Layout:** vertical phase timeline (not a generic Kanban board — the sequence itself carries meaning, per the "structure is information" design principle), each phase expandable to reveal its `Milestone`s, each milestone expandable to reveal its `RoadmapItem` resource cards.
**Resource card contents:** title, format icon+label, estimated hours, provider, difficulty, prerequisite tags, the **freshness badge** ("Verified fresh" / "May be outdated," from Problem 11), the **numeric fit score** (from Section 6b), and a "Why this?" button.
**"Why this?" interaction:** opens inline (an expanding panel directly under the card, not a modal that covers the whole screen) so the explanation stays visually connected to the specific item it's about — reinforces capability transparency without breaking the user's place in the roadmap.
**Feedback interaction:** per-item 👍/"too easy"/"too hard"/"not interested" as a small, always-visible control row on each card (not buried in a menu) — because feedback is a core mechanic (Problem 3/13), it must never require extra clicks to discover.
**Re-adapt moment:** on feedback submission, a distinct, brief animated transition highlights exactly which items changed (fade+reorder, not a full page reload), with a small AI-written caption explaining the change ("Since you found X too easy, we added an advanced track and moved Y up") — this is the single signature animated moment in the whole app; give it real design attention.
**Skill graph tab:** a `react-flow` node graph (skills as nodes, prerequisites as edges), mastery-color-coded from `AssessmentResult` data (not self-report), zoomable/pannable, with a node click opening a small side panel (not navigating away) showing that skill's related milestones.
**Wildcard resource:** visually distinguished (a distinct border/label treatment, e.g. a dashed border or a small "Outside your path" tag) from the core sequenced path so it reads as an intentional discovery moment, not a mis-sorted item.

### 9. Mastery Check (`/roadmap/[id]/milestone/[id]/assess`)
**Layout:** a focused, single-question-at-a-time flow (not a long scrollable form) — 3-5 questions from `AssessmentResult`, immediate per-question feedback tone (encouraging on correct, explanatory-not-punitive on incorrect), a clear pass/needs-review result screen. On a "needs review" result, the UI immediately offers the remedial resource (Problem 4) rather than just a low score with no next step.
**Practice artifact submission:** precedes the quiz per Problem 5 — a short text/code submission box with a visible AI review/feedback step before the quiz unlocks, framed as "Let's see what you built" not "Prove yourself."

### 10. AI Assistant (`/chat` + floating widget)
**This page must NOT resemble a bare ChatGPT/Claude interface — read the research section above again before building this.** Concrete requirements:
- **Docked, contextual placement:** the floating widget opens as a side panel anchored to whatever roadmap/dashboard content is currently on screen, not a full-bleed takeover — the user keeps their place.
- **Structured responses, not just text:** when the assistant references a roadmap item, milestone, or chart, it renders the actual UI card/mini-chart inline in the response, not a text description of it.
- **Action confirmation cards:** when the user asks the assistant to take an action ("mark this done," "swap this resource"), the assistant replies with a compact confirm card (action summary + Confirm/Cancel buttons) rather than silently mutating state or requiring a separate typed "yes."
- **Capability transparency on first open:** a short, dismissible intro state listing 3-4 concrete example questions the assistant can help with, grounded in the user's actual current roadmap (not generic "Ask me anything") — directly addresses the "empty prompt field paralyzes users" research finding.
- **Streaming + stop control:** token-by-token rendering with a visible stop-generation button during streaming.
- **Differentiated error states:** a timeout/network failure ("Connection issue — retry"), an AI-provider failover event (silent unless both Groq and Gemini fail, per the master prompt's Section 6d requirement), and an out-of-scope question (redirected clearly: "That's outside what I can help with here — try asking about your roadmap or goals") are three visually distinct states, never one generic red toast.
- **Session/thread history:** a collapsible left rail of prior conversation threads, titled from the first message, grouped by recency — this is now a baseline user expectation per the research, not a nice-to-have.

### 11. Dashboard (`/dashboard`)
**Layout:** a small number of purposeful widgets, not a dense grid of every metric available (directly avoiding the "cluttered old-style dashboard" complaint): overall progress ring/bar, a progress-over-time line chart, a skill-radar or bar chart (current vs. goal competencies, driven by `AssessmentResult` data), a streak/momentum indicator (framed positively — "4 of the last 7 days," never a guilt-inducing broken-streak visual), a single "next recommended action" card, and a compact recent-activity feed (last 5 items, "see all" link rather than an infinite unpruned list).
**Weekly digest:** surfaced as a dismissible card at the top of the dashboard on the appropriate day, not a separate page or only-email delivery.
**Empty state (new user, no activity):** shows the dashboard layout with clearly-marked placeholder/zero states and a direct link back to the roadmap, never a blank page.

### 12. Settings (`/settings`)
**Layout:** flat tab structure — Profile, Security, Notifications, Data & Privacy. Profile tab includes re-editable onboarding answers (explanation complexity toggle from Problem 10 lives here, and is ALSO surfaced contextually wherever AI explanations appear, per that section). Data & Privacy tab has "Export my data" and "Delete account" clearly separated — delete account requires a typed confirmation (e.g. type "DELETE") in a single modal, reachable in 2 clicks from Settings, never buried behind support contact (Problem 16).

### 13. Public Verification Page (`/verify/[uuid]`)
**Layout:** no login required, no app chrome — a clean, shareable, credential-style page showing the `CompletionRecord`: milestone/skill name, verified mastery score, date. Designed to look credible and screenshot/link-shareable for a recruiter or LinkedIn post (Problem 8), not styled like an internal app screen.

### 14. Demo Mode Banner
**Global element**, not a separate page: persistent but unobtrusive banner across all pages when in instant-demo mode, offering "Save your progress — Sign up" without blocking any functionality — a visitor should be able to fully evaluate the product before ever being asked to commit.

---

## RESPONSIVE & ACCESSIBILITY (apply to every page above, not restated per-page)

- 375px mobile breakpoint fully functional on Dashboard, Roadmap, and Chat (explicitly required in the master prompt's self-verification loop).
- Visible keyboard focus ring on every interactive element, full tab-order sanity on all forms and the chat composer.
- WCAG 2.1 AA contrast minimum on all text/background pairs, in both light and dark mode — verify with an automated audit (axe-core via Playwright), not just visual inspection; current research puts WCAG failure rates on the open web above 95%, so treat this as an active, tested requirement, not an assumption.
- Captions/transcript-availability metadata surfaced on any video-format `CatalogItem`, filterable (Problem 10).
- Dyslexia-friendly font toggle and adjustable text size, available from Settings and persisted per user.

---

## WHAT TO EXPLICITLY AVOID (compiled from all research above)

1. A bare "bubbles + spinner + input box" chat screen that looks like an unstyled ChatGPT wrapper.
2. Generic spinners on any AI action taking longer than 2 seconds — always stream or skeleton-load.
3. One dense dashboard page with every metric crammed in at once.
4. Settings nested more than one level deep.
5. Icon-only controls with no visible label.
6. A single generic error toast for every failure type.
7. An empty chat composer with only a generic "Ask anything" placeholder and no example prompts.
8. Silent AI-driven data mutation with no confirm step.
9. A broken-streak visual that guilt-trips the learner.
10. Any of the three templated "AI-generated app" looks named in the master prompt's Section 6f (cream/terracotta, black/acid-accent, hairline broadsheet).

---

Build every page above to this spec, using the exact entity/field names from `pathfinder-springboot-prompt.md`'s backend schema, so frontend and backend stay directly compatible with zero translation layer. Log any deviation from this spec, and why, in `DECISIONS.md`.
