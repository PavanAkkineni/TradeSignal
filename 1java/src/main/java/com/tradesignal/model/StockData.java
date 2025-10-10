package com.tradesignal.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockData {
    private String symbol;
    private String timestamp;
    private Double currentPrice;
    private Double priceChange;
    private Double priceChangePercent;
    private Long volume;
    
    @JsonProperty("indicators")
    private TechnicalIndicators indicators;
    
    @JsonProperty("chart_data")
    private Map<String, Object> chartData;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class TechnicalIndicators {
    @JsonProperty("current_price")
    private Double currentPrice;
    
    @JsonProperty("price_change")
    private Double priceChange;
    
    @JsonProperty("price_change_percent")
    private Double priceChangePercent;
    
    private Long volume;
    
    private Double rsi;
    
    private Map<String, Double> sma;
    
    private Map<String, Double> ema;
    
    private Map<String, Object> macd;
    
    @JsonProperty("bollinger_bands")
    private Map<String, Double> bollingerBands;
    
    @JsonProperty("support_resistance")
    private Map<String, List<Double>> supportResistance;
    
    @JsonProperty("volume_analysis")
    private Map<String, Object> volumeAnalysis;
    
    private String trend;
    
    private Double atr;
    
    @JsonProperty("stochastic")
    private Map<String, Double> stochastic;
}
