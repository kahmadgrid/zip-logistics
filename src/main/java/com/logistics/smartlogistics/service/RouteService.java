package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.entity.GeoPoint;
import com.logistics.smartlogistics.entity.RouteDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

    public RouteDetails buildStandardRoute(GeoPoint pickup, GeoPoint drop) {

        // Example: hardcoded warehouses (later dynamic)
        GeoPoint warehouse1 = new GeoPoint(12.95, 77.60);
        GeoPoint warehouse2 = new GeoPoint(12.98, 77.65);

        return RouteDetails.builder()
                .points(List.of(pickup, warehouse1, warehouse2, drop))
                .build();
    }

    public RouteDetails buildExpressRoute(GeoPoint pickup, GeoPoint drop) {
        return RouteDetails.builder()
                .points(List.of(pickup, drop))
                .build();
    }
}
