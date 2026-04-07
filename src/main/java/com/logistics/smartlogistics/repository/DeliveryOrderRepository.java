package com.logistics.smartlogistics.repository;

import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.Warehouse;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {
    List<DeliveryOrder> findByCustomerId(Long customerId);

    List<DeliveryOrder> findByDriverId(Long driverId);

    List<DeliveryOrder> findByPickupZoneAndStatus(String pickupZone, DeliveryStatus status);
    //here we will find based on one more thing i.e. vehicle (according to weight,there will be one more function which will suggest vehicle acc to weight)

    List<DeliveryOrder> findByStatus(DeliveryStatus status);

    List<DeliveryOrder> findByWarehouseAndDestinationWarehouseAndStatusAndBatchIsNull(
            Warehouse warehouse,
            Warehouse destinationWarehouse,
            DeliveryStatus status
    );

    List<DeliveryOrder> findByPickupZoneAndStatusAndSuggestedVehicle(
            String zone,
            DeliveryStatus status,
            VehicleType vehicleType
    );
}
