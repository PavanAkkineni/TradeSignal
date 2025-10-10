package com.tradesignal.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FundamentalData {
    private String symbol;
    private String timestamp;
    
    @JsonProperty("analysis")
    private FundamentalAnalysis analysis;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class FundamentalAnalysis {
    private Map<String, Double> metrics;
    private Map<String, Double> scores;
    private String interpretation;
    
    @JsonProperty("sector_avg_pe")
    private Double sectorAvgPe;
    
    @JsonProperty("pe_ratio")
    private Double peRatio;
    
    @JsonProperty("peg_ratio")
    private Double pegRatio;
    
    @JsonProperty("price_to_book")
    private Double priceToBook;
    
    @JsonProperty("price_to_sales")
    private Double priceToSales;
    
    @JsonProperty("ev_to_revenue")
    private Double evToRevenue;
    
    @JsonProperty("ev_to_ebitda")
    private Double evToEbitda;
    
    @JsonProperty("profit_margin")
    private Double profitMargin;
    
    @JsonProperty("operating_margin")
    private Double operatingMargin;
    
    private Double roe;
    private Double roa;
    
    @JsonProperty("revenue_growth")
    private Double revenueGrowth;
    
    @JsonProperty("earnings_growth")
    private Double earningsGrowth;
    
    @JsonProperty("quarterly_revenue_growth")
    private Double quarterlyRevenueGrowth;
    
    @JsonProperty("quarterly_earnings_growth")
    private Double quarterlyEarningsGrowth;
    
    @JsonProperty("debt_to_equity")
    private Double debtToEquity;
    
    @JsonProperty("current_ratio")
    private Double currentRatio;
    
    @JsonProperty("quick_ratio")
    private Double quickRatio;
    
    @JsonProperty("dividend_yield")
    private Double dividendYield;
    
    @JsonProperty("dividend_payout_ratio")
    private Double dividendPayoutRatio;
}
