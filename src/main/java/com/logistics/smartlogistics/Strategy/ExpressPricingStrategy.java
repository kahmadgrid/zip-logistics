package com.logistics.smartlogistics.Strategy;

import com.logistics.smartlogistics.entity.GeoPoint;
import com.logistics.smartlogistics.entity.RouteDetails;
import com.logistics.smartlogistics.service.DistanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExpressPricingStrategy implements PricingStrategy {

    @Autowired
    private DistanceService distanceService;

    @Override
    public double calculatePrice(RouteDetails route) {
        GeoPoint start = route.getPoints().get(0);
        GeoPoint end = route.getPoints().get(route.getPoints().size() - 1);

        double distance = distanceService.calculateDistance(
                start.getLat(), start.getLng(),
                end.getLat(), end.getLng()
        );

        return 50 + (distance * 15);
    }
}
