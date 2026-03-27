package com.logistics.smartlogistics.dto;


import lombok.Data;

@Data
public class PriceEstimateRequest {
    private double pickupLat;
    private double pickupLng;
    private double dropLat;
    private double dropLng;
    private String deliveryType; // EXPRESS / STANDARD
}
