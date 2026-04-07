package com.logistics.smartlogistics.dto;

import com.logistics.smartlogistics.enums.VehicleType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PricingResponse {

    private double distanceKm;
    private BigDecimal price;
    private String weatherCondition;
    private String weatherDescription;
    private BigDecimal weatherSurcharge;
    private VehicleType vehicle;
}