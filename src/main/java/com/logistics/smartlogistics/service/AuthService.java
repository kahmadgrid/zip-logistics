package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.AuthDtos;
import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.enums.Role;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AppUserRepository appUserRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        appUserRepository.findByEmail(request.email()).ifPresent(u -> {
            throw new IllegalArgumentException("Email already exists");
        });
        appUserRepository.findByMobile(request.mobile()).ifPresent(u -> {
            throw new IllegalArgumentException("Mobile already exists");
        });
        AppUser user = new AppUser();
        user.setEmail(request.email());
        user.setMobile(request.mobile());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(request.role() == null ? Role.ROLE_USER : request.role());
        appUserRepository.save(user);

        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                        .password(user.getPassword())
                        .authorities(user.getRole().name())
                        .build()
        );
        return new AuthDtos.AuthResponse(token, user.getEmail(), user.getRole());
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.emailOrMobile(), request.password())
        );
        AppUser user = appUserRepository.findByEmail(request.emailOrMobile())
                .orElseGet(() -> appUserRepository.findByMobile(request.emailOrMobile())
                        .orElseThrow(() -> new IllegalArgumentException("User not found")));
        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                        .password(user.getPassword())
                        .authorities(user.getRole().name())
                        .build()
        );
        return new AuthDtos.AuthResponse(token, user.getEmail(), user.getRole());
    }

    public void changePassword(String email, AuthDtos.ChangePasswordRequest request) {

        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 🔐 Verify current password
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // 🔐 Set new password (encoded)
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        appUserRepository.save(user);
    }
}
