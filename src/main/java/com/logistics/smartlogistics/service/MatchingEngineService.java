package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.repository.DriverProfileRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchingEngineService {

    private final DriverProfileRepository driverProfileRepository;

    public MatchingEngineService(DriverProfileRepository driverProfileRepository) {
        this.driverProfileRepository = driverProfileRepository;
    }

    public List<DriverProfile> rankAvailableDrivers(DeliveryOrder order) {
        // In Zip-Logistics, drivers are restricted to the pickup zone.
        // For cross-zone journeys, the same driver can still handle the order after warehouse transfer.
        String zone = order.getPickupZone();

        List<DriverProfile> candidates = driverProfileRepository
                .findByCurrentZoneAndAvailability(zone, com.logistics.smartlogistics.enums.DriverAvailability.ONLINE);

        if (candidates.isEmpty()) {
            return List.of();
        }

        return candidates.stream()
                .sorted(Comparator.comparingDouble(d -> score(order, d)))
                .collect(Collectors.toList());
    }

    private double score(DeliveryOrder order, DriverProfile driver) {
        // Placeholder heuristic: prefer closer drivers; slightly prefer higher rating.
        double distanceKm = DistanceUtils.distanceKm(order.getPickupLatitude(), order.getPickupLongitude(),
                driver.getCurrentLatitude(), driver.getCurrentLongitude());
        return distanceKm / Math.max(0.1, driver.getRating());
    }
}
