package com.logistics.smartlogistics.dto;

import com.logistics.smartlogistics.enums.DriverAvailability;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class DriverDtos {

    public record CreateOrUpdateDriverProfileRequest(
            @NotBlank String vehicleType,
            String vehicleNumber,
            @NotBlank String currentZone,
            @NotNull DriverAvailability availability,
            @PositiveOrZero Double currentLatitude,
            @PositiveOrZero Double currentLongitude
    ) {
    }
}

