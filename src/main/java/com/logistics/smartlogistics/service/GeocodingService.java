package com.logistics.smartlogistics.service;

import org.springframework.stereotype.Service;

/**
 * Phase-1 placeholder for external geocoding (Google Maps etc).
 * For now it deterministically converts an address+zone into coordinates
 * so the system is fully runnable without external APIs.
 */
@Service
public class GeocodingService {

    public GeoPoint geocode(String address, String zone) {
        int h = Math.abs((address + "|" + zone).hashCode());
        double lat = ((h % 180000) / 1000.0) - 90.0;   // [-90, 90)
        double lng = (((h / 180000) % 360000) / 1000.0) - 180.0; // [-180, 180)
        // If values are outside expected range due to integer division edge cases, clamp.
        lat = Math.max(-90.0, Math.min(90.0, lat));
        lng = Math.max(-180.0, Math.min(180.0, lng));
        return new GeoPoint(lat, lng);
    }

    public record GeoPoint(double latitude, double longitude) {
    }
}

