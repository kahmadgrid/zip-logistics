package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.TrackingDtos;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.DriverProfile;
import com.logistics.smartlogistics.entity.TrackingEvent;
import com.logistics.smartlogistics.entity.TrackingLog;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import com.logistics.smartlogistics.repository.TrackingLogRepository;
import com.logistics.smartlogistics.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/tracking")
public class TrackingController {
    private final TrackingService trackingService;
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final TrackingLogRepository trackingLogRepository;
    public TrackingController(TrackingService trackingService, DeliveryOrderRepository deliveryOrderRepository, TrackingLogRepository trackingLogRepository) {
        this.trackingService = trackingService;
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.trackingLogRepository = trackingLogRepository;
    }

    @PostMapping("/{orderId}/location")
    public TrackingLog updateLocation(@PathVariable Long orderId,
                                      @Valid @RequestBody TrackingDtos.LocationUpdateRequest request) {
        return trackingService.logLocation(orderId, request);
    }

//    @GetMapping("/{orderId}")
//    public List<TrackingLog> timeline(@PathVariable Long orderId) {
//        return trackingService.getOrderTimeline(orderId);
//    }
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate;
//
//    public void sendLocationUpdate(TrackingEvent event) {
//        messagingTemplate.convertAndSend(
//                "/topic/tracking/" + event.getOrderId(),
//                event
//        );
//    }

    @GetMapping("/{orderId}")
    public Map<String, Object> timeline(@PathVariable Long orderId) {
        DeliveryOrder order = deliveryOrderRepository.findById(orderId)
                .orElseThrow();
        DriverProfile driver = order.getDriver();
        System.out.println("Driver name is very long but I will keep ---------------------------> "+driver.getUser().getFullName());
        return Map.of(
                "events", trackingLogRepository.findByOrderIdOrderByRecordedAtAsc(orderId),
                "dropLat", order.getDropLatitude(),
                "dropLng", order.getDropLongitude(),
                "driverName", driver != null && driver.getUser() != null
                        ? driver.getUser().getFullName()
                        : "Driver"
        );
    }
}


