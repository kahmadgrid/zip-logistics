package com.logistics.smartlogistics.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PricingResponse {

    private double distanceKm;
    private BigDecimal price;
}