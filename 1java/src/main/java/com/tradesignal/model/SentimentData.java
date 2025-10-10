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
public class SentimentData {
    private String symbol;
    private String timestamp;
    
    @JsonProperty("analysis")
    private SentimentAnalysis analysis;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class SentimentAnalysis {
    private Double score;
    private String trend;
    
    @JsonProperty("news_volume")
    private Integer newsVolume;
    
    @JsonProperty("social_buzz")
    private Double socialBuzz;
    
    private String interpretation;
    
    private Map<String, Object> components;
    
    private List<String> signals;
}
