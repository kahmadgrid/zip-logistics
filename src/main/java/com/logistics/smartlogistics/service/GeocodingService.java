package com.logistics.smartlogistics.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class GeocodingService {

    private static final String API_KEY = "331f1f6760fd4668b486d2b05886a928";

    public GeoPoint geocode(String address) {
        String url = "https://api.opencagedata.com/geocode/v1/json?q="
                + address.replace(" ", "+")
                + "&key=" + API_KEY;

        RestTemplate restTemplate = new RestTemplate();
        Map response = restTemplate.getForObject(url, Map.class);

        var results = (java.util.List<Map>) response.get("results");

        if (results != null && !results.isEmpty()) {
            Map geometry = (Map) results.get(0).get("geometry");

            double lat = (double) geometry.get("lat");
            double lng = (double) geometry.get("lng");

            return new GeoPoint(lat, lng);
        }

        throw new RuntimeException("Unable to geocode address");
    }

    public record GeoPoint(double latitude, double longitude) {}
}