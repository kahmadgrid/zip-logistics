package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.PricingRequest;
import com.logistics.smartlogistics.dto.PricingResponse;
import com.logistics.smartlogistics.service.GeocodingService;
import com.logistics.smartlogistics.service.PricingEngineService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
@CrossOrigin(origins = "*")
public class PricingController {

    private final PricingEngineService pricingService;
    private final GeocodingService geocodingService;

    public PricingController(PricingEngineService pricingService,
                             GeocodingService geocodingService) {
        this.pricingService = pricingService;
        this.geocodingService = geocodingService;
    }

    @PostMapping("/estimate")
    public PricingResponse estimate(@Valid @RequestBody PricingRequest req) {

        // 🔹 1. Resolve pickup coordinates
        double pickupLat;
        double pickupLng;

        if (req.getPickupLat() != null && req.getPickupLng() != null) {
            pickupLat = req.getPickupLat();
            pickupLng = req.getPickupLng();
        } else {
            var pickup = geocodingService.geocode(req.getPickupAddress());
            pickupLat = pickup.latitude();
            pickupLng = pickup.longitude();
        }

        // 🔹 2. Resolve drop coordinates
        double dropLat;
        double dropLng;

        if (req.getDropLat() != null && req.getDropLng() != null) {
            dropLat = req.getDropLat();
            dropLng = req.getDropLng();
        } else {
            var drop = geocodingService.geocode(req.getDropAddress());
            dropLat = drop.latitude();
            dropLng = drop.longitude();
        }

        // 🔹 3. Calculate distance
        double distanceKm = pricingService.calculateDistance(
                pickupLat, pickupLng,
                dropLat, dropLng
        );

        // 🔹 4. Calculate price
        var price = pricingService.estimatePrice(
                req.getDeliveryType(),
                req.getWeightKg(),
                req.getLengthCm(),
                req.getBreadthCm(),
                req.getHeightCm(),
                distanceKm
        );

        // 🔹 5. Return structured response
        return PricingResponse.builder()
                .distanceKm(distanceKm)
                .price(price)
                .build();
    }
}