package com.logistics.smartlogistics.dto;

import com.logistics.smartlogistics.enums.DeliveryType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PricingRequest {

    @NotNull
    private DeliveryType deliveryType;

    @NotNull
    private Double weightKg;

    @NotNull
    private Double lengthCm;

    @NotNull
    private Double breadthCm;

    @NotNull
    private Double heightCm;

    // Optional (frontend GPS)
    private Double pickupLat;
    private Double pickupLng;
    private Double dropLat;
    private Double dropLng;

    // Optional (fallback)
    private String pickupAddress;
    private String dropAddress;
}