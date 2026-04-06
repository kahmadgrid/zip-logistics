package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.RouteResponse;
import com.logistics.smartlogistics.enums.DeliveryType;
import com.logistics.smartlogistics.enums.VehicleType;
import com.logistics.smartlogistics.utils.VehicleUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
public class PricingEngineService {

    private final WeatherService weatherService;

    public PricingEngineService(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

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
     * ✅ MAIN METHOD (vehicle-aware pricing)
=======
     * MAIN METHOD - WITH WEATHER INTEGRATION
>>>>>>> 395ca50 (weather condition integrated for price consideration)
     */
    public BigDecimal estimatePrice(
            DeliveryType deliveryType,
            double weightKg,
            double lengthCm,
            double breadthCm,
            double heightCm,
            double distanceKm,
            VehicleType vehicleType,
            double pickupLatitude,
            double pickupLongitude
    ) {

        // 📦 1. Volumetric weight
        double volumetricKg = (lengthCm * breadthCm * heightCm) / 5000.0;

        // ⚖️ 2. Chargeable weight
        double chargeableKg = Math.max(weightKg, volumetricKg);

        // 💰 3. Pricing components
        double base       = deliveryType == DeliveryType.EXPRESS ? BASE_EXPRESS : BASE_STANDARD;
        double ratePerKg  = deliveryType == DeliveryType.EXPRESS ? RATE_EXPRESS : RATE_STANDARD;
        double perKmRate  = deliveryType == DeliveryType.EXPRESS ? PER_KM_EXPRESS : PER_KM_STANDARD;

        double weightCharge = chargeableKg * ratePerKg;

        // 🚚 Vehicle-based extra pricing
        double extraPerKm = getVehicleExtraPerKm(vehicleType);

        double distanceCharge = distanceKm * (perKmRate + extraPerKm);

        // 🌤️ 4. Weather surcharge
        WeatherService.WeatherInfo weather = weatherService.getWeather(pickupLatitude, pickupLongitude);
        BigDecimal weatherSurcharge = weatherService.calculateWeatherSurcharge(weather);
        
        System.out.println("Weather conditions: " + weather.toString());
        System.out.println("Weather surcharge applied: ₹" + weatherSurcharge);

        // 🧾 5. Total
        double subtotal = base + weightCharge + distanceCharge + weatherSurcharge.doubleValue();
        double gst      = subtotal * GST_RATE;
        double total    = subtotal + gst;

        System.out.println("Final pricing breakdown - Base: " + base + ", Weight: " + weightCharge + 
                          ", Distance: " + distanceCharge + ", Weather: " + weatherSurcharge + 
                          ", GST: " + gst + ", Total: " + total);

        return BigDecimal.valueOf(total)
                .setScale(2, RoundingMode.HALF_UP);
    }

    // 🌍 Distance API
    @Value("${direction.api.key}")
    private String API_KEY;

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

        System.out.println("ETA (min): " +
                response.getRoutes().get(0).getSummary().getDuration() / 60);

        return distanceMeters / 1000.0;
    }

    /**
     * 🔁 Fallback method (no dimensions)
     */
    public BigDecimal estimatePrice(
            DeliveryType deliveryType,
            double distanceKm,
            double weightKg
    ) {

        // ✅ FIX: give safe default dimensions instead of 0
        VehicleType vehicle = VehicleUtil.suggestVehicle(
                weightKg,
                10, 10, 10   // instead of 0,0,0 (more realistic)
        );

        return estimatePrice(
                deliveryType,
                weightKg,
                10.0, 10.0, 10.0,
                distanceKm,
                vehicle,
                12.9716,
                77.5946
        );
    }

    /**
     * 🚚 Vehicle pricing logic
     */
    private double getVehicleExtraPerKm(VehicleType vehicleType) {
        return switch (vehicleType) {
            case BIKE -> 0;
            case SCOOTER -> 2;
            case MINI_TRUCK -> 20;
            case TRUCK -> 50;
        };
        // Use default coordinates (Bangalore) for weather fallback
        return estimatePrice(deliveryType, weightKg, 0.0, 0.0, 0.0, distanceKm, 12.9716, 77.5946);
    }
}