package com.tradesignal.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradeSignal {
    private String symbol;
    private String timestamp;
    
    @JsonProperty("signal")
    private SignalData signal;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class SignalData {
    private String signal;
    private Double strength;
    private Double confidence;
    private List<String> reasoning;
    
    @JsonProperty("risk_level")
    private String riskLevel;
    
    @JsonProperty("entry_price")
    private Double entryPrice;
    
    @JsonProperty("stop_loss")
    private Double stopLoss;
    
    @JsonProperty("take_profit")
    private List<Double> takeProfit;
    
    private String timeframe;
    private String timestamp;
    
    private Map<String, Object> components;
}
