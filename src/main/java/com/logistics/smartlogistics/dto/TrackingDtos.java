package com.logistics.smartlogistics.dto;

import com.logistics.smartlogistics.enums.DeliveryStatus;
import jakarta.validation.constraints.NotNull;

public class TrackingDtos {
    public record LocationUpdateRequest(
            @NotNull Double latitude,
            @NotNull Double longitude,
            @NotNull DeliveryStatus status
    ) {
    }

    public record TrackingUpdate(
            Long orderId,
            Double latitude,
            Double longitude,
            DeliveryStatus status
    ) {
    }
}
