package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.BookingDtos;
import com.logistics.smartlogistics.enums.DeliveryType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PricingEngineService {

    public BigDecimal estimatePrice(DeliveryType deliveryType, double distanceKm, double weightKg) {
        // Phase-1 placeholder for dynamic pricing (traffic/weather/tolls).
        double trafficFactor = 1.0 + ((int) distanceKm % 10) / 100.0; // 1.00 - 1.09
        double weatherFactor = 1.0 + (((int) weightKg) % 7) / 100.0;  // 1.00 - 1.06
        double expressMultiplier = deliveryType == DeliveryType.EXPRESS ? 1.25 : 0.95;

        double basePerKm = deliveryType == DeliveryType.EXPRESS ? 3.0 : 2.0;
        double weightSurcharge = Math.min(50.0, weightKg * 0.08);

        double price = (basePerKm * distanceKm) * trafficFactor * weatherFactor + weightSurcharge;
        return BigDecimal.valueOf(Math.max(10.0, price)).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
