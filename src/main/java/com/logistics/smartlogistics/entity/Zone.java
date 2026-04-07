package com.logistics.smartlogistics.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "zones")
@Getter
@Setter
public class Zone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String zoneCode;

    @Column(nullable = false)
    private String zoneName;

    @Column(nullable = false)
    private Double centerLatitude;

    @Column(nullable = false)
    private Double centerLongitude;

    @Column(nullable = false)
    private Double radiusKm;

    @Column(nullable = false)
    private Boolean active = true;
}
