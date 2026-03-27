package com.logistics.smartlogistics.entity;

import com.logistics.smartlogistics.enums.BatchStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "batches")
@Getter
@Setter
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "origin_warehouse_id", nullable = false)
    private Warehouse originWarehouse;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destination_warehouse_id", nullable = false)
    private Warehouse destinationWarehouse;

    @Column(nullable = false)
    private String area; // primary grouping key (Phase-1: pickupZone)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BatchStatus status = BatchStatus.CREATED;

    @Column(nullable = false)
    private Double currentWeightKg = 0.0;

    @Column(nullable = false)
    private Double currentVolumeM3 = 0.0;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

