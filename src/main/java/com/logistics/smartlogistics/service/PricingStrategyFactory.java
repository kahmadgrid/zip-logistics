package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.Strategy.ExpressPricingStrategy;
import com.logistics.smartlogistics.Strategy.PricingStrategy;
import com.logistics.smartlogistics.Strategy.StandardPricingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PricingStrategyFactory {

    @Autowired
    private ExpressPricingStrategy express;

    @Autowired
    private StandardPricingStrategy standard;

    public PricingStrategy getStrategy(String type) {
        return switch (type) {
            case "EXPRESS" -> express;
            case "STANDARD" -> standard;
            default -> throw new IllegalArgumentException("Invalid type");
        };
    }
}
