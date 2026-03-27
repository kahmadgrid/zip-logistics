package com.logistics.smartlogistics.entity;

import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.DeliveryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_orders")
@Getter
@Setter
public class DeliveryOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser customer;

    @ManyToOne
    @JoinColumn(name = "driver_profile_id")
    private DriverProfile driver;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse; // origin warehouse for inter-zone flows

    @ManyToOne
    @JoinColumn(name = "destination_warehouse_id")
    private Warehouse destinationWarehouse; // destination warehouse for inter-zone/standard flows

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryType deliveryType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.CREATED;

    @Column(nullable = false)
    private String pickupAddress;

    @Column(nullable = false)
    private String dropAddress;

    @Column(nullable = false)
    private String pickupZone;

    @Column(nullable = false)
    private String dropZone;

    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private String receiverMobile;

    @Column(nullable = false)
    private Double weightKg;

    @Column(nullable = false)
    private Double lengthCm;

    @Column(nullable = false)
    private Double breadthCm;

    @Column(nullable = false)
    private Double heightCm;

    @Column(nullable = false)
    private Double pickupLatitude;

    @Column(nullable = false)
    private Double pickupLongitude;

    @Column(nullable = false)
    private Double dropLatitude;

    @Column(nullable = false)
    private Double dropLongitude;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedPrice;

    @Column
    private Integer batchOrderIndex;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
