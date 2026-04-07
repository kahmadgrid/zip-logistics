package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.enums.DriverAvailability;
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

        String zone = order.getPickupZone();

        List<DriverProfile> candidates = driverProfileRepository
                .findByCurrentZoneAndAvailability(
                        zone,
                        DriverAvailability.ONLINE
                );

        if (candidates.isEmpty()) return List.of();

        //  Step 1: Exact vehicle match (BEST CASE)
        List<DriverProfile> exactMatch = candidates.stream()
                .filter(driver ->
                        driver.getVehicleType() == order.getSuggestedVehicle()
                )
                .sorted(Comparator.comparingDouble(d -> score(order, d)))
                .collect(Collectors.toList());

        if (!exactMatch.isEmpty()) {
            System.out.println("exact matches"+exactMatch);
            return exactMatch;
        }

        // ✅ Step 2: Fallback → bigger vehicles
        return candidates.stream()
                .filter(driver ->
                        driver.getVehicleType().ordinal() > order.getSuggestedVehicle().ordinal()
                )
                .sorted(Comparator.comparingDouble(d -> score(order, d)))
                .peek(driver -> System.out.println(
                        "Driver: " + driver.getId() +
                                " | Vehicle: " + driver.getVehicleType() +
                                " | Score: " + score(order, driver)
                ))
                .collect(Collectors.toList());
    }

    private double score(DeliveryOrder order, DriverProfile driver) {
        //distance between driver and pickup location
        //Smaller distance → better (lower score)
        double distanceKm = DistanceUtils.distanceKm(
                order.getPickupLatitude(), order.getPickupLongitude(),
                driver.getCurrentLatitude(), driver.getCurrentLongitude()
        );

        double ratingFactor = 1 / Math.max(0.1, driver.getRating());

        double vehiclePenalty = driver.getVehicleType().ordinal()
                - order.getSuggestedVehicle().ordinal();

        return distanceKm + (ratingFactor * 2) + (vehiclePenalty * 1.5);
    }
}
