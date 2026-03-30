package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.RouteResponse;
import com.logistics.smartlogistics.enums.DeliveryType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

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
    private final String API_KEY = "${DIRECTION_API_KEY}";
    private final WebClient webClient = WebClient.create();

    public double calculateDistance(
            double startLat, double startLng,
            double endLat, double endLng
    ) {


        String url = "https://api.openrouteservice.org/v2/directions/driving-car";

        Map<String, Object> body = Map.of(
                "coordinates", List.of(
                        List.of(startLng, startLat),
                        List.of(endLng, endLat)
                )
        );

        RouteResponse response = webClient.post()
                .uri(url)
                .header("Authorization", API_KEY)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(RouteResponse.class)
                .block();

        double distanceMeters =
                response.getRoutes().get(0).getSummary().getDistance();
        System.out.println("Time ETA: "+ response.getRoutes().get(0).getSummary().getDuration()/60);
        return distanceMeters / 1000.0; // ✅ convert to km
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