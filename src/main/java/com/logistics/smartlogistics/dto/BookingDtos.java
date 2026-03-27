package com.logistics.smartlogistics.dto;

import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.DeliveryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class BookingDtos {
    public record BookingRequest(
            @NotNull DeliveryType deliveryType,
            @NotBlank String pickupAddress,
            @NotBlank String dropAddress,
            @NotBlank String pickupZone,
            @NotBlank String dropZone,
            @NotBlank String receiverName,
            @NotBlank String receiverMobile,
            @NotNull Double weightKg,
            @NotNull Double lengthCm,
            @NotNull Double breadthCm,
            @NotNull Double heightCm
    ) {
    }

    public record BookingResponse(
            Long id,
            DeliveryType deliveryType,
            DeliveryStatus status,
            BigDecimal estimatedPrice
    ) {
    }
}
