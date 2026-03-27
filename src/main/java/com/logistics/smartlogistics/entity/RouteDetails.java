package com.logistics.smartlogistics.entity;

import com.logistics.smartlogistics.entity.GeoPoint;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RouteDetails {
    private List<GeoPoint> points; // A → W1 → W2 → B
}

