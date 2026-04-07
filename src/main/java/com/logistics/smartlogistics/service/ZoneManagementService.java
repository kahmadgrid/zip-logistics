package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.ZoneDtos;
import com.logistics.smartlogistics.entity.Zone;
import com.logistics.smartlogistics.repository.ZoneRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ZoneManagementService {

    private final ZoneRepository zoneRepository;

    public ZoneManagementService(ZoneRepository zoneRepository) {
        this.zoneRepository = zoneRepository;
    }

    public Zone createZone(ZoneDtos.CreateZoneRequest request) {
        Zone zone = new Zone();
        zone.setZoneCode(request.zoneCode().trim());
        zone.setZoneName(request.zoneName().trim());
        zone.setCenterLatitude(request.centerLatitude());
        zone.setCenterLongitude(request.centerLongitude());
        zone.setRadiusKm(request.radiusKm());
        zone.setActive(true);
        return zoneRepository.save(zone);
    }

    public List<ZoneDtos.ZoneResponse> getAllActiveZones() {
        return zoneRepository.findByActiveTrue().stream()
                .map(this::toZoneResponse)
                .collect(Collectors.toList());
    }

    public ZoneDtos.ZoneResponse toZoneResponse(Zone zone) {
        return new ZoneDtos.ZoneResponse(
                zone.getId(),
                zone.getZoneCode(),
                zone.getZoneName(),
                zone.getCenterLatitude(),
                zone.getCenterLongitude(),
                zone.getRadiusKm(),
                zone.getActive()
        );
    }
}
