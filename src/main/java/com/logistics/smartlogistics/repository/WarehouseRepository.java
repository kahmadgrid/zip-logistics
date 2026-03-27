package com.logistics.smartlogistics.repository;

import com.logistics.smartlogistics.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByZone(String zone);

    Optional<Warehouse> findByCode(String code);
}
