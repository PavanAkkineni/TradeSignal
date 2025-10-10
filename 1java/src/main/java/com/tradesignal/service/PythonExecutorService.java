package com.tradesignal.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Service to execute Python scripts directly from Spring Boot
 * Eliminates the need for a separate Python server
 */
@Service
public class PythonExecutorService {
    
    private static final Logger log = LoggerFactory.getLogger(PythonExecutorService.class);
    
    @Value("${python.interpreter:python}")
    private String pythonInterpreter;
    
    @Value("${python.scripts.path:src/main/resources/python-scripts}")
    private String pythonScriptsPath;
    
    @Value("${python.timeout:30}")
    private int timeoutSeconds;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Execute a Python script with given arguments
     */
    public Map<String, Object> executePythonScript(String scriptName, Map<String, Object> args) {
        try {
            // Build the Python script path
            Path scriptPath = Paths.get(pythonScriptsPath, scriptName + ".py");
            
            log.info("Looking for Python script: {}", scriptPath.toAbsolutePath());
            log.info("Current working directory: {}", Paths.get("").toAbsolutePath());
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
