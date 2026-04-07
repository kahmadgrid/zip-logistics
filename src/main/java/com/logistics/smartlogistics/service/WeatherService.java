package com.logistics.smartlogistics.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    @Value("${weather.api.key}")
    private String weatherApiKey;

    private final WebClient webClient = WebClient.create();

    /**
     * Get weather conditions for a location
     */
    public WeatherInfo getWeather(double latitude, double longitude) {
        try {
            String url = String.format(
                "https://api.openweathermap.org/data/2.5/weather?lat=%.6f&lon=%.6f&appid=%s&units=metric",
                latitude, longitude, weatherApiKey
            );

            Map<String, Object> response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> main = (Map<String, Object>) response.get("main");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> weather = (List<Map<String, Object>>) response.get("weather");
                
                double temperature = ((Number) main.get("temp")).doubleValue();
                double windSpeed = 0.0;
                if (response.get("wind") != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> windData = (Map<String, Object>) response.get("wind");
                    windSpeed = windData.get("speed") != null ? 
                        ((Number) windData.get("speed")).doubleValue() : 0.0;
                }
                double humidity = ((Number) main.get("humidity")).doubleValue();
                String condition = (String) weather.get(0).get("main");
                String description = (String) weather.get(0).get("description");

                return new WeatherInfo(temperature, windSpeed, humidity, condition, description);
            }
        } catch (Exception e) {
            System.err.println("Weather API error: " + e.getMessage());
        }

        // Return default weather if API fails
        return new WeatherInfo(25.0, 5.0, 60.0, "Clear", "Clear sky");
    }

    /**
     * Calculate weather surcharge based on conditions
     */
    public BigDecimal calculateWeatherSurcharge(WeatherInfo weather) {
        double surcharge = 0.0;

        // No surcharge for clear skies and normal conditions
        if ("Clear".equalsIgnoreCase(weather.getCondition()) || 
            "Clouds".equalsIgnoreCase(weather.getCondition())) {
            return BigDecimal.ZERO;
        }

        // Temperature-based surcharge (extreme conditions only)
        if (weather.getTemperature() < 0.0) surcharge += 15.0; // Extreme cold
        else if (weather.getTemperature() > 40.0) surcharge += 10.0; // Extreme heat

        // Wind speed surcharge (high winds only)
        if (weather.getWindSpeed() > 20.0) surcharge += 12.0;
        else if (weather.getWindSpeed() > 15.0) surcharge += 8.0;

        // Humidity surcharge (very high humidity only)
        if (weather.getHumidity() > 85.0) surcharge += 3.0;

        // Condition-based surcharge (adverse weather only)
        switch (weather.getCondition().toLowerCase()) {
            case "rain":
            case "drizzle":
                surcharge += 8.0;
                break;
            case "snow":
                surcharge += 25.0;
                break;
            case "thunderstorm":
                surcharge += 20.0;
                break;
            case "mist":
            case "fog":
                surcharge += 5.0;
                break;
        }

        return BigDecimal.valueOf(surcharge);
    }

    /**
     * Weather information holder
     */
    public static class WeatherInfo {
        private final double temperature;
        private final double windSpeed;
        private final double humidity;
        private final String condition;
        private final String description;

        public WeatherInfo(double temperature, double windSpeed, double humidity, 
                          String condition, String description) {
            this.temperature = temperature;
            this.windSpeed = windSpeed;
            this.humidity = humidity;
            this.condition = condition;
            this.description = description;
        }

        // Getters
        public double getTemperature() { return temperature; }
        public double getWindSpeed() { return windSpeed; }
        public double getHumidity() { return humidity; }
        public String getCondition() { return condition; }
        public String getDescription() { return description; }

        @Override
        public String toString() {
            return String.format("%.1f°C, %.1f km/h wind, %.0f%% humidity, %s (%s)", 
                temperature, windSpeed, humidity, condition, description);
        }
    }
}
