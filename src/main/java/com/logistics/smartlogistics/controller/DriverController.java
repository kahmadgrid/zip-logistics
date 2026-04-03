package com.logistics.smartlogistics.controller;
import com.logistics.smartlogistics.dto.TrackingDtos;
import com.logistics.smartlogistics.dto.DriverDtos;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DriverProfileRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import com.logistics.smartlogistics.repository.WarehouseRepository;
import com.logistics.smartlogistics.service.TrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/driver")
public class DriverController {
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final AppUserRepository appUserRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final WarehouseRepository warehouseRepository;
    private final TrackingService trackingService;

    public DriverController(DeliveryOrderRepository deliveryOrderRepository,
                            AppUserRepository appUserRepository,
                            DriverProfileRepository driverProfileRepository,
                            WarehouseRepository warehouseRepository,
                            TrackingService trackingService) {
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.appUserRepository = appUserRepository;
        this.driverProfileRepository = driverProfileRepository;
        this.warehouseRepository = warehouseRepository;
        this.trackingService = trackingService;
    }

    @GetMapping("/tasks")
    public List<DeliveryOrder> myTasks(Authentication authentication) {

        DriverProfile driver = getDriver(authentication);


        List<DeliveryOrder> orders =
                deliveryOrderRepository.findByPickupZoneAndStatus(
                        driver.getCurrentZone(),
                        DeliveryStatus.CREATED
                );

        // ✅ FILTER BASED ON VEHICLE CAPACITY
        return orders.stream()
                .filter(order ->
                        driver.getVehicleType() == order.getSuggestedVehicle()
                )
                .toList();

        if (driver.getAvailability() != com.logistics.smartlogistics.enums.DriverAvailability.ONLINE) {
            return List.of();
        }
        return deliveryOrderRepository.findByPickupZoneAndStatus(driver.getCurrentZone(), DeliveryStatus.CREATED);

    }




    @GetMapping("/tasks/assigned")
    public List<DeliveryOrder> myAssignedTasks(Authentication authentication) {
        DriverProfile driver = getDriver(authentication);
        return deliveryOrderRepository.findByDriverId(driver.getId());
    }

    @PostMapping("/profile")
    public DriverProfile createOrUpdateProfile(@Valid @RequestBody DriverDtos.CreateOrUpdateDriverProfileRequest request,
                                               Authentication authentication) {
        var user = appUserRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DriverProfile driver = driverProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    DriverProfile p = new DriverProfile();
                    p.setUser(user);
                    return p;
                });

        driver.setVehicleType(request.vehicleType());
        driver.setVehicleNumber(request.vehicleNumber());
        driver.setCurrentZone(request.currentZone());
        driver.setAvailability(request.availability());
        driver.setCurrentLatitude(request.currentLatitude());
        driver.setCurrentLongitude(request.currentLongitude());
        return driverProfileRepository.save(driver);
    }

    @PostMapping("/tasks/{orderId}/accept")
    public DeliveryOrder acceptOrder(@PathVariable Long orderId, Authentication authentication) {

        DriverProfile driver = getDriver(authentication);
        DeliveryOrder order = deliveryOrderRepository.findById(orderId).orElseThrow();

        // ✅ 1. Status check
        if (order.getStatus() != DeliveryStatus.CREATED) {
            throw new IllegalArgumentException("Order is not in CREATED state");
        }

        // ✅ 2. Zone check
        if (!order.getPickupZone().equals(driver.getCurrentZone())) {
            throw new IllegalArgumentException("Order not in your zone");
        }

        // ✅ 3. Driver availability
        if (driver.getAvailability() != com.logistics.smartlogistics.enums.DriverAvailability.ONLINE) {
            throw new IllegalArgumentException("Driver is not ONLINE");
        }

        // ✅ 4. Already assigned check
        if (order.getDriver() != null) {
            throw new IllegalArgumentException("Order already assigned");
        }

        // 🚚 5. VEHICLE VALIDATION (🔥 MOST IMPORTANT)
        if (!driver.getVehicleType().canCarry(
                order.getWeightKg(),
                order.getLengthCm(),
                order.getBreadthCm(),
                order.getHeightCm()
        )) {
            throw new IllegalArgumentException("Your vehicle cannot carry this order");
        }

        // ✅ 6. Assign order
        order.setDriver(driver);
        order.setStatus(DeliveryStatus.DRIVER_ASSIGNED);

        return deliveryOrderRepository.save(order);
    }

    @PatchMapping("/tasks/{orderId}/status")
    public DeliveryOrder updateStatus(@PathVariable Long orderId,
                                      @RequestBody Map<String, String> payload,
                                      Authentication authentication) {
        DriverProfile driver = getDriver(authentication);
        DeliveryOrder order = deliveryOrderRepository.findById(orderId).orElseThrow();

        if (order.getDriver() == null || !Objects.equals(order.getDriver().getId(), driver.getId())) {
            throw new IllegalArgumentException("Order not assigned to this driver");
        }

        DeliveryStatus newStatus = DeliveryStatus.valueOf(payload.get("status"));
        DeliveryStatus oldStatus = order.getStatus();

        // Warehouse load management on key transitions for flows that involve warehouses
        if (oldStatus == DeliveryStatus.AT_ORIGIN_WAREHOUSE && newStatus == DeliveryStatus.IN_TRANSIT) {
            if (order.getWarehouse() != null) {
                var origin = order.getWarehouse();
                origin.setCurrentLoad(origin.getCurrentLoad() - 1);
                warehouseRepository.save(origin);
            }
        }

        if (newStatus == DeliveryStatus.AT_DESTINATION_WAREHOUSE) {
            if (order.getDestinationWarehouse() != null) {
                var dest = order.getDestinationWarehouse();
                dest.setCurrentLoad(dest.getCurrentLoad() + 1);
                warehouseRepository.save(dest);
            }
        }

        if (oldStatus == DeliveryStatus.AT_DESTINATION_WAREHOUSE && newStatus == DeliveryStatus.OUT_FOR_DELIVERY) {
            if (order.getDestinationWarehouse() != null) {
                var dest = order.getDestinationWarehouse();
                dest.setCurrentLoad(dest.getCurrentLoad() - 1);
                warehouseRepository.save(dest);
            }
        }

        order.setStatus(newStatus);
        return deliveryOrderRepository.save(order);
    }

    @PostMapping("/tasks/{orderId}/location")
    public com.logistics.smartlogistics.entity.TrackingLog updateLocation(@PathVariable Long orderId,
                                                                          @RequestBody TrackingDtos.LocationUpdateRequest request,
                                                                          Authentication authentication) {
        DriverProfile driver = getDriver(authentication);
        // Minimal authorization: ensure this driver is assigned to the order.
        if (driver.getId() == null) {
            throw new IllegalArgumentException("Driver not found");
        }
        var saved = trackingService.logLocationForDriver(orderId, request, driver);
        driver.setCurrentLatitude(request.latitude());
        driver.setCurrentLongitude(request.longitude());
        driverProfileRepository.save(driver);
        return saved;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        var user = appUserRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return driverProfileRepository.findByUserId(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build()); // ✅ 204 if not exists
    }

    private DriverProfile getDriver(Authentication authentication) {
        var user = appUserRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return driverProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Driver profile not created"));
    }

    @PutMapping("/go-online")
    public ResponseEntity<?> goOnline(Authentication authentication) {

        DriverProfile driver = getDriver(authentication);

<<<<<<< HEAD
        user.setActive(true);
        appUserRepository.save(user);
        return ResponseEntity.ok("Account activated");
=======
        driver.setAvailability(
                com.logistics.smartlogistics.enums.DriverAvailability.ONLINE
        );

        driverProfileRepository.save(driver);

        return ResponseEntity.ok("Driver is ONLINE");
>>>>>>> origin/main
    }

    @PutMapping("/go-offline")
    public ResponseEntity<?> goOffline(Authentication authentication) {

        DriverProfile driver = getDriver(authentication);

        driver.setAvailability(
                com.logistics.smartlogistics.enums.DriverAvailability.OFFLINE
        );

        driverProfileRepository.save(driver);

        return ResponseEntity.ok("Driver is OFFLINE");
    }
}
