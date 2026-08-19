# PathWise

PathWise is an AI-Powered Personalized Career & Learning Path Recommender. It takes a learner from "I want to become a ___" to a concrete, adaptive, milestone-based roadmap. 

## Features
- **Conversational Onboarding:** Natural language goal extraction.
- **Hybrid Recommendation Engine:** Combines LLMs with deterministic prerequisite graph sorting.
- **Adaptive Roadmaps:** Roadmaps update automatically based on user feedback.
- **"Day in the Life" Previews:** AI-generated previews of target roles.
- **Skill Graph Visualization:** Interactive visualization of learning dependencies.

## Architecture
See docs/ARCHITECTURE.md for system diagrams and the hybrid pipeline explanation.

## Tech Stack
- **Backend:** Java 21, Spring Boot 3.x, PostgreSQL, Flyway, Spring Security (JWT)
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **AI / ML:** Groq, Google Gemini, Sentence Transformers

## Setup Instructions
Please refer to HELP.md for detailed local setup and deployment instructions.
