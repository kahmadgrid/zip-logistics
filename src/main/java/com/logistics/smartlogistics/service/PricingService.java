package com.logistics.smartlogistics.service;

import org.springframework.stereotype.Service;

@Service
public class PricingService {

    public double calculatePrice(double distance, String deliveryType) {

        double baseFare = 50;

        double perKmRate = switch (deliveryType) {
            case "EXPRESS" -> 15;
            case "STANDARD" -> 10;
            default -> 12;
        };

        return baseFare + (distance * perKmRate);
    }
}