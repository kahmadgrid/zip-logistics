package com.logistics.smartlogistics.Strategy;

import com.logistics.smartlogistics.entity.RouteDetails;

public interface PricingStrategy {
    double calculatePrice(RouteDetails route);
}
