package com.logistics.smartlogistics.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GeoPoint {
    private double lat;
    private double lng;
}
