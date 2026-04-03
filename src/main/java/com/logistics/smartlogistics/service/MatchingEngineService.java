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

        return candidates.stream()

                // ✅ ONLY ELIGIBLE VEHICLES
                .filter(driver ->
                        driver.getVehicleType().canCarry(
                                order.getWeightKg(),
                                order.getLengthCm(),
                                order.getBreadthCm(),
                                order.getHeightCm()
                        )
                )

                // ✅ SORT BEST DRIVER
                .sorted(Comparator.comparingDouble(d -> score(order, d)))

                .toList();
    }

    private double score(DeliveryOrder order, DriverProfile driver) {

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
