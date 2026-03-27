package com.logistics.smartlogistics.dto;

import com.logistics.smartlogistics.enums.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

public class BookingDtos {

    // 📥 REQUEST DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingRequest {

        @NotNull
        private DeliveryType deliveryType;

        @NotBlank
        private String pickupAddress;

        @NotBlank
        private String dropAddress;

        @NotBlank
        private String pickupZone;

        @NotBlank
        private String dropZone;

        private boolean priority;

        // 👤 Receiver Details
        @NotBlank
        private String receiverName;

        @NotBlank
        private String receiverMobile;

        // 📦 Parcel Details
        @NotNull
        private Double weight; // in kg

        @NotBlank
        private String dimensions; // "10x5x3 cm"

        // 🔥 Optional fields (very useful)
        private boolean fragile;
        private String instructions; // "Handle with care"

        public boolean getPriority() {
            return priority;
        }
    }

    // 📤 RESPONSE DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {

        private Long id;

        private DeliveryType deliveryType;

        private DeliveryStatus status;

        private BigDecimal estimatedPrice;

        // 📍 Coordinates
        private Double pickupLat;
        private Double pickupLng;

        private Double dropLat;
        private Double dropLng;

        public BookingResponse(Long id, DeliveryType deliveryType, DeliveryStatus status, BigDecimal estimatedPrice) {
        }
    }
}