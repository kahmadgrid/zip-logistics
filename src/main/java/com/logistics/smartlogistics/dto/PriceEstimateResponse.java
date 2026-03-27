package com.logistics.smartlogistics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PriceEstimateResponse {
    private double distance;
    private double estimatedPrice;
}
