# Stage 1: Build the application using Eclipse Temurin JDK 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace/app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src src

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Stage 2: Create a lightweight runtime container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /workspace/app/target/pathwise-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=4444
EXPOSE 4444

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
