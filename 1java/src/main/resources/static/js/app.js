// Trading Analytics Platform - Main JavaScript Application

// Global variables
let currentSymbol = 'IBM';
let priceChart = null;
let updateInterval = null;

// API Base URL - dynamically uses current host (works on localhost and Render)
const API_BASE = `${window.location.protocol}//${window.location.host}/api`;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadStockData(currentSymbol);
    
    // Attach info button listeners with delegation
    attachInfoButtonListeners();
    
    // Auto-update disabled - data only refreshes on manual browser refresh or tab switch
    // updateInterval = setInterval(() => {
    //     loadStockData(currentSymbol);
    // }, 30000);
});

// Initialize application
function initializeApp() {
    // Setup chart
    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                tension: 0.1
            }, {
                label: 'SMA 20',
                data: [],
                borderColor: '#10B981',
                borderWidth: 1,
                borderDash: [5, 5],
                tension: 0.1,
                backgroundColor: 'transparent'
            }, {
                label: 'SMA 50',
                data: [],
                borderColor: '#F59E0B',
                borderWidth: 1,
                borderDash: [5, 5],
                tension: 0.1,
                backgroundColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#9CA3AF'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9CA3AF'
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9CA3AF'
                    }
                }
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Symbol selector
    document.getElementById('symbolSelect').addEventListener('change', (e) => {
        currentSymbol = e.target.value;
        loadStockData(currentSymbol);
    });
    
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Info buttons handled by event delegation in attachInfoButtonListeners()
    
    // Modal close button
    const modalCloseBtn = document.querySelector('.modal-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('educationModal');
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Time period buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // Load data for selected period
            loadStockData(currentSymbol);
        });
    });
    
    // Gemini Analysis Button
    const geminiBtn = document.getElementById('getGeminiAnalysisBtn');
    if (geminiBtn) {
        geminiBtn.addEventListener('click', () => {
            loadExpertAnalysis(currentSymbol);
        });
    }
}

// Load stock data
async function loadStockData(symbol) {
    try {
        // Show loading state
        showLoading();
        
        // Load overview data
        try {
            const overviewResponse = await fetch(`${API_BASE}/overview/${symbol}`);
            if (overviewResponse.ok) {
                const overviewData = await overviewResponse.json();
                console.log('Overview API Response:', overviewData);
                updateOverview(overviewData);
            } else {
                console.error('Overview data not available');
            }
        } catch (e) {
            console.error('Error loading overview:', e);
        }
        
        // Load technical analysis
        try {
            const technicalResponse = await fetch(`${API_BASE}/technical/${symbol}`);
            if (technicalResponse.ok) {
                const technicalData = await technicalResponse.json();
                if (technicalData.indicators) {
                    updateTechnicalIndicators(technicalData.indicators);
                }
                if (technicalData.chart_data) {
                    updateChart(technicalData.chart_data);
                }
            } else {
                console.error('Technical data not available');
            }
        } catch (e) {
            console.error('Error loading technical:', e);
        }
        
        // Load signals
        try {
            const signalResponse = await fetch(`${API_BASE}/signals/${symbol}`);
            if (signalResponse.ok) {
                const signalData = await signalResponse.json();
                if (signalData.signal) {
                    updateSignals(signalData.signal);
                }
            }
        } catch (e) {
            console.error('Error loading signals:', e);
        }
        
        // Load AI Analysis if available
        try {
            const aiResponse = await fetch(`${API_BASE}/trading-expert/${symbol}`);
            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                updateAIAnalysis(aiData);
            }
        } catch (e) {
            console.log('AI analysis not available');
        }
        
    } catch (error) {
        console.error('Error loading stock data:', error);
        showError('Failed to load stock data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Load fundamental data
async function loadFundamentalData(symbol) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/fundamental/${symbol}`);
        if (response.ok) {
            const data = await response.json();
            updateFundamentalView(data);
        } else {
            console.error('Fundamental data not available');
            document.getElementById('fundamentalContent').innerHTML = '<p class="error-message">Unable to load fundamental data.</p>';
        }
    } catch (error) {
        console.error('Error loading fundamental data:', error);
        document.getElementById('fundamentalContent').innerHTML = '<p class="error-message">Error loading fundamental data.</p>';
    } finally {
        hideLoading();
    }
}

// Load sentiment data
async function loadSentimentData(symbol) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/sentiment/${symbol}`);
        if (response.ok) {
            const data = await response.json();
            updateSentimentView(data);
        } else {
            console.error('Sentiment data not available');
            document.getElementById('sentimentContent').innerHTML = '<p class="error-message">Unable to load sentiment data.</p>';
        }
    } catch (error) {
        console.error('Error loading sentiment data:', error);
        document.getElementById('sentimentContent').innerHTML = '<p class="error-message">Error loading sentiment data.</p>';
    } finally {
        hideLoading();
    }
}

// Load trade signals data
async function loadTradeSignalsData(symbol) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/signals/${symbol}`);
        if (response.ok) {
            const data = await response.json();
            updateTradeSignalsView(data);
        } else {
            console.error('Trade signals not available');
            document.getElementById('signalsContent').innerHTML = '<p class="error-message">Unable to load trade signals.</p>';
        }
    } catch (error) {
        console.error('Error loading trade signals:', error);
        document.getElementById('signalsContent').innerHTML = '<p class="error-message">Error loading trade signals.</p>';
    } finally {
        hideLoading();
    }
}

// Load expert analysis asynchronously (don't block page load)
async function loadExpertAnalysis(symbol) {
    try {
        // Show loading state in the expert panel
        showExpertLoadingState();
        
        // Fetch expert analysis without blocking
        const response = await fetch(`${API_BASE}/trading-expert/${symbol}`);
        if (response.ok) {
            const data = await response.json();
            updateExpertView(data);
        } else {
            console.error('Expert analysis not available');
            showExpertError();
        }
    } catch (error) {
        console.error('Error loading expert analysis:', error);
        showExpertError();
    }
}

// Show loading state for expert analysis
function showExpertLoadingState() {
    const computedAction = document.getElementById('computedAction');
    const computedConfidence = document.getElementById('computedConfidence');
    const computedStrength = document.getElementById('computedStrength');
    const expertAction = document.getElementById('expertAction');
    const expertConfidence = document.getElementById('expertConfidence');
    const expertAnalysis = document.getElementById('expertAnalysis');
    const geminiBtn = document.getElementById('getGeminiAnalysisBtn');
    
    // Hide button and show analysis area
    if (geminiBtn) {
        geminiBtn.style.display = 'none';
    }
    if (expertAnalysis) {
        expertAnalysis.style.display = 'block';
    }
    
    if (computedAction) computedAction.innerHTML = '<span class="loading-dots">Loading</span>';
    if (computedConfidence) computedConfidence.textContent = '--';
    if (computedStrength) computedStrength.textContent = '--';
    if (expertAction) expertAction.innerHTML = '<span class="loading-dots">Analyzing</span>';
    if (expertConfidence) expertConfidence.textContent = '--';
    if (expertAnalysis) expertAnalysis.innerHTML = '<div class="loading-message"><div class="loading-spinner-small"></div><p>AI Expert is analyzing the data... This may take 10-30 seconds.</p></div>';
}

// Show error state for expert analysis
function showExpertError() {
    const expertAnalysis = document.getElementById('expertAnalysis');
    if (expertAnalysis) {
        expertAnalysis.innerHTML = '<p class="error-message">Unable to load expert analysis. Please try again later.</p>';
    }
}

// Update fundamental view
function updateFundamentalView(data) {
    if (!data || !data.analysis) {
        document.getElementById('fundamentalContent').innerHTML = '<p class="error-message">No fundamental data available.</p>';
        return;
    }
    
    const analysis = data.analysis;
    const metrics = analysis.metrics || {};
    const scores = analysis.scores || {};
    
    let html = `
        <div class="fundamental-grid">
            <!-- Scores Section -->
            <div class="fundamental-card scores-card">
                <h3>📊 Overall Scores</h3>
                <div class="scores-grid">
                    <div class="score-item">
                        <div class="score-label">
                            Overall Score
                            <button class="info-btn-small" data-topic="overall_score">ℹ️</button>
                        </div>
                        <div class="score-value overall">${scores.overall || 0}/100</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${scores.overall || 0}%; background: var(--accent-color);"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <div class="score-label">
                            Valuation
                            <button class="info-btn-small" data-topic="valuation_score">ℹ️</button>
                        </div>
                        <div class="score-value">${scores.valuation || 0}/100</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${scores.valuation || 0}%;"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <div class="score-label">
                            Profitability
                            <button class="info-btn-small" data-topic="profitability_score">ℹ️</button>
                        </div>
                        <div class="score-value">${scores.profitability || 0}/100</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${scores.profitability || 0}%;"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <div class="score-label">
                            Growth
                            <button class="info-btn-small" data-topic="growth_score">ℹ️</button>
                        </div>
                        <div class="score-value">${scores.growth || 0}/100</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${scores.growth || 0}%;"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <div class="score-label">
                            Health
                            <button class="info-btn-small" data-topic="health_score">ℹ️</button>
                        </div>
                        <div class="score-value">${scores.health || 0}/100</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${scores.health || 0}%;"></div>
                        </div>
                    </div>
                </div>
                <div class="interpretation">
                    <strong>Interpretation:</strong> ${analysis.interpretation || 'No interpretation available'}
                </div>
            </div>
            
            <!-- Valuation Metrics -->
            <div class="fundamental-card">
                <h3>💰 Valuation Metrics</h3>
                <div class="metrics-list">
                    <div class="metric-row">
                        <span class="metric-label">
                            P/E Ratio
                            <button class="info-btn-small" data-topic="pe_ratio">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.pe_ratio?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            PEG Ratio
                            <button class="info-btn-small" data-topic="peg_ratio">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.peg_ratio?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Price to Book
                            <button class="info-btn-small" data-topic="price_to_book">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.price_to_book?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Price to Sales
                            <button class="info-btn-small" data-topic="price_to_sales">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.price_to_sales?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            EV to Revenue
                            <button class="info-btn-small" data-topic="ev_to_revenue">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.ev_to_revenue?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            EV to EBITDA
                            <button class="info-btn-small" data-topic="ev_to_ebitda">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.ev_to_ebitda?.toFixed(2) || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Profitability Metrics -->
            <div class="fundamental-card">
                <h3>📈 Profitability Metrics</h3>
                <div class="metrics-list">
                    <div class="metric-row">
                        <span class="metric-label">
                            Profit Margin
                            <button class="info-btn-small" data-topic="profit_margin">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.profit_margin?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Operating Margin
                            <button class="info-btn-small" data-topic="operating_margin">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.operating_margin?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            ROE
                            <button class="info-btn-small" data-topic="roe">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.roe?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            ROA
                            <button class="info-btn-small" data-topic="roa">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.roa?.toFixed(2) || 'N/A'}%</span>
                    </div>
                </div>
            </div>
            
            <!-- Growth Metrics -->
            <div class="fundamental-card">
                <h3>🚀 Growth Metrics</h3>
                <div class="metrics-list">
                    <div class="metric-row">
                        <span class="metric-label">
                            Revenue Growth
                            <button class="info-btn-small" data-topic="revenue_growth">ℹ️</button>
                        </span>
                        <span class="metric-value ${(metrics.revenue_growth || 0) >= 0 ? 'positive' : 'negative'}">
                            ${metrics.revenue_growth?.toFixed(2) || 'N/A'}%
                        </span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Earnings Growth
                            <button class="info-btn-small" data-topic="earnings_growth">ℹ️</button>
                        </span>
                        <span class="metric-value ${(metrics.earnings_growth || 0) >= 0 ? 'positive' : 'negative'}">
                            ${metrics.earnings_growth?.toFixed(2) || 'N/A'}%
                        </span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Quarterly Revenue Growth
                            <button class="info-btn-small" data-topic="quarterly_revenue_growth">ℹ️</button>
                        </span>
                        <span class="metric-value ${(metrics.quarterly_revenue_growth || 0) >= 0 ? 'positive' : 'negative'}">
                            ${metrics.quarterly_revenue_growth?.toFixed(2) || 'N/A'}%
                        </span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Quarterly Earnings Growth
                            <button class="info-btn-small" data-topic="quarterly_earnings_growth">ℹ️</button>
                        </span>
                        <span class="metric-value ${(metrics.quarterly_earnings_growth || 0) >= 0 ? 'positive' : 'negative'}">
                            ${metrics.quarterly_earnings_growth?.toFixed(2) || 'N/A'}%
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Financial Health -->
            <div class="fundamental-card">
                <h3>💪 Financial Health</h3>
                <div class="metrics-list">
                    <div class="metric-row">
                        <span class="metric-label">
                            Debt to Equity
                            <button class="info-btn-small" data-topic="debt_to_equity">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.debt_to_equity?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Current Ratio
                            <button class="info-btn-small" data-topic="current_ratio">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.current_ratio?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Quick Ratio
                            <button class="info-btn-small" data-topic="quick_ratio">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.quick_ratio?.toFixed(2) || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Dividend Info -->
            <div class="fundamental-card">
                <h3>💵 Dividend Information</h3>
                <div class="metrics-list">
                    <div class="metric-row">
                        <span class="metric-label">
                            Dividend Yield
                            <button class="info-btn-small" data-topic="dividend_yield">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.dividend_yield?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">
                            Dividend Payout Ratio
                            <button class="info-btn-small" data-topic="dividend_payout_ratio">ℹ️</button>
                        </span>
                        <span class="metric-value">${metrics.dividend_payout_ratio || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('fundamentalContent').innerHTML = html;
}

// Update sentiment view
function updateSentimentView(data) {
    if (!data || !data.analysis) {
        document.getElementById('sentimentContent').innerHTML = '<p class="error-message">No sentiment data available.</p>';
        return;
    }
    
    const analysis = data.analysis;
    const score = analysis.score || 0;
    const trend = analysis.trend || 'stable';
    const newsVolume = analysis.news_volume || 0;
    const socialBuzz = analysis.social_buzz || 0;
    const components = analysis.components || {};
    const scores = analysis.scores || {};
    const historical = scores.historical || [];
    
    // Determine sentiment color
    let sentimentColor = '#64748b'; // neutral
    if (score > 0.6) sentimentColor = '#10b981'; // positive
    else if (score < 0.4) sentimentColor = '#ef4444'; // negative
    
    let html = `
        <div class="sentiment-grid">
            <!-- Overall Sentiment -->
            <div class="sentiment-card overall-sentiment">
                <h3>📊 Overall Sentiment</h3>
                <div class="sentiment-score-display">
                    <div class="score-circle" style="border-color: ${sentimentColor};">
                        <div class="score-number" style="color: ${sentimentColor};">${(score * 100).toFixed(0)}</div>
                        <div class="score-label">Sentiment Score</div>
                    </div>
                    <div class="sentiment-info">
                        <div class="info-item">
                            <span class="label">Trend:</span>
                            <span class="value trend-${trend}">${trend.toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">News Volume:</span>
                            <span class="value">${newsVolume} articles</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Social Buzz:</span>
                            <span class="value">${socialBuzz}</span>
                        </div>
                    </div>
                </div>
                <div class="interpretation">
                    <strong>Interpretation:</strong> ${analysis.interpretation || 'No interpretation available'}
                </div>
            </div>
            
            <!-- News Sentiment -->
            <div class="sentiment-card">
                <h3>📰 News Sentiment</h3>
                <div class="component-details">
                    <div class="component-score">
                        <span class="label">Score:</span>
                        <span class="value">${((components.news?.score || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="article-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Articles</span>
                            <span class="stat-value">${components.news?.article_count || 0}</span>
                        </div>
                        <div class="stat-item positive">
                            <span class="stat-label">Positive</span>
                            <span class="stat-value">${components.news?.positive_articles || 0}</span>
                        </div>
                        <div class="stat-item negative">
                            <span class="stat-label">Negative</span>
                            <span class="stat-value">${components.news?.negative_articles || 0}</span>
                        </div>
                        <div class="stat-item neutral">
                            <span class="stat-label">Neutral</span>
                            <span class="stat-value">${components.news?.neutral_articles || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Transcript Sentiment -->
            <div class="sentiment-card">
                <h3>🎤 Earnings Call Sentiment</h3>
                <div class="component-details">
                    <div class="component-score">
                        <span class="label">Score:</span>
                        <span class="value">${((components.transcripts?.score || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="transcript-stats">
                        <div class="stat-item">
                            <span class="stat-label">Transcripts Analyzed</span>
                            <span class="stat-value">${components.transcripts?.transcript_count || 0}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Confidence</span>
                            <span class="stat-value">${components.transcripts?.confidence || 0}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Historical Sentiment -->
            <div class="sentiment-card historical-card">
                <h3>📈 Historical Sentiment Trend</h3>
                <div class="historical-list">
                    ${historical.slice(0, 10).map(item => `
                        <div class="historical-item">
                            <span class="date">${item.date}</span>
                            <div class="trend-bar">
                                <div class="trend-fill" style="width: ${(item.normalized * 100).toFixed(0)}%;"></div>
                            </div>
                            <span class="count">${item.count} mentions</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('sentimentContent').innerHTML = html;
}

// Update trade signals view
function updateTradeSignalsView(data) {
    if (!data || !data.signal) {
        document.getElementById('signalsContent').innerHTML = '<p class="error-message">No trade signals available.</p>';
        return;
    }
    
    const signal = data.signal;
    const action = signal.signal || 'HOLD';
    const confidence = signal.confidence || 0;
    const strength = signal.strength || 0;
    const reasoning = signal.reasoning || [];
    const technicalSignal = signal.technical_signal || 'HOLD';
    const fundamentalSignal = signal.fundamental_signal || 'HOLD';
    const sentimentSignal = signal.sentiment_signal || 'HOLD';
    
    // Determine action class
    let actionClass = 'hold';
    if (action.includes('BUY')) actionClass = 'buy';
    else if (action.includes('SELL')) actionClass = 'sell';
    
    let html = `
        <div class="signals-grid">
            <!-- Main Signal -->
            <div class="signal-card main-signal">
                <h3>🎯 Comprehensive Trade Signal</h3>
                <div class="signal-display">
                    <div class="signal-action ${actionClass}">${action}</div>
                    <div class="signal-metrics">
                        <div class="metric">
                            <span class="label">Confidence:</span>
                            <span class="value">${confidence.toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span class="label">Strength:</span>
                            <span class="value">${strength.toFixed(1)}</span>
                        </div>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%; background: var(--accent-color);"></div>
                    </div>
                </div>
            </div>
            
            <!-- Individual Signals -->
            <div class="signal-card">
                <h3>📊 Signal Breakdown</h3>
                <div class="signals-breakdown">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Technical Signal:</span>
                        <span class="breakdown-value ${technicalSignal.toLowerCase()}">${technicalSignal}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Fundamental Signal:</span>
                        <span class="breakdown-value ${fundamentalSignal.toLowerCase()}">${fundamentalSignal}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Sentiment Signal:</span>
                        <span class="breakdown-value ${sentimentSignal.toLowerCase()}">${sentimentSignal}</span>
                    </div>
                </div>
            </div>
            
            <!-- Reasoning -->
            <div class="signal-card reasoning-card">
                <h3>💡 Key Signals & Reasoning</h3>
                <ul class="reasoning-list">
                    ${reasoning.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    document.getElementById('signalsContent').innerHTML = html;
}

// Update expert view
function updateExpertView(data) {
    if (!data) return;
    
    // Update computed signal
    if (data.computed_signal) {
        const computed = data.computed_signal;
        document.getElementById('computedAction').textContent = computed.action || '--';
        document.getElementById('computedConfidence').textContent = `${(computed.confidence || 0).toFixed(1)}%`;
        document.getElementById('computedStrength').textContent = (computed.strength || 0).toFixed(1);
        
        const strengthBar = document.getElementById('computedStrengthBar');
        if (strengthBar) {
            strengthBar.style.width = `${Math.abs(computed.strength || 0)}%`;
        }
        
        // Update indicators list
        if (computed.indicators && data.computed_signal.indicators) {
            const indicatorsList = document.getElementById('indicatorsList');
            indicatorsList.innerHTML = Object.entries(computed.indicators).map(([key, value]) => `
                <div class="indicator-item">
                    <span class="indicator-name">${key}</span>
                    <span class="indicator-signal">${value.signal}</span>
                    <span class="indicator-weight">${value.weight}</span>
                </div>
            `).join('');
        }
    }
    
    // Update expert analysis
    if (data.expert_analysis) {
        const expert = data.expert_analysis;
        document.getElementById('expertAction').textContent = expert.action || '--';
        document.getElementById('expertConfidence').textContent = `${(expert.confidence || 0).toFixed(1)}%`;
        document.getElementById('expertAnalysis').textContent = expert.analysis || 'Loading...';
        
        // Update agreement status
        const agreementElem = document.getElementById('agreementStatus');
        if (agreementElem) {
            agreementElem.textContent = expert.agreement ? 'Signals Agree' : 'Signals Diverge';
            agreementElem.className = expert.agreement ? 'agreement-badge agree' : 'agreement-badge diverge';
        }
    }
}

// Update overview section
function updateOverview(data) {
    if (!data) return;
    
    console.log('updateOverview called with data:', data);
    console.log('key_stats:', data.key_stats);
    
    // Update company info
    const companyName = document.querySelector('.company-name');
    if (companyName) companyName.textContent = data.name || data.symbol || 'IBM';
    
    const stockSymbol = document.querySelector('.stock-symbol');
    if (stockSymbol) stockSymbol.textContent = `${data.symbol || 'IBM'} • ${data.exchange || 'NYSE'}`;
    
    const logoCircle = document.querySelector('.logo-circle');
    if (logoCircle) logoCircle.textContent = data.symbol || 'IBM';
    
    // Update price info
    const priceInfo = data.current_price || {};
    const price = priceInfo.price || 0;
    const change = priceInfo.price_change || 0;
    const changePercent = priceInfo.price_change_percent || 0;
    
    const currentPriceElem = document.getElementById('currentPrice');
    if (currentPriceElem) currentPriceElem.textContent = `$${price.toFixed(2)}`;
    
    const priceChangeElem = document.getElementById('priceChange');
    if (priceChangeElem) {
        priceChangeElem.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
        priceChangeElem.className = change >= 0 ? 'price-change positive' : 'price-change negative';
    }
    
    const changePercentElem = document.getElementById('priceChangePercent');
    if (changePercentElem) {
        changePercentElem.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
        changePercentElem.className = change >= 0 ? 'price-change-percent positive' : 'price-change-percent negative';
    }
    
    const lastUpdateElem = document.getElementById('lastUpdate');
    if (lastUpdateElem) lastUpdateElem.textContent = new Date().toLocaleTimeString();
    
    // Update key stats
    const stats = data.key_stats || {};
    
    const marketCapElem = document.getElementById('marketCap');
    if (marketCapElem) marketCapElem.textContent = formatMarketCap(stats.market_cap);
    
    const peRatioElem = document.getElementById('peRatio');
    const peValue = parseFloat(stats.pe_ratio);
    if (peRatioElem) peRatioElem.textContent = (!isNaN(peValue) && peValue > 0) ? peValue.toFixed(2) : '--';
    
    const divYieldElem = document.getElementById('divYield');
    const divValue = parseFloat(stats.dividend_yield);
    if (divYieldElem) {
        if (!isNaN(divValue) && divValue > 0) {
            // If value is already percentage (> 1), use as is; if decimal (< 1), multiply by 100
            const percentValue = divValue > 1 ? divValue : divValue * 100;
            divYieldElem.textContent = `${percentValue.toFixed(2)}%`;
        } else {
            divYieldElem.textContent = '--';
        }
    }
    
    const range52wElem = document.getElementById('range52w');
    if (range52wElem) {
        const low = parseFloat(stats['52_week_low']);
        const high = parseFloat(stats['52_week_high']);
        if (!isNaN(low) && !isNaN(high) && low > 0 && high > 0) {
            range52wElem.textContent = `$${low.toFixed(2)} - $${high.toFixed(2)}`;
        } else {
            range52wElem.textContent = '--';
        }
    }
}

// Update technical indicators
function updateTechnicalIndicators(indicators) {
    if (!indicators) return;
    
    // Update RSI
    const rsi = indicators.rsi || 50;
    document.getElementById('rsiValue').textContent = rsi.toFixed(2);
    document.getElementById('rsiFill').style.width = `${rsi}%`;
    
    let rsiStatus = 'Neutral';
    if (rsi > 70) rsiStatus = 'Overbought';
    else if (rsi < 30) rsiStatus = 'Oversold';
    document.getElementById('rsiStatus').textContent = rsiStatus;
    
    // Update MACD
    const macd = indicators.macd || {};
    document.getElementById('macdValue').textContent = (macd.macd || 0).toFixed(3);
    document.getElementById('signalValue').textContent = (macd.signal || 0).toFixed(3);
    document.getElementById('histogramValue').textContent = (macd.histogram || 0).toFixed(3);
    
    // Update Moving Averages
    const sma = indicators.sma || {};
    document.getElementById('sma20').textContent = sma.sma_20 ? `$${sma.sma_20.toFixed(2)}` : 'N/A';
    document.getElementById('sma50').textContent = sma.sma_50 ? `$${sma.sma_50.toFixed(2)}` : 'N/A';
    document.getElementById('sma200').textContent = sma.sma_200 ? `$${sma.sma_200.toFixed(2)}` : 'N/A';
    
    // Update Volume Analysis
    const volume = indicators.volume_analysis || {};
    document.getElementById('currentVolume').textContent = formatVolume(volume.current);
    document.getElementById('avgVolume').textContent = formatVolume(volume.avg_20);
    document.getElementById('volumeRatio').textContent = `${(volume.ratio || 1).toFixed(2)}x`;
    document.getElementById('volumeSignal').textContent = volume.interpretation || 'Normal volume';
    
    // Update Bollinger Bands
    const bollinger = indicators.bollinger_bands || {};
    document.getElementById('bbUpper').textContent = bollinger.upper ? `$${bollinger.upper.toFixed(2)}` : 'N/A';
    document.getElementById('bbMiddle').textContent = bollinger.middle ? `$${bollinger.middle.toFixed(2)}` : 'N/A';
    document.getElementById('bbLower').textContent = bollinger.lower ? `$${bollinger.lower.toFixed(2)}` : 'N/A';
    
    // Update Support & Resistance
    const sr = indicators.support_resistance || {};
    const resistance = sr.resistance || [];
    const support = sr.support || [];
    
    document.getElementById('resistanceLevels').innerHTML = resistance.length > 0 ?
        resistance.map(r => `$${r.toFixed(2)}`).join(' | ') : 'N/A';
    document.getElementById('supportLevels').innerHTML = support.length > 0 ?
        support.map(s => `$${s.toFixed(2)}`).join(' | ') : 'N/A';
    
    // Update Signal Strength
    const signalStrength = indicators.signal_strength || {};
    updateSignalStrength(signalStrength);
}

// Update chart
function updateChart(chartData) {
    if (!chartData || !priceChart) return;
    
    // Update chart data
    priceChart.data.labels = chartData.dates.slice(-100).map(date => {
        return new Date(date).toLocaleDateString();
    });
    
    priceChart.data.datasets[0].data = chartData.prices.slice(-100);
    
    if (chartData.sma_20) {
        priceChart.data.datasets[1].data = chartData.sma_20.slice(-100);
    }
    
    if (chartData.sma_50) {
        priceChart.data.datasets[2].data = chartData.sma_50.slice(-100);
    }
    
    priceChart.update();
}

// Update signals
function updateSignals(signal) {
    if (!signal) return;
    
    // Update signal action
    const actionElem = document.getElementById('signalAction');
    actionElem.textContent = signal.signal || 'HOLD';
    actionElem.className = 'signal-action';
    
    if (signal.signal.includes('BUY')) {
        actionElem.classList.add('buy');
    } else if (signal.signal.includes('SELL')) {
        actionElem.classList.add('sell');
    } else {
        actionElem.classList.add('hold');
    }
    
    // Update confidence
    document.getElementById('signalConfidence').textContent = `${(signal.confidence || 0).toFixed(1)}%`;
    
    // Update reasoning
    const reasonsList = document.getElementById('signalReasons');
    reasonsList.innerHTML = '';
    if (signal.reasoning && signal.reasoning.length > 0) {
        signal.reasoning.forEach(reason => {
            const li = document.createElement('li');
            li.textContent = reason;
            reasonsList.appendChild(li);
        });
    }
}

// Update signal strength indicator
function updateSignalStrength(signalStrength) {
    const strength = signalStrength.strength || 0;
    const action = signalStrength.action || 'HOLD';
    const signals = signalStrength.signals || [];
    
    // Update strength bar
    const fillElem = document.getElementById('strengthFill');
    const absStrength = Math.abs(strength);
    fillElem.style.width = `${absStrength}%`;
    fillElem.className = strength >= 0 ? 'strength-fill positive' : 'strength-fill negative';
    
    // Update strength value
    document.getElementById('strengthValue').textContent = strength.toFixed(1);
    
    // Update signal action
    const actionElem = document.getElementById('signalAction');
    actionElem.textContent = action;
    actionElem.className = 'signal-action';
    
    if (action.includes('BUY')) {
        actionElem.classList.add('buy');
    } else if (action.includes('SELL')) {
        actionElem.classList.add('sell');
    } else {
        actionElem.classList.add('hold');
    }
    
    // Update confidence
    document.getElementById('signalConfidence').textContent = `${(signalStrength.confidence || 0).toFixed(1)}%`;
    
    // Update signals list
    const signalsList = document.getElementById('signalReasons');
    signalsList.innerHTML = '';
    signals.forEach(signal => {
        const li = document.createElement('li');
        li.textContent = signal;
        signalsList.appendChild(li);
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Show/hide panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(`${tabName}-panel`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    // Load data for the specific tab if not already loaded
    if (tabName === 'fundamental') {
        loadFundamentalData(currentSymbol);
    } else if (tabName === 'sentiment') {
        loadSentimentData(currentSymbol);
    } else if (tabName === 'signals') {
        loadTradeSignalsData(currentSymbol);
    }
}

// Show educational content
async function showEducationalContent(topic) {
    try {
        const response = await fetch(`${API_BASE}/education/${topic}`);
        const data = await response.json();
        
        const modal = document.getElementById('educationModal');
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDescription').textContent = data.description;
        
        // Create interpretation list
        const interpretDiv = document.getElementById('modalInterpretation');
        interpretDiv.innerHTML = '<h4>Interpretation:</h4><ul>';
        if (data.interpretation) {
            data.interpretation.forEach(item => {
                interpretDiv.innerHTML += `<li>${item}</li>`;
            });
        }
        interpretDiv.innerHTML += '</ul>';
        
        // Add usage info
        const usageDiv = document.getElementById('modalUsage');
        usageDiv.innerHTML = `<h4>How to Use:</h4><p>${data.usage}</p>`;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading educational content:', error);
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('educationModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Utility functions
function formatMarketCap(value) {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
}

function formatVolume(value) {
    if (!value) return 'N/A';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toString();
}

function showLoading() {
    // Add loading indicator
    document.body.classList.add('loading');
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('active');
}

function hideLoading() {
    // Remove loading indicator
    document.body.classList.remove('loading');
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('active');
}

// Comprehensive Info Topics Database
const infoTopics = {
    // Fundamental Analysis Scores
    'overall_score': {
        title: 'Overall Fundamental Score',
        description: 'This is a comprehensive score (0-100) that combines valuation, profitability, growth, and financial health metrics into a single easy-to-understand rating. Think of it as a "report card" for the company\'s overall financial quality. The score is calculated by analyzing dozens of financial metrics and comparing them to industry standards and historical performance.',
        interpretation: [
            'Score 80-100 (A Grade): Outstanding financial health across all areas. The company shows strong profitability, reasonable valuation, healthy growth, and solid balance sheet. These are typically blue-chip investments or rapidly growing quality companies.',
            'Score 60-79 (B Grade): Above-average fundamentals with some strengths. The company is solid but may have weaknesses in 1-2 areas (e.g., high debt or slowing growth). Generally safe investments with good potential.',
            'Score 40-59 (C Grade): Average or mixed fundamentals. The company has both strengths and weaknesses. Requires deeper analysis to understand specific risks and opportunities. Suitable for moderate risk tolerance.',
            'Score 20-39 (D Grade): Below-average fundamentals with multiple concerns. May be overvalued, unprofitable, heavily indebted, or experiencing declining business. Higher risk - appropriate only if you understand the turnaround story.',
            'Score 0-19 (F Grade): Severe fundamental weaknesses across multiple areas. Company may be in financial distress, massively overvalued, or facing existential threats. High probability of significant loss - avoid unless you\'re an experienced investor with specific conviction.'
        ],
        usage: 'Use this score as your FIRST filter when screening stocks. Scores above 60 indicate investment-grade quality. Scores below 40 warrant extra caution and research. This score helps you quickly identify which companies deserve deeper analysis and which to avoid. Think of 60+ as "green light for research," 40-59 as "proceed with caution," and below 40 as "red flag - understand the risk."',
        importance: 'CRITICAL - Your primary quality filter for investment decisions.',
        effect: 'Companies with high overall scores (70+) tend to outperform over long periods while experiencing less volatility. Low scores (<30) often precede further price declines as fundamental problems become evident to more investors.'
    },
    'valuation_score': {
        title: 'Valuation Score',
        description: 'This score answers the critical question: "Am I paying a fair price for this stock?" It analyzes multiple valuation metrics (P/E, PEG, Price-to-Book, Price-to-Sales, EV multiples) and compares them to historical averages, industry peers, and market standards. A high score means you\'re getting good value - paying less for quality. A low score means you\'re paying a premium - the stock is expensive relative to its fundamentals.',
        interpretation: [
            'Score 80-100 (Bargain): The stock trades at a significant discount to its intrinsic value based on multiple metrics. Either the market is overlooking it, or there\'s temporary pessimism. These can be excellent buying opportunities if fundamentals are solid. Example: A quality company trading at P/E of 12 when its industry average is 20.',
            'Score 60-79 (Fair Value): The stock is reasonably priced - not cheap but not expensive. You\'re paying a fair price for what you get. Good for long-term investors who want quality at reasonable prices. This is the "Goldilocks zone" for value-conscious investors.',
            'Score 40-59 (Fully Priced): The stock is priced at or slightly above fair value. You\'re paying market rates with little discount. Fine if you believe in strong future growth, but there\'s limited margin of safety. Not ideal for value investors.',
            'Score 20-39 (Overvalued): The stock is expensive by most metrics. You\'re paying a premium, possibly due to hype, growth expectations, or market exuberance. Higher risk of correction if growth disappoints. Requires very strong conviction in future performance.',
            'Score 0-19 (Severely Overvalued): The stock is trading at extreme valuations that are difficult to justify even with optimistic assumptions. High risk of significant loss if sentiment shifts or growth slows. These valuations are often unsustainable - proceed with extreme caution.'
        ],
        usage: 'Use this score to determine if the current price offers good value. High scores (70+) suggest good entry points for value investors. Low scores (<40) mean you\'re paying a premium - only justified if you expect exceptional growth. ALWAYS check this score before buying - even great companies can be bad investments at the wrong price. Warren Buffett\'s rule applies: "Price is what you pay, value is what you get."',
        importance: 'VERY HIGH - Valuation is the #1 determinant of long-term returns. Overpaying destroys returns even for great companies.',
        effect: 'Buying at high valuation scores (cheap prices) provides better long-term returns and downside protection. Studies show that valuation scores are the strongest predictor of 5-10 year returns - more important than growth or quality in the long run.'
    },
    'profitability_score': {
        title: 'Profitability Score',
        description: 'This score measures how good the company is at making money from its business operations. It evaluates profit margins (how much of each dollar in sales becomes profit), return on equity (ROE - profit relative to shareholder investment), return on assets (ROA - how well assets generate profits), and overall operational efficiency. High scores indicate a "money-making machine" - the company effectively converts sales into profits and generates strong returns on invested capital.',
        interpretation: [
            'Score 80-100 (Profit Machine): The company demonstrates exceptional profitability with industry-leading margins (typically 15%+ net margin) and strong returns (20%+ ROE). These companies have pricing power, efficient operations, or unique competitive advantages. Examples: Software companies with 30% margins, or dominant brands that command premium pricing. This is what you want to see.',
            'Score 60-79 (Strong Earner): Above-average profitability indicating efficient operations and solid business fundamentals. Margins are healthy (10-15%) and returns are good (15-20% ROE). The company successfully converts sales into profits better than most competitors. Reliable profit generators suitable for long-term investing.',
            'Score 40-59 (Average Profitability): Moderate profitability typical of competitive industries. Margins are acceptable (5-10%) but not exceptional. The company makes money but faces competition or operational challenges that limit profitability. Common in commodity businesses or competitive retail sectors.',
            'Score 20-39 (Struggling): Low profitability suggesting operational inefficiencies, pricing pressure, or competitive disadvantages. Thin margins (under 5%) mean little room for error. The company barely converts sales into profits - vulnerable to economic downturns or increased costs.',
            'Score 0-19 (Unprofitable): The company is losing money or barely breaking even. This could be normal for early-stage growth companies burning cash to gain market share, OR a sign of a failing business model. Requires investigation - is this temporary investment in growth or a broken business?'
        ],
        usage: 'Use profitability scores to identify quality businesses with sustainable competitive advantages. High scores (70+) indicate companies with "moats" - barriers that protect profits. Rising profitability scores over time signal improving competitive position. Falling scores warn of deteriorating business quality. CRITICAL: Even if a company is growing sales, low profitability scores mean growth isn\'t translating to shareholder value. Profitable growth beats revenue growth alone.',
        importance: 'VERY HIGH - Profitability is the engine of stock returns. Companies must be profitable to create long-term shareholder value.',
        effect: 'High profitability companies can reinvest cash flow to fuel growth, raise dividends, and buy back shares - all of which drive stock prices higher. Low profitability companies often need to raise capital through dilutive stock offerings, hurting existing shareholders.'
    },
    'growth_score': {
        title: 'Growth Score',
        description: 'This score measures how fast the company is growing its sales and profits. It analyzes both historical growth (past 3-5 years) and recent quarterly momentum. High growth companies are expanding their market share, launching new products, or entering new markets. Growth is a key driver of stock price appreciation - faster-growing companies typically command higher valuations and see bigger price gains.',
        interpretation: [
            'Score 80-100 (Hyper-Growth): Revenue and earnings growing 20%+ annually, with accelerating quarterly trends. These are rapidly expanding businesses that are capturing significant market share or creating new markets. Think: Fast-growing tech companies, breakthrough products, or companies in explosive sectors. High potential but also higher volatility.',
            'Score 60-79 (Strong Growth): Solid 10-20% annual growth with consistent quarterly performance. The company is outpacing industry growth and gaining market share steadily. Good balance of growth and stability - these are quality compounders that can deliver strong long-term returns without extreme risk.',
            'Score 40-59 (Moderate Growth): Growth of 5-10% annually, matching or slightly beating GDP/inflation. Typical of mature, stable businesses in competitive markets. The company is growing but not spectacularly. Fine for dividend investors or those seeking steady, predictable returns.',
            'Score 20-39 (Slow/Stalling Growth): Growth under 5% or inconsistent performance. The business is barely expanding, or growth is slowing. Could indicate market saturation, increased competition, or execution problems. Valuation multiples often contract when growth slows - stock price risk.',
            'Score 0-19 (Declining/No Growth): Flat or negative revenue/earnings growth. The business is shrinking or stagnant. This is a red flag unless it\'s a temporary situation (e.g., restructuring, one-time issues). Declining businesses rarely make good investments - even if they\'re "cheap," there\'s usually a reason.'
        ],
        usage: 'Use growth scores to identify companies with expanding businesses that can drive stock price appreciation. High-growth stocks (70+) can deliver outsized returns but require premium valuations to be sustainable. Moderate growth (50-70) offers balance. BEWARE: Declining growth (below 30) often leads to falling stock prices even if the company appears cheap - "value traps". Growth investors should target 60+ scores and verify the growth is sustainable and profitable.',
        importance: 'VERY HIGH - Growth is the #1 driver of stock price changes in the short to medium term. Accelerating growth drives prices up; decelerating growth drives them down.',
        effect: 'Companies with high, consistent growth scores attract institutional money and can sustain premium valuations. Acceleration in quarterly growth often triggers price breakouts. Deceleration causes multiple compression and selling pressure.'
    },
    'health_score': {
        title: 'Financial Health Score',
        description: 'This score is like a financial stress test - it measures the company\'s ability to pay its bills, survive economic downturns, and avoid financial distress. It analyzes debt levels (how much the company owes), liquidity ratios (ability to pay short-term obligations), and balance sheet strength (assets vs. liabilities). A strong health score means the company has plenty of cash, manageable debt, and can weather storms. Poor health means potential bankruptcy risk or forced dilution.',
        interpretation: [
            'Score 80-100 (Rock Solid): Minimal debt, strong cash position, excellent liquidity. The company has a fortress balance sheet - it can easily pay all obligations, fund growth internally, and survive any downturn. These companies sleep well at night and rarely face existential threats. Examples: Cash-rich tech companies, dividend aristocrats with pristine balance sheets.',
            'Score 60-79 (Healthy): Manageable debt levels (Debt/Equity under 1.0), good cash position, adequate liquidity. The company is financially sound but carries some debt - typical for most quality businesses. Can handle normal economic cycles without stress. Low probability of financial distress.',
            'Score 40-59 (Watch Closely): Moderate to high debt levels (Debt/Equity 1.0-2.0), adequate but not strong liquidity. The company has meaningful leverage - fine in good times, but vulnerable if business slows or interest rates rise. Requires monitoring. Not suitable for conservative investors.',
            'Score 20-39 (Financial Stress): High debt (Debt/Equity >2.0), weak liquidity, stretched balance sheet. The company is financially strained - high interest payments eat into profits, and refinancing risk exists. Vulnerable to downturns. May be forced to raise capital (dilutive) or cut dividends. High risk of credit rating downgrades.',
            'Score 0-19 (Distress Risk): Excessive debt, poor liquidity, potential solvency issues. The company is in financial danger - may struggle to meet obligations, faces bankruptcy risk, or needs emergency financing. Distressed situation - avoid unless you\'re a turnaround specialist. Very high probability of significant loss.'
        ],
        usage: 'Use health scores as your RISK FILTER. High scores (70+) mean financial safety - the company won\'t blow up due to debt problems. Scores below 40 indicate elevated financial risk - only appropriate for aggressive investors. In recessions or when interest rates rise, LOW health scores become extremely dangerous as refinancing gets harder and costs spike. CRITICAL FOR INCOME INVESTORS: Companies with weak health often cut dividends when trouble hits. Conservative investors should demand health scores above 60.',
        importance: 'CRITICAL - Financial health is your downside protection. Companies with weak balance sheets can go bankrupt even if their business is good.',
        effect: 'Strong financial health (high scores) provides stability during market stress, enables strategic acquisitions, and supports dividend growth. Weak health (low scores) leads to credit downgrades, dividend cuts, and potential bankruptcy - especially during recessions or rising rate environments.'
    },
    
    // Overview Metrics
    'market_cap': {
        title: 'Market Capitalization',
        description: 'Market Cap represents the total dollar market value of a company\'s outstanding shares of stock. It\'s calculated by multiplying the total number of shares outstanding by the current market price of one share.',
        interpretation: [
            'Large-cap (>$10B): Established companies with lower risk and stable returns',
            'Mid-cap ($2B-$10B): Growing companies with moderate risk and good growth potential',
            'Small-cap (<$2B): Emerging companies with higher risk but potentially higher returns',
            'A rising market cap indicates investor confidence and growing company value'
        ],
        usage: 'Use market cap to assess company size, compare peers, and evaluate investment risk. Larger companies tend to be more stable but may have slower growth.'
    },
    'pe_ratio': {
        title: 'Price-to-Earnings (P/E) Ratio',
        description: 'The P/E ratio is THE most widely used valuation metric in investing. It tells you how many dollars you\'re paying for each dollar of annual profit. Formula: Stock Price ÷ Earnings Per Share. Example: If a stock trades at $50 and earns $2.50 per share, the P/E is 20 ($50 ÷ $2.50 = 20x). This means you\'re paying $20 for every $1 of annual earnings. Lower P/E generally means cheaper stock, but context matters - fast-growing companies deserve higher P/Es.',
        interpretation: [
            'P/E < 10 (Very Cheap): Either a value opportunity OR a struggling business. This is unusually low - investigate why. Could be a cyclical company at peak earnings, a declining business, or a genuine bargain. Banks and mature industrials often trade here. Requires careful analysis.',
            'P/E 10-15 (Moderate Value): Reasonable valuation typical of mature, stable companies with moderate growth. Traditional value stocks live here. Good for dividend investors seeking steady returns. Less exciting but often safer. Examples: Utilities, consumer staples, some financials.',
            'P/E 15-25 (Fair Value): The "normal" range for most quality companies with average growth prospects (8-12% annually). Market average is historically around 16-18x. Companies here are fairly priced - not cheap, not expensive. Most blue chips trade in this range during normal markets.',
            'P/E 25-40 (Growth Premium): High valuations justified only by strong growth (15%+ earnings growth). Common for tech, healthcare innovators, and fast-growing companies. You\'re paying up for future earnings growth. Risk: If growth slows, P/E contracts sharply causing double price drop.',
            'P/E > 40 (Very Expensive): Extreme valuations requiring exceptional growth to justify. Either a revolutionary company with huge potential OR speculation/bubble territory. Very risky - even small earnings disappointments cause massive selloffs. Only for aggressive investors with strong conviction. Many unprofitable "story stocks" have infinite P/E.'
        ],
        usage: 'CRITICAL: Always compare P/E to (1) Company\'s historical average, (2) Industry peers, (3) Market average (~17x), and (4) Company\'s growth rate. A P/E of 30 is expensive for a 5% grower but cheap for a 40% grower. Use PEG ratio (P/E ÷ Growth Rate) for growth companies - PEG under 1.0 suggests good value. REMEMBER: Low P/E doesn\'t always mean "buy" - could be a value trap. High P/E doesn\'t always mean "sell" - could be justified by growth.',
        importance: 'CRITICAL - The single most important and widely-used valuation metric. Every investor should understand P/E ratios.',
        effect: 'P/E multiples expand (go higher) when growth accelerates or sentiment improves, driving prices up faster than earnings. P/E multiples contract (go lower) when growth slows, causing prices to fall even if earnings are flat. This "multiple expansion/contraction" is a major driver of stock returns.'
    },
    'dividend_yield': {
        title: 'Dividend Yield',
        description: 'Dividend Yield shows the annual dividend income as a percentage of the stock price. It\'s calculated by dividing the annual dividend per share by the current stock price.',
        interpretation: [
            'No Dividend (0%): Company reinvests profits for growth',
            'Low Yield (0-2%): Typical for growth companies',
            'Moderate Yield (2-4%): Balance of income and growth',
            'High Yield (>4%): Focus on income generation, but verify sustainability'
        ],
        usage: 'Income investors prioritize high dividend yields, but always check dividend sustainability and payout ratio. Very high yields may indicate financial distress.'
    },
    '52w_range': {
        title: '52-Week Range',
        description: 'The 52-Week Range shows the highest and lowest prices at which a stock has traded over the past 52 weeks (one year).',
        interpretation: [
            'Near 52-Week High: Strong bullish momentum, but may face resistance',
            'Near 52-Week Low: Potential value opportunity or continued weakness',
            'Mid-Range: Neutral position with room to move either direction',
            'Wide Range: High volatility stock with significant price swings'
        ],
        usage: 'Use this range to gauge price volatility and identify potential support/resistance levels. Compare current price position within the range to assess momentum.'
    },
    // Fundamental Metrics
    'peg_ratio': {
        title: 'PEG Ratio',
        description: 'The PEG (Price/Earnings to Growth) ratio adjusts the P/E ratio by considering the company\'s earnings growth rate. It\'s calculated by dividing the P/E ratio by the earnings growth rate.',
        interpretation: [
            'PEG < 1: Potentially undervalued relative to growth',
            'PEG = 1: Fair valuation considering growth',
            'PEG > 1: May be overvalued relative to growth prospects',
            'Lower PEG ratios generally indicate better value'
        ],
        usage: 'Use PEG to compare growth stocks and identify companies trading at attractive valuations relative to their growth potential.'
    },
    'price_to_book': {
        title: 'Price-to-Book (P/B) Ratio',
        description: 'The P/B ratio compares a company\'s market value to its book value (net assets). It\'s calculated by dividing the stock price by the book value per share.',
        interpretation: [
            'P/B < 1: Stock may be undervalued or company has poor prospects',
            'P/B = 1-3: Typical range for most established companies',
            'P/B > 3: High growth expectations or intangible assets',
            'Works best for asset-heavy industries like banking and manufacturing'
        ],
        usage: 'Use P/B ratio to identify potentially undervalued stocks, especially in financial and industrial sectors. Less useful for tech and service companies.'
    },
    'roe': {
        title: 'Return on Equity (ROE)',
        description: 'ROE measures how efficiently a company generates profits from shareholders\' equity. It\'s calculated by dividing net income by shareholders\' equity.',
        interpretation: [
            'ROE < 10%: Below average profitability',
            'ROE = 10-15%: Average profitability for most industries',
            'ROE = 15-20%: Good profitability and efficient management',
            'ROE > 20%: Excellent profitability, but verify sustainability'
        ],
        usage: 'Higher ROE indicates better management efficiency and profitability. Compare ROE across companies in the same industry for meaningful analysis.'
    },
    'debt_to_equity': {
        title: 'Debt-to-Equity Ratio',
        description: 'This ratio measures a company\'s financial leverage by comparing total debt to shareholders\' equity. It shows how much debt a company uses to finance its assets.',
        interpretation: [
            'D/E < 0.5: Conservative capital structure, low financial risk',
            'D/E = 0.5-1.5: Moderate leverage, balanced approach',
            'D/E = 1.5-2.5: Higher leverage, increased financial risk',
            'D/E > 2.5: High debt levels, significant financial risk'
        ],
        usage: 'Lower ratios indicate less financial risk but may limit growth. Higher ratios can boost returns but increase bankruptcy risk during downturns.'
    },
    'current_ratio': {
        title: 'Current Ratio',
        description: 'The Current Ratio measures a company\'s ability to pay short-term obligations with its current assets. It\'s calculated by dividing current assets by current liabilities.',
        interpretation: [
            'Ratio < 1: Company may struggle to pay short-term debts',
            'Ratio = 1-2: Healthy liquidity position',
            'Ratio > 2: Strong liquidity, but assets may be underutilized',
            'Industry-specific norms vary significantly'
        ],
        usage: 'Use this ratio to assess a company\'s short-term financial health and ability to meet obligations. Critical for evaluating financial stability.'
    },
    'eps': {
        title: 'Earnings Per Share (EPS)',
        description: 'EPS indicates how much profit a company generates for each share of stock. It\'s calculated by dividing net income by the number of outstanding shares.',
        interpretation: [
            'Negative EPS: Company is losing money',
            'Growing EPS: Improving profitability, positive signal',
            'Declining EPS: Weakening profitability, warning sign',
            'Compare EPS growth rate to industry peers'
        ],
        usage: 'Higher and growing EPS indicates stronger profitability. Track EPS trends over time to assess company performance and growth trajectory.'
    },
    'revenue_growth': {
        title: 'Revenue Growth',
        description: 'Revenue Growth measures the year-over-year increase in a company\'s total revenue, indicating business expansion and market demand.',
        interpretation: [
            'Negative Growth: Declining sales, potential trouble',
            '0-5% Growth: Slow growth, mature company',
            '5-15% Growth: Healthy growth for established companies',
            '>15% Growth: Strong growth, high-growth company'
        ],
        usage: 'Consistent revenue growth indicates strong business fundamentals. Compare growth rates to industry averages and competitors.'
    },
    // Sentiment Metrics
    'sentiment_score': {
        title: 'Sentiment Score',
        description: 'Sentiment Score aggregates market sentiment from news articles, social media, and analyst opinions. It ranges from -100 (very negative) to +100 (very positive).',
        interpretation: [
            'Score < -50: Very negative sentiment, high pessimism',
            'Score -50 to 0: Bearish sentiment, caution advised',
            'Score 0 to 50: Bullish sentiment, positive outlook',
            'Score > 50: Very positive sentiment, high optimism'
        ],
        usage: 'Use sentiment as a contrarian indicator or to confirm technical signals. Extreme sentiment often precedes reversals.'
    },
    'news_sentiment': {
        title: 'News Sentiment',
        description: 'News Sentiment analyzes recent news articles about the company using natural language processing to gauge overall tone and market perception.',
        interpretation: [
            'Positive: Good news flow, favorable coverage',
            'Neutral: Mixed or routine news coverage',
            'Negative: Bad news, unfavorable coverage',
            'Track sentiment changes over time for trends'
        ],
        usage: 'Sudden sentiment shifts can precede price movements. Combine with other analysis for better trading decisions.'
    },
    'social_sentiment': {
        title: 'Social Media Sentiment',
        description: 'Social Media Sentiment tracks discussions and opinions about the stock across social platforms like Twitter, Reddit, and financial forums.',
        interpretation: [
            'High Positive Buzz: Strong retail interest, potential momentum',
            'High Negative Buzz: Concerns spreading, potential weakness',
            'Low Activity: Limited retail interest',
            'Viral trends can cause short-term volatility'
        ],
        usage: 'Social sentiment can indicate retail trading interest and potential short-term price movements, especially for meme stocks.'
    },
    // Technical Indicators
    'rsi': {
        title: 'Relative Strength Index (RSI)',
        description: 'RSI is a momentum oscillator that measures the speed and magnitude of price changes on a scale from 0 to 100. It helps identify overbought and oversold conditions in the market.',
        interpretation: [
            'RSI > 70: Overbought condition - stock may be due for a pullback or consolidation',
            'RSI 50-70: Bullish momentum - upward trend with healthy buying pressure',
            'RSI 30-50: Bearish momentum - downward pressure but not extreme',
            'RSI < 30: Oversold condition - stock may be due for a bounce or recovery',
            'Divergences between RSI and price can signal trend reversals'
        ],
        usage: 'Use RSI to identify potential entry/exit points. When RSI crosses above 30, it may signal a buying opportunity. When it crosses below 70, consider taking profits. Combine with other indicators for confirmation.',
        importance: 'HIGH - One of the most reliable momentum indicators for timing trades and identifying reversal points.',
        effect: 'RSI readings help determine whether current price levels are sustainable. Extreme readings often precede price corrections or continuations.'
    },
    'macd': {
        title: 'Moving Average Convergence Divergence (MACD)',
        description: 'MACD is a trend-following momentum indicator that shows the relationship between two exponential moving averages (12-day and 26-day). It consists of the MACD line, signal line, and histogram.',
        interpretation: [
            'MACD Above Signal Line: Bullish signal - momentum favors buyers',
            'MACD Below Signal Line: Bearish signal - momentum favors sellers',
            'MACD Crosses Above Zero: Strong bullish momentum building',
            'MACD Crosses Below Zero: Strong bearish momentum building',
            'Growing Histogram: Increasing momentum in current direction',
            'Shrinking Histogram: Momentum weakening, possible reversal ahead'
        ],
        usage: 'Watch for MACD line crossing the signal line for buy/sell signals. Positive histogram suggests buying pressure, negative suggests selling pressure. Best used in trending markets.',
        importance: 'HIGH - Excellent for identifying trend changes and momentum shifts early.',
        effect: 'MACD crossovers often precede significant price movements. Bullish crossovers support buy signals, while bearish crossovers support sell signals.'
    },
    'sma': {
        title: 'Simple Moving Averages (SMA)',
        description: 'Moving averages smooth out price data by creating a constantly updated average price. The 50-day and 200-day SMAs are the most widely watched by traders and institutions.',
        interpretation: [
            'Price Above SMA: Bullish - uptrend in place',
            'Price Below SMA: Bearish - downtrend in place',
            'Golden Cross (50 > 200): Strong bullish signal, major uptrend beginning',
            'Death Cross (50 < 200): Strong bearish signal, major downtrend beginning',
            '50 SMA: Short to medium-term trend indicator',
            '200 SMA: Long-term trend indicator and key support/resistance'
        ],
        usage: 'Use moving averages to identify trend direction and potential support/resistance levels. Price bouncing off SMA can be a buy/sell signal. Golden/Death crosses are powerful long-term signals.',
        importance: 'VERY HIGH - Institutional traders rely heavily on these levels. The 200-day SMA is considered the most important technical indicator.',
        effect: 'Moving averages define the overall trend. Trading with the SMA trend significantly improves success rates. Violations of key SMAs often trigger large institutional orders.'
    },
    'volume': {
        title: 'Volume Analysis',
        description: 'Volume measures the number of shares traded during a given period. It confirms the strength of price movements and indicates market participation and conviction.',
        interpretation: [
            'High Volume + Price Up: Strong bullish conviction, likely to continue',
            'High Volume + Price Down: Strong bearish conviction, likely to continue',
            'Low Volume + Price Up: Weak rally, likely to fail',
            'Low Volume + Price Down: Weak decline, possible reversal',
            'Volume Above Average: Significant market interest and participation',
            'Volume Spike: Major news or event, potential trend change'
        ],
        usage: 'Always confirm price movements with volume. Breakouts need high volume to be valid. Low volume moves are unreliable and prone to reversal. Volume leads price.',
        importance: 'CRITICAL - Volume validates all other technical signals. No volume = no conviction = no trade.',
        effect: 'High volume confirms trend strength and breakout validity. Low volume suggests weak moves that may reverse. Volume precedes price - increasing volume often signals upcoming moves.'
    },
    'bollinger': {
        title: 'Bollinger Bands',
        description: 'Bollinger Bands consist of a middle band (20-day SMA) and two outer bands set at 2 standard deviations above and below. They measure price volatility and identify overbought/oversold conditions.',
        interpretation: [
            'Price at Upper Band: Overbought, high volatility, possible reversal or consolidation',
            'Price at Lower Band: Oversold, high volatility, possible bounce or reversal',
            'Squeeze (Narrow Bands): Low volatility, major move likely coming soon',
            'Expansion (Wide Bands): High volatility, trending market',
            'Walking the Band: Strong trend when price rides upper/lower band',
            'Bollinger Bounce: Price tends to return to middle band from extremes'
        ],
        usage: 'Use Bollinger Bands to identify volatility, overbought/oversold levels, and potential breakouts. Squeezes often precede explosive moves. Combine with other indicators for confirmation.',
        importance: 'HIGH - Excellent for volatility analysis and identifying potential reversal zones.',
        effect: 'Bands provide dynamic support/resistance levels that adapt to market volatility. Squeezes predict major moves, while band touches suggest potential reversals or continuations.'
    },
    'support': {
        title: 'Support & Resistance Levels',
        description: 'Support and Resistance are price levels where buying or selling pressure is strong enough to stop or reverse price movement. These levels represent psychological and technical barriers.',
        interpretation: [
            'Strong Support: Price level where buying pressure overcomes selling (floor)',
            'Strong Resistance: Price level where selling pressure overcomes buying (ceiling)',
            'Multiple Touches: More touches at a level make it stronger',
            'Break Above Resistance: Becomes new support, bullish signal',
            'Break Below Support: Becomes new resistance, bearish signal',
            'Volume on Break: High volume breaks are more reliable'
        ],
        usage: 'Use S&R levels to plan entry/exit points and set stop-losses. Buy near support, sell near resistance. Breakouts above resistance or below support signal strong trends. Wait for confirmation.',
        importance: 'VERY HIGH - Foundation of technical analysis. Professional traders base most decisions on these levels.',
        effect: 'S&R levels act as magnets for price action. Breaking these levels triggers institutional orders and stop-losses, causing significant price movements. Trend changes often occur at major S&R levels.'
    },
    'stochastic': {
        title: 'Stochastic Oscillator',
        description: 'The Stochastic Oscillator compares a stock\'s closing price to its price range over a specific period (typically 14 days). It measures momentum and identifies overbought/oversold conditions.',
        interpretation: [
            'Above 80: Overbought - potential sell signal approaching',
            '50-80: Bullish momentum zone',
            '20-50: Bearish momentum zone',
            'Below 20: Oversold - potential buy signal approaching',
            'Bullish Crossover: %K crosses above %D in oversold zone',
            'Bearish Crossover: %K crosses below %D in overbought zone'
        ],
        usage: 'Wait for stochastic to exit extreme zones (above 80 or below 20) before entering trades. Crossovers in extreme zones provide strong reversal signals. Best used in ranging markets.',
        importance: 'MEDIUM - Reliable for timing entries/exits in sideways markets, less effective in strong trends.',
        effect: 'Stochastic readings help identify when short-term momentum is exhausted, signaling potential reversals or consolidations.'
    },
    'atr': {
        title: 'Average True Range (ATR)',
        description: 'ATR measures market volatility by calculating the average range between high and low prices over a specified period (typically 14 days). Higher ATR means higher volatility.',
        interpretation: [
            'High ATR: High volatility, larger price swings, wider stops needed',
            'Low ATR: Low volatility, smaller price swings, tighter stops possible',
            'Rising ATR: Volatility increasing, trend may be strengthening',
            'Falling ATR: Volatility decreasing, consolidation or trend ending',
            'Use ATR for position sizing and stop-loss placement'
        ],
        usage: 'Use ATR to set appropriate stop-loss levels and position sizes. Set stops at 2-3x ATR below entry. Higher ATR requires smaller position sizes to manage risk properly.',
        importance: 'MEDIUM-HIGH - Critical for risk management and position sizing.',
        effect: 'ATR helps you adapt to current market conditions. High volatility requires wider stops and smaller positions to maintain consistent risk levels.'
    },
    'adx': {
        title: 'Average Directional Index (ADX)',
        description: 'ADX measures the strength of a trend without indicating direction. It ranges from 0-100, with higher values indicating stronger trends regardless of whether they\'re up or down.',
        interpretation: [
            'ADX < 20: Weak or no trend, range-bound market',
            'ADX 20-25: Trend developing, watch for breakout',
            'ADX 25-50: Strong trend in place, follow the trend',
            'ADX > 50: Very strong trend, but may be exhausting',
            'Rising ADX: Trend strengthening',
            'Falling ADX: Trend weakening or entering consolidation'
        ],
        usage: 'Use ADX to determine if the market is trending or ranging. Trade trend-following strategies when ADX > 25, use range-bound strategies when ADX < 20. Avoid trading when ADX is declining.',
        importance: 'HIGH - Essential for choosing the right trading strategy (trend vs. range).',
        effect: 'ADX helps you identify when trend-following strategies will work best. High ADX readings increase the success rate of momentum-based trades significantly.'
    },
    // Additional Valuation Metrics
    'price_to_sales': {
        title: 'Price-to-Sales (P/S) Ratio',
        description: 'The P/S ratio compares a company\'s market capitalization to its total revenue. It shows how much investors are willing to pay for each dollar of sales.',
        interpretation: [
            'P/S < 1: Potentially undervalued, especially for mature companies',
            'P/S = 1-2: Reasonable valuation for most industries',
            'P/S = 2-5: Premium valuation, growth expectations',
            'P/S > 5: Very high valuation, verify growth justifies price',
            'Best for comparing companies in the same industry'
        ],
        usage: 'Use P/S ratio to value companies with negative earnings or in high-growth sectors. Particularly useful for tech and biotech companies. Lower ratios suggest better value, but compare within industries.',
        importance: 'MEDIUM-HIGH - Essential for valuing unprofitable growth companies.',
        effect: 'Low P/S ratios combined with strong revenue growth often signal undervalued opportunities before profitability arrives.'
    },
    'ev_to_revenue': {
        title: 'Enterprise Value to Revenue (EV/Revenue)',
        description: 'EV/Revenue compares a company\'s total enterprise value (market cap + debt - cash) to its annual revenue. It accounts for debt levels, providing a more complete valuation picture.',
        interpretation: [
            'EV/Rev < 1: Potentially undervalued, strong value opportunity',
            'EV/Rev = 1-3: Normal range for mature companies',
            'EV/Rev = 3-10: Growth premium, verify fundamentals',
            'EV/Rev > 10: Very expensive, needs exceptional growth',
            'Better than P/S as it accounts for debt and cash'
        ],
        usage: 'Use EV/Revenue for complete valuation analysis, especially when comparing companies with different capital structures. Essential for M&A valuations and capital-intensive industries.',
        importance: 'HIGH - More accurate than P/S ratio for company valuations.',
        effect: 'EV/Revenue provides true economic value per dollar of sales, revealing hidden value in companies with strong balance sheets.'
    },
    'ev_to_ebitda': {
        title: 'Enterprise Value to EBITDA (EV/EBITDA)',
        description: 'EV/EBITDA compares enterprise value to Earnings Before Interest, Taxes, Depreciation, and Amortization. It\'s a key valuation metric used by professional investors and for M&A deals.',
        interpretation: [
            'EV/EBITDA < 8: Generally undervalued',
            'EV/EBITDA = 8-12: Fair valuation for most companies',
            'EV/EBITDA = 12-15: Premium valuation, growth expected',
            'EV/EBITDA > 15: Expensive, verify strong growth prospects',
            'Widely used in private equity and M&A'
        ],
        usage: 'Use EV/EBITDA to compare companies regardless of capital structure or tax situations. Industry-standard for buyout valuations. Lower multiples indicate better value for cash flow generation.',
        importance: 'VERY HIGH - Industry standard for M&A and buyout valuations.',
        effect: 'Professional investors use this metric extensively. Low EV/EBITDA often attracts buyout interest and can signal significant upside potential.'
    },
    // Profitability Metrics
    'profit_margin': {
        title: 'Net Profit Margin',
        description: 'Profit Margin shows what percentage of revenue becomes actual profit after all expenses. It measures overall profitability efficiency and pricing power.',
        interpretation: [
            'Margin < 5%: Low profitability, thin margins',
            'Margin = 5-10%: Average profitability for most industries',
            'Margin = 10-20%: Good profitability, strong business',
            'Margin > 20%: Excellent profitability, pricing power',
            'Compare to industry averages for context'
        ],
        usage: 'Use profit margins to assess business quality and pricing power. Rising margins indicate improving efficiency or pricing power. Essential for comparing competitors and tracking company performance over time.',
        importance: 'VERY HIGH - Core measure of business profitability and efficiency.',
        effect: 'Rising profit margins often drive stock price appreciation as they demonstrate operational excellence and competitive advantages.'
    },
    'operating_margin': {
        title: 'Operating Margin',
        description: 'Operating Margin measures profitability from core business operations before interest and taxes. It shows how efficiently management runs the business.',
        interpretation: [
            'Op Margin < 10%: Low operational efficiency',
            'Op Margin = 10-15%: Average operational performance',
            'Op Margin = 15-25%: Strong operational efficiency',
            'Op Margin > 25%: Excellent operations, competitive advantage',
            'Higher than profit margin due to excluding interest/taxes'
        ],
        usage: 'Use operating margin to evaluate management effectiveness and operational efficiency. More stable than net profit margin as it excludes financing decisions. Track trends over time for business health.',
        importance: 'HIGH - Shows pure operational profitability without financing effects.',
        effect: 'Consistent or improving operating margins indicate sustainable competitive advantages and strong business fundamentals.'
    },
    'roa': {
        title: 'Return on Assets (ROA)',
        description: 'ROA measures how efficiently a company uses its assets to generate profits. It\'s calculated by dividing net income by total assets.',
        interpretation: [
            'ROA < 5%: Poor asset utilization',
            'ROA = 5-10%: Average asset efficiency',
            'ROA = 10-15%: Good asset utilization',
            'ROA > 15%: Excellent asset efficiency',
            'Varies significantly by industry'
        ],
        usage: 'Use ROA to evaluate how well management deploys assets to generate returns. Particularly useful for asset-heavy industries like manufacturing and retail. Higher ROA means better asset productivity.',
        importance: 'MEDIUM-HIGH - Critical for capital-intensive industries.',
        effect: 'High ROA indicates efficient capital deployment, leading to superior returns on invested capital over time.'
    },
    // Growth Metrics
    'earnings_growth': {
        title: 'Earnings Growth Rate',
        description: 'Earnings Growth measures the year-over-year increase in a company\'s net income or earnings per share. It\'s a critical indicator of business expansion and success.',
        interpretation: [
            'Negative Growth: Earnings declining, investigate causes',
            '0-10% Growth: Slow growth, mature business',
            '10-20% Growth: Healthy growth for established companies',
            '>20% Growth: Strong growth, high-growth company',
            'Consistency of growth is as important as the rate'
        ],
        usage: 'Use earnings growth to identify companies with expanding profitability. Combine with P/E ratio to find growth at reasonable prices. Consistent earnings growth is more valuable than erratic spikes.',
        importance: 'VERY HIGH - Primary driver of long-term stock price appreciation.',
        effect: 'Sustained earnings growth is the #1 driver of stock returns. Companies growing earnings >15% annually often see strong price appreciation.'
    },
    'quarterly_revenue_growth': {
        title: 'Quarterly Revenue Growth',
        description: 'Quarterly Revenue Growth shows the sequential or year-over-year change in quarterly revenue. It provides early signals of business momentum changes.',
        interpretation: [
            'Negative Growth: Business slowing, red flag',
            '0-5% Growth: Slow quarter, monitor trend',
            '5-15% Growth: Healthy quarterly performance',
            '>15% Growth: Accelerating business momentum',
            'Watch for consistent acceleration or deceleration'
        ],
        usage: 'Use quarterly revenue growth to catch trend changes early before they show up in annual numbers. Accelerating quarterly growth often precedes stock price breakouts. Key for earnings surprise predictions.',
        importance: 'HIGH - Leading indicator for business momentum changes.',
        effect: 'Accelerating quarterly revenue growth often triggers institutional buying and can lead to earnings estimate revisions and multiple expansion.'
    },
    'quarterly_earnings_growth': {
        title: 'Quarterly Earnings Growth',
        description: 'Quarterly Earnings Growth measures the change in earnings per share compared to the same quarter last year. It\'s a key metric tracked by Wall Street analysts.',
        interpretation: [
            'Negative Growth: Earnings miss, potential selloff',
            '0-10% Growth: Modest growth, meeting expectations',
            '10-25% Growth: Strong quarter, positive signal',
            '>25% Growth: Exceptional performance, likely beats',
            'Compare to analyst estimates for surprise factor'
        ],
        usage: 'Use quarterly earnings growth to identify earnings momentum and potential surprises. Stocks often surge on strong earnings beats and accelerating growth. Essential for timing entries around earnings.',
        importance: 'VERY HIGH - Direct catalyst for short-term price movements.',
        effect: 'Quarterly earnings surprises and acceleration drive immediate stock reactions. Consistent beats and raises often lead to sustained uptrends.'
    },
    // Financial Health Metrics
    'quick_ratio': {
        title: 'Quick Ratio (Acid-Test Ratio)',
        description: 'The Quick Ratio is a more stringent measure of liquidity than the Current Ratio. It excludes inventory from current assets, showing if a company can meet short-term obligations with its most liquid assets.',
        interpretation: [
            'Quick Ratio < 0.5: Serious liquidity concerns, high risk',
            'Quick Ratio = 0.5-1.0: Moderate liquidity, monitor closely',
            'Quick Ratio = 1.0-1.5: Healthy liquidity position',
            'Quick Ratio > 1.5: Strong liquidity, low short-term risk',
            'More conservative than Current Ratio'
        ],
        usage: 'Use Quick Ratio to assess a company\'s ability to pay immediate obligations without relying on selling inventory. Critical for evaluating financial distress risk. Higher ratios mean greater safety.',
        importance: 'HIGH - Essential for assessing true liquidity and financial stability.',
        effect: 'A declining quick ratio can signal cash flow problems before they become critical. Strong quick ratios provide downside protection during market stress.'
    },
    'dividend_payout_ratio': {
        title: 'Dividend Payout Ratio',
        description: 'The Dividend Payout Ratio shows what percentage of earnings a company pays out as dividends. It indicates dividend sustainability and growth potential.',
        interpretation: [
            'Payout < 30%: Conservative, strong growth reinvestment',
            'Payout = 30-50%: Balanced approach, sustainable',
            'Payout = 50-75%: High payout, limited growth investment',
            'Payout > 75%: Very high payout, sustainability concerns',
            'Payout > 100%: Unsustainable, dividend likely to be cut'
        ],
        usage: 'Use payout ratio to assess dividend safety and growth prospects. Lower ratios suggest room for dividend increases and better safety during downturns. High ratios may indicate mature companies or dividend risk.',
        importance: 'HIGH - Critical for income investors evaluating dividend sustainability.',
        effect: 'Low payout ratios (30-50%) often lead to consistent dividend growth. Ratios above 100% frequently precede dividend cuts, causing significant price drops.'
    }
};

// Show info modal with topic details
function showInfoModal(topic) {
    const data = infoTopics[topic];
    if (!data) {
        console.warn('No info available for topic:', topic);
        return;
    }
    
    const modal = document.getElementById('educationModal');
    if (!modal) {
        console.error('Education modal not found in DOM');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalInterpretation = document.getElementById('modalInterpretation');
    const modalUsage = document.getElementById('modalUsage');
    
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDescription) modalDescription.textContent = data.description;
    
    // Create interpretation list
    if (modalInterpretation) {
        modalInterpretation.innerHTML = '<h4>Interpretation:</h4><ul>';
        if (data.interpretation) {
            data.interpretation.forEach(item => {
                modalInterpretation.innerHTML += `<li>${item}</li>`;
            });
        }
        modalInterpretation.innerHTML += '</ul>';
    }
    
    // Add usage info
    if (modalUsage) {
        modalUsage.innerHTML = `<h4>How to Use:</h4><p>${data.usage}</p>`;
        
        // Add importance if available
        if (data.importance) {
            modalUsage.innerHTML += `<h4 style="margin-top: 20px;">Importance:</h4><p><strong>${data.importance}</strong></p>`;
        }
        
        // Add effect on trade signals if available
        if (data.effect) {
            modalUsage.innerHTML += `<h4 style="margin-top: 20px;">Effect on Trade Signals:</h4><p>${data.effect}</p>`;
        }
    }
    
    // Show modal
    modal.style.display = 'block';
    modal.classList.add('active');
    console.log('Modal shown for topic:', topic);
}

function showError(message) {
    console.error(message);
    // You can add a toast notification here
}

// Attach info button listeners using event delegation
function attachInfoButtonListeners() {
    // Use event delegation on document body to catch all clicks
    document.body.addEventListener('click', function(e) {
        // Check if clicked element is an info button or its child
        const infoBtn = e.target.closest('.info-btn, .info-btn-small');
        if (infoBtn) {
            e.stopPropagation();
            e.preventDefault();
            const topic = infoBtn.dataset.topic;
            console.log('Info button clicked:', topic); // Debug log
            
            // Check if it's a predefined topic or needs to fetch from backend
            if (infoTopics[topic]) {
                showInfoModal(topic);
            } else {
                showEducationalContent(topic);
            }
        }
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
