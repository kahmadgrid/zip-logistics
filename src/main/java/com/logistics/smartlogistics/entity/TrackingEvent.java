package com.logistics.smartlogistics.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrackingEvent {

    private Long orderId;
    private Double latitude;
    private Double longitude;
    private String status;
    private Long timestamp;
}