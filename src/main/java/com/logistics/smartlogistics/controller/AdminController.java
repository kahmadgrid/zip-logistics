package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.enums.Role;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AppUserRepository appUserRepository;
    private final DeliveryOrderRepository deliveryOrderRepository;

    public AdminController(AppUserRepository appUserRepository, DeliveryOrderRepository deliveryOrderRepository) {
        this.appUserRepository = appUserRepository;
        this.deliveryOrderRepository = deliveryOrderRepository;
    }

    @GetMapping("/users")
    public List<AppUser> users() {
        return appUserRepository.findAll();
    }

    @GetMapping("/drivers")
    public List<AppUser> drivers() {
        return appUserRepository.findByRole(Role.ROLE_DRIVER);
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
}
