package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.BookingDtos;
import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.Warehouse;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.DeliveryType;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import com.logistics.smartlogistics.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class BookingService {
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final AppUserRepository appUserRepository;
    private final PricingEngineService pricingEngineService;
    private final MatchingEngineService matchingEngineService;
    private final WarehouseService warehouseService;
    private final WarehouseRepository warehouseRepository;
    private final GeocodingService geocodingService;

    public BookingService(DeliveryOrderRepository deliveryOrderRepository,
                          AppUserRepository appUserRepository,
                          PricingEngineService pricingEngineService,
                          MatchingEngineService matchingEngineService,
                          WarehouseService warehouseService,
                          WarehouseRepository warehouseRepository,
                          GeocodingService geocodingService) {
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.appUserRepository = appUserRepository;
        this.pricingEngineService = pricingEngineService;
        this.matchingEngineService = matchingEngineService;
        this.warehouseService = warehouseService;
        this.warehouseRepository = warehouseRepository;
        this.geocodingService = geocodingService;
    }

    public BookingDtos.BookingResponse createBooking(String customerEmail, BookingDtos.BookingRequest request) {
        AppUser customer = appUserRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        boolean sameZone = Objects.equals(request.pickupZone(), request.dropZone());

        Warehouse originWarehouse = null;
        Warehouse destinationWarehouse = null;

        // Warehouse usage rules
        boolean usesWarehouses = request.deliveryType() == DeliveryType.STANDARD
                || (request.deliveryType() == DeliveryType.EXPRESS && !sameZone);

        if (usesWarehouses) {
            originWarehouse = warehouseRepository.findByZone(request.pickupZone())
                    .orElseThrow(() -> new IllegalArgumentException("Pickup zone not serviceable"));
            if (originWarehouse.getCurrentLoad() >= originWarehouse.getCapacity()) {
                throw new IllegalArgumentException("Origin warehouse full");
            }

            destinationWarehouse = warehouseRepository.findByZone(request.dropZone())
                    .orElseThrow(() -> new IllegalArgumentException("Drop zone not serviceable"));
        }

        GeocodingService.GeoPoint pickupPoint = geocodingService.geocode(request.pickupAddress(), request.pickupZone());
        GeocodingService.GeoPoint dropPoint = geocodingService.geocode(request.dropAddress(), request.dropZone());
        double distanceKm = DistanceUtils.distanceKm(
                pickupPoint.latitude(), pickupPoint.longitude(),
                dropPoint.latitude(), dropPoint.longitude()
        );

        DeliveryOrder order = new DeliveryOrder();
        order.setCustomer(customer);
        order.setDeliveryType(request.deliveryType());
        order.setPickupAddress(request.pickupAddress());
        order.setDropAddress(request.dropAddress());
        order.setPickupZone(request.pickupZone());
        order.setDropZone(request.dropZone());
        order.setReceiverName(request.receiverName());
        order.setReceiverMobile(request.receiverMobile());
        order.setWeightKg(request.weightKg());
        order.setLengthCm(request.lengthCm());
        order.setBreadthCm(request.breadthCm());
        order.setHeightCm(request.heightCm());
        order.setPickupLatitude(pickupPoint.latitude());
        order.setPickupLongitude(pickupPoint.longitude());
        order.setDropLatitude(dropPoint.latitude());
        order.setDropLongitude(dropPoint.longitude());

        order.setEstimatedPrice(pricingEngineService.estimatePrice(request.deliveryType(), distanceKm, request.weightKg()));
        order.setStatus(DeliveryStatus.CREATED);

        // Attach warehouses if needed
        order.setWarehouse(originWarehouse); // origin warehouse for STANDARD and cross-zone EXPRESS
        order.setDestinationWarehouse(destinationWarehouse);

        // Increment origin warehouse load when an order is assigned to it (standard/cross-zone flows)
        if (originWarehouse != null) {
            originWarehouse.setCurrentLoad(originWarehouse.getCurrentLoad() + 1);
            warehouseRepository.save(originWarehouse);
        }

        DeliveryOrder saved = deliveryOrderRepository.save(order);

        // Phase-1 notification: drivers will see tasks via polling; this keeps ranking logic in place.
        matchingEngineService.rankAvailableDrivers(saved);

        return new BookingDtos.BookingResponse(
                saved.getId(),
                saved.getDeliveryType(),
                saved.getStatus(),
                saved.getEstimatedPrice()
        );
    }

    public List<DeliveryOrder> userOrders(String customerEmail) {
        Long customerId = appUserRepository.findByEmail(customerEmail).orElseThrow().getId();
        return deliveryOrderRepository.findByCustomerId(customerId);
    }
}
