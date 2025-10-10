package com.tradesignal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.MediaType;
import java.util.Arrays;

/**
 * Main Spring Boot Application for Trading Analytics Platform
 * This application serves as a web framework layer that delegates data analysis to Python backend
 */
@SpringBootApplication
public class TradingPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(TradingPlatformApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        RestTemplate restTemplate = builder.build();
        
        // Configure JSON message converter to handle Python API responses
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setSupportedMediaTypes(Arrays.asList(
            MediaType.APPLICATION_JSON, 
            MediaType.APPLICATION_OCTET_STREAM,
            MediaType.TEXT_PLAIN
        ));
        
        restTemplate.getMessageConverters().add(0, converter);
        return restTemplate;
    }
    
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }
}
