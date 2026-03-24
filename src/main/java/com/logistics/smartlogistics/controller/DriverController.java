package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
public class DriverController {
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final AppUserRepository appUserRepository;

    public DriverController(DeliveryOrderRepository deliveryOrderRepository, AppUserRepository appUserRepository) {
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping("/tasks")
    public List<DeliveryOrder> myTasks(Authentication authentication) {
        Long driverId = appUserRepository.findByEmail(authentication.getName()).orElseThrow().getId();
        return deliveryOrderRepository.findByDriverId(driverId);
    }

    @PatchMapping("/tasks/{orderId}/status")
    public DeliveryOrder updateStatus(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        DeliveryStatus status = DeliveryStatus.valueOf(payload.get("status"));
        DeliveryOrder order = deliveryOrderRepository.findById(orderId).orElseThrow();
        order.setStatus(status);
        return deliveryOrderRepository.save(order);
    }
}
