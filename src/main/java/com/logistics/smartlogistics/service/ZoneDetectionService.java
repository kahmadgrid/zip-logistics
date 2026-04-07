package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.entity.Zone;
import com.logistics.smartlogistics.repository.ZoneRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ZoneDetectionService {
    
    private final ZoneRepository zoneRepository;
    
    public ZoneDetectionService(ZoneRepository zoneRepository) {
        this.zoneRepository = zoneRepository;
    }
    
    public String detectZoneFromCoordinates(double latitude, double longitude) {
        // Find active zones within whose radius the coordinates fall
        List<Zone> zones = zoneRepository.findByActiveTrue();
        if (zones.isEmpty()) {
            return "NOT_SERVICEABLE"; // Default fallback
        }
        
        // Check if coordinates are within any zone radius
        for (Zone zone : zones) {
            double distance = calculateDistance(latitude, longitude, zone.getCenterLatitude(), zone.getCenterLongitude());
            if (distance <= zone.getRadiusKm()) {
                return zone.getZoneCode(); // Return zone code if within radius
            }
        }
        
        // If not within any radius, return NOT_SERVICEABLE
        return "NOT_SERVICEABLE";
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula for distance calculation
        double R = 6371; // Earth's radius in kilometers
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
}
