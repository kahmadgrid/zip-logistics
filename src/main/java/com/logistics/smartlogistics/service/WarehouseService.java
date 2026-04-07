package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.WarehouseDtos;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.Warehouse;
import com.logistics.smartlogistics.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public Optional<Warehouse> suggestWarehouse(DeliveryOrder order) {
        // Phase 1 placeholder: choose by zone and min load (zone -> single warehouse in this model).
        return warehouseRepository.findByZone(order.getPickupZone())
                .filter(w -> w.getCurrentLoad() < w.getCapacity());
    }

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Warehouse createWarehouse(WarehouseDtos.CreateWarehouseRequest request) {
        warehouseRepository.findByCode(request.code()).ifPresent(existing -> {
            throw new IllegalArgumentException("Warehouse code already exists");
        });
        Warehouse warehouse = new Warehouse();
        warehouse.setCode(request.code().trim());
        warehouse.setName(request.name().trim());
        if (request.city() != null) {
            warehouse.setCity(request.city().trim());
        }
        warehouse.setZone(request.zone().trim());
        warehouse.setLatitude(request.latitude());
        warehouse.setLongitude(request.longitude());
        warehouse.setRadiusKm(request.radiusKm());
        warehouse.setCurrentLoad(0);
        return warehouseRepository.save(warehouse);
    }
}
