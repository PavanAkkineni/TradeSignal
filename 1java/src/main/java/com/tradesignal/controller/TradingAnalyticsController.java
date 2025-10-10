package com.tradesignal.controller;

import com.tradesignal.service.TradingAnalyticsServiceV2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import lombok.extern.slf4j.Slf4j;
import java.util.Map;

/**
 * REST Controller for Trading Analytics Platform
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Slf4j
public class TradingAnalyticsController {
    
    @Autowired
    private TradingAnalyticsServiceV2 tradingService;
    
    @Value("${use.embedded.python:true}")
    private boolean useEmbeddedPython;
    
    /**
     * Get technical analysis for a symbol
     */
    @GetMapping("/technical/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getTechnicalAnalysis(@PathVariable String symbol) {
        log.info("Received request for technical analysis of symbol: {}", symbol);
        return tradingService.getTechnicalAnalysis(symbol)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    /**
     * Get fundamental analysis for a symbol
     */
    @GetMapping("/fundamental/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getFundamentalAnalysis(@PathVariable String symbol) {
        log.info("Received request for fundamental analysis of symbol: {}", symbol);
        return tradingService.getFundamentalAnalysis(symbol)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    /**
     * Get sentiment analysis for a symbol
     */
    @GetMapping("/sentiment/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getSentimentAnalysis(@PathVariable String symbol) {
        log.info("Received request for sentiment analysis of symbol: {}", symbol);
        return tradingService.getSentimentAnalysis(symbol)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    /**
     * Get trade signals for a symbol
     */
    @GetMapping("/signals/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getTradeSignals(@PathVariable String symbol) {
        log.info("Received request for trade signals of symbol: {}", symbol);
        return tradingService.getTradeSignals(symbol)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    /**
     * Get stock overview for a symbol
     */
    @GetMapping("/overview/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getStockOverview(@PathVariable String symbol) {
        log.info("Received request for stock overview of symbol: {}", symbol);
        return tradingService.getStockOverview(symbol)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    /**
     * Get available symbols
     */
    @GetMapping("/symbols")
    public Mono<ResponseEntity<Map<String, Object>>> getAvailableSymbols() {
        log.info("Received request for available symbols");
        return tradingService.getAvailableSymbols()
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    /**
     * Get expert analysis for a symbol
     */
    @GetMapping("/trading-expert/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getExpertAnalysis(@PathVariable String symbol) {
        log.info("Received request for expert analysis of symbol: {}", symbol);
        return tradingService.getExpertAnalysis(symbol)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    /**
     * Get educational content for a topic
     */
    @GetMapping("/education/{topic}")
    public Mono<ResponseEntity<Map<String, Object>>> getEducationalContent(@PathVariable String topic) {
        log.info("Received request for educational content on topic: {}", topic);
        return tradingService.getEducationalContent(topic)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        log.info("Health check requested");
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "Spring Boot Trading Platform",
            "timestamp", java.time.Instant.now().toString()
        ));
    }
}
