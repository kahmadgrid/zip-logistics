package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.BookingDtos;
import com.logistics.smartlogistics.entity.DeliveryOrder;
import com.logistics.smartlogistics.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingDtos.BookingResponse create(Authentication authentication,
                                              @Valid @RequestBody BookingDtos.BookingRequest request) {
        return bookingService.createBooking(authentication.getName(), request);
    }

    @GetMapping("/my")
    public List<DeliveryOrder> myBookings(Authentication authentication) {
        return bookingService.userOrders(authentication.getName());
    }
}
