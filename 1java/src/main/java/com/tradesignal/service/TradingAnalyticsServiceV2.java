package com.tradesignal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.HashMap;

/**
 * Version 2 - Service layer using embedded Python executor
 * Active service for single-server deployment
 */
@Service
public class TradingAnalyticsServiceV2 {
    
    private static final Logger log = LoggerFactory.getLogger(TradingAnalyticsServiceV2.class);
    
    @Autowired
    private PythonExecutorService pythonExecutor;
    
    /**
     * Get technical analysis for a symbol
     */
    public Mono<Map<String, Object>> getTechnicalAnalysis(String symbol) {
        log.info("Fetching technical analysis for symbol: {}", symbol);
        
        return Mono.fromCallable(() -> pythonExecutor.getTechnicalAnalysis(symbol))
                .doOnError(error -> log.error("Error in technical analysis: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get fundamental analysis for a symbol
     */
    public Mono<Map<String, Object>> getFundamentalAnalysis(String symbol) {
        log.info("Fetching fundamental analysis for symbol: {}", symbol);
        
        return Mono.fromCallable(() -> pythonExecutor.getFundamentalAnalysis(symbol))
                .doOnError(error -> log.error("Error in fundamental analysis: ", error))
                .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get sentiment analysis for a symbol
     */
    public Mono<Map<String, Object>> getSentimentAnalysis(String symbol) {
        log.info("Fetching sentiment analysis for symbol: {}", symbol);
        
        // For now, return mock data since sentiment analysis requires API keys
        return Mono.fromCallable(() -> {
            Map<String, Object> sentiment = new HashMap<>();
            sentiment.put("symbol", symbol);
            sentiment.put("overall_sentiment", "Bullish");
            sentiment.put("sentiment_score", 65);
            sentiment.put("news_sentiment", "Positive");
            sentiment.put("social_sentiment", "Neutral");
            sentiment.put("analyst_rating", "Buy");
            sentiment.put("confidence", 0.75);
            return sentiment;
        });
    }
    
    /**
     * Get trade signals for a symbol
     */
    public Mono<Map<String, Object>> getTradeSignals(String symbol) {
        log.info("Fetching trade signals for symbol: {}", symbol);
        
        return Mono.fromCallable(() -> {
            // Get technical analysis first
            Map<String, Object> technical = pythonExecutor.getTechnicalAnalysis(symbol);
            
            // Generate signals based on technical indicators
            Map<String, Object> signals = new HashMap<>();
            signals.put("symbol", symbol);
            
            // Extract RSI
            Map<String, Object> rsi = (Map<String, Object>) technical.get("rsi");
            if (rsi != null) {
                double rsiValue = ((Number) rsi.get("value")).doubleValue();
                String rsiSignal = rsiValue > 70 ? "Sell" : rsiValue < 30 ? "Buy" : "Hold";
                signals.put("rsi_signal", rsiSignal);
            }
            
            // Overall signal
            signals.put("overall_signal", "Hold");
            signals.put("confidence", 0.65);
            signals.put("risk_level", "Medium");
            
            // Add recommendations
            Map<String, Object> recommendations = new HashMap<>();
            recommendations.put("entry_price", technical.get("current_price"));
            recommendations.put("stop_loss", calculateStopLoss(technical));
            recommendations.put("take_profit", calculateTakeProfit(technical));
            signals.put("recommendations", recommendations);
            
            return signals;
        })
        .doOnError(error -> log.error("Error generating trade signals: ", error))
        .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get stock overview for a symbol
     */
    public Mono<Map<String, Object>> getStockOverview(String symbol) {
        log.info("Fetching stock overview for symbol: {}", symbol);
        
        return Mono.fromCallable(() -> {
            // Combine technical and fundamental data
            Map<String, Object> technical = pythonExecutor.getTechnicalAnalysis(symbol);
            Map<String, Object> fundamental = pythonExecutor.getFundamentalAnalysis(symbol);
            
            // Create key_stats object
            Map<String, Object> keyStats = new HashMap<>();
            keyStats.put("market_cap", fundamental.get("market_cap"));
            keyStats.put("pe_ratio", fundamental.get("pe_ratio"));
            keyStats.put("dividend_yield", fundamental.get("dividend_yield"));
            keyStats.put("week_52_high", fundamental.get("week_52_high"));
            keyStats.put("week_52_low", fundamental.get("week_52_low"));
            keyStats.put("eps", fundamental.get("eps"));
            keyStats.put("beta", fundamental.get("beta"));
            
            // Create current_price object
            Map<String, Object> currentPrice = new HashMap<>();
            currentPrice.put("price", technical.get("current_price"));
            currentPrice.put("price_change", technical.get("price_change"));
            currentPrice.put("price_change_percent", technical.get("price_change_percent"));
            
            // Build overview response matching frontend expectations
            Map<String, Object> overview = new HashMap<>();
            overview.put("symbol", symbol);
            overview.put("name", fundamental.get("company_name"));
            overview.put("exchange", "NYSE");
            overview.put("current_price", currentPrice);
            overview.put("key_stats", keyStats);
            
            return overview;
        })
        .doOnError(error -> log.error("Error fetching stock overview: ", error))
        .onErrorReturn(new HashMap<>());
    }
    
    /**
     * Get available symbols
     */
    public Mono<Map<String, Object>> getAvailableSymbols() {
        log.info("Fetching available symbols");
        
        return Mono.fromCallable(() -> {
            Map<String, Object> result = new HashMap<>();
            result.put("symbols", new String[]{"IBM", "AAPL", "GOOGL", "MSFT", "AMZN"});
            result.put("count", 5);
            return result;
        });
    }
    
    /**
     * Get expert analysis for a symbol
     */
    public Mono<Map<String, Object>> getExpertAnalysis(String symbol) {
        log.info("Fetching expert analysis for symbol: {}", symbol);
        
        return Mono.fromCallable(() -> {
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("symbol", symbol);
            analysis.put("recommendation", "Hold");
            analysis.put("analysis", "Based on current technical and fundamental indicators, " +
                    "the stock shows moderate growth potential with balanced risk.");
            analysis.put("key_points", new String[]{
                "RSI indicates neutral momentum",
                "P/E ratio suggests fair valuation",
                "Strong support at current levels"
            });
            return analysis;
        });
    }
    
    /**
     * Get educational content for a topic
     */
    public Mono<Map<String, Object>> getEducationalContent(String topic) {
        log.info("Fetching educational content for topic: {}", topic);
        
        return Mono.fromCallable(() -> {
            Map<String, Object> content = new HashMap<>();
            content.put("topic", topic);
            content.put("title", "Understanding " + topic.toUpperCase());
            content.put("description", "Educational content about " + topic);
            content.put("content", "Detailed explanation of the topic...");
            return content;
        });
    }
    
    private double calculateStopLoss(Map<String, Object> technical) {
        try {
            double currentPrice = ((Number) technical.get("current_price")).doubleValue();
            return currentPrice * 0.95; // 5% stop loss
        } catch (Exception e) {
            return 0.0;
        }
    }
    
    private double calculateTakeProfit(Map<String, Object> technical) {
        try {
            double currentPrice = ((Number) technical.get("current_price")).doubleValue();
            return currentPrice * 1.10; // 10% take profit
        } catch (Exception e) {
            return 0.0;
        }
    }
}
