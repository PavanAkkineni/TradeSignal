// Trading Analytics Platform - Enhanced JavaScript Application
// With better error handling and data visualization

// Global variables
let currentSymbol = 'IBM';
let priceChart = null;
let updateInterval = null;

// API Base URL
const API_BASE = 'http://localhost:8000/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Trading Analytics Platform...');
    console.log('📊 MODE: STATIC DATA ONLY - No live market data');
    console.log('API Base URL:', API_BASE);
    
    try {
        // Initialize app components
        console.log('⚙️ Initializing application...');
        initializeApp();
        
        console.log('📡 Setting up event listeners...');
        setupEventListeners();
        
        // Load initial data
        console.log('📊 Loading initial stock data for:', currentSymbol);
        loadStockData(currentSymbol);
        
        // Auto-update disabled for static data
        console.log('⏰ Auto-update disabled (using static data)...');
        // updateInterval = setInterval(() => {
        //     console.log('🔄 Auto-updating data...');
        //     loadStockData(currentSymbol);
        // }, 30000);
        
        console.log('✅ Application initialized successfully!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to initialize application: ' + error.message);
    }
});

// Initialize application
function initializeApp() {
    console.log('📊 Initializing chart...');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js not loaded');
        showError('Chart library not loaded');
        return;
    }
    
    // Setup chart with better configuration
    const ctx = document.getElementById('priceChart');
    if (!ctx) {
        console.error('❌ Price chart canvas not found');
        showError('Chart canvas not found');
        return;
    }
    
    console.log('✅ Chart canvas found, creating chart...');
    
    try {
        priceChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: '#5865f2',
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 4
            }, {
                label: 'SMA 20',
                data: [],
                borderColor: '#00d4aa',
                borderWidth: 1,
                borderDash: [5, 5],
                tension: 0.1,
                backgroundColor: 'transparent',
                pointRadius: 0
            }, {
                label: 'SMA 50',
                data: [],
                borderColor: '#fee75c',
                borderWidth: 1,
                borderDash: [5, 5],
                tension: 0.1,
                backgroundColor: 'transparent',
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#8b92b9',
                        padding: 15,
                        font: {
                            size: 12,
                            weight: 500
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 33, 57, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#8b92b9',
                    borderColor: '#2a2e4a',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '$' + context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#565d7e',
                        maxTicksLimit: 8
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#565d7e',
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
        
        console.log('✅ Chart initialized successfully');
    } catch (error) {
        console.error('❌ Chart initialization failed:', error);
        showError('Failed to initialize chart: ' + error.message);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Symbol selector
    const symbolSelect = document.getElementById('symbolSelect');
    if (symbolSelect) {
        symbolSelect.addEventListener('change', (e) => {
            currentSymbol = e.target.value;
            loadStockData(currentSymbol);
        });
    }
    
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Info buttons
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const topic = e.target.closest('button').dataset.topic;
            console.log(`📚 Opening educational content for: ${topic}`);
            showEducationalContent(topic);
        });
    });
    
    // Modal close button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('educationModal');
        if (modal && e.target === modal) {
            closeModal();
        }
    });
    
    // Time period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // Load data for selected period
            loadStockData(currentSymbol);
        });
    });
}

// Load stock data with sequential loading for better reliability
async function loadStockData(symbol) {
    console.log(`📡 Loading data for ${symbol}...`);
    showLoading();
    
    let technicalData = null;
    
    try {
        // Load technical data first as it's most important
        console.log('🔄 Loading technical data...');
        try {
            technicalData = await fetchWithRetry(`${API_BASE}/technical/${symbol}`);
            console.log('📊 Technical data received:', technicalData);
            
            if (technicalData && technicalData.indicators) {
                console.log('✅ Processing technical indicators...');
                updateTechnicalIndicators(technicalData.indicators);
                
                // Update overview with technical data if it contains price info
                if (technicalData.indicators.current_price) {
                    updateOverview({ indicators: technicalData.indicators });
                }
            }
            
            if (technicalData && technicalData.chart_data) {
                console.log('📈 Updating chart...');
                updateChart(technicalData.chart_data);
            }
        } catch (error) {
            console.error('❌ Technical data failed:', error);
            updateTechnicalIndicatorsWithDefaults();
        }
        
        // Load overview data (optional) - Only if we don't have technical price data
        let hasValidPriceData = technicalData && technicalData.indicators && technicalData.indicators.current_price;
        console.log('🔍 Price data check:', { hasValidPriceData, currentPrice: technicalData?.indicators?.current_price });
        
        if (!hasValidPriceData) {
            try {
                const overviewData = await fetchWithRetry(`${API_BASE}/overview/${symbol}`);
                if (overviewData) {
                    updateOverview(overviewData);
                } else {
                    console.warn('⚠️ Overview data not available, using defaults');
                    updateOverviewWithDefaults(symbol);
                }
            } catch (error) {
                console.warn('⚠️ Overview data not available, using defaults');
                updateOverviewWithDefaults(symbol);
            }
        } else {
            console.log('✅ Using price data from technical API, skipping overview defaults');
        }
        
        // Load signal data (optional)
        try {
            const signalData = await fetchWithRetry(`${API_BASE}/signals/${symbol}`);
            if (signalData && signalData.signal) {
                updateSignals(signalData.signal);
            }
        } catch (error) {
            console.warn('⚠️ Signal data not available');
            updateSignalsWithDefaults();
        }

        // Load expert analysis data for Expert Analysis tab
        try {
            console.log('🤖 Loading expert analysis...');
            const expertData = await fetchWithRetry(`${API_BASE}/trading-expert/${symbol}`);
            if (expertData) {
                console.log('✅ Expert analysis received:', expertData);
                updateExpertAnalysis(expertData);
            }
        } catch (error) {
            console.warn('⚠️ Expert analysis not available:', error);
            updateExpertAnalysisWithDefaults();
        }
        
        // Load AI data (optional)
        try {
            const aiData = await fetchWithRetry(`${API_BASE}/ai-analysis/${symbol}`);
            if (aiData) {
                updateAIAnalysis(aiData);
            }
        } catch (error) {
            console.warn('⚠️ AI analysis not available');
        }
        
        console.log('✅ Data loading completed!');
        
    } catch (error) {
        console.error('❌ Critical error loading stock data:', error);
        showError('Failed to load stock data. Please check your connection.');
    } finally {
        hideLoading();
    }
}

// Fetch with retry logic and better error handling
async function fetchWithRetry(url, retries = 2) {
    console.log(`🌐 Fetching: ${url}`);
    
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });
            
            console.log(`📡 Response status: ${response.status} for ${url}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Data received from ${url}`);
            return data;
        } catch (error) {
            console.error(`❌ Attempt ${i + 1} failed for ${url}:`, error);
            if (i === retries) {
                console.error(`💥 All attempts failed for ${url}`);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
    }
}

// Update overview section with proper null checking
function updateOverview(data) {
    if (!data) return;
    
    console.log('📈 Updating overview with data:', data);
    
    // Update company info
    updateElement('.company-name', data.name || 'International Business Machines');
    updateElement('#companyName', data.name || 'International Business Machines');
    updateElement('#stockSymbol', data.symbol || 'IBM');
    updateElement('#stockSector', data.sector || 'Technology');
    updateElement('#exchangeBadge', data.exchange || 'NYSE');
    updateElement('#stockLogo', data.symbol || 'IBM');
    
    // Handle price info - check if it's from overview API or technical API
    let price, change, changePercent, volume;
    
    if (data.current_price && typeof data.current_price === 'object') {
        // From overview API - nested structure
        price = parseFloat(data.current_price.price) || 288.42;
        change = parseFloat(data.current_price.price_change) || 1.7;
        changePercent = parseFloat(data.current_price.price_change_percent) || 0.59;
        volume = data.current_price.volume || 4372457;
    } else if (data.indicators) {
        // From technical API - direct values in indicators
        price = parseFloat(data.indicators.current_price) || 288.42;
        change = parseFloat(data.indicators.price_change) || 1.7;
        changePercent = parseFloat(data.indicators.price_change_percent) || 0.59;
        volume = data.indicators.volume || 4372457;
    } else {
        // Default values
        price = 288.42;
        change = 1.7;
        changePercent = 0.59;
        volume = 4372457;
    }
    
    console.log(`💰 Price data: $${price}, Change: ${change} (${changePercent}%)`);
    
    updateElement('#currentPrice', `$${price.toFixed(2)}`);
    
    const priceChangeElem = document.getElementById('priceChange');
    if (priceChangeElem) {
        priceChangeElem.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
        priceChangeElem.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
    }
    
    const changePercentElem = document.getElementById('priceChangePercent');
    if (changePercentElem) {
        changePercentElem.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
        changePercentElem.className = `price-change-percent ${changePercent >= 0 ? 'positive' : 'negative'}`;
    }
    
    updateElement('#lastUpdate', new Date().toLocaleTimeString());
    
    // Update key stats with proper formatting
    const stats = data.key_stats || {};
    updateElement('#marketCap', formatMarketCap(stats.market_cap || 268410000000)); // Current IBM market cap
    updateElement('#peRatio', stats.pe_ratio ? stats.pe_ratio.toFixed(2) : '29.06');
    updateElement('#divYield', stats.dividend_yield ? `${(stats.dividend_yield * 100).toFixed(2)}%` : '3.16%');
    updateElement('#range52w', stats['52_week_low'] && stats['52_week_high'] ? 
        `$${stats['52_week_low']} - $${stats['52_week_high']}` : '$233.36 - $295.61');
    updateElement('#volume', formatVolume(volume));
    updateElement('#beta', stats.beta ? stats.beta.toFixed(2) : '0.724');
    
    console.log('✅ Overview updated successfully!');
}

// Update overview with default values for IBM
function updateOverviewWithDefaults(symbol) {
    const defaults = {
        'IBM': {
            name: 'International Business Machines',
            price: 288.42,
            change: 1.7,
            changePercent: 0.59,
            marketCap: 264000000000,
            peRatio: 22.45,
            divYield: 4.52,
            range52w: '$280.15 - $295.67',
            volume: 4372457,
            beta: 0.85
        }
    };
    
    const data = defaults[symbol] || defaults['IBM'];
    
    updateElement('#companyName', data.name);
    updateElement('#currentPrice', `$${data.price.toFixed(2)}`);
    updateElement('#priceChange', `+${data.change.toFixed(2)}`);
    updateElement('#priceChangePercent', `+${data.changePercent.toFixed(2)}%`);
    updateElement('#marketCap', formatMarketCap(data.marketCap));
    updateElement('#peRatio', data.peRatio.toFixed(2));
    updateElement('#divYield', `${data.divYield}%`);
    updateElement('#range52w', data.range52w);
    updateElement('#volume', formatVolume(data.volume));
    updateElement('#beta', data.beta.toFixed(2));
}

// Update technical indicators with enhanced visualization
function updateTechnicalIndicators(indicators) {
    if (!indicators) {
        console.log('No indicators data received');
        return;
    }
    
    console.log('📊 Updating technical indicators:', indicators);
    
    // Update RSI with color coding
    const rsi = indicators.rsi || 50;
    console.log('RSI:', rsi);
    updateElement('#rsiValue', rsi.toFixed(2));
    
    const rsiFill = document.getElementById('rsiFill');
    if (rsiFill) {
        rsiFill.style.width = `${Math.min(rsi, 100)}%`;
        
        // Color based on RSI level
        if (rsi > 70) {
            rsiFill.style.background = 'var(--danger-color)';
            updateElement('#rsiStatus', 'Overbought - Consider Selling');
        } else if (rsi < 30) {
            rsiFill.style.background = 'var(--secondary-color)';
            updateElement('#rsiStatus', 'Oversold - Consider Buying');
        } else {
            rsiFill.style.background = 'var(--primary-color)';
            updateElement('#rsiStatus', 'Neutral - Wait for Signal');
        }
    }
    
    // Update MACD
    const macd = indicators.macd || {};
    console.log('MACD:', macd);
    updateElement('#macdValue', (macd.macd || 0).toFixed(3));
    updateElement('#signalValue', (macd.signal || 0).toFixed(3));
    updateElement('#histogramValue', (macd.histogram || 0).toFixed(3));
    
    // Update Moving Averages
    const sma = indicators.sma || {};
    console.log('SMA:', sma);
    updateElement('#sma20', sma.sma_20 ? `$${sma.sma_20.toFixed(2)}` : 'N/A');
    updateElement('#sma50', sma.sma_50 ? `$${sma.sma_50.toFixed(2)}` : 'N/A');
    updateElement('#sma200', sma.sma_200 ? `$${sma.sma_200.toFixed(2)}` : 'N/A');
    
    // Update Volume Analysis with interpretation
    const volume = indicators.volume_analysis || {};
    console.log('Volume:', volume);
    updateElement('#currentVolume', formatVolume(volume.current || indicators.volume));
    updateElement('#avgVolume', formatVolume(volume.avg_20));
    updateElement('#volumeRatio', `${(volume.ratio || 1).toFixed(2)}x`);
    updateElement('#volumeSignal', volume.interpretation || 'Normal volume');
    
    // Update Bollinger Bands
    const bollinger = indicators.bollinger_bands || {};
    console.log('Bollinger Bands:', bollinger);
    updateElement('#bbUpper', bollinger.upper ? `$${bollinger.upper.toFixed(2)}` : 'N/A');
    updateElement('#bbMiddle', bollinger.middle ? `$${bollinger.middle.toFixed(2)}` : 'N/A');
    updateElement('#bbLower', bollinger.lower ? `$${bollinger.lower.toFixed(2)}` : 'N/A');
    
    // Update Support & Resistance
    const sr = indicators.support_resistance || {};
    console.log('Support/Resistance:', sr);
    if (sr.resistance && sr.resistance.length > 0) {
        updateElement('#resistanceLevels', sr.resistance.map(r => `$${r.toFixed(2)}`).join(' | '));
    } else {
        updateElement('#resistanceLevels', '--');
    }
    if (sr.support && sr.support.length > 0) {
        updateElement('#supportLevels', sr.support.map(s => `$${s.toFixed(2)}`).join(' | '));
    } else {
        updateElement('#supportLevels', '--');
    }
    
    // Update Signal Strength from signal_strength object
    const signalStrength = indicators.signal_strength || {};
    console.log('Signal Strength:', signalStrength);
    if (signalStrength.strength !== undefined) {
        updateElement('#strengthValue', signalStrength.strength.toFixed(1));
        updateElement('#signalAction', signalStrength.action || 'HOLD');
        updateElement('#signalConfidence', `${(signalStrength.confidence || 0).toFixed(1)}%`);
        
        // Update strength bar
        const strengthFill = document.getElementById('strengthFill');
        if (strengthFill) {
            const strength = signalStrength.strength || 0;
            strengthFill.style.width = `${Math.abs(strength)}%`;
            if (strength > 0) {
                strengthFill.style.background = 'var(--secondary-color)';
            } else {
                strengthFill.style.background = 'var(--danger-color)';
            }
        }
        
        // Update signal reasons
        const reasonsList = document.getElementById('signalReasons');
        if (reasonsList && signalStrength.signals) {
            reasonsList.innerHTML = '';
            signalStrength.signals.forEach(signal => {
                const li = document.createElement('li');
                li.textContent = signal;
                reasonsList.appendChild(li);
            });
        }
    }
    
    console.log('✅ Technical indicators updated successfully!');
}

// Update technical indicators with defaults
function updateTechnicalIndicatorsWithDefaults() {
    updateElement('#rsiValue', '52.35');
    updateElement('#rsiStatus', 'Neutral');
    updateElement('#macdValue', '0.125');
    updateElement('#signalValue', '0.089');
    updateElement('#histogramValue', '0.036');
    updateElement('#sma20', '$144.25');
    updateElement('#sma50', '$142.80');
    updateElement('#sma200', '$138.50');
    updateElement('#currentVolume', '3.5M');
    updateElement('#avgVolume', '3.2M');
    updateElement('#volumeRatio', '1.09x');
}

// Update chart with smooth animations
function updateChart(chartData) {
    if (!chartData || !priceChart) return;
    
    // Prepare labels (dates)
    const labels = (chartData.dates || []).slice(-100).map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    // Update chart data
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = (chartData.prices || []).slice(-100);
    
    if (chartData.sma_20) {
        priceChart.data.datasets[1].data = chartData.sma_20.slice(-100);
    }
    
    if (chartData.sma_50) {
        priceChart.data.datasets[2].data = chartData.sma_50.slice(-100);
    }
    
    priceChart.update('active');
}

// Update signals with visual enhancement
function updateSignals(signal) {
    if (!signal) return;
    
    // Update signal action with color coding
    const actionElem = document.getElementById('signalAction');
    if (actionElem) {
        actionElem.textContent = signal.signal || 'HOLD';
        actionElem.className = 'signal-action';
        
        if (signal.signal.includes('BUY')) {
            actionElem.classList.add('buy');
        } else if (signal.signal.includes('SELL')) {
            actionElem.classList.add('sell');
        } else {
            actionElem.classList.add('hold');
        }
    }
    
    // Update confidence with visual indicator
    const confidence = signal.confidence || 0;
    updateElement('#signalConfidence', `${confidence.toFixed(1)}%`);
    
    // Update signal strength meter
    const strength = signal.strength || 0;
    updateElement('#signalStrengthValue', strength.toFixed(1));
    
    const strengthBar = document.getElementById('signalStrengthBar');
    if (strengthBar) {
        strengthBar.style.width = `${Math.abs(strength)}%`;
        strengthBar.style.background = strength >= 0 ? 'var(--gradient-green)' : 'var(--gradient-red)';
    }
    
    // Update reasoning list with icons
    const reasonsList = document.getElementById('signalReasons');
    if (reasonsList && signal.reasoning) {
        reasonsList.innerHTML = '';
        signal.reasoning.slice(0, 5).forEach(reason => {
            const li = document.createElement('li');
            li.className = 'signal-reason';
            
            // Add appropriate icon based on reason content
            let icon = '📊';
            if (reason.includes('RSI')) icon = '📈';
            else if (reason.includes('MACD')) icon = '📉';
            else if (reason.includes('volume')) icon = '📊';
            else if (reason.includes('Support') || reason.includes('Resistance')) icon = '🎯';
            
            li.innerHTML = `<span class="reason-icon">${icon}</span> ${reason}`;
            reasonsList.appendChild(li);
        });
    }
}

// Update signals with defaults
function updateSignalsWithDefaults() {
    updateElement('#signalAction', 'HOLD');
    updateElement('#signalConfidence', '65%');
    updateElement('#signalStrengthValue', '0');
}

// Update AI analysis section
function updateAIAnalysis(data) {
    if (!data) return;
    
    const aiSection = document.getElementById('aiAnalysis');
    if (!aiSection) return;
    
    // Update AI analysis content
    if (data.analysis) {
        updateElement('#aiAnalysisContent', data.analysis);
    }
    
    if (data.market_commentary) {
        updateElement('#aiCommentary', data.market_commentary);
    }
    
    if (data.recommendation) {
        const rec = data.recommendation;
        updateElement('#aiRecommendation', rec.recommendation || 'HOLD');
        updateElement('#aiConfidence', `${rec.confidence || 0}%`);
        
        if (rec.key_factors && rec.key_factors.length > 0) {
            const factorsList = document.getElementById('aiKeyFactors');
            if (factorsList) {
                factorsList.innerHTML = rec.key_factors.map(factor => 
                    `<li>${factor}</li>`
                ).join('');
            }
        }
    }
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
    
    // Show/hide content panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        if (panel.id === `${tabName}-panel`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// Show educational content in modal
async function showEducationalContent(topic) {
    if (!topic) return;
    
    try {
        const response = await fetch(`${API_BASE}/education/${topic}`);
        const data = await response.json();
        
        const modal = document.getElementById('educationModal');
        if (!modal) return;
        
        // Build comprehensive educational content HTML
        let modalContent = `
            <div class="modal-header">
                <h3>${data.title || 'Educational Content'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-content-body">
                
                <div class="content-section">
                    <div class="section-header">
                        <span class="section-icon">📊</span>
                        <h4>What is this indicator?</h4>
                    </div>
                    <p class="section-text">${data.description || ''}</p>
                </div>
        `;
        
        if (data.what_it_is) {
            modalContent += `
                <div class="content-section">
                    <div class="section-header">
                        <span class="section-icon">🔍</span>
                        <h4>Technical Details</h4>
                    </div>
                    <p class="section-text">${data.what_it_is}</p>
                </div>
            `;
        }
        
        if (data.why_important) {
            modalContent += `
                <div class="content-section importance">
                    <div class="section-header">
                        <span class="section-icon">⭐</span>
                        <h4>Why is this important?</h4>
                    </div>
                    <p class="section-text">${data.why_important}</p>
                </div>
            `;
        }
        
        if (data.how_to_read && data.how_to_read.length > 0) {
            modalContent += `
                <div class="content-section">
                    <div class="section-header">
                        <span class="section-icon">📖</span>
                        <h4>How to Read This Indicator</h4>
                    </div>
                    <div class="reading-rules">
                        ${data.how_to_read.map(item => `<div class="rule-item">${item}</div>`).join('')}
                    </div>
                </div>
            `;
        }
        
        if (data.signal_contribution && data.contribution_explanation) {
            modalContent += `
                <div class="content-section signal-weight">
                    <div class="section-header">
                        <span class="section-icon">📈</span>
                        <h4>Signal Contribution</h4>
                        <span class="contribution-badge">${data.signal_contribution}</span>
                    </div>
                    <p class="section-text">${data.contribution_explanation}</p>
                </div>
            `;
        }
        
        if (data.current_analysis) {
            modalContent += `
                <div class="content-section current-analysis">
                    <div class="section-header">
                        <span class="section-icon">🎯</span>
                        <h4>Current Analysis for IBM</h4>
                    </div>
                    <p class="section-text analysis-highlight">${data.current_analysis}</p>
                </div>
            `;
        }
        
        if (data.beginner_tip) {
            modalContent += `
                <div class="content-section beginner-tip">
                    <div class="section-header">
                        <span class="section-icon">💡</span>
                        <h4>Beginner Tip</h4>
                    </div>
                    <p class="section-text tip-highlight">${data.beginner_tip}</p>
                </div>
            `;
        }
        
        if (data.trading_strategy) {
            modalContent += `
                <div class="content-section trading-strategy">
                    <div class="section-header">
                        <span class="section-icon">🎯</span>
                        <h4>Trading Strategy</h4>
                    </div>
                    <p class="section-text">${data.trading_strategy}</p>
                </div>
            `;
        }
        
        modalContent += `</div>`;
        
        modal.innerHTML = modalContent;
        modal.classList.add('active');
        
        // Re-attach close event listener
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        console.log(`✅ Educational content loaded for: ${topic}`);
    } catch (error) {
        console.error('❌ Error loading educational content:', error);
        showError('Failed to load educational content');
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('educationModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Utility function to update element text content safely
function updateElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

// Format market cap for display
function formatMarketCap(value) {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
}

// Format volume for display
function formatVolume(value) {
    if (!value) return 'N/A';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toString();
}

// Show loading overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Show error message
function showError(message) {
    console.error(message);
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Debug function to test API connectivity
async function debugAPIConnection() {
    console.log('🔍 Testing API connection...');
    
    try {
        const response = await fetch(`${API_BASE}/technical/IBM`);
        const data = await response.json();
        
        console.log('✅ API Response received:', data);
        console.log('📊 Indicators data:', data.indicators);
        console.log('💰 Current price:', data.indicators.current_price);
        console.log('📈 RSI:', data.indicators.rsi);
        console.log('📊 MACD:', data.indicators.macd);
        
        // Test updating indicators directly
        console.log('🔄 Testing indicator updates...');
        updateTechnicalIndicators(data.indicators);
        
        return data;
    } catch (error) {
        console.error('❌ API test failed:', error);
        return null;
    }
}

// Update Expert Analysis panel
function updateExpertAnalysis(data) {
    console.log('🤖 Updating expert analysis panel with:', data);
    
    if (!data) return;
    
    // Update computed signal section
    const computedSignal = data.computed_signal || {};
    updateElement('#computedAction', computedSignal.action || 'HOLD');
    updateElement('#computedConfidence', `${computedSignal.confidence || 0}%`);
    updateElement('#computedStrength', computedSignal.strength || '0');
    
    // Update computed action badge styling
    const computedActionElem = document.getElementById('computedAction');
    if (computedActionElem) {
        computedActionElem.className = `action-badge ${(computedSignal.action || 'HOLD').toLowerCase()}`;
    }
    
    // Update strength bar
    const strengthBar = document.getElementById('computedStrengthBar');
    if (strengthBar) {
        const strength = parseFloat(computedSignal.strength || 0);
        strengthBar.style.width = `${Math.min(strength, 100)}%`;
    }
    
    // Update individual indicators breakdown
    updateIndicatorsBreakdown(data.individual_signals || {});
    
    // Update expert analysis section
    const expertAnalysis = data.expert_analysis || {};
    updateElement('#expertAction', expertAnalysis.expert_signal || 'HOLD');
    updateElement('#expertConfidence', `${expertAnalysis.confidence || 0}%`);
    updateElement('#expertAnalysis', expertAnalysis.detailed_analysis || 'Expert analysis not available');
    
    // Update expert action badge styling
    const expertActionElem = document.getElementById('expertAction');
    if (expertActionElem) {
        expertActionElem.className = `action-badge ${(expertAnalysis.expert_signal || 'HOLD').toLowerCase()}`;
    }
    
    // Update agreement status
    const agreement = expertAnalysis.agreement_with_computed || {};
    const agreementElem = document.getElementById('agreementStatus');
    if (agreementElem) {
        const agrees = agreement.agrees;
        agreementElem.textContent = agrees ? '✅ Agrees with Model' : '❌ Disagrees with Model';
        agreementElem.className = `agreement-badge ${agrees ? 'agrees' : 'disagrees'}`;
    }
    
    // Update signal breakdown
    updateExpertBreakdown(expertAnalysis.signal_breakdown || {});
    
    // Update trading strategy
    updateTradingStrategy(expertAnalysis.strategy_recommendation || {});
    
    // Update risk assessment
    updateRiskAssessment(expertAnalysis.risk_assessment || {});
    
    // Update key levels
    updateKeyLevels(expertAnalysis.key_levels || {});
}

function updateIndicatorsBreakdown(individualSignals) {
    const container = document.getElementById('indicatorsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    const indicators = [
        { key: 'rsi', name: 'RSI (14)', weight: '25%' },
        { key: 'macd', name: 'MACD', weight: '20%' },
        { key: 'moving_averages', name: 'Moving Averages', weight: '18%' },
        { key: 'volume', name: 'Volume', weight: '15%' },
        { key: 'bollinger_bands', name: 'Bollinger Bands', weight: '12%' },
        { key: 'support_resistance', name: 'Support/Resistance', weight: '10%' }
    ];
    
    indicators.forEach(indicator => {
        const signalData = individualSignals[indicator.key] || {};
        const signalType = signalData.signal || 'NEUTRAL';
        const contribution = signalData.contribution || 'N/A';
        
        const item = document.createElement('div');
        item.className = 'indicator-item';
        
        let signalClass = 'neutral';
        if (signalType.includes('BUY') || signalType.includes('BULLISH') || signalType.includes('UPTREND')) {
            signalClass = 'bullish';
        } else if (signalType.includes('SELL') || signalType.includes('BEARISH') || signalType.includes('DOWNTREND')) {
            signalClass = 'bearish';
        }
        
        item.innerHTML = `
            <span class="indicator-name">${indicator.name}</span>
            <div class="indicator-details">
                <span class="indicator-signal ${signalClass}">${signalType}</span>
                <span class="indicator-weight">${indicator.weight}</span>
                <small style="color: var(--text-muted);">${contribution}</small>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function updateExpertBreakdown(signalBreakdown) {
    const container = document.getElementById('expertBreakdown');
    if (!container) return;
    
    container.innerHTML = '';
    
    const breakdownItems = [
        { key: 'rsi_analysis', title: 'RSI Analysis', icon: '📊' },
        { key: 'macd_analysis', title: 'MACD Analysis', icon: '📈' },
        { key: 'trend_analysis', title: 'Trend Analysis', icon: '📉' },
        { key: 'volume_analysis', title: 'Volume Analysis', icon: '📊' },
        { key: 'volatility_analysis', title: 'Volatility Analysis', icon: '🌊' },
        { key: 'support_resistance_analysis', title: 'Support/Resistance', icon: '🎯' }
    ];
    
    breakdownItems.forEach(item => {
        const analysis = signalBreakdown[item.key];
        if (analysis) {
            const breakdownDiv = document.createElement('div');
            breakdownDiv.className = 'breakdown-item';
            breakdownDiv.innerHTML = `
                <h5>${item.icon} ${item.title}</h5>
                <p>${analysis}</p>
            `;
            container.appendChild(breakdownDiv);
        }
    });
}

function updateTradingStrategy(strategy) {
    const container = document.getElementById('tradingStrategy');
    if (!container) return;
    
    container.innerHTML = '';
    
    const strategyItems = [
        { key: 'entry_strategy', title: 'Entry Strategy', icon: '🎯' },
        { key: 'position_sizing', title: 'Position Sizing', icon: '⚖️' },
        { key: 'stop_loss', title: 'Stop Loss', icon: '🛑' },
        { key: 'take_profit_targets', title: 'Take Profit', icon: '💰' },
        { key: 'holding_period', title: 'Holding Period', icon: '⏱️' }
    ];
    
    strategyItems.forEach(item => {
        const value = strategy[item.key];
        if (value) {
            const strategyDiv = document.createElement('div');
            strategyDiv.className = 'strategy-item';
            
            let displayValue = value;
            if (Array.isArray(value)) {
                displayValue = value.join(', ');
            }
            
            strategyDiv.innerHTML = `
                <div class="strategy-icon">${item.icon}</div>
                <div class="strategy-text">
                    <h5>${item.title}</h5>
                    <p>${displayValue}</p>
                </div>
            `;
            container.appendChild(strategyDiv);
        }
    });
}

function updateRiskAssessment(risk) {
    const container = document.getElementById('riskAssessment');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Risk level
    if (risk.risk_level) {
        const riskDiv = document.createElement('div');
        riskDiv.className = 'risk-item';
        riskDiv.innerHTML = `
            <div class="risk-icon">⚡</div>
            <div class="risk-text">
                <h5>Risk Level</h5>
                <p><strong>${risk.risk_level}</strong></p>
            </div>
        `;
        container.appendChild(riskDiv);
    }
    
    // Risk mitigation
    if (risk.risk_mitigation) {
        const mitigationDiv = document.createElement('div');
        mitigationDiv.className = 'risk-item';
        mitigationDiv.innerHTML = `
            <div class="risk-icon">🛡️</div>
            <div class="risk-text">
                <h5>Risk Mitigation</h5>
                <p>${risk.risk_mitigation}</p>
            </div>
        `;
        container.appendChild(mitigationDiv);
    }
    
    // Key risks
    if (risk.key_risks && risk.key_risks.length > 0) {
        const risksDiv = document.createElement('div');
        risksDiv.className = 'risk-item';
        risksDiv.innerHTML = `
            <div class="risk-icon">⚠️</div>
            <div class="risk-text">
                <h5>Key Risks</h5>
                <p>${risk.key_risks.join(', ')}</p>
            </div>
        `;
        container.appendChild(risksDiv);
    }
}

function updateKeyLevels(levels) {
    const container = document.getElementById('keyLevels');
    if (!container) return;
    
    container.innerHTML = '';
    
    const levelItems = [
        { key: 'immediate_support', title: 'Support', class: 'support' },
        { key: 'immediate_resistance', title: 'Resistance', class: 'resistance' },
        { key: 'breakout_level', title: 'Breakout', class: 'breakout' },
        { key: 'invalidation_level', title: 'Invalidation', class: 'invalidation' }
    ];
    
    levelItems.forEach(item => {
        const value = levels[item.key];
        if (value) {
            const levelDiv = document.createElement('div');
            levelDiv.className = `level-item ${item.class}`;
            levelDiv.innerHTML = `
                <span class="level-label">${item.title}</span>
                <span class="level-value">${value}</span>
            `;
            container.appendChild(levelDiv);
        }
    });
}

function updateExpertAnalysisWithDefaults() {
    console.log('⚠️ Using default expert analysis data');
    
    // Mock data similar to the static data we have
    const mockData = {
        computed_signal: {
            action: 'WEAK_BUY',
            confidence: 23,
            strength: 37.5
        },
        individual_signals: {
            rsi: { signal: 'OVERBOUGHT', weight: '25%', contribution: '81.79' },
            macd: { signal: 'BULLISH', weight: '20%', contribution: '2.101' },
            moving_averages: { signal: 'UPTREND', weight: '18%', contribution: '+6.5%' },
            volume: { signal: 'NEUTRAL', weight: '15%', contribution: '0.81x' },
            bollinger_bands: { signal: 'OVERBOUGHT', weight: '12%', contribution: '0.885' },
            support_resistance: { signal: 'AT_RESISTANCE', weight: '10%', contribution: '$292' }
        },
        expert_analysis: {
            expert_signal: 'BUY',
            confidence: 78,
            detailed_analysis: 'Based on comprehensive technical analysis, IBM shows strong momentum with bullish indicators. While RSI indicates overbought conditions, the overall trend remains intact with strong support levels.',
            agreement_with_computed: { agrees: false, reasoning: 'Expert sees stronger bullish signals than the mathematical model due to trend strength and momentum confirmation.' },
            signal_breakdown: {
                rsi_analysis: 'RSI at 81.79 indicates overbought territory but can remain elevated in strong trends.',
                macd_analysis: 'MACD crossover confirms bullish momentum with positive histogram.',
                trend_analysis: 'Price above all major moving averages confirms strong uptrend.',
                volume_analysis: 'Volume at 0.81x average shows controlled buying, not panic.',
                volatility_analysis: 'Price near upper Bollinger Band suggests potential consolidation.',
                support_resistance_analysis: 'Strong support at $286 with resistance cluster around $292.'
            },
            strategy_recommendation: {
                entry_strategy: 'Buy on pullback to $286 support or breakout above $292',
                position_sizing: 'Standard 2-3% portfolio allocation',
                stop_loss: '$285.50 below key support',
                take_profit_targets: ['$295 (resistance)', '$302 (measured move)'],
                holding_period: '2-4 weeks for swing trade'
            },
            risk_assessment: {
                risk_level: 'MEDIUM',
                key_risks: ['Overbought RSI', 'Resistance levels', 'Lower volume'],
                risk_mitigation: 'Use tight stop loss and scale into position on pullbacks'
            },
            key_levels: {
                immediate_support: '$286.05',
                immediate_resistance: '$292.05',
                breakout_level: '$295.67',
                invalidation_level: '$285.15'
            }
        }
    };
    
    updateExpertAnalysis(mockData);
}

// Expose debug functions globally
window.debugAPI = debugAPIConnection;
window.loadData = () => loadStockData(currentSymbol);
window.forceRefresh = () => {
    console.log('🔄 Force refreshing all data...');
    loadStockData(currentSymbol);
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
