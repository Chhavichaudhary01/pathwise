# PathWise: Problem Statement & Solution Design

## Executive Summary
In online learning and career pivoting, **over 85% of learners drop out** before completing their self-directed path. PathWise addresses this systemic failure by pairing empirical MOOC/LMS dropout research with a **Deterministic Prerequisite Graph (DAG)** and **Google Gemini AI**.

---

## The 16 Research-Backed Problems & Paired Solutions

| # | Empirical Problem (Research Citation) | PathWise Architectural Solution |
|---|---|---|
| **1** | **Early Dropout (50% quit in first 2 weeks)**: Passive reading/videos cause immediate disengagement. | **Immediate Hands-on Micro-Project**: Phase 1, Item 1 is strictly enforced as a hands-on project completable in under 1 hour. |
| **2** | **"Lack of Time" (#1 cited dropout reason, 38%)**: Platforms ignore learner time constraints. | **Time-Budgeted Pacing Constraint**: Weekly hours availability is captured in onboarding and limits maximum weekly load with realistic completion timelines. |
| **3** | **Loss of Motivation (25% of dropouts)**: AI tutors answer questions but fail to sustain long-term drive. | **Weekly Progress Digest & Streak Tracker**: Proactive in-app weekly summary acknowledging effort and consistency over raw volume. |
| **4** | **Content Too Difficult / Skill Mismatch (14% dropouts)**: Platforms never verify stated skill level. | **Mastery Check Quizzes & Auto-Recalibration**: 3-question mini-assessments gate milestones; failure auto-inserts remedial prerequisite resources. |
| **5** | **Perceived Irrelevance to Actual Goal (10% dropouts)**: Generic catalogs recommend broadly popular content. | **Mandatory "Why This?" AI Grounding**: Every resource card explicitly states its direct mathematical and practical connection to the learner's goal. |
| **6** | **Long-Form Video Engagement Drop (50% drop past 6 min)**: Unstructured long lectures exhaust attention. | **Micro-Segment Tagging**: Prioritizes segmented content with checkpoint markers for natural learning breaks. |
| **7** | **Zero Social Accountability**: Solo learning lacks peer reinforcement. | **Peer Benchmarking**: Anonymized comparative pacing graphs and shareable public roadmap links. |
| **8** | **Uncertainty About Certificate Value**: Generic PDF certificates lack verifiable proof of skill. | **Shareable Mastery Portfolio**: Generates an interactive portfolio page showcasing verified skills and completed project artifacts. |
| **9** | **Poor Content Discoverability**: Keyword search returns tangentially related clips. | **Vector Semantic Search**: Embedding-based search (`text-embedding-004`) across all catalog descriptions and skill tags. |
| **10** | **Accessibility Neglected**: Platforms lack ARIA, keyboard navigation, and dyslexia support. | **Accessible First Architecture**: Full keyboard navigation, semantic markup, high-contrast labels, and clear segment indicators. |
| **11** | **Content Staleness & Tech Decay**: Outdated framework tutorials waste learner hours. | **Freshness & Volatility Decay**: Every resource includes a `lastVerifiedDate` and decay weighting for volatile tech topics. |
| **12** | **Inflated Star Ratings**: Star averages suffer from early incentivized reviews. | **Weighted Trust Score**: Incorporates completion feedback and mastery check performance rather than raw ratings. |
| **13** | **Static, Uncalibrated Roadmaps**: Paths drift out of sync with real learner velocity. | **Pacing Recalibration Engine**: Measures elapsed completion hours against budget to suggest speedups or remedial support. |
| **14** | **Enterprise-Only Tools (Degreed/EdCast)**: High-end learning pathways require $50k enterprise seats. | **Individual-First Architecture**: Zero admin barriers, 1-click instant demo mode, and self-service roadmaps. |
| **15** | **Misalignment with Labor Market Hiring Demand**: Recommending popular but obsolete tech. | **Labor Market Demand Index**: Nodes tagged with High Demand, Emerging, and Niche indicators from verified industry data. |
| **16** | **Pricing Dark Patterns & Cancellation Mazes**: Aggressive discounts and trapped subscriptions. | **Clean Ethic & 2-Click Account Deletion**: Transparent, subscription-free access with 2-click cascading data deletion. |
