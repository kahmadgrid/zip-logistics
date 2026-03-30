package com.logistics.smartlogistics.dto;

import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.DeliveryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class BookingDtos {
    public record BookingRequest(
            DeliveryType deliveryType,
            String pickupAddress,
            String dropAddress,
            String pickupZone,
            String dropZone,
            String receiverName,
            String receiverMobile,
            double weightKg,
            double lengthCm,
            double breadthCm,
            double heightCm,
            Double pickupLatitude,   // ← add this (nullable)
            Double pickupLongitude   // ← add this (nullable)
    ) {}

    public record BookingResponse(
            Long id,
            DeliveryType deliveryType,
            DeliveryStatus status,
            BigDecimal estimatedPrice
    ) {
    }
}
