package com.stock.stock_game.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import com.stock.stock_game.service.FinnhubClient;
import com.stock.stock_game.service.SimulatedPriceProvider;
import com.stock.stock_game.service.StockPriceProvider;

@Configuration
public class StockPriceConfig {

    private static final Logger log =
            LoggerFactory.getLogger(StockPriceConfig.class);

    @Bean
    public StockPriceProvider stockPriceProvider(
            @Value("${stock.api.key:}") String apiKey,
            @Value("${stock.api.url}") String apiUrl
    ) {
        StockPriceProvider provider =
                StringUtils.hasText(apiKey)
                        ? new FinnhubClient(apiKey, apiUrl)
                        : new SimulatedPriceProvider();

        log.info("Stock prices: {}", provider.describe());

        return provider;
    }
}
