package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.PricingRequest;
import com.logistics.smartlogistics.dto.PricingResponse;
import com.logistics.smartlogistics.service.GeocodingService;
import com.logistics.smartlogistics.service.PricingEngineService;
import com.logistics.smartlogistics.service.WeatherService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.logistics.smartlogistics.enums.VehicleType;
import com.logistics.smartlogistics.utils.VehicleUtil;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/pricing")
@CrossOrigin(origins = "*")
public class PricingController {

    private final PricingEngineService pricingService;
    private final GeocodingService geocodingService;
    private final WeatherService weatherService;

    public PricingController(PricingEngineService pricingService,
                             GeocodingService geocodingService,
                             WeatherService weatherService) {
        this.pricingService = pricingService;
        this.geocodingService = geocodingService;
        this.weatherService = weatherService;
    }

    @PostMapping("/estimate")
    public PricingResponse estimate(@Valid @RequestBody PricingRequest req) {

        // 🔹 1. Resolve pickup coordinates
        double pickupLat;
        double pickupLng;

//
        var pickup = geocodingService.geocode(req.getPickupAddress());
        pickupLat = pickup.latitude();
        pickupLng = pickup.longitude();
//

        // 🔹 2. Resolve drop coordinates
        double dropLat;
        double dropLng;


        var drop = geocodingService.geocode(req.getDropAddress());
        dropLat = drop.latitude();
        dropLng = drop.longitude();
//        }

        // 🔹 3. Calculate distance
        double distanceKm = pricingService.calculateDistance(
                pickupLat, pickupLng,
                dropLat, dropLng
        );

        // 🔹 4. Calculate price with weather
        // Get weather info for display
        WeatherService.WeatherInfo weather = weatherService.getWeather(pickupLat, pickupLng);
        BigDecimal weatherSurcharge = weatherService.calculateWeatherSurcharge(weather);

        // 🔹 4. Determine vehicle (IMPORTANT FIX)
        VehicleType vehicle = VehicleUtil.suggestVehicle(
                req.getWeightKg(),
                req.getLengthCm(),
                req.getBreadthCm(),
                req.getHeightCm()
        );

// 🔹 5. Calculate price
        var price = pricingService.estimatePrice(
                req.getDeliveryType(),
                req.getWeightKg(),
                req.getLengthCm(),
                req.getBreadthCm(),
                req.getHeightCm(),
                distanceKm,
                vehicle,   // ✅ FIXED
                pickupLat,
                pickupLng
        );

        // 🔹 5. Return structured response with weather info
        return PricingResponse.builder()
                .distanceKm(distanceKm)
                .price(price)
                .weatherCondition(weather.getCondition())
                .weatherDescription(weather.getDescription())
                .weatherSurcharge(weatherSurcharge)
                .vehicle(vehicle)
                .build();
    }
}