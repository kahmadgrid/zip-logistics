package com.logistics.smartlogistics.repository;

import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

    List<AppUser> findByRole(Role role);
}
