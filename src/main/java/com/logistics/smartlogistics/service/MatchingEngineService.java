package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.enums.Role;
import com.logistics.smartlogistics.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class MatchingEngineService {

    private final AppUserRepository appUserRepository;

    public MatchingEngineService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public Optional<AppUser> findBestDriver(DeliveryOrder order) {
        // Phase 1 placeholder: replace with distance, rating and vehicle fit scoring.
        List<AppUser> drivers = appUserRepository.findByRole(Role.ROLE_DRIVER);
        return drivers.stream().min(Comparator.comparing(AppUser::getId));
    }
}
