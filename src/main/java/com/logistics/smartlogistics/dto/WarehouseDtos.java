package com.logistics.smartlogistics.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class WarehouseDtos {

    public record CreateWarehouseRequest(
            @NotBlank String code,
            @NotBlank String name,
            String city,
            @NotBlank String zone,
            @NotNull Double latitude,
            @NotNull Double longitude,
            @NotNull @Min(1) Integer capacity
    ) {
    }
}
