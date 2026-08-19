# Setup & Deployment Guide

## Prerequisites
- Java 21
- Node.js 20+
- Docker (required for Testcontainers and local PostgreSQL)
- Maven
- Git

## 1. Environment Variables

### Backend (pplication-local.yml or .env)
Create ackend/.env (or configure via your IDE):

`env
# Database (Free tier options: Neon, Supabase)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/pathwise
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# JWT Secret (Generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_that_is_at_least_32_bytes_long
JWT_EXPIRATION_MS=3600000
JWT_REFRESH_EXPIRATION_MS=86400000

# Google OAuth (Get from Google Cloud Console)
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=your_client_id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=your_client_secret

# AI Providers (Free tiers)
GROQ_API_KEY=your_groq_api_key       # Get from console.groq.com
GEMINI_API_KEY=your_gemini_api_key   # Get from aistudio.google.com

# Allowed CORS Origins
ALLOWED_ORIGINS=http://localhost:5173
`

### Frontend (rontend/.env)
Create rontend/.env:

`env
VITE_API_URL=http://localhost:8080
`

## 2. Local Development

### Start Backend
`ash
cd backend
# Flyway will run automatically on startup
mvn spring-boot:run
`

### Start Frontend
`ash
cd frontend
npm install
npm run dev
`

## 3. Testing
`ash
# Backend (requires Docker for Testcontainers)
cd backend
mvn clean verify

# Frontend
cd frontend
npm run test
npx playwright test
`

## 4. Deployment (Free Tier)

### Database (Neon / Supabase)
1. Create a free PostgreSQL instance.
2. Update SPRING_DATASOURCE_URL, USERNAME, and PASSWORD in your production environment variables.

### Backend (Render)
1. Create a "Web Service" on Render.
2. Connect your GitHub repository.
3. Build Command: mvn clean package -DskipTests
4. Start Command: java -jar target/*.jar
5. Add all backend environment variables listed above.

### Frontend (Vercel / Netlify)
1. Create a new project and connect the repository.
2. Set root directory to rontend.
3. Build Command: 
pm run build
4. Output Directory: dist
5. Set VITE_API_URL to your Render backend URL.
