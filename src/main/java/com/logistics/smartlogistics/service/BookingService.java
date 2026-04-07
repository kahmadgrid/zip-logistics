package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.BookingDtos;
import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.entity.DeliveryOrder;

import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.entity.Warehouse;

import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.DeliveryType;
import com.logistics.smartlogistics.enums.VehicleType;

import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
//import com.logistics.smartlogistics.utils.VehicleUtil;

import com.logistics.smartlogistics.repository.WarehouseRepository;
import com.logistics.smartlogistics.utils.VehicleUtil;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class BookingService {

    private final DeliveryOrderRepository deliveryOrderRepository;
    private final AppUserRepository appUserRepository;
    private final PricingEngineService pricingEngineService;
    private final MatchingEngineService matchingEngineService;
    private final GeocodingService geocodingService;

    private final NotificationService notificationService;
    private final ZoneDetectionService zoneDetectionService;


    public BookingService(DeliveryOrderRepository deliveryOrderRepository,
                          AppUserRepository appUserRepository,
                          PricingEngineService pricingEngineService,
                          MatchingEngineService matchingEngineService,

                          NotificationService notificationService) {
                          GeocodingService geocodingService,
                          ZoneDetectionService zoneDetectionService) {
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.appUserRepository = appUserRepository;
        this.pricingEngineService = pricingEngineService;
        this.matchingEngineService = matchingEngineService;
        this.geocodingService = geocodingService;
        this.notificationService = notificationService;
        this.zoneDetectionService = zoneDetectionService;
    }

    public BookingDtos.BookingResponse createBooking(String customerEmail, BookingDtos.BookingRequest request) {

        AppUser customer = appUserRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // Auto-detect zones if not provided
        String pickupZone = request.pickupZone() != null && !request.pickupZone().trim().isEmpty()
            ? request.pickupZone()
            : detectPickupZone(request.pickupAddress(), request.pickupLatitude(), request.pickupLongitude());

        String dropZone = request.dropZone() != null && !request.dropZone().trim().isEmpty()
            ? request.dropZone()
            : detectPickupZone(request.dropAddress(), request.dropLatitude(), request.dropLongitude());

        // Check if either zone is not serviceable
        if ("NOT_SERVICEABLE".equals(pickupZone) || "NOT_SERVICEABLE".equals(dropZone)) {
            throw new IllegalArgumentException("Pickup or drop location is not serviceable. Please check if the address falls within our defined service zones.");
        }

        // Skip warehouse logic since we're using direct zones now
        // Warehouses are no longer used for zone assignment

        // 📍 Get pickup location
        GeocodingService.GeoPoint pickupPoint;
        if (request.pickupLatitude() != null && request.pickupLongitude() != null) {
            pickupPoint = new GeocodingService.GeoPoint(
                    request.pickupLatitude(),
                    request.pickupLongitude()
            );
        } else {
            pickupPoint = geocodingService.geocode(request.pickupAddress());
        }

        // 📍 Drop location
        GeocodingService.GeoPoint dropPoint =
                geocodingService.geocode(request.dropAddress());

        // 📏 Distance
        double distanceKm = pricingEngineService.calculateDistance(
                pickupPoint.latitude(), pickupPoint.longitude(),
                dropPoint.latitude(), dropPoint.longitude()
        );

        // 📦 Create order
        DeliveryOrder order = new DeliveryOrder();
        order.setCustomer(customer);
        order.setDeliveryType(request.deliveryType());

        order.setPickupAddress(request.pickupAddress());
        order.setDropAddress(request.dropAddress());

        order.setPickupZone(request.pickupZone());
        order.setDropZone(request.dropZone());

        order.setReceiverName(request.receiverName());
        order.setReceiverMobile(request.receiverMobile());

        // 📦 Dimensions
        order.setWeightKg(request.weightKg());
        order.setLengthCm(request.lengthCm());
        order.setBreadthCm(request.breadthCm());
        order.setHeightCm(request.heightCm());

        // 🚚 NEW: Vehicle suggestion (CORE LOGIC)
        VehicleType vehicle = VehicleUtil.suggestVehicle(
                request.weightKg(),
                request.lengthCm(),
                request.breadthCm(),
                request.heightCm()
        );
        order.setSuggestedVehicle(
                vehicle
        );
        System.out.println(order.getSuggestedVehicle());

        // 📍 Coordinates
        order.setPickupLatitude(pickupPoint.latitude());
        order.setPickupLongitude(pickupPoint.longitude());
        order.setDropLatitude(dropPoint.latitude());
        order.setDropLongitude(dropPoint.longitude());

        // 💰 NEW PRICING (DISTANCE BASED WITH WEATHER)
        order.setEstimatedPrice(
                pricingEngineService.estimatePrice(
                        request.deliveryType(),
                        request.weightKg(),
                        request.lengthCm(),
                        request.breadthCm(),
                        request.heightCm(),
                        distanceKm,
                        vehicle,
                        pickupPoint.latitude(),
                        pickupPoint.longitude()
                )
        );

        order.setStatus(DeliveryStatus.CREATED);

        // 🏭 Warehouses - No longer used in zone-based system
        order.setWarehouse(null);
        order.setDestinationWarehouse(null);

        // Skip warehouse load management since zones are independent

        // 💾 Save order
        DeliveryOrder saved = deliveryOrderRepository.save(order);

        // 🚚 Match drivers (now vehicle-aware)
        List<DriverProfile> matchedDrivers = matchingEngineService.rankAvailableDrivers(saved);

        System.out.println("📋 Matched " + matchedDrivers.size() + " driver(s) for Order #" + saved.getId());

        for (DriverProfile driver : matchedDrivers) {
            AppUser driverUser = driver.getUser();
            System.out.println("🔔 Notifying driver → ID: " + driverUser.getId() + " | Email: " + driverUser.getEmail());

            notificationService.notifyUser(
                    driverUser.getId(),
                    String.format("🚚 [Order #%d] New booking available : %s → %s",
                            saved.getId(),
                            saved.getPickupAddress(),
                            saved.getDropAddress())
            );
        }

        System.out.println("✅ Notified customer → ID: " + customer.getId() + " | Email: " + customer.getEmail());
        notificationService.notifyUser(
                customer.getId(),
                String.format("📦 [Parcel #%d] Your booking has been created", saved.getId())
        );

        return new BookingDtos.BookingResponse(
                saved.getId(),
                saved.getDeliveryType(),
                saved.getStatus(),
                saved.getEstimatedPrice()
        );
    }

    public String detectPickupZone(String pickupAddress, Double pickupLatitude, Double pickupLongitude) {
        if (pickupLatitude != null && pickupLongitude != null) {
            return zoneDetectionService.detectZoneFromCoordinates(pickupLatitude, pickupLongitude);
        } else if (pickupAddress != null && !pickupAddress.trim().isEmpty()) {
            try {
                GeocodingService.GeoPoint point = geocodingService.geocode(pickupAddress);
                return zoneDetectionService.detectZoneFromCoordinates(point.latitude(), point.longitude());
            } catch (Exception e) {
                return "CENTRAL_ZONE"; // Fallback
            }
        }
        return "CENTRAL_ZONE"; // Default fallback
    }

    public List<DeliveryOrder> userOrders(String customerEmail) {
        Long customerId = appUserRepository.findByEmail(customerEmail)
                .orElseThrow()
                .getId();

        return deliveryOrderRepository.findByCustomerId(customerId);
    }
}