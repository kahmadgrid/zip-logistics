package com.logistics.smartlogistics.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {

    @Value("${opencage.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public GeoPoint geocode(String address) {

        String url = "https://api.opencagedata.com/geocode/v1/json?q="
                + address.replace(" ", "+")
                + "&key=" + apiKey;

        Map response = restTemplate.getForObject(url, Map.class);
        System.out.println(response);
        if (response == null) {
            throw new RuntimeException("No response from geocoding API");
        }

        List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

        if (results == null || results.isEmpty()) {
            throw new RuntimeException("No results found for address: " + address);
        }

        Map<String, Object> geometry = (Map<String, Object>) results.get(0).get("geometry");

        if (geometry == null) {
            throw new RuntimeException("Invalid response: missing geometry");
        }

        double lat = ((Number) geometry.get("lat")).doubleValue();
        double lng = ((Number) geometry.get("lng")).doubleValue();

        return new GeoPoint(lat, lng);
    }

    public record GeoPoint(double latitude, double longitude) {}
}