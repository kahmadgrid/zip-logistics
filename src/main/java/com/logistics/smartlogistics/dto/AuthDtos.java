package com.logistics.smartlogistics.dto;

import com.logistics.smartlogistics.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuthDtos {

    public record RegisterRequest(
            @Email String email,
            @NotBlank String password,
            @NotBlank String fullName,
            @NotNull Role role,
            @NotNull String mobile
    ) {
    }

    public record LoginRequest(
            @Email String email,
            @NotBlank String password
    ) {
    }

    public record AuthResponse(
            String token,
            String email,
            Role role
    ) {
    }
}
