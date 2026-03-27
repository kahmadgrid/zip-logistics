package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.entity.Batch;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.entity.Warehouse;
import com.logistics.smartlogistics.enums.BatchStatus;
import com.logistics.smartlogistics.enums.DeliveryStatus;
import com.logistics.smartlogistics.repository.BatchRepository;
import com.logistics.smartlogistics.repository.DeliveryOrderRepository;
import com.logistics.smartlogistics.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BatchService {

    private final WarehouseRepository warehouseRepository;
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final BatchRepository batchRepository;

    // Phase-1 batching constraints (placeholder, to be made configurable)
    private final double maxBatchWeightKg = 2000.0;
    private final double maxBatchVolumeM3 = 50.0;

    public BatchService(WarehouseRepository warehouseRepository,
                         DeliveryOrderRepository deliveryOrderRepository,
                         BatchRepository batchRepository) {
        this.warehouseRepository = warehouseRepository;
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.batchRepository = batchRepository;
    }

    public List<Batch> prepareBatches(String originZone, String destinationZone) {
        Warehouse originWarehouse = warehouseRepository.findByZone(originZone)
                .orElseThrow(() -> new IllegalArgumentException("Origin zone not serviceable"));
        Warehouse destinationWarehouse = warehouseRepository.findByZone(destinationZone)
                .orElseThrow(() -> new IllegalArgumentException("Destination zone not serviceable"));

        List<DeliveryOrder> candidates = deliveryOrderRepository
                .findByWarehouseAndDestinationWarehouseAndStatusAndBatchIsNull(
                        originWarehouse,
                        destinationWarehouse,
                        DeliveryStatus.AT_ORIGIN_WAREHOUSE
                );

        if (candidates.isEmpty()) {
            return List.of();
        }

        // Primary grouping key: pickup area (Phase-1: using pickupZone)
        Map<String, List<DeliveryOrder>> byArea = candidates.stream()
                .collect(Collectors.groupingBy(DeliveryOrder::getPickupZone));

        List<Batch> createdBatches = new ArrayList<>();

        for (Map.Entry<String, List<DeliveryOrder>> entry : byArea.entrySet()) {
            String area = entry.getKey();
            List<DeliveryOrder> areaOrders = entry.getValue();

            // Sort orders inside the batch by: area (same here) then distance (origin -> pickup)
            areaOrders.sort(Comparator.comparingDouble(o ->
                    DistanceUtils.distanceKm(
                            originWarehouse.getLatitude(),
                            originWarehouse.getLongitude(),
                            o.getPickupLatitude(),
                            o.getPickupLongitude()
                    )
            ));

            double currentWeight = 0.0;
            double currentVolume = 0.0;
            int batchOrderIndex = 0;
            Batch batch = new Batch();
            batch.setOriginWarehouse(originWarehouse);
            batch.setDestinationWarehouse(destinationWarehouse);
            batch.setArea(area);
            batch.setStatus(BatchStatus.CREATED);
            batch.setCurrentWeightKg(0.0);
            batch.setCurrentVolumeM3(0.0);
            batch.setCreatedAt(LocalDateTime.now());

            for (DeliveryOrder order : areaOrders) {
                double orderVolumeM3 = volumeM3(order.getLengthCm(), order.getBreadthCm(), order.getHeightCm());
                boolean batchEmpty = currentWeight == 0.0 && currentVolume == 0.0;
                boolean wouldExceed = !batchEmpty && (
                        (currentWeight + order.getWeightKg() > maxBatchWeightKg)
                                || (currentVolume + orderVolumeM3 > maxBatchVolumeM3)
                );

                if (wouldExceed) {
                    // Persist current batch and start a new one.
                    Batch savedBatch = batchRepository.save(batch);
                    createdBatches.add(savedBatch);

                    batch = new Batch();
                    batch.setOriginWarehouse(originWarehouse);
                    batch.setDestinationWarehouse(destinationWarehouse);
                    batch.setArea(area);
                    batch.setStatus(BatchStatus.CREATED);
                    batch.setCurrentWeightKg(0.0);
                    batch.setCurrentVolumeM3(0.0);
                    batch.setCreatedAt(LocalDateTime.now());

                    currentWeight = 0.0;
                    currentVolume = 0.0;
                    batchOrderIndex = 0;
                }

                order.setBatch(batch);
                order.setBatchOrderIndex(batchOrderIndex++);

                currentWeight += order.getWeightKg();
                currentVolume += orderVolumeM3;
                batch.setCurrentWeightKg(currentWeight);
                batch.setCurrentVolumeM3(currentVolume);
            }

            // Persist the last in-progress batch
            Batch savedBatch = batchRepository.save(batch);
            createdBatches.add(savedBatch);
        }

        // Save order-to-batch assignments
        deliveryOrderRepository.saveAll(candidates);
        return createdBatches;
    }

    private double volumeM3(double lengthCm, double breadthCm, double heightCm) {
        // Convert cm^3 to m^3: 1 m = 100 cm => 1 m^3 = 1_000_000 cm^3
        return (lengthCm * breadthCm * heightCm) / 1_000_000.0;
    }
}

