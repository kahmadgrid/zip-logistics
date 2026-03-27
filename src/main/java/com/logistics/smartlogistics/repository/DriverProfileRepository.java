package com.logistics.smartlogistics.repository;

import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.enums.DriverAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DriverProfileRepository extends JpaRepository<DriverProfile, Long> {
    Optional<DriverProfile> findByUserId(Long userId);

    List<DriverProfile> findByCurrentZoneAndAvailability(String currentZone, DriverAvailability availability);
}
