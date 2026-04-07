package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.TrackingDtos;
import com.logistics.smartlogistics.dto.DriverDtos;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.DriverAvailability;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DriverProfileRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import com.logistics.smartlogistics.repository.WarehouseRepository;
import com.logistics.smartlogistics.service.NotificationService;
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
    private final NotificationService notificationService;

    public DriverController(DeliveryOrderRepository deliveryOrderRepository,
                            AppUserRepository appUserRepository,
                            DriverProfileRepository driverProfileRepository,
                            WarehouseRepository warehouseRepository,
                            TrackingService trackingService,
                            NotificationService notificationService) {
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.appUserRepository = appUserRepository;
        this.driverProfileRepository = driverProfileRepository;
        this.warehouseRepository = warehouseRepository;
        this.trackingService = trackingService;
        this.notificationService = notificationService;
    }

    // ===================== TASKS =====================

    @GetMapping("/tasks")
    public List<DeliveryOrder> myTasks(Authentication authentication) {

        DriverProfile driver = getDriver(authentication);

        // ✅ Only ONLINE drivers get tasks
        if (driver.getAvailability() != DriverAvailability.ONLINE) {
            return List.of();
        }

        List<DeliveryOrder> orders =
                deliveryOrderRepository.findByPickupZoneAndStatus(
                        driver.getCurrentZone(),
                        DeliveryStatus.CREATED
                );

        // ✅ Filter based on vehicle compatibility
        return orders.stream()
                .filter(order ->
                        order.getSuggestedVehicle() != null &&
                                driver.getVehicleType() != null &&
                                driver.getVehicleType().equals(order.getSuggestedVehicle())
                )
                .toList();
    }

    @GetMapping("/tasks/assigned")
    public List<DeliveryOrder> myAssignedTasks(Authentication authentication) {
        DriverProfile driver = getDriver(authentication);
        return deliveryOrderRepository.findByDriverId(driver.getId());
    }

    // ===================== PROFILE =====================

    @PostMapping("/profile")
    public DriverProfile createOrUpdateProfile(
            @Valid @RequestBody DriverDtos.CreateOrUpdateDriverProfileRequest request,
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

    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {

        var user = appUserRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return driverProfileRepository.findByUserId(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // ===================== ORDER ACTIONS =====================

    @PostMapping("/tasks/{orderId}/accept")
    public DeliveryOrder acceptOrder(@PathVariable Long orderId, Authentication authentication) {

        DriverProfile driver = getDriver(authentication);
        DeliveryOrder order = deliveryOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // ✅ Status check
        if (order.getStatus() != DeliveryStatus.CREATED) {
            throw new IllegalArgumentException("Order is not in CREATED state");
        }

        // ✅ Zone check
        if (!order.getPickupZone().equals(driver.getCurrentZone())) {
            throw new IllegalArgumentException("Order not in your zone");
        }

        // ✅ Driver availability
        if (driver.getAvailability() != DriverAvailability.ONLINE) {
            throw new IllegalArgumentException("Driver is not ONLINE");
        }

        // ✅ Already assigned check
        if (order.getDriver() != null) {
            throw new IllegalArgumentException("Order already assigned");
        }

        // 🚚 Vehicle validation
        if (!driver.getVehicleType().canCarry(
                order.getWeightKg(),
                order.getLengthCm(),
                order.getBreadthCm(),
                order.getHeightCm()
        )) {
            throw new IllegalArgumentException("Your vehicle cannot carry this order");
        }

        order.setDriver(driver);
        order.setStatus(DeliveryStatus.DRIVER_ASSIGNED);
        DeliveryOrder savedOrder = deliveryOrderRepository.save(order);

        notificationService.notifyUser(
                savedOrder.getCustomer().getId(),
                String.format("🚚 [Parcel #%d] Driver assigned to your order", savedOrder.getId())
        );

        return savedOrder;
    }

    @PatchMapping("/tasks/{orderId}/status")
    public DeliveryOrder updateStatus(@PathVariable Long orderId,
                                      @RequestBody Map<String, String> payload,
                                      Authentication authentication) {

        DriverProfile driver = getDriver(authentication);
        DeliveryOrder order = deliveryOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getDriver() == null ||
                !Objects.equals(order.getDriver().getId(), driver.getId())) {
            throw new IllegalArgumentException("Order not assigned to this driver");
        }

        DeliveryStatus newStatus = DeliveryStatus.valueOf(payload.get("status"));
        DeliveryStatus oldStatus = order.getStatus();

        order.setStatus(newStatus);

        long parcelId = order.getId();
        String message = switch (newStatus) {
            case DRIVER_ASSIGNED -> String.format("🚚 [Parcel #%d] Driver assigned to your order", parcelId);
            case PICKED_UP -> String.format("📦 [Parcel #%d] Parcel picked up", parcelId);
            case IN_TRANSIT -> String.format("🚛 [Parcel #%d] Parcel is in transit", parcelId);
            case AT_ORIGIN_WAREHOUSE -> String.format("🏭 [Parcel #%d] Reached origin warehouse", parcelId);
            case AT_DESTINATION_WAREHOUSE -> String.format("📍 [Parcel #%d] Reached destination warehouse", parcelId);
            case OUT_FOR_DELIVERY -> String.format("🚚 [Parcel #%d] Out for delivery", parcelId);
            case DELIVERED -> String.format("✅ [Parcel #%d] Parcel delivered successfully", parcelId);
            default -> null;
        };

        if (message != null) {
            notificationService.notifyUser(order.getCustomer().getId(), message);
        }

        return deliveryOrderRepository.save(order);
    }

    // ===================== TRACKING =====================

    @PostMapping("/tasks/{orderId}/location")
    public com.logistics.smartlogistics.entity.TrackingLog updateLocation(
            @PathVariable Long orderId,
            @RequestBody TrackingDtos.LocationUpdateRequest request,
            Authentication authentication) {
        DriverProfile driver = getDriver(authentication);

        var saved = trackingService.logLocationForDriver(orderId, request, driver);

        driver.setCurrentLatitude(request.latitude());
        driver.setCurrentLongitude(request.longitude());

        driverProfileRepository.save(driver);

        return saved;
    }

    // ===================== DRIVER STATUS =====================

    @PutMapping("/go-online")
    public ResponseEntity<?> goOnline(Authentication authentication) {

        DriverProfile driver = getDriver(authentication);

        driver.setAvailability(DriverAvailability.ONLINE);
        driverProfileRepository.save(driver);

        return ResponseEntity.ok("Driver is ONLINE");
    }

    @PutMapping("/go-offline")
    public ResponseEntity<?> goOffline(Authentication authentication) {

        DriverProfile driver = getDriver(authentication);

        driver.setAvailability(DriverAvailability.OFFLINE);
        driverProfileRepository.save(driver);

        return ResponseEntity.ok("Driver is OFFLINE");
    }

    // ===================== HELPER =====================

    private DriverProfile getDriver(Authentication authentication) {

        var user = appUserRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return driverProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Driver profile not created"));
    }

}