# PathWise 🗺️

**An AI-Powered Personalized Career & Learning Path Recommender.**

Built in 24 hours for the ultimate hackathon experience.

## ✨ Features
- **Deterministic + LLM Engine:** A hybrid recommendation engine that uses embeddings for semantic matching and a deterministic DAG for prerequisite resolution.
- **Dynamic Onboarding:** AI conversational interface to extract learner profiles.
- **Beautiful UI:** Built with React 18, Vite, Tailwind CSS, and shadcn/ui inspired components.
- **Secure Backend:** Spring Boot 3, Java 17, Spring Security with JWT & refresh tokens.
- **Production Grade Data:** PostgreSQL running locally with Flyway migrations and synthetic seeded data.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java 17
- PostgreSQL running locally or via Docker
- Groq & Gemini API keys

### Backend Setup
\\\ash
cd backend
cp .env.example .env # Add your GROQ_API_KEY and GEMINI_API_KEY
mvnw clean compile spring-boot:run
\\\

### Frontend Setup
\\\ash
cd frontend
npm install
npm run dev
\\\

## 📚 Documentation
- [Architecture Details](docs/ARCHITECTURE.md)
- [Problem Statement](docs/PROBLEM_STATEMENT.md)
- [Design Decisions](DECISIONS.md)

---
*Hackathon Submission by PathWise Team*
