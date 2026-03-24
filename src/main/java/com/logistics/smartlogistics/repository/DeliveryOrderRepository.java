package com.logistics.smartlogistics.repository;

import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {
    List<DeliveryOrder> findByCustomerId(Long customerId);

    List<DeliveryOrder> findByDriverId(Long driverId);

    List<DeliveryOrder> findByStatus(DeliveryStatus status);
}
