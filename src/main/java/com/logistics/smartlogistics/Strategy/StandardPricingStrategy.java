package com.logistics.smartlogistics.Strategy;

import com.logistics.smartlogistics.entity.GeoPoint;
import com.logistics.smartlogistics.entity.RouteDetails;
import com.logistics.smartlogistics.service.DistanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StandardPricingStrategy implements PricingStrategy {

    @Autowired
    private DistanceService distanceService;

    @Override
    public double calculatePrice(RouteDetails route) {

        double totalDistance = 0;

        for (int i = 0; i < route.getPoints().size() - 1; i++) {
            GeoPoint p1 = route.getPoints().get(i);
            GeoPoint p2 = route.getPoints().get(i + 1);

            totalDistance += distanceService.calculateDistance(
                    p1.getLat(), p1.getLng(),
                    p2.getLat(), p2.getLng()
            );
        }

        double baseFare = 40;
        double perKmRate = 8;

        double handlingCharges = 30; // warehouse cost

        return baseFare + (totalDistance * perKmRate) + handlingCharges;
    }
}
