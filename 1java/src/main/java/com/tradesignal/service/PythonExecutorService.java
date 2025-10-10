package com.tradesignal.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import jakarta.annotation.PostConstruct;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Service to execute Python scripts directly from Spring Boot
 * Extracts scripts from JAR to temp directory for execution
 */
@Service
public class PythonExecutorService {
    
    private static final Logger log = LoggerFactory.getLogger(PythonExecutorService.class);
    
    @Value("${python.interpreter:python}")
    private String pythonInterpreter;
    
    @Value("${python.timeout:30}")
    private int timeoutSeconds;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ResourceLoader resourceLoader;
    private Path tempScriptsDir;
    
    private static final String[] SCRIPT_NAMES = {
        "technical_analyzer",
        "fundamental_analyzer",
        "sentiment_analyzer",
        "signal_generator",
        "stock_overview"
    };
    
    public PythonExecutorService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }
    
    @PostConstruct
    public void init() {
        try {
            // Create temp directory for Python scripts and data
            tempScriptsDir = Files.createTempDirectory("python-scripts-");
            log.info("Created temp directory for Python scripts: {}", tempScriptsDir);
            
            // Extract all Python scripts from classpath to temp directory
            for (String scriptName : SCRIPT_NAMES) {
                extractScriptFromClasspath(scriptName);
            }
            
            // Extract data files
            extractDataFiles();
            
            log.info("Successfully extracted {} Python scripts and data files", SCRIPT_NAMES.length);
        } catch (IOException e) {
            log.error("Failed to initialize Python scripts", e);
        }
    }
    
    private void extractDataFiles() {
        try {
            // Create data directory structure
            Path dataDir = tempScriptsDir.resolve("data");
            Path techDir = dataDir.resolve("TechnicalAnalysis");
            Path fundDir = dataDir.resolve("FundamentalData");
            
            Files.createDirectories(techDir);
            Files.createDirectories(fundDir);
            
            // Extract technical data
            extractDataFile("data/TechnicalAnalysis/ibm_daily_adjusted_20251003_181415.json", techDir);
            
            // Extract fundamental data
            extractDataFile("data/FundamentalData/company_overview_20251003_182715.json", fundDir);
            
            log.info("Extracted data files to: {}", dataDir);
        } catch (Exception e) {
            log.warn("Could not extract data files (will use demo data): {}", e.getMessage());
        }
    }
    
    private void extractDataFile(String resourcePath, Path targetDir) {
        try {
            Resource resource = resourceLoader.getResource("classpath:" + resourcePath);
            if (!resource.exists()) {
                log.warn("Data file not found in classpath: {}", resourcePath);
                return;
            }
            
            String filename = resourcePath.substring(resourcePath.lastIndexOf('/') + 1);
            Path targetPath = targetDir.resolve(filename);
            
            try (InputStream is = resource.getInputStream()) {
                Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
                log.info("Extracted data file: {} -> {}", resourcePath, targetPath);
            }
        } catch (IOException e) {
            log.warn("Failed to extract data file {}: {}", resourcePath, e.getMessage());
        }
    }
    
    private void extractScriptFromClasspath(String scriptName) throws IOException {
        String resourcePath = "classpath:python-scripts/" + scriptName + ".py";
        Resource resource = resourceLoader.getResource(resourcePath);
        
        if (!resource.exists()) {
            log.warn("Python script not found in classpath: {}", resourcePath);
            return;
        }
        
        Path targetPath = tempScriptsDir.resolve(scriptName + ".py");
        try (InputStream is = resource.getInputStream()) {
            Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Extracted script: {} -> {}", resourcePath, targetPath);
        }
    }
    
    /**
     * Execute a Python script with given arguments
     */
    public Map<String, Object> executePythonScript(String scriptName, Map<String, Object> args) {
        try {
            // Use the temp directory where scripts were extracted
            Path scriptPath = tempScriptsDir.resolve(scriptName + ".py");
            
            log.info("Looking for Python script: {}", scriptPath.toAbsolutePath());
            log.info("Temp scripts directory: {}", tempScriptsDir);
            log.info("Script exists: {}", Files.exists(scriptPath));
            
            if (!Files.exists(scriptPath)) {
                log.error("Python script not found: {}", scriptPath.toAbsolutePath());
                return createErrorResponse("Script not found: " + scriptName);
            }
            
            // Convert args to JSON string
            String jsonArgs = objectMapper.writeValueAsString(args);
            
            // Build command
            ProcessBuilder pb = new ProcessBuilder(
                pythonInterpreter,
                scriptPath.toString(),
                jsonArgs
            );
            
            // Set environment variables if needed
            Map<String, String> env = pb.environment();
            env.put("PYTHONPATH", "c:\\Users\\admin\\Documents\\JOB APP\\FastAPI\\TradeSignal");
            
            // Start the process
            Process process = pb.start();
            
            // Read output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }
            
            // Read error stream if any
            StringBuilder errorOutput = new StringBuilder();
            try (BufferedReader errorReader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = errorReader.readLine()) != null) {
                    errorOutput.append(line).append("\n");
                }
            }
            
            // Wait for completion
            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            
            if (!finished) {
                process.destroyForcibly();
                log.error("Python script timed out: {}", scriptName);
                return createErrorResponse("Script execution timed out");
            }
            
            int exitCode = process.exitValue();
            
            // Log the output for debugging
            log.info("Python script {} output: {}", scriptName, output.toString());
            log.info("Python script {} error output: {}", scriptName, errorOutput.toString());
            log.info("Python script {} exit code: {}", scriptName, exitCode);
            
            if (exitCode != 0) {
                log.error("Python script failed with exit code {}: {}", exitCode, errorOutput);
                return createErrorResponse("Script execution failed: " + errorOutput);
            }
            
            // Parse JSON response
            String result = output.toString();
            if (result.isEmpty()) {
                log.error("Empty response from Python script: {}", scriptName);
                return createErrorResponse("Empty response from script");
            }
            
            return objectMapper.readValue(result, new TypeReference<Map<String, Object>>(){});
            
        } catch (Exception e) {
            log.error("Error executing Python script: {}", scriptName, e);
            return createErrorResponse("Execution error: " + e.getMessage());
        }
    }
    
    /**
     * Execute technical analysis
     */
    public Map<String, Object> getTechnicalAnalysis(String symbol) {
        Map<String, Object> args = new HashMap<>();
        args.put("symbol", symbol);
        args.put("analysis_type", "technical");
        return executePythonScript("technical_analyzer", args);
    }
    
    /**
     * Execute fundamental analysis
     */
    public Map<String, Object> getFundamentalAnalysis(String symbol) {
        Map<String, Object> args = new HashMap<>();
        args.put("symbol", symbol);
        args.put("analysis_type", "fundamental");
        return executePythonScript("fundamental_analyzer", args);
    }
    
    /**
     * Execute sentiment analysis
     */
    public Map<String, Object> getSentimentAnalysis(String symbol) {
        Map<String, Object> args = new HashMap<>();
        args.put("symbol", symbol);
        args.put("analysis_type", "sentiment");
        return executePythonScript("sentiment_analyzer", args);
    }
    
    /**
     * Get trade signals
     */
    public Map<String, Object> getTradeSignals(String symbol) {
        Map<String, Object> args = new HashMap<>();
        args.put("symbol", symbol);
        return executePythonScript("signal_generator", args);
    }
    
    /**
     * Get stock overview
     */
    public Map<String, Object> getStockOverview(String symbol) {
        Map<String, Object> args = new HashMap<>();
        args.put("symbol", symbol);
        return executePythonScript("stock_overview", args);
    }
    
    /**
     * Check if Python is available
     */
    public boolean isPythonAvailable() {
        try {
            ProcessBuilder pb = new ProcessBuilder(pythonInterpreter, "--version");
            Process process = pb.start();
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            return finished && process.exitValue() == 0;
        } catch (Exception e) {
            log.error("Python interpreter not available", e);
            return false;
        }
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", true);
        error.put("message", message);
        error.put("timestamp", System.currentTimeMillis());
        return error;
    }
}
