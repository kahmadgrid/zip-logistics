package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.WarehouseDtos;
import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.entity.Warehouse;
import com.logistics.smartlogistics.enums.Role;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import com.logistics.smartlogistics.repository.DriverProfileRepository;
import com.logistics.smartlogistics.service.WarehouseService;
import com.logistics.smartlogistics.service.BatchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/admin")
public class AdminController {
    private final AppUserRepository appUserRepository;
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final WarehouseService warehouseService;
    private final BatchService batchService;

    private final DriverProfileRepository driverProfileRepository;

    public AdminController(AppUserRepository appUserRepository,
                           DeliveryOrderRepository deliveryOrderRepository,
                           WarehouseService warehouseService,
                           BatchService batchService,
                           DriverProfileRepository driverProfileRepository) {
        this.appUserRepository = appUserRepository;
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.warehouseService = warehouseService;
        this.batchService = batchService;
        this.driverProfileRepository = driverProfileRepository;
    }

    @GetMapping("/users")
    public List<AppUser> users() {
        return appUserRepository.findAll();
    }

    @GetMapping("/drivers")
    public List<DriverProfile> drivers() {
        return driverProfileRepository.findAll();
    }
    @PatchMapping("/users/{id}/active")
    public AppUser updateActive(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        AppUser user = appUserRepository.findById(id).orElseThrow();
        user.setActive(Boolean.TRUE.equals(body.get("active")));
        return appUserRepository.save(user);
    }

    @GetMapping("/logs/orders")
    public List<DeliveryOrder> orderLogs() {
        return deliveryOrderRepository.findAll();
    }

    @PostMapping("/warehouses")
    public Warehouse createWarehouse(@Valid @RequestBody WarehouseDtos.CreateWarehouseRequest request) {
        return warehouseService.createWarehouse(request);
    }

    @GetMapping("/warehouses")
    public List<Warehouse> getAllWarehouses() {
        return warehouseService.getAllWarehouses();
    }

    @PostMapping("/batching/prepare")
    public List<com.logistics.smartlogistics.entity.Batch> prepareBatches(
            @RequestParam String originZone,
            @RequestParam String destinationZone) {
        return batchService.prepareBatches(originZone, destinationZone);
    }
}
