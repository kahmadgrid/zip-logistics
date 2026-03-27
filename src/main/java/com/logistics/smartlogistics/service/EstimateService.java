package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EstimateService {

    private final DistanceService distanceService;
    private final PricingService pricingService;

    public PriceEstimateResponse getEstimate(PriceEstimateRequest request) {

        double distance = distanceService.calculateDistance(
                request.getPickupLat(),
                request.getPickupLng(),
                request.getDropLat(),
                request.getDropLng()
        );

        double price = pricingService.calculatePrice(distance, request.getDeliveryType());

        return PriceEstimateResponse.builder()
                .distance(distance)
                .estimatedPrice(price)
                .build();
    }
}
