package com.pathwise.service;

import com.pathwise.domain.RoadmapItem;
import com.pathwise.dto.ResourceGuideDto;
import com.pathwise.dto.ResourceGuideDto.*;
import com.pathwise.repository.RoadmapItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class ResourceGuideService {

    private final RoadmapItemRepository roadmapItemRepository;
    private final Map<String, ResourceGuideDto> curatedGuideCache = new ConcurrentHashMap<>();

    public ResourceGuideDto getGuideForTopic(String rawTopic, UUID roadmapItemId) {
        String topic = (rawTopic != null && !rawTopic.isBlank()) ? rawTopic.trim() : "Software Engineering Core";
        String normalizedKey = normalizeTopic(topic);

        ResourceGuideDto guide = curatedGuideCache.computeIfAbsent(normalizedKey, this::buildComprehensiveGuide);

        // Make an independent copy to attach item-specific context
        ResourceGuideDto response = ResourceGuideDto.builder()
                .topic(guide.getTopic())
                .category(guide.getCategory())
                .difficulty(guide.getDifficulty())
                .estimatedReadTime(guide.getEstimatedReadTime())
                .summary(guide.getSummary())
                .prerequisites(guide.getPrerequisites())
                .learningObjectives(guide.getLearningObjectives())
                .deepDiveMarkdown(guide.getDeepDiveMarkdown())
                .codeExamples(guide.getCodeExamples())
                .commonPitfalls(guide.getCommonPitfalls())
                .bestPractices(guide.getBestPractices())
                .practicalExercises(guide.getPracticalExercises())
                .authoritativeCitations(guide.getAuthoritativeCitations())
                .build();

        if (roadmapItemId != null) {
            roadmapItemRepository.findById(roadmapItemId).ifPresent(item -> {
                response.setRoadmapItemId(item.getId());
                response.setRoadmapItemStatus(item.getStatus());
            });
        }

        return response;
    }

    private String normalizeTopic(String topic) {
        String clean = topic.toLowerCase()
                .replaceAll("(?i)^(mastering|hands-on project:|learn|introduction to|foundations of)\\s+", "")
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim();
        if (clean.contains("react")) return "react";
        if (clean.contains("typescript") || clean.contains("ts")) return "typescript";
        if (clean.contains("javascript") || clean.contains("js") || clean.contains("es6")) return "javascript";
        if (clean.contains("html")) return "html";
        if (clean.contains("css") || clean.contains("tailwind")) return "css";
        if (clean.contains("spring") || clean.contains("java")) return "spring-boot";
        if (clean.contains("node") || clean.contains("express")) return "nodejs";
        if (clean.contains("docker") || clean.contains("container")) return "docker";
        if (clean.contains("kubernetes") || clean.contains("k8s")) return "kubernetes";
        if (clean.contains("postgres") || clean.contains("sql") || clean.contains("database")) return "postgresql";
        if (clean.contains("redis") || clean.contains("cache")) return "redis";
        if (clean.contains("graphql")) return "graphql";
        if (clean.contains("system design") || clean.contains("architecture")) return "system-design";
        if (clean.contains("git") || clean.contains("github")) return "git";
        if (clean.contains("python")) return "python";
        if (clean.contains("next")) return "nextjs";
        return clean;
    }

    private ResourceGuideDto buildComprehensiveGuide(String key) {
        return switch (key) {
            case "react" -> buildReactGuide();
            case "typescript" -> buildTypeScriptGuide();
            case "javascript" -> buildJavaScriptGuide();
            case "html" -> buildHtmlGuide();
            case "css" -> buildCssGuide();
            case "spring-boot" -> buildSpringBootGuide();
            case "nodejs" -> buildNodeJsGuide();
            case "docker" -> buildDockerGuide();
            case "kubernetes" -> buildKubernetesGuide();
            case "postgresql" -> buildPostgresGuide();
            case "redis" -> buildRedisGuide();
            case "system-design" -> buildSystemDesignGuide();
            case "git" -> buildGitGuide();
            case "python" -> buildPythonGuide();
            case "nextjs" -> buildNextJsGuide();
            default -> buildDynamicGenericGuide(key);
        };
    }

    private ResourceGuideDto buildReactGuide() {
        return ResourceGuideDto.builder()
                .topic("React.js & Modern Component Architecture")
                .category("Frontend Engineering")
                .difficulty("Intermediate")
                .estimatedReadTime("14 min read")
                .summary("Master modern declarative UI architecture with React: functional components, custom hooks, immutability, optimistic UI updates, and performance tuning.")
                .prerequisites(List.of("JavaScript ES6+ (Async/Await, Destructuring)", "DOM Tree & Event Propagation", "HTML5 & Modern CSS"))
                .learningObjectives(List.of(
                        "Understand unidirectional data flow and pure rendering mechanics",
                        "Master built-in Hooks (useState, useEffect, useMemo, useCallback, useActionState)",
                        "Create reusable Custom Hooks that encapsulate asynchronous workflows",
                        "Optimize re-renders using immutable state transitions and React DevTools Profiler"
                ))
                .deepDiveMarkdown("""
### 1. Mental Model: Declarative Component UI
In React, the User Interface is a **pure projection of state**:
$$UI = f(State)$$

Instead of imperatively manipulating the DOM (like `document.getElementById`), you declare how the UI should look for any given piece of state. React's Reconciliation engine calculates minimal DOM diffs and applies updates efficiently.

### 2. Pure Functions & Unidirectional Data Flow
- **Props** flow downward from parent to child.
- **Events** flow upward to trigger state changes.
- Components must remain pure with respect to their props and state: given the same inputs, they must always return the identical JSX.

### 3. Essential Hooks Architecture
- `useState`: Encapsulates local state variables across render cycles.
- `useEffect`: Synchronizes component lifecycle with external systems (APIs, WebSockets, window listeners).
- `useMemo` & `useCallback`: Memoize expensive computations and function references to avoid unnecessary subtree re-renders.
""")
                .codeExamples(List.of(
                        CodeExampleDto.builder()
                                .title("Custom Hook: Reusable API Fetcher with Cache & Optimistic Pacing")
                                .language("typescript")
                                .filename("useFetchData.ts")
                                .code("""
import { useState, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetchData<T>(url: string): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function execute() {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(url, { credentials: 'omit', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const result = await response.json();
        if (isMounted) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          setState({ data: null, loading: false, error: err });
        }
      }
    }

    execute();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url]);

  return state;
}
""")
                                .explanation("Demonstrates cleanup functions with AbortController to prevent race conditions and memory leaks on unmount.")
                                .build()
                ))
                .commonPitfalls(List.of(
                        "Directly mutating state objects (e.g. `state.items.push(x)`) instead of creating fresh copies (`[...state.items, x]`).",
                        "Missing dependencies in `useEffect` or `useCallback` dependency arrays.",
                        "Using array index as key props on dynamic lists with sorting or filtering."
                ))
                .bestPractices(List.of(
                        "Co-locate state as close as possible to the components that consume it.",
                        "Use functional updates `setCount(prev => prev + 1)` when the next state depends on the previous state.",
                        "Extract complex reducer logic into `useReducer` or state managers (Zustand)."
                ))
                .practicalExercises(List.of(
                        ExerciseDto.builder()
                                .title("Build an Optimistic Kanban Task Card")
                                .description("Implement an optimistic status toggle that immediately reflects in UI and rolls back on simulated network failure.")
                                .difficulty("Intermediate")
                                .starterCode("// Create KanbanItem with optimistic UI state")
                                .build()
                ))
                .authoritativeCitations(List.of(
                        DocReferenceDto.builder()
                                .title("React Official Documentation: Describing the UI & Hooks")
                                .domain("react.dev")
                                .url("https://react.dev/learn")
                                .description("Official guides covering components, state, hooks and performance.")
                                .build(),
                        DocReferenceDto.builder()
                                .title("MDN Web Docs: Introduction to Client-Side Frameworks")
                                .domain("developer.mozilla.org")
                                .url("https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_frameworks")
                                .description("Foundational web standards and browser runtime principles.")
                                .build()
                ))
                .build();
    }

    private ResourceGuideDto buildTypeScriptGuide() {
        return ResourceGuideDto.builder()
                .topic("TypeScript & Type-Driven Engineering")
                .category("Language Mastery")
                .difficulty("Intermediate")
                .estimatedReadTime("12 min read")
                .summary("Write bug-free scalable enterprise code with TypeScript: structural subtyping, union narrowing, generics, utility types, and strict mode.")
                .prerequisites(List.of("Modern JavaScript ES6+", "Object-Oriented & Functional Programming Basics"))
                .learningObjectives(List.of(
                        "Master structural typing (Duck Typing) vs Nominal Typing",
                        "Leverage Discriminated Unions for exhaustive state machines",
                        "Design reusable polymorphic functions and classes using Generics",
                        "Utilize advanced Mapped Types, Conditional Types, and Template Literal Types"
                ))
                .deepDiveMarkdown("""
### 1. Structural Typing Philosophy
TypeScript operates on a **structural type system**: if two objects have identical shape and compatible member types, they are interchangeable regardless of nominal class declarations.

### 2. Discriminated Unions & Exhaustiveness
Discriminated unions provide complete compile-time safety across polymorphic entities by assigning a shared literal `kind` or `type` property.

```typescript
type Result<T> = 
  | { status: 'SUCCESS'; data: T } 
  | { status: 'ERROR'; error: string };
```
""")
                .codeExamples(List.of(
                        CodeExampleDto.builder()
                                .title("Exhaustive State Pattern Matching")
                                .language("typescript")
                                .filename("stateMachine.ts")
                                .code("""
type AuthState = 
  | { status: 'ANONYMOUS' }
  | { status: 'AUTHENTICATING'; startedAt: number }
  | { status: 'AUTHENTICATED'; userId: string; token: string }
  | { status: 'FAILED'; reason: string };

function renderStatus(state: AuthState): string {
  switch (state.status) {
    case 'ANONYMOUS': return 'Please sign in.';
    case 'AUTHENTICATING': return 'Authenticating session...';
    case 'AUTHENTICATED': return `Welcome back user ${state.userId}`;
    case 'FAILED': return `Authentication error: ${state.reason}`;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
""")
                                .explanation("The `never` type check guarantees at compile time that every possible state variation is handled.")
                                .build()
                ))
                .commonPitfalls(List.of(
                        "Overusing `any` which completely disables TypeScript's safety guarantees (use `unknown` instead).",
                        "Using non-null assertion operator `!` carelessly without runtime validations.",
                        "Reinventing mapped types instead of using built-in utilities (`Partial`, `Pick`, `Omit`, `Record`)."
                ))
                .bestPractices(List.of(
                        "Always enable `\"strict\": true` in `tsconfig.json`.",
                        "Use `type` for unions/intersections and `interface` for extendable public API shapes.",
                        "Parse external runtime data using validation libraries (Zod / Valibot) to infer static types."
                ))
                .authoritativeCitations(List.of(
                        DocReferenceDto.builder()
                                .title("TypeScript Official Handbook")
                                .domain("typescriptlang.org")
                                .url("https://www.typescriptlang.org/docs/handbook/intro.html")
                                .description("Official guide to TypeScript types, modules, classes, and compiler options.")
                                .build()
                ))
                .build();
    }

    private ResourceGuideDto buildSpringBootGuide() {
        return ResourceGuideDto.builder()
                .topic("Spring Boot & Enterprise Microservices")
                .category("Backend Engineering")
                .difficulty("Intermediate to Advanced")
                .estimatedReadTime("16 min read")
                .summary("Build scalable, cloud-native Java services: Inversion of Control, Spring Security with JWT, JPA/Hibernate, Transactions, and REST contracts.")
                .prerequisites(List.of("Java 17/21 Syntax & OOP", "Relational Database Concepts & SQL", "HTTP & REST Architecture"))
                .learningObjectives(List.of(
                        "Understand Spring IoC Container & Dependency Injection lifecycle",
                        "Implement Stateless JWT Authentication & Role-Based Access Control",
                        "Master Spring Data JPA, Entity Relationships, and Query Optimization (avoid N+1)",
                        "Manage declarative database transactions with `@Transactional`"
                ))
                .deepDiveMarkdown("""
### 1. Spring Architecture & Dependency Injection
Spring decouples object creation from business logic through its **Inversion of Control (IoC)** container. Beans are registered and injected declaratively via `@Autowired` or constructor injection.

### 2. Data Persistence with JPA & Hibernate
- Entities map directly to SQL tables via `@Entity` and `@Table`.
- Repositories provide CRUD operations out of the box via Spring Data JPA.
- Always use `FetchType.LAZY` on `@ManyToOne` and `@ManyToMany` relationships to prevent Cartesian product performance penalties.
""")
                .codeExamples(List.of(
                        CodeExampleDto.builder()
                                .title("Production REST Controller with Service Layer & DTO Validation")
                                .language("java")
                                .filename("MilestoneController.java")
                                .code("""
@RestController
@RequestMapping("/api/v1/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping("/{id}")
    public ResponseEntity<MilestoneDto> getMilestone(@PathVariable UUID id) {
        MilestoneDto dto = milestoneService.findMilestoneById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MilestoneDto> completeMilestone(@PathVariable UUID id) {
        MilestoneDto completed = milestoneService.markAsComplete(id);
        return ResponseEntity.ok(completed);
    }
}
""")
                                .explanation("Demonstrates clean controller boundaries, constructor injection, and role authorization.")
                                .build()
                ))
                .commonPitfalls(List.of(
                        "Calling `@Transactional` methods from within the same class (bypasses Spring CGLIB proxy).",
                        "N+1 query problem caused by EAGER fetching in JPA entities.",
                        "Exposing raw database `@Entity` objects directly to HTTP clients instead of isolated DTOs."
                ))
                .bestPractices(List.of(
                        "Favor constructor injection with Lombok's `@RequiredArgsConstructor`.",
                        "Use database migration tools (Flyway / Liquibase) for schema versioning.",
                        "Handle exceptions globally using `@RestControllerAdvice`."
                ))
                .authoritativeCitations(List.of(
                        DocReferenceDto.builder()
                                .title("Spring Boot Reference Documentation")
                                .domain("spring.io")
                                .url("https://spring.io/projects/spring-boot")
                                .description("Authoritative guides for Spring framework, data, security, and cloud.")
                                .build()
                ))
                .build();
    }

    private ResourceGuideDto buildDockerGuide() {
        return ResourceGuideDto.builder()
                .topic("Docker Containerization & Multi-Stage Builds")
                .category("DevOps & Infrastructure")
                .difficulty("Intermediate")
                .estimatedReadTime("11 min read")
                .summary("Package applications into lightweight, reproducible OCI containers: image layers, multi-stage compilation, networking, volumes, and Docker Compose.")
                .prerequisites(List.of("Linux Terminal & CLI Basics", "Application Build Systems (npm, Maven, Gradle)"))
                .learningObjectives(List.of(
                        "Understand container isolation (Namespaces & Cgroups) vs Virtual Machines",
                        "Write optimized Dockerfiles leveraging multi-stage builds and layer caching",
                        "Manage persistent data using Docker Named Volumes",
                        "Orchestrate multi-service applications using Docker Compose"
                ))
                .deepDiveMarkdown("""
### 1. Containers vs Virtual Machines
Containers share the host operating system kernel and isolate processes using Linux **namespaces** (PID, NET, MNT) and **cgroups** (resource limits). This yields near-instant boot times and minimal overhead.

### 2. Multi-Stage Build Optimization
Multi-stage builds allow you to compile assets in a heavy build environment (containing compilers and SDKs) and copy only the final static binary or build output into an ultra-lean runtime container (such as Alpine or Distroless).
""")
                .codeExamples(List.of(
                        CodeExampleDto.builder()
                                .title("Optimized Multi-Stage Dockerfile for Spring Boot / React")
                                .language("dockerfile")
                                .filename("Dockerfile")
                                .code("""
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage (distroless/lean)
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 4444
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
""")
                                .explanation("Cuts image size by >70% and runs as non-root user for enterprise security compliance.")
                                .build()
                ))
                .commonPitfalls(List.of(
                        "Running container processes as the default `root` user.",
                        "Invalidating Docker build cache early by copying entire workspace before dependency manifests.",
                        "Storing database state directly inside container ephemeral layers without volumes."
                ))
                .bestPractices(List.of(
                        "Order Dockerfile instructions from least-frequently changing to most-frequently changing.",
                        "Include a `.dockerignore` file to omit `.git`, `node_modules`, and local build artifacts.",
                        "Scan images for vulnerabilities using tools like `trivy` or `docker scout`."
                ))
                .authoritativeCitations(List.of(
                        DocReferenceDto.builder()
                                .title("Docker Official Documentation & Guides")
                                .domain("docker.com")
                                .url("https://docs.docker.com/get-started/")
                                .description("Official guides covering Docker engine, Dockerfile best practices, and compose.")
                                .build()
                ))
                .build();
    }

    private ResourceGuideDto buildPostgresGuide() {
        return ResourceGuideDto.builder()
                .topic("PostgreSQL Database Architecture & Query Optimization")
                .category("Database & Storage")
                .difficulty("Intermediate")
                .estimatedReadTime("13 min read")
                .summary("Master relational data modeling, ACID transactions, B-Tree and GIN indexing, execution plan analysis (EXPLAIN ANALYZE), and connection pooling.")
                .prerequisites(List.of("Basic SQL Syntax (SELECT, INSERT, UPDATE, JOIN)", "Relational Schema Normalization"))
                .learningObjectives(List.of(
                        "Understand ACID guarantees and transaction isolation levels",
                        "Design optimal index structures (B-Tree, GIN, Partial & Composite indexes)",
                        "Diagnose slow queries using `EXPLAIN (ANALYZE, BUFFERS)`",
                        "Implement connection pooling with Neon Serverless or PgBouncer"
                ))
                .deepDiveMarkdown("""
### 1. ACID Transaction Guarantees
- **Atomicity**: All operations succeed or all rollback cleanly.
- **Consistency**: Data adheres to schema constraints, foreign keys, and triggers.
- **Isolation**: Prevents dirty reads, non-repeatable reads, and phantom reads.
- **Durability**: Committed data is safely written to Write-Ahead Logs (WAL).

### 2. Indexing Mechanics
Indexes prevent full table scans by maintaining ordered search trees. A B-Tree index provides $O(\\log N)$ lookup performance for equality and range queries.
""")
                .codeExamples(List.of(
                        CodeExampleDto.builder()
                                .title("Composite & Partial Indexing for High-Performance Queries")
                                .language("sql")
                                .filename("indexes.sql")
                                .code("""
-- Composite index for user roadmap search
CREATE INDEX idx_roadmap_user_status 
ON roadmaps (user_id, status);

-- Partial index for active notifications (saves index memory)
CREATE INDEX idx_pending_reminders 
ON learner_profiles (daily_reminder_time) 
WHERE daily_reminder_enabled = true;

-- Analyzing query execution plan
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title, status 
FROM roadmaps 
WHERE user_id = 'a1b2c3d4-0000-0000-0000-000000000000' 
  AND status = 'ACTIVE';
""")
                                .explanation("Partial indexes drastically reduce memory footprint by indexing only rows matching a specific predicate.")
                                .build()
                ))
                .commonPitfalls(List.of(
                        "Adding unnecessary indexes to high-write tables (every index adds write latency).",
                        "Using functions on indexed columns in `WHERE` clauses (e.g. `WHERE LOWER(email) = ...`) without an expression index.",
                        "Failing to monitor table bloat and autovacuum configuration."
                ))
                .bestPractices(List.of(
                        "Always use parameterized queries or ORMs to prevent SQL injection vulnerabilities.",
                        "Use connection pooling (PgBouncer) for microservices with high concurrent connections.",
                        "Utilize UUIDv7 or BIGSERIAL primary keys for efficient B-Tree page insertion."
                ))
                .authoritativeCitations(List.of(
                        DocReferenceDto.builder()
                                .title("PostgreSQL Official Documentation")
                                .domain("postgresql.org")
                                .url("https://www.postgresql.org/docs/current/")
                                .description("Authoritative guide to PostgreSQL database management and query tuning.")
                                .build()
                ))
                .build();
    }

    private ResourceGuideDto buildSystemDesignGuide() {
        return ResourceGuideDto.builder()
                .topic("System Design & Distributed Scalability")
                .category("Architecture & Engineering")
                .difficulty("Advanced")
                .estimatedReadTime("18 min read")
                .summary("Design resilient high-scale distributed systems: CAP theorem, load balancing, caching strategies, event-driven messaging, and microservices partitioning.")
                .prerequisites(List.of("Networking (TCP/IP, HTTP/2, DNS)", "Databases (SQL & NoSQL)", "Microservices Architecture"))
                .learningObjectives(List.of(
                        "Evaluate trade-offs with CAP Theorem & PACELC Theorem",
                        "Design scalable caching hierarchies (Cache-Aside, Write-Through, Write-Behind)",
                        "Implement asynchronous message queues (Kafka, RabbitMQ) for loose coupling",
                        "Structure resilient failover with circuit breakers, rate limiters, and idempotency"
                ))
                .deepDiveMarkdown("""
### 1. CAP Theorem Foundations
In a distributed system experiencing a network partition (**P**), you must choose between:
- **Consistency (C)**: Every read receives the most recent write or an error.
- **Availability (A)**: Every non-failing node returns a response, but it may contain stale data.

### 2. High-Yield Scalability Patterns
1. **Horizontal Scaling & Stateless Services**: Decouple session storage to Redis to allow dynamic autoscaling.
2. **Database Sharding & Read Replicas**: Distribute read load across replicas and partition large datasets by hash keys.
3. **Idempotency Keys**: Use unique tokens in HTTP headers (`Idempotency-Key`) to prevent double-charging or duplicate entity creation during network retries.
""")
                .codeExamples(List.of(
                        CodeExampleDto.builder()
                                .title("Cache-Aside Pattern with Redis & Fallback Database")
                                .language("java")
                                .filename("CacheAsideService.java")
                                .code("""
@Service
@RequiredArgsConstructor
public class CacheAsideService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final RoadmapRepository roadmapRepository;

    public Roadmap getRoadmapWithCache(UUID id) {
        String key = "roadmap:" + id;
        Roadmap cached = (Roadmap) redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return cached;
        }

        Roadmap fromDb = roadmapRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Roadmap not found"));

        redisTemplate.opsForValue().set(key, fromDb, Duration.ofMinutes(30));
        return fromDb;
    }
}
""")
                                .explanation("Prevents database overload by serving frequent reads from in-memory cache with TTL.")
                                .build()
                ))
                .commonPitfalls(List.of(
                        "Designing premature distributed microservices when a modular monolith is more maintainable.",
                        "Neglecting backpressure and unbounded memory queues in asynchronous message consumers.",
                        "Single Points of Failure (SPOFs) in centralized databases or load balancers."
                ))
                .bestPractices(List.of(
                        "Define strict Service Level Objectives (SLOs) for P99 latency and error budgets.",
                        "Implement circuit breakers (Resilience4j) to prevent cascading system failures.",
                        "Use distributed tracing (OpenTelemetry) to trace requests across microservice boundaries."
                ))
                .authoritativeCitations(List.of(
                        DocReferenceDto.builder()
                                .title("System Design Primer by Donne Martin")
                                .domain("github.com")
                                .url("https://github.com/donnemartin/system-design-primer")
                                .description("Curated open-source collection of system design scalability patterns.")
                                .build()
                ))
                .build();
    }

    private ResourceGuideDto buildJavaScriptGuide() {
        return buildBasicGuide("JavaScript ES6+ Core & Asynchronous Runtime", "Frontend & Backend", "Beginner to Intermediate", "10 min read",
                "Understand event loops, promises, closures, prototypes, and modern ECMAScript features.",
                "https://developer.mozilla.org/en-US/docs/Web/JavaScript");
    }

    private ResourceGuideDto buildHtmlGuide() {
        return buildBasicGuide("HTML5 Semantics & Web Accessibility", "Frontend Engineering", "Beginner", "8 min read",
                "Learn semantic tags, ARIA attributes, form validation, and web accessibility fundamentals.",
                "https://developer.mozilla.org/en-US/docs/Web/HTML");
    }

    private ResourceGuideDto buildCssGuide() {
        return buildBasicGuide("Modern CSS3, Flexbox, Grid & Tailwind", "Frontend Engineering", "Beginner to Intermediate", "10 min read",
                "Master responsive layouts, CSS Grid, Flexbox, custom properties, and utility-first styling with Tailwind CSS.",
                "https://developer.mozilla.org/en-US/docs/Web/CSS");
    }

    private ResourceGuideDto buildNodeJsGuide() {
        return buildBasicGuide("Node.js Runtime & Express.js APIs", "Backend Engineering", "Intermediate", "12 min read",
                "Build scalable non-blocking server applications with Node.js, event emitters, streams, and Express middleware.",
                "https://nodejs.org/docs/latest/api/");
    }

    private ResourceGuideDto buildKubernetesGuide() {
        return buildBasicGuide("Kubernetes Container Orchestration", "DevOps & Cloud", "Advanced", "15 min read",
                "Manage containerized workloads at scale: Pods, Deployments, Services, Ingress, and ConfigMaps.",
                "https://kubernetes.io/docs/home/");
    }

    private ResourceGuideDto buildRedisGuide() {
        return buildBasicGuide("Redis In-Memory Data Store & Caching", "Database & Storage", "Intermediate", "9 min read",
                "Leverage Redis data structures (Strings, Hashes, Lists, Sets, Sorted Sets), Pub/Sub, and cache invalidation.",
                "https://redis.io/docs/latest/");
    }

    private ResourceGuideDto buildGitGuide() {
        return buildBasicGuide("Git Version Control & Collaborative Workflows", "Developer Tooling", "Beginner to Intermediate", "9 min read",
                "Master branching strategies, rebasing, cherry-picking, interactive staging, and GitHub PR workflows.",
                "https://git-scm.com/book/en/v2");
    }

    private ResourceGuideDto buildPythonGuide() {
        return buildBasicGuide("Python 3 Essentials & Data Engineering", "General & Data Science", "Beginner to Intermediate", "11 min read",
                "Master Python syntax, list comprehensions, generators, context managers, and standard library modules.",
                "https://docs.python.org/3/tutorial/");
    }

    private ResourceGuideDto buildNextJsGuide() {
        return buildBasicGuide("Next.js App Router & Server Components", "Frontend Engineering", "Intermediate to Advanced", "14 min read",
                "Build production React applications with Server Components, streaming SSR, Server Actions, and edge deployment.",
                "https://nextjs.org/docs");
    }

    private ResourceGuideDto buildBasicGuide(String title, String category, String diff, String readTime, String summary, String docUrl) {
        return ResourceGuideDto.builder()
                .topic(title)
                .category(category)
                .difficulty(diff)
                .estimatedReadTime(readTime)
                .summary(summary)
                .prerequisites(List.of("Basic Computer Science Foundations", "Terminal & Editor Setup"))
                .learningObjectives(List.of(
                        "Understand core conceptual primitives and architectural models",
                        "Write clean, idiomatic, and maintainable implementation code",
                        "Avoid common anti-patterns in production environments",
                        "Verify retention with hands-on practice challenges"
                ))
                .deepDiveMarkdown("""
### 1. Conceptual Overview
This module provides a comprehensive, structured breakdown of core principles, mental models, and real-world engineering applications.

### 2. Key Architecture Points
- **Foundation**: Understand the underlying protocol and language specifications.
- **Production Standard**: Implement patterns optimized for performance, maintainability, and clean separation of concerns.
- **Scalability**: Design components that gracefully handle edge cases and high throughput.
""")
                .codeExamples(List.of(
                        CodeExampleDto.builder()
                                .title("Core Implementation Pattern")
                                .language("typescript")
                                .filename("example.ts")
                                .code("// Idiomatic implementation pattern for " + title + "\n\nexport function executeCoreWorkflow() {\n  console.log('Executing optimized workflow for " + title + "');\n  return { status: 'SUCCESS', timestamp: Date.now() };\n}")
                                .explanation("Clean modular function adhering to single-responsibility principles.")
                                .build()
                ))
                .commonPitfalls(List.of(
                        "Skipping foundational mental models before jumping into complex frameworks.",
                        "Neglecting error handling, timeout bounds, and resource cleanups.",
                        "Hardcoding environment configurations instead of using decoupled variables."
                ))
                .bestPractices(List.of(
                        "Maintain high unit and integration test coverage.",
                        "Follow standard industry style guides and linting rules.",
                        "Continuously profile and monitor production metrics."
                ))
                .authoritativeCitations(List.of(
                        DocReferenceDto.builder()
                                .title("Official Reference & Specification Documentation")
                                .domain(docUrl.replaceAll("https?://(www\\.)?", "").split("/")[0])
                                .url(docUrl)
                                .description("Authoritative guides and language documentation.")
                                .build()
                ))
                .build();
    }

    private ResourceGuideDto buildDynamicGenericGuide(String topic) {
        String cleanTitle = Arrays.stream(topic.split("[-\\s]+"))
                .map(w -> w.isEmpty() ? "" : Character.toUpperCase(w.charAt(0)) + w.substring(1))
                .reduce((a, b) -> a + " " + b)
                .orElse(topic);

        return ResourceGuideDto.builder()
                .topic(cleanTitle)
                .category("Technical Competency Track")
                .difficulty("Intermediate")
                .estimatedReadTime("10 min read")
                .summary("Structured educational breakdown, code examples, best practices, and verification guides for " + cleanTitle + ".")
                .prerequisites(List.of("Software Engineering Fundamentals", "Development Environment Setup"))
                .learningObjectives(List.of(
                        "Understand key concepts and architectural decisions for " + cleanTitle,
                        "Implement idiomatic patterns in production codebases",
                        "Identify and avoid common anti-patterns and performance bottlenecks",
                        "Verify retention through sandbox challenges and mastery checks"
                ))
                .deepDiveMarkdown("### 1. Overview & Fundamentals\\n\\n" + cleanTitle + " is a core competency required for modern full-stack and systems engineering. This module guides you step-by-step from foundational mental models to production implementation.\\n\\n### 2. Key Prerequisite Concepts\\n- Core syntax and execution semantics\\n- Data flow and state lifecycle\\n- Performance benchmarks and testing strategies")
                .codeExamples(List.of(
                        CodeExampleDto.builder()
                                .title("Starter Code Template")
                                .language("typescript")
                                .filename("solution.ts")
                                .code("// Starter implementation for " + cleanTitle + "\nexport function executeTask() {\n  return { ok: true, topic: '" + cleanTitle + "' };\n}")
                                .explanation("Standard boilerplate structure for " + cleanTitle + ".")
                                .build()
                ))
                .commonPitfalls(List.of("Ignoring edge case handling", "Over-engineering simple tasks"))
                .bestPractices(List.of("Write modular code", "Add automated tests"))
                .authoritativeCitations(List.of(
                        DocReferenceDto.builder()
                                .title("Official Documentation & Reference Guides")
                                .domain("developer.mozilla.org")
                                .url("https://developer.mozilla.org")
                                .description("Official reference guides and specifications.")
                                .build()
                ))
                .build();
    }
}
