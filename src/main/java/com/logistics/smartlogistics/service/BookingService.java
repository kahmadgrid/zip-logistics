package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.BookingDtos;
import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.Warehouse;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.DeliveryType;
import com.logistics.smartlogistics.enums.VehicleType;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
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
    private final WarehouseRepository warehouseRepository;
    private final GeocodingService geocodingService;

    public BookingService(DeliveryOrderRepository deliveryOrderRepository,
                          AppUserRepository appUserRepository,
                          PricingEngineService pricingEngineService,
                          MatchingEngineService matchingEngineService,
                          WarehouseRepository warehouseRepository,
                          GeocodingService geocodingService) {
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.appUserRepository = appUserRepository;
        this.pricingEngineService = pricingEngineService;
        this.matchingEngineService = matchingEngineService;
        this.warehouseRepository = warehouseRepository;
        this.geocodingService = geocodingService;
    }

    public BookingDtos.BookingResponse createBooking(String customerEmail, BookingDtos.BookingRequest request) {

        AppUser customer = appUserRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        boolean sameZone = Objects.equals(request.pickupZone(), request.dropZone());

        Warehouse originWarehouse = null;
        Warehouse destinationWarehouse = null;

        boolean usesWarehouses =
                request.deliveryType() == DeliveryType.STANDARD ||
                        (request.deliveryType() == DeliveryType.EXPRESS && !sameZone);

        if (usesWarehouses) {
            originWarehouse = warehouseRepository.findByZone(request.pickupZone())
                    .orElseThrow(() -> new IllegalArgumentException("Pickup zone not serviceable"));

            if (originWarehouse.getCurrentLoad() >= originWarehouse.getCapacity()) {
                throw new IllegalArgumentException("Origin warehouse full");
            }

            destinationWarehouse = warehouseRepository.findByZone(request.dropZone())
                    .orElseThrow(() -> new IllegalArgumentException("Drop zone not serviceable"));
        }

        // 📍 Pickup location
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

        // 💰 Pricing
        order.setEstimatedPrice(
                pricingEngineService.estimatePrice(
                        request.deliveryType(),
                        request.weightKg(),
                        request.lengthCm(),
                        request.breadthCm(),
                        request.heightCm(),
                        distanceKm,
                        vehicle
                )
        );

        order.setStatus(DeliveryStatus.CREATED);

        // 🏭 Warehouses
        order.setWarehouse(originWarehouse);
        order.setDestinationWarehouse(destinationWarehouse);

        if (originWarehouse != null) {
            originWarehouse.setCurrentLoad(originWarehouse.getCurrentLoad() + 1);
            warehouseRepository.save(originWarehouse);
        }

        // 💾 Save order
        DeliveryOrder saved = deliveryOrderRepository.save(order);

        // 🚚 Match drivers (now vehicle-aware)
        matchingEngineService.rankAvailableDrivers(saved);

        return new BookingDtos.BookingResponse(
                saved.getId(),
                saved.getDeliveryType(),
                saved.getStatus(),
                saved.getEstimatedPrice()
        );
    }
    public List<DeliveryOrder> userOrders(String customerEmail) {
        Long customerId = appUserRepository.findByEmail(customerEmail)
                .orElseThrow()
                .getId();

        return deliveryOrderRepository.findByCustomerId(customerId);
    }
}