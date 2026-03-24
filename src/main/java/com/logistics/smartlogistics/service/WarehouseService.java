package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.Warehouse;
import com.logistics.smartlogistics.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.Optional;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public Optional<Warehouse> suggestWarehouse(DeliveryOrder order) {
        // Phase 1 placeholder: choose by zone and min load.
        return warehouseRepository.findByZone(order.getPickupZone()).stream()
                .filter(w -> w.getCurrentLoad() < w.getCapacity())
                .min(Comparator.comparing(Warehouse::getCurrentLoad));
    }
}
