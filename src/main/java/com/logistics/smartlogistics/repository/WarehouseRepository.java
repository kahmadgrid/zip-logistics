package com.logistics.smartlogistics.repository;

import com.logistics.smartlogistics.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findByZone(String zone);
}
