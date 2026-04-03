package com.logistics.smartlogistics.entity;

import com.logistics.smartlogistics.enums.VehicleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "driver_profiles")
@Getter
@Setter
public class DriverProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    @Column(nullable = false)
    private Double rating = 5.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.logistics.smartlogistics.enums.DriverAvailability availability =
            com.logistics.smartlogistics.enums.DriverAvailability.ONLINE;

    @Column(nullable = false)
    private String currentZone;

    @Column(nullable = false)
    private Double currentLatitude = 0.0;

    @Column(nullable = false)
    private Double currentLongitude = 0.0;

    @Column
    private String vehicleNumber;

    @Override
    public String toString() {
        return "DriverProfile{" +
                "id=" + id +
                ", user=" + user +
                ", vehicleType=" + vehicleType +
                ", rating=" + rating +
                ", availability=" + availability +
                ", currentZone='" + currentZone + '\'' +
                ", currentLatitude=" + currentLatitude +
                ", currentLongitude=" + currentLongitude +
                ", vehicleNumber='" + vehicleNumber + '\'' +
                '}';
    }
}
