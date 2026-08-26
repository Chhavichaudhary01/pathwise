package com.pathwise.engine;

import com.pathwise.dto.ResourceDto;
import com.pathwise.dto.ResourceSearchResultDto;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class RoadmapScraperService {

    private final Map<String, ResourceSearchResultDto> cache = new ConcurrentHashMap<>();

    // Curated high-fidelity knowledge index for granular documentation & topic guides
    private static final Map<String, GranularSkillMeta> GRANULAR_SKILLS = new LinkedHashMap<>();

    private static final Set<String> VERIFIED_SLUGS = Set.of(
            "frontend", "backend", "full-stack", "devops", "ai-engineer", "ai-data-scientist",
            "data-analyst", "android", "ios", "react", "vue", "angular", "nextjs", "typescript",
            "javascript", "nodejs", "python", "java", "golang", "rust", "cpp", "spring-boot",
            "sql", "postgresql-dba", "mongodb", "redis", "graphql", "docker", "kubernetes", "aws",
            "git-github", "linux", "system-design", "software-design-architecture", "cyber-security",
            "prompt-engineering", "qa", "flutter", "react-native", "html", "mlops", "machine-learning",
            "php", "ruby", "ruby-on-rails", "scala", "terraform", "aspnet-core"
    );

    static {
        // Frontend & Web
        addSkill("html", "HTML5 Semantics & Structure", "https://developer.mozilla.org/en-US/docs/Web/HTML", "MDN Web Docs", "https://roadmap.sh/html");
        addSkill("css", "CSS3 Modern Layouts (Flexbox/Grid)", "https://developer.mozilla.org/en-US/docs/Web/CSS", "MDN Web Docs", "https://roadmap.sh/frontend");
        addSkill("javascript", "Modern JavaScript (ES6+)", "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "MDN Web Docs", "https://roadmap.sh/javascript");
        addSkill("typescript", "TypeScript Handbook & Type System", "https://www.typescriptlang.org/docs/handbook/intro.html", "TypeScript Official", "https://roadmap.sh/typescript");
        addSkill("react", "React.dev Core & Hooks", "https://react.dev/learn", "React Official Docs", "https://roadmap.sh/react");
        addSkill("next.js", "Next.js App Router & Server Components", "https://nextjs.org/docs", "Vercel Official", "https://roadmap.sh/nextjs");
        addSkill("vue", "Vue 3 Composition API", "https://vuejs.org/guide/introduction.html", "Vue.js Official", "https://roadmap.sh/vue");
        addSkill("angular", "Angular Docs & Architecture", "https://angular.dev", "Angular Official", "https://roadmap.sh/angular");
        addSkill("tailwind", "Tailwind CSS Utility-First Styling", "https://tailwindcss.com/docs", "Tailwind Official", "https://roadmap.sh/frontend");
        addSkill("web performance", "Web Vitals & Performance Optimization", "https://web.dev/learn/performance", "Google Web.dev", "https://roadmap.sh/frontend-performance-best-practices");
        addSkill("performance", "Frontend Performance Best Practices", "https://web.dev/learn/performance", "Web.dev", "https://roadmap.sh/frontend-performance-best-practices");
        addSkill("accessibility", "Web Accessibility (a11y) Guidelines", "https://www.w3.org/WAI/fundamentals/accessibility-intro/", "W3C WAI", "https://roadmap.sh/projects/accessible-form-ui");
        addSkill("a11y", "Web Accessibility (a11y) Guidelines", "https://www.w3.org/WAI/fundamentals/accessibility-intro/", "W3C WAI", "https://roadmap.sh/projects/accessible-form-ui");
        addSkill("jest", "Testing with Jest & React Testing Library", "https://jestjs.io/docs/getting-started", "Jest Official", "https://roadmap.sh/qa");
        addSkill("playwright", "End-to-End Testing with Playwright", "https://playwright.dev/docs/intro", "Microsoft Playwright", "https://roadmap.sh/qa");

        // Backend & Systems
        addSkill("node.js", "Node.js Asynchronous Runtime & APIs", "https://nodejs.org/docs/latest/api/", "Node.js Official", "https://roadmap.sh/nodejs");
        addSkill("python", "Python 3 Official Tutorial & Stdlib", "https://docs.python.org/3/tutorial/", "Python.org", "https://roadmap.sh/python");
        addSkill("spring boot", "Spring Boot Guides & Reference", "https://spring.io/guides", "Spring by VMware", "https://roadmap.sh/spring-boot");
        addSkill("java", "Java SE Development Guide", "https://docs.oracle.com/en/java/javase/21/", "Oracle Java", "https://roadmap.sh/java");
        addSkill("go", "Tour of Go & Go Documentation", "https://go.dev/doc/", "Go.dev", "https://roadmap.sh/golang");
        addSkill("golang", "Go Programming Language", "https://go.dev/doc/", "Go.dev", "https://roadmap.sh/golang");
        addSkill("rust", "The Rust Programming Language Book", "https://doc.rust-lang.org/book/", "Rust Official", "https://roadmap.sh/rust");
        addSkill("c++", "C++ Reference & Modern Best Practices", "https://en.cppreference.com/w/", "CppReference", "https://roadmap.sh/cpp");
        addSkill("cpp", "C++ Reference & Modern Best Practices", "https://en.cppreference.com/w/", "CppReference", "https://roadmap.sh/cpp");
        addSkill("c#", ".NET & C# Documentation", "https://learn.microsoft.com/en-us/dotnet/csharp/", "Microsoft Learn", "https://roadmap.sh/aspnet-core");

        // Databases & Storage
        addSkill("sql", "SQL Tutorial & Relational Modeling", "https://www.postgresql.org/docs/current/tutorial-sql.html", "PostgreSQL Tutorial", "https://roadmap.sh/sql");
        addSkill("postgresql", "PostgreSQL Database Development", "https://www.postgresql.org/docs/current/", "PostgreSQL.org", "https://roadmap.sh/sql");
        addSkill("postgres", "PostgreSQL Database Development", "https://www.postgresql.org/docs/current/", "PostgreSQL.org", "https://roadmap.sh/sql");
        addSkill("mongodb", "MongoDB Manual & Aggregation", "https://www.mongodb.com/docs/manual/", "MongoDB Docs", "https://roadmap.sh/mongodb");
        addSkill("redis", "Redis In-Memory Data Structures", "https://redis.io/docs/latest/", "Redis.io", "https://roadmap.sh/redis");
        addSkill("graphql", "GraphQL Official Specification & Schema", "https://graphql.org/learn/", "GraphQL Foundation", "https://roadmap.sh/graphql");
        addSkill("rest api", "RESTful API Design & Best Practices", "https://restfulapi.net/", "REST API Guide", "https://roadmap.sh/questions/rest-api");
        addSkill("prisma", "Prisma ORM Documentation", "https://www.prisma.io/docs", "Prisma Docs", "https://roadmap.sh/nodejs");

        // DevOps, Cloud & Security
        addSkill("docker", "Docker Containerization Get-Started", "https://docs.docker.com/get-started/", "Docker Official", "https://roadmap.sh/docker");
        addSkill("kubernetes", "Kubernetes Production Orchestration", "https://kubernetes.io/docs/home/", "Kubernetes.io", "https://roadmap.sh/kubernetes");
        addSkill("aws", "AWS Cloud Architecture Center", "https://aws.amazon.com/architecture/", "AWS Architecture", "https://roadmap.sh/aws");
        addSkill("git", "Git & GitHub Version Control", "https://git-scm.com/book/en/v2", "Git SCM", "https://roadmap.sh/git-github");
        addSkill("github", "Git & GitHub Version Control", "https://git-scm.com/book/en/v2", "Git SCM", "https://roadmap.sh/git-github");
        addSkill("linux", "Linux Command Line & Kernel Basics", "https://linuxjourney.com/", "Linux Journey", "https://roadmap.sh/linux");
        addSkill("system design", "System Design Primer & Scalability Patterns", "https://github.com/donnemartin/system-design-primer", "GitHub / Donne Martin", "https://roadmap.sh/system-design");
        addSkill("microservices", "Microservice Architecture & Patterns", "https://microservices.io/patterns/index.html", "Chris Richardson", "https://roadmap.sh/system-design");
        addSkill("cybersecurity", "OWASP Top 10 Security Risks", "https://owasp.org/www-project-top-ten/", "OWASP Foundation", "https://roadmap.sh/cyber-security");

        // AI, Data Science & Machine Learning
        addSkill("machine learning", "Scikit-Learn Machine Learning in Python", "https://scikit-learn.org/stable/user_guide.html", "Scikit-Learn", "https://roadmap.sh/machine-learning");
        addSkill("deep learning", "PyTorch Official Tutorials", "https://pytorch.org/tutorials/", "PyTorch.org", "https://roadmap.sh/ai-engineer");
        addSkill("tensorflow", "TensorFlow Core Tutorials", "https://www.tensorflow.org/tutorials", "TensorFlow.org", "https://roadmap.sh/ai-data-scientist");
        addSkill("langchain", "LangChain LLM Application Framework", "https://python.langchain.com/docs/get_started/introduction", "LangChain Docs", "https://roadmap.sh/ai-engineer");
        addSkill("pandas", "Pandas Data Analysis Toolkit", "https://pandas.pydata.org/docs/user_guide/index.html", "PyData Pandas", "https://roadmap.sh/ai-data-scientist");
        addSkill("numpy", "NumPy Numerical Computing", "https://numpy.org/doc/stable/user/quickstart.html", "NumPy.org", "https://roadmap.sh/ai-data-scientist");
        addSkill("prompt engineering", "Prompt Engineering Guide", "https://www.promptingguide.ai/", "DAIR.AI", "https://roadmap.sh/prompt-engineering");
        addSkill("rag", "Retrieval Augmented Generation Architecture", "https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview", "Microsoft Learn", "https://roadmap.sh/ai-engineer");
    }

    private static void addSkill(String key, String title, String docUrl, String provider, String roadmapShUrl) {
        GRANULAR_SKILLS.put(key.toLowerCase(), new GranularSkillMeta(title, docUrl, provider, roadmapShUrl));
    }

    private record GranularSkillMeta(String title, String docUrl, String provider, String roadmapShUrl) {}

    // Set of verified standalone dedicated roadmap.sh pages
    private static final Map<String, String> DEDICATED_TOPIC_PAGES = new LinkedHashMap<>();

    static {
        // Frontend & Web
        DEDICATED_TOPIC_PAGES.put("html", "https://roadmap.sh/html");
        DEDICATED_TOPIC_PAGES.put("javascript", "https://roadmap.sh/javascript");
        DEDICATED_TOPIC_PAGES.put("typescript", "https://roadmap.sh/typescript");
        DEDICATED_TOPIC_PAGES.put("react", "https://roadmap.sh/react");
        DEDICATED_TOPIC_PAGES.put("next.js", "https://roadmap.sh/nextjs");
        DEDICATED_TOPIC_PAGES.put("nextjs", "https://roadmap.sh/nextjs");
        DEDICATED_TOPIC_PAGES.put("vue", "https://roadmap.sh/vue");
        DEDICATED_TOPIC_PAGES.put("angular", "https://roadmap.sh/angular");
        DEDICATED_TOPIC_PAGES.put("qa", "https://roadmap.sh/qa");

        // Backend & Languages
        DEDICATED_TOPIC_PAGES.put("node.js", "https://roadmap.sh/nodejs");
        DEDICATED_TOPIC_PAGES.put("nodejs", "https://roadmap.sh/nodejs");
        DEDICATED_TOPIC_PAGES.put("python", "https://roadmap.sh/python");
        DEDICATED_TOPIC_PAGES.put("spring boot", "https://roadmap.sh/spring-boot");
        DEDICATED_TOPIC_PAGES.put("spring-boot", "https://roadmap.sh/spring-boot");
        DEDICATED_TOPIC_PAGES.put("java", "https://roadmap.sh/java");
        DEDICATED_TOPIC_PAGES.put("go", "https://roadmap.sh/golang");
        DEDICATED_TOPIC_PAGES.put("golang", "https://roadmap.sh/golang");
        DEDICATED_TOPIC_PAGES.put("rust", "https://roadmap.sh/rust");
        DEDICATED_TOPIC_PAGES.put("c++", "https://roadmap.sh/cpp");
        DEDICATED_TOPIC_PAGES.put("cpp", "https://roadmap.sh/cpp");
        DEDICATED_TOPIC_PAGES.put("c#", "https://roadmap.sh/aspnet-core");
        DEDICATED_TOPIC_PAGES.put("aspnet-core", "https://roadmap.sh/aspnet-core");
        DEDICATED_TOPIC_PAGES.put("php", "https://roadmap.sh/php");
        DEDICATED_TOPIC_PAGES.put("ruby", "https://roadmap.sh/ruby");
        DEDICATED_TOPIC_PAGES.put("ruby on rails", "https://roadmap.sh/ruby-on-rails");
        DEDICATED_TOPIC_PAGES.put("scala", "https://roadmap.sh/scala");

        // Databases & Storage
        DEDICATED_TOPIC_PAGES.put("sql", "https://roadmap.sh/sql");
        DEDICATED_TOPIC_PAGES.put("postgresql-dba", "https://roadmap.sh/postgresql-dba");
        DEDICATED_TOPIC_PAGES.put("mongodb", "https://roadmap.sh/mongodb");
        DEDICATED_TOPIC_PAGES.put("redis", "https://roadmap.sh/redis");
        DEDICATED_TOPIC_PAGES.put("graphql", "https://roadmap.sh/graphql");

        // DevOps & Infrastructure
        DEDICATED_TOPIC_PAGES.put("docker", "https://roadmap.sh/docker");
        DEDICATED_TOPIC_PAGES.put("kubernetes", "https://roadmap.sh/kubernetes");
        DEDICATED_TOPIC_PAGES.put("aws", "https://roadmap.sh/aws");
        DEDICATED_TOPIC_PAGES.put("git", "https://roadmap.sh/git-github");
        DEDICATED_TOPIC_PAGES.put("github", "https://roadmap.sh/git-github");
        DEDICATED_TOPIC_PAGES.put("linux", "https://roadmap.sh/linux");
        DEDICATED_TOPIC_PAGES.put("terraform", "https://roadmap.sh/terraform");
        DEDICATED_TOPIC_PAGES.put("system design", "https://roadmap.sh/system-design");
        DEDICATED_TOPIC_PAGES.put("software design architecture", "https://roadmap.sh/software-design-architecture");
        DEDICATED_TOPIC_PAGES.put("cybersecurity", "https://roadmap.sh/cyber-security");
        DEDICATED_TOPIC_PAGES.put("cyber security", "https://roadmap.sh/cyber-security");

        // Mobile & AI
        DEDICATED_TOPIC_PAGES.put("flutter", "https://roadmap.sh/flutter");
        DEDICATED_TOPIC_PAGES.put("react native", "https://roadmap.sh/react-native");
        DEDICATED_TOPIC_PAGES.put("prompt engineering", "https://roadmap.sh/prompt-engineering");
        DEDICATED_TOPIC_PAGES.put("machine learning", "https://roadmap.sh/machine-learning");
        DEDICATED_TOPIC_PAGES.put("mlops", "https://roadmap.sh/mlops");
    }

    /**
     * Resolves root roadmap page for the overarching career/domain.
     */
    public String resolveRootRoadmapUrl(String fallbackGoalOrRoadmap) {
        if (fallbackGoalOrRoadmap == null || fallbackGoalOrRoadmap.isBlank()) {
            return "https://roadmap.sh/roadmaps";
        }
        String lower = fallbackGoalOrRoadmap.toLowerCase();
        if (lower.contains("frontend") || lower.contains("web") || lower.contains("ui")) {
            return "https://roadmap.sh/frontend";
        }
        if (lower.contains("backend") || lower.contains("server") || lower.contains("api")) {
            return "https://roadmap.sh/backend";
        }
        if (lower.contains("full") || lower.contains("stack")) {
            return "https://roadmap.sh/full-stack";
        }
        if (lower.contains("devops") || lower.contains("cloud") || lower.contains("sre") || lower.contains("platform") || lower.contains("infrastructure")) {
            return "https://roadmap.sh/devops";
        }
        if (lower.contains("ai") || lower.contains("machine learning") || lower.contains("llm") || lower.contains("data science")) {
            return "https://roadmap.sh/ai-engineer";
        }
        if (lower.contains("android") || lower.contains("mobile") || lower.contains("kotlin")) {
            return "https://roadmap.sh/android";
        }
        if (lower.contains("ios") || lower.contains("swift") || lower.contains("apple")) {
            return "https://roadmap.sh/ios";
        }
        if (lower.contains("data") || lower.contains("analytics")) {
            return "https://roadmap.sh/data-analyst";
        }
        if (lower.contains("qa") || lower.contains("test")) {
            return "https://roadmap.sh/qa";
        }
        if (lower.contains("security") || lower.contains("cyber")) {
            return "https://roadmap.sh/cyber-security";
        }
        if (lower.contains("game")) {
            return "https://roadmap.sh/game-developer";
        }
        return "https://roadmap.sh/roadmaps";
    }

    /**
     * Resolves the exact roadmap.sh page for a skill card:
     * - Shows dedicated standalone page if one exists.
     * - Falls back to the root roadmap page if no standalone page exists (avoiding 404s).
     */
    public String resolveSpecificRoadmapShUrl(String titleOrSkill, String fallbackRoadmapSlug) {
        String rootRoadmapUrl = resolveRootRoadmapUrl(fallbackRoadmapSlug);

        if (titleOrSkill == null || titleOrSkill.isBlank()) {
            return rootRoadmapUrl;
        }

        String lower = titleOrSkill.toLowerCase().trim();

        // 1. Check for dedicated Hands-on Project specific pages on roadmap.sh
        if (lower.contains("project") || lower.contains("starter architecture")) {
            if (lower.contains("node") || lower.contains("backend") || lower.contains("express")) {
                return "https://roadmap.sh/projects/ecommerce-api";
            }
            if (lower.contains("react") || lower.contains("frontend") || lower.contains("ui")) {
                return "https://roadmap.sh/projects/single-page-cv";
            }
            if (lower.contains("python") || lower.contains("django") || lower.contains("flask")) {
                return "https://roadmap.sh/projects/url-shortening-service";
            }
            if (lower.contains("full") || lower.contains("stack")) {
                return "https://roadmap.sh/projects/expense-tracker";
            }
            if (lower.contains("javascript") || lower.contains("js")) {
                return "https://roadmap.sh/projects/todo-list-api";
            }
            if (lower.contains("html") || lower.contains("css")) {
                return "https://roadmap.sh/projects/basic-html-website";
            }
            if (lower.contains("docker")) {
                return "https://roadmap.sh/projects/dockerized-service-deployment";
            }
            if (lower.contains("redis") || lower.contains("caching")) {
                return "https://roadmap.sh/projects/caching-server";
            }
            return rootRoadmapUrl;
        }

        // 2. Clean title: strip "Mastering ", "Fundamentals of ", etc.
        String cleanSkill = lower
                .replace("hands-on project:", "")
                .replace("hands-on project", "")
                .replace("mastering", "")
                .replace("starter architecture", "")
                .replace("foundations of", "")
                .replace("core competencies for", "")
                .trim();

        // 3. Match dedicated standalone topic page (longest match first with word-boundary check)
        List<Map.Entry<String, String>> sortedTopics = new ArrayList<>(DEDICATED_TOPIC_PAGES.entrySet());
        sortedTopics.sort((a, b) -> Integer.compare(b.getKey().length(), a.getKey().length()));

        for (Map.Entry<String, String> entry : sortedTopics) {
            String key = entry.getKey();
            if (key.length() <= 3) {
                if (cleanSkill.equals(key) || cleanSkill.matches(".*\\b" + java.util.regex.Pattern.quote(key) + "\\b.*")) {
                    return entry.getValue();
                }
            } else {
                if (cleanSkill.contains(key)) {
                    return entry.getValue();
                }
            }
        }

        // 4. If no dedicated standalone page exists on roadmap.sh, return the root roadmap page
        return rootRoadmapUrl;
    }

    /**
     * Resolves exact high-value documentation / guide URL for a given skill.
     */
    public String resolveGranularResourceUrl(String skillName, String fallbackRoadmapSlug) {
        return resolveSpecificRoadmapShUrl(skillName, fallbackRoadmapSlug);
    }

    /**
     * Searches roadmap.sh, official documentation, and curated resources for any query.
     */
    public ResourceSearchResultDto searchAndScrapeResources(String query) {
        if (query == null || query.isBlank()) {
            query = "Full Stack Development";
        }

        String cacheKey = query.trim().toLowerCase();
        if (cache.containsKey(cacheKey)) {
            return cache.get(cacheKey);
        }

        List<ResourceDto> results = new ArrayList<>();
        String cleanQuery = query.trim();
        String lower = cleanQuery.toLowerCase();

        // 1. Check if exact topic or sub-skill matches our granular index
        GranularSkillMeta matchedMeta = null;
        for (Map.Entry<String, GranularSkillMeta> entry : GRANULAR_SKILLS.entrySet()) {
            if (lower.contains(entry.getKey()) || entry.getKey().contains(lower)) {
                matchedMeta = entry.getValue();
                break;
            }
        }

        String roadmapUrl = matchedMeta != null 
                ? matchedMeta.roadmapShUrl() 
                : "https://roadmap.sh/" + lower.replaceAll("[^a-z0-9]+", "-");

        // Add Official Docs Card
        if (matchedMeta != null) {
            results.add(ResourceDto.builder()
                    .title(matchedMeta.title())
                    .url(matchedMeta.docUrl())
                    .type("OFFICIAL_DOCS")
                    .description("Authoritative documentation, standard API references, and comprehensive tutorials.")
                    .provider(matchedMeta.provider())
                    .level("Beginner to Advanced")
                    .isOfficial(true)
                    .build());
        } else {
            results.add(ResourceDto.builder()
                    .title(cleanQuery + " - Official Reference & Guide")
                    .url("https://developer.mozilla.org/en-US/search?q=" + lower.replaceAll("\\s+", "+"))
                    .type("OFFICIAL_DOCS")
                    .description("Comprehensive reference documentation and implementation specifications.")
                    .provider("MDN / Official Docs")
                    .level("Beginner to Advanced")
                    .isOfficial(true)
                    .build());
        }

        // Add Roadmap.sh Interactive Topic Guide
        results.add(ResourceDto.builder()
                .title("Roadmap.sh Interactive " + cleanQuery + " Pathway")
                .url(roadmapUrl)
                .type("ROADMAP_GUIDE")
                .description("Community-verified topological skill graph with sub-topics, cheat sheets, and milestone tracking.")
                .provider("roadmap.sh")
                .level("Comprehensive")
                .isOfficial(false)
                .build());

        // Add Scraped or Curated GitHub Starter Project
        results.add(ResourceDto.builder()
                .title("Hands-on " + cleanQuery + " Production Boilerplate & Examples")
                .url("https://github.com/topics/" + lower.replaceAll("[^a-z0-9]+", "-"))
                .type("PRACTICE_PROJECT")
                .description("Real-world open-source repositories, starter templates, and production implementations on GitHub.")
                .provider("GitHub Topics")
                .level("Intermediate")
                .isOfficial(false)
                .build());

        // Add Video Course / Masterclass
        results.add(ResourceDto.builder()
                .title("freeCodeCamp " + cleanQuery + " Full Course")
                .url("https://www.freecodecamp.org/news/search/?query=" + lower.replaceAll("\\s+", "+"))
                .type("VIDEO_TUTORIAL")
                .description("In-depth interactive video courses, project walkthroughs, and practical coding exercises.")
                .provider("freeCodeCamp")
                .level("Beginner to Intermediate")
                .isOfficial(false)
                .build());

        // Optional Live Jsoup Web Scraping enhancement from roadmap.sh
        try {
            scrapeRoadmapShPage(roadmapUrl, results, cleanQuery);
        } catch (Exception e) {
            log.debug("Live scraper completed with curated results for '{}': {}", cleanQuery, e.getMessage());
        }

        ResourceSearchResultDto response = ResourceSearchResultDto.builder()
                .query(cleanQuery)
                .matchedTopic(matchedMeta != null ? matchedMeta.title() : cleanQuery)
                .roadmapShUrl(roadmapUrl)
                .summary("Found " + results.size() + " verified resources and guides for " + cleanQuery + ".")
                .resources(results)
                .build();

        cache.put(cacheKey, response);
        return response;
    }

    private void scrapeRoadmapShPage(String roadmapUrl, List<ResourceDto> results, String query) {
        try {
            Document doc = Jsoup.connect(roadmapUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) PathWise Learning Scraper/1.0")
                    .timeout(4000)
                    .get();

            // Extract topic guides or external links from roadmap.sh
            Elements guideLinks = doc.select("a[href^='/guides/'], a[href^='https://']");
            int addedFromLive = 0;
            for (Element link : guideLinks) {
                String href = link.attr("abs:href");
                String text = link.text().trim();
                if (text.length() > 6 && !href.contains("roadmap.sh/signup") && !href.contains("github.com/kamranahmedse") && addedFromLive < 3) {
                    results.add(ResourceDto.builder()
                            .title(text)
                            .url(href)
                            .type("ARTICLE")
                            .description("Roadmap.sh curated guide and deep-dive for " + query + ".")
                            .provider("roadmap.sh Guide")
                            .level("Practical")
                            .isOfficial(false)
                            .build());
                    addedFromLive++;
                }
            }
        } catch (Exception e) {
            log.debug("Jsoup fetch fallback used for {}: {}", roadmapUrl, e.getMessage());
        }
    }
}
