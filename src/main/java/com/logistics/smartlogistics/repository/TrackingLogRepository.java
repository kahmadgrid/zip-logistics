package com.logistics.smartlogistics.repository;

import com.logistics.smartlogistics.entity.TrackingLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingLogRepository extends JpaRepository<TrackingLog, Long> {
    List<TrackingLog> findByOrderIdOrderByRecordedAtDesc(Long orderId);
}
