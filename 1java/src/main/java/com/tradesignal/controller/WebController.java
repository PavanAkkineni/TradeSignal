package com.tradesignal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import lombok.extern.slf4j.Slf4j;

/**
 * Web Controller for serving HTML pages
 */
@Controller
@Slf4j
public class WebController {
    
    /**
     * Serve the main dashboard page
     */
    @GetMapping("/")
    public String index() {
        log.info("Serving main dashboard page");
        return "index";
    }
    
    /**
     * Serve the trading dashboard
     */
    @GetMapping("/dashboard")
    public String dashboard() {
        log.info("Serving trading dashboard");
        return "index";
    }
}
