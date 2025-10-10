# Architecture Decision: Single Application Deployment

## Current Problem
- Two servers running separately (Python on 8000, Java on 8080)
- Complex deployment and management
- Info tooltips not working on frontend

## Chosen Solution: Embedded Python in Spring Boot

### Why This Approach?
1. **Single Application**: Only Spring Boot runs, no separate Python server
2. **Preserves Python Analysis**: Keeps sophisticated pandas/numpy calculations
3. **Easier Deployment**: One application to deploy and manage
4. **Better Performance**: Direct process communication instead of HTTP

### Implementation Strategy

#### Phase 1: Convert Python API to Scripts
- Transform FastAPI endpoints into callable Python scripts
- Each script accepts JSON input and returns JSON output
- Scripts run as subprocess from Spring Boot

#### Phase 2: Create Python Executor Service
- Spring Boot service to execute Python scripts
- Handles process management and error handling
- Caches Python interpreter for performance

#### Phase 3: Fix Frontend Issues
- Repair info button tooltips
- Ensure all educational content loads properly

### Alternative Considered: Pure Java
**Pros:**
- True single-language solution
- No Python dependency

**Cons:**
- Significant rewrite required
- Java libraries for technical analysis are less mature
- TA4J doesn't have all indicators we need
- Would lose sophisticated analysis capabilities

### Technical Implementation

```
User Request → Spring Boot Controller 
    → PythonExecutorService 
    → Python Script (subprocess)
    → JSON Response
    → Spring Boot 
    → Frontend
```

### Benefits
1. **Single Port**: Application runs only on 8080
2. **Unified Deployment**: One JAR/WAR file
3. **Simplified Operations**: One log file, one process to monitor
4. **Maintains Quality**: Keeps proven Python analysis code

### Migration Path
1. Create standalone Python analysis scripts
2. Build PythonExecutorService in Spring Boot
3. Update controllers to use executor instead of WebClient
4. Package Python scripts with Spring Boot resources
5. Update deployment scripts
