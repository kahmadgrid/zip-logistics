package com.logistics.smartlogistics.enums;

public enum VehicleType {

    BIKE(5, 30, 30, 30),
    SCOOTER(20, 50, 50, 50),
    MINI_TRUCK(100, 150, 120, 120),
    TRUCK(1000, 500, 250, 250);

    private final double maxWeight;
    private final double maxLength;
    private final double maxWidth;
    private final double maxHeight;

    VehicleType(double w, double l, double wi, double h) {
        this.maxWeight = w;
        this.maxLength = l;
        this.maxWidth = wi;
        this.maxHeight = h;
    }

    public boolean canCarry(double weight, double length, double width, double height) {
        return weight <= maxWeight
                && length <= maxLength
                && width <= maxWidth
                && height <= maxHeight;
    }
}