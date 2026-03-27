package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.TrackingDtos;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.entity.TrackingLog;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import com.logistics.smartlogistics.repository.TrackingLogRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrackingService {
    private final TrackingLogRepository trackingLogRepository;
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TrackingService(TrackingLogRepository trackingLogRepository,
                           DeliveryOrderRepository deliveryOrderRepository,
                           SimpMessagingTemplate messagingTemplate) {
        this.trackingLogRepository = trackingLogRepository;
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public TrackingLog logLocation(Long orderId, TrackingDtos.LocationUpdateRequest req) {
        DeliveryOrder order = deliveryOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(req.status());
        deliveryOrderRepository.save(order);

        TrackingLog log = new TrackingLog();
        log.setOrder(order);
        log.setLatitude(req.latitude());
        log.setLongitude(req.longitude());
        log.setStatus(req.status());
        TrackingLog saved = trackingLogRepository.save(log);

        messagingTemplate.convertAndSend("/topic/tracking/" + orderId,
                new TrackingDtos.TrackingUpdate(orderId, req.latitude(), req.longitude(), req.status()));
        return saved;
    }

    public TrackingLog logLocationForDriver(Long orderId, TrackingDtos.LocationUpdateRequest req, DriverProfile driver) {
        DeliveryOrder order = deliveryOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (order.getDriver() == null || order.getDriver().getId() == null || !order.getDriver().getId().equals(driver.getId())) {
            throw new IllegalArgumentException("Order not assigned to this driver");
        }
        return logLocation(orderId, req);
    }

    public List<TrackingLog> getOrderTimeline(Long orderId) {
        return trackingLogRepository.findByOrderIdOrderByRecordedAtDesc(orderId);
    }
}
