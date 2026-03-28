package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.TrackingDtos;
import com.logistics.smartlogistics.entity.TrackingLog;
import com.logistics.smartlogistics.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/tracking")
public class TrackingController {
    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @PostMapping("/{orderId}/location")
    public TrackingLog updateLocation(@PathVariable Long orderId,
                                      @Valid @RequestBody TrackingDtos.LocationUpdateRequest request) {
        return trackingService.logLocation(orderId, request);
    }

    @GetMapping("/{orderId}")
    public List<TrackingLog> timeline(@PathVariable Long orderId) {
        return trackingService.getOrderTimeline(orderId);
    }

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendLocationUpdate(TrackingEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/tracking/" + event.getOrderId(),
                event
        );
    }
}


