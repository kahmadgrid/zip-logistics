package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.BookingDtos;
import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.DeliveryType;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final AppUserRepository appUserRepository;
    private final PricingEngineService pricingEngineService;
    private final MatchingEngineService matchingEngineService;
    private final WarehouseService warehouseService;

    public BookingService(DeliveryOrderRepository deliveryOrderRepository,
                          AppUserRepository appUserRepository,
                          PricingEngineService pricingEngineService,
                          MatchingEngineService matchingEngineService,
                          WarehouseService warehouseService) {
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.appUserRepository = appUserRepository;
        this.pricingEngineService = pricingEngineService;
        this.matchingEngineService = matchingEngineService;
        this.warehouseService = warehouseService;
    }

    public BookingDtos.BookingResponse createBooking(String customerEmail, BookingDtos.BookingRequest request) {
        AppUser customer = appUserRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        DeliveryOrder order = new DeliveryOrder();
        order.setCustomer(customer);
        order.setDeliveryType(request.getDeliveryType());
        order.setPickupAddress(request.getPickupAddress());
        order.setDropAddress(request.getDropAddress());
        order.setPickupZone(request.getPickupZone());
        order.setDropZone(request.getDropZone());
        order.setPriority(request.getPriority());
        order.setEstimatedPrice(pricingEngineService.estimatePrice(request));
        order.setStatus(DeliveryStatus.CREATED);

        if (request.getDeliveryType() == DeliveryType.EXPRESS && request.getPickupZone().equals(request.getDropZone())) {
            matchingEngineService.findBestDriver(order).ifPresent(order::setDriver);
            if (order.getDriver() != null) {
                order.setStatus(DeliveryStatus.ASSIGNED);
            }
        } else {
            warehouseService.suggestWarehouse(order).ifPresent(order::setWarehouse);
            order.setStatus(DeliveryStatus.APPROVED);
        }

        DeliveryOrder saved = deliveryOrderRepository.save(order);
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
