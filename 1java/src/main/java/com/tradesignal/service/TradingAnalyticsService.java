package com.tradesignal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import org.springframework.core.ParameterizedTypeReference;
import reactor.core.publisher.Mono;
import lombok.extern.slf4j.Slf4j;
import java.time.Duration;
import java.util.Map;
import java.util.HashMap;

/**
 * Service layer to communicate with Python backend for data analysis
 * DEPRECATED: Use TradingAnalyticsServiceV2 instead (embedded Python)
 */
// @Service - DISABLED: Using TradingAnalyticsServiceV2 with embedded Python
@Slf4j
public class TradingAnalyticsService {
    
    @Autowired
    private WebClient webClient;
    
    @Value("${python.backend.url}")
    private String pythonBackendUrl;
    
    @Value("${python.backend.timeout:30000}")
    private int timeout;
    
    /**
     * Get technical analysis for a symbol
     */
    public Mono<Map<String, Object>> getTechnicalAnalysis(String symbol) {
        log.info("Fetching technical analysis for symbol: {}", symbol);
        
        return webClient.get()
                .uri("/api/technical/{symbol}", symbol)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Error fetching technical analysis: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get fundamental analysis for a symbol
     */
    public Mono<Map<String, Object>> getFundamentalAnalysis(String symbol) {
        log.info("Fetching fundamental analysis for symbol: {}", symbol);
        
        return webClient.get()
                .uri("/api/fundamental/{symbol}", symbol)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Error fetching fundamental analysis: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get sentiment analysis for a symbol
     */
    public Mono<Map<String, Object>> getSentimentAnalysis(String symbol) {
        log.info("Fetching sentiment analysis for symbol: {}", symbol);
        
        return webClient.get()
                .uri("/api/sentiment/{symbol}", symbol)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Error fetching sentiment analysis: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get trade signals for a symbol
     */
    public Mono<Map<String, Object>> getTradeSignals(String symbol) {
        log.info("Fetching trade signals for symbol: {}", symbol);
        
        return webClient.get()
                .uri("/api/signals/{symbol}", symbol)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Error fetching trade signals: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get stock overview for a symbol
     */
    public Mono<Map<String, Object>> getStockOverview(String symbol) {
        log.info("Fetching stock overview for symbol: {}", symbol);
        
        return webClient.get()
                .uri("/api/overview/{symbol}", symbol)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Error fetching stock overview: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get available symbols
     */
    public Mono<Map<String, Object>> getAvailableSymbols() {
        log.info("Fetching available symbols");
        
        return webClient.get()
                .uri("/api/symbols")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Error fetching symbols: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get expert analysis for a symbol
     */
    public Mono<Map<String, Object>> getExpertAnalysis(String symbol) {
        log.info("Fetching expert analysis for symbol: {}", symbol);
        
        return webClient.get()
                .uri("/api/trading-expert/{symbol}", symbol)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Error fetching expert analysis: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get educational content for a topic
     */
    public Mono<Map<String, Object>> getEducationalContent(String topic) {
        log.info("Fetching educational content for topic: {}", topic);
        
        return webClient.get()
                .uri("/api/education/{topic}", topic)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Error fetching educational content: ", error))
                .onErrorReturn(new HashMap<>());
    }
}
