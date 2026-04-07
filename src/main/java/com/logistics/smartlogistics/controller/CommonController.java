package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.UserProfileResponse;
import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.repository.AppUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/common")
public class CommonController {

    private final AppUserRepository appUserRepository;

    public CommonController(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @GetMapping("/me")
    public UserProfileResponse getMyProfile(Authentication authentication) {
        String email = authentication.getName();

        var user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserProfileResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .build();
    }



}