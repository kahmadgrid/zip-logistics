package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.dto.BookingDtos;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

import static com.logistics.smartlogistics.enums.DeliveryType.*;

@Service
public class PricingEngineService {

    public BigDecimal estimatePrice(BookingDtos.BookingRequest request) {
        // Phase 1 placeholder: dynamic pricing logic to be implemented in Phase 2.
        BigDecimal base = switch (request.getDeliveryType()) {
            case EXPRESS -> BigDecimal.valueOf(200);
            case WAREHOUSE -> BigDecimal.valueOf(120);
            case CUSTOMIZED -> BigDecimal.valueOf(180);
        };
        if (request.getPriority()) {
            base = base.multiply(BigDecimal.valueOf(1.25));
        }
        return base;
    }
}
