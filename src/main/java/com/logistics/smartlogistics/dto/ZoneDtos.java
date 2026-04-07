package com.logistics.smartlogistics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ZoneDtos {

    public record CreateZoneRequest(
            @NotBlank String zoneCode,
            @NotBlank String zoneName,
            @NotNull Double centerLatitude,
            @NotNull Double centerLongitude,
            @NotNull Double radiusKm
    ) {
    }

    public record ZoneResponse(
            Long id,
            String zoneCode,
            String zoneName,
            Double centerLatitude,
            Double centerLongitude,
            Double radiusKm,
            Boolean active
    ) {
    }
}
