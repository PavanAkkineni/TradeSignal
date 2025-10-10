# Multi-stage build for Spring Boot + Python application
# Stage 1: Build the Java application
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy Maven project files
COPY 1java/pom.xml ./pom.xml

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY 1java/src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime image with Java + Python
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install Python 3.11 and required system packages
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    python3.11-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic links for python
RUN ln -s /usr/bin/python3.11 /usr/bin/python && \
    ln -s /usr/bin/pip3 /usr/bin/pip

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the built JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Copy Python scripts for embedded execution
COPY 1java/src/main/resources/python-scripts /app/python-scripts

# Create necessary directories for data
RUN mkdir -p /app/data/TechnicalAnalysis /app/data/FundamentalData /app/data/SentimentData /app/data/AlternativeData

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    JAVA_OPTS="-Xmx512m -Xms256m"

# Expose Spring Boot port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the Spring Boot application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
