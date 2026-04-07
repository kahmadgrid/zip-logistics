package com.logistics.smartlogistics.utils;
import com.logistics.smartlogistics.enums.VehicleType;
public class VehicleUtil {
    public static VehicleType suggestVehicle(
            double weight,
            double length,
            double width,
            double height
    ) {
        for (VehicleType vehicle : VehicleType.values()) {
            if (vehicle.canCarry(weight, length, width, height)) {
                return vehicle; // ✅ first match = smallest suitable vehicle
            }
        }
        //Earlier, a RuntimeException returned a 500 error which the frontend misinterpreted as an auth failure, triggering logout;
        // now it returns a 400 error, so the frontend correctly treats it as a validation error and does not log out.
        throw new IllegalArgumentException("Package too large for available vehicles");
    }
}
