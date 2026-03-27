package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.dto.*;
import com.logistics.smartlogistics.service.EstimateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estimate")
@RequiredArgsConstructor
public class EstimateController {

    private final EstimateService estimateService;

    @PostMapping
    public PriceEstimateResponse getEstimate(@RequestBody PriceEstimateRequest request) {
        return estimateService.getEstimate(request);
    }
}