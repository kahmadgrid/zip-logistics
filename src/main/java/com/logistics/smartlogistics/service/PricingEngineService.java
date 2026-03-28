package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.enums.DeliveryType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PricingEngineService {

    // Base prices
    private static final double BASE_STANDARD = 49.0;
    private static final double BASE_EXPRESS  = 99.0;

    // Rate per kg
    private static final double RATE_STANDARD = 12.0;
    private static final double RATE_EXPRESS  = 20.0;

    // Distance rate per km
    private static final double PER_KM_STANDARD = 5.0;
    private static final double PER_KM_EXPRESS  = 8.0;

    // GST
    private static final double GST_RATE = 0.18;

    /**
     * MAIN METHOD
     */
    public BigDecimal estimatePrice(
            DeliveryType deliveryType,
            double weightKg,
            double lengthCm,
            double breadthCm,
            double heightCm,
            double distanceKm
    ) {

        // 📦 1. Volumetric weight
        double volumetricKg = (lengthCm * breadthCm * heightCm) / 5000.0;

        // ⚖️ 2. Chargeable weight
        double chargeableKg = Math.max(weightKg, volumetricKg);

        // 💰 3. Pricing components
        double base       = deliveryType == DeliveryType.EXPRESS ? BASE_EXPRESS : BASE_STANDARD;
        double ratePerKg  = deliveryType == DeliveryType.EXPRESS ? RATE_EXPRESS : RATE_STANDARD;
        double perKmRate  = deliveryType == DeliveryType.EXPRESS ? PER_KM_EXPRESS : PER_KM_STANDARD;

        double weightCharge   = chargeableKg * ratePerKg;
        double distanceCharge = distanceKm * perKmRate;

        // 🧾 4. Total
        double subtotal = base + weightCharge + distanceCharge;
        double gst      = subtotal * GST_RATE;
        double total    = subtotal + gst;

        return BigDecimal.valueOf(total)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 🌍 Distance calculation (Haversine formula)
     */
    public double calculateDistance(
            double lat1, double lon1,
            double lat2, double lon2
    ) {
        final int R = 6371; // Earth radius in KM

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * 🔁 Optional fallback (if dimensions not provided)
     */
    public BigDecimal estimatePrice(
            DeliveryType deliveryType,
            double distanceKm,
            double weightKg
    ) {
        return estimatePrice(deliveryType, weightKg, 0, 0, 0, distanceKm);
    }
}