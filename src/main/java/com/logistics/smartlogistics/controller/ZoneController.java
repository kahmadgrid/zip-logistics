package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.service.GeocodingService;
import com.logistics.smartlogistics.service.ZoneDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {
    
    private final ZoneDetectionService zoneDetectionService;
    private final GeocodingService geocodingService;
    
    public ZoneController(ZoneDetectionService zoneDetectionService, GeocodingService geocodingService) {
        this.zoneDetectionService = zoneDetectionService;
        this.geocodingService = geocodingService;
    }
    
    @GetMapping("/detect")
    public ResponseEntity<String> detectZone(
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        
        try {
            if (latitude != null && longitude != null) {
                // Use provided coordinates
                String zone = zoneDetectionService.detectZoneFromCoordinates(latitude, longitude);
                return ResponseEntity.ok(zone);
            } else if (address != null) {
                // Geocode address first
                GeocodingService.GeoPoint point = geocodingService.geocode(address);
                String zone = zoneDetectionService.detectZoneFromCoordinates(point.latitude(), point.longitude());
                return ResponseEntity.ok(zone);
            } else {
                return ResponseEntity.badRequest().body("Either address or coordinates must be provided");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error detecting zone: " + e.getMessage());
        }
    }
}
